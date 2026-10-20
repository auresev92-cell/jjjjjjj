import React, { useState, useEffect } from 'react';
import { Wifi, Signal, Battery } from 'lucide-react';

export function IPhoneStatusBar() {
  const [time, setTime] = useState('9:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute top-0 left-0 right-0 h-11 px-6 flex items-center justify-between z-[9999] pointer-events-none select-none text-slate-900 font-semibold text-[13px] tracking-tight">
      {/* Time */}
      <span className="w-12 text-left font-medium">{time}</span>

      {/* Dynamic Island */}
      <div className="absolute left-1/2 -translate-x-1/2 top-2.5 w-[112px] h-[28px] bg-slate-950 rounded-full flex items-center justify-between px-2.5 shadow-sm border border-slate-800/40">
        <div className="w-2.5 h-2.5 rounded-full bg-[#18181b] border border-white/20 flex items-center justify-center">
          <div className="w-1 h-1 rounded-full bg-[#09090b]" />
        </div>
        <div className="w-3 h-3 rounded-full bg-[#18181b]" />
      </div>

      {/* Right Icons: Signal, WiFi, Battery */}
      <div className="flex items-center space-x-1.5 text-slate-800">
        <Signal className="w-3.5 h-3.5 text-slate-800" strokeWidth={2.5} />
        <Wifi className="w-3.5 h-3.5 text-slate-800" strokeWidth={2.5} />
        <div className="flex items-center space-x-0.5">
          <span className="text-[10.5px] font-bold text-slate-800">100%</span>
          <div className="w-5 h-2.5 border border-slate-800 rounded-[3px] p-0.5 flex items-center">
            <div className="h-full w-full bg-slate-800 rounded-[1px]" />
          </div>
          <div className="w-0.5 h-1 bg-slate-800 rounded-r-xs" />
        </div>
      </div>
    </div>
  );
}

export function IPhoneHomeIndicator() {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-5 flex items-center justify-center pointer-events-none z-[9999] bg-transparent pb-1">
      <div className="w-32 h-[4px] bg-slate-300 sm:bg-slate-400 rounded-full" />
    </div>
  );
}
