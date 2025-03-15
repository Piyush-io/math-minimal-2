"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';

interface Game {
  score: number;
  difficulty: string;
  time: number;
  date: string;
}

interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  difficulty: string;
  time: number;
  date: string;
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [filter, setFilter] = useState({
    difficulty: "ALL",
    timeRange: "ALL"
  });
  
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        let q = query(
          collection(db, 'users'),
          orderBy('stats.highestScore', 'desc'),
          limit(50)
        );

        if (filter.difficulty !== 'ALL') {
          const difficultyPath = `stats.byDifficulty.${filter.difficulty.toLowerCase()}`;
          q = query(
            collection(db, 'users'),
            where(`${difficultyPath}.total`, '>', 0),
            orderBy(`${difficultyPath}.avgScore`, 'desc'),
            limit(50)
          );
        }

        const snapshot = await getDocs(q);
        const leaderboardData = snapshot.docs.map(doc => {
          const data = doc.data();
          const diffStats = filter.difficulty !== 'ALL' 
            ? data.stats.byDifficulty[filter.difficulty.toLowerCase()]
            : null;
          const recentGame = data.stats.recentActivity.find(game => 
            filter.difficulty === 'ALL' || game.difficulty === filter.difficulty
          ) || {
            score: diffStats?.avgScore || data.stats.highestScore,
            difficulty: filter.difficulty !== 'ALL' ? filter.difficulty : 'UNKNOWN',
            time: 0,
            date: data.updatedAt.toDate().toISOString().split('T')[0]
          };

          return {
            id: doc.id,
            name: data.name,
            score: filter.difficulty !== 'ALL' ? diffStats.avgScore : data.stats.highestScore,
            difficulty: recentGame.difficulty,
            time: recentGame.time,
            date: recentGame.date
          };
        });

        setLeaderboard(leaderboardData);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [filter.difficulty]);
  
  const filteredLeaderboard = leaderboard.filter(entry => {
    if (filter.difficulty !== "ALL" && entry.difficulty !== filter.difficulty) {
      return false;
    }
    
    // In a real app, you would filter by date range
    return true;
  });
  
  const topThree = filteredLeaderboard.slice(0, 3);
  const restOfLeaderboard = filteredLeaderboard.slice(3);
  
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-black text-white">
        <Navbar />
        
        <main className="flex-1 flex items-start justify-center py-6">
          <div className="swiss-container py-4">
            <div className="mb-8">
              <div className="swiss-divider mb-6"></div>
              <p className="swiss-subtitle">Leaderboard Rankings</p>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-2xl text-white/60">Loading leaderboard...</div>
              </div>
            ) : (
              <div className="h-[calc(100vh-240px)] flex flex-col">
                <div className="flex justify-between mb-8">
                  <div className="flex space-x-4">
                    <div className="relative">
                      <select 
                        value={filter.difficulty}
                        onChange={(e) => setFilter({ ...filter, difficulty: e.target.value })}
                        className="appearance-none bg-black border border-white/20 px-6 py-3 pr-12 text-sm uppercase tracking-wider focus:border-[rgb(var(--primary))] transition-colors"
                      >
                        <option value="ALL">All Difficulties</option>
                        <option value="EASY">Easy</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HARD">Hard</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <select 
                        value={filter.timeRange}
                        onChange={(e) => setFilter({ ...filter, timeRange: e.target.value })}
                        className="appearance-none bg-black border border-white/20 px-6 py-3 pr-12 text-sm uppercase tracking-wider focus:border-[rgb(var(--primary))] transition-colors"
                      >
                        <option value="ALL">All Time</option>
                        <option value="WEEK">This Week</option>
                        <option value="MONTH">This Month</option>
                        <option value="YEAR">This Year</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-12 gap-8 h-[calc(100%-80px)]">
                  {/* Top 3 Podium */}
                  <div className="col-span-4">
                    <div className="flex flex-col h-full">
                      <h2 className="swiss-heading mb-6">Podium</h2>
                      <div className="flex-1 flex items-end justify-center">
                        <div className="flex items-end justify-center gap-6 w-full">
                          {topThree[1] && (
                            <div className="flex flex-col items-center">
                              <div className="swiss-card bg-black/50 p-4 text-center mb-3">
                                <div className="text-base font-bold mb-1">{topThree[1].name}</div>
                                <div className="text-3xl font-bold text-[rgb(var(--primary))]">{topThree[1].score.toFixed(1)}</div>
                              </div>
                              <div className="w-28 h-28 flex items-center justify-center bg-[rgb(var(--primary))]/5 border border-[rgb(var(--primary))]/20">
                                <div className="text-4xl font-bold text-[rgb(var(--primary))]">2</div>
                              </div>
                            </div>
                          )}
                          
                          {topThree[0] && (
                            <div className="flex flex-col items-center -mt-8">
                              <div className="swiss-card bg-black/50 p-4 text-center mb-3">
                                <div className="text-base font-bold mb-1">{topThree[0].name}</div>
                                <div className="text-3xl font-bold text-[rgb(var(--primary))]">{topThree[0].score.toFixed(1)}</div>
                              </div>
                              <div className="w-32 h-32 flex items-center justify-center bg-[rgb(var(--primary))]/10 border border-[rgb(var(--primary))]/30">
                                <div className="text-5xl font-bold text-[rgb(var(--primary))]">1</div>
                              </div>
                            </div>
                          )}
                          
                          {topThree[2] && (
                            <div className="flex flex-col items-center mt-8">
                              <div className="swiss-card bg-black/50 p-4 text-center mb-3">
                                <div className="text-base font-bold mb-1">{topThree[2].name}</div>
                                <div className="text-3xl font-bold text-[rgb(var(--primary))]">{topThree[2].score.toFixed(1)}</div>
                              </div>
                              <div className="w-24 h-24 flex items-center justify-center bg-[rgb(var(--primary))]/5 border border-[rgb(var(--primary))]/20">
                                <div className="text-3xl font-bold text-[rgb(var(--primary))]">3</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Leaderboard Table */}
                  <div className="col-span-8">
                    <h2 className="swiss-heading mb-6">Rankings</h2>
                    <div className="h-[calc(100%-40px)] swiss-card">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="swiss-label text-left pb-4 w-16">Rank</th>
                            <th className="swiss-label text-left pb-4">Name</th>
                            <th className="swiss-label text-right pb-4 w-24">Score</th>
                            <th className="swiss-label text-right pb-4 w-28">Difficulty</th>
                          </tr>
                        </thead>
                        <tbody>
                          {restOfLeaderboard.map((entry, index) => (
                            <tr 
                              key={entry.id} 
                              className={`border-b border-white/5 ${user?.name === entry.name ? 'bg-white/5' : ''}`}
                            >
                              <td className="py-4 text-base">{index + 4}</td>
                              <td className="py-4 text-base font-bold">{entry.name}</td>
                              <td className="py-4 text-base text-right">{entry.score.toFixed(1)}</td>
                              <td className="py-4 text-base text-right">{entry.difficulty}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
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
