import React from 'react';
import { BusTelemetry, BusCondition, TripState, CameraMode } from '../types/game';
import {
  Gauge,
  Fuel,
  Volume2,
  VolumeX,
  Camera,
  DoorClosed,
  DoorOpen,
  CloudRain,
  Sun,
  ShieldCheck,
  Disc,
  Ticket as TicketIcon,
  Wrench,
  Sparkles,
  Radio as RadioIcon,
} from 'lucide-react';

interface HUDProps {
  telemetry: BusTelemetry;
  condition: BusCondition;
  trip: TripState;
  cameraMode: CameraMode;
  isMuted: boolean;
  nearFacility: 'fuel' | 'wash' | 'service' | 'toll' | 'busStand' | null;
  onToggleSound: () => void;
  onToggleCamera: () => void;
  onToggleDoors: () => void;
  onToggleLights: () => void;
  onToggleWipers: () => void;
  onToggleHorn: () => void;
  onToggleTransmission: () => void;
  onShiftGear: (gear: number) => void;
  onOpenTickets: () => void;
  onOpenRadio?: () => void;
  isRadioPlaying?: boolean;
  onOpenFacilityModal: () => void;
  onThrottleStart: () => void;
  onThrottleEnd: () => void;
  onBrakeStart: () => void;
  onBrakeEnd: () => void;
  onSteer: (dir: number) => void;
}

