import React from 'react';
import { WeatherType, TimeOfDay } from '../types/game';
import { Play, Settings, Compass, Sun, Moon, CloudRain, Shield, Info, Volume2 } from 'lucide-react';

interface MainMenuProps {
  weather: WeatherType;
  timeOfDay: TimeOfDay;
  onSetWeather: (w: WeatherType) => void;
  onSetTimeOfDay: (t: TimeOfDay) => void;
  onStartGame: () => void;
  isOpen: boolean;
  onClose?: () => void;
  isGameRunning?: boolean;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  weather,
  timeOfDay,
  onSetWeather,
  onSetTimeOfDay,
  onStartGame,
  isOpen,
  onClose,
  isGameRunning = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-red-700/80 rounded-3xl max-w-2xl w-full p-6 text-white shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Banner */}
        <div className="text-center pb-5 border-b border-slate-800">
          <div className="inline-block bg-red-700 text-white font-black text-xs px-4 py-1.5 rounded-full tracking-widest uppercase mb-2 shadow border border-red-500">
            ANDHRA PRADESH STATE ROAD TRANSPORT CORPORATION
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-amber-400 tracking-tight">
            AP RTC BUS SIMULATOR
          </h1>
          <p className="text-xs text-slate-300 font-semibold mt-1">
            ఆంధ్రప్రదేశ్ ఆర్టీసీ బస్సు సిమ్యులేటర్ • KURNOOL ➔ NANDYAL ➔ SRISAILAM GHAT
          </p>
        </div>

        {/* Selected Route Info */}
        <div className="bg-gradient-to-r from-red-950/60 to-slate-900 p-4 rounded-2xl border border-red-800/60 my-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-red-700 p-2.5 rounded-xl text-white">
              <Compass size={24} />
            </div>
            <div>
              <div className="text-xs text-red-300 font-bold uppercase">Official Route</div>
              <div className="text-base font-black text-amber-300">
                కర్నూలు డిపో ➔ నంద్యాల ➔ శ్రీశైలం ఘాట్
              </div>
              <div className="text-xs text-slate-300">154 KM • High-Torque Ghat Heavy Bus Service</div>
            </div>
          </div>
          <div className="hidden sm:block text-right">
            <span className="text-[10px] bg-emerald-600/90 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider text-white">
              VERIFIED RTC LIVERY
            </span>
          </div>
        </div>

        {/* Environment & Weather Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
          {/* Time of Day */}
          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
            <div className="text-xs font-bold text-slate-300 uppercase mb-2.5 flex items-center gap-1.5">
              <Sun size={15} className="text-amber-400" />
              Time of Day
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {(['morning', 'day', 'evening', 'night'] as TimeOfDay[]).map((t) => (
                <button
                  key={t}
                  onClick={() => onSetTimeOfDay(t)}
                  className={`py-2 px-3 rounded-xl font-bold capitalize transition border ${
                    timeOfDay === t
                      ? 'bg-amber-600 border-amber-400 text-white shadow-md'
                      : 'bg-slate-700/60 border-slate-600 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Weather */}
          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
            <div className="text-xs font-bold text-slate-300 uppercase mb-2.5 flex items-center gap-1.5">
              <CloudRain size={15} className="text-cyan-400" />
              Atmospheric Weather
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {(['clear', 'cloudy', 'rain', 'fog'] as WeatherType[]).map((w) => (
                <button
                  key={w}
                  onClick={() => onSetWeather(w)}
                  className={`py-2 px-3 rounded-xl font-bold capitalize transition border ${
                    weather === w
                      ? 'bg-cyan-600 border-cyan-400 text-white shadow-md'
                      : 'bg-slate-700/60 border-slate-600 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Keyboard Controls Guide */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 my-4">
          <div className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-1.5">
            <Info size={14} className="text-amber-400" />
            Controls & Driving Instructions
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-300 font-mono">
            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
              <span className="text-amber-400 font-bold">W / ↑</span> : Accelerate
            </div>
            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
              <span className="text-amber-400 font-bold">S / ↓</span> : Brake / Reverse
            </div>
            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
              <span className="text-amber-400 font-bold">A / D</span> : Steer Left / Right
            </div>
            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
              <span className="text-amber-400 font-bold">SPACE</span> : Air Handbrake
            </div>
            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
              <span className="text-amber-400 font-bold">E</span> : Passenger Doors
            </div>
            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
              <span className="text-amber-400 font-bold">H</span> : Heavy Horn
            </div>
            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
              <span className="text-amber-400 font-bold">L</span> : Headlights
            </div>
            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
              <span className="text-amber-400 font-bold">C</span> : Switch Camera
            </div>
            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
              <span className="text-amber-400 font-bold">R</span> : Cabin Radio
            </div>
          </div>
        </div>

        {/* Start / Resume Button */}
        <div className="mt-5 flex gap-3">
          <button
            onClick={onStartGame}
            className="flex-1 bg-gradient-to-r from-red-700 via-amber-600 to-amber-500 hover:from-red-600 hover:to-amber-400 text-white font-black py-4 rounded-2xl shadow-2xl transition active:scale-98 flex items-center justify-center gap-2 text-base tracking-wider border-2 border-yellow-300"
          >
            <Play size={20} fill="currentColor" />
            <span>{isGameRunning ? 'RESUME BUS OPERATION' : 'DEPART FROM KURNOOL DEPOT'}</span>
          </button>
          {isGameRunning && onClose && (
            <button
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 px-5 rounded-2xl font-bold text-xs"
            >
              CLOSE MENU
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
