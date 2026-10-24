import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json({ limit: '10mb' }));

// Server-side Gemini initialization with recommended User-Agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper for multi-model retry
async function generateWithFallback(
  models: string[],
  callFn: (model: string) => Promise<any>
) {
  let lastError: any = null;
  for (const model of models) {
    try {
      const res = await callFn(model);
      return { result: res, usedModel: model };
    } catch (err: any) {
      console.warn(`Model ${model} failed, trying next:`, err.message || err);
      lastError = err;
    }
  }
  throw lastError;
}

// 1. Multi-turn Chat API with role system instructions and resilient model routing
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, model = 'gemini-3.8-flash', systemInstruction } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const validModels = ['gemini-4-argon', 'gemini-3.8-flash', 'gemini-3.1-flash-lite'];
    const chosenModel = validModels.includes(model) ? model : 'gemini-3.8-flash';
    // Fallback order
    const fallbackList = [chosenModel, 'gemini-3.8-flash', 'gemini-3.1-flash-lite'].filter(
      (m, idx, arr) => arr.indexOf(m) === idx
    );

    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const systemPrompt =
      systemInstruction ||
      `You are an expert music theory professor, jazz composer, and master instrumentalist. 
You provide deeply insightful, encouraging, and accurate music theory advice. 
When explaining chords, scales, or chord progressions, highlight the root note, exact chord formula (e.g., 1 - b3 - 5 - b7), intervals, voice-leading principles, emotional color/vibe, and famous song examples.
Whenever you suggest a specific scale, chord, or chord progression, include clear notation so the user can visualize it. Keep explanations clear, engaging, and structured with markdown bullets and bold chords.`;

    try {
      const { result, usedModel } = await generateWithFallback(
        fallbackList,
        (targetModel) =>
          ai.models.generateContent({
            model: targetModel,
            contents,
            config: {
              systemInstruction: systemPrompt,
            },
          })
      );

      const replyText = result.text || 'No response generated.';
      return res.json({ reply: replyText, model: usedModel });
    } catch (apiErr: any) {
      // In case of regional 503 demand spikes, provide an intelligent music-theory response
      const lastUserMsg = messages[messages.length - 1]?.content || '';
      const fallbackReply = generateMusicTheoryFallback(lastUserMsg);
      return res.json({
        reply: fallbackReply,
        model: `${chosenModel} (offline theory engine)`,
      });
    }
  } catch (err: any) {
    console.error('Chat API Error:', err);
    return res.status(500).json({
      error: err.message || 'Failed to process chat message with Gemini.',
    });
  }
});

// 2. High-Quality Image Generation API with model gemini-3-pro-image-preview and 1K/2K/4K affordance
app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt, size = '1K', aspectRatio = '1:1', style = 'modern' } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const validSizes = ['1K', '2K', '4K'];
    const selectedSize = validSizes.includes(size) ? size : '1K';

    const validAspectRatios = ['1:1', '3:4', '4:3', '9:16', '16:9'];
    const selectedAspect = validAspectRatios.includes(aspectRatio) ? aspectRatio : '1:1';

    let enhancedPrompt = prompt;
    if (style === 'vintage') {
      enhancedPrompt = `A high-resolution vintage musical manuscript and harmonic diagram poster: ${prompt}. Antique aged parchment texture, elegant calligraphy notes, engraved woodcut style, classical music aesthetics, intricate harmonic circles and notation, museum grade quality.`;
    } else if (style === 'cyberpunk') {
      enhancedPrompt = `A futuristic high-tech holographic neon music theory synthesizer poster: ${prompt}. Glowing cyan, purple, and gold neon fretboards, illuminated piano keys, vector waveforms, cyber audio aesthetic, dark sleek obsidian backdrop, 8k render.`;
    } else if (style === 'minimal') {
      enhancedPrompt = `A clean, Swiss-design minimalist modern music theory study cheat sheet and poster: ${prompt}. Crisp typography, high contrast, elegant color-coded scale degrees, pristine geometric layout, Bauhaus aesthetic, ultra clean.`;
    } else {
      enhancedPrompt = `A professional music theory visual guide and reference art poster: ${prompt}. Clear musical stave notation, beautiful color-coded harmonic wheel, piano keyboard and guitar fretboard diagrams, studio aesthetic, high fidelity, 4k ultra detailed.`;
    }

    // Try gemini-3-pro-image-preview per requirement, falling back to gemini-nano-banana-2.1 or gemini-3.1-flash-lite-image
    const imageModels = ['gemini-3-pro-image-preview', 'gemini-nano-banana-2.1', 'gemini-3.1-flash-lite-image'];

    let imageUrl = '';
    let descriptionText = '';

    for (const m of imageModels) {
      try {
        const config: any = {
          imageConfig: {
            aspectRatio: selectedAspect,
          },
        };
        // imageSize is supported on pro and nano-banana
        if (m !== 'gemini-3.1-flash-lite-image') {
          config.imageConfig.imageSize = selectedSize;
        }

        const response = await ai.models.generateContent({
          model: m,
          contents: {
            parts: [{ text: enhancedPrompt }],
          },
          config,
        });

        const candidates = response.candidates;
        if (candidates && candidates[0]?.content?.parts) {
          for (const part of candidates[0].content.parts) {
            if (part.inlineData) {
              imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
              break;
            } else if (part.text) {
              descriptionText += part.text;
            }
          }
        }
        if (imageUrl) break;
      } catch (e: any) {
        console.warn(`Image model ${m} failed:`, e.message);
      }
    }

    if (!imageUrl) {
      return res.status(503).json({
        error:
          'The AI image generation service is currently experiencing peak demand. Please try again in a few moments.',
      });
    }

    return res.json({
      imageUrl,
      prompt: enhancedPrompt,
      size: selectedSize,
      aspectRatio: selectedAspect,
      description: descriptionText,
    });
  } catch (err: any) {
    console.error('Image Generation Error:', err);
    return res.status(500).json({
      error: err.message || 'Failed to generate music theory visual image.',
    });
  }
});

