"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import LoginForm from "@/components/LoginForm";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, login, signup } = useAuth();
  
  useEffect(() => {
    // If user is already logged in, redirect to home
    if (user && !loading) {
      router.push("/");
    }
  }, [user, loading, router]);
  
  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      router.push("/");
    } catch (error) {
      console.error("Login error:", error);
    }
  };
  
  const handleSignup = async (email: string, password: string, name: string) => {
    try {
      await signup(email, password, name);
      router.push("/");
    } catch (error) {
      console.error("Signup error:", error);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-2xl text-white/60">Loading...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex bg-black text-white">
      <div className="w-1/2 h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          <div className="text-white text-[120px] font-bold leading-none relative">
          <div className="flex justify-center mb-4">
              <img
                src="/frame.png"
                alt="Scribbles"
                width={500}
                height={500}
                style={{ objectFit: "contain" }}
              />
            </div>
            <div>
              MATH.
              <br />
              MINIMAL
            </div>
          </div>
        </div>
      </div>
      
      <div className="w-1/2 h-screen flex items-center justify-center">
        <div className="w-full max-w-[400px] px-8">
          <LoginForm 
            onLogin={handleLogin}
            onSignup={handleSignup}
          />
        </div>
      </div>
    </div>
  );
}
