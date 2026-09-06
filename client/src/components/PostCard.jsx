import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Send, Bookmark, Smile, MoreHorizontal, Check, Copy } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import UserAvatar from './UserAvatar';

export default function PostCard({ post: initialPost, onUpdate }) {
  const { user } = useAuth();
  const [post, setPost] = useState(initialPost);
  const [comment, setComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [liking, setLiking] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showHeartAnim, setShowHeartAnim] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const lastTapRef = useRef(0);

  const isLiked = post.likes?.some((id) => id === user?._id || id._id === user?._id);
  const mediaUrl = post.mediaUrl?.[0];

  const handleLike = async () => {
    if (liking) return;
    setLiking(true);
    try {
      const { data } = await api.post(`/posts/${post._id}/like`);
      setPost((prev) => ({
        ...prev,
        likes: data.liked
          ? [...(prev.likes || []), user._id]
          : (prev.likes || []).filter((id) => (id._id || id) !== user._id),
      }));
    } catch (error) {
      console.error('Like error:', error);
    } finally {
      setLiking(false);
    }
  };

  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      setShowHeartAnim(true);
      setTimeout(() => setShowHeartAnim(false), 900);
      if (!isLiked) {
        handleLike();
      }
    }
    lastTapRef.current = now;
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await api.post(`/posts/${post._id}/comments`, { text: comment });
      setPost(data.post);
      setComment('');
      setShowComments(true);
      onUpdate?.(data.post);
    } catch (error) {
      console.error('Comment error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleShare = () => {
    const postUrl = `${window.location.origin}/post/${post._id}`;
    navigator.clipboard.writeText(postUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const addEmoji = (emoji) => {
    setComment((prev) => prev + emoji);
  };

  const formatCaption = (text) => {
    if (!text) return null;
    return text.split(/(\s+)/).map((part, i) => {
      if (part.startsWith('#')) {
        return (
          <Link
            key={i}
            to={`/search?q=${part.slice(1)}`}
            className="font-bold text-app-primary hover:underline"
          >
            {part}
          </Link>
        );
      }
      if (part.startsWith('@')) {
        return (
          <Link
            key={i}
            to={`/profile/${part.slice(1)}`}
            className="font-bold text-app-primary hover:underline"
          >
            {part}
          </Link>
        );
      }
      return part;
    });
  };

  const formatRelativeTime = (date) => {
    if (!date) return '';
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <article className="mb-6 overflow-hidden rounded-[24px] border border-app-border bg-app-card shadow-feed transition duration-300 hover:shadow-card dark:border-app-dark-border dark:bg-app-dark-card">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4.5">
        <div className="flex items-center gap-3 min-w-0">
          <UserAvatar user={post.author} size="md" />
          <div className="min-w-0">
            <Link
              to={`/profile/${post.author?.username}`}
              className="block truncate text-sm font-black text-app-text hover:underline dark:text-app-dark-text"
            >
              {post.author?.fullName || post.author?.username}
            </Link>
            <p className="text-[11px] font-medium text-app-muted dark:text-app-dark-muted">
              @{post.author?.username}{post.createdAt ? ` · ${formatRelativeTime(post.createdAt)}` : ''}
            </p>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="rounded-full p-2 text-app-muted transition hover:bg-[#F5E7E5] hover:text-app-primary dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label="Post options"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-10 z-20 w-44 rounded-2xl border border-app-border bg-white/95 p-1.5 shadow-xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
              <button
                onClick={() => {
                  handleShare();
                  setShowMenu(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-app-text hover:bg-[#F5E7E5] dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <Copy className="h-4 w-4" />
                Copy Link
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Media Image / Video Container */}
      <div
        onClick={handleDoubleTap}
        className="relative flex min-h-[260px] cursor-pointer items-center justify-center overflow-hidden bg-app-bg p-2 sm:p-3 dark:bg-black/30"
      >
        {post.mediaType === 'video' ? (
          <video
            src={mediaUrl}
            controls
            className="max-h-[680px] w-full rounded-[18px] object-contain"
          />
        ) : (
          <img
            src={mediaUrl}
            alt={post.caption || `Post by ${post.author?.username}`}
            className="max-h-[680px] w-full rounded-[18px] object-contain transition-transform duration-500 hover:scale-[1.01]"
            loading="lazy"
          />
        )}

        {/* Double-tap Animated Heart Overlay */}
        {showHeartAnim && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20">
            <Heart className="h-28 w-28 animate-heart-burst fill-white text-white drop-shadow-2xl" />
          </div>
        )}
      </div>

      {/* Action Bar & Caption */}
      <div className="px-5 pb-5 pt-3">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={handleLike}
              disabled={liking}
              className="group inline-flex items-center gap-1.5 rounded-xl px-2 py-1.5 text-xs font-bold text-app-muted transition duration-200 hover:bg-[#F5E7E5] hover:text-app-primary active:scale-95 disabled:opacity-50 dark:hover:bg-white/5"
              aria-label={isLiked ? 'Unlike post' : 'Like post'}
            >
              <Heart
                className={`h-[18px] w-[18px] stroke-[2.2] transition-colors duration-200 ${
                  isLiked
                    ? 'fill-app-primary text-app-primary drop-shadow-md'
                    : 'text-app-muted group-hover:text-app-primary dark:text-slate-200'
                }`}
              />
              <span className="hidden sm:inline">Like</span>
            </button>
            <button
              onClick={() => setShowComments(!showComments)}
              className="group inline-flex items-center gap-1.5 rounded-xl px-2 py-1.5 text-xs font-bold text-app-muted transition duration-200 hover:bg-[#F5E7E5] hover:text-app-primary active:scale-95 dark:hover:bg-white/5"
              aria-label="Toggle comments"
            >
              <MessageCircle className="h-[18px] w-[18px] stroke-[2.2] text-app-muted transition group-hover:text-app-primary dark:text-slate-200" />
              <span className="hidden sm:inline">Comment</span>
            </button>
            <button
              onClick={handleShare}
              className="group relative inline-flex items-center gap-1.5 rounded-xl px-2 py-1.5 text-xs font-bold text-app-muted transition duration-200 hover:bg-[#F5E7E5] hover:text-app-primary active:scale-95 dark:hover:bg-white/5"
              aria-label="Share post"
            >
              {copied ? (
                <Check className="h-[18px] w-[18px] text-app-primary stroke-[2.5]" />
              ) : (
                <Send className="h-[18px] w-[18px] stroke-[2.2] text-app-muted transition group-hover:text-app-primary dark:text-slate-200" />
              )}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Share'}</span>
            </button>
          </div>

          <button
            onClick={() => setSaved(!saved)}
            className="group inline-flex items-center gap-1.5 rounded-xl px-2 py-1.5 text-xs font-bold text-app-muted transition duration-200 hover:bg-[#F5E7E5] hover:text-app-primary active:scale-95 dark:hover:bg-white/5"
            aria-label="Save post"
          >
            <Bookmark
              className={`h-[18px] w-[18px] stroke-[2.2] transition-colors duration-200 ${
                saved
                  ? 'fill-app-primary text-app-primary dark:fill-[#FBD0BD] dark:text-[#FBD0BD]'
                  : 'text-app-muted group-hover:text-app-primary dark:text-slate-200'
              }`}
            />
            <span className="hidden sm:inline">Save</span>
          </button>
        </div>

        {/* Likes Count */}
        <p className="mb-2 text-xs font-black text-app-text dark:text-app-dark-text">
          {post.likes?.length || 0} {post.likes?.length === 1 ? 'like' : 'likes'} · {post.comments?.length || 0} {post.comments?.length === 1 ? 'comment' : 'comments'}
        </p>

        {/* Caption */}
        {post.caption && (
          <p className="text-xs leading-6 text-app-text dark:text-slate-300">
            <Link
              to={`/profile/${post.author?.username}`}
              className="mr-2 font-black text-app-text hover:underline dark:text-app-dark-text"
            >
              {post.author?.username}
            </Link>
            {formatCaption(post.caption)}
          </p>
        )}

        {/* Comment Count / Toggle */}
        {post.comments?.length > 0 && (
          <button
            onClick={() => setShowComments(!showComments)}
            className="mt-2 text-xs font-bold text-app-muted hover:underline dark:text-app-dark-muted"
          >
            {showComments ? 'Hide comments' : `View all ${post.comments.length} comments`}
          </button>
        )}

        {/* Comments List */}
        {showComments && (
          <div className="mt-3 max-h-48 space-y-2.5 overflow-y-auto pr-1">
            {post.comments?.map((c) => (
              <div key={c._id} className="flex items-start justify-between text-xs leading-5">
                <p className="text-app-text dark:text-slate-300">
                  <Link
                    to={`/profile/${c.author?.username}`}
                    className="mr-1.5 font-black text-app-text hover:underline dark:text-app-dark-text"
                  >
                    {c.author?.username}
                  </Link>
                  {c.text}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Quick Emoji Bar */}
        <div className="mt-3.5 flex items-center gap-1.5 text-base">
          {['❤️', '🔥', '👏', '😍', '✨', '🙌'].map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => addEmoji(emoji)}
              className="rounded-full px-1.5 py-0.5 transition hover:scale-125"
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Add Comment Form */}
        <form
          onSubmit={handleComment}
          className="mt-3 flex items-center gap-2 border-t border-app-border pt-3 dark:border-app-dark-border"
        >
          <Smile className="h-5 w-5 shrink-0 text-slate-400" />
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 bg-transparent text-xs text-app-text placeholder:text-app-muted dark:text-app-dark-text dark:placeholder:text-app-dark-muted"
          />
          <button
            type="submit"
            disabled={!comment.trim() || submitting}
            className="text-xs font-black text-app-primary transition hover:opacity-80 disabled:opacity-30"
          >
            {submitting ? 'Posting...' : 'Post'}
          </button>
        </form>
      </div>
    </article>
  );
}
