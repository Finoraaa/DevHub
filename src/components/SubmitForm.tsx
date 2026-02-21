import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { X, Link as LinkIcon, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import axios from 'axios';
import { cn } from '../lib/utils';

import { CATEGORIES } from '../constants';

interface SubmitFormProps {
  user: User;
  onClose: () => void;
  onSuccess: () => void;
}

export function SubmitForm({ user, onClose, onSuccess }: SubmitFormProps) {
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('other');
  const [loading, setLoading] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [preview, setPreview] = useState<{
    title: string;
    description: string;
    image: string;
    siteName: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUrlChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    setError(null);

    if (newUrl.match(/^https?:\/\/[^\s$.?#].[^\s]*$/i)) {
      setScraping(true);
      try {
        const response = await axios.post('/api/scrape', { url: newUrl });
        setPreview(response.data);
      } catch (err) {
        console.error('Scraping error:', err);
      } finally {
        setScraping(false);
      }
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!preview) return;

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.from('resources').insert({
        title: preview.title,
        description: preview.description,
        url: url,
        image_url: preview.image,
        site_name: preview.siteName,
        category: category,
        user_id: user.id,
        author_name: user.user_metadata.full_name,
        author_avatar: user.user_metadata.avatar_url,
      });

      if (error) throw error;
      onSuccess();
    } catch (err: any) {
      console.error('Submission error:', err);
      setError(err.message || 'Failed to submit resource');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 100 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 100 }}
        className="bg-white dark:bg-[#141414] w-full max-w-xl rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden border border-[#5A5A40]/10 dark:border-white/5 max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-serif italic font-bold text-[#5A5A40] dark:text-[#8B8B6B]">Share Resource</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#F5F5F0] dark:hover:bg-white/5 rounded-full text-[#1a1a1a]/40 dark:text-white/20 hover:text-[#1a1a1a] dark:hover:text-white transition-all"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]/40 dark:text-white/20 ml-1">
                Resource URL
              </label>
              <div className="relative">
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1a1a1a]/40 dark:text-white/20" size={18} />
                <input
                  type="url"
                  required
                  placeholder="https://example.com"
                  value={url}
                  onChange={handleUrlChange}
                  className="w-full pl-12 pr-4 py-4 bg-[#F5F5F0] dark:bg-white/5 border-none rounded-2xl text-[#1a1a1a] dark:text-white focus:ring-2 focus:ring-[#5A5A40]/20 dark:focus:ring-white/10 transition-all"
                />
                {scraping && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <Loader2 size={18} className="animate-spin text-[#5A5A40] dark:text-[#8B8B6B]" />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]/40 dark:text-white/20 ml-1">
                Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all border",
                      category === cat.id
                        ? "bg-[#5A5A40] dark:bg-[#8B8B6B] text-white border-[#5A5A40] dark:border-[#8B8B6B]"
                        : "bg-white dark:bg-white/5 text-[#1a1a1a]/60 dark:text-white/40 border-[#5A5A40]/10 dark:border-white/5 hover:border-[#5A5A40]/30 dark:hover:border-white/20"
                    )}
                  >
                    <span>{cat.icon}</span>
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {preview && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-[#F5F5F0] dark:bg-white/5 rounded-2xl border border-[#5A5A40]/5 dark:border-white/5 flex gap-4"
              >
                {preview.image && (
                  <img
                    src={preview.image}
                    alt="Preview"
                    className="w-24 h-24 rounded-xl object-cover shrink-0"
                    referrerPolicy="no-referrer"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-[#1a1a1a] dark:text-white line-clamp-1 mb-1">{preview.title}</h4>
                  <p className="text-xs text-[#1a1a1a]/60 dark:text-white/40 line-clamp-2 mb-2">{preview.description}</p>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-[#5A5A40] dark:text-[#8B8B6B] uppercase tracking-tighter">
                    <CheckCircle2 size={12} />
                    {preview.siteName || 'Preview Loaded'}
                  </div>
                </div>
              </motion.div>
            )}

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !preview}
              className="w-full py-4 bg-[#5A5A40] dark:bg-[#8B8B6B] text-white rounded-2xl font-bold hover:bg-[#4A4A35] dark:hover:bg-[#7A7A5B] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#5A5A40]/20 dark:shadow-black/40"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 size={20} className="animate-spin" />
                  Submitting...
                </div>
              ) : (
                'Publish Resource'
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
