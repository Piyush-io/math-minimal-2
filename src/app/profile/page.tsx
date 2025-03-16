"use client";

import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { api } from '@/services/api';

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
  totalCorrect: number;
  averageScore: number;
  highestScore: number;
  totalTimePlayed: number;
  byDifficulty: {
    easy: { games: number; avgScore: number };
    medium: { games: number; avgScore: number };
    hard: { games: number; avgScore: number };
  };
  recentActivity: ActivityItem[];
  scoreHistory: { date: string; score: number }[];
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [chartFilter, setChartFilter] = useState({
    difficulty: "ALL",
    timeRange: "ALL"
  });
  const [stats, setStats] = useState<UserStats>({
    totalGames: 0,
    totalScore: 0,
    totalCorrect: 0,
    averageScore: 0,
    highestScore: 0,
    totalTimePlayed: 0,
    byDifficulty: {
      easy: { games: 0, avgScore: 0 },
      medium: { games: 0, avgScore: 0 },
      hard: { games: 0, avgScore: 0 }
    },
    recentActivity: [],
    scoreHistory: []
  });
  
  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const userDoc = await getDoc(doc(db, 'users', user.id));
        if (!userDoc.exists()) {
          console.error('User document not found');
          return;
        }
        
        const userData = userDoc.data();
        const userStats = userData.stats || {};
        
        // Ensure all required properties exist with defaults
        const safeStats = {
          totalGames: userStats.totalGames || 0,
          totalScore: userStats.totalScore || 0,
          totalCorrect: userStats.totalCorrect || 0,
          averageScore: userStats.averageScore || 0,
          highestScore: userStats.highestScore || 0,
          totalTimePlayed: userStats.totalTimePlayed || 0,
          byDifficulty: {
            easy: { 
              games: userStats.byDifficulty?.easy?.total || 0, 
              avgScore: userStats.byDifficulty?.easy?.avgScore || 0 
            },
            medium: { 
              games: userStats.byDifficulty?.medium?.total || 0, 
              avgScore: userStats.byDifficulty?.medium?.avgScore || 0 
            },
            hard: { 
              games: userStats.byDifficulty?.hard?.total || 0, 
              avgScore: userStats.byDifficulty?.hard?.avgScore || 0 
            }
          },
          recentActivity: userStats.recentActivity || [],
          scoreHistory: userStats.scoreHistory || []
        };
        
        setStats(safeStats);
      } catch (error) {
        console.error('Error fetching user stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserStats();
  }, [user, setStats]);
  
  // Fetch user's global rank
  useEffect(() => {
    const fetchUserRank = async () => {
      if (!user) return;
      
      try {
        const response = await api.getLeaderboard({
          limit: 100 // Fetch a larger number to ensure we find the user
        });
        
        // Sort by highestScore in descending order, then by time in ascending order for tiebreaks
        // This matches exactly how the leaderboard page sorts entries
        const sortedLeaderboard = [...response].sort((a, b) => {
          if (b.highestScore !== a.highestScore) {
            return b.highestScore - a.highestScore;
          }
          return a.time - b.time;
        });
        
        const userIndex = sortedLeaderboard.findIndex(entry => entry.name === user.name);
        setUserRank(userIndex !== -1 ? userIndex + 1 : null);
      } catch (error) {
        console.error('Error fetching leaderboard for rank:', error);
      }
    };
    
    fetchUserRank();
  }, [user]);
  
  const calculatePercentage = (correct: number, total: number) => {
    return total > 0 ? Math.round((correct / total) * 100) : 0;
  };
  
  // Filter chart data based on selected filters
  const getFilteredChartData = () => {
    if (!stats.scoreHistory.length) return [];
    
    let filteredData = [...stats.scoreHistory];
    
    // Filter by difficulty if not ALL
    if (chartFilter.difficulty !== "ALL") {
      const difficultyLower = chartFilter.difficulty.toLowerCase();
      // Find matching activities with the selected difficulty
      const matchingDates = stats.recentActivity
        .filter(activity => activity.difficulty.toLowerCase() === difficultyLower)
        .map(activity => activity.date);
      
      // Only keep score history entries that match dates from activities with the selected difficulty
      if (matchingDates.length > 0) {
        filteredData = filteredData.filter(item => matchingDates.includes(item.date));
      }
    }
    
    // Filter by time range
    if (chartFilter.timeRange !== "ALL") {
      const now = new Date();
      const cutoffDate = new Date();
      
      switch(chartFilter.timeRange) {
        case "WEEK":
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case "MONTH":
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        case "YEAR":
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filteredData = filteredData.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= cutoffDate;
      });
    }
    
    return filteredData;
  };
  
  const renderScoreChart = () => {
    const chartData = getFilteredChartData();
    
    return (
      <div className="h-[300px] w-full">
        <div className="flex justify-between mb-4">
          <div className="flex space-x-4">
            <div className="relative">
              <select 
                value={chartFilter.difficulty}
                onChange={(e) => setChartFilter({ ...chartFilter, difficulty: e.target.value })}
                className="appearance-none bg-black border border-white/20 px-4 py-2 pr-8 text-sm uppercase tracking-wider focus:border-[rgb(var(--primary))] transition-colors"
              >
                <option value="ALL">All Difficulties</option>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            
            <div className="relative">
              <select 
                value={chartFilter.timeRange}
                onChange={(e) => setChartFilter({ ...chartFilter, timeRange: e.target.value })}
                className="appearance-none bg-black border border-white/20 px-4 py-2 pr-8 text-sm uppercase tracking-wider focus:border-[rgb(var(--primary))] transition-colors"
              >
                <option value="ALL">All Time</option>
                <option value="WEEK">This Week</option>
                <option value="MONTH">This Month</option>
                <option value="YEAR">This Year</option>
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height="85%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
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
              labelStyle={{ color: 'rgba(255,255,255,0.6)' }}
              itemStyle={{ color: 'rgb(217, 196, 164)' }}
            />
            <Line 
              type="monotone"
              dataKey="score" 
              stroke="rgb(217, 196, 164)"
              strokeWidth={2}
              dot={{ r: 4, fill: "rgb(217, 196, 164)" }}
              activeDot={{ r: 6, fill: "rgb(217, 196, 164)" }}
            />
          </LineChart>
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
                      <div className="swiss-label mb-2">Highest Score</div>
                      <div className="text-4xl font-bold">{stats.highestScore}</div>
                    </div>
                    
                    <div className="swiss-card">
                      <div className="swiss-label mb-2">Global Rank</div>
                      <div className="text-4xl font-bold">
                        {userRank ? (
                          <span>#{userRank}</span>
                        ) : (
                          <span className="text-white/60">-</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="swiss-card">
                      <div className="swiss-label mb-2">Average Score</div>
                      <div className="text-4xl font-bold">
                        {stats.totalGames > 0
                          ? (stats.totalScore / stats.totalGames).toFixed(1)
                          : "0.0"}
                      </div>
                    </div>
                    
                    <div className="swiss-card">
                      <div className="swiss-label mb-2">Total Games</div>
                      <div className="text-4xl font-bold">{stats.totalGames}</div>
                    </div>
                  </div>
                  
                  {/* Bottom row - Charts and details */}
                  <div className="col-span-12 grid grid-cols-12 gap-8 h-[calc(100%-120px)]">
                    {/* Score Growth Chart */}
                    <div className="col-span-7 swiss-card">
                      <h2 className="swiss-heading mb-8">Score Growth</h2>
                      {renderScoreChart()}
                    </div>
                    
                    {/* Difficulty Stats */}
                    <div className="col-span-3 swiss-card flex flex-col">
                      <h2 className="swiss-heading mb-8">Difficulty</h2>
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
                        {stats.recentActivity.length > 0 ? (
                          stats.recentActivity.slice(0, 3).map((activity, index) => (
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
                          ))
                        ) : (
                          <div className="text-sm text-white/60">Don&apos;t worry if you haven&apos;t played many games yet!</div>
                        )}
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
