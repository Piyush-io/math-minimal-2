"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/config/firebase";

type User = {
  id: string;
  name: string;
  email: string;
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          const userData = userDoc.data();
          
          setUser({
            id: firebaseUser.uid,
            name: userData?.name || firebaseUser.displayName || "User",
            email: firebaseUser.email || "",
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Authentication error:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { user: firebaseUser } = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
      const userData = userDoc.data();

      setUser({
        id: firebaseUser.uid,
        name: userData?.name || firebaseUser.displayName || "User",
        email: firebaseUser.email || "",
      });
      
      router.push("/");
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update Firebase user profile
      await updateProfile(firebaseUser, { displayName: name });
      
      // Create user document in Firestore
      await setDoc(doc(db, "users", firebaseUser.uid), {
        name,
        email,
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
      });

      setUser({
        id: firebaseUser.uid,
        name,
        email: firebaseUser.email || "",
      });
      
      router.push("/");
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  const updateUser = async (data: Partial<User>) => {
    if (!user) return;
    
    try {
      const userRef = doc(db, "users", user.id);
      await updateDoc(userRef, {
        ...data,
        updatedAt: new Date()
      });

      if (data.name) {
        const firebaseUser = auth.currentUser;
        if (firebaseUser) {
          await updateProfile(firebaseUser, { displayName: data.name });
        }
      }

      setUser({ ...user, ...data });
    } catch (error) {
      console.error("Update user error:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
