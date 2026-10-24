import React, { useState } from 'react';
import { NoteName } from '../types/music';
import {
  Image as ImageIcon,
  Download,
  Loader2,
  Sparkles,
  Maximize2,
  X,
  Palette,
  Sliders,
  Check,
} from 'lucide-react';

interface AiImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRoot: NoteName;
  currentScaleOrChordName: string;
}

export const AiImageModal: React.FC<AiImageModalProps> = ({
  isOpen,
  onClose,
  currentRoot,
  currentScaleOrChordName,
}) => {
  const [prompt, setPrompt] = useState(
    `Music theory reference chart and artistic infographic for ${currentRoot} ${currentScaleOrChordName}, showing harmonic wheel, piano keyboard layout, guitar fretboard positions, and chord voicings.`
  );
  const [size, setSize] = useState<'1K' | '2K' | '4K'>('2K');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '4:3' | '3:4' | '9:16'>('16:9');
  const [style, setStyle] = useState<'modern' | 'vintage' | 'cyberpunk' | 'minimal'>('modern');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imageMeta, setImageMeta] = useState<{ size: string; prompt: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          size,
          aspectRatio,
          style,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate image');
      }

      setGeneratedImage(data.imageUrl);
      setImageMeta({ size: data.size || size, prompt: data.prompt });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error communicating with Gemini image generation API.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `harmonia-music-theory-${size}-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 sticky top-0 bg-slate-900/95 backdrop-blur z-20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>AI Music Theory Poster &amp; Infographic Generator</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  gemini-3-pro-image-preview
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Create high-resolution reference posters, vintage study charts, and harmonic visual art.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Controls Column */}
          <div className="md:col-span-5 flex flex-col gap-5">
            {/* Resolution Selector (Required: 1K, 2K, 4K) */}
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Image Resolution Size</span>
                <span className="text-[10px] text-amber-400 font-mono">High Quality</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['1K', '2K', '4K'] as const).map((s) => (
                  <button
                    key={`size-${s}`}
                    type="button"
                    onClick={() => setSize(s)}
                    className={`py-2 px-3 rounded-lg border text-xs font-mono font-bold flex flex-col items-center justify-center transition-all ${
                      size === s
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500 shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span>{s}</span>
                    <span className="text-[9px] opacity-70 font-normal">
                      {s === '1K' ? '1024px' : s === '2K' ? '2048px' : '4096px'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio Selector */}
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 block">
                Aspect Ratio
              </label>
              <div className="grid grid-cols-5 gap-1.5 text-xs">
                {(['16:9', '4:3', '1:1', '3:4', '9:16'] as const).map((ar) => (
                  <button
                    key={`ar-${ar}`}
                    type="button"
                    onClick={() => setAspectRatio(ar)}
                    className={`py-1.5 rounded-lg border text-center font-mono ${
                      aspectRatio === ar
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 font-bold'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {ar}
                  </button>
                ))}
              </div>
            </div>

            {/* Style Selector */}
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 block">
                Art Aesthetic Style
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'modern', name: 'Studio Infographic' },
                  { id: 'vintage', name: 'Vintage Manuscript' },
                  { id: 'cyberpunk', name: 'Neon Synthwave' },
                  { id: 'minimal', name: 'Swiss Minimalist' },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setStyle(st.id as any)}
                    className={`py-2 px-2.5 rounded-lg border text-left flex items-center justify-between ${
                      style === st.id
                        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500 font-semibold'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span>{st.name}</span>
                    {style === st.id && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt input */}
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 block">
                Visual Description Prompt
              </label>
              <textarea
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500 placeholder-slate-600 resize-none"
                placeholder="Describe the musical visualization poster..."
              />
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-slate-950 font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-[0.98]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating High-Res Image ({size})...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate {size} Poster
                </>
              )}
            </button>

            {error && (
              <div className="p-3 bg-rose-950/50 border border-rose-800/80 rounded-xl text-xs text-rose-300">
                {error}
              </div>
            )}
          </div>

          {/* Preview Column */}
          <div className="md:col-span-7 flex flex-col items-center justify-center bg-slate-950/60 rounded-xl border border-slate-800 min-h-[350px] p-4 relative overflow-hidden">
            {isGenerating ? (
              <div className="flex flex-col items-center gap-3 text-center p-8">
                <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
                <div className="text-sm font-semibold text-white">
                  Synthesizing {size} Music Theory Artwork...
                </div>
                <div className="text-xs text-slate-400 max-w-xs">
                  Calling gemini-3-pro-image-preview with high-resolution layout rendering.
                </div>
              </div>
            ) : generatedImage ? (
              <div className="flex flex-col items-center gap-3 w-full h-full">
                <div className="relative group rounded-xl overflow-hidden border border-slate-700 shadow-2xl max-h-[420px] w-full flex items-center justify-center bg-black">
                  <img
                    src={generatedImage}
                    alt="Generated Music Theory Poster"
                    className="max-h-[400px] w-auto object-contain rounded-lg"
                  />
                </div>
                <div className="flex items-center justify-between w-full pt-2">
                  <span className="text-xs font-mono text-emerald-400 font-semibold">
                    ✓ Rendered at {imageMeta?.size || size} Resolution
                  </span>
                  <button
                    onClick={handleDownload}
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download PNG
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 text-center text-slate-500 p-8">
                <ImageIcon className="w-12 h-12 stroke-[1.2]" />
                <div className="text-sm font-medium">No image generated yet</div>
                <div className="text-xs max-w-xs">
                  Choose your preferred resolution (1K, 2K, or 4K) and click "Generate Poster" to create an AI music infographic.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
