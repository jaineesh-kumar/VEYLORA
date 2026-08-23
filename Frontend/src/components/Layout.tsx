import React, { useEffect, useState } from 'react';
import { Activity, BookOpen, ChevronRight, Home, LockKeyhole, LogIn, LogOut, Menu, ShieldCheck, User, UserPlus, X } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
interface LayoutProps { children: React.ReactNode; }
const links = [{ to: '/', label: 'Overview', icon: Home }, { to: '/prediction', label: 'Detector', icon: Activity }, { to: '/encry', label: 'Encrypt', icon: LockKeyhole }, { to: '/docs', label: 'Algorithms', icon: BookOpen }];
export default function Layout({ children }: LayoutProps) {
 const [isLoggedIn, setIsLoggedIn] = useState(false); const [menuOpen, setMenuOpen] = useState(false); const navigate = useNavigate();
 const [showNavbar, setShowNavbar] = useState(true); const [lastScrollY, setLastScrollY] = useState(0);
 useEffect(() => setIsLoggedIn(Boolean(localStorage.getItem('token') || localStorage.getItem('accessToken'))), []);
 useEffect(() => {
   let ticking = false;
   const handleScroll = () => {
     if (!ticking) {
       window.requestAnimationFrame(() => {
         const currentScrollY = window.scrollY;
         if (currentScrollY > lastScrollY && currentScrollY > 60) setShowNavbar(false);
         else setShowNavbar(true);
         setLastScrollY(currentScrollY);
         ticking = false;
       });
       ticking = true;
     }
   };
   window.addEventListener('scroll', handleScroll, { passive: true });
   return () => window.removeEventListener('scroll', handleScroll);
 }, [lastScrollY]);
 const logout = () => { localStorage.removeItem('token'); localStorage.removeItem('accessToken'); setIsLoggedIn(false); navigate('/'); };
 const navClass = ({ isActive }: { isActive: boolean }) => `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${isActive ? 'bg-fuchsia-400/15 text-fuchsia-200 ring-1 ring-fuchsia-300/15 shadow-[0_0_18px_rgba(217,70,239,.12)]' : 'text-slate-400 hover:bg-fuchsia-300/8 hover:text-fuchsia-100'}`;
  return <div className="app-surface relative flex min-h-screen flex-col overflow-x-hidden"><header className={`fixed w-full top-0 z-50 border-b border-fuchsia-300/15 bg-gradient-to-r from-[#170a1b]/90 via-[#24102b]/85 to-[#170a1b]/90 backdrop-blur-xl transition-transform duration-300 ease-in-out transform-gpu [will-change:transform] ${showNavbar ? 'translate-y-0' : '-translate-y-full'}`}><div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 lg:px-8"><NavLink to="/" className="flex items-center gap-3" onClick={() => setMenuOpen(false)}><img src="/Logo.jpeg" className="h-9 w-9 rounded-xl object-cover border border-fuchsia-300/30 shadow-[0_0_12px_rgba(217,70,239,0.3)]" alt="Veylora Logo" /><span className="text-lg font-extrabold tracking-tight text-white">Vey<span className="text-fuchsia-300">lora</span></span></NavLink><nav className="hidden items-center gap-1 md:flex">{links.map(({to,label,icon:Icon}) => <NavLink key={to} to={to} className={navClass}><Icon size={16}/>{label}</NavLink>)}</nav><div className="hidden items-center gap-2 md:flex">{isLoggedIn ? <><NavLink to="/profile" className={navClass}><User size={16}/>Profile</NavLink><button onClick={logout} className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-400 hover:text-white"><LogOut size={16}/>Sign out</button></> : <><NavLink to="/login" className="secondary-action !border-0 !px-3 !py-2 text-sm"><LogIn size={16}/>Sign in</NavLink><NavLink to="/signup" className="primary-action !px-3 !py-2 text-sm"><UserPlus size={16}/>Get started</NavLink></>}</div><button className="grid h-9 w-9 place-items-center rounded-lg text-slate-300 hover:bg-slate-400/10 md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">{menuOpen ? <X/> : <Menu/>}</button></div>{menuOpen && <div className="border-t border-fuchsia-300/15 bg-[#211026] px-5 py-3 md:hidden"><nav className="grid gap-1">{links.map(({to,label,icon:Icon}) => <NavLink key={to} to={to} className={navClass} onClick={() => setMenuOpen(false)}><Icon size={16}/>{label}</NavLink>)}<NavLink to={isLoggedIn ? '/profile' : '/login'} className={navClass} onClick={() => setMenuOpen(false)}><User size={16}/>{isLoggedIn ? 'Profile' : 'Sign in'}<ChevronRight className="ml-auto" size={16}/></NavLink></nav></div>}</header><main className="relative z-10 flex-grow pt-[72px]">{children}</main><footer className="relative z-10 mt-16 border-t border-white/10"><div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8"><span>© {new Date().getFullYear()} Veylora · Cipher intelligence</span><span className="font-mono text-xs text-slate-600">ANALYSIS ENVIRONMENT</span></div></footer></div>;
}
