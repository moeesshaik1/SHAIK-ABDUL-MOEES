import React from 'react';
import { RoutePoint, TrafficVehicleData } from '../types/game';
import { MapPin, Navigation } from 'lucide-react';

interface MinimapProps {
  playerZ: number;
  routePoints: RoutePoint[];
  traffic: TrafficVehicleData[];
}

export const Minimap: React.FC<MinimapProps> = ({ playerZ, routePoints, traffic }) => {
  // Map total distance is ~3200m
  const maxZ = 3300;
  const safePlayerZ = Number.isFinite(playerZ) ? playerZ : 0;
  const progressRatio = Math.max(0, Math.min(1, safePlayerZ / maxZ));
  const progressPercent = Number.isFinite(progressRatio) ? (progressRatio * 100).toFixed(0) : '0';

  return (
    <div className="absolute top-16 right-3 pointer-events-auto bg-slate-950/85 backdrop-blur-md border border-slate-700/80 rounded-2xl p-2.5 shadow-2xl text-white w-44">
      <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 border-b border-slate-800 pb-1.5 mb-2">
        <span className="flex items-center gap-1 text-emerald-400">
          <Navigation size={12} />
          GPS Route
        </span>
        <span className="font-mono text-cyan-300">{progressPercent}%</span>
      </div>

      {/* Vertical Route Corridor */}
      <div className="relative h-44 bg-slate-900 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
        {/* Road Track Line */}
        <div className="absolute w-2 h-full bg-slate-800 rounded-full" />
        <div
          className="absolute w-2 bg-gradient-to-t from-red-600 via-amber-500 to-emerald-500 bottom-0 rounded-full transition-all"
          style={{ height: `${progressRatio * 100}%` }}
        />

        {/* Milestone Station Markers */}
        {routePoints.map((pt) => {
          const ptRatio = Math.max(0, Math.min(1, pt.worldZ / maxZ));
          return (
            <div
              key={pt.id}
              className="absolute left-1/2 -translate-x-1/2 flex items-center group cursor-pointer"
              style={{ bottom: `${ptRatio * 92 + 4}%` }}
              title={`${pt.name} (${pt.teluguName})`}
            >
              <div
                className={`w-2 h-2 rounded-full border border-slate-950 ${
                  pt.type === 'busStand' || pt.type === 'terminal'
                    ? 'bg-amber-400 w-2.5 h-2.5 ring-2 ring-amber-500/50'
                    : pt.type === 'tollPlaza'
                    ? 'bg-red-400'
                    : 'bg-slate-400'
                }`}
              />
              <span className="hidden group-hover:block absolute left-4 bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded text-[9px] whitespace-nowrap z-30 font-semibold">
                {pt.name}
              </span>
            </div>
          );
        })}

        {/* Traffic Dots near player */}
        {traffic.map((t) => {
          const tRatio = Math.max(0, Math.min(1, t.z / maxZ));
          return (
            <div
              key={t.id}
              className="absolute w-1.5 h-1.5 rounded-full bg-amber-400"
              style={{
                bottom: `${tRatio * 92 + 4}%`,
                left: t.direction === 1 ? '40%' : '60%',
              }}
            />
          );
        })}

        {/* Player Bus Marker */}
        <div
          className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center transition-all duration-75"
          style={{ bottom: `${progressRatio * 92 + 4}%` }}
        >
          <div className="w-3.5 h-3.5 bg-red-600 border-2 border-white rounded-full shadow-lg shadow-red-500/80 animate-pulse" />
        </div>
      </div>

      <div className="text-[9px] text-slate-400 text-center mt-1.5">
        KURNOOL ➔ SRISAILAM
      </div>
    </div>
  );
};
