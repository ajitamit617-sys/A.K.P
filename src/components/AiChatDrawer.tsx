import React, { useState, useRef, useEffect } from 'react';
import { NoteName } from '../types/music';
import {
  MessageSquare,
  Send,
  Loader2,
  Sparkles,
  Bot,
  User,
  X,
  Zap,
  BookOpen,
  Music,
  Trash2,
  ChevronDown,
  Wand2,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedAction?: {
    type: 'scale' | 'chord';
    root: NoteName;
    name: string;
  };
}

interface AiChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTheoryTarget?: (type: 'scale' | 'chord', root: NoteName, name: string) => void;
}

const PERSONAS = [
  {
    id: 'jazz',
    name: 'Miles & Bill (Jazz Guru)',
    tagline: 'Modal jazz, altered dominants & substitutions',
    icon: '🎷',
    model: 'gemini-3.8-flash',
    systemInstruction: `You are Miles & Bill, a world-class jazz harmony mentor and modal improvisation virtuoso.
You speak with infectious passion for rich extended harmony (maj9, 13, 7#9, 7alt, m7b5), tritone substitutions, Coltrane changes, and voice leading.
Whenever you mention chords or scales, explain the exact harmonic tensions (e.g., b9, #9, #11, b13) and voice-leading paths. Keep advice practical, inspiring, and concise.`,
  },
  {
    id: 'classical',
    name: 'Dr. Julian Harmony (Classical)',
    tagline: 'Voice leading, counterpoint & formal analysis',
    icon: '🎹',
    model: 'gemini-4-argon',
    systemInstruction: `You are Dr. Julian Harmony, a distinguished professor of classical music theory, species counterpoint, and Schenkerian analysis.
You specialize in Roman numeral analysis, secondary dominants (V/V), Neapolitan 6ths, Augmented 6th chords (Italian, French, German), and strict voice-leading without parallel fifths or octaves.
Answer questions with academic depth, historical context, and clear harmonic diagrams.`,
  },
  {
    id: 'guitar',
    name: 'ShredMaster Leo (Fretboard)',
    tagline: 'CAGED shapes, 3NPS, arpeggios & modal runs',
    icon: '🎸',
    model: 'gemini-3.1-flash-lite',
    systemInstruction: `You are ShredMaster Leo, an expert guitar theory instructor.
You specialize in visualizing scales and arpeggios across the fretboard using the CAGED system, 3-Notes-Per-String (3NPS) modal boxes, and sweep picking triad inversions.
Give clear fret numbers, string-by-string advice, and actionable practice routines.`,
  },
  {
    id: 'pop',
    name: 'HitCraft (Songwriting Coach)',
    tagline: 'Emotional chord progressions, hook design & vibe',
    icon: '🎧',
    model: 'gemini-3.8-flash',
    systemInstruction: `You are HitCraft, a platinum pop and R&B producer/songwriter coach.
You focus on emotional impact, four-chord loops, borrowing modal interchange chords, tension-release dynamics, and writing catchy melodies over lush chords.
Explain concepts in accessible, modern language with real-world hit references.`,
  },
];

