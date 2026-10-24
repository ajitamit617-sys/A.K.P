import React, { useState } from 'react';
import { NoteName, TuningDefinition } from '../types/music';
import {
  getPitchClass,
  getNoteFromPitch,
  getIntervalBadgeColor,
  getMidiNote,
} from '../utils/musicTheory';
import { soundEngine } from '../utils/audioEngine';
import { Layers, ShieldAlert, Sparkles, Filter } from 'lucide-react';

interface FretboardVisualizerProps {
  rootNote: NoteName;
  activeNotes: { note: NoteName; interval: string; semitones: number }[];
  tuning: TuningDefinition;
  displayMode: 'intervals' | 'notes';
  fretCount?: number;
  highlightFilter?: 'all' | 'roots-only' | 'chord-tones' | 'caged';
  cagedBox?: 'C' | 'A' | 'G' | 'E' | 'D' | null;
  onFretClick?: (note: NoteName, midi: number, stringIndex: number, fret: number) => void;
}

// Inlay markers standard for fretboards: 3, 5, 7, 9, 12(double), 15, 17, 19, 21, 24(double)
const SINGLE_DOT_FRETS = [3, 5, 7, 9, 15, 17, 19, 21];
const DOUBLE_DOT_FRETS = [12, 24];

export const FretboardVisualizer: React.FC<FretboardVisualizerProps> = ({
  rootNote,
  activeNotes,
  tuning,
  displayMode,
  fretCount = 15,
  highlightFilter = 'all',
  cagedBox = null,
  onFretClick,
}) => {
  const [hoveredFret, setHoveredFret] = useState<{ stringIdx: number; fret: number } | null>(null);

  // Active pitch map
  const activePitchMap = React.useMemo(() => {
    const map = new Map<number, { interval: string; isRoot: boolean }>();
    activeNotes.forEach((n) => {
      const p = getPitchClass(n.note);
      const isRoot = n.semitones === 0 || n.interval === '1' || n.note === rootNote;
      map.set(p, { interval: n.interval, isRoot });
    });
    return map;
  }, [activeNotes, rootNote]);

  const handleNoteAudition = (
    note: NoteName,
    midi: number,
    stringIndex: number,
    fret: number
  ) => {
    soundEngine.playNote(midi, 1.2);
    if (onFretClick) onFretClick(note, midi, stringIndex, fret);
  };

  // String thickness according to string index (from high E = 0 to low E = 5)
  const getStringThickness = (stringIdx: number, totalStrings: number) => {
    // Strings array is ordered highest pitch (top) to lowest pitch (bottom)
    const normalized = stringIdx / (totalStrings - 1 || 1);
    return 1 + normalized * 3.2; // 1px to 4.2px
  };

  return (
    <div className="w-full select-none">
      <div className="overflow-x-auto rounded-2xl bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 p-4 border border-stone-800 shadow-2xl">
        {/* Fretboard Wood Neck */}
        <div className="relative min-w-[850px] rounded-xl bg-gradient-to-r from-stone-950 via-amber-950/60 to-stone-950 border border-amber-900/40 p-4 shadow-inner">
          {/* Fret Numbers Header */}
          <div className="flex text-xs font-mono font-semibold text-stone-400 border-b border-stone-800 pb-2 mb-2">
            <div className="w-12 text-center text-amber-500/80">NUT</div>
            {Array.from({ length: fretCount }).map((_, fIdx) => {
              const fretNum = fIdx + 1;
              const isMarked = SINGLE_DOT_FRETS.includes(fretNum) || DOUBLE_DOT_FRETS.includes(fretNum);
              return (
                <div
                  key={`fret-label-${fretNum}`}
                  className={`flex-1 text-center ${
                    isMarked ? 'text-amber-400 font-bold' : 'text-stone-500'
                  }`}
                >
                  {fretNum}
                </div>
              );
            })}
          </div>

          {/* Strings and Frets Matrix */}
          <div className="relative flex flex-col gap-5 py-2">
            {tuning.stringNotes.map((openString, stringIdx) => {
              const openPitch = getPitchClass(openString.note);
              const openMidi = getMidiNote(openString.note, openString.octave);
              const wireThickness = getStringThickness(stringIdx, tuning.stringNotes.length);

              return (
                <div
                  key={`string-${stringIdx}`}
                  className="relative flex items-center h-8"
                >
                  {/* Metal String Wire background across entire width */}
                  <div
                    className="absolute left-12 right-0 bg-gradient-to-r from-stone-400 via-stone-300 to-stone-400 shadow-sm pointer-events-none z-0"
                    style={{ height: `${wireThickness}px` }}
                  />

                  {/* Open String / Nut Cell */}
                  <div className="w-12 flex justify-center z-10">
                    {(() => {
                      const activeInfo = activePitchMap.get(openPitch);
                      const isActive = !!activeInfo;
                      const badgeColor = activeInfo
                        ? getIntervalBadgeColor(activeInfo.interval, activeInfo.isRoot)
                        : null;

                      let shouldDisplay = isActive;
                      if (highlightFilter === 'roots-only' && !activeInfo?.isRoot) {
                        shouldDisplay = false;
                      }

                      return (
                        <button
                          onClick={() => handleNoteAudition(openString.note, openMidi, stringIdx, 0)}
                          className={`w-8 h-8 rounded-full flex flex-col items-center justify-center border transition-all duration-75 active:scale-90 ${
                            shouldDisplay && badgeColor
                              ? `${badgeColor.bg} ${badgeColor.text} ${badgeColor.border} ${badgeColor.glow} ring-2 ring-amber-400/50 scale-105`
                              : 'bg-stone-900 border-stone-700 text-stone-400 hover:border-stone-500'
                          }`}
                          title={`Open ${openString.note}${openString.octave}`}
                        >
                          <span className="text-[11px] font-bold leading-none">
                            {displayMode === 'intervals' && shouldDisplay && activeInfo
                              ? activeInfo.interval
                              : openString.note}
                          </span>
                        </button>
                      );
                    })()}
                  </div>

                  {/* Frets 1 to fretCount */}
                  {Array.from({ length: fretCount }).map((_, fIdx) => {
                    const fret = fIdx + 1;
                    const pitch = (openPitch + fret) % 12;
                    const noteName = getNoteFromPitch(pitch);
                    const midi = openMidi + fret;
                    const activeInfo = activePitchMap.get(pitch);
                    const isActive = !!activeInfo;

                    let shouldDisplay = isActive;
                    if (highlightFilter === 'roots-only' && !activeInfo?.isRoot) {
                      shouldDisplay = false;
                    } else if (
                      highlightFilter === 'chord-tones' &&
                      activeInfo &&
                      !['1', '3', 'b3', '5', 'b5', '#5', '7', 'b7', 'bb7'].includes(activeInfo.interval)
                    ) {
                      shouldDisplay = false;
                    }

                    const badgeColor = activeInfo
                      ? getIntervalBadgeColor(activeInfo.interval, activeInfo.isRoot)
                      : null;

                    const isHovered =
                      hoveredFret?.stringIdx === stringIdx && hoveredFret?.fret === fret;

                    return (
                      <div
                        key={`fret-${stringIdx}-${fret}`}
                        className="relative flex-1 flex justify-center items-center h-full border-r-2 border-stone-600/70"
                        onMouseEnter={() => setHoveredFret({ stringIdx, fret })}
                        onMouseLeave={() => setHoveredFret(null)}
                      >
                        {/* Fret wire shadow effect */}
                        <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-stone-300/40 shadow" />

                        {/* Interactive Note Marker */}
                        <button
                          onClick={() => handleNoteAudition(noteName, midi, stringIdx, fret)}
                          className={`relative z-10 transition-all duration-75 flex items-center justify-center rounded-full active:scale-90 ${
                            shouldDisplay && badgeColor
                              ? `w-7 h-7 ${badgeColor.bg} ${badgeColor.text} ${badgeColor.border} ${badgeColor.glow} ring-1 ring-white/40 scale-100`
                              : isHovered
                              ? 'w-6 h-6 bg-stone-800 text-stone-200 border border-stone-600 text-[10px]'
                              : 'w-2.5 h-2.5 rounded-full bg-stone-800/40 opacity-20 hover:opacity-80'
                          }`}
                          title={`${noteName} (Fret ${fret}, String ${stringIdx + 1})`}
                        >
                          {(shouldDisplay || isHovered) && (
                            <span className="text-[10px] font-bold leading-none">
                              {shouldDisplay && activeInfo && displayMode === 'intervals'
                                ? activeInfo.interval
                                : noteName}
                            </span>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Fret inlays (mother-of-pearl dots under strings) */}
          <div className="flex pt-2 text-stone-400 font-mono text-[10px] items-center border-t border-stone-800/60 mt-2">
            <div className="w-12 text-center text-stone-500">Inlays</div>
            {Array.from({ length: fretCount }).map((_, fIdx) => {
              const fretNum = fIdx + 1;
              const isSingle = SINGLE_DOT_FRETS.includes(fretNum);
              const isDouble = DOUBLE_DOT_FRETS.includes(fretNum);

              return (
                <div
                  key={`inlay-${fretNum}`}
                  className="flex-1 flex justify-center items-center"
                >
                  {isSingle && (
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-200/80 shadow-[0_0_6px_rgba(253,230,138,0.5)] border border-amber-300/50" />
                  )}
                  {isDouble && (
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-amber-200/90 shadow-[0_0_6px_rgba(253,230,138,0.5)]" />
                      <div className="w-2 h-2 rounded-full bg-amber-200/90 shadow-[0_0_6px_rgba(253,230,138,0.5)]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
