"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";

export default function SettingsPage() {
  const { user, loading: authLoading, updateUser } = useAuth();
  
  const [settings, setSettings] = useState({
    username: user?.name || "",
    email: user?.email || "",
    notifications: true,
    darkMode: true,
    soundEffects: true
  });
  
  // Update settings when user data changes
  useEffect(() => {
    if (user) {
      setSettings(prevSettings => ({
        ...prevSettings,
        username: user.name || "",
        email: user.email || ""
      }));
    }
  }, [user]);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === "checkbox" ? checked : value
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update user in context
      updateUser({
        name: settings.username,
        email: settings.email,
      });
      
      // Success message
      setMessage({
        text: "Settings updated successfully",
        type: "success"
      });
    } catch (error) {
      setMessage({
        text: "Failed to update settings",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-black text-white">
        <Navbar />
        
        <main className="flex-1 flex items-start justify-center py-6">
          <div className="swiss-container max-w-7xl w-full py-4 overflow-hidden">
            {authLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-2xl text-white/60">Loading settings...</div>
              </div>
            ) : (
              <div className="h-[calc(100vh-240px)] flex flex-col">
                <div className="mb-8">
                  <div className="swiss-divider mb-6"></div>
                  <p className="swiss-subtitle">User Preferences</p>
                </div>
                
                {message.text && (
                  <div 
                    className={`mb-6 p-3 ${
                      message.type === "success" ? "bg-[rgb(var(--primary))]/20 border-l-4 border-[rgb(var(--primary))]" : 
                      "bg-red-500/20 border-l-4 border-red-500"
                    }`}
                  >
                    {message.text}
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="flex-1 grid grid-cols-12 gap-6">
                  <div className="col-span-6">
                    <h2 className="swiss-heading mb-4 text-2xl">Account</h2>
                    
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div>
                        <label htmlFor="username" className="swiss-label block mb-2">
                          Username
                        </label>
                        <input
                          type="text"
                          id="username"
                          name="username"
                          value={settings.username}
                          onChange={handleChange}
                          className="swiss-input"
                          placeholder="Your username"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="swiss-label block mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={settings.email}
                          onChange={handleChange}
                          className="swiss-input"
                          placeholder="Your email address"
                        />
                      </div>
                    </div>
                    
                    <button
                      type="submit"
                      disabled={loading}
                      className="swiss-btn py-3 px-8 mt-4"
                    >
                      {loading ? "Saving..." : "Save Settings"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
