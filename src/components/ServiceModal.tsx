import React, { useState } from 'react';
import { BusCondition } from '../types/game';
import { Wrench, Sparkles, X, Check, Disc, Shield, Gauge } from 'lucide-react';
import { soundManager } from '../audio/SoundManager';

interface ServiceModalProps {
  initialCondition: BusCondition;
  mode: 'wash' | 'service';
  onUpdateCondition: (newCondition: BusCondition, cost: number) => void;
  onClose: () => void;
}

export const ServiceModal: React.FC<ServiceModalProps> = ({
  initialCondition,
  mode,
  onUpdateCondition,
  onClose,
}) => {
  const [condition, setCondition] = useState<BusCondition>({ ...initialCondition });
  const [totalCost, setTotalCost] = useState(0);
  const [isWashing, setIsWashing] = useState(false);

  const handleWash = () => {
    setIsWashing(true);
    soundManager.playWashSound();
    setTimeout(() => {
      setCondition((prev) => ({ ...prev, cleanliness: 100 }));
      setTotalCost((prev) => prev + 150);
      setIsWashing(false);
    }, 1800);
  };

  const handleRepair = (part: keyof BusCondition, cost: number) => {
    setCondition((prev) => ({ ...prev, [part]: 100 }));
    setTotalCost((prev) => prev + cost);
    soundManager.playDoorSound(false);
  };

  const handleSave = () => {
    onUpdateCondition(condition, totalCost);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-blue-500/80 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-slate-800 rounded-xl transition text-slate-400 hover:text-white"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="bg-blue-600 text-white p-3 rounded-2xl shadow-lg">
            {mode === 'wash' ? <Sparkles size={28} /> : <Wrench size={28} />}
          </div>
          <div>
            <h2 className="text-lg font-black text-blue-400">
              {mode === 'wash' ? 'APSRTC Automatic Bus Wash Bay' : 'APSRTC Depot Workshop & Service Bay'}
            </h2>
            <p className="text-xs text-slate-400">
              {mode === 'wash'
                ? 'High-Pressure Water Jets & Soap Foam Station'
                : 'Heavy Vehicle Maintenance, Air Brakes & Engine Overhaul'}
            </p>
          </div>
        </div>

        {/* Current Condition Roster */}
        <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-3.5 my-4">
          {/* Cleanliness */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Sparkles size={14} className="text-cyan-400" />
                Bus Exterior Cleanliness
              </span>
              <span className="font-bold text-cyan-400">{condition.cleanliness.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-cyan-500 h-full rounded-full transition-all" style={{ width: `${condition.cleanliness}%` }} />
            </div>
          </div>

          {/* Engine */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Gauge size={14} className="text-emerald-400" />
                Engine & Transmission
              </span>
              <span className="font-bold text-emerald-400">{condition.engine.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${condition.engine}%` }} />
            </div>
          </div>

          {/* Brakes */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Disc size={14} className="text-blue-400" />
                Pneumatic Air Brake Drums
              </span>
              <span className="font-bold text-blue-400">{condition.brakes.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full rounded-full" style={{ width: `${condition.brakes}%` }} />
            </div>
          </div>

          {/* Tyres */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Shield size={14} className="text-amber-400" />
                Radial Tyres & Treads
              </span>
              <span className="font-bold text-amber-400">{condition.tyres.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: `${condition.tyres}%` }} />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          {mode === 'wash' ? (
            <button
              onClick={handleWash}
              disabled={isWashing || condition.cleanliness >= 100}
              className={`w-full py-3 rounded-xl font-black text-sm tracking-wide transition shadow-lg ${
                isWashing
                  ? 'bg-cyan-600 animate-pulse text-white'
                  : condition.cleanliness >= 100
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white active:scale-95'
              }`}
            >
              {isWashing ? 'SPRAYING FOAM & HIGH PRESSURE JETS...' : condition.cleanliness >= 100 ? 'BUS IS 100% CLEAN' : 'START WATER JET BUS WASH (₹150)'}
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => handleRepair('engine', 350)}
                disabled={condition.engine >= 100}
                className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 p-2.5 rounded-xl border border-slate-700 font-bold text-left transition"
              >
                <div>Engine Overhaul</div>
                <div className="text-[10px] text-emerald-400">Restore 100% • ₹350</div>
              </button>

              <button
                onClick={() => handleRepair('brakes', 220)}
                disabled={condition.brakes >= 100}
                className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 p-2.5 rounded-xl border border-slate-700 font-bold text-left transition"
              >
                <div>Air Brake Service</div>
                <div className="text-[10px] text-blue-400">Tune Valves • ₹220</div>
              </button>

              <button
                onClick={() => handleRepair('tyres', 280)}
                disabled={condition.tyres >= 100}
                className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 p-2.5 rounded-xl border border-slate-700 font-bold text-left transition"
              >
                <div>Tyre Rotation & Retread</div>
                <div className="text-[10px] text-amber-400">Restore Grip • ₹280</div>
              </button>

              <button
                onClick={handleWash}
                disabled={isWashing || condition.cleanliness >= 100}
                className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 p-2.5 rounded-xl border border-slate-700 font-bold text-left transition"
              >
                <div>Bus Wash Bay</div>
                <div className="text-[10px] text-cyan-400">Clean 100% • ₹150</div>
              </button>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Service Total:</span>
            <span className="text-base font-black text-amber-400">₹{totalCost}</span>
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-emerald-700 hover:bg-emerald-600 py-3 rounded-xl font-bold text-sm text-white transition active:scale-95 flex items-center justify-center gap-2 mt-2"
          >
            <Check size={18} />
            <span>APPLY & RETURN TO TRIP</span>
          </button>
        </div>
      </div>
    </div>
  );
};
