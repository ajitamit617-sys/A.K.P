import React, { useState, useEffect, useRef } from 'react';
import { NoteName, ChordProgressionPreset } from '../types/music';
import {
  CHORD_PROGRESSIONS,
  CIRCLE_OF_FIFTHS,
  getPitchClass,
  getNoteFromPitch,
} from '../utils/musicTheory';
import { soundEngine } from '../utils/audioEngine';
import { Play, Square, Plus, Trash2, Sliders, Music2, Sparkles, Repeat } from 'lucide-react';

interface ChordProgressionBuilderProps {
  currentKey: NoteName;
  onPreviewChordNotes?: (notes: { note: NoteName; interval: string; semitones: number }[]) => void;
}

interface ProgressionItem {
  id: string;
  chordName: string;
  roman: string;
  root: NoteName;
  type: string; // 'maj' | 'm' | 'dim' | '7' | 'maj7' | 'm7'
}

export const ChordProgressionBuilder: React.FC<ChordProgressionBuilderProps> = ({
  currentKey,
}) => {
  const activeCircleKey = CIRCLE_OF_FIFTHS.find((k) => k.name === currentKey) || CIRCLE_OF_FIFTHS[0];

  // Helper to generate chords from Roman numeral relative to current key
  const buildPresetChords = (preset: ChordProgressionPreset): ProgressionItem[] => {
    const rootPitch = getPitchClass(currentKey);
    return preset.romanNumerals.map((roman, idx) => {
      const semitoneOffset = parseInt(preset.formula[idx] || '0', 10);
      const chordRoot = getNoteFromPitch(rootPitch + semitoneOffset);

      let chordName = `${chordRoot}`;
      if (roman.includes('m7b5') || roman.includes('ø')) chordName = `${chordRoot}m7b5`;
      else if (roman.includes('maj7')) chordName = `${chordRoot}maj7`;
      else if (roman.includes('m7') || roman.includes('ii') || roman.includes('vi')) chordName = `${chordRoot}m7`;
      else if (roman.includes('7')) chordName = `${chordRoot}7`;
      else if (roman === roman.toLowerCase()) chordName = `${chordRoot}m`;

      return {
        id: `prog-${Date.now()}-${idx}-${Math.random()}`,
        chordName,
        roman,
        root: chordRoot,
        type: 'chord',
      };
    });
  };

  const [progression, setProgression] = useState<ProgressionItem[]>(() =>
    buildPresetChords(CHORD_PROGRESSIONS[0])
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [tempoBpm, setTempoBpm] = useState(90);
  const [isLooping, setIsLooping] = useState(true);

  const playbackTimerRef = useRef<number | null>(null);
  const stepIndexRef = useRef(0);

  // Play chord sound for an item
  const playProgressionChord = (item: ProgressionItem) => {
    const rootPitch = getPitchClass(item.root);
    const m1 = 48 + rootPitch; // C3 octave range

    let midis = [m1, m1 + 4, m1 + 7]; // default major

    if (item.chordName.includes('m7b5')) {
      midis = [m1, m1 + 3, m1 + 6, m1 + 10];
    } else if (item.chordName.includes('maj7')) {
      midis = [m1, m1 + 4, m1 + 7, m1 + 11];
    } else if (item.chordName.includes('m7')) {
      midis = [m1, m1 + 3, m1 + 7, m1 + 10];
    } else if (item.chordName.includes('7')) {
      midis = [m1, m1 + 4, m1 + 7, m1 + 10];
    } else if (item.chordName.includes('m')) {
      midis = [m1, m1 + 3, m1 + 7];
    } else if (item.chordName.includes('dim')) {
      midis = [m1, m1 + 3, m1 + 6];
    }

    soundEngine.playChord(midis, true, 1.8);
  };

  // Playback Loop
  const stopPlayback = () => {
    if (playbackTimerRef.current) {
      clearInterval(playbackTimerRef.current);
      playbackTimerRef.current = null;
    }
    setIsPlaying(false);
    setActiveStep(null);
  };

  const startPlayback = () => {
    if (progression.length === 0) return;
    stopPlayback();
    setIsPlaying(true);

    stepIndexRef.current = 0;
    const intervalMs = (60 / tempoBpm) * 2 * 1000; // 2 beats per chord

    const tick = () => {
      const curIdx = stepIndexRef.current;
      setActiveStep(curIdx);
      playProgressionChord(progression[curIdx]);

      stepIndexRef.current += 1;
      if (stepIndexRef.current >= progression.length) {
        if (isLooping) {
          stepIndexRef.current = 0;
        } else {
          stopPlayback();
        }
      }
    };

    tick();
    playbackTimerRef.current = window.setInterval(tick, intervalMs);
  };

  useEffect(() => {
    return () => {
      stopPlayback();
    };
  }, []);

  const handlePresetSelect = (preset: ChordProgressionPreset) => {
    stopPlayback();
    setProgression(buildPresetChords(preset));
  };

  const handleAddDiatonicChord = (chord: { roman: string; name: string }) => {
    const rootName = chord.name.replace('m', '').replace('dim', '') as NoteName;
    setProgression((prev) => [
      ...prev,
      {
        id: `prog-${Date.now()}-${Math.random()}`,
        chordName: chord.name,
        roman: chord.roman,
        root: rootName,
        type: 'chord',
      },
    ]);
  };

  const handleRemoveChord = (id: string) => {
    setProgression((prev) => prev.filter((p) => p.id !== id));
  };

  const handleClear = () => {
    stopPlayback();
    setProgression([]);
  };

  return (
    <div className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 shadow-xl backdrop-blur-md">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Music2 className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold text-white">Harmonic Progression Arranger</h3>
          </div>
          <p className="text-xs text-slate-400">
            Build and hear voice-led harmonic progressions in the key of{' '}
            <span className="text-amber-400 font-bold">{currentKey} Major</span>.
          </p>
        </div>

        {/* Transport Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-300 font-mono">{tempoBpm} BPM</span>
            <input
              type="range"
              min="50"
              max="160"
              value={tempoBpm}
              onChange={(e) => setTempoBpm(parseInt(e.target.value, 10))}
              className="w-20 accent-amber-500 cursor-pointer"
            />
          </div>

          <button
            onClick={() => setIsLooping(!isLooping)}
            className={`p-2 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
              isLooping
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title="Toggle Loop"
          >
            <Repeat className="w-4 h-4" />
          </button>

          {isPlaying ? (
            <button
              onClick={stopPlayback}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all active:scale-95"
            >
              <Square className="w-4 h-4 fill-white" />
              Stop
            </button>
          ) : (
            <button
              onClick={startPlayback}
              disabled={progression.length === 0}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-40 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-2 shadow-lg shadow-emerald-500/30 transition-all active:scale-95"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              Play Progression
            </button>
          )}

          <button
            onClick={handleClear}
            className="p-2 text-slate-400 hover:text-rose-400 border border-slate-800 rounded-lg text-xs"
            title="Clear Progression"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preset Pickers */}
      <div className="mb-6">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Famous Progression Presets:
        </div>
        <div className="flex flex-wrap gap-2">
          {CHORD_PROGRESSIONS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handlePresetSelect(preset)}
              className="px-3 py-1.5 text-xs bg-slate-950/70 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg text-slate-300 transition-all text-left"
            >
              <span className="font-semibold text-white">{preset.name}</span>
              <span className="ml-1.5 text-[10px] text-amber-400/80 font-mono">
                ({preset.romanNumerals.join(' - ')})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Chord Blocks */}
      <div className="mb-6">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Progression Sequence:
        </div>
        {progression.length === 0 ? (
          <div className="p-8 border-2 border-dashed border-slate-800 rounded-xl text-center text-sm text-slate-500">
            No chords in progression. Choose a preset above or click diatonic chords below to add!
          </div>
        ) : (
          <div className="flex flex-wrap gap-3 p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 min-h-[90px] items-center">
            {progression.map((item, idx) => {
              const isActive = activeStep === idx;

              return (
                <div
                  key={item.id}
                  className={`group relative flex flex-col justify-between p-3.5 rounded-xl border min-w-[90px] transition-all duration-150 ${
                    isActive
                      ? 'bg-gradient-to-b from-amber-500/30 to-amber-950/50 border-amber-400 ring-2 ring-amber-400/80 shadow-[0_0_18px_rgba(251,191,36,0.5)] scale-105'
                      : 'bg-slate-900 border-slate-700/80 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-amber-400 font-mono font-bold mb-1">
                    <span>{item.roman}</span>
                    <button
                      onClick={() => handleRemoveChord(item.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-400 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                  <button
                    onClick={() => playProgressionChord(item)}
                    className="text-base font-bold text-white text-left hover:text-amber-300 transition-colors"
                  >
                    {item.chordName}
                  </button>
                  <div className="text-[10px] text-slate-400 mt-1 font-mono">
                    Bar {idx + 1}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Add Diatonic Palette */}
      <div>
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Add Diatonic Chords in {currentKey}:
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {activeCircleKey.diatonicChords.map((chord) => (
            <button
              key={`add-${chord.roman}`}
              onClick={() => handleAddDiatonicChord(chord)}
              className="p-2.5 bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-600 rounded-lg flex items-center justify-between text-left group transition-all"
            >
              <div>
                <div className="text-[10px] font-mono text-amber-400/90">{chord.roman}</div>
                <div className="text-xs font-bold text-white">{chord.name}</div>
              </div>
              <Plus className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
