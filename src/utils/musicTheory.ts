import {
  NoteName,
  ScaleDefinition,
  ChordDefinition,
  TuningDefinition,
  ChordProgressionPreset,
  CircleKey,
} from '../types/music';

export const CHROMATIC_SHARPS: NoteName[] = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
];

export const CHROMATIC_FLATS: NoteName[] = [
  'C',
  'Db',
  'D',
  'Eb',
  'E',
  'F',
  'Gb',
  'G',
  'Ab',
  'A',
  'Bb',
  'B',
];

export const ENHARMONIC_MAP: Record<string, number> = {
  C: 0,
  'B#': 0,
  'C#': 1,
  Db: 1,
  D: 2,
  'D#': 3,
  Eb: 3,
  E: 4,
  Fb: 4,
  F: 5,
  'E#': 5,
  'F#': 6,
  Gb: 6,
  G: 7,
  'G#': 8,
  Ab: 8,
  A: 9,
  'A#': 10,
  Bb: 10,
  B: 11,
  Cb: 11,
};

export const INTERVAL_NAMES: Record<number, { short: string; full: string; role: 'root' | 'third' | 'fifth' | 'seventh' | 'extension' | 'color' }> = {
  0: { short: '1', full: 'Perfect Unison', role: 'root' },
  1: { short: 'b2', full: 'Minor 2nd', role: 'color' },
  2: { short: '2', full: 'Major 2nd (9th)', role: 'extension' },
  3: { short: 'b3', full: 'Minor 3rd', role: 'third' },
  4: { short: '3', full: 'Major 3rd', role: 'third' },
  5: { short: '4', full: 'Perfect 4th (11th)', role: 'extension' },
  6: { short: 'b5', full: 'Diminished 5th / Tritone', role: 'fifth' },
  7: { short: '5', full: 'Perfect 5th', role: 'fifth' },
  8: { short: '#5/b6', full: 'Augmented 5th / b13', role: 'fifth' },
  9: { short: '6', full: 'Major 6th (13th)', role: 'extension' },
  10: { short: 'b7', full: 'Minor 7th', role: 'seventh' },
  11: { short: '7', full: 'Major 7th', role: 'seventh' },
  12: { short: '8', full: 'Octave', role: 'root' },
  13: { short: 'b9', full: 'Flat 9th', role: 'extension' },
  14: { short: '9', full: 'Ninth', role: 'extension' },
  15: { short: '#9', full: 'Sharp 9th (Hendrix)', role: 'extension' },
  17: { short: '11', full: 'Eleventh', role: 'extension' },
  18: { short: '#11', full: 'Sharp 11th (Lydian)', role: 'extension' },
  20: { short: 'b13', full: 'Flat 13th', role: 'extension' },
  21: { short: '13', full: 'Thirteenth', role: 'extension' },
};

