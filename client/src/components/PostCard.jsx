import { useState } from 'react';
import { Link } from 'react-router-dom';
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

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await api.post(`/posts/${post._id}/comments`, { text: comment });
      setPost(data.post);
      setComment('');
      onUpdate?.(data.post);
    } catch (error) {
      console.error('Comment error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatCaption = (text) => {
    if (!text) return null;
    return text.split(/(\s+)/).map((part, i) => {
      if (part.startsWith('#')) {
        return (
          <Link key={i} to={`/search?q=${part.slice(1)}`} className="text-blue-900">
            {part}
          </Link>
        );
      }
      if (part.startsWith('@')) {
        return (
          <Link key={i} to={`/profile/${part.slice(1)}`} className="text-blue-900">
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
    <article className="mb-7 overflow-hidden rounded-[24px] bg-white shadow-feed">
      <div className="flex items-center gap-3 px-[22px] py-[18px]">
        <UserAvatar user={post.author} />
        <div className="min-w-0 flex-1">
          <Link to={`/profile/${post.author?.username}`} className="text-sm font-black text-app-text hover:underline">
            {post.author?.username}
          </Link>
          {post.createdAt && <p className="text-xs text-app-muted">{formatRelativeTime(post.createdAt)}</p>}
        </div>
      </div>

      <div className="relative aspect-square bg-white px-[18px] pb-[18px]">
        {post.mediaType === 'video' ? (
          <video src={mediaUrl} controls className="h-full w-full rounded-[18px] object-cover" />
        ) : (
          <img
            src={mediaUrl}
            alt={post.caption || `Post by ${post.author?.username || 'user'}`}
            className="h-full w-full rounded-[18px] object-cover"
            loading="lazy"
          />
        )}
      </div>

      <div className="px-[22px] pb-5">
        <div className="flex items-center gap-4 mb-2">
          <button
            onClick={handleLike}
            disabled={liking}
            className="rounded-full p-1 transition hover:bg-slate-100 disabled:opacity-50"
            aria-label={isLiked ? 'Unlike post' : 'Like post'}
          >
            {isLiked ? (
              <svg className="w-7 h-7 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            ) : (
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            )}
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className="rounded-full p-1 transition hover:bg-slate-100"
            aria-label="Toggle comments"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>
        </div>

        <p className="mb-1 text-sm font-black text-app-text">{post.likes?.length || 0} likes</p>

        {post.caption && (
          <p className="text-sm leading-6 text-app-muted">
            <Link to={`/profile/${post.author?.username}`} className="mr-1 font-black text-app-text">
              {post.author?.username}
            </Link>
            {formatCaption(post.caption)}
          </p>
        )}

        {post.comments?.length > 0 && (
          <button
            onClick={() => setShowComments(!showComments)}
            className="mt-2 text-sm font-bold text-app-muted"
          >
            View all {post.comments.length} comments
          </button>
        )}

        {showComments && (
          <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
            {post.comments?.map((c) => (
              <p key={c._id} className="text-sm leading-6 text-app-muted">
                <Link to={`/profile/${c.author?.username}`} className="mr-1 font-black text-app-text">
                  {c.author?.username}
                </Link>
                {c.text}
              </p>
            ))}
          </div>
        )}

        <form onSubmit={handleComment} className="mt-4 flex items-center gap-2 border-t border-app-border pt-3">
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 bg-transparent text-sm text-app-text placeholder:text-app-muted"
          />
          <button
            type="submit"
            disabled={!comment.trim() || submitting}
            className="text-sm font-black text-app-primary disabled:opacity-30"
          >
            Post
          </button>
        </form>
      </div>
    </article>
  );
}
