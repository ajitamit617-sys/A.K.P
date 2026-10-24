import React, { useState, useMemo, useEffect } from 'react';
import {
  NoteName,
  ScaleDefinition,
  ChordDefinition,
  TuningDefinition,
} from './types/music';
import {
  CHROMATIC_SHARPS,
  SCALES,
  CHORDS,
  TUNINGS,
  getNotesForScale,
  getNotesForChord,
  getMidiNote,
} from './utils/musicTheory';
import { soundEngine, InstrumentType } from './utils/audioEngine';
import { PianoVisualizer } from './components/PianoVisualizer';
import { FretboardVisualizer } from './components/FretboardVisualizer';
import { CircleOfFifthsVisualizer } from './components/CircleOfFifthsVisualizer';
import { StaffNotationVisualizer } from './components/StaffNotationVisualizer';
import { ChordProgressionBuilder } from './components/ChordProgressionBuilder';
import { AiImageModal } from './components/AiImageModal';
import { AiChatDrawer } from './components/AiChatDrawer';
import {
  Music,
  Piano,
  Compass,
  FileMusic,
  Layers,
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  Search,
  MessageSquare,
  Image as ImageIcon,
  HelpCircle,
  Radio,
  Sliders,
  Guitar,
  Info,
  Wand2,
  Share2,
} from 'lucide-react';

