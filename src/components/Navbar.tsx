"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  
  return (
    <header className="w-full px-6 py-4 bg-black text-white">
      <div className="max-w-[95vw] mx-auto flex justify-between items-center">
        <Link href="/" className="text-3xl font-bold tracking-tighter group">
          <span className="group-hover:text-[rgb(var(--primary))] transition-colors duration-300">MATH.MINIMAL</span>
        </Link>
        
        {user && (
          <nav className="flex items-center space-x-16">
            <Link 
              href="/profile" 
              className={`relative px-1 py-2 text-sm uppercase tracking-wider transition-colors duration-300 ${
                pathname === '/profile' 
                  ? 'text-[rgb(var(--primary))]' 
                  : 'text-white hover:text-[rgb(var(--primary))]'
              }`}
            >
              {pathname === '/profile' && (
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[rgb(var(--primary))]"></div>
              )}
              Profile
            </Link>
            
            <Link 
              href="/board" 
              className={`relative px-1 py-2 text-sm uppercase tracking-wider transition-colors duration-300 ${
                pathname === '/board' 
                  ? 'text-[rgb(var(--primary))]' 
                  : 'text-white hover:text-[rgb(var(--primary))]'
              }`}
            >
              {pathname === '/board' && (
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[rgb(var(--primary))]"></div>
              )}
              TOP
            </Link>
            
            <Link 
              href="/settings" 
              className={`relative px-1 py-2 text-sm uppercase tracking-wider transition-colors duration-300 ${
                pathname === '/settings' 
                  ? 'text-[rgb(var(--primary))]' 
                  : 'text-white hover:text-[rgb(var(--primary))]'
              }`}
            >
              {pathname === '/settings' && (
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[rgb(var(--primary))]"></div>
              )}
              CONFIG
            </Link>
            
            <button 
              onClick={logout}
              className="px-1 py-2 text-sm uppercase tracking-wider text-white hover:text-[rgb(var(--primary))] transition-colors duration-300"
            >
              Logout
            </button>
          </nav>
        )}
        
        {!user && (
          <Link 
            href="/login" 
            className="px-6 py-3 text-sm uppercase tracking-wider text-black bg-[rgb(var(--primary))] hover:bg-[rgb(var(--primary))]/90 transition-colors duration-300"
          >
            Login
          </Link>
        )}
      </div>
    </header>
  );
} 