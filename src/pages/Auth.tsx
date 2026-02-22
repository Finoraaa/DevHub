import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Github, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export function Auth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isConfigMissing = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;

  const handleGitHubLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const redirectUri = `${window.location.origin}/auth/callback`;
      const isPreview = window.location.hostname.includes('run.app') || window.location.hostname.includes('localhost');

      if (!isPreview) {
        // Standard redirect flow for production (Vercel)
        const { error: authError } = await supabase.auth.signInWithOAuth({
          provider: 'github',
          options: {
            redirectTo: redirectUri,
          },
        });
        if (authError) throw authError;
        return; // Browser will redirect
      }

      // Popup flow for AI Studio preview environment
      const { data, error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: redirectUri,
          skipBrowserRedirect: true,
        },
      });

      if (authError) throw authError;

      if (data?.url) {
        const authWindow = window.open(data.url, 'oauth_popup', 'width=600,height=700');
        
        if (!authWindow) {
          setError('Popup blocked! Please allow popups for this site.');
          setLoading(false);
          return;
        }

        const handleMessage = (event: MessageEvent) => {
          const origin = event.origin;
          // Allow Vercel origins as well
          if (!origin.endsWith('.run.app') && !origin.includes('localhost') && !origin.endsWith('.vercel.app')) return;

          if (event.data?.type === 'OAUTH_AUTH_SUCCESS' && event.data.url) {
            window.removeEventListener('message', handleMessage);
            
            const url = new URL(event.data.url);
            const hash = url.hash.substring(1);
            const params = new URLSearchParams(hash);
            
            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');

            if (accessToken && refreshToken) {
              supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken
              }).then(({ error: sessionError }) => {
                if (sessionError) throw sessionError;
                window.location.href = '/';
              }).catch(err => {
                console.error('Session error:', err);
                setError('Failed to establish session. Please try again.');
                setLoading(false);
              });
            } else {
              window.location.hash = url.hash;
              window.location.reload();
            }
          }
        };

        window.addEventListener('message', handleMessage);
        
        const checkClosed = setInterval(() => {
          if (authWindow.closed) {
            clearInterval(checkClosed);
            setLoading(false);
          }
        }, 1000);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'Failed to sign in with GitHub');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-[#141414] p-8 rounded-3xl shadow-xl border border-[#5A5A40]/10 dark:border-white/5 text-center"
      >
        <div className="w-16 h-16 bg-[#5A5A40] dark:bg-[#8B8B6B] rounded-2xl flex items-center justify-center text-white text-3xl font-serif italic font-bold mx-auto mb-6">
          F
        </div>
        <h1 className="text-3xl font-serif italic font-bold text-[#5A5A40] dark:text-[#8B8B6B] mb-2">Welcome Back</h1>
        <p className="text-[#1a1a1a]/60 dark:text-white/40 mb-8">
          Join the community of developers sharing high-quality resources.
        </p>

        {isConfigMissing && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 rounded-xl flex flex-col gap-2 text-amber-700 dark:text-amber-400 text-sm text-left">
            <div className="flex items-center gap-2 font-bold">
              <AlertCircle size={18} />
              Configuration Required
            </div>
            <p>Please set <strong>SUPABASE_URL</strong> and <strong>SUPABASE_ANON_KEY</strong> in the Secrets panel to enable authentication.</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm text-left">
            <AlertCircle size={18} className="shrink-0" />
            {error}
          </div>
        )}

        <button
          onClick={handleGitHubLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#1a1a1a] dark:bg-white dark:text-black text-white rounded-2xl font-medium hover:bg-black dark:hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white dark:border-black/30 dark:border-t-black rounded-full animate-spin" />
          ) : (
            <Github size={20} />
          )}
          Continue with GitHub
        </button>

        <p className="mt-8 text-xs text-[#1a1a1a]/40 dark:text-white/20 leading-relaxed">
          By continuing, you agree to our terms of service and privacy policy.
          We only use your GitHub profile to identify you.
        </p>
      </motion.div>
    </div>
  );
}
