import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { LogOut, Plus, Github, Compass, Bookmark, Menu, X as CloseIcon, Heart, User as UserIcon, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../context/ThemeContext';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
}

export function Layout({ children, user }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: 'Explore', icon: Compass },
    ...(user ? [
      { to: `/profile/${user.id}`, label: 'Profile', icon: UserIcon },
      { to: '/my-resources', label: 'My List', icon: Bookmark },
      { to: '/saved', label: 'Saved', icon: Heart }
    ] : []),
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F0] dark:bg-[#0A0A0A] text-[#1a1a1a] dark:text-[#F5F5F0] font-sans transition-colors duration-300">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#141414]/80 backdrop-blur-md border-b border-[#5A5A40]/10 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 bg-[#5A5A40] dark:bg-[#8B8B6B] rounded-lg flex items-center justify-center text-white font-bold transform group-hover:rotate-12 transition-transform">
                  F
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-xl font-serif italic font-bold text-[#5A5A40] dark:text-[#8B8B6B]">DevHub</span>
                  <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#5A5A40]/40 dark:text-[#8B8B6B]/40 ml-0.5">by Finora</span>
                </div>
              </Link>

              <nav className="hidden md:flex items-center gap-6">
                <Link
                  to="/"
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                    location.pathname === '/' ? 'text-[#5A5A40] dark:text-[#8B8B6B]' : 'text-[#1a1a1a]/60 dark:text-white/40 hover:text-[#1a1a1a] dark:hover:text-white'
                  }`}
                >
                  <Compass size={18} />
                  Explore
                </Link>
                {user && (
                  <>
                    <Link
                      to="/my-resources"
                    className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                      location.pathname === '/my-resources' ? 'text-[#5A5A40] dark:text-[#8B8B6B]' : 'text-[#1a1a1a]/60 dark:text-white/40 hover:text-[#1a1a1a] dark:hover:text-white'
                    }`}
                  >
                    <Bookmark size={18} />
                    My List
                  </Link>
                  <Link
                    to="/saved"
                    className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                      location.pathname === '/saved' ? 'text-[#5A5A40] dark:text-[#8B8B6B]' : 'text-[#1a1a1a]/60 dark:text-white/40 hover:text-[#1a1a1a] dark:hover:text-white'
                    }`}
                  >
                    <Heart size={18} />
                    Saved
                  </Link>
                </>
              )}
            </nav>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-4">
                <button
                  onClick={toggleTheme}
                  className="p-2 text-[#1a1a1a]/60 dark:text-white/40 hover:text-[#5A5A40] dark:hover:text-[#8B8B6B] hover:bg-[#F5F5F0] dark:hover:bg-white/5 rounded-full transition-all"
                  title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                >
                  {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                </button>

                {user ? (
                  <div className="flex items-center gap-2 sm:gap-4">
                    <Link 
                      to={`/profile/${user.id}`}
                      className="flex items-center gap-2 hover:opacity-80 transition-opacity group"
                    >
                      {user.user_metadata.avatar_url ? (
                        <img
                          src={user.user_metadata.avatar_url}
                          alt={user.user_metadata.full_name}
                          className="w-8 h-8 rounded-full border border-[#5A5A40]/20 dark:border-white/10 group-hover:border-[#5A5A40]/50 dark:group-hover:border-white/30 transition-colors"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#5A5A40] dark:bg-[#8B8B6B] flex items-center justify-center text-white text-xs font-bold">
                          {user.user_metadata.full_name?.charAt(0) || 'U'}
                        </div>
                      )}
                      <span className="hidden sm:inline text-sm font-medium text-[#1a1a1a]/80 dark:text-white/80 group-hover:text-[#5A5A40] dark:group-hover:text-[#8B8B6B] transition-colors">
                        {user.user_metadata.full_name}
                      </span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="hidden sm:flex p-2 text-[#1a1a1a]/60 dark:text-white/40 hover:text-[#1a1a1a] dark:hover:text-white hover:bg-[#F5F5F0] dark:hover:bg-white/5 rounded-full transition-all"
                      title="Logout"
                    >
                      <LogOut size={20} />
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/auth"
                    className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-[#5A5A40] dark:bg-[#8B8B6B] text-white rounded-full text-xs sm:text-sm font-medium hover:bg-[#4A4A35] dark:hover:bg-[#7A7A5B] transition-colors shadow-lg shadow-[#5A5A40]/20 dark:shadow-black/40"
                  >
                    <Github size={16} className="sm:w-[18px] sm:h-[18px]" />
                    Sign in
                  </Link>
                )}
              </div>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-[#1a1a1a]/60 dark:text-white/40 hover:text-[#5A5A40] dark:hover:text-[#8B8B6B] hover:bg-[#F5F5F0] dark:hover:bg-white/5 rounded-lg transition-all"
              >
                {isMobileMenuOpen ? <CloseIcon size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white dark:bg-[#141414] border-t border-[#5A5A40]/10 dark:border-white/5 overflow-hidden"
            >
              <div className="px-4 py-6 space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all ${
                      location.pathname === link.to
                        ? 'bg-[#5A5A40] dark:bg-[#8B8B6B] text-white'
                        : 'text-[#1a1a1a]/60 dark:text-white/40 hover:bg-[#F5F5F0] dark:hover:bg-white/5'
                    }`}
                  >
                    <link.icon size={20} />
                    {link.label}
                  </Link>
                ))}
                {user && (
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                  >
                    <LogOut size={20} />
                    Logout
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {children}
        </motion.div>
      </main>

      <footer className="border-t border-[#5A5A40]/10 dark:border-white/5 py-12 bg-white dark:bg-[#0A0A0A] mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 bg-[#5A5A40]/10 dark:bg-[#8B8B6B]/10 rounded-xl flex items-center justify-center text-[#5A5A40] dark:text-[#8B8B6B] font-serif italic font-bold text-xl">
              F
            </div>
            <p className="text-sm text-[#1a1a1a]/40 dark:text-white/20">
              &copy; {new Date().getFullYear()} DevHub by <span className="font-bold text-[#5A5A40] dark:text-[#8B8B6B]">Finora</span>. Built for the community.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
