"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";
import { motion } from "framer-motion";

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
  highestScore: number;
  difficulty: string;
  time: number;
  date: string;
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [filter, setFilter] = useState({
    difficulty: "ALL",
    timeFilter: "ALL",
    timeRange: "ALL",
  });

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const response = await api.getLeaderboard({
          difficulty:
            filter.difficulty !== "ALL"
              ? (filter.difficulty as "EASY" | "MEDIUM" | "HARD")
              : undefined,
          timeFilter: filter.timeFilter as "FAST" | "MEDIUM" | "SLOW" | "ALL",
          limit: 10,
        });

        // Filter out invalid scores and sort
        const sortedLeaderboard = [...response]
          .filter(entry => entry.highestScore <= 150) // Filter out abnormal scores
          .sort((a, b) => {
            if (b.highestScore !== a.highestScore) {
              return b.highestScore - a.highestScore;
            }
            return a.time - b.time;
          });

        setLeaderboard(sortedLeaderboard);
        const userIndex = sortedLeaderboard.findIndex(
          (entry) => entry.name === user?.name,
        );
        setUserRank(userIndex !== -1 ? userIndex + 1 : null);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [filter.difficulty, filter.timeFilter, filter.timeRange, user?.name]);

  // Get top three players
  const topThree = leaderboard.slice(0, 3);
  // Ensure we have references to first, second, and third place
  const firstPlace = topThree.length > 0 ? topThree[0] : null;
  const secondPlace = topThree.length > 1 ? topThree[1] : null;
  const thirdPlace = topThree.length > 2 ? topThree[2] : null;

  const FilterButton = ({
    active,
    onClick,
    children,
  }: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
  }) => (
    <button
      onClick={onClick}
      className={`px-3 py-1 text-xs uppercase tracking-wider transition-all duration-300 ${
        active
          ? "bg-[rgb(var(--primary))] text-black font-bold"
          : "bg-transparent border border-white/20 text-white hover:border-[rgb(var(--primary))]"
      }`}
    >
      {children}
    </button>
  );

  return (
    <ProtectedRoute>
      <div className="h-screen flex flex-col bg-black text-white overflow-hidden">
        <Navbar />

        <main className="flex-1 flex items-start justify-center py-6">
          <div className="swiss-container max-w-7xl w-full py-4">
            <div className="mb-6">
              <div className="swiss-divider mb-4"></div>
              <p className="swiss-subtitle">Leaderboard Rankings</p>
              {userRank && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 text-sm text-white/60"
                >
                  Your Current Rank:{" "}
                  <span className="text-[rgb(var(--primary))] font-bold">
                    #{userRank}
                  </span>
                </motion.div>
              )}
            </div>

            <div className="flex gap-2 mb-8">
              <FilterButton
                active={filter.difficulty === "ALL"}
                onClick={() => setFilter({ ...filter, difficulty: "ALL" })}
              >
                All
              </FilterButton>
              <FilterButton
                active={filter.difficulty === "EASY"}
                onClick={() => setFilter({ ...filter, difficulty: "EASY" })}
              >
                Easy
              </FilterButton>
              <FilterButton
                active={filter.difficulty === "MEDIUM"}
                onClick={() => setFilter({ ...filter, difficulty: "MEDIUM" })}
              >
                Medium
              </FilterButton>
              <FilterButton
                active={filter.difficulty === "HARD"}
                onClick={() => setFilter({ ...filter, difficulty: "HARD" })}
              >
                Hard
              </FilterButton>
            </div>

            {loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex justify-center items-center h-[calc(100vh-280px)]"
              >
                <div className="swiss-loader"></div>
              </motion.div>
            ) : leaderboard.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col items-center justify-center text-center h-[calc(100vh-280px)]"
              >
                <p className="text-2xl font-bold mb-4">No entries yet</p>
                <p className="text-white/60">
                  Be the first to make it to the leaderboard!
                </p>
              </motion.div>
            ) : (
              <div className="h-[calc(100vh-280px)]">
                {/* Main Container */}
                <div className="flex flex-col h-full">
                  {/* Two Column Layout */}
                  <div className="flex h-full rounded-lg overflow-hidden border border-white/10 backdrop-blur-sm bg-black/30 shadow-[0_0_25px_rgba(var(--primary),0.1)]">
                    {/* Podium Section - Left */}
                    <div className="w-[400px] border-r border-white/10 flex flex-col">
                      <div className="p-4 border-b border-white/10 bg-black/50">
                        <h2 className="text-xs uppercase tracking-wider font-medium text-white/70 flex items-center">
                          <svg
                            className="w-4 h-4 mr-2 text-[rgb(var(--primary))]"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M12 15L8.5 10L15.5 10L12 15Z"
                              fill="currentColor"
                            />
                            <path d="M6 20V19H18V20H6Z" fill="currentColor" />
                            <path d="M7 9.5V4H9V9.5H7Z" fill="currentColor" />
                            <path
                              d="M11 9.5V4H13V9.5H11Z"
                              fill="currentColor"
                            />
                            <path
                              d="M15 9.5V4H17V9.5H15Z"
                              fill="currentColor"
                            />
                          </svg>
                          Champions Podium
                        </h2>
                      </div>
                      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-b from-black/0 to-black/30">
                        <div className="flex items-end gap-6">
                          {/* Second Place - Left */}
                          <div className="w-28 flex flex-col relative group order-1">
                            <div className="absolute inset-0 bg-gradient-to-b from-[rgba(var(--primary),0.1)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 -m-1 rounded-lg"></div>
                            <div className="bg-black border border-white/10 p-3 text-center mb-2 rounded-t-lg relative z-10">
                              <div className="text-sm font-bold leading-tight">
                                {secondPlace ? (
                                  <div className="truncate" title={secondPlace.name}>
                                    {secondPlace.name.length > 12 
                                      ? secondPlace.name.slice(0, 12) + '...' 
                                      : secondPlace.name}
                                  </div>
                                ) : '-'}
                              </div>
                              <div className="text-2xl font-bold text-[rgb(var(--primary))]">{secondPlace?.highestScore.toFixed(1) || '0.0'}</div>
                              <div className="text-xs text-white/60">{secondPlace ? `${Math.round(secondPlace.time)}s` : '-'}</div>
                            </div>
                            <div className="h-[100px] bg-black border border-white/10 flex items-center justify-center relative z-10 rounded-b-lg">
                              <div className="text-4xl font-bold text-white/80">2</div>
                            </div>
                          </div>

                          {/* First Place - Middle */}
                          <div className="w-28 flex flex-col relative group z-20 order-2">
                            <div className="absolute inset-0 bg-gradient-to-b from-[rgba(var(--primary),0.2)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 -m-1 rounded-lg"></div>
                            <div className="bg-black border border-[rgb(var(--primary))]/30 p-3 text-center mb-2 rounded-t-lg relative z-10 shadow-[0_0_15px_rgba(var(--primary),0.2)]">
                              <div className="text-sm font-bold leading-tight">
                                {firstPlace ? (
                                  <div className="truncate" title={firstPlace.name}>
                                    {firstPlace.name.length > 12 
                                      ? firstPlace.name.slice(0, 12) + '...' 
                                      : firstPlace.name}
                                  </div>
                                ) : '-'}
                              </div>
                              <div className="text-2xl font-bold text-[rgb(var(--primary))]">{firstPlace?.highestScore.toFixed(1) || '0.0'}</div>
                              <div className="text-xs text-white/60">{firstPlace ? `${Math.round(firstPlace.time)}s` : '-'}</div>
                            </div>
                            <div className="h-[140px] bg-black border border-[rgb(var(--primary))]/30 flex items-center justify-center relative z-10 rounded-b-lg shadow-[0_0_15px_rgba(var(--primary),0.2)]">
                              <div className="text-4xl font-bold text-[rgb(var(--primary))]">1</div>
                            </div>
                          </div>

                          {/* Third Place - Right */}
                          <div className="w-28 flex flex-col relative group order-3">
                            <div className="absolute inset-0 bg-gradient-to-b from-[rgba(var(--primary),0.1)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 -m-1 rounded-lg"></div>
                            <div className="bg-black border border-white/10 p-3 text-center mb-2 rounded-t-lg relative z-10">
                              <div className="text-sm font-bold leading-tight">
                                {thirdPlace ? (
                                  <div className="truncate" title={thirdPlace.name}>
                                    {thirdPlace.name.length > 12 
                                      ? thirdPlace.name.slice(0, 12) + '...' 
                                      : thirdPlace.name}
                                  </div>
                                ) : '-'}
                              </div>
                              <div className="text-2xl font-bold text-[rgb(var(--primary))]">{thirdPlace?.highestScore.toFixed(1) || '0.0'}</div>
                              <div className="text-xs text-white/60">{thirdPlace ? `${Math.round(thirdPlace.time)}s` : '-'}</div>
                            </div>
                            <div className="h-[80px] bg-black border border-white/10 flex items-center justify-center relative z-10 rounded-b-lg">
                              <div className="text-4xl font-bold text-white/80">3</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Table Section - Right */}
                    <div className="flex-1 flex flex-col">
                      <div className="p-4 border-b border-white/10 bg-black/50">
                        <h2 className="text-xs uppercase tracking-wider font-medium text-white/70 flex items-center">
                          <svg
                            className="w-4 h-4 mr-2 text-[rgb(var(--primary))]"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M3 4H21V6H3V4Z" fill="currentColor" />
                            <path d="M3 11H21V13H3V11Z" fill="currentColor" />
                            <path d="M3 18H21V20H3V18Z" fill="currentColor" />
                          </svg>
                          Global Rankings
                        </h2>
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-black/50">
                            <tr className="border-b border-white/10">
                              <th className="text-left p-4 w-16 text-xs font-medium uppercase tracking-wider">
                                #
                              </th>
                              <th className="text-left p-4 text-xs font-medium uppercase tracking-wider">
                                Player
                              </th>
                              <th className="text-right p-4 w-32 text-xs font-medium uppercase tracking-wider">
                                Score
                              </th>
                              <th className="text-right p-4 w-32 text-xs font-medium uppercase tracking-wider">
                                Time
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {leaderboard.map((entry, index) => (
                              <motion.tr
                                key={entry.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.03 }}
                                className={`border-b border-white/5 transition-all duration-300 hover:bg-[rgba(var(--primary),0.05)] ${
                                  user?.name === entry.name
                                    ? "bg-[rgba(var(--primary),0.1)]"
                                    : index % 2 === 0
                                      ? "bg-black/20"
                                      : "bg-black/10"
                                }`}
                              >
                                <td className="p-4 text-sm font-mono relative">
                                  {index < 3 && (
                                    <span className="absolute left-0 top-0 bottom-0 w-1 bg-[rgb(var(--primary))]"></span>
                                  )}
                                  <span
                                    className={
                                      index < 3
                                        ? "text-[rgb(var(--primary))] font-bold"
                                        : ""
                                    }
                                  >
                                    {index + 1}
                                  </span>
                                </td>
                                <td className="p-4 text-sm font-medium truncate">
                                  {entry.name}
                                  {user?.name === entry.name && (
                                    <span className="ml-2 text-xs text-[rgb(var(--primary))]">
                                      (You)
                                    </span>
                                  )}
                                </td>
                                <td className="p-4 text-sm text-right font-mono">
                                  {entry.highestScore.toFixed(1)}
                                </td>
                                <td className="p-4 text-sm text-right font-mono">
                                  {Math.round(entry.time)}s
                                </td>
                              </motion.tr>
                            ))}

                            {leaderboard.length < 10 && (
                              <tr className="border-b border-white/5 bg-black/10">
                                <td className="p-4 text-sm font-mono">
                                  {leaderboard.length + 1}
                                </td>
                                <td className="p-4 text-sm text-white/30">-</td>
                                <td className="p-4 text-sm text-right text-white/30 font-mono">
                                  -
                                </td>
                                <td className="p-4 text-sm text-right text-white/30 font-mono">
                                  -
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
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
