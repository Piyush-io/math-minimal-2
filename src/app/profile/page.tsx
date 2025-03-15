"use client";

import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

// Define types for our stats
interface ActivityItem {
  date: string;
  score: number;
  difficulty: string;
  time: number;
}

interface UserStats {
  totalGames: number;
  totalScore: number;
  averageScore: number;
  highestScore: number;
  byDifficulty: {
    easy: { games: number; avgScore: number };
    medium: { games: number; avgScore: number };
    hard: { games: number; avgScore: number };
  };
  byOperation: {
    addition: { correct: number; total: number };
    multiplication: { correct: number; total: number };
  };
  recentActivity: ActivityItem[];
  scoreHistory: { date: string; score: number }[];
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UserStats>({
    totalGames: 0,
    totalScore: 0,
    averageScore: 0,
    highestScore: 0,
    byDifficulty: {
      easy: { games: 0, avgScore: 0 },
      medium: { games: 0, avgScore: 0 },
      hard: { games: 0, avgScore: 0 }
    },
    byOperation: {
      addition: { correct: 0, total: 0 },
      multiplication: { correct: 0, total: 0 }
    },
    recentActivity: [],
    scoreHistory: []
  });
  
  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', user.id));
        if (!userDoc.exists()) {
          console.error('User document not found');
          return;
        }
        
        const userData = userDoc.data();
        const userStats = userData.stats;
        