export const AiChatDrawer: React.FC<AiChatDrawerProps> = ({
  isOpen,
  onClose,
  onApplyTheoryTarget,
}) => {
  const [selectedPersona, setSelectedPersona] = useState(PERSONAS[0]);
  const [model, setModel] = useState<'gemini-4-argon' | 'gemini-3.8-flash' | 'gemini-3.1-flash-lite'>('gemini-3.8-flash');
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Welcome to Harmonia! I'm your AI Music Theory Mentor. Ask me anything about chord progressions, modal interchange, voice leading, or fretboard geometry!

**Try asking:**
- "How does a tritone substitution work in a ii-V-I?"
- "What scale should I play over a C7#9 Hendrix chord?"
- "Explain the difference between Dorian and Aeolian."
- "What are the secondary dominants in the key of G major?"`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    if (!textToSend) setInputMessage('');
    setIsLoading(true);

    try {
      const apiMessages = newHistory
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          model,
          systemInstruction: selectedPersona.systemInstruction,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Chat request failed');
      }

      // Check if response contains suggestions
      let suggestedAction: ChatMessage['suggestedAction'] = undefined;
      const lower = data.reply.toLowerCase();
      if (lower.includes('dorian')) suggestedAction = { type: 'scale', root: 'D', name: 'Dorian Mode' };
      else if (lower.includes('lydian')) suggestedAction = { type: 'scale', root: 'F', name: 'Lydian Mode' };
      else if (lower.includes('altered')) suggestedAction = { type: 'scale', root: 'G', name: 'Altered Scale (Super Locrian)' };
      else if (lower.includes('7#9')) suggestedAction = { type: 'chord', root: 'E', name: '7#9 (The Hendrix Chord)' };
      else if (lower.includes('maj9')) suggestedAction = { type: 'chord', root: 'C', name: 'Major 9th' };
      else if (lower.includes('m7b5')) suggestedAction = { type: 'chord', root: 'B', name: 'Half-Diminished 7th' };

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedAction,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ Error: ${err.message || 'Could not connect to Gemini AI.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: `Chat history cleared. How can I help with your music theory study today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/95 backdrop-blur flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-gradient-to-tr from-amber-500 to-amber-600 rounded-xl text-slate-950 font-bold shadow-md shadow-amber-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Gemini Music Theory Mentor</span>
            </h3>
            <p className="text-[11px] text-slate-400">Multi-turn AI Assistant</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleClearHistory}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Persona & Model Selection Bar */}
      <div className="p-3 bg-slate-950/70 border-b border-slate-800/80 flex flex-col gap-2">
        {/* Personas */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {PERSONAS.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setSelectedPersona(p);
                setModel(p.model as any);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs whitespace-nowrap flex items-center gap-1.5 transition-all ${
                selectedPersona.id === p.id
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 font-semibold'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700'
              }`}
            >
              <span>{p.icon}</span>
              <span>{p.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* Model Selector per requirement */}
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400 font-mono flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" />
            Model:
          </span>
          <div className="flex items-center gap-1 font-mono text-[10px]">
            {[
              { id: 'gemini-3.1-flash-lite', label: 'Flash-Lite (Fast)' },
              { id: 'gemini-3.8-flash', label: '3.8-Flash (Balanced)' },
              { id: 'gemini-4-argon', label: '4-Argon (Complex)' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setModel(m.id as any)}
                className={`px-2 py-0.5 rounded border transition-colors ${
                  model === m.id
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                    : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
                }`}
              >
                {m.label.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Scrollable Message Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-slate-800 text-amber-400 border border-slate-700'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : selectedPersona.icon}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none shadow'
                    : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none shadow-sm'
                }`}
              >
                {/* Formatted Text */}
                <div className="whitespace-pre-wrap">{m.content}</div>

                {/* Optional interactive badge: Load into visualizer */}
                {m.suggestedAction && onApplyTheoryTarget && (
                  <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[10px] text-amber-400 font-mono">
                      Target: {m.suggestedAction.root} {m.suggestedAction.name}
                    </span>
                    <button
                      onClick={() =>
                        onApplyTheoryTarget(
                          m.suggestedAction!.type,
                          m.suggestedAction!.root,
                          m.suggestedAction!.name
                        )
                      }
                      className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded border border-amber-500/40 text-[10px] font-bold flex items-center gap-1 transition-colors"
                    >
                      <Wand2 className="w-3 h-3" />
                      View in Visualizer
                    </button>
                  </div>
                )}

                <div
                  className={`text-[9px] mt-1.5 text-right font-mono ${
                    isUser ? 'text-slate-800/70' : 'text-slate-500'
                  }`}
                >
                  {m.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 items-center text-slate-400 text-xs py-2">
            <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-amber-400">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
            <span>{selectedPersona.name} is composing harmonic analysis...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Question Prompts */}
      <div className="px-3 py-2 bg-slate-950/60 border-t border-slate-800/60 flex items-center gap-1.5 overflow-x-auto text-[11px]">
        {[
          'Explain ii-V-I substitution',
          'What is Lydian Dominant?',
          'How does the Neapolitan 6th work?',
          'Altered scale fingering on guitar',
        ].map((q, idx) => (
          <button
            key={`quick-${idx}`}
            onClick={() => handleSendMessage(q)}
            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-full whitespace-nowrap transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Message Input Box */}
      <div className="p-3 bg-slate-900 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={`Ask ${selectedPersona.name.split(' ')[0]} music theory questions...`}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 placeholder-slate-500"
          />
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className="p-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 rounded-xl font-bold transition-transform active:scale-95 shadow-md shadow-amber-500/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