export const SCALES: ScaleDefinition[] = [
  {
    id: 'major',
    name: 'Major (Ionian)',
    category: 'Major & Modes',
    intervals: [0, 2, 4, 5, 7, 9, 11],
    intervalNames: ['1', '2', '3', '4', '5', '6', '7'],
    description: 'The cornerstone diatonic scale of Western music theory. Bright, resolute, harmonious.',
    mood: 'Bright, joyful, foundational',
    formula: 'W - W - H - W - W - W - H',
  },
  {
    id: 'dorian',
    name: 'Dorian Mode',
    category: 'Major & Modes',
    intervals: [0, 2, 3, 5, 7, 9, 10],
    intervalNames: ['1', '2', 'b3', '4', '5', '6', 'b7'],
    description: '2nd mode of major. Minor scale with a characteristically hopeful, sweet Natural 6th (e.g. Miles Davis "So What", Pink Floyd).',
    mood: 'Soulful, groovy, bittersweet jazz',
    formula: 'W - H - W - W - W - H - W',
  },
  {
    id: 'phrygian',
    name: 'Phrygian Mode',
    category: 'Major & Modes',
    intervals: [0, 1, 3, 5, 7, 8, 10],
    intervalNames: ['1', 'b2', 'b3', '4', '5', 'b6', 'b7'],
    description: '3rd mode of major. Defined by its haunting, exotic minor 2nd step. Common in flamenco, metal, and Spanish classical music.',
    mood: 'Exotic, dark, mysterious, Spanish',
    formula: 'H - W - W - W - H - W - W',
  },
  {
    id: 'lydian',
    name: 'Lydian Mode',
    category: 'Major & Modes',
    intervals: [0, 2, 4, 6, 7, 9, 11],
    intervalNames: ['1', '2', '3', '#4', '5', '6', '7'],
    description: '4th mode of major. Features a distinctive raised #4 (#11). Known as the sound of wonder, dreamscapes, and cinematic sci-fi.',
    mood: 'Ethereal, mystical, floating, uplifting',
    formula: 'W - W - W - H - W - W - H',
  },
  {
    id: 'mixolydian',
    name: 'Mixolydian Mode',
    category: 'Major & Modes',
    intervals: [0, 2, 4, 5, 7, 9, 10],
    intervalNames: ['1', '2', '3', '4', '5', '6', 'b7'],
    description: '5th mode of major. Major triad with a bluesy b7. The foundation of classic rock, blues, and funk jams.',
    mood: 'Bluesy, heroic, earthy rock vibe',
    formula: 'W - W - H - W - W - H - W',
  },
  {
    id: 'minor',
    name: 'Natural Minor (Aeolian)',
    category: 'Major & Modes',
    intervals: [0, 2, 3, 5, 7, 8, 10],
    intervalNames: ['1', '2', 'b3', '4', '5', 'b6', 'b7'],
    description: '6th mode of major. The quintessential minor key scale. Somber, reflective, and emotional.',
    mood: 'Melancholic, epic, contemplative',
    formula: 'W - H - W - W - H - W - W',
  },
  {
    id: 'locrian',
    name: 'Locrian Mode',
    category: 'Major & Modes',
    intervals: [0, 1, 3, 5, 6, 8, 10],
    intervalNames: ['1', 'b2', 'b3', '4', 'b5', 'b6', 'b7'],
    description: '7th mode of major. The only mode with a diminished fifth (b5). Inherently unstable, tense, and unresolved.',
    mood: 'Tense, dissonant, apocalyptic',
    formula: 'H - W - W - H - W - W - W',
  },
  {
    id: 'harmonic-minor',
    name: 'Harmonic Minor',
    category: 'Minor Modes',
    intervals: [0, 2, 3, 5, 7, 8, 11],
    intervalNames: ['1', '2', 'b3', '4', '5', 'b6', '7'],
    description: 'Natural minor with a raised leading tone (major 7th). Creates an augmented 2nd interval between b6 and 7.',
    mood: 'Neo-classical, dramatic, dramatic tension',
    formula: 'W - H - W - W - H - (W+H) - H',
  },
  {
    id: 'melodic-minor',
    name: 'Melodic Minor (Jazz Minor)',
    category: 'Minor Modes',
    intervals: [0, 2, 3, 5, 7, 9, 11],
    intervalNames: ['1', '2', 'b3', '4', '5', '6', '7'],
    description: 'Minor third with bright natural 6th and 7th. In modern jazz it is played ascending & descending identically. Generates modern jazz harmony.',
    mood: 'Sophisticated, modern jazz, luminous',
    formula: 'W - H - W - W - W - W - H',
  },
  {
    id: 'altered',
    name: 'Altered Scale (Super Locrian)',
    category: 'Jazz & Altered',
    intervals: [0, 1, 3, 4, 6, 8, 10],
    intervalNames: ['1', 'b9', '#9', '3', 'b5', 'b13', 'b7'],
    description: '7th mode of melodic minor. Contains all four altered dominant tensions (b9, #9, b5, #5). The premier scale over V7alt chords in jazz.',
    mood: 'Deeply altered, modern jazz tension, resolving',
    formula: 'H - W - H - W - W - W - W',
  },
  {
    id: 'lydian-dominant',
    name: 'Lydian Dominant (Lydian b7)',
    category: 'Jazz & Altered',
    intervals: [0, 2, 4, 6, 7, 9, 10],
    intervalNames: ['1', '2', '3', '#4', '5', '6', 'b7'],
    description: '4th mode of melodic minor. Dominant 7th chord with #11. Used on non-resolving dominants, tritone substitutions, and cartoon themes (The Simpsons).',
    mood: 'Playful, quirky, shimmering dominant',
    formula: 'W - W - W - H - W - H - W',
  },
  {
    id: 'phrygian-dominant',
    name: 'Phrygian Dominant (Spanish Gypsy)',
    category: 'Jazz & Altered',
    intervals: [0, 1, 4, 5, 7, 8, 10],
    intervalNames: ['1', 'b2', '3', '4', '5', 'b6', 'b7'],
    description: '5th mode of harmonic minor. Dominant 7th with b9 and b13. Core of Middle Eastern, Klezmer, Flamenco, and metal soloing.',
    mood: 'Flamenco, Middle Eastern, exotic power',
    formula: 'H - (W+H) - H - W - H - W - W',
  },
  {
    id: 'dorian-b2',
    name: 'Dorian b2',
    category: 'Jazz & Altered',
    intervals: [0, 1, 3, 5, 7, 9, 10],
    intervalNames: ['1', 'b2', 'b3', '4', '5', '6', 'b7'],
    description: '2nd mode of melodic minor. Phrygian with a major 6th. Superb over sus(b9) chords and modal jazz vamps.',
    mood: 'Dark yet elegant, contemporary jazz',
    formula: 'H - W - W - W - W - H - W',
  },
  {
    id: 'pentatonic-minor',
    name: 'Minor Pentatonic',
    category: 'Pentatonic & Blues',
    intervals: [0, 3, 5, 7, 10],
    intervalNames: ['1', 'b3', '4', '5', 'b7'],
    description: 'The most popular 5-note scale in rock, blues, and pop. No half-steps, extremely consonant over minor and blues progressions.',
    mood: 'Gritty, direct, universal, guitar classic',
    formula: '(W+H) - W - W - (W+H) - W',
  },
  {
    id: 'pentatonic-major',
    name: 'Major Pentatonic',
    category: 'Pentatonic & Blues',
    intervals: [0, 2, 4, 7, 9],
    intervalNames: ['1', '2', '3', '5', '6'],
    description: '5-note scale without 4th or 7th degrees. Warm, open sound heard across folk, gospel, country, and soul.',
    mood: 'Soulful, pastoral, warm, uplifting',
    formula: 'W - W - (W+H) - W - (W+H)',
  },
  {
    id: 'blues',
    name: 'Blues Scale (Hexatonic)',
    category: 'Pentatonic & Blues',
    intervals: [0, 3, 5, 6, 7, 10],
    intervalNames: ['1', 'b3', '4', 'b5', '5', 'b7'],
    description: 'Minor pentatonic augmented with the iconic "blue note" (diminished 5th / tritone). Pure expressive power.',
    mood: 'Raw, emotional, blues, classic rock',
    formula: '(W+H) - W - H - H - (W+H) - W',
  },
  {
    id: 'bebop-dominant',
    name: 'Bebop Dominant',
    category: 'Jazz & Altered',
    intervals: [0, 2, 4, 5, 7, 9, 10, 11],
    intervalNames: ['1', '2', '3', '4', '5', '6', 'b7', '7'],
    description: 'Mixolydian with an added chromatic passing tone between b7 and root. Guarantees chord tones fall on downbeats when played in eighth notes.',
    mood: 'Bebop, swinging, fluent lines',
    formula: 'W - W - H - W - W - H - H - H',
  },
  {
    id: 'whole-tone',
    name: 'Whole Tone Scale',
    category: 'Jazz & Altered',
    intervals: [0, 2, 4, 6, 8, 10],
    intervalNames: ['1', '2', '3', '#4', '#5', 'b7'],
    description: 'Symmetrical 6-note scale composed entirely of whole steps. Lacks a tonic center, creating an impressionistic dream sequence effect.',
    mood: 'Dreamlike, floating, Debussy, suspenseful',
    formula: 'W - W - W - W - W - W',
  },
  {
    id: 'diminished-hw',
    name: 'Diminished (Half-Whole)',
    category: 'Jazz & Altered',
    intervals: [0, 1, 3, 4, 6, 7, 9, 10],
    intervalNames: ['1', 'b9', '#9', '3', '#11', '5', '13', 'b7'],
    description: 'Symmetrical 8-note octatonic scale starting with half-step. Incredible tension for dominant 7th chords with b9/#9/#11/13.',
    mood: 'Intense jazz tension, symmetrical, modern',
    formula: 'H - W - H - W - H - W - H - W',
  },
  {
    id: 'hirajoshi',
    name: 'Hirajoshi (Japanese Pentatonic)',
    category: 'Exotic & World',
    intervals: [0, 2, 3, 7, 8],
    intervalNames: ['1', '2', 'b3', '5', 'b6'],
    description: 'Traditional Japanese shamisen and koto tuning. Deeply contemplative, haunting beauty.',
    mood: 'Zen, haunting, Eastern, cinematic',
    formula: 'W - H - (W*2) - H - (W*2)',
  },
  {
    id: 'hungarian-minor',
    name: 'Hungarian Minor (Gypsy Minor)',
    category: 'Exotic & World',
    intervals: [0, 2, 3, 6, 7, 8, 11],
    intervalNames: ['1', '2', 'b3', '#4', '5', 'b6', '7'],
    description: 'Harmonic minor with a raised 4th (#4). Features two distinct augmented second leaps for maximum drama.',
    mood: 'Passionate, fiery, folkloric, dramatic',
    formula: 'W - H - (W+H) - H - H - (W+H) - H',
  },
  {
    id: 'double-harmonic',
    name: 'Double Harmonic Major (Byzantine)',
    category: 'Exotic & World',
    intervals: [0, 1, 4, 5, 7, 8, 11],
    intervalNames: ['1', 'b2', '3', '4', '5', 'b6', '7'],
    description: 'Famous scale with major third and two augmented 2nds. Iconic in Mediterranean, Arabic, and Middle Eastern music (e.g. "Misirlou").',
    mood: 'Middle Eastern, sun-drenched, dramatic, intense',
    formula: 'H - (W+H) - H - W - H - (W+H) - H',
  },
];

