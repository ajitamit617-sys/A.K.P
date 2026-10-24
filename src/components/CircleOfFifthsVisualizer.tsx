import React from 'react';
import { NoteName } from '../types/music';
import { CIRCLE_OF_FIFTHS, getPitchClass, getMidiNote } from '../utils/musicTheory';
import { soundEngine } from '../utils/audioEngine';
import { Compass, Music, Volume2, Sparkles } from 'lucide-react';

interface CircleOfFifthsVisualizerProps {
  selectedKey: NoteName;
  onSelectKey: (key: NoteName) => void;
}

export const CircleOfFifthsVisualizer: React.FC<CircleOfFifthsVisualizerProps> = ({
  selectedKey,
  onSelectKey,
}) => {
  // Find current active key index in the 12 keys
  const activeKeyIndex = CIRCLE_OF_FIFTHS.findIndex((k) => k.name === selectedKey);
  const activeKeyData = CIRCLE_OF_FIFTHS[activeKeyIndex >= 0 ? activeKeyIndex : 0];

  const handleKeyClick = (keyName: NoteName) => {
    onSelectKey(keyName);
    // Play root triad to audition tonic key
    const p = getPitchClass(keyName);
    const m1 = getMidiNote(keyName, 4);
    const m3 = m1 + 4;
    const m5 = m1 + 7;
    soundEngine.playChord([m1, m3, m5], true, 1.5);
  };

  // 12 slices, 30 deg each (360 / 12 = 30)
  // 12 o'clock is C (index 0)
  const radiusOuter = 160;
  const radiusInner = 105;
  const radiusCore = 58;
  const center = 190;

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center gap-8 p-6 bg-slate-900/80 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md">
      {/* SVG Interactive Wheel */}
      <div className="relative flex items-center justify-center">
        <svg
          width="380"
          height="380"
          viewBox="0 0 380 380"
          className="select-none filter drop-shadow-2xl"
        >
          <defs>
            <radialGradient id="wheelCenterGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </radialGradient>
            <linearGradient id="goldGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>

          {/* Outer Ring Segments: Major Keys */}
          {CIRCLE_OF_FIFTHS.map((k, idx) => {
            const angle = idx * 30 - 90; // 0 index at top (-90 deg)
            const radStart = ((angle - 15) * Math.PI) / 180;
            const radEnd = ((angle + 15) * Math.PI) / 180;
            const radMid = (angle * Math.PI) / 180;

            const isSelected = k.name === selectedKey;

            // Check if this chord belongs to diatonic family of selected key:
            // I (selected), IV (idx - 1), V (idx + 1)
            const diff = (idx - activeKeyIndex + 12) % 12;
            const isSubdominant = diff === 11; // -1 = IV
            const isDominant = diff === 1; // +1 = V

            const x1 = center + radiusOuter * Math.cos(radStart);
            const y1 = center + radiusOuter * Math.sin(radStart);
            const x2 = center + radiusOuter * Math.cos(radEnd);
            const y2 = center + radiusOuter * Math.sin(radEnd);
            const x3 = center + radiusInner * Math.cos(radEnd);
            const y3 = center + radiusInner * Math.sin(radEnd);
            const x4 = center + radiusInner * Math.cos(radStart);
            const y4 = center + radiusInner * Math.sin(radStart);

            const pathData = `M ${x1} ${y1} A ${radiusOuter} ${radiusOuter} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${radiusInner} ${radiusInner} 0 0 0 ${x4} ${y4} Z`;

            // Text positions
            const textX = center + (radiusInner + (radiusOuter - radiusInner) / 2) * Math.cos(radMid);
            const textY = center + (radiusInner + (radiusOuter - radiusInner) / 2) * Math.sin(radMid);

            let fillColor = 'fill-slate-800/80 hover:fill-slate-700';
            let strokeColor = 'stroke-slate-700/60';
            let textColor = 'fill-slate-200';

            if (isSelected) {
              fillColor = 'fill-emerald-600';
              strokeColor = 'stroke-emerald-300';
              textColor = 'fill-white font-extrabold';
            } else if (isDominant) {
              fillColor = 'fill-amber-600/70 hover:fill-amber-500';
              strokeColor = 'stroke-amber-400';
              textColor = 'fill-amber-100 font-bold';
            } else if (isSubdominant) {
              fillColor = 'fill-cyan-600/70 hover:fill-cyan-500';
              strokeColor = 'stroke-cyan-400';
              textColor = 'fill-cyan-100 font-bold';
            }

            return (
              <g
                key={`slice-major-${k.name}`}
                className="cursor-pointer transition-transform duration-100"
                onClick={() => handleKeyClick(k.name)}
              >
                <path
                  d={pathData}
                  className={`${fillColor} ${strokeColor} transition-colors duration-150`}
                  strokeWidth={isSelected ? '2.5' : '1'}
                />
                <text
                  x={textX}
                  y={textY + 5}
                  textAnchor="middle"
                  className={`${textColor} text-base font-semibold pointer-events-none`}
                >
                  {k.name}
                </text>
              </g>
            );
          })}

          {/* Inner Ring Segments: Relative Minor Keys */}
          {CIRCLE_OF_FIFTHS.map((k, idx) => {
            const angle = idx * 30 - 90;
            const radStart = ((angle - 15) * Math.PI) / 180;
            const radEnd = ((angle + 15) * Math.PI) / 180;
            const radMid = (angle * Math.PI) / 180;

            const isSelected = k.name === selectedKey;
            const diff = (idx - activeKeyIndex + 12) % 12;
            const isVi = diff === 0; // vi relative minor
            const isIi = diff === 11; // ii is under IV
            const isIii = diff === 1; // iii is under V

            const x1 = center + radiusInner * Math.cos(radStart);
            const y1 = center + radiusInner * Math.sin(radStart);
            const x2 = center + radiusInner * Math.cos(radEnd);
            const y2 = center + radiusInner * Math.sin(radEnd);
            const x3 = center + radiusCore * Math.cos(radEnd);
            const y3 = center + radiusCore * Math.sin(radEnd);
            const x4 = center + radiusCore * Math.cos(radStart);
            const y4 = center + radiusCore * Math.sin(radStart);

            const pathData = `M ${x1} ${y1} A ${radiusInner} ${radiusInner} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${radiusCore} ${radiusCore} 0 0 0 ${x4} ${y4} Z`;

            const textX = center + (radiusCore + (radiusInner - radiusCore) / 2) * Math.cos(radMid);
            const textY = center + (radiusCore + (radiusInner - radiusCore) / 2) * Math.sin(radMid);

            let fillColor = 'fill-slate-900 hover:fill-slate-800';
            let strokeColor = 'stroke-slate-800';
            let textColor = 'fill-slate-400';

            if (isVi) {
              fillColor = 'fill-purple-700/80';
              strokeColor = 'stroke-purple-400';
              textColor = 'fill-white font-bold';
            } else if (isIi) {
              fillColor = 'fill-teal-700/70';
              strokeColor = 'stroke-teal-400';
              textColor = 'fill-teal-100 font-bold';
            } else if (isIii) {
              fillColor = 'fill-indigo-700/70';
              strokeColor = 'stroke-indigo-400';
              textColor = 'fill-indigo-100 font-bold';
            }

            return (
              <g
                key={`slice-minor-${k.relativeMinor}`}
                className="cursor-pointer"
                onClick={() => handleKeyClick(k.name)}
              >
                <path
                  d={pathData}
                  className={`${fillColor} ${strokeColor} transition-colors duration-150`}
                  strokeWidth="1"
                />
                <text
                  x={textX}
                  y={textY + 4}
                  textAnchor="middle"
                  className={`${textColor} text-xs font-medium pointer-events-none`}
                >
                  {k.relativeMinor}m
                </text>
              </g>
            );
          })}

          {/* Central Hub */}
          <circle
            cx={center}
            cy={center}
            r={radiusCore}
            fill="url(#wheelCenterGrad)"
            stroke="#334155"
            strokeWidth="2"
          />
          <text
            x={center}
            y={center - 10}
            textAnchor="middle"
            className="fill-amber-400 text-sm font-bold tracking-wider"
          >
            KEY OF {selectedKey}
          </text>
          <text
            x={center}
            y={center + 12}
            textAnchor="middle"
            className="fill-slate-400 text-[10px] font-mono"
          >
            {activeKeyData.accidentalsStr}
          </text>
          <text
            x={center}
            y={center + 28}
            textAnchor="middle"
            className="fill-purple-400 text-[10px] font-mono"
          >
            Rel. {activeKeyData.relativeMinor} minor
          </text>
        </svg>
      </div>

      {/* Right Column: Diatonic Chord Family Breakdown */}
      <div className="flex-1 w-full max-w-md bg-slate-950/70 p-5 rounded-xl border border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Diatonic Harmony Matrix</h3>
          </div>
          <span className="text-xs px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-mono">
            {activeKeyData.accidentalsStr}
          </span>
        </div>

        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          The 7 diatonic chords in <strong>{selectedKey} Major</strong>, formed by stacking thirds from each scale degree:
        </p>

        {/* 7 Chords Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-4">
          {activeKeyData.diatonicChords.map((chord, idx) => {
            const roleLabels: Record<string, string> = {
              I: 'Tonic',
              ii: 'Supertonic',
              iii: 'Mediant',
              IV: 'Subdominant',
              V: 'Dominant',
              vi: 'Submediant',
              'vii°': 'Leading Tone',
            };

            const isTonic = chord.roman === 'I';
            const isSub = chord.roman === 'IV';
            const isDom = chord.roman === 'V';
            const isRelMin = chord.roman === 'vi';

            return (
              <button
                key={`diatonic-${chord.roman}`}
                onClick={() => {
                  const p = getPitchClass(chord.name.replace('m', '').replace('dim', ''));
                  const m1 = 60 + p;
                  const isMin = chord.name.includes('m') && !chord.name.includes('dim');
                  const isDim = chord.name.includes('dim');
                  const m3 = isMin || isDim ? m1 + 3 : m1 + 4;
                  const m5 = isDim ? m1 + 6 : m1 + 7;
                  soundEngine.playChord([m1, m3, m5], true, 1.2);
                }}
                className={`p-3 rounded-lg border text-left transition-all active:scale-95 group ${
                  isTonic
                    ? 'bg-emerald-950/40 border-emerald-500/50 hover:bg-emerald-900/50'
                    : isDom
                    ? 'bg-amber-950/40 border-amber-500/50 hover:bg-amber-900/50'
                    : isSub
                    ? 'bg-cyan-950/40 border-cyan-500/50 hover:bg-cyan-900/50'
                    : isRelMin
                    ? 'bg-purple-950/40 border-purple-500/50 hover:bg-purple-900/50'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono font-bold text-amber-400">
                    {chord.roman}
                  </span>
                  <Volume2 className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-colors" />
                </div>
                <div className="text-sm font-bold text-white mb-0.5">{chord.name}</div>
                <div className="text-[10px] text-slate-400 font-medium">
                  {roleLabels[chord.roman]}
                </div>
              </button>
            );
          })}
        </div>

        {/* Modal Interchange / Borrowed Chords Hint */}
        <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/80 text-[11px] text-slate-300">
          <div className="font-semibold text-purple-300 mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            Common Modal Interchange (Borrowed Chords):
          </div>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            <span className="px-2 py-0.5 bg-purple-950/60 border border-purple-800/50 rounded text-purple-200">
              iv (Minor IV: {selectedKey === 'C' ? 'Fm' : 'Minor Subdominant'})
            </span>
            <span className="px-2 py-0.5 bg-purple-950/60 border border-purple-800/50 rounded text-purple-200">
              bVII ({selectedKey === 'C' ? 'Bb' : 'Flat-Seven'})
            </span>
            <span className="px-2 py-0.5 bg-purple-950/60 border border-purple-800/50 rounded text-purple-200">
              bVI ({selectedKey === 'C' ? 'Ab' : 'Flat-Six'})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
