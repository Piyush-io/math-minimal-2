"use client";

interface ScoreDisplayProps {
  score: number;
}

export default function ScoreDisplay({ score }: ScoreDisplayProps) {
  return (
    <div className="text-center">
      <div className="swiss-label mb-2">Score</div>
      <div className="text-5xl md:text-7xl font-bold tracking-tighter">{score}</div>
      <div className="swiss-divider w-[60px] md:w-[80px] mx-auto mt-3 md:mt-4"></div>
    </div>
  );
} 