export const CHORDS: ChordDefinition[] = [
  // Triads
  {
    id: 'maj',
    name: 'Major Triad',
    symbol: '',
    category: 'Triads',
    intervals: [0, 4, 7],
    intervalNames: ['1', '3', '5'],
    description: 'Basic major triad. Clean, bright, and harmonious foundation.',
  },
  {
    id: 'min',
    name: 'Minor Triad',
    symbol: 'm',
    category: 'Triads',
    intervals: [0, 3, 7],
    intervalNames: ['1', 'b3', '5'],
    description: 'Standard minor triad. Pensive, melancholic, and stable.',
  },
  {
    id: 'dim',
    name: 'Diminished Triad',
    symbol: 'dim',
    category: 'Triads',
    intervals: [0, 3, 6],
    intervalNames: ['1', 'b3', 'b5'],
    description: 'Minor third and diminished fifth. High tension, yearning to resolve upwards.',
  },
  {
    id: 'aug',
    name: 'Augmented Triad',
    symbol: 'aug',
    category: 'Triads',
    intervals: [0, 4, 8],
    intervalNames: ['1', '3', '#5'],
    description: 'Major third and augmented fifth. Symmetrical, floating, suspenseful.',
  },

  // 7th Chords
  {
    id: 'maj7',
    name: 'Major 7th',
    symbol: 'maj7',
    category: 'Seventh Chords',
    intervals: [0, 4, 7, 11],
    intervalNames: ['1', '3', '5', '7'],
    description: 'Lush, warm, and dreamy. The quintessential jazz, bossa nova, and neo-soul sound.',
  },
  {
    id: 'm7',
    name: 'Minor 7th',
    symbol: 'm7',
    category: 'Seventh Chords',
    intervals: [0, 3, 7, 10],
    intervalNames: ['1', 'b3', '5', 'b7'],
    description: 'Smooth, relaxed, melancholy. ii chord in major key jazz progressions.',
  },
  {
    id: '7',
    name: 'Dominant 7th',
    symbol: '7',
    category: 'Seventh Chords',
    intervals: [0, 4, 7, 10],
    intervalNames: ['1', '3', '5', 'b7'],
    description: 'Contains a tritone between 3 and b7. The driving harmonic engine of Western music and blues.',
  },
  {
    id: 'm7b5',
    name: 'Half-Diminished 7th',
    symbol: 'm7b5',
    category: 'Seventh Chords',
    intervals: [0, 3, 6, 10],
    intervalNames: ['1', 'b3', 'b5', 'b7'],
    description: 'Minor 7th with flat 5. The iconic ii chord in minor key 2-5-1 jazz cadences.',
  },
  {
    id: 'dim7',
    name: 'Fully Diminished 7th',
    symbol: 'dim7',
    category: 'Seventh Chords',
    intervals: [0, 3, 6, 9],
    intervalNames: ['1', 'b3', 'b5', 'bb7'],
    description: 'All minor-third intervals. Symmetrical structure can resolve to 4 different major/minor chords.',
  },
  {
    id: 'mmaj7',
    name: 'Minor-Major 7th',
    symbol: 'm(maj7)',
    category: 'Seventh Chords',
    intervals: [0, 3, 7, 11],
    intervalNames: ['1', 'b3', '5', '7'],
    description: 'Minor triad with a natural 7th. Famous as the "James Bond" spy chord.',
  },

  // Extended Chords
  {
    id: 'maj9',
    name: 'Major 9th',
    symbol: 'maj9',
    category: 'Extended (9/11/13)',
    intervals: [0, 4, 7, 11, 14],
    intervalNames: ['1', '3', '5', '7', '9'],
    description: 'Gorgeously rich major extension. Warm, lush, sophisticated acoustic and piano texture.',
  },
  {
    id: 'm9',
    name: 'Minor 9th',
    symbol: 'm9',
    category: 'Extended (9/11/13)',
    intervals: [0, 3, 7, 10, 14],
    intervalNames: ['1', 'b3', '5', 'b7', '9'],
    description: 'Dark yet luminous. Iconic in modern R&B, lo-fi hip hop, and contemporary jazz.',
  },
  {
    id: '9',
    name: 'Dominant 9th',
    symbol: '9',
    category: 'Extended (9/11/13)',
    intervals: [0, 4, 7, 10, 14],
    intervalNames: ['1', '3', '5', 'b7', '9'],
    description: 'Funky, rich dominant chord heard in James Brown, Stevie Wonder, and blues.',
  },
  {
    id: 'm11',
    name: 'Minor 11th',
    symbol: 'm11',
    category: 'Extended (9/11/13)',
    intervals: [0, 3, 7, 10, 14, 17],
    intervalNames: ['1', 'b3', '5', 'b7', '9', '11'],
    description: 'Very open, quartal, modern modal sound (Bill Evans, Herbie Hancock).',
  },
  {
    id: 'maj13',
    name: 'Major 13th',
    symbol: 'maj13',
    category: 'Extended (9/11/13)',
    intervals: [0, 4, 7, 11, 14, 21],
    intervalNames: ['1', '3', '5', '7', '9', '13'],
    description: 'The pinnacle of rich major harmony with natural 9 and 13.',
  },
  {
    id: '13',
    name: 'Dominant 13th',
    symbol: '13',
    category: 'Extended (9/11/13)',
    intervals: [0, 4, 7, 10, 14, 21],
    intervalNames: ['1', '3', '5', 'b7', '9', '13'],
    description: 'Smooth big-band and swing dominant sound.',
  },

  // Altered & Jazz
  {
    id: '7sharp9',
    name: '7#9 (The Hendrix Chord)',
    symbol: '7#9',
    category: 'Altered & Jazz',
    intervals: [0, 4, 7, 10, 15],
    intervalNames: ['1', '3', '5', 'b7', '#9'],
    description: 'Iconic Jimi Hendrix "Purple Haze" chord. Contains both major 3rd and minor 3rd (spelled as #9) for explosive blues grit.',
  },
  {
    id: '7flat9',
    name: '7b9',
    symbol: '7b9',
    category: 'Altered & Jazz',
    intervals: [0, 4, 7, 10, 13],
    intervalNames: ['1', '3', '5', 'b7', 'b9'],
    description: 'Classic minor-key dominant chord. High harmonic pull toward minor tonic.',
  },
  {
    id: '7sharp11',
    name: '7#11 (Lydian Dominant)',
    symbol: '7#11',
    category: 'Altered & Jazz',
    intervals: [0, 4, 7, 10, 18],
    intervalNames: ['1', '3', '5', 'b7', '#11'],
    description: 'Dominant 7th with raised 11th. Modern acoustic jazz and tritone substitute sound.',
  },
  {
    id: '7alt',
    name: '7alt (Fully Altered)',
    symbol: '7alt',
    category: 'Altered & Jazz',
    intervals: [0, 4, 10, 13, 15, 20],
    intervalNames: ['1', '3', 'b7', 'b9', '#9', 'b13'],
    description: 'Maximum dominant tension in modern jazz harmony. Strongly pulls into minor or major tonic.',
  },

  // Suspended & Added
  {
    id: 'sus4',
    name: 'Suspended 4th',
    symbol: 'sus4',
    category: 'Suspended & Added',
    intervals: [0, 5, 7],
    intervalNames: ['1', '4', '5'],
    description: 'Replaces the third with the fourth. Open, tense anticipation waiting to resolve to major.',
  },
  {
    id: 'sus2',
    name: 'Suspended 2nd',
    symbol: 'sus2',
    category: 'Suspended & Added',
    intervals: [0, 2, 7],
    intervalNames: ['1', '2', '5'],
    description: 'Replaces third with the second. Shimmering, optimistic, acoustic pop hallmark.',
  },
  {
    id: 'add9',
    name: 'Add 9',
    symbol: 'add9',
    category: 'Suspended & Added',
    intervals: [0, 4, 7, 14],
    intervalNames: ['1', '3', '5', '9'],
    description: 'Major triad with added 9th (no 7th). Sweet, sparkling modern acoustic favorite.',
  },
  {
    id: '6_9',
    name: '6/9 Chord',
    symbol: '6/9',
    category: 'Suspended & Added',
    intervals: [0, 4, 7, 9, 14],
    intervalNames: ['1', '3', '5', '6', '9'],
    description: 'Bossa nova and gypsy jazz ending chord. Extremely stable yet colorful, free of leading tone tension.',
  },
  {
    id: 'mu-major',
    name: 'Mu Major (Steely Dan Chord)',
    symbol: 'μ',
    category: 'Suspended & Added',
    intervals: [0, 2, 4, 7],
    intervalNames: ['1', '2', '3', '5'],
    description: 'Major triad with an added second right next to the third (major 2nd voicing). Steely Dan signature harmonic sound.',
  },
];

