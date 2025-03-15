"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className="w-full px-6 py-4 bg-black text-white">
      <div className="max-w-[95vw] mx-auto flex justify-between items-center">
        <Link href="/" className="text-3xl font-bold tracking-tighter group">
          <span className="group-hover:text-[rgb(var(--primary))] transition-colors duration-300">MATH.MINIMAL</span>
        </Link>
        
        {/* Mobile menu button */}
        {user && (
          <button 
            className="md:hidden text-white focus:outline-none" 
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        )}
        
        {/* Desktop navigation */}
        {user && (
          <nav className="hidden md:flex items-center space-x-8 lg:space-x-16">
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
        
        {/* Mobile navigation */}
        {user && menuOpen && (
          <div className="md:hidden absolute top-16 right-0 left-0 bg-black z-50 border-t border-white/10">
            <nav className="flex flex-col p-4">
              <Link 
                href="/profile" 
                className={`px-4 py-3 text-sm uppercase tracking-wider ${pathname === '/profile' ? 'text-[rgb(var(--primary))]' : 'text-white'}`}
                onClick={closeMenu}
              >
                Profile
              </Link>
              
              <Link 
                href="/board" 
                className={`px-4 py-3 text-sm uppercase tracking-wider ${pathname === '/board' ? 'text-[rgb(var(--primary))]' : 'text-white'}`}
                onClick={closeMenu}
              >
                TOP
              </Link>
              
              <Link 
                href="/settings" 
                className={`px-4 py-3 text-sm uppercase tracking-wider ${pathname === '/settings' ? 'text-[rgb(var(--primary))]' : 'text-white'}`}
                onClick={closeMenu}
              >
                CONFIG
              </Link>
              
              <button 
                onClick={() => {
                  closeMenu();
                  logout();
                }}
                className="px-4 py-3 text-sm uppercase tracking-wider text-white text-left"
              >
                Logout
              </button>
            </nav>
          </div>
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
