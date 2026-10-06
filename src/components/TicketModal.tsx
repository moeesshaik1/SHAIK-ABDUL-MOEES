import React from 'react';
import { PassengerTicket } from '../types/game';
import { Printer, X, UserCheck, ShieldCheck } from 'lucide-react';

interface TicketModalProps {
  tickets: PassengerTicket[];
  totalFare: number;
  passengersOnboard: number;
  onClose: () => void;
  onIssueTicket: (type: 'Adult' | 'Student' | 'Senior' | 'Pilgrim', destination: string) => void;
}

export const TicketModal: React.FC<TicketModalProps> = ({
  tickets,
  totalFare,
  passengersOnboard,
  onClose,
  onIssueTicket,
}) => {
  const latestTicket = tickets && tickets.length > 0 ? tickets[tickets.length - 1] : null;
  const safePassengers = Number.isFinite(passengersOnboard) ? passengersOnboard : 0;
  const safeTotalFare = Number.isFinite(totalFare) ? totalFare : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-amber-500/80 rounded-3xl max-w-2xl w-full p-6 text-white shadow-2xl relative flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500 text-slate-950 p-2 rounded-xl">
              <Printer size={24} />
            </div>
            <div>
              <h2 className="text-lg font-black text-amber-400">APSRTC ETIM — Conductor Terminal</h2>
              <p className="text-xs text-slate-400">
                Electronic Ticket Issuing Machine • Kurnool-1 Depot
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-xl transition text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4 overflow-y-auto pr-1">
          {/* Authentic Printed APSRTC Ticket Preview */}
          <div className="bg-amber-50 text-slate-900 p-5 rounded-2xl shadow-xl font-mono text-xs border border-amber-200 flex flex-col justify-between">
            <div>
              <div className="text-center font-bold text-sm border-b border-dashed border-slate-400 pb-2">
                <div>ఆంధ్రప్రదేశ్ రాష్ట్ర రోడ్డు రవాణా సంస్థ</div>
                <div className="font-sans font-black tracking-wider text-xs">APSRTC • KURNOOL REGION</div>
                <div className="text-[10px] text-slate-600 font-sans">KURNOOL-1 DEPOT • AP21Z1234</div>
              </div>

              <div className="my-3 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>ROUTE:</span>
                  <span className="font-bold">KURNOOL - SRISAILAM</span>
                </div>
                <div className="flex justify-between">
                  <span>SERVICE:</span>
                  <span className="font-bold">EXPRESS / PALLE VELUGU</span>
                </div>
                <div className="flex justify-between">
                  <span>TICKET NO:</span>
                  <span className="font-bold text-red-700">{latestTicket?.ticketNo || '004821'}</span>
                </div>
                <div className="flex justify-between">
                  <span>FROM:</span>
                  <span className="font-bold">{latestTicket?.origin || 'KURNOOL'}</span>
                </div>
                <div className="flex justify-between">
                  <span>TO:</span>
                  <span className="font-bold">{latestTicket?.destination || 'SRISAILAM'}</span>
                </div>
                <div className="flex justify-between">
                  <span>CATEGORY:</span>
                  <span className="font-bold">{latestTicket?.passengerType || 'Adult'}</span>
                </div>
                <div className="flex justify-between">
                  <span>SEAT NO:</span>
                  <span className="font-bold">#{latestTicket?.seatNo || 14}</span>
                </div>
                <div className="flex justify-between">
                  <span>DATE & TIME:</span>
                  <span>{latestTicket?.issueTime || new Date().toLocaleTimeString()}</span>
                </div>
              </div>

              <div className="border-t-2 border-b-2 border-dashed border-slate-400 py-2 my-2 flex justify-between items-center text-sm font-black">
                <span>FARE COLLECTED:</span>
                <span className="text-base text-red-700">₹{latestTicket?.fare || 160}.00</span>
              </div>
            </div>

            <div className="text-center text-[10px] text-slate-600 pt-2 border-t border-slate-300">
              సురక్షితమైన ప్రయాణం • HAPPY JOURNEY WITH APSRTC
            </div>
          </div>

          {/* Passenger Roster & Conductor Quick Issue Actions */}
          <div className="flex flex-col justify-between gap-4">
            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
              <h3 className="text-sm font-bold text-amber-300 mb-2 flex items-center gap-2">
                <UserCheck size={16} />
                Bus Occupancy & Collections
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Seats:</span>
                  <span className="font-bold">52</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Passengers Onboard:</span>
                  <span className="font-bold text-emerald-400">{safePassengers} / 52</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Fares Collected:</span>
                  <span className="font-black text-amber-400 text-sm">₹{safeTotalFare}</span>
                </div>
              </div>
            </div>

            {/* Quick Conductor Issue Buttons */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-300">Issue New Ticket for Waiting Passenger:</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onIssueTicket('Adult', 'Srisailam')}
                  className="bg-emerald-700 hover:bg-emerald-600 px-3 py-2 rounded-xl text-xs font-bold transition text-left"
                >
                  <div>Adult Express</div>
                  <div className="text-[10px] text-emerald-200">Kurnool ➔ Srisailam • ₹160</div>
                </button>
                <button
                  onClick={() => onIssueTicket('Pilgrim', 'Srisailam')}
                  className="bg-amber-700 hover:bg-amber-600 px-3 py-2 rounded-xl text-xs font-bold transition text-left"
                >
                  <div>Pilgrim Special</div>
                  <div className="text-[10px] text-amber-200">To Shrine • ₹180</div>
                </button>
                <button
                  onClick={() => onIssueTicket('Student', 'Nandyal')}
                  className="bg-blue-700 hover:bg-blue-600 px-3 py-2 rounded-xl text-xs font-bold transition text-left"
                >
                  <div>Student Pass</div>
                  <div className="text-[10px] text-blue-200">To Nandyal • ₹45</div>
                </button>
                <button
                  onClick={() => onIssueTicket('Senior', 'Nandyal')}
                  className="bg-purple-700 hover:bg-purple-600 px-3 py-2 rounded-xl text-xs font-bold transition text-left"
                >
                  <div>Senior Citizen</div>
                  <div className="text-[10px] text-purple-200">50% Concession • ₹40</div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="bg-slate-700 hover:bg-slate-600 px-5 py-2 rounded-xl text-xs font-bold"
          >
            Close ETIM Machine
          </button>
        </div>
      </div>
    </div>
  );
};