export const TUNINGS: TuningDefinition[] = [
  {
    id: 'guitar-standard',
    name: 'Guitar: Standard (E A D G B E)',
    instrument: 'guitar',
    stringNotes: [
      { note: 'E', octave: 4 },
      { note: 'B', octave: 3 },
      { note: 'G', octave: 3 },
      { note: 'D', octave: 3 },
      { note: 'A', octave: 2 },
      { note: 'E', octave: 2 },
    ],
  },
  {
    id: 'guitar-drop-d',
    name: 'Guitar: Drop D (D A D G B E)',
    instrument: 'guitar',
    stringNotes: [
      { note: 'E', octave: 4 },
      { note: 'B', octave: 3 },
      { note: 'G', octave: 3 },
      { note: 'D', octave: 3 },
      { note: 'A', octave: 2 },
      { note: 'D', octave: 2 },
    ],
  },
  {
    id: 'guitar-dadgad',
    name: 'Guitar: DADGAD (Celtic/Folk)',
    instrument: 'guitar',
    stringNotes: [
      { note: 'D', octave: 4 },
      { note: 'A', octave: 3 },
      { note: 'G', octave: 3 },
      { note: 'D', octave: 3 },
      { note: 'A', octave: 2 },
      { note: 'D', octave: 2 },
    ],
  },
  {
    id: 'guitar-open-g',
    name: 'Guitar: Open G (D G D G B D)',
    instrument: 'guitar',
    stringNotes: [
      { note: 'D', octave: 4 },
      { note: 'B', octave: 3 },
      { note: 'G', octave: 3 },
      { note: 'D', octave: 3 },
      { note: 'G', octave: 2 },
      { note: 'D', octave: 2 },
    ],
  },
  {
    id: 'guitar-half-step',
    name: 'Guitar: Eb Standard (Hendrix/SRV)',
    instrument: 'guitar',
    stringNotes: [
      { note: 'Eb', octave: 4 },
      { note: 'Bb', octave: 3 },
      { note: 'Gb', octave: 3 },
      { note: 'Db', octave: 3 },
      { note: 'Ab', octave: 2 },
      { note: 'Eb', octave: 2 },
    ],
  },
  {
    id: 'bass-4-standard',
    name: 'Bass: 4-String Standard (E A D G)',
    instrument: 'bass-4',
    stringNotes: [
      { note: 'G', octave: 2 },
      { note: 'D', octave: 2 },
      { note: 'A', octave: 1 },
      { note: 'E', octave: 1 },
    ],
  },
  {
    id: 'bass-5-standard',
    name: 'Bass: 5-String Standard (B E A D G)',
    instrument: 'bass-5',
    stringNotes: [
      { note: 'G', octave: 2 },
      { note: 'D', octave: 2 },
      { note: 'A', octave: 1 },
      { note: 'E', octave: 1 },
      { note: 'B', octave: 0 },
    ],
  },
  {
    id: 'ukulele-standard',
    name: 'Ukulele: Standard GCEA',
    instrument: 'ukulele',
    stringNotes: [
      { note: 'A', octave: 4 },
      { note: 'E', octave: 4 },
      { note: 'C', octave: 4 },
      { note: 'G', octave: 4 },
    ],
  },
];

