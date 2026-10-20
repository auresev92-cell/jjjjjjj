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
    <div className="absolute top-0 left-0 right-0 h-11 px-6 flex items-center justify-between z-[9999] pointer-events-none select-none text-white font-semibold text-[13px] tracking-tight">
      {/* Time */}
      <span className="w-12 text-left font-medium">{time}</span>

      {/* Dynamic Island */}
      <div className="absolute left-1/2 -translate-x-1/2 top-2.5 w-[112px] h-[28px] bg-black rounded-full flex items-center justify-between px-2.5 shadow-md border border-white/10">
        <div className="w-2.5 h-2.5 rounded-full bg-[#121212] border border-white/20 flex items-center justify-center">
          <div className="w-1 h-1 rounded-full bg-[#050505]" />
        </div>
        <div className="w-3 h-3 rounded-full bg-[#0a0a0a]" />
      </div>

      {/* Right Icons: Signal, WiFi, Battery */}
      <div className="flex items-center space-x-1.5 text-white">
        <Signal className="w-3.5 h-3.5" strokeWidth={2.5} />
        <Wifi className="w-3.5 h-3.5" strokeWidth={2.5} />
        <div className="flex items-center space-x-0.5">
          <span className="text-[10.5px] font-bold">100%</span>
          <div className="w-5 h-2.5 border border-white/80 rounded-[3px] p-0.5 flex items-center">
            <div className="h-full w-full bg-white rounded-[1px]" />
          </div>
          <div className="w-0.5 h-1 bg-white/80 rounded-r-xs" />
        </div>
      </div>
    </div>
  );
}

export function IPhoneHomeIndicator() {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-6 flex items-center justify-center pointer-events-none z-[9999] bg-gradient-to-t from-[#0d021a] via-[#0d021a]/60 to-transparent pb-1">
      <div className="w-32 h-[4px] bg-white/50 rounded-full" />
    </div>
  );
}
