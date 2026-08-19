
import React, { useEffect, useState } from 'react';
import { Terminal, Home, Book, Info, LogIn, UserPlus, LogOut, User } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/");
  };

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col text-ink font-body">
      <nav className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 font-body font-medium text-sm w-[90%] max-w-5xl ${
        isScrolled 
          ? 'glass-pill opacity-90' 
          : 'glass-pill'
      }`}>
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center space-x-8">
            <NavLink to="/" className="flex items-center text-xl font-bold text-accent-violet">
              CryptML
            </NavLink>
            <div className="hidden md:flex items-center space-x-6">
              <NavLink to="/" className={({ isActive }) => `flex items-center transition duration-300 ${isActive ? 'text-accent-violet' : 'text-ink-dim hover:text-ink'}`}>
                Home
              </NavLink>
              <NavLink to="/prediction" className={({ isActive }) => `flex items-center transition duration-300 ${isActive ? 'text-accent-violet' : 'text-ink-dim hover:text-ink'}`}>
                Prediction
              </NavLink>
              <NavLink to="/docs" className={({ isActive }) => `flex items-center transition duration-300 ${isActive ? 'text-accent-violet' : 'text-ink-dim hover:text-ink'}`}>
                Docs
              </NavLink>
              <NavLink to="/encry" className={({ isActive }) => `flex items-center transition duration-300 ${isActive ? 'text-accent-violet' : 'text-ink-dim hover:text-ink'}`}>
                Encryption
              </NavLink>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <NavLink to="/profile" className={({ isActive }) => `flex items-center transition duration-300 ${isActive ? 'text-accent-violet' : 'text-ink-dim hover:text-ink'}`}>
                  Profile
                </NavLink>
                <button className="flex items-center text-ink-dim hover:text-ink transition duration-300" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            ) : (
              <>
                <NavLink to="/login" className={({ isActive }) => `flex items-center transition duration-300 ${isActive ? 'text-accent-violet' : 'text-ink-dim hover:text-ink'}`}>
                  Login
                </NavLink>
                <NavLink to="/signup" className="rounded-full bg-pill-dark px-5 py-2 text-white transition-all duration-150 hover:opacity-90 hover:-translate-y-[1px]">
                  Sign up
                </NavLink>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-grow pt-24">{children}</main>

      {/* Footer */}
      <footer className="font-body text-sm text-ink-dim mt-20 border-t border-ink-dim/10 bg-glass-fill/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0 font-medium">
            CryptML
          </div>
          <div className="flex space-x-6">
            <NavLink to="/encry" className="hover:text-ink transition-colors">Protocol</NavLink>
            <NavLink to="/prediction" className="hover:text-ink transition-colors">Models</NavLink>
            <NavLink to="/docs" className="hover:text-ink transition-colors">Docs</NavLink>
            <a href="https://github.com/razasoneji/CryptML" target="_blank" rel="noreferrer" className="hover:text-ink transition-colors">Github</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