export const CHORD_PROGRESSIONS: ChordProgressionPreset[] = [
  {
    id: 'jazz-ii-v-i',
    name: 'Jazz ii - V - I (Major)',
    genre: 'Jazz',
    romanNumerals: ['ii7', 'V7', 'Imaj7'],
    description: 'The golden cadence of bebop and standard jazz repertoire.',
    formula: ['2', '7', '0'],
  },
  {
    id: 'jazz-minor-ii-v-i',
    name: 'Minor iiø - V7alt - i',
    genre: 'Jazz',
    romanNumerals: ['iiø7 (m7b5)', 'V7(b9)', 'i(m7)'],
    description: 'The essential minor cadence in jazz (e.g. Autumn Leaves, Blue Bossa).',
    formula: ['2', '7', '0'],
  },
  {
    id: 'pop-1-5-6-4',
    name: 'The 4 Chords of Pop (I - V - vi - IV)',
    genre: 'Pop / Rock',
    romanNumerals: ['I', 'V', 'vi', 'IV'],
    description: 'The most recorded chord progression in popular music history (Beatles, U2, Journey).',
    formula: ['0', '7', '9', '5'],
  },
  {
    id: 'doo-wop-50s',
    name: '50s Doo-Wop (I - vi - IV - V)',
    genre: 'Vintage Rock / Soul',
    romanNumerals: ['I', 'vi', 'IV', 'V'],
    description: 'Classic 1950s rock & roll progression (Stand By Me, Earth Angel).',
    formula: ['0', '9', '5', '7'],
  },
  {
    id: 'andalusian-cadence',
    name: 'Andalusian Cadence (i - VII - VI - V)',
    genre: 'Flamenco / Latin',
    romanNumerals: ['i', 'bVII', 'bVI', 'V'],
    description: 'Descending flamenco step progression (Hit the Road Jack, Sultans of Swing).',
    formula: ['0', '10', '8', '7'],
  },
  {
    id: '12-bar-blues',
    name: '12-Bar Blues (I7 - IV7 - V7)',
    genre: 'Blues',
    romanNumerals: ['I7', 'IV7', 'I7', 'V7'],
    description: 'The standard twelve bar blues cycle powering rhythm and blues.',
    formula: ['0', '5', '0', '7'],
  },
  {
    id: 'modal-vamp-dorian',
    name: 'Dorian Funk Vamp (i7 - IV7)',
    genre: 'Funk / Fusion',
    romanNumerals: ['i7', 'IV7'],
    description: 'Santana / Oye Como Va / Chameleon two-chord hypnotic groove.',
    formula: ['0', '5'],
  },
  {
    id: 'coltrane-matrix',
    name: 'Coltrane Changes Preview (Major Thirds)',
    genre: 'Advanced Jazz',
    romanNumerals: ['Imaj7', 'V7/bVI', 'bVImaj7', 'V7/III', 'IIImaj7'],
    description: 'John Coltrane "Giant Steps" cycle dividing the octave into major thirds (B, G, Eb).',
    formula: ['0', '7', '8', '3', '4'],
  },
];

