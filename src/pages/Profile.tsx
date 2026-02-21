import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ResourceCard } from '../components/ResourceCard';
import { Resource } from '../types';
import { User as UserIcon, Calendar, Share2, Award } from 'lucide-react';
import { motion } from 'motion/react';
import { formatDate } from '../lib/utils';

export function Profile() {
  const { userId } = useParams<{ userId: string }>();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfileAndResources = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        // Fetch resources by this user
        const { data: resourceData, error: resourceError } = await supabase
          .from('resources')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (resourceError) throw resourceError;
        setResources(resourceData || []);

        // In a real app, we'd have a profiles table. 
        // For now, we'll derive profile info from the first resource or mock it.
        if (resourceData && resourceData.length > 0) {
          setProfile({
            name: resourceData[0].author_name,
            avatar: resourceData[0].author_avatar,
            joined: resourceData[0].created_at, // Mocking join date
          });
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndResources();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-pulse text-xl font-serif italic text-[#5A5A40]">Loading Profile...</div>
      </div>
    );
  }

  if (!profile && !loading) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-serif italic font-bold text-[#5A5A40]">Profile not found</h2>
        <Link to="/" className="text-[#5A5A40] hover:underline mt-4 inline-block">Back to Explore</Link>
      </div>
    );
  }

  const totalUpvotes = resources.reduce((acc, r) => acc + (r.upvotes || 0), 0);

  return (
    <div className="space-y-12">
      <section className="bg-white dark:bg-[#141414] rounded-[2.5rem] p-8 md:p-12 border border-[#5A5A40]/10 dark:border-white/5 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="relative">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-32 h-32 rounded-full border-4 border-[#F5F5F0] dark:border-[#0A0A0A] shadow-xl"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-[#F5F5F0] dark:bg-white/5 flex items-center justify-center text-[#5A5A40] dark:text-[#8B8B6B]">
                <UserIcon size={48} />
              </div>
            )}
            <div className="absolute -bottom-2 -right-2 bg-[#5A5A40] dark:bg-[#8B8B6B] text-white p-2 rounded-full shadow-lg">
              <Award size={20} />
            </div>
          </div>

          <div className="text-center md:text-left flex-1">
            <h1 className="text-4xl font-serif italic font-bold text-[#1a1a1a] dark:text-white mb-2">{profile.name}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-[#1a1a1a]/60 dark:text-white/40">
              <div className="flex items-center gap-1.5">
                <Calendar size={16} />
                <span>Joined {formatDate(profile.joined)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Share2 size={16} />
                <span>{resources.length} Resources Shared</span>
              </div>
            </div>
            
            <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-3">
              <div className="px-4 py-2 bg-[#F5F5F0] dark:bg-white/5 rounded-2xl">
                <span className="text-xs uppercase tracking-wider font-bold text-[#5A5A40]/40 dark:text-white/20 block">Total Impact</span>
                <span className="text-xl font-bold text-[#5A5A40] dark:text-[#8B8B6B]">{totalUpvotes} Upvotes</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="space-y-6">
        <h2 className="text-2xl font-serif italic font-bold text-[#5A5A40] dark:text-[#8B8B6B] px-2">Shared by {profile.name}</h2>
        
        {resources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} user={null} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-[#141414] rounded-3xl border border-dashed border-[#5A5A40]/20 dark:border-white/10">
            <p className="text-[#1a1a1a]/40 dark:text-white/20">This user hasn't shared any resources yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