export default function App() {
  // Main State
  const [selectedRoot, setSelectedRoot] = useState<NoteName>('C');
  const [activeTab, setActiveTab] = useState<'piano' | 'fretboard' | 'circle' | 'staff' | 'progressions'>('piano');
  const [modeType, setModeType] = useState<'scale' | 'chord'>('scale');

  const [selectedScaleId, setSelectedScaleId] = useState<string>('major');
  const [selectedChordId, setSelectedChordId] = useState<string>('maj7');

  // Display and instrument settings
  const [displayMode, setDisplayMode] = useState<'intervals' | 'notes' | 'solfege'>('intervals');
  const [selectedTuningId, setSelectedTuningId] = useState<string>('guitar-standard');
  const [fretCount, setFretCount] = useState<number>(15);
  const [fretboardFilter, setFretboardFilter] = useState<'all' | 'roots-only' | 'chord-tones'>('all');
  const [instrument, setInstrument] = useState<InstrumentType>('piano');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isDroneActive, setIsDroneActive] = useState<boolean>(false);

  // Playback state
  const [isPlayingSequence, setIsPlayingSequence] = useState<boolean>(false);
  const [currentPlayingMidi, setCurrentPlayingMidi] = useState<number | null>(null);

  // Natural Language Search query
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Modals and Drawers
  const [isImageModalOpen, setIsImageModalOpen] = useState<boolean>(false);
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState<boolean>(false);

  // Find active definitions
  const activeScale = useMemo(() => {
    return SCALES.find((s) => s.id === selectedScaleId) || SCALES[0];
  }, [selectedScaleId]);

  const activeChord = useMemo(() => {
    return CHORDS.find((c) => c.id === selectedChordId) || CHORDS[0];
  }, [selectedChordId]);

  const activeTuning = useMemo(() => {
    return TUNINGS.find((t) => t.id === selectedTuningId) || TUNINGS[0];
  }, [selectedTuningId]);

  // Compute active notes
  const activeNotes = useMemo(() => {
    if (modeType === 'scale') {
      return getNotesForScale(selectedRoot, activeScale);
    } else {
      return getNotesForChord(selectedRoot, activeChord);
    }
  }, [modeType, selectedRoot, activeScale, activeChord]);

  // Handle instrument change
  const handleInstrumentChange = (type: InstrumentType) => {
    setInstrument(type);
    soundEngine.setInstrument(type);
  };

  // Toggle Mute
  const handleToggleMute = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  };

  // Toggle Root Drone for ear training
  const handleToggleDrone = () => {
    if (isDroneActive) {
      soundEngine.stopDrone();
      setIsDroneActive(false);
    } else {
      const rootMidi = getMidiNote(selectedRoot, 3);
      soundEngine.startDrone(rootMidi);
      setIsDroneActive(true);
    }
  };

  // Stop drone when unmounting or switching roots
  useEffect(() => {
    if (isDroneActive) {
      const rootMidi = getMidiNote(selectedRoot, 3);
      soundEngine.startDrone(rootMidi);
    }
  }, [selectedRoot]);

  // Play full scale or chord
  const handlePlayCurrent = () => {
    if (isPlayingSequence) return;

    if (modeType === 'chord') {
      const midis = activeNotes.map((n) => {
        const octave = n.semitones >= 12 ? 4 : 3;
        return getMidiNote(n.note, octave);
      });
      soundEngine.playChord(midis, true, 2.0);
    } else {
      // Scale: play ascending sequence
      setIsPlayingSequence(true);
      const midis = activeNotes.map((n) => {
        const octave = n.semitones >= 12 ? 4 : 3;
        return getMidiNote(n.note, octave);
      });
      // Add root octave on top for complete resolution
      const topRootMidi = getMidiNote(selectedRoot, 4);
      const fullSequence = [...midis, topRootMidi];

      soundEngine.playSequence(
        fullSequence,
        0.28,
        (idx) => {
          setCurrentPlayingMidi(fullSequence[idx]);
        },
        () => {
          setIsPlayingSequence(false);
          setCurrentPlayingMidi(null);
        }
      );
    }
  };

  // Natural Language AI Theory Search / Parse
  const handleNaturalLanguageSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim() || isSearching) return;

    setIsSearching(true);
    setSearchError(null);

    try {
      const res = await fetch('/api/parse-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to parse theory query');

      if (data.root) {
        setSelectedRoot(data.root as NoteName);
      }

      if (data.type === 'chord') {
        setModeType('chord');
        const matchedChord = CHORDS.find(
          (c) =>
            c.name.toLowerCase().includes(data.name.toLowerCase()) ||
            c.symbol.toLowerCase() === data.name.toLowerCase()
        );
        if (matchedChord) {
          setSelectedChordId(matchedChord.id);
        }
      } else if (data.type === 'scale') {
        setModeType('scale');
        const matchedScale = SCALES.find(
          (s) =>
            s.name.toLowerCase().includes(data.name.toLowerCase()) ||
            data.name.toLowerCase().includes(s.id)
        );
        if (matchedScale) {
          setSelectedScaleId(matchedScale.id);
        }
      } else if (data.type === 'progression') {
        setActiveTab('progressions');
      }
    } catch (err: any) {
      console.error(err);
      setSearchError('Could not parse query. Showing nearest match.');
    } finally {
      setIsSearching(false);
    }
  };

  // Quick preset pills
  const quickQueryExamples = [
    'Dorian b2 in Eb',
    '7#9 Hendrix chord in E',
    'Lydian Dominant in A',
    'Steely Dan Mu Major in F',
    'Hirajoshi in D',
    'Minor 2-5-1 in C',
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950">
              <Music className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-white via-slate-100 to-amber-200 bg-clip-text text-transparent font-serif">
                  HARMONIA
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  STUDIO
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Interactive Music Theory &amp; Visualizer Studio
              </p>
            </div>
          </div>

          {/* Natural Language Query Bar */}
          <form
            onSubmit={handleNaturalLanguageSearch}
            className="flex-1 max-w-md w-full relative"
          >
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ask e.g. 'Dorian b2 in Eb', '7#9 chord on E'..."
                className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-amber-500 rounded-xl pl-9 pr-24 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={isSearching || !searchQuery.trim()}
                className="absolute right-1.5 px-2.5 py-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold text-[11px] rounded-lg transition-transform active:scale-95 flex items-center gap-1 shadow-sm"
              >
                {isSearching ? (
                  <span className="animate-spin text-xs">⏳</span>
                ) : (
                  <Wand2 className="w-3 h-3" />
                )}
                Visualize
              </button>
            </div>
          </form>

          {/* Audio & Tool Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Instrument Selector */}
            <select
              value={instrument}
              onChange={(e) => handleInstrumentChange(e.target.value as InstrumentType)}
              className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-xl px-2.5 py-2 focus:outline-none focus:border-amber-500 font-medium"
            >
              <option value="piano">🎹 Concert Piano</option>
              <option value="rhodes">⚡ Rhodes E-Piano</option>
              <option value="organ">🎷 Jazz Organ</option>
              <option value="synth">🎛️ Analog Synth</option>
              <option value="guitar">🎸 Acoustic Pluck</option>
            </select>

            {/* Ear Training Drone */}
            <button
              onClick={handleToggleDrone}
              className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition-all ${
                isDroneActive
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm animate-pulse'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
              title="Continuous Root Drone for Ear Training"
            >
              <Radio className="w-4 h-4" />
              <span className="hidden sm:inline text-[11px] font-mono">Drone</span>
            </button>

            {/* Sound Mute */}
            <button
              onClick={handleToggleMute}
              className={`p-2 rounded-xl border text-xs transition-colors ${
                isMuted
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* AI Image Generator Modal Button */}
            <button
              onClick={() => setIsImageModalOpen(true)}
              className="px-3 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all active:scale-95"
            >
              <ImageIcon className="w-4 h-4" />
              <span className="hidden sm:inline">AI Poster (1K/2K/4K)</span>
            </button>

            {/* AI Chat Drawer Button */}
            <button
              onClick={() => setIsChatDrawerOpen(true)}
              className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all active:scale-95"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">AI Tutor</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 space-y-6">
        {/* Quick Query Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs text-slate-400">
          <span className="text-[11px] font-mono text-slate-500 uppercase flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Quick Requests:
          </span>
          {quickQueryExamples.map((item, idx) => (
            <button
              key={`q-${idx}`}
              onClick={() => {
                setSearchQuery(item);
                // Trigger auto parse
                setTimeout(() => handleNaturalLanguageSearch(), 50);
              }}
              className="px-2.5 py-1 bg-slate-900/60 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-full whitespace-nowrap text-slate-300 transition-colors"
            >
              {item}
            </button>
          ))}
        </div>

        {/* Primary Theory Selector Card */}
        <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl backdrop-blur-md space-y-5">
          {/* Top Row: Mode Switcher (Scales vs Chords) + Play Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Mode Switcher */}
            <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 w-fit">
              <button
                onClick={() => setModeType('scale')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  modeType === 'scale'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Scales &amp; Modes
              </button>
              <button
                onClick={() => setModeType('chord')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  modeType === 'chord'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Chords &amp; Voicings
              </button>
            </div>

            {/* Play Button & Display Mode Badges */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                <span className="px-2 text-[10px] text-slate-500 font-mono">Labels:</span>
                {(['intervals', 'notes', 'solfege'] as const).map((dm) => (
                  <button
                    key={`dm-${dm}`}
                    onClick={() => setDisplayMode(dm)}
                    className={`px-2 py-1 rounded-lg capitalize text-[11px] font-medium transition-all ${
                      displayMode === dm
                        ? 'bg-slate-800 text-white font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {dm}
                  </button>
                ))}
              </div>

              {/* Play Current Scale/Chord */}
              <button
                onClick={handlePlayCurrent}
                disabled={isPlayingSequence}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-40 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>{modeType === 'chord' ? 'Strum Chord' : 'Play Scale'}</span>
              </button>
            </div>
          </div>

          {/* Root Note 12 Chromatic Selector */}
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Select Root Key:
            </div>
            <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
              {CHROMATIC_SHARPS.map((note) => {
                const isSelected = selectedRoot === note;
                return (
                  <button
                    key={`root-${note}`}
                    onClick={() => setSelectedRoot(note)}
                    className={`py-2 rounded-xl text-xs font-bold font-mono transition-all duration-75 active:scale-95 ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30 ring-2 ring-emerald-300'
                        : 'bg-slate-950/70 border border-slate-800 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    {note}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scale or Chord Type Picker */}
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Select {modeType === 'scale' ? 'Scale / Mode' : 'Chord Quality'}:
            </div>

            {modeType === 'scale' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {SCALES.map((scale) => {
                  const isSelected = selectedScaleId === scale.id;
                  return (
                    <button
                      key={scale.id}
                      onClick={() => setSelectedScaleId(scale.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-500 text-amber-200 shadow-md shadow-amber-500/10'
                          : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <div className="text-xs font-bold text-white mb-0.5 truncate">
                        {scale.name}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono truncate">
                        {scale.category}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {CHORDS.map((chord) => {
                  const isSelected = selectedChordId === chord.id;
                  return (
                    <button
                      key={chord.id}
                      onClick={() => setSelectedChordId(chord.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-500 text-amber-200 shadow-md shadow-amber-500/10'
                          : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <div className="text-xs font-bold text-white mb-0.5 truncate">
                        {chord.name}
                      </div>
                      <div className="text-[10px] text-amber-400/80 font-mono truncate">
                        {chord.symbol ? `${selectedRoot}${chord.symbol}` : 'Triad'}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* View Tabs Selector */}
        <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-800 pb-2">
          {[
            { id: 'piano', label: 'Piano Keyboard', icon: Piano },
            { id: 'fretboard', label: 'Guitar & Bass Fretboard', icon: Guitar },
            { id: 'circle', label: 'Circle of Fifths', icon: Compass },
            { id: 'staff', label: 'Musical Notation', icon: FileMusic },
            { id: 'progressions', label: 'Progression Arranger', icon: Layers },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Active Visualizer View */}
        <div className="space-y-6">
          {activeTab === 'piano' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-slate-300">
                  Keyboard View ({selectedRoot}{' '}
                  {modeType === 'scale' ? activeScale.name : activeChord.name})
                </span>
                <span className="text-[11px] font-mono">
                  3 Octaves (C3 - B5) • Click any key to trigger synth
                </span>
              </div>
              <PianoVisualizer
                rootNote={selectedRoot}
                activeNotes={activeNotes}
                currentPlayingMidi={currentPlayingMidi}
                displayMode={displayMode}
                octavesCount={3}
                startOctave={3}
              />
            </div>
          )}

          {activeTab === 'fretboard' && (
            <div className="space-y-4">
              {/* Fretboard Configuration Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-medium">Tuning / Instrument:</span>
                  <select
                    value={selectedTuningId}
                    onChange={(e) => setSelectedTuningId(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200 font-mono text-xs focus:outline-none focus:border-amber-500"
                  >
                    {TUNINGS.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-medium">Filter:</span>
                  <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                    {(['all', 'roots-only', 'chord-tones'] as const).map((f) => (
                      <button
                        key={`filt-${f}`}
                        onClick={() => setFretboardFilter(f)}
                        className={`px-2.5 py-1 rounded text-[11px] capitalize ${
                          fretboardFilter === f
                            ? 'bg-slate-800 text-white font-bold'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {f.replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-medium">Frets:</span>
                  <select
                    value={fretCount}
                    onChange={(e) => setFretCount(parseInt(e.target.value, 10))}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200 font-mono text-xs"
                  >
                    <option value={12}>12 Frets (1 Octave)</option>
                    <option value={15}>15 Frets (Standard)</option>
                    <option value={18}>18 Frets</option>
                    <option value={24}>24 Frets (Full Shred)</option>
                  </select>
                </div>
              </div>

              <FretboardVisualizer
                rootNote={selectedRoot}
                activeNotes={activeNotes}
                tuning={activeTuning}
                displayMode={displayMode === 'solfege' ? 'intervals' : displayMode}
                fretCount={fretCount}
                highlightFilter={fretboardFilter}
              />
            </div>
          )}

          {activeTab === 'circle' && (
            <CircleOfFifthsVisualizer
              selectedKey={selectedRoot}
              onSelectKey={(newKey) => setSelectedRoot(newKey)}
            />
          )}

          {activeTab === 'staff' && (
            <StaffNotationVisualizer
              rootNote={selectedRoot}
              notes={activeNotes}
            />
          )}

          {activeTab === 'progressions' && (
            <ChordProgressionBuilder
              currentKey={selectedRoot}
            />
          )}
        </div>

        {/* Detailed Music Theory Analysis Card */}
        <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl backdrop-blur-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-white">
                  {selectedRoot}{' '}
                  {modeType === 'scale' ? activeScale.name : activeChord.name}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                  {modeType === 'scale' ? activeScale.category : activeChord.category}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {modeType === 'scale' ? activeScale.description : activeChord.description}
              </p>
            </div>

            {/* Scale Formula or Chord Tones */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">
                {modeType === 'scale' ? 'Step Formula' : 'Chord Formula'}
              </div>
              <div className="text-amber-400 font-bold">
                {modeType === 'scale'
                  ? activeScale.formula
                  : activeChord.intervalNames.join(' - ')}
              </div>
            </div>
          </div>

          {/* Notes breakdown list */}
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Harmonic Structure &amp; Intervals ({activeNotes.length} notes):
            </div>
            <div className="flex flex-wrap gap-2.5">
              {activeNotes.map((n, idx) => (
                <div
                  key={`breakdown-${idx}-${n.note}`}
                  className="px-3.5 py-2 bg-slate-950/80 rounded-xl border border-slate-800/80 flex items-center gap-3"
                >
                  <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center font-bold text-sm text-white font-mono">
                    {n.note}
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-amber-400 font-mono">
                      {n.interval}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      +{n.semitones} semitones
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 px-4 py-6 text-center text-xs text-slate-500">
        <p className="max-w-md mx-auto">
          Harmonia Music Theory Visualizer Studio • Powered by Web Audio API &amp; Google Gemini AI (gemini-3-pro-image-preview &amp; gemini-4-argon / gemini-3.8-flash).
        </p>
      </footer>

      {/* AI Image Generation Modal */}
      <AiImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        currentRoot={selectedRoot}
        currentScaleOrChordName={modeType === 'scale' ? activeScale.name : activeChord.name}
      />

      {/* Gemini Chatbot Drawer */}
      <AiChatDrawer
        isOpen={isChatDrawerOpen}
        onClose={() => setIsChatDrawerOpen(false)}
        onApplyTheoryTarget={(type, root, name) => {
          setSelectedRoot(root);
          if (type === 'scale') {
            setModeType('scale');
            const found = SCALES.find((s) => s.name.toLowerCase().includes(name.toLowerCase()));
            if (found) setSelectedScaleId(found.id);
          } else {
            setModeType('chord');
            const found = CHORDS.find((c) => c.name.toLowerCase().includes(name.toLowerCase()));
            if (found) setSelectedChordId(found.id);
          }
        }}
      />
    </div>
  );
}