export const CIRCLE_OF_FIFTHS: CircleKey[] = [
  {
    name: 'C',
    relativeMinor: 'A',
    accidentals: 0,
    accidentalsStr: 'No sharps or flats',
    diatonicChords: [
      { roman: 'I', name: 'C' },
      { roman: 'ii', name: 'Dm' },
      { roman: 'iii', name: 'Em' },
      { roman: 'IV', name: 'F' },
      { roman: 'V', name: 'G' },
      { roman: 'vi', name: 'Am' },
      { roman: 'vii°', name: 'Bdim' },
    ],
  },
  {
    name: 'G',
    relativeMinor: 'E',
    accidentals: 1,
    accidentalsStr: '1 ♯ (F♯)',
    diatonicChords: [
      { roman: 'I', name: 'G' },
      { roman: 'ii', name: 'Am' },
      { roman: 'iii', name: 'Bm' },
      { roman: 'IV', name: 'C' },
      { roman: 'V', name: 'D' },
      { roman: 'vi', name: 'Em' },
      { roman: 'vii°', name: 'F#dim' },
    ],
  },
  {
    name: 'D',
    relativeMinor: 'B',
    accidentals: 2,
    accidentalsStr: '2 ♯ (F♯, C♯)',
    diatonicChords: [
      { roman: 'I', name: 'D' },
      { roman: 'ii', name: 'Em' },
      { roman: 'iii', name: 'F#m' },
      { roman: 'IV', name: 'G' },
      { roman: 'V', name: 'A' },
      { roman: 'vi', name: 'Bm' },
      { roman: 'vii°', name: 'C#dim' },
    ],
  },
  {
    name: 'A',
    relativeMinor: 'F#',
    accidentals: 3,
    accidentalsStr: '3 ♯ (F♯, C♯, G♯)',
    diatonicChords: [
      { roman: 'I', name: 'A' },
      { roman: 'ii', name: 'Bm' },
      { roman: 'iii', name: 'C#m' },
      { roman: 'IV', name: 'D' },
      { roman: 'V', name: 'E' },
      { roman: 'vi', name: 'F#m' },
      { roman: 'vii°', name: 'G#dim' },
    ],
  },
  {
    name: 'E',
    relativeMinor: 'C#',
    accidentals: 4,
    accidentalsStr: '4 ♯ (F♯, C♯, G♯, D♯)',
    diatonicChords: [
      { roman: 'I', name: 'E' },
      { roman: 'ii', name: 'F#m' },
      { roman: 'iii', name: 'G#m' },
      { roman: 'IV', name: 'A' },
      { roman: 'V', name: 'B' },
      { roman: 'vi', name: 'C#m' },
      { roman: 'vii°', name: 'D#dim' },
    ],
  },
  {
    name: 'B',
    relativeMinor: 'G#',
    accidentals: 5,
    accidentalsStr: '5 ♯ (F♯, C♯, G♯, D♯, A♯)',
    diatonicChords: [
      { roman: 'I', name: 'B' },
      { roman: 'ii', name: 'C#m' },
      { roman: 'iii', name: 'D#m' },
      { roman: 'IV', name: 'E' },
      { roman: 'V', name: 'F#' },
      { roman: 'vi', name: 'G#m' },
      { roman: 'vii°', name: 'A#dim' },
    ],
  },
  {
    name: 'F#',
    relativeMinor: 'D#',
    accidentals: 6,
    accidentalsStr: '6 ♯ (F♯, C♯, G♯, D♯, A♯, E♯)',
    diatonicChords: [
      { roman: 'I', name: 'F#' },
      { roman: 'ii', name: 'G#m' },
      { roman: 'iii', name: 'A#m' },
      { roman: 'IV', name: 'B' },
      { roman: 'V', name: 'C#' },
      { roman: 'vi', name: 'D#m' },
      { roman: 'vii°', name: 'E#dim' },
    ],
  },
  {
    name: 'Db',
    relativeMinor: 'Bb',
    accidentals: -5,
    accidentalsStr: '5 ♭ (B♭, E♭, A♭, D♭, G♭)',
    diatonicChords: [
      { roman: 'I', name: 'Db' },
      { roman: 'ii', name: 'Ebm' },
      { roman: 'iii', name: 'Fm' },
      { roman: 'IV', name: 'Gb' },
      { roman: 'V', name: 'Ab' },
      { roman: 'vi', name: 'Bbm' },
      { roman: 'vii°', name: 'Cdim' },
    ],
  },
  {
    name: 'Ab',
    relativeMinor: 'F',
    accidentals: -4,
    accidentalsStr: '4 ♭ (B♭, E♭, A♭, D♭)',
    diatonicChords: [
      { roman: 'I', name: 'Ab' },
      { roman: 'ii', name: 'Bbm' },
      { roman: 'iii', name: 'Cm' },
      { roman: 'IV', name: 'Db' },
      { roman: 'V', name: 'Eb' },
      { roman: 'vi', name: 'Fm' },
      { roman: 'vii°', name: 'Gdim' },
    ],
  },
  {
    name: 'Eb',
    relativeMinor: 'C',
    accidentals: -3,
    accidentalsStr: '3 ♭ (B♭, E♭, A♭)',
    diatonicChords: [
      { roman: 'I', name: 'Eb' },
      { roman: 'ii', name: 'Fm' },
      { roman: 'iii', name: 'Gm' },
      { roman: 'IV', name: 'Ab' },
      { roman: 'V', name: 'Bb' },
      { roman: 'vi', name: 'Cm' },
      { roman: 'vii°', name: 'Ddim' },
    ],
  },
  {
    name: 'Bb',
    relativeMinor: 'G',
    accidentals: -2,
    accidentalsStr: '2 ♭ (B♭, E♭)',
    diatonicChords: [
      { roman: 'I', name: 'Bb' },
      { roman: 'ii', name: 'Cm' },
      { roman: 'iii', name: 'Dm' },
      { roman: 'IV', name: 'Eb' },
      { roman: 'V', name: 'F' },
      { roman: 'vi', name: 'Gm' },
      { roman: 'vii°', name: 'Adim' },
    ],
  },
  {
    name: 'F',
    relativeMinor: 'D',
    accidentals: -1,
    accidentalsStr: '1 ♭ (B♭)',
    diatonicChords: [
      { roman: 'I', name: 'F' },
      { roman: 'ii', name: 'Gm' },
      { roman: 'iii', name: 'Am' },
      { roman: 'IV', name: 'Bb' },
      { roman: 'V', name: 'C' },
      { roman: 'vi', name: 'Dm' },
      { roman: 'vii°', name: 'Edim' },
    ],
  },
];