        setStats({
          totalGames: userStats.totalGames || 0,
          totalScore: userStats.totalScore || 0,
          averageScore: userStats.averageScore || 0,
          highestScore: userStats.highestScore || 0,
          byDifficulty: {
            easy: { 
              games: userStats.byDifficulty.easy.total || 0, 
              avgScore: userStats.byDifficulty.easy.avgScore || 0 
            },
            medium: { 
              games: userStats.byDifficulty.medium.total || 0, 
              avgScore: userStats.byDifficulty.medium.avgScore || 0 
            },
            hard: { 
              games: userStats.byDifficulty.hard.total || 0, 
              avgScore: userStats.byDifficulty.hard.avgScore || 0 
            }
          },
          byOperation: userStats.byOperation || {
            addition: { correct: 0, total: 0 },
            multiplication: { correct: 0, total: 0 }
          },
          recentActivity: userStats.recentActivity || [],
          scoreHistory: userStats.scoreHistory || []
        });
      } catch (error) {
        console.error('Error fetching user stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserStats();
  }, []);
  
  const calculatePercentage = (correct: number, total: number) => {
    return total > 0 ? Math.round((correct / total) * 100) : 0;
  };
  
  const renderScoreChart = () => {
    return (
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={stats.scoreHistory}>
            <XAxis 
              dataKey="date" 
              stroke="#666666"
              tickFormatter={(value) => value.split('-')[2]}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              stroke="#666666"
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#0f0f0f',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 0
              }}
              // labelStyle={{ color: 'rgba(255,255,255,0.6)' }}
              itemStyle={{ color: 'rgb(217, 196, 164)' }}
            />
            <Bar 
              dataKey="score" 
              fill="rgb(217, 196, 164)"
              radius={[4, 4, 0, 0]}
              onMouseEnter={() => {}}
              onMouseLeave={() => {}}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };
  
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-black text-white">
        <Navbar />
        
        <main className="flex-1 flex items-start justify-center py-6">
          <div className="swiss-container max-w-7xl w-full py-4">
            {loading || authLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-2xl text-white/60">Loading profile...</div>
              </div>
            ) : (
              <div className="h-[calc(100vh-200px)] flex flex-col">
                <div className="mb-6">
                  <div className="swiss-divider mb-4"></div>
                  <p className="swiss-subtitle">{user?.name || "User"}'s Performance</p>
                </div>
                
                <div className="grid grid-cols-12 gap-6 h-full">
                  {/* Top row - Key stats */}
                  <div className="col-span-12 grid grid-cols-4 gap-6 mb-6">
                    <div className="swiss-card">
                      <div className="swiss-label mb-2">Total Games</div>
                      <div className="text-4xl font-bold">{stats.totalGames}</div>
                    </div>
                    
                    <div className="swiss-card">
                      <div className="swiss-label mb-2">Questions/Minute</div>
                      <div className="text-4xl font-bold">
                        {stats.totalGames > 0
                          ? ((stats.totalGames / (stats.byOperation.addition.total + stats.byOperation.multiplication.total)) * 60).toFixed(1)
                          : 0}
                      </div>
                    </div>
                    
                    <div className="swiss-card">
                      <div className="swiss-label mb-2">Accuracy</div>
                      <div className="text-4xl font-bold">
                        {((stats.byOperation.addition.correct + stats.byOperation.multiplication.correct) /
                          (stats.byOperation.addition.total + stats.byOperation.multiplication.total) * 100 || 0).toFixed(1)}%
                      </div>
                    </div>
                    
                    <div className="swiss-card">
                      <div className="swiss-label mb-2">Highest Score</div>
                      <div className="text-4xl font-bold">{stats.highestScore}</div>
                    </div>
                  </div>
                  
                  {/* Bottom row - Charts and details */}
                  <div className="col-span-12 grid grid-cols-12 gap-8 h-[calc(100%-120px)]">
                    {/* Score Growth Chart */}
                    <div className="col-span-7 swiss-card">
                      <h2 className="swiss-heading mb-8">Score Growth</h2>
                      {renderScoreChart()}
                    </div>
                    
                    {/* Operation Performance */}
                    <div className="col-span-3 swiss-card flex flex-col">
                      <h2 className="swiss-heading mb-8">Operations</h2>
                      <div className="space-y-8">
                        <div>
                          <div className="flex justify-between mb-3">
                            <div className="swiss-label">Addition</div>
                            <div className="text-2xl font-bold">
                              {calculatePercentage(stats.byOperation.addition.correct, stats.byOperation.addition.total)}%
                            </div>
                          </div>
                          <div className="swiss-progress-container">
                            <div 
                              className="swiss-progress-bar"
                              style={{ width: `${calculatePercentage(stats.byOperation.addition.correct, stats.byOperation.addition.total)}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-3">
                            <div className="swiss-label">Multiplication</div>
                            <div className="text-2xl font-bold">
                              {calculatePercentage(stats.byOperation.multiplication.correct, stats.byOperation.multiplication.total)}%
                            </div>
                          </div>
                          <div className="swiss-progress-container">
                            <div 
                              className="swiss-progress-bar"
                              style={{ width: `${calculatePercentage(stats.byOperation.multiplication.correct, stats.byOperation.multiplication.total)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      
                      <h2 className="swiss-heading mb-4 mt-8">Difficulty</h2>
                      <div className="space-y-6">
                        <div className="flex justify-between items-center">
                          <div className="swiss-label">Easy</div>
                          <div className="text-2xl font-bold">{stats.byDifficulty.easy.avgScore}</div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="swiss-label">Medium</div>
                          <div className="text-2xl font-bold">{stats.byDifficulty.medium.avgScore}</div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="swiss-label">Hard</div>
                          <div className="text-2xl font-bold">{stats.byDifficulty.hard.avgScore}</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Recent Activity */}
                    <div className="col-span-2 swiss-card flex flex-col">
                      <h2 className="swiss-heading mb-8">Recent</h2>
                      <div className="space-y-6">
                        {stats.recentActivity.slice(0, 3).map((activity, index) => (
                          <div key={index} className="swiss-card bg-black/50">
                            <div className="flex justify-between items-center">
                              <div className="swiss-label">{activity.date}</div>
                              <div className="text-2xl font-bold">{activity.score}</div>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                              <div className="text-white/60">{activity.difficulty}</div>
                              <div className="text-white/60">{activity.time}s</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
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
