import React, { useState, useEffect } from 'react';
import { Fuel, CheckCircle2, X } from 'lucide-react';
import { soundManager } from '../audio/SoundManager';

interface RefuelModalProps {
  currentFuel: number;
  onFinishRefuel: (newFuel: number, cost: number) => void;
  onClose: () => void;
}

export const RefuelModal: React.FC<RefuelModalProps> = ({ currentFuel, onFinishRefuel, onClose }) => {
  const safeCurrentFuel = Number.isFinite(currentFuel) ? currentFuel : 80;
  const [fuel, setFuel] = useState(safeCurrentFuel);
  const [isRefueling, setIsRefueling] = useState(false);
  const DIESEL_PRICE_PER_LITER = 92.5; // Andhra Pradesh Diesel Price
  const TANK_CAPACITY_LITERS = 250; // Heavy Ashok Leyland bus tank

  const safeFuel = Number.isFinite(fuel) ? fuel : safeCurrentFuel;
  const addedLiters = Math.max(0, ((safeFuel - safeCurrentFuel) / 100) * TANK_CAPACITY_LITERS);
  const totalCost = Number.isFinite(addedLiters) ? Math.round(addedLiters * DIESEL_PRICE_PER_LITER) : 0;

  useEffect(() => {
    let timer: number;
    if (isRefueling && fuel < 100) {
      timer = window.setInterval(() => {
        setFuel((prev) => {
          if (prev >= 100) {
            setIsRefueling(false);
            return 100;
          }
          return Math.min(100, prev + 2.5);
        });
      }, 150);
    }
    return () => clearInterval(timer);
  }, [isRefueling, fuel]);

  const handleStartRefuel = () => {
    setIsRefueling(true);
    soundManager.playDoorSound(false);
  };

  const handleComplete = () => {
    onFinishRefuel(fuel, totalCost);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-emerald-500/80 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-slate-800 rounded-xl transition text-slate-400 hover:text-white"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="bg-emerald-600 text-white p-3 rounded-2xl shadow-lg">
            <Fuel size={28} />
          </div>
          <div>
            <h2 className="text-lg font-black text-emerald-400">APSRTC Diesel Bunk</h2>
            <p className="text-xs text-slate-400">High-Speed Commercial Diesel Dispenser</p>
          </div>
        </div>

        {/* Digital Dispenser Display */}
        <div className="bg-black/90 p-4 rounded-2xl border border-emerald-500/40 font-mono my-4 space-y-3">
          <div className="flex justify-between items-center text-xs text-slate-400 border-b border-slate-800 pb-2">
            <span>DIESEL PRICE:</span>
            <span className="text-emerald-400 font-bold">₹{DIESEL_PRICE_PER_LITER} / LITER</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-300">DIESEL LEVEL:</span>
            <span className="text-xl font-bold text-amber-400">{fuel.toFixed(1)}%</span>
          </div>

          <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-150"
              style={{ width: `${fuel}%` }}
            />
          </div>

          <div className="flex justify-between items-center pt-2">
            <span className="text-xs text-slate-300">DISPENSED VOLUME:</span>
            <span className="text-base font-bold text-cyan-400">{addedLiters.toFixed(1)} Liters</span>
          </div>

          <div className="flex justify-between items-center pt-1 border-t border-slate-800 text-sm">
            <span className="text-slate-300 font-sans font-bold">TOTAL AMOUNT:</span>
            <span className="text-2xl font-black text-emerald-400">₹{totalCost}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="space-y-2 mt-5">
          {fuel < 100 && (
            <button
              onClick={handleStartRefuel}
              disabled={isRefueling}
              className={`w-full py-3 rounded-xl font-black text-sm tracking-wide transition shadow-lg ${
                isRefueling
                  ? 'bg-amber-600 animate-pulse text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95'
              }`}
            >
              {isRefueling ? 'REFUELING IN PROGRESS...' : 'START DIESEL PUMP (FILL TANK)'}
            </button>
          )}

          <button
            onClick={handleComplete}
            className="w-full bg-slate-800 hover:bg-slate-700 py-3 rounded-xl font-bold text-sm text-slate-200 transition active:scale-95 flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={18} className="text-emerald-400" />
            <span>PAY & RETURN TO BUS (₹{totalCost})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