export const HUD: React.FC<HUDProps> = ({
  telemetry,
  condition,
  trip,
  cameraMode,
  isMuted,
  nearFacility,
  onToggleSound,
  onToggleCamera,
  onToggleDoors,
  onToggleLights,
  onToggleWipers,
  onToggleHorn,
  onToggleTransmission,
  onShiftGear,
  onOpenTickets,
  onOpenRadio,
  isRadioPlaying = false,
  onOpenFacilityModal,
  onThrottleStart,
  onThrottleEnd,
  onBrakeStart,
  onBrakeEnd,
  onSteer,
}) => {
  // Safe numbers with fallback
  const speed = Number.isFinite(telemetry?.speedKmh) ? Math.max(0, telemetry.speedKmh) : 0;
  const speedNormalized = Math.min(1, Math.max(0, speed / 120));
  const speedNeedleDeg = -130 + speedNormalized * 260;

  const rpm = Number.isFinite(telemetry?.rpm) ? Math.max(0, telemetry.rpm) : 750;
  const rpmNormalized = Math.min(1, Math.max(0, rpm / 2600));
  const rpmNeedleDeg = -130 + rpmNormalized * 260;

  const airBar = Number.isFinite(telemetry?.airPressureBar) ? telemetry.airPressureBar : 8.5;
  const dieselPct = Number.isFinite(telemetry?.fuelPercent) ? telemetry.fuelPercent : 88;

  const engHealth = Number.isFinite(condition?.engine) ? condition.engine : 100;
  const brkHealth = Number.isFinite(condition?.brakes) ? condition.brakes : 100;
  const tyrHealth = Number.isFinite(condition?.tyres) ? condition.tyres : 100;
  const clnHealth = Number.isFinite(condition?.cleanliness) ? condition.cleanliness : 100;

  const passengersCount = Number.isFinite(trip?.passengersOnboard) ? trip.passengersOnboard : 0;
  const nextDistance = Number.isFinite(trip?.nextStopDistanceKm) ? trip.nextStopDistanceKm : 0;
  const drivingScore = Number.isFinite(trip?.drivingScore) ? Math.round(trip.drivingScore) : 100;
  const totalFares = Number.isFinite(trip?.totalFareCollected) ? trip.totalFareCollected : 0;

  const gearDisplay =
    telemetry.gear === -1 ? 'R' : telemetry.gear === 0 ? 'N' : `G${telemetry.gear}`;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 select-none text-white">
      {/* 1. TOP HEADER & ROUTE BANNER */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* APSRTC Route Badge */}
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl px-4 py-2 pointer-events-auto flex items-center gap-3 shadow-2xl">
          <div className="bg-red-700 text-white font-black text-xs px-2.5 py-1 rounded tracking-widest uppercase border border-red-500">
            APSRTC
          </div>
          <div>
            <div className="text-amber-300 font-bold text-sm tracking-wide flex items-center gap-2">
              <span>కర్నూలు ➔ నంద్యాల ➔ శ్రీశైలం</span>
            </div>
            <div className="text-xs text-slate-300 font-semibold">
              KURNOOL ➔ NANDYAL ➔ SRISAILAM EXPRESS
            </div>
          </div>
        </div>

        {/* Current Location & Next Destination */}
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl px-4 py-2 pointer-events-auto flex items-center gap-4 shadow-2xl text-right">
          <div>
            <div className="text-xs text-slate-400 font-medium uppercase">Current Location</div>
            <div className="text-sm font-bold text-emerald-400">{trip.currentTeluguName}</div>
            <div className="text-xs text-slate-300">{trip.currentLocationName}</div>
          </div>
          <div className="border-l border-slate-700 pl-3">
            <div className="text-xs text-slate-400 font-medium uppercase">Next Stop</div>
            <div className="text-sm font-bold text-amber-400">{trip.nextStopName}</div>
            <div className="text-xs text-cyan-300 font-mono">{nextDistance.toFixed(1)} KM</div>
          </div>
        </div>

        {/* Top Control Utility Buttons */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {onOpenRadio && (
            <button
              onClick={onOpenRadio}
              className={`px-3 py-2 rounded-xl flex items-center gap-1.5 text-xs font-bold shadow-lg border transition active:scale-95 ${
                isRadioPlaying
                  ? 'bg-emerald-600 hover:bg-emerald-500 border-emerald-400 text-white animate-pulse'
                  : 'bg-slate-800/90 hover:bg-slate-700 border-slate-600 text-amber-300'
              }`}
              title="Cabin Radio, Folk Music & News (R)"
            >
              <RadioIcon size={16} />
              <span>RADIO {isRadioPlaying ? '▶ ON' : ''}</span>
            </button>
          )}

          <button
            onClick={onOpenTickets}
            className="bg-amber-600 hover:bg-amber-500 active:scale-95 transition px-3 py-2 rounded-xl flex items-center gap-1.5 text-xs font-bold shadow-lg border border-amber-400"
            title="Conductor Electronic Ticket Machine"
          >
            <TicketIcon size={16} />
            <span>ETIM ({passengersCount}/52)</span>
          </button>

          <button
            onClick={onToggleCamera}
            className="bg-slate-800/90 hover:bg-slate-700 active:scale-95 transition px-3 py-2 rounded-xl flex items-center gap-1.5 text-xs font-semibold border border-slate-600 shadow-md"
            title="Switch Camera (C)"
          >
            <Camera size={16} />
            <span className="capitalize">{cameraMode === 'thirdPerson' ? 'Chase' : cameraMode === 'cockpit' ? 'Driver Cabin' : 'Bumper'}</span>
          </button>

          <button
            onClick={onToggleSound}
            className="bg-slate-800/90 hover:bg-slate-700 active:scale-95 transition p-2.5 rounded-xl border border-slate-600 shadow-md"
            title="Mute/Unmute Audio (M)"
          >
            {isMuted ? <VolumeX size={16} className="text-red-400" /> : <Volume2 size={16} className="text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* 2. INTERACTIVE NEAR FACILITY PROMPT */}
      {nearFacility && (
        <div className="self-center pointer-events-auto animate-bounce">
          <button
            onClick={onOpenFacilityModal}
            className="bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white font-extrabold px-6 py-3 rounded-2xl shadow-2xl border-2 border-yellow-300 flex items-center gap-3 text-base tracking-wide"
          >
            {nearFacility === 'fuel' && <Fuel size={22} className="text-yellow-200" />}
            {nearFacility === 'wash' && <Sparkles size={22} className="text-cyan-200" />}
            {nearFacility === 'service' && <Wrench size={22} className="text-orange-200" />}
            {nearFacility === 'toll' && <Disc size={22} className="text-emerald-200" />}
            {nearFacility === 'busStand' && <DoorOpen size={22} className="text-emerald-200" />}
            <span>
              {nearFacility === 'fuel' && 'REFUEL DIESEL [ENTER/CLICK]'}
              {nearFacility === 'wash' && 'AUTOMATIC BUS WASH [ENTER/CLICK]'}
              {nearFacility === 'service' && 'DEPOT SERVICE BAY [ENTER/CLICK]'}
              {nearFacility === 'toll' && 'PAY FASTag TOLL ₹110 [ENTER/CLICK]'}
              {nearFacility === 'busStand' && 'BOARD & ALIGHT PASSENGERS [CLICK]'}
            </span>
          </button>
        </div>
      )}

      {/* Warning Banners */}
      <div className="self-center flex flex-col items-center gap-1">
        {telemetry.doorsOpen && (
          <div className="bg-red-600/95 text-white font-black px-4 py-1.5 rounded-lg border border-red-300 shadow-xl flex items-center gap-2 text-xs tracking-wider animate-pulse">
            <DoorOpen size={16} />
            <span>DOORS OPEN — ACCELERATION LOCKED</span>
          </div>
        )}
        {telemetry.airPressureBar < 4.5 && (
          <div className="bg-amber-600/95 text-white font-black px-4 py-1.5 rounded-lg border border-amber-300 shadow-xl flex items-center gap-2 text-xs tracking-wider animate-pulse">
            <Disc size={16} />
            <span>LOW AIR PRESSURE — PUMPING COMPRESSOR</span>
          </div>
        )}
      </div>

      {/* 3. BOTTOM DASHBOARD & INSTRUMENT CLUSTER */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
        {/* Left Side: Vehicle Health & Trip Profit */}
        <div className="hidden md:flex flex-col gap-2 md:col-span-3 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-3.5 shadow-2xl pointer-events-auto">
          <div className="text-xs font-bold text-slate-300 uppercase flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-400" />
              Bus Condition
            </span>
            <span className="text-amber-400 font-mono">Score: {drivingScore}/100</span>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Engine Health</span>
              <span className="font-semibold text-emerald-400">{engHealth.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${engHealth}%` }} />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Air Brakes</span>
              <span className="font-semibold text-cyan-400">{brkHealth.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${brkHealth}%` }} />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Tyres Condition</span>
              <span className="font-semibold text-amber-400">{tyrHealth.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: `${tyrHealth}%` }} />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Cleanliness</span>
              <span className="font-semibold text-blue-400">{clnHealth.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full rounded-full" style={{ width: `${clnHealth}%` }} />
            </div>
          </div>

          <div className="mt-1 pt-1.5 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Fare Revenue:</span>
            <span className="font-bold text-emerald-400 font-mono">₹{totalFares}</span>
          </div>
        </div>

        {/* Center: Indian Bus Gauge Cluster */}
        <div className="col-span-12 md:col-span-6 flex flex-col items-center gap-2">
          {/* Main Cluster Container */}
          <div className="bg-gradient-to-t from-slate-950 via-slate-900 to-slate-900/95 border-2 border-slate-700/80 rounded-3xl p-3 shadow-2xl flex items-center justify-around gap-4 w-full max-w-lg pointer-events-auto">
            {/* Speedometer Dial */}
            <div className="relative w-28 h-28 flex flex-col items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Dial track */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#334155"
                  strokeWidth="8"
                  strokeDasharray="180 300"
                  strokeLinecap="round"
                />
                {/* Active speed arc */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="8"
                  strokeDasharray={`${speedNormalized * 180} 300`}
                  strokeLinecap="round"
                />
              </svg>
              {/* Speed Needle */}
              <div
                className="absolute w-1 h-12 bg-red-500 origin-bottom rounded-full transition-transform duration-75"
                style={{
                  bottom: '50%',
                  transform: `rotate(${speedNeedleDeg}deg)`,
                }}
              />
              <div className="absolute w-3 h-3 bg-white rounded-full shadow border-2 border-red-600" />
              {/* Digital Readout */}
              <div className="absolute bottom-2 flex flex-col items-center">
                <span className="text-lg font-black font-mono tracking-tight leading-none text-white">
                  {Math.round(speed)}
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase">KM/H</span>
              </div>
            </div>

            {/* Center Status Indicators */}
            <div className="flex flex-col items-center gap-1.5 py-1">
              {/* Gear Display */}
              <div className="bg-slate-800/90 border border-slate-600 px-3 py-1 rounded-xl flex items-center gap-2">
                <span className="text-xl font-black font-mono text-amber-400">{gearDisplay}</span>
                <button
                  onClick={onToggleTransmission}
                  className="text-[10px] bg-slate-700 hover:bg-slate-600 px-1.5 py-0.5 rounded font-bold text-slate-300"
                >
                  {telemetry.automaticTransmission ? 'AUTO' : 'MANUAL'}
                </button>
              </div>

              {/* Indicator Lamps */}
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full border border-amber-500 transition ${
                    telemetry.leftIndicator ? 'bg-amber-400 shadow-lg shadow-amber-500' : 'bg-slate-800'
                  }`}
                  title="Left Indicator"
                />
                <div
                  className={`w-3 h-3 rounded-full border border-blue-500 transition ${
                    telemetry.headlights ? 'bg-cyan-400 shadow-lg shadow-cyan-500' : 'bg-slate-800'
                  }`}
                  title="Headlights"
                />
                <div
                  className={`w-3 h-3 rounded-full border border-amber-500 transition ${
                    telemetry.rightIndicator ? 'bg-amber-400 shadow-lg shadow-amber-500' : 'bg-slate-800'
                  }`}
                  title="Right Indicator"
                />
              </div>

              {/* Air Pressure & Temp */}
              <div className="grid grid-cols-2 gap-2 text-[10px] text-center font-mono w-full">
                <div className="bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700">
                  <div className="text-slate-400">AIR</div>
                  <div className={`font-bold ${airBar < 4.5 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {airBar.toFixed(1)} BAR
                  </div>
                </div>
                <div className="bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700">
                  <div className="text-slate-400">DIESEL</div>
                  <div className="font-bold text-amber-400">{dieselPct.toFixed(0)}%</div>
                </div>
              </div>
            </div>

            {/* Tachometer RPM Dial */}
            <div className="relative w-28 h-28 flex flex-col items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#334155"
                  strokeWidth="8"
                  strokeDasharray="180 300"
                  strokeLinecap="round"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="8"
                  strokeDasharray={`${rpmNormalized * 180} 300`}
                  strokeLinecap="round"
                />
              </svg>
              <div
                className="absolute w-1 h-12 bg-amber-400 origin-bottom rounded-full transition-transform duration-75"
                style={{
                  bottom: '50%',
                  transform: `rotate(${rpmNeedleDeg}deg)`,
                }}
              />
              <div className="absolute w-3 h-3 bg-white rounded-full shadow border-2 border-amber-600" />
              <div className="absolute bottom-2 flex flex-col items-center">
                <span className="text-base font-black font-mono tracking-tight leading-none text-white">
                  {Math.round(rpm)}
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase">RPM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Driving Control Keys & Toggles */}
        <div className="col-span-12 md:col-span-3 flex flex-wrap md:flex-col gap-2 justify-end pointer-events-auto">
          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-2.5 shadow-2xl flex items-center justify-around gap-2 w-full">
            <button
              onClick={onToggleDoors}
              className={`p-2.5 rounded-xl border flex flex-col items-center gap-0.5 text-[10px] font-bold transition active:scale-95 ${
                telemetry.doorsOpen
                  ? 'bg-red-600 border-red-400 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
              title="Toggle Doors (E)"
            >
              {telemetry.doorsOpen ? <DoorOpen size={18} /> : <DoorClosed size={18} />}
              <span>DOORS (E)</span>
            </button>

            <button
              onClick={onToggleLights}
              className={`p-2.5 rounded-xl border flex flex-col items-center gap-0.5 text-[10px] font-bold transition active:scale-95 ${
                telemetry.headlights
                  ? 'bg-amber-600 border-amber-400 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
              title="Toggle Headlights (L)"
            >
              <Sun size={18} />
              <span>LIGHTS (L)</span>
            </button>

            <button
              onMouseDown={onToggleHorn}
              className="p-2.5 rounded-xl border bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 active:scale-95 flex flex-col items-center gap-0.5 text-[10px] font-bold transition"
              title="Indian Dual Tone Horn (H)"
            >
              <Volume2 size={18} />
              <span>HORN (H)</span>
            </button>

            <button
              onClick={onToggleWipers}
              className={`p-2.5 rounded-xl border flex flex-col items-center gap-0.5 text-[10px] font-bold transition active:scale-95 ${
                telemetry.wipersActive
                  ? 'bg-cyan-600 border-cyan-400 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
              title="Toggle Windshield Wipers"
            >
              <CloudRain size={18} />
              <span>WIPERS</span>
            </button>
          </div>

          {/* On-screen Drive Controls for touch/mouse */}
          <div className="flex md:hidden w-full gap-2 justify-between">
            <div className="flex gap-1">
              <button
                onMouseDown={() => onSteer(-1)}
                onMouseUp={() => onSteer(0)}
                onTouchStart={() => onSteer(-1)}
                onTouchEnd={() => onSteer(0)}
                className="bg-slate-800 border border-slate-600 px-4 py-3 rounded-xl font-black text-sm active:bg-slate-700"
              >
                ◀ LEFT
              </button>
              <button
                onMouseDown={() => onSteer(1)}
                onMouseUp={() => onSteer(0)}
                onTouchStart={() => onSteer(1)}
                onTouchEnd={() => onSteer(0)}
                className="bg-slate-800 border border-slate-600 px-4 py-3 rounded-xl font-black text-sm active:bg-slate-700"
              >
                RIGHT ▶
              </button>
            </div>
            <div className="flex gap-1">
              <button
                onMouseDown={onBrakeStart}
                onMouseUp={onBrakeEnd}
                onTouchStart={onBrakeStart}
                onTouchEnd={onBrakeEnd}
                className="bg-red-700 border border-red-500 px-4 py-3 rounded-xl font-black text-sm active:bg-red-600"
              >
                BRAKE
              </button>
              <button
                onMouseDown={onThrottleStart}
                onMouseUp={onThrottleEnd}
                onTouchStart={onThrottleStart}
                onTouchEnd={onThrottleEnd}
                className="bg-emerald-700 border border-emerald-500 px-5 py-3 rounded-xl font-black text-sm active:bg-emerald-600"
              >
                ACCEL
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
