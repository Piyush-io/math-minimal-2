"use client";

import { useState } from "react";

type Time = 15 | 30 | 45 | 60;

interface TimeSelectorProps {
  onSelect: (time: Time) => void;
  defaultTime?: Time;
}

export default function TimeSelector({ 
  onSelect, 
  defaultTime = 30 
}: TimeSelectorProps) {
  const [selectedTime, setSelectedTime] = useState<Time>(defaultTime);
  
  const handleSelect = (time: Time) => {
    setSelectedTime(time);
    onSelect(time);
  };
  
  return (
    <div className="grid grid-cols-2 gap-4">
      <button
        onClick={() => handleSelect(15)}
        className={`font-bold tracking-wider px-6 py-3 transition-all duration-300 ${
          selectedTime === 15 
            ? "bg-[rgb(var(--primary))] text-black" 
            : "bg-transparent border border-white/30 hover:bg-white/10"
        }`}
      >
        15
      </button>
      
      <button
        onClick={() => handleSelect(30)}
        className={`font-bold tracking-wider px-6 py-3 transition-all duration-300 ${
          selectedTime === 30 
            ? "bg-[rgb(var(--primary))] text-black" 
            : "bg-transparent border border-white/30 hover:bg-white/10"
        }`}
      >
        30
      </button>
      
      <button
        onClick={() => handleSelect(45)}
        className={`font-bold tracking-wider px-6 py-3 transition-all duration-300 ${
          selectedTime === 45 
            ? "bg-[rgb(var(--primary))] text-black" 
            : "bg-transparent border border-white/30 hover:bg-white/10"
        }`}
      >
        45
      </button>
      
      <button
        onClick={() => handleSelect(60)}
        className={`font-bold tracking-wider px-6 py-3 transition-all duration-300 ${
          selectedTime === 60 
            ? "bg-[rgb(var(--primary))] text-black" 
            : "bg-transparent border border-white/30 hover:bg-white/10"
        }`}
      >
        60
      </button>
    </div>
  );
} 