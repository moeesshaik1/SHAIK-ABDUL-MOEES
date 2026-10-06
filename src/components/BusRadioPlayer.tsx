import React, { useState, useEffect, useRef } from 'react';
import {
  busRadioEngine,
  RADIO_STATIONS,
  RadioStation,
  RadioTrack,
} from '../audio/BusRadioEngine';
import {
  Radio,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  X,
  Minimize2,
  Maximize2,
  Sparkles,
  Megaphone,
  Music,
  Disc,
} from 'lucide-react';

interface BusRadioPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

export const BusRadioPlayer: React.FC<BusRadioPlayerProps> = ({
  isOpen,
  onClose,
  isMinimized = false,
  onToggleMinimize,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(busRadioEngine.getIsPlaying());
  const [currentTrack, setCurrentTrack] = useState<RadioTrack>(busRadioEngine.getCurrentTrack());
  const [currentStation, setCurrentStation] = useState<RadioStation>(busRadioEngine.getCurrentStation());
  const [volume, setVolume] = useState<number>(busRadioEngine.getVolume());
  const [visualizerBars, setVisualizerBars] = useState<number[]>([12, 24, 18, 30, 15, 28, 20, 35, 14, 22, 18, 25]);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const unsubTrack = busRadioEngine.subscribeTrackChange((t) => {
      setCurrentTrack(t);
      setCurrentStation(busRadioEngine.getCurrentStation());
    });
    const unsubPlay = busRadioEngine.subscribePlayState((p) => {
      setIsPlaying(p);
    });

    return () => {
      unsubTrack();
      unsubPlay();
    };
  }, []);

  // Equalizer visualizer animation loop
  useEffect(() => {
    let active = true;

    const updateVisualizer = () => {
      if (!active) return;
      if (isPlaying) {
        const data = busRadioEngine.getVisualizerData();
        const bars: number[] = [];
        const step = Math.max(1, Math.floor(data.length / 12));
        for (let i = 0; i < 12; i++) {
          const val = data[i * step] || Math.floor(Math.random() * 30 + 10);
          bars.push(Math.max(10, Math.min(100, Math.round((val / 255) * 100))));
        }
        setVisualizerBars(bars);
      } else {
        setVisualizerBars([8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8]);
      }
      animationFrameRef.current = requestAnimationFrame(updateVisualizer);
    };

    animationFrameRef.current = requestAnimationFrame(updateVisualizer);

    return () => {
      active = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  const handlePlayToggle = () => {
    busRadioEngine.togglePlay();
  };

  const handleStationSelect = (stationId: string) => {
    busRadioEngine.selectStation(stationId);
  };

  const handleNextTrack = () => {
    busRadioEngine.nextTrack();
  };

  const handlePrevTrack = () => {
    busRadioEngine.prevTrack();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    busRadioEngine.setVolume(newVol);
  };

  if (!isOpen) return null;

  // Compact floating pill mode (minimized during driving)
  if (isMinimized) {
    return (
      <div className="fixed bottom-24 right-4 z-40 bg-slate-900/95 backdrop-blur-md border border-amber-500/80 rounded-2xl p-2.5 shadow-2xl flex items-center gap-3 text-white pointer-events-auto select-none animate-fadeIn">
        <button
          onClick={handlePlayToggle}
          className={`p-2.5 rounded-xl border transition active:scale-95 ${
            isPlaying
              ? 'bg-amber-600 border-amber-400 text-white'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
          }`}
          title={isPlaying ? 'Pause Cabin Radio' : 'Play Cabin Radio'}
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
        </button>

        <div className="cursor-pointer max-w-[200px]" onClick={onToggleMinimize}>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] bg-red-700 font-bold px-1.5 py-0.2 rounded text-white tracking-wider">
              {currentStation.frequency}
            </span>
            <span className="text-xs font-bold text-amber-300 truncate">
              {currentStation.teluguName}
            </span>
          </div>
          <div className="text-[11px] text-slate-300 font-medium truncate">
            {currentTrack.titleTelugu}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleNextTrack}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
            title="Next Track"
          >
            <SkipForward size={16} />
          </button>
          {onToggleMinimize && (
            <button
              onClick={onToggleMinimize}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
              title="Expand Radio Deck"
            >
              <Maximize2 size={16} />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Full Indian Bus Dashboard Audio Deck
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-4 border-slate-700 rounded-3xl max-w-xl w-full p-5 text-white shadow-2xl relative select-none">
        {/* Retro Deck Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="bg-gradient-to-tr from-amber-600 to-red-600 p-2 rounded-xl text-white shadow-md">
              <Radio size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black bg-red-700 px-2 py-0.5 rounded text-white tracking-widest uppercase">
                  APSRTC
                </span>
                <h2 className="text-sm font-black text-amber-400 uppercase tracking-wide">
                  Cabin Sound Master & Radio Player
                </h2>
              </div>
              <p className="text-[11px] text-slate-400">
                రాయలసీమ పల్లె పాటలు • ఆకాశవాణి వార్తలు • బస్ స్టాండ్ అనౌన్స్‌మెంట్స్
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {onToggleMinimize && (
              <button
                onClick={onToggleMinimize}
                className="p-1.5 hover:bg-slate-800 rounded-xl transition text-slate-400 hover:text-white"
                title="Minimize Player"
              >
                <Minimize2 size={18} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-800 rounded-xl transition text-slate-400 hover:text-white"
              title="Close Radio"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Retro Fluorescent LCD Display */}
        <div className="bg-slate-950 border-2 border-emerald-500/40 rounded-2xl p-4 my-4 font-mono shadow-inner relative overflow-hidden">
          {/* Subtle grid background */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          {/* Top Frequency & Station Header */}
          <div className="flex items-center justify-between text-xs text-emerald-400 pb-2 border-b border-emerald-950">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-950 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-800">
                {currentStation.frequency}
              </span>
              <span className="font-bold text-amber-300 font-sans">{currentStation.teluguName}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-sans">
              <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
              <span>{isPlaying ? 'ON AIR' : 'STANDBY'}</span>
            </div>
          </div>

          {/* Now Playing Title & Description */}
          <div className="my-3 font-sans">
            <div className="text-sm md:text-base font-black text-amber-300 tracking-wide">
              {currentTrack.titleTelugu}
            </div>
            <div className="text-xs text-slate-300 font-medium mt-0.5">
              {currentTrack.title}
            </div>
            <div className="text-[11px] text-emerald-400/90 font-mono mt-1">
              ARTIST: {currentTrack.artist} • [{currentTrack.category.toUpperCase()}]
            </div>
          </div>

          {/* Equalizer Visualizer Spectrum */}
          <div className="flex items-end justify-between h-10 gap-1.5 pt-2 border-t border-emerald-950/80">
            {visualizerBars.map((h, idx) => (
              <div
                key={idx}
                className="flex-1 bg-gradient-to-t from-emerald-600 via-amber-400 to-red-500 rounded-t-sm transition-all duration-75"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>

        {/* Station Presets Selector Buttons */}
        <div className="my-3">
          <div className="text-[11px] font-bold text-slate-400 uppercase mb-2 flex items-center justify-between">
            <span>Select Radio Station / ఛానల్ ఎంపిక</span>
            <span className="text-amber-400 font-mono">4 PRESETS</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {RADIO_STATIONS.map((station) => {
              const isSelected = station.id === currentStation.id;
              return (
                <button
                  key={station.id}
                  onClick={() => handleStationSelect(station.id)}
                  className={`p-2.5 rounded-xl border text-left transition active:scale-95 flex items-center justify-between ${
                    isSelected
                      ? 'bg-slate-800 border-amber-400 shadow-md ring-1 ring-amber-400/50'
                      : 'bg-slate-900/80 border-slate-700/80 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <div className="truncate">
                    <div className="text-xs font-bold text-amber-300 truncate">
                      {station.teluguName}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {station.name}
                    </div>
                  </div>
                  <span className="text-[10px] bg-slate-800 text-cyan-300 font-mono px-1.5 py-0.5 rounded border border-slate-700 ml-2 whitespace-nowrap">
                    {station.frequency}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Player Transport Controls & Volume */}
        <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 my-3 flex flex-wrap items-center justify-between gap-4">
          {/* Skip Prev, Play/Pause, Skip Next */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevTrack}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-200 transition active:scale-95 border border-slate-700"
              title="Previous Track"
            >
              <SkipBack size={18} />
            </button>

            <button
              onClick={handlePlayToggle}
              className={`p-3.5 rounded-2xl font-black text-white transition active:scale-95 shadow-xl flex items-center justify-center ${
                isPlaying
                  ? 'bg-amber-600 hover:bg-amber-500 border-2 border-yellow-300'
                  : 'bg-emerald-600 hover:bg-emerald-500 border-2 border-emerald-400'
              }`}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={22} /> : <Play size={22} fill="currentColor" />}
            </button>

            <button
              onClick={handleNextTrack}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-200 transition active:scale-95 border border-slate-700"
              title="Next Track"
            >
              <SkipForward size={18} />
            </button>
          </div>

          {/* Cabin Music Volume Slider */}
          <div className="flex items-center gap-2 flex-1 max-w-[200px]">
            <button
              onClick={() => {
                const newVol = volume > 0 ? 0 : 0.65;
                setVolume(newVol);
                busRadioEngine.setVolume(newVol);
              }}
              className="text-slate-400 hover:text-white"
            >
              {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <span className="text-[11px] font-mono text-slate-400 w-8 text-right">
              {Math.round(volume * 100)}%
            </span>
          </div>
        </div>

        {/* Quick PA Announcement Trigger Button */}
        <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800">
          <button
            onClick={() => {
              busRadioEngine.selectStation('apsrtc_pa');
              if (!isPlaying) busRadioEngine.play();
            }}
            className="bg-red-800/80 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-xl border border-red-600 flex items-center gap-1.5 transition active:scale-95"
          >
            <Megaphone size={14} />
            <span>ప్లే బస్ స్టాండ్ అనౌన్స్‌మెంట్ (Play Official PA)</span>
          </button>

          <span className="hidden sm:inline text-[11px] text-slate-500">
            APSRTC Cabin Sound System
          </span>
        </div>
      </div>
    </div>
  );
};
