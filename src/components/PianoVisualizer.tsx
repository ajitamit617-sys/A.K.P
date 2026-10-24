import React from 'react';
import { NoteName } from '../types/music';
import {
  getPitchClass,
  getIntervalBadgeColor,
  getMidiNote,
} from '../utils/musicTheory';
import { soundEngine } from '../utils/audioEngine';
import { Volume2, Music, Sparkles } from 'lucide-react';

interface PianoVisualizerProps {
  rootNote: NoteName;
  activeNotes: { note: NoteName; interval: string; semitones: number }[];
  currentPlayingMidi?: number | null;
  displayMode: 'intervals' | 'notes' | 'solfege';
  octavesCount?: number;
  startOctave?: number;
  onNoteClick?: (note: NoteName, midi: number) => void;
}

const SOLFEGE_MAP: Record<string, string> = {
  '1': 'Do',
  'b2': 'Ra',
  '2': 'Re',
  'b3': 'Me',
  '3': 'Mi',
  '4': 'Fa',
  '#4': 'Fi',
  'b5': 'Se',
  '5': 'Sol',
  '#5': 'Si',
  'b6': 'Le',
  '6': 'La',
  'b7': 'Te',
  '7': 'Ti',
};

export const PianoVisualizer: React.FC<PianoVisualizerProps> = ({
  rootNote,
  activeNotes,
  currentPlayingMidi,
  displayMode,
  octavesCount = 3,
  startOctave = 3,
  onNoteClick,
}) => {
  // Map active note pitches to their interval and root status
  const activePitchMap = React.useMemo(() => {
    const map = new Map<number, { interval: string; isRoot: boolean }>();
    activeNotes.forEach((n) => {
      const p = getPitchClass(n.note);
      const isRoot = n.semitones === 0 || n.interval === '1' || n.note === rootNote;
      map.set(p, { interval: n.interval, isRoot });
    });
    return map;
  }, [activeNotes, rootNote]);

  // Keys per octave layout
  // C: white, C#: black, D: white, D#: black, E: white, F: white, F#: black, G: white, G#: black, A: white, A#: black, B: white
  const whiteKeyPitches: { note: NoteName; pitch: number }[] = [
    { note: 'C', pitch: 0 },
    { note: 'D', pitch: 2 },
    { note: 'E', pitch: 4 },
    { note: 'F', pitch: 5 },
    { note: 'G', pitch: 7 },
    { note: 'A', pitch: 9 },
    { note: 'B', pitch: 11 },
  ];

  const blackKeysConfig: {
    note: NoteName;
    pitch: number;
    leftPercent: number; // offset relative to octave
  }[] = [
    { note: 'C#', pitch: 1, leftPercent: 10.2 },
    { note: 'D#', pitch: 3, leftPercent: 24.5 },
    { note: 'F#', pitch: 6, leftPercent: 53.0 },
    { note: 'G#', pitch: 8, leftPercent: 67.3 },
    { note: 'A#', pitch: 10, leftPercent: 81.6 },
  ];

  const handleKeyClick = (note: NoteName, midi: number) => {
    soundEngine.playNote(midi, 1.2);
    if (onNoteClick) onNoteClick(note, midi);
  };

  const getLabelText = (interval: string, noteName: NoteName) => {
    if (displayMode === 'notes') return noteName;
    if (displayMode === 'solfege') return SOLFEGE_MAP[interval] || interval;
    return interval;
  };

  return (
    <div className="w-full select-none">
      <div className="relative overflow-x-auto pb-4 pt-1 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 p-4 border border-slate-800 shadow-2xl">
        {/* Subtle wood / red velvet fallboard rim */}
        <div className="h-3 w-full bg-gradient-to-r from-red-950 via-red-900 to-red-950 rounded-t-lg shadow-inner mb-0.5 border-b border-red-800/40" />

        {/* Keyboard Container */}
        <div className="relative flex justify-center min-w-[700px] h-56 px-2">
          {Array.from({ length: octavesCount }).map((_, octIdx) => {
            const octave = startOctave + octIdx;

            return (
              <div
                key={`octave-${octave}`}
                className="relative flex flex-1 h-full"
                style={{ width: `${100 / octavesCount}%` }}
              >
                {/* White Keys */}
                <div className="flex w-full h-full">
                  {whiteKeyPitches.map(({ note, pitch }) => {
                    const midi = getMidiNote(note, octave);
                    const activeInfo = activePitchMap.get(pitch);
                    const isActive = !!activeInfo;
                    const isPlaying = currentPlayingMidi === midi;
                    const badgeColor = activeInfo
                      ? getIntervalBadgeColor(activeInfo.interval, activeInfo.isRoot)
                      : null;

                    return (
                      <button
                        key={`white-${note}-${octave}`}
                        onClick={() => handleKeyClick(note, midi)}
                        className={`group relative flex-1 h-full rounded-b-md transition-all duration-75 border-x border-b border-slate-300/80 active:translate-y-1 ${
                          isPlaying
                            ? 'bg-amber-200 shadow-[0_0_20px_rgba(251,191,36,0.8)] z-10'
                            : isActive
                            ? 'bg-gradient-to-b from-slate-100 via-white to-slate-100 shadow-md'
                            : 'bg-gradient-to-b from-white via-slate-50 to-slate-200 hover:bg-slate-100'
                        }`}
                        title={`${note}${octave} (${activeInfo ? activeInfo.interval : 'inactive'})`}
                      >
                        {/* Note label & interval badge */}
                        <div className="absolute bottom-3 left-0 right-0 flex flex-col items-center pointer-events-none">
                          {isActive && badgeColor && (
                            <span
                              className={`mb-1 px-1.5 py-0.5 text-[11px] font-bold rounded-full border shadow-sm transition-transform group-hover:scale-110 ${badgeColor.bg} ${badgeColor.text} ${badgeColor.border} ${badgeColor.glow}`}
                            >
                              {getLabelText(activeInfo.interval, note)}
                            </span>
                          )}
                          <span
                            className={`text-[10px] tracking-tight font-medium ${
                              isActive ? 'text-slate-900 font-semibold' : 'text-slate-400'
                            }`}
                          >
                            {note}
                            <span className="text-[9px] opacity-70">{octave}</span>
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Black Keys */}
                {blackKeysConfig.map(({ note, pitch, leftPercent }) => {
                  const midi = getMidiNote(note, octave);
                  const activeInfo = activePitchMap.get(pitch);
                  const isActive = !!activeInfo;
                  const isPlaying = currentPlayingMidi === midi;
                  const badgeColor = activeInfo
                    ? getIntervalBadgeColor(activeInfo.interval, activeInfo.isRoot)
                    : null;

                  return (
                    <button
                      key={`black-${note}-${octave}`}
                      onClick={() => handleKeyClick(note, midi)}
                      style={{
                        left: `${leftPercent}%`,
                        width: '9.2%',
                        height: '60%',
                      }}
                      className={`group absolute top-0 z-20 rounded-b-md border border-slate-900 shadow-xl transition-all duration-75 active:scale-95 ${
                        isPlaying
                          ? 'bg-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.9)]'
                          : isActive
                          ? 'bg-gradient-to-b from-slate-800 via-slate-900 to-black ring-2 ring-emerald-400/80'
                          : 'bg-gradient-to-b from-slate-800 via-slate-950 to-black hover:from-slate-700'
                      }`}
                      title={`${note}${octave} (${activeInfo ? activeInfo.interval : 'inactive'})`}
                    >
                      {/* Black key top glossy reflection */}
                      <div className="w-full h-1/3 bg-gradient-to-b from-slate-600/40 to-transparent rounded-t-sm" />

                      {/* Active badge */}
                      <div className="absolute bottom-2 left-0 right-0 flex flex-col items-center pointer-events-none">
                        {isActive && badgeColor && (
                          <span
                            className={`mb-0.5 px-1 py-0.2 text-[10px] font-bold rounded-full border shadow-sm group-hover:scale-110 ${badgeColor.bg} ${badgeColor.text} ${badgeColor.border} ${badgeColor.glow}`}
                          >
                            {getLabelText(activeInfo.interval, note)}
                          </span>
                        )}
                        <span
                          className={`text-[9px] font-medium leading-none ${
                            isActive ? 'text-white font-semibold' : 'text-slate-400'
                          }`}
                        >
                          {note}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
