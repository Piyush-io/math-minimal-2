import { doc, getDoc, setDoc, updateDoc, collection, query, orderBy, limit, where, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';

interface GameActivity {
  score: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  time: number;
  date: string;
}

interface UserStats {
  totalGames: number;
  totalScore: number;
  averageScore: number;
  highestScore: number;
  byOperation: {
    addition: { total: number; correct: number };
    multiplication: { total: number; correct: number };
  };
  byDifficulty: {
    easy: { total: number; correct: number; avgScore: number };
    medium: { total: number; correct: number; avgScore: number };
    hard: { total: number; correct: number; avgScore: number };
  };
  scoreHistory: Array<{ score: number; date: string }>;
  recentActivity: GameActivity[];
}

interface UserData {
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  stats: UserStats;
  settings: {
    theme: string;
    sound: boolean;
    notifications: boolean;
  };
}

interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  highestScore: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'ALL';
  time: number;
  date: string;
}

export const api = {
  async getUser(id: string) {
    const docRef = doc(db, 'users', id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) throw new Error('User not found');
    return { id: docSnap.id, ...docSnap.data() } as UserData & { id: string };
  },

  async createUser(userData: { name: string; email: string }) {
    const userRef = doc(collection(db, 'users'));
    
    const user: UserData = {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
      stats: {
        totalGames: 0,
        totalScore: 0,
        averageScore: 0,
        highestScore: 0,
        byOperation: {
          addition: { total: 0, correct: 0 },
          multiplication: { total: 0, correct: 0 }
        },
        byDifficulty: {
          easy: { total: 0, correct: 0, avgScore: 0 },
          medium: { total: 0, correct: 0, avgScore: 0 },
          hard: { total: 0, correct: 0, avgScore: 0 }
        },
        scoreHistory: [],
        recentActivity: []
      },
      settings: {
        theme: 'dark',
        sound: true,
        notifications: true
      }
    };
    await setDoc(userRef, user);
    return { id: userRef.id, ...user };
  },

  async updateStats(userId: string, gameResult: {
    score: number;
    difficulty: string;
    operation: '+' | '*';
    time: number;
    correct: boolean;
  }) {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) throw new Error('User not found');

    const userData = userDoc.data() as UserData;
    const stats = { ...userData.stats };
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];

    // Update total stats
    stats.totalGames++;
    stats.totalScore += gameResult.score;
    stats.averageScore = Math.round(stats.totalScore / stats.totalGames);
    stats.highestScore = Math.max(stats.highestScore, gameResult.score);

    // Update operation stats
    const op = gameResult.operation === '+' ? 'addition' : 'multiplication';
    stats.byOperation[op].total++;
    if (gameResult.correct) stats.byOperation[op].correct++;

    // Update difficulty stats
    const diff = gameResult.difficulty.toLowerCase() as 'easy' | 'medium' | 'hard';
    stats.byDifficulty[diff].total++;
    if (gameResult.correct) {
      stats.byDifficulty[diff].correct++;
      stats.byDifficulty[diff].avgScore = Math.round(
        (stats.byDifficulty[diff].avgScore * (stats.byDifficulty[diff].correct - 1) + gameResult.score) /
        stats.byDifficulty[diff].correct
      );
    }

    // Update score history
    stats.scoreHistory.push({ score: gameResult.score, date: dateStr });
    if (stats.scoreHistory.length > 30) {
      stats.scoreHistory = stats.scoreHistory.slice(-30);
    }

    // Update recent activity
    stats.recentActivity.unshift({
      score: gameResult.score,
      difficulty: gameResult.difficulty.toUpperCase() as 'EASY' | 'MEDIUM' | 'HARD',
      time: gameResult.time,
      date: dateStr
    });
    if (stats.recentActivity.length > 10) {
      stats.recentActivity = stats.recentActivity.slice(0, 10);
    }

    await updateDoc(userRef, {
      stats,
      updatedAt: now
    });

    return { message: 'Stats updated successfully' };
  },

  async getLeaderboard(options: {
    difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
    timeFilter?: 'FAST' | 'MEDIUM' | 'SLOW' | 'ALL';
    limit?: number;
  } = {}) {
    const { difficulty, timeFilter = 'ALL', limit: limitCount = 50 } = options;
    
    let q;
    if (difficulty) {
      q = query(
        collection(db, 'users'),
        orderBy(`stats.byDifficulty.${difficulty.toLowerCase()}.avgScore`, 'desc'),
        limit(limitCount * 3)
      );
    } else {
      q = query(
        collection(db, 'users'),
        orderBy('stats.highestScore', 'desc'),
        limit(limitCount * 3)
      );
    }

    const snapshot = await getDocs(q);
    const entries = snapshot.docs
      .map(doc => {
        const data = doc.data() as UserData;
        
        // Skip users with no stats
        if (!data.stats || !data.name) return null;
        
        // Apply difficulty filter in memory
        if (difficulty && 
            (!data.stats.byDifficulty || 
             !data.stats.byDifficulty[difficulty.toLowerCase() as 'easy' | 'medium' | 'hard'] || 
             data.stats.byDifficulty[difficulty.toLowerCase() as 'easy' | 'medium' | 'hard'].total <= 0)) {
          return null;
        }
        
        const recentGames = Array.isArray(data.stats.recentActivity) 
          ? data.stats.recentActivity.filter((game: GameActivity) => {
              const matchesDifficulty = !difficulty || game.difficulty === difficulty;
              
              // Apply time filter
              let matchesTimeFilter = true;
              if (timeFilter !== 'ALL') {
                switch(timeFilter) {
                  case 'FAST':
                    matchesTimeFilter = game.time <= 30;
                    break;
                  case 'MEDIUM':
                    matchesTimeFilter = game.time > 30 && game.time <= 60;
                    break;
                  case 'SLOW':
                    matchesTimeFilter = game.time > 60;
                    break;
                }
              }
              
              return matchesDifficulty && matchesTimeFilter;
            })
          : [];

        if (recentGames.length === 0) return null;

        // Calculate average score for the time period
        const avgScore = recentGames.reduce((sum, game) => sum + game.score, 0) / recentGames.length;
        const bestGame = recentGames.reduce((best, game) => 
          (!best || game.score > best.score) ? game : best
        , null as GameActivity | null);

        if (!bestGame) return null;

        const entry: LeaderboardEntry = {
          id: doc.id,
          name: data.name,
          score: difficulty ? data.stats.byDifficulty[difficulty.toLowerCase() as 'easy' | 'medium' | 'hard'].avgScore : avgScore,
          highestScore: bestGame.score,
          difficulty: difficulty || bestGame.difficulty || 'ALL',
          time: bestGame.time,
          date: bestGame.date || (data.updatedAt ? data.updatedAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0])
        };

        return entry;
      })
      .filter((entry): entry is LeaderboardEntry => entry !== null)
      .sort((a, b) => {
        // Sort by score first, then by time (faster times are better)
        if (Math.abs(b.score - a.score) > 0.1) {
          return b.score - a.score;
        }
        return a.time - b.time;
      })
      .slice(0, limitCount);

    return entries;
  }
};
