"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface LoginFormProps {
  onLogin?: (email: string, password: string) => void;
  onSignup?: (email: string, password: string, name: string) => void;
}

export default function LoginForm({ onLogin, onSignup }: LoginFormProps) {
  const { login, signup } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      if (isLogin) {
        if (onLogin) {
          onLogin(email, password);
        } else {
          await login(email, password);
        }
      } else {
        if (!name) {
          throw new Error("Name is required");
        }
        if (onSignup) {
          onSignup(email, password, name);
        } else {
          await signup(email, password, name);
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };
  
  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError("");
  };
  
  return (
    <div className="w-full max-w-md">

      
      <form onSubmit={handleSubmit} className="space-y-8">
        {!isLogin && (
          <div>
            <label htmlFor="name" className="swiss-label block mb-2">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="swiss-input"
              required
            />
          </div>
        )}
        
        <div>
          <label htmlFor="email" className="swiss-label block mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="swiss-input"
            required
          />
        </div>
        
        <div>
          <label htmlFor="password" className="swiss-label block mb-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="swiss-input"
            required
          />
        </div>
        
        {error && (
          <div className="bg-[rgb(var(--primary))]/10 border-l-4 border-[rgb(var(--primary))] p-3">
            {error}
          </div>
        )}
        
        <div className="pt-4 space-y-4">
          <button 
            type="submit"
            disabled={loading}
            className="swiss-btn w-full"
          >
            {isLogin ? "Login" : "Sign Up"}
          </button>
          
          <button 
            type="button"
            onClick={toggleMode}
            disabled={loading}
            className="swiss-btn-outline w-full"
          >
            {isLogin ? "Create Account" : "Back to Login"}
          </button>
        </div>
      </form>
    </div>
  );
}
