"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import DifficultySelector from "@/components/DifficultySelector";
import TimeSelector from "@/components/TimeSelector";
import MathProblem from "@/components/MathProblem";
import ScoreDisplay from "@/components/ScoreDisplay";
import Timer from "@/components/Timer";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

// Define the allowed time values
type Time = 15 | 30 | 45 | 60;

// This function is no longer used as we're saving directly to Firestore
// Keeping it commented for reference
/*
const saveScore = async (userId: string, score: number, difficulty: string, time: number) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return true;
};
*/

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const [difficulty, setDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">("MEDIUM");
  const [time, setTime] = useState<Time>(30);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const handleDifficultyChange = (newDifficulty: "EASY" | "MEDIUM" | "HARD") => {
    if (!isPlaying) {
      setDifficulty(newDifficulty);
    }
  };
  
  const handleTimeChange = (newTime: Time) => {
    if (!isPlaying) {
      setTime(newTime);
    }
  };
  
  const [totalCorrect, setTotalCorrect] = useState(0);
  
  const [totalAttempts, setTotalAttempts] = useState(0);
  
  const handleCorrectAnswer = (operationType: "addition" | "multiplication", isCorrect: boolean, attempts: number = 1) => {
    if (!isPlaying) {
      setIsPlaying(true);
    }
    setTotalAttempts(prev => prev + attempts);
    if (isCorrect) {
      setScore(prevScore => prevScore + 1);
      setTotalCorrect(prev => prev + 1);
    }
  };
  
  const handleTimerComplete = async () => {
    setIsPlaying(false);
    setGameOver(true);
    setIsSaving(true);
    
    try {
      if (user) {
        const userRef = doc(db, 'users', user.id);
        const userDoc = await getDoc(userRef);
        const userData = userDoc.exists() ? userDoc.data() : {};
        
        const now = new Date();
        const gameData = {
          score,
          difficulty,
          time,
          date: now.toISOString().split('T')[0]
        };
        
        // Update user statistics
        const stats = userData.stats || {
          totalGames: 0,
          totalScore: 0,
          totalCorrect: 0,
          averageScore: 0,
          highestScore: 0,
          totalTimePlayed: 0,
          byDifficulty: {
            easy: { total: 0, avgScore: 0 },
            medium: { total: 0, avgScore: 0 },
            hard: { total: 0, avgScore: 0 }
          },
          byOperation: {
            addition: { correct: 0, total: 0 },
            multiplication: { correct: 0, total: 0 }
          },
          recentActivity: [],
          scoreHistory: []
        };
        
        // Update general stats
        stats.totalGames += 1;
        stats.totalScore += score;
        stats.totalCorrect += totalCorrect;
        stats.totalTimePlayed += time;
        stats.averageScore = Math.round(stats.totalScore / stats.totalGames);
        stats.highestScore = Math.max(stats.highestScore, score);
        
        // Update difficulty stats
        const diffStats = stats.byDifficulty[difficulty.toLowerCase()];
        diffStats.total += 1;
        diffStats.avgScore = Math.round((diffStats.avgScore * (diffStats.total - 1) + score) / diffStats.total);
        
        // Update recent activity and score history
        stats.recentActivity = [gameData, ...(stats.recentActivity || [])].slice(0, 10);
        stats.scoreHistory = [...(stats.scoreHistory || []), { date: gameData.date, score }];
        
        // Save to Firestore
        await updateDoc(userRef, { stats });
      }
    } catch (error) {
      console.error('Error saving game stats:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  const resetGame = () => {
    setGameOver(false);
    setScore(0);
    setIsPlaying(false);
  };
  
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-black text-white">
        <Navbar />
        
        <main className="flex-1 flex items-start justify-center py-8">
          <div className="swiss-container max-w-7xl py-6">
            {gameOver ? (
              <div className="max-w-2xl mx-auto">
                <div className="mb-12 text-center">
                  <h1 className="swiss-title mb-6">CHALLENGE COMPLETE</h1>
                  <div className="swiss-divider mx-auto mb-12"></div>
                  
                  <div className="mb-16">
                    <ScoreDisplay score={score} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-12 mb-12">
                    <div className="swiss-card p-8">
                      <div className="swiss-label mb-4">Difficulty</div>
                      <div className="text-4xl font-bold">{difficulty}</div>
                    </div>
                    
                    <div className="swiss-card p-8">
                      <div className="swiss-label mb-4">Time</div>
                      <div className="text-4xl font-bold">{time}s</div>
                    </div>
                  </div>
                  
                  {isSaving ? (
                    <div className="text-white/60 text-xl">Saving results...</div>
                  ) : (
                    <button
                      onClick={resetGame}
                      className="swiss-btn w-full max-w-md mx-auto py-4 text-lg"
                    >
                      New Challenge
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="swiss-grid h-[calc(100vh-240px)] items-center">
                <div className="md:col-span-3 h-full flex flex-col justify-center">
                  <div className="mb-16">
                    <h2 className="swiss-label mb-8">Difficulty</h2>
                    <DifficultySelector 
                      onSelect={handleDifficultyChange} 
                      defaultDifficulty={difficulty} 
                    />
                  </div>
                  
                  <div>
                    <h2 className="swiss-label mb-8">Time (seconds)</h2>
                    <TimeSelector 
                      onSelect={handleTimeChange} 
                      defaultTime={time} 
                    />
                  </div>
                </div>
                
                <div className="md:col-span-6 flex flex-col items-center justify-center h-full">
                  <MathProblem 
                    difficulty={difficulty} 
                    onCorrectAnswer={handleCorrectAnswer} 
                  />
                </div>
                
                <div className="md:col-span-3 h-full flex flex-col justify-between">
                  <div className="flex justify-end">
                    {isPlaying ? (
                      <Timer 
                        duration={time} 
                        onComplete={handleTimerComplete} 
                      />
                    ) : (
                      <div className="swiss-label text-right">
                        Enter any answer to start
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end mt-auto">
                    <ScoreDisplay score={score} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
