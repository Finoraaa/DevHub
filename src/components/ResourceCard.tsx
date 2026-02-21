import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Resource } from '../types';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { ArrowBigUp, ArrowBigDown, ExternalLink, MessageSquare, Share2, Trash2, Bookmark, BookmarkCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatDate } from '../lib/utils';
import { CommentsSection } from './CommentsSection';
import { CATEGORIES } from '../constants';

interface ResourceCardProps {
  resource: Resource;
  user: User | null;
  onDelete?: (id: string) => void;
  key?: React.Key;
}

export function ResourceCard({ resource, user, onDelete }: ResourceCardProps) {
  const [vote, setVote] = useState<'up' | 'down' | null>(resource.user_vote || null);
  const [upvotes, setUpvotes] = useState(resource.upvotes);
  const [downvotes, setDownvotes] = useState(resource.downvotes);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user) {
      const checkBookmark = async () => {
        const { data } = await supabase
          .from('bookmarks')
          .select('id')
          .match({ user_id: user.id, resource_id: resource.id })
          .single();
        if (data) setIsBookmarked(true);
      };
      checkBookmark();
    }
  }, [user, resource.id]);

  const toggleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      window.location.href = '/auth';
      return;
    }

    const newState = !isBookmarked;
    setIsBookmarked(newState);

    try {
      if (newState) {
        await supabase.from('bookmarks').insert({ user_id: user.id, resource_id: resource.id });
      } else {
        await supabase.from('bookmarks').delete().match({ user_id: user.id, resource_id: resource.id });
      }
    } catch (err) {
      console.error('Bookmark error:', err);
      setIsBookmarked(!newState);
    }
  };

  const isOwner = user && user.id === resource.user_id;
  const categoryInfo = CATEGORIES.find(c => c.id === resource.category);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', resource.id);
      
      if (error) throw error;
      
      if (onDelete) {
        onDelete(resource.id);
      }
    } catch (err: any) {
      console.error('Silme hatası:', err);
      // window.alert yerine konsola yazıyoruz veya UI'da gösterebiliriz
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(resource.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy error:', err);
    }
  };

  const handleVote = async (type: 'up' | 'down') => {
    if (!user) {
      window.location.href = '/auth';
      return;
    }

    const newVote = vote === type ? null : type;
    
    // Optimistic update
    if (vote === 'up') setUpvotes(prev => prev - 1);
    if (vote === 'down') setDownvotes(prev => prev - 1);
    
    if (newVote === 'up') setUpvotes(prev => prev + 1);
    if (newVote === 'down') setDownvotes(prev => prev + 1);
    
    setVote(newVote);

    try {
      if (newVote === null) {
        await supabase.from('votes').delete().match({ user_id: user.id, resource_id: resource.id });
      } else {
        await supabase.from('votes').upsert({
          user_id: user.id,
          resource_id: resource.id,
          vote_type: newVote
        });
      }
    } catch (err) {
      console.error('Voting error:', err);
      // Revert on error
      setVote(vote);
      setUpvotes(resource.upvotes);
      setDownvotes(resource.downvotes);
    }
  };

  return (
    <motion.div
      layout
      className="group bg-white dark:bg-[#141414] rounded-3xl overflow-hidden border border-[#5A5A40]/10 dark:border-white/5 hover:border-[#5A5A40]/30 dark:hover:border-white/20 transition-all hover:shadow-2xl hover:shadow-[#5A5A40]/5 dark:hover:shadow-black/40 flex flex-col"
    >
      <div className="relative aspect-video overflow-hidden bg-[#F5F5F0] dark:bg-[#0A0A0A]">
        {resource.image_url ? (
          <img
            src={resource.image_url}
            alt={resource.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#5A5A40]/20 dark:text-white/10 font-serif italic text-4xl">
            {resource.site_name || 'DevHub'}
          </div>
        )}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <span className="px-3 py-1 bg-white/90 dark:bg-[#141414]/90 backdrop-blur-sm rounded-full text-[10px] font-bold uppercase tracking-wider text-[#5A5A40] dark:text-[#8B8B6B] shadow-sm">
            {resource.site_name || 'Resource'}
          </span>
          {categoryInfo && (
            <span className="w-fit px-3 py-1 bg-[#5A5A40]/90 dark:bg-[#8B8B6B]/90 backdrop-blur-sm rounded-full text-[10px] font-bold text-white shadow-sm flex items-center gap-1">
              <span>{categoryInfo.icon}</span>
              {categoryInfo.label}
            </span>
          )}
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <div className="flex-1">
          <h3 className="text-xl font-serif italic font-bold text-[#1a1a1a] dark:text-white mb-2 line-clamp-1 group-hover:text-[#5A5A40] dark:group-hover:text-[#8B8B6B] transition-colors">
            {resource.title}
          </h3>
          <p className="text-sm text-[#1a1a1a]/60 dark:text-white/40 line-clamp-2 mb-4 leading-relaxed">
            {resource.description}
          </p>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#5A5A40]/5 dark:border-white/5">
          <div className="flex items-center gap-1 bg-[#F5F5F0] dark:bg-white/5 rounded-full p-1">
            <button
              onClick={() => handleVote('up')}
              className={cn(
                "p-1 sm:p-1.5 rounded-full transition-all",
                vote === 'up' ? "bg-[#5A5A40] text-white shadow-md" : "text-[#1a1a1a]/40 dark:text-white/20 hover:text-[#5A5A40] dark:hover:text-[#8B8B6B]"
              )}
            >
              <ArrowBigUp size={18} className="sm:w-5 sm:h-5" fill={vote === 'up' ? "currentColor" : "none"} />
            </button>
            <span className="text-[10px] sm:text-xs font-bold px-1 min-w-[16px] sm:min-w-[20px] text-center text-[#1a1a1a] dark:text-white">
              {upvotes - downvotes}
            </span>
            <button
              onClick={() => handleVote('down')}
              className={cn(
                "p-1 sm:p-1.5 rounded-full transition-all",
                vote === 'down' ? "bg-red-500 text-white shadow-md" : "text-[#1a1a1a]/40 dark:text-white/20 hover:text-red-500"
              )}
            >
              <ArrowBigDown size={18} className="sm:w-5 sm:h-5" fill={vote === 'down' ? "currentColor" : "none"} />
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 sm:p-2 text-[#1a1a1a]/40 dark:text-white/20 hover:text-[#5A5A40] dark:hover:text-[#8B8B6B] hover:bg-[#F5F5F0] dark:hover:bg-white/5 rounded-full transition-all"
              title="Visit Website"
            >
              <ExternalLink size={16} className="sm:w-[18px] sm:h-[18px]" />
            </a>
            <button 
              onClick={() => setShowComments(!showComments)}
              className={cn(
                "p-1.5 sm:p-2 rounded-full transition-all flex items-center gap-1.5",
                showComments ? "bg-[#5A5A40]/10 dark:bg-[#8B8B6B]/10 text-[#5A5A40] dark:text-[#8B8B6B]" : "text-[#1a1a1a]/40 dark:text-white/20 hover:text-[#5A5A40] dark:hover:text-[#8B8B6B] hover:bg-[#F5F5F0] dark:hover:bg-white/5"
              )}
              title="Comments"
            >
              <MessageSquare size={16} className="sm:w-[18px] sm:h-[18px]" />
            </button>
            <button 
              onClick={toggleBookmark}
              className={cn(
                "p-1.5 sm:p-2 rounded-full transition-all",
                isBookmarked ? "text-[#5A5A40] dark:text-[#8B8B6B] bg-[#5A5A40]/10 dark:bg-[#8B8B6B]/10" : "text-[#1a1a1a]/40 dark:text-white/20 hover:text-[#5A5A40] dark:hover:text-[#8B8B6B] hover:bg-[#F5F5F0] dark:hover:bg-white/5"
              )}
              title={isBookmarked ? "Remove from Saved" : "Save Resource"}
            >
              {isBookmarked ? <BookmarkCheck size={16} className="sm:w-[18px] sm:h-[18px]" /> : <Bookmark size={16} className="sm:w-[18px] sm:h-[18px]" />}
            </button>
            <div className="relative">
              <button 
                onClick={handleShare}
                className="p-1.5 sm:p-2 text-[#1a1a1a]/40 dark:text-white/20 hover:text-[#5A5A40] dark:hover:text-[#8B8B6B] hover:bg-[#F5F5F0] dark:hover:bg-white/5 rounded-full transition-all"
                title="Share Link"
              >
                <Share2 size={16} className="sm:w-[18px] sm:h-[18px]" />
              </button>
              <AnimatePresence>
                {copied && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.8 }}
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[#5A5A40] dark:bg-[#8B8B6B] text-white text-[10px] font-bold rounded-lg whitespace-nowrap shadow-lg z-50"
                  >
                    Kopyalandı!
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {isOwner && (
              <div className="relative z-50 flex items-center gap-1">
                <AnimatePresence mode="wait">
                  {showConfirm ? (
                    <motion.div
                      key="confirm"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center gap-1 bg-red-50 dark:bg-red-500/10 rounded-full p-1 border border-red-100 dark:border-red-500/20"
                    >
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDelete();
                        }}
                        disabled={isDeleting}
                        className="text-[10px] font-bold px-2 py-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        {isDeleting ? '...' : 'Sil'}
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowConfirm(false);
                        }}
                        className="text-[10px] font-bold px-2 py-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-full transition-colors"
                      >
                        İptal
                      </button>
                    </motion.div>
                  ) : (
                    <motion.button
                      key="trash"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowConfirm(true);
                      }}
                      className="p-3 text-red-500/40 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition-all active:scale-90"
                      title="Delete Resource"
                    >
                      <Trash2 size={20} />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-4 flex items-center gap-2">
          <Link to={`/profile/${resource.user_id}`} className="flex items-center gap-2 group/author">
            <div className="w-6 h-6 rounded-full bg-[#5A5A40]/10 dark:bg-[#8B8B6B]/10 flex items-center justify-center text-[10px] font-bold text-[#5A5A40] dark:text-[#8B8B6B] group-hover/author:bg-[#5A5A40] dark:group-hover/author:bg-[#8B8B6B] group-hover/author:text-white transition-colors">
              {resource.author_name?.[0] || 'U'}
            </div>
            <span className="text-[10px] text-[#1a1a1a]/40 dark:text-white/20 font-medium">
              Shared by <span className="text-[#1a1a1a]/60 dark:text-white/60 group-hover/author:text-[#5A5A40] dark:group-hover/author:text-[#8B8B6B] transition-colors">{resource.author_name || 'Anonymous'}</span> • {formatDate(resource.created_at)}
            </span>
          </Link>
        </div>

        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <CommentsSection resourceId={resource.id} user={user} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