// Helper Functions
export function getPitchClass(note: string): number {
  const normalized = note.trim();
  if (normalized in ENHARMONIC_MAP) {
    return ENHARMONIC_MAP[normalized];
  }
  return 0;
}

export function getNoteFromPitch(pitch: number, preferFlats = false): NoteName {
  const p = ((pitch % 12) + 12) % 12;
  return preferFlats ? CHROMATIC_FLATS[p] : CHROMATIC_SHARPS[p];
}

export function getNotesForScale(root: NoteName, scale: ScaleDefinition): { note: NoteName; interval: string; semitones: number }[] {
  const rootPitch = getPitchClass(root);
  const useFlats = ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'd', 'g', 'c', 'f'].includes(root);

  return scale.intervals.map((semitone, idx) => {
    const pitch = (rootPitch + semitone) % 12;
    const note = getNoteFromPitch(pitch, useFlats);
    const interval = scale.intervalNames[idx] || `${semitone}`;
    return { note, interval, semitones: semitone };
  });
}

export function getNotesForChord(root: NoteName, chord: ChordDefinition): { note: NoteName; interval: string; semitones: number }[] {
  const rootPitch = getPitchClass(root);
  const useFlats = ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb'].includes(root);

  return chord.intervals.map((semitone, idx) => {
    const pitch = (rootPitch + semitone) % 12;
    const note = getNoteFromPitch(pitch, useFlats);
    const interval = chord.intervalNames[idx] || `${semitone}`;
    return { note, interval, semitones: semitone };
  });
}

