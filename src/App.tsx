import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { MyResources } from './pages/MyResources';
import { SavedResources } from './pages/SavedResources';
import { Profile } from './pages/Profile';
import { Auth } from './pages/Auth';
import { User } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === 'SIGNED_IN') {
        setShowWelcome(true);
        setTimeout(() => setShowWelcome(false), 3000);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] dark:bg-[#0A0A0A] flex items-center justify-center transition-colors duration-300">
        <div className="animate-pulse text-2xl font-serif italic text-[#5A5A40] dark:text-[#8B8B6B]">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <Layout user={user}>
        <AnimatePresence>
          {showWelcome && user && (
            <motion.div
              initial={{ opacity: 0, y: -100 }}
              animate={{ opacity: 1, y: 20 }}
              exit={{ opacity: 0, y: -100 }}
              className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-[#5A5A40] text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 font-medium"
            >
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs">✨</div>
              Welcome back, {user.user_metadata.full_name}!
            </motion.div>
          )}
        </AnimatePresence>
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/my-resources" element={user ? <MyResources user={user} /> : <Auth />} />
          <Route path="/saved" element={user ? <SavedResources user={user} /> : <Auth />} />
          <Route path="/profile/:userId" element={<Profile />} />
          <Route path="/auth" element={<Auth />} />
        </Routes>
      </Layout>
    </Router>
  );
}