// 3. Natural Language Music Theory Query Parser with structured extraction & heuristic fallback
app.post('/api/parse-query', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Try Gemini first
    try {
      const prompt = `Analyze this music theory request: "${query}".
Return a JSON object with:
- "root": standard musical root note name, e.g. "C", "F#", "Bb", "Ab", "D"
- "type": "chord" or "scale" or "progression"
- "name": full standard name, e.g. "Dorian b2", "Major 7th #11", "Hendrix Chord (7#9)", "ii - V - I in Bb"
- "intervals": array of interval strings from root, e.g. ["1", "b3", "5", "b7"] or ["1", "3", "5", "b7", "#9"]
- "description": concise 1-2 sentence music theory summary of its character, history, and emotional color
- "mood": 2-4 keywords, e.g. ["mysterious", "dark", "jazz", "spanish"]
- "formula": whole/half step pattern or interval formula
- "chords": if progression, array of chord names, e.g. ["Cm7", "F7", "Bbmaj7"]
- "suggestedKey": tonic key for circle of fifths e.g. "C" or "F#"

Only respond with valid JSON. No markdown backticks.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      if (parsed.root) {
        return res.json(parsed);
      }
    } catch (apiErr) {
      console.warn('Gemini query parse had issue, using local heuristic:', apiErr);
    }

    // Heuristic music theory parser fallback
    const fallback = parseTheoryQueryHeuristic(query);
    return res.json(fallback);
  } catch (err: any) {
    console.error('Parse query error:', err);
    return res.status(500).json({ error: 'Could not parse query' });
  }
});

// Local heuristic theory parser
function parseTheoryQueryHeuristic(query: string) {
  const q = query.toLowerCase();

  // Detect root note
  let root = 'C';
  const rootMatch = query.match(/\b([A-G][#b]?)\b/i);
  if (rootMatch) {
    root = rootMatch[1].toUpperCase();
    if (root.length === 2) {
      root = root[0] + (root[1] === '#' ? '#' : 'b');
    }
  }

  // Detect chord vs scale
  let type: 'chord' | 'scale' | 'progression' = 'scale';
  let name = 'Major (Ionian)';

  if (q.includes('chord') || q.includes('7') || q.includes('maj') || q.includes('dim') || q.includes('aug') || q.includes('sus') || q.includes('hendrix')) {
    type = 'chord';
    if (q.includes('hendrix') || q.includes('7#9')) {
      name = '7#9 (The Hendrix Chord)';
    } else if (q.includes('maj7') || q.includes('major 7')) {
      name = 'Major 7th';
    } else if (q.includes('m7b5') || q.includes('half')) {
      name = 'Half-Diminished 7th';
    } else if (q.includes('m7') || q.includes('minor 7')) {
      name = 'Minor 7th';
    } else if (q.includes('maj9') || q.includes('9')) {
      name = 'Major 9th';
    } else if (q.includes('dim')) {
      name = 'Diminished Triad';
    } else if (q.includes('mu')) {
      name = 'Mu Major (Steely Dan Chord)';
    } else {
      name = 'Dominant 7th';
    }
  } else if (q.includes('ii-v-i') || q.includes('progression') || q.includes('blues') || q.includes('cadence')) {
    type = 'progression';
    name = 'Jazz ii - V - I (Major)';
  } else {
    type = 'scale';
    if (q.includes('dorian b2')) name = 'Dorian b2';
    else if (q.includes('dorian')) name = 'Dorian Mode';
    else if (q.includes('phrygian dominant')) name = 'Phrygian Dominant (Spanish Gypsy)';
    else if (q.includes('phrygian')) name = 'Phrygian Mode';
    else if (q.includes('lydian dominant')) name = 'Lydian Dominant (Lydian b7)';
    else if (q.includes('lydian')) name = 'Lydian Mode';
    else if (q.includes('mixolydian')) name = 'Mixolydian Mode';
    else if (q.includes('altered') || q.includes('super locrian')) name = 'Altered Scale (Super Locrian)';
    else if (q.includes('harmonic minor')) name = 'Harmonic Minor';
    else if (q.includes('melodic minor')) name = 'Melodic Minor (Jazz Minor)';
    else if (q.includes('hirajoshi')) name = 'Hirajoshi (Japanese Pentatonic)';
    else if (q.includes('blues')) name = 'Blues Scale (Hexatonic)';
    else if (q.includes('pentatonic')) name = 'Minor Pentatonic';
  }

  return {
    root,
    type,
    name,
    description: `Parsed musical ${type}: ${root} ${name}.`,
    mood: ['expressive', 'harmonic', 'structured'],
  };
}

// Fallback response for music theory queries
function generateMusicTheoryFallback(userMsg: string): string {
  const q = userMsg.toLowerCase();
  if (q.includes('tritone') || q.includes('substitution')) {
    return `### 🎷 Tritone Substitution Breakdown

A **Tritone Substitution** replaces a Dominant 7th chord with another Dominant 7th chord whose root is exactly a **tritone (3 whole steps / 6 semitones)** away.

#### Why it works:
- Dominant chords derive their resolving tension from the **tritone interval between their 3rd and b7th**.
- For example, in **G7** ($G - B - D - F$):
  - 3rd is **B**
  - b7th is **F**
- In **Db7** ($Db - F - Ab - Cb$):
  - 3rd is **F**
  - b7th is **Cb** (enharmonically **B**)
- Both chords share the exact same critical tritone ($B \\leftrightarrow F$), allowing **Db7** to resolve smoothly into **Cmaj7** by chromatic half-step descent ($Db \\rightarrow C$)!`;
  }

  if (q.includes('hendrix') || q.includes('7#9')) {
    return `### 🎸 The 7#9 "Hendrix Chord"

The **7#9** chord (famous from Jimi Hendrix's *"Purple Haze"* and *"Foxy Lady"*) is a dominant 7th chord with an added augmented 9th.

- **Formula:** $1 - 3 - 5 - b7 - \\#9$
- In **E7#9**: $E - G\\sharp - B - D - G$
- **The Magic Paradox:** It contains both a **Major 3rd ($G\\sharp$)** and a **Minor 3rd ($G$, written as $\\#9$)** simultaneously, creating that signature gritty, blues-rock bite!`;
  }

  return `### 🎼 Music Theory Insight

In music theory, harmony is built on the relationship between intervals and the tonic center:
- **Major Family (Ionian, Lydian):** Bright, open, and consonant ($1 - 3 - 5$).
- **Minor Family (Dorian, Aeolian, Phrygian):** Melancholic and emotional ($1 - b3 - 5$).
- **Dominant Family (Mixolydian, Altered):** High tension with a tritone between 3 and b7 ($1 - 3 - 5 - b7$).

Check out the interactive **Piano**, **Fretboard**, and **Circle of Fifths** tabs above to visualize these exact note relationships!`;
}

// Vite or Static Production middleware
async function setupServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Harmonia Music Theory server running on http://0.0.0.0:${PORT}`);
  });
}

setupServer();
