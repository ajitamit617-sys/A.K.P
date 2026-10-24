export type NoteName =
  | 'C'
  | 'C#'
  | 'Db'
  | 'D'
  | 'D#'
  | 'Eb'
  | 'E'
  | 'F'
  | 'F#'
  | 'Gb'
  | 'G'
  | 'G#'
  | 'Ab'
  | 'A'
  | 'A#'
  | 'Bb'
  | 'B';

export interface IntervalInfo {
  semitones: number;
  name: string;
  degree: string;
  role: 'root' | 'third' | 'fifth' | 'seventh' | 'extension' | 'color';
}

export interface ScaleDefinition {
  id: string;
  name: string;
  category: 'Major & Modes' | 'Minor Modes' | 'Pentatonic & Blues' | 'Jazz & Altered' | 'Exotic & World';
  intervals: number[]; // semitones from root
  intervalNames: string[];
  description: string;
  mood: string;
  formula: string;
}

export interface ChordDefinition {
  id: string;
  name: string;
  symbol: string;
  category: 'Triads' | 'Seventh Chords' | 'Extended (9/11/13)' | 'Altered & Jazz' | 'Suspended & Added';
  intervals: number[]; // semitones from root
  intervalNames: string[];
  description: string;
}

export interface TuningDefinition {
  id: string;
  name: string;
  instrument: 'guitar' | 'bass-4' | 'bass-5' | 'ukulele';
  stringNotes: { note: NoteName; octave: number }[]; // highest string to lowest or 1st to 6th
}

export interface VisualNote {
  note: NoteName;
  octave?: number;
  interval: string;
  semitones: number;
  isRoot: boolean;
  colorClass: string;
  degreeLabel: string;
}

export interface ChordProgressionPreset {
  id: string;
  name: string;
  genre: string;
  romanNumerals: string[];
  description: string;
  formula: string[]; // relative semitone or chord type
}

export interface CircleKey {
  name: NoteName;
  relativeMinor: NoteName;
  accidentals: number; // positive = sharps, negative = flats
  accidentalsStr: string;
  diatonicChords: { roman: string; name: string }[];
}
