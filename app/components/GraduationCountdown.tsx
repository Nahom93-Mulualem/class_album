"use client";

import React, { useState, useEffect } from "react";

export default function GraduationCountdown() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    mins: 0,
    secs: 0,
  });

  useEffect(() => {
    // Graduation Target: May 22, 2026
    const targetDate = new Date("2026-05-22T10:00:00").getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, mins, secs });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-br from-primary-container to-primary text-on-primary rounded-xl p-4 shadow-sm border border-primary-fixed/20 relative overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-secondary-container flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse"></span>
          SE Class of 2026
        </span>
        <span className="text-[11px] font-bold bg-primary-fixed/20 px-2 py-0.5 rounded-full text-primary-fixed">
          May 22, 2026
        </span>
      </div>
      <h4 className="font-headline text-sm font-bold text-white mb-3">Countdown to Commencement</h4>
      <div className="grid grid-cols-4 gap-1.5 text-center">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg py-1.5 px-1 border border-white/10">
          <span className="block font-headline text-lg font-bold text-secondary-container leading-none">
            {timeLeft.days}
          </span>
          <span className="text-[9px] uppercase tracking-wider text-primary-fixed">Days</span>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg py-1.5 px-1 border border-white/10">
          <span className="block font-headline text-lg font-bold text-secondary-container leading-none">
            {timeLeft.hours}
          </span>
          <span className="text-[9px] uppercase tracking-wider text-primary-fixed">Hours</span>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg py-1.5 px-1 border border-white/10">
          <span className="block font-headline text-lg font-bold text-secondary-container leading-none">
            {timeLeft.mins}
          </span>
          <span className="text-[9px] uppercase tracking-wider text-primary-fixed">Mins</span>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg py-1.5 px-1 border border-white/10">
          <span className="block font-headline text-lg font-bold text-secondary-container leading-none">
            {timeLeft.secs}
          </span>
          <span className="text-[9px] uppercase tracking-wider text-primary-fixed">Secs</span>
        </div>
      </div>
    </div>
  );
}
