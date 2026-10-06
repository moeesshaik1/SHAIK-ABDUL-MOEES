import React from 'react';
import { TripState } from '../types/game';
import { Award, Trophy, RotateCcw, TrendingUp, DollarSign } from 'lucide-react';

interface TripSummaryModalProps {
  trip: TripState;
  onRestart: () => void;
  onClose: () => void;
}

export const TripSummaryModal: React.FC<TripSummaryModalProps> = ({ trip, onRestart, onClose }) => {
  const fuelExp = Number.isFinite(trip?.fuelExpenses) ? trip.fuelExpenses : 0;
  const tollExp = Number.isFinite(trip?.tollExpenses) ? trip.tollExpenses : 0;
  const serviceExp = Number.isFinite(trip?.serviceExpenses) ? trip.serviceExpenses : 0;
  const totalExpenses = fuelExp + tollExp + serviceExp;
  const totalFare = Number.isFinite(trip?.totalFareCollected) ? trip.totalFareCollected : 0;
  const netIncome = totalFare - totalExpenses;
  const drivingScore = Number.isFinite(trip?.drivingScore) ? Math.round(trip.drivingScore) : 100;
  const traveledKm = Number.isFinite(trip?.traveledKm) ? trip.traveledKm : 0;
  const passengerCount = trip?.tickets ? trip.tickets.length : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-amber-500 rounded-3xl max-w-xl w-full p-6 text-white shadow-2xl relative">
        <div className="text-center pb-4 border-b border-slate-800">
          <div className="inline-flex bg-gradient-to-r from-amber-500 to-red-600 p-3 rounded-2xl shadow-lg mb-2">
            <Trophy size={36} className="text-yellow-200" />
          </div>
          <h2 className="text-2xl font-black text-amber-400">APSRTC TRIP SCORECARD</h2>
          <p className="text-xs text-slate-300 font-medium tracking-wide">
            KURNOOL ➔ NANDYAL ➔ SRISAILAM EXPRESS JOURNEY
          </p>
        </div>

        {/* Driving Performance Score */}
        <div className="bg-gradient-to-br from-slate-950 to-slate-900 p-4 rounded-2xl border border-slate-800 my-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase">Driver Safety Rating</div>
            <div className="text-3xl font-black text-emerald-400 font-mono">
              {drivingScore} <span className="text-lg text-slate-500">/ 100</span>
            </div>
            <div className="text-[11px] text-slate-300 mt-0.5">
              {drivingScore >= 85 ? '⭐ Excellent RTC Captain Rating' : '⚠️ Satisfactory Driving'}
            </div>
          </div>
          <div className="w-16 h-16 rounded-full border-4 border-emerald-500 flex items-center justify-center font-bold text-lg text-emerald-400 font-mono">
            {drivingScore}%
          </div>
        </div>

        {/* Financial & Operational Breakdown */}
        <div className="grid grid-cols-2 gap-3 text-xs mb-4">
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <span className="text-slate-400">Total Distance:</span>
            <div className="text-base font-bold text-cyan-300 font-mono">{traveledKm.toFixed(1)} KM</div>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <span className="text-slate-400">Passengers Carried:</span>
            <div className="text-base font-bold text-amber-300 font-mono">{passengerCount} Passengers</div>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <span className="text-slate-400">Gross Ticket Collections:</span>
            <div className="text-base font-black text-emerald-400 font-mono">₹{totalFare}</div>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <span className="text-slate-400">Total Operational Expenses:</span>
            <div className="text-base font-bold text-red-400 font-mono">₹{totalExpenses}</div>
            <div className="text-[10px] text-slate-400">
              Fuel: ₹{fuelExp} | Toll: ₹{tollExp} | Workshop: ₹{serviceExp}
            </div>
          </div>
        </div>

        {/* Net Profit Banner */}
        <div className="bg-slate-950 p-3.5 rounded-2xl border border-emerald-500/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp size={20} className={netIncome >= 0 ? 'text-emerald-400' : 'text-red-400'} />
            <span className="text-xs font-bold text-slate-300">Net Depository Profit:</span>
          </div>
          <span className={`text-xl font-black font-mono ${netIncome >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {netIncome >= 0 ? `+ ₹${netIncome}` : `- ₹${Math.abs(netIncome)}`}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex gap-3 mt-5">
          <button
            onClick={onRestart}
            className="flex-1 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black py-3 rounded-xl text-xs transition flex items-center justify-center gap-2"
          >
            <RotateCcw size={16} />
            <span>START NEW TRIP FROM DEPOT</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-slate-800 hover:bg-slate-700 font-bold py-3 rounded-xl text-xs transition text-white"
          >
            CONTINUE DRIVING
          </button>
        </div>
      </div>
    </div>
  );
};
