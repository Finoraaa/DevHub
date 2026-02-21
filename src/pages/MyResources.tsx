import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { ResourceCard } from '../components/ResourceCard';
import { Resource } from '../types';
import { Bookmark, Search, Plus } from 'lucide-react';
import { motion } from 'motion/react';

interface MyResourcesProps {
  user: User;
}

export function MyResources({ user }: MyResourcesProps) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyResources = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResources(data || []);
    } catch (err) {
      console.error('Error fetching my resources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyResources();
  }, [user.id]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif italic font-bold text-[#5A5A40] dark:text-[#8B8B6B]">My Shared Resources</h1>
          <p className="text-[#1a1a1a]/60 dark:text-white/40 mt-1">Manage the resources you've shared with the community.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white dark:bg-[#141414] border border-[#5A5A40]/10 dark:border-white/5 rounded-xl text-sm font-bold text-[#5A5A40] dark:text-[#8B8B6B]">
            {resources.length} Resources
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-80 bg-white dark:bg-[#141414] rounded-3xl animate-pulse border border-[#5A5A40]/5 dark:border-white/5" />
          ))}
        </div>
      ) : resources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => (
            <ResourceCard 
              key={resource.id} 
              resource={resource} 
              user={user} 
              onDelete={(id) => setResources(prev => prev.filter(r => r.id !== id))}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-[#141414] rounded-[2rem] border border-dashed border-[#5A5A40]/20 dark:border-white/10">
          <div className="w-16 h-16 bg-[#F5F5F0] dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-[#5A5A40]/40 dark:text-white/20">
            <Bookmark size={32} />
          </div>
          <h3 className="text-xl font-serif italic font-bold text-[#5A5A40] dark:text-[#8B8B6B]">No resources yet</h3>
          <p className="text-[#1a1a1a]/40 dark:text-white/20 mt-2">You haven't shared any resources yet. Start by sharing your first one!</p>
          <button
            onClick={() => window.location.href = '/'}
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-[#5A5A40] dark:bg-[#8B8B6B] text-white rounded-full font-bold hover:bg-[#4A4A35] dark:hover:bg-[#7A7A5B] transition-all"
          >
            <Plus size={20} />
            Share Your First Resource
          </button>
        </div>
      )}
    </div>
  );
}
