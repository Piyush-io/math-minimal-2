"use client";

import { useState } from "react";

type Difficulty = "EASY" | "MEDIUM" | "HARD";

interface DifficultySelectorProps {
  onSelect: (difficulty: Difficulty) => void;
  defaultDifficulty?: Difficulty;
}

export default function DifficultySelector({ 
  onSelect, 
  defaultDifficulty = "EASY" 
}: DifficultySelectorProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(defaultDifficulty);
  
  const handleSelect = (difficulty: Difficulty) => {
    setSelectedDifficulty(difficulty);
    onSelect(difficulty);
  };
  
  return (
    <div className="grid grid-cols-1 gap-4">
      <button
        onClick={() => handleSelect("EASY")}
        className={`uppercase font-bold tracking-wider px-6 py-3 transition-all duration-300 ${
          selectedDifficulty === "EASY" 
            ? "bg-[rgb(var(--primary))] text-black" 
            : "bg-transparent border border-white/30 hover:bg-white/10"
        }`}
      >
        Easy
      </button>
      
      <button
        onClick={() => handleSelect("MEDIUM")}
        className={`uppercase font-bold tracking-wider px-6 py-3 transition-all duration-300 ${
          selectedDifficulty === "MEDIUM" 
            ? "bg-[rgb(var(--primary))] text-black" 
            : "bg-transparent border border-white/30 hover:bg-white/10"
        }`}
      >
        Medium
      </button>
      
      <button
        onClick={() => handleSelect("HARD")}
        className={`uppercase font-bold tracking-wider px-6 py-3 transition-all duration-300 ${
          selectedDifficulty === "HARD" 
            ? "bg-[rgb(var(--primary))] text-black" 
            : "bg-transparent border border-white/30 hover:bg-white/10"
        }`}
      >
        Hard
      </button>
    </div>
  );
} 