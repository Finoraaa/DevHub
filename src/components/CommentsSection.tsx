import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Comment } from '../types';
import { Send, Loader2, User as UserIcon, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatDate } from '../lib/utils';

interface CommentsSectionProps {
  resourceId: string;
  user: User | null;
}

export function CommentsSection({ resourceId, user }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('resource_id', resourceId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [resourceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // window.alert('Yorum gönderiliyor...'); // Geçici debug
    console.log('Submitting comment...', { resourceId, userId: user?.id, content: newComment });
    
    if (!user) {
      console.error('No user found');
      return;
    }
    
    if (!newComment.trim()) {
      console.error('Comment is empty');
      return;
    }

    setSubmitting(true);
    try {
      const authorName = user.user_metadata.full_name || 
                         user.user_metadata.user_name || 
                         user.user_metadata.name || 
                         user.email?.split('@')[0] || 
                         'Anonymous';

      const { data, error } = await supabase
        .from('comments')
        .insert({
          resource_id: resourceId,
          user_id: user.id,
          content: newComment.trim(),
          author_name: authorName,
          author_avatar: user.user_metadata.avatar_url,
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Comment posted successfully:', data);
      setComments(prev => [...prev, data]);
      setNewComment('');
    } catch (err: any) {
      console.error('Error posting comment:', err);
      alert('Yorum gönderilemedi: ' + (err.message || 'Bilinmeyen bir hata oluştu.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (err: any) {
      console.error('Error deleting comment:', err);
      alert('Yorum silinemedi: ' + (err.message || 'Bilinmeyen hata'));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mt-6 pt-6 border-t border-[#5A5A40]/10 dark:border-white/5 space-y-6">
      <h4 className="text-sm font-bold text-[#5A5A40] dark:text-[#8B8B6B] uppercase tracking-wider flex items-center gap-2">
        Discussion
        <span className="px-2 py-0.5 bg-[#5A5A40]/10 dark:bg-[#8B8B6B]/10 rounded-full text-[10px]">
          {comments.length}
        </span>
      </h4>

      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-[#5A5A40]/20 dark:text-white/10" size={24} />
          </div>
        ) : comments.length > 0 ? (
          <AnimatePresence initial={false}>
            {comments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="group flex gap-3"
              >
                <div className="shrink-0">
                  {comment.author_avatar ? (
                    <img
                      src={comment.author_avatar}
                      alt={comment.author_name}
                      className="w-8 h-8 rounded-full border border-[#5A5A40]/10 dark:border-white/5"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#5A5A40]/10 dark:bg-white/5 flex items-center justify-center text-[#5A5A40] dark:text-[#8B8B6B]">
                      <UserIcon size={14} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-bold text-[#1a1a1a] dark:text-white/80">
                      {comment.author_name || 'Anonymous'}
                    </span>
                    <span className="text-[10px] text-[#1a1a1a]/40 dark:text-white/20">
                      {formatDate(comment.created_at)}
                    </span>
                  </div>
                  <div className="relative group/content">
                    <p className="text-sm text-[#1a1a1a]/70 dark:text-white/60 leading-relaxed bg-[#F5F5F0] dark:bg-white/5 p-3 rounded-2xl rounded-tl-none">
                      {comment.content}
                    </p>
                    {user && user.id === comment.user_id && (
                      <div className="absolute -right-2 -top-2 z-20">
                        <AnimatePresence mode="wait">
                          {deletingId === comment.id ? (
                            <motion.div
                              key="confirm-delete"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              className="flex items-center gap-1 bg-white dark:bg-[#1A1A1A] shadow-lg border border-red-100 dark:border-red-500/20 rounded-full p-1"
                            >
                              <button
                                onClick={() => handleDelete(comment.id)}
                                className="text-[8px] font-bold px-1.5 py-0.5 bg-red-500 text-white rounded-full"
                              >
                                Sil
                              </button>
                              <button
                                onClick={() => setDeletingId(null)}
                                className="text-[8px] font-bold px-1.5 py-0.5 text-gray-400 dark:text-white/20"
                              >
                                X
                              </button>
                            </motion.div>
                          ) : (
                            <motion.button
                              key="delete-btn"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              onClick={() => setDeletingId(comment.id)}
                              className="p-1.5 bg-white dark:bg-[#1A1A1A] shadow-sm border border-red-100 dark:border-red-500/20 text-red-400 hover:text-red-500 rounded-full opacity-0 group-hover/content:opacity-100 transition-opacity"
                            >
                              <Trash2 size={12} />
                            </motion.button>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <div className="text-center py-8 text-[#1a1a1a]/40 dark:text-white/20 text-sm italic">
            No comments yet. Be the first to start the discussion!
          </div>
        )}
      </div>

      {user ? (
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="w-full pl-4 pr-12 py-3 bg-[#F5F5F0] dark:bg-white/5 border-none rounded-2xl text-sm text-[#1a1a1a] dark:text-white focus:ring-2 focus:ring-[#5A5A40]/20 dark:focus:ring-white/10 transition-all"
          />
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#5A5A40] dark:text-[#8B8B6B] hover:bg-[#5A5A40]/10 dark:hover:bg-white/10 rounded-xl transition-all disabled:opacity-30 z-10"
          >
            {submitting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </form>
      ) : (
        <div className="p-4 bg-[#F5F5F0] dark:bg-white/5 rounded-2xl text-center">
          <p className="text-xs text-[#1a1a1a]/40 dark:text-white/20">
            Please <button onClick={() => window.location.href = '/auth'} className="text-[#5A5A40] dark:text-[#8B8B6B] font-bold hover:underline">sign in</button> to join the discussion.
          </p>
        </div>
      )}
    </div>
  );
}
