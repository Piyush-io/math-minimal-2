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
        if (password.length < 6) {
          throw new Error("Password should be at least 6 characters");
        }
        if (onSignup) {
          onSignup(email, password, name);
        } else {
          await signup(email, password, name);
        }
      }
    } catch (error) {
      let errorMessage = "An error occurred";

      if (error instanceof Error) {
        // Handle Firebase auth errors with user-friendly messages
        if (error.message.includes('auth/invalid-credential') || 
            error.message.includes('auth/user-not-found') || 
            error.message.includes('auth/wrong-password')) {
          errorMessage = "Invalid email or password";
        } else if (error.message.includes('auth/weak-password')) {
          errorMessage = "Password should be at least 6 characters";
        } else if (error.message.includes('auth/email-already-in-use')) {
          errorMessage = "Email is already in use";
        } else if (error.message.includes('auth/invalid-email')) {
          errorMessage = "Invalid email format";
        } else {
          errorMessage = error.message;
        }
      }

      setError(errorMessage);
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
            placeholder={isLogin ? "Your password" : "Min. 6 characters"}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="swiss-btn w-full py-2 px-4 text-black font-medium rounded-md hover:bg-[rgb(var(--primary))] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgb(var(--primary))] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            isLogin ? "Sign In" : "Create Account"
          )}
        </button>

        <div className="text-center mt-2">
          <button
            type="button"
            onClick={toggleMode}
            disabled={loading}
            className="swiss-btn-outline w-full py-2 px-4"
          >
            {isLogin ? "Create Account" : "Back to Login"}
          </button>
        </div>
      </form>
      {error && <p className="text-red-500 text-center mt-2">{error}</p>}
    </div>
  );
}
