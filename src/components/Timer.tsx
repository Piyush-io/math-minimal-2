"use client";

import { useState, useEffect } from "react";

interface TimerProps {
  duration: number; // in seconds
  onComplete: () => void;
}

export default function Timer({ duration, onComplete }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  
  useEffect(() => {
    // Reset timer when duration changes
    setTimeLeft(duration);
  }, [duration]);
  
  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete();
      return;
    }
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft, onComplete]);
  
  // Format time as MM:SS
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  // Calculate percentage of time left for progress bar
  const percentLeft = (timeLeft / duration) * 100;
  
  return (
    <div className="flex flex-col items-center md:items-end">
      <div className="swiss-label mb-2">Time Remaining</div>
      <div className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">{formattedTime}</div>
      <div className="swiss-progress-container w-[200px] md:w-[200px]">
        <div 
          className="swiss-progress-bar"
          style={{ width: `${percentLeft}%` }}
        ></div>
      </div>
    </div>
  );
} 