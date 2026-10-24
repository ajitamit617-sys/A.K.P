import React from 'react';
import { NoteName } from '../types/music';
import { getPitchClass, getMidiNote, getIntervalBadgeColor } from '../utils/musicTheory';
import { soundEngine } from '../utils/audioEngine';
import { Volume2 } from 'lucide-react';

interface StaffNotationVisualizerProps {
  rootNote: NoteName;
  notes: { note: NoteName; interval: string; semitones: number }[];
  clef?: 'treble' | 'bass' | 'grand';
}

// Map note name & standard octave to vertical stave steps
// In treble clef:
// Bottom line E4 = step 0
// F4 = step 1 (space)
// G4 = step 2 (line)
// A4 = step 3 (space)
// B4 = step 4 (line)
// C5 = step 5 (space)
// D5 = step 6 (line)
// E5 = step 7 (space)
// F5 = step 8 (line)
// Middle C (C4) = step -2 (ledger line below)
// D4 = step -1 (space below)
const NOTE_BASE_STEPS: Record<string, number> = {
  C: 0,
  D: 1,
  E: 2,
  F: 3,
  G: 4,
  A: 5,
  B: 6,
};

export const StaffNotationVisualizer: React.FC<StaffNotationVisualizerProps> = ({
  rootNote,
  notes,
}) => {
  // Line spacing in pixels
  const lineSpacing = 14;
  const staffTopY = 45; // top line (F5 in treble clef)
  // 5 lines at:
  // F5 = staffTopY
  // D5 = staffTopY + lineSpacing
  // B4 = staffTopY + lineSpacing * 2
  // G4 = staffTopY + lineSpacing * 3
  // E4 = staffTopY + lineSpacing * 4

  // Width calculation based on number of notes
  const startX = 85;
  const noteSpacing = Math.max(48, Math.min(75, 450 / Math.max(notes.length, 1)));
  const totalWidth = Math.max(520, startX + notes.length * noteSpacing + 50);

  // Calculate vertical coordinate for a note
  // In treble clef: E4 (step 2 in oct 4) is bottom line (staffTopY + 4 * lineSpacing)
  // Each step moves up by lineSpacing / 2
  const getNoteY = (noteName: NoteName, octave = 4) => {
    const letter = noteName.charAt(0);
    const stepInOctave = NOTE_BASE_STEPS[letter] || 0;
    // Total absolute diatonic step relative to C4 (C4 = 0, D4 = 1, ... B4 = 6, C5 = 7)
    const diatonicStep = (octave - 4) * 7 + stepInOctave;
    // C4 is step 0. Bottom line E4 is step 2.
    // E4 is at Y = staffTopY + 4 * lineSpacing = 45 + 56 = 101.
    const e4Y = staffTopY + 4 * lineSpacing;
    const y = e4Y - (diatonicStep - 2) * (lineSpacing / 2);
    return { y, diatonicStep };
  };

  return (
    <div className="w-full bg-slate-900/80 rounded-2xl p-5 border border-slate-800 shadow-xl overflow-x-auto">
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <span>Musical Notation (Standard Stave)</span>
        </h4>
        <span className="text-xs text-slate-400 font-mono">
          Click any note head to listen
        </span>
      </div>

      <div className="min-w-[540px] flex justify-center py-2">
        <svg
          width={totalWidth}
          height="160"
          className="select-none filter drop-shadow"
        >
          {/* 5 Staff Lines */}
          {[0, 1, 2, 3, 4].map((i) => {
            const y = staffTopY + i * lineSpacing;
            return (
              <line
                key={`line-${i}`}
                x1="20"
                y1={y}
                x2={totalWidth - 20}
                y2={y}
                stroke="#64748b"
                strokeWidth="1.5"
              />
            );
          })}

          {/* Bar lines at start and end */}
          <line
            x1="20"
            y1={staffTopY}
            x2="20"
            y2={staffTopY + 4 * lineSpacing}
            stroke="#94a3b8"
            strokeWidth="2.5"
          />
          <line
            x1={totalWidth - 24}
            y1={staffTopY}
            x2={totalWidth - 24}
            y2={staffTopY + 4 * lineSpacing}
            stroke="#94a3b8"
            strokeWidth="2"
          />
          <line
            x1={totalWidth - 20}
            y1={staffTopY}
            x2={totalWidth - 20}
            y2={staffTopY + 4 * lineSpacing}
            stroke="#94a3b8"
            strokeWidth="4"
          />

          {/* Treble Clef Graphic (Stylized SVG path) */}
          <g transform={`translate(32, ${staffTopY - 14}) scale(0.68)`}>
            <text
              x="0"
              y="90"
              fontSize="105"
              fill="#cbd5e1"
              fontFamily="serif"
              className="select-none pointer-events-none"
            >
              𝄞
            </text>
          </g>

          {/* Notes rendering */}
          {notes.map((n, idx) => {
            const isRoot = n.semitones === 0 || n.interval === '1' || n.note === rootNote;
            // Place octave intelligently so all notes sit nicely on staff
            // If note pitch < root pitch, put in octave 5 so it ascends naturally
            const rootPitch = getPitchClass(rootNote);
            const pitch = getPitchClass(n.note);
            const octave = n.semitones >= 12 ? 5 : pitch < rootPitch ? 5 : 4;

            const { y, diatonicStep } = getNoteY(n.note, octave);
            const x = startX + idx * noteSpacing;
            const midi = getMidiNote(n.note, octave);

            const hasAccidental = n.note.includes('#') || n.note.includes('b');
            const accidentalChar = n.note.includes('#') ? '♯' : '♭';

            // Ledger lines:
            // Middle C (diatonicStep = 0) needs 1 ledger line
            // A5 (diatonicStep = 8 or above) needs ledger line above
            const needsLedgerBelow = diatonicStep <= 0; // C4 or below
            const needsLedgerAbove = diatonicStep >= 8; // A5 or above

            const badge = getIntervalBadgeColor(n.interval, isRoot);

            return (
              <g
                key={`stave-note-${idx}-${n.note}`}
                className="cursor-pointer group"
                onClick={() => soundEngine.playNote(midi, 1.2)}
              >
                {/* Ledger line below if Middle C */}
                {needsLedgerBelow && (
                  <line
                    x1={x - 12}
                    y1={staffTopY + 5 * lineSpacing}
                    x2={x + 18}
                    y2={staffTopY + 5 * lineSpacing}
                    stroke="#94a3b8"
                    strokeWidth="1.5"
                  />
                )}

                {/* Ledger line above */}
                {needsLedgerAbove && (
                  <line
                    x1={x - 12}
                    y1={staffTopY - lineSpacing}
                    x2={x + 18}
                    y2={staffTopY - lineSpacing}
                    stroke="#94a3b8"
                    strokeWidth="1.5"
                  />
                )}

                {/* Accidental symbol */}
                {hasAccidental && (
                  <text
                    x={x - 14}
                    y={y + 6}
                    fontSize="18"
                    fill="#38bdf8"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {accidentalChar}
                  </text>
                )}

                {/* Note Head (Oval tilted) */}
                <ellipse
                  cx={x}
                  cy={y}
                  rx="7"
                  ry="5"
                  transform={`rotate(-22 ${x} ${y})`}
                  className={`${
                    isRoot
                      ? 'fill-emerald-400 stroke-emerald-300'
                      : 'fill-slate-100 stroke-slate-300 group-hover:fill-amber-300'
                  } transition-colors`}
                  strokeWidth="1.8"
                />

                {/* Stem (pointing up or down) */}
                <line
                  x1={diatonicStep < 5 ? x + 6 : x - 6}
                  y1={y}
                  x2={diatonicStep < 5 ? x + 6 : x - 6}
                  y2={diatonicStep < 5 ? y - 32 : y + 32}
                  stroke="#cbd5e1"
                  strokeWidth="1.8"
                />

                {/* Note Label below staff */}
                <text
                  x={x}
                  y={staffTopY + 4 * lineSpacing + 25}
                  textAnchor="middle"
                  className="fill-slate-200 text-xs font-bold"
                >
                  {n.note}
                </text>

                {/* Interval badge below note label */}
                <text
                  x={x}
                  y={staffTopY + 4 * lineSpacing + 40}
                  textAnchor="middle"
                  className={`${
                    isRoot ? 'fill-emerald-400 font-bold' : 'fill-slate-400'
                  } text-[10px] font-mono`}
                >
                  {n.interval}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