// Color palette for intervals:
// Root: Emerald/Gold, 3rd: Amber/Orange, 5th: Cyan/Blue, 7th: Purple/Violet, Extensions: Rose/Pink
export function getIntervalBadgeColor(interval: string, isRoot: boolean): { bg: string; text: string; border: string; glow: string } {
  if (isRoot || interval === '1' || interval === '8') {
    return {
      bg: 'bg-emerald-500',
      text: 'text-white',
      border: 'border-emerald-400',
      glow: 'shadow-[0_0_12px_rgba(16,185,129,0.7)]',
    };
  }
  if (interval === '3' || interval === 'b3') {
    return {
      bg: 'bg-amber-500',
      text: 'text-slate-950 font-bold',
      border: 'border-amber-400',
      glow: 'shadow-[0_0_12px_rgba(245,158,11,0.6)]',
    };
  }
  if (interval === '5' || interval === 'b5' || interval === '#5') {
    return {
      bg: 'bg-cyan-500',
      text: 'text-slate-950 font-bold',
      border: 'border-cyan-400',
      glow: 'shadow-[0_0_12px_rgba(6,182,212,0.6)]',
    };
  }
  if (interval === '7' || interval === 'b7' || interval === 'bb7') {
    return {
      bg: 'bg-purple-500',
      text: 'text-white',
      border: 'border-purple-400',
      glow: 'shadow-[0_0_12px_rgba(168,85,247,0.6)]',
    };
  }
  if (interval.includes('9') || interval.includes('2')) {
    return {
      bg: 'bg-blue-500',
      text: 'text-white',
      border: 'border-blue-400',
      glow: 'shadow-[0_0_12px_rgba(59,130,246,0.6)]',
    };
  }
  if (interval.includes('11') || interval === '4') {
    return {
      bg: 'bg-teal-500',
      text: 'text-slate-950 font-bold',
      border: 'border-teal-400',
      glow: 'shadow-[0_0_12px_rgba(20,184,166,0.6)]',
    };
  }
  // 13, 6, altered
  return {
    bg: 'bg-rose-500',
    text: 'text-white',
    border: 'border-rose-400',
    glow: 'shadow-[0_0_12px_rgba(244,63,94,0.6)]',
  };
}

// Convert Note + Octave to MIDI note number (e.g. C4 = 60)
export function getMidiNote(note: NoteName, octave: number): number {
  const pitch = getPitchClass(note);
  return (octave + 1) * 12 + pitch;
}

// Calculate frequency from MIDI note: 440 * 2^((midi-69)/12)
export function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}
