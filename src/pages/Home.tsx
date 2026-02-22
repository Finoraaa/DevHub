import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { ResourceCard } from '../components/ResourceCard';
import { SubmitForm } from '../components/SubmitForm';
import { Resource } from '../types';
import { Plus, Search, Filter, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { CATEGORIES } from '../constants';
import { cn } from '../lib/utils';

interface HomeProps {
  user: User | null;
}

export function Home({ user }: HomeProps) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const fetchResources = async () => {
    setLoading(true);
    try {
      // In a real app, we'd use a more complex query to get vote counts and user's vote
      // For this demo, we'll fetch resources and then mock the counts if needed
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Use real database values
      const resourcesWithVotes = (data || []).map(r => ({
        ...r,
        upvotes: r.upvotes || 0,
        downvotes: r.downvotes || 0,
      }));

      setResources(resourcesWithVotes);
    } catch (err) {
      console.error('Error fetching resources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const filteredResources = resources.filter(r => {
    const matchesSearch = 
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.site_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !selectedCategory || r.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      <section className="relative py-8 md:py-12 overflow-hidden rounded-[2rem] bg-[#5A5A40] dark:bg-[#1a1a1a] text-white shadow-2xl shadow-[#5A5A40]/20">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://picsum.photos/seed/abstract/1920/1080" 
            alt="Background" 
            className="w-full h-full object-cover opacity-15 mix-blend-overlay scale-110"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-[#5A5A40]/80 to-transparent dark:from-[#1a1a1a]/80 z-0" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl -ml-32 -mb-32" />
        
        <div className="relative z-10 px-6 md:px-12">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] sm:text-xs font-medium mb-4 sm:mb-6"
            >
              <Sparkles size={14} />
              Curated by Developers
            </motion.div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif italic font-bold mb-4 leading-tight">
              Discover the best tools for your next project.
            </h1>
            <p className="text-white/80 text-base sm:text-lg mb-6 sm:mb-8 max-w-lg">
              A community-driven hub for high-quality developer resources, libraries, and inspiration.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => user ? setIsSubmitOpen(true) : window.location.href = '/auth'}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-[#8B8B6B] text-[#5A5A40] dark:text-white rounded-full font-bold hover:bg-[#F5F5F0] dark:hover:bg-[#7A7A5B] transition-all shadow-xl shadow-black/10"
              >
                <Plus size={20} />
                Share Resource
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80 md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1a1a1a]/40 dark:text-white/20" size={18} />
          <input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-[#141414] border border-[#5A5A40]/10 dark:border-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20 dark:focus:ring-white/10 transition-all text-sm text-[#1a1a1a] dark:text-white"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none p-3 bg-white dark:bg-[#141414] border border-[#5A5A40]/10 dark:border-white/5 rounded-xl text-[#1a1a1a]/60 dark:text-white/40 hover:text-[#5A5A40] dark:hover:text-[#8B8B6B] transition-colors flex justify-center">
            <Filter size={20} />
          </button>
          <select className="flex-[3] sm:flex-none bg-white dark:bg-[#141414] border border-[#5A5A40]/10 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-medium text-[#1a1a1a]/60 dark:text-white/40 focus:outline-none appearance-none cursor-pointer">
            <option>Most Recent</option>
            <option>Most Upvoted</option>
            <option>Trending</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        <button
          onClick={() => setSelectedCategory(null)}
          className={cn(
            "px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border",
            !selectedCategory
              ? "bg-[#5A5A40] dark:bg-[#8B8B6B] text-white border-[#5A5A40] dark:border-[#8B8B6B] shadow-lg shadow-[#5A5A40]/20"
              : "bg-white dark:bg-[#141414] text-[#1a1a1a]/60 dark:text-white/40 border-[#5A5A40]/10 dark:border-white/5 hover:border-[#5A5A40]/30 dark:hover:border-white/20"
          )}
        >
          All Resources
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border",
              selectedCategory === cat.id
                ? "bg-[#5A5A40] dark:bg-[#8B8B6B] text-white border-[#5A5A40] dark:border-[#8B8B6B] shadow-lg shadow-[#5A5A40]/20"
                : "bg-white dark:bg-[#141414] text-[#1a1a1a]/60 dark:text-white/40 border-[#5A5A40]/10 dark:border-white/5 hover:border-[#5A5A40]/30 dark:hover:border-white/20"
            )}
          >
            <span>{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {isSubmitOpen && (
          <SubmitForm 
            user={user!} 
            onClose={() => setIsSubmitOpen(false)} 
            onSuccess={() => {
              setIsSubmitOpen(false);
              fetchResources();
            }} 
          />
        )}
      </AnimatePresence>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-80 bg-white rounded-3xl animate-pulse border border-[#5A5A40]/5" />
          ))}
        </div>
      ) : filteredResources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => (
            <ResourceCard 
              key={resource.id} 
              resource={resource} 
              user={user} 
              onDelete={(id) => setResources(prev => prev.filter(r => r.id !== id))}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-[#5A5A40]/20">
          <div className="w-16 h-16 bg-[#F5F5F0] rounded-full flex items-center justify-center mx-auto mb-4 text-[#5A5A40]/40">
            <Search size={32} />
          </div>
          <h3 className="text-xl font-serif italic font-bold text-[#5A5A40]">No resources found</h3>
          <p className="text-[#1a1a1a]/40 mt-2">Try adjusting your search or be the first to share something!</p>
        </div>
      )}
    </div>
  );
}
