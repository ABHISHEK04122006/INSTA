import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import UserAvatar from './UserAvatar';

export default function ReelPlayer({ reel: initialReel, isActive }) {
  const { user } = useAuth();
  const videoRef = useRef(null);
  const [reel, setReel] = useState(initialReel);
  const [comment, setComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [liking, setLiking] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const viewedRef = useRef(false);

  const isLiked = reel.likes?.some((id) => id === user?._id || id._id === user?._id);

  useEffect(() => {
    setReel(initialReel);
    viewedRef.current = false;
    setVideoError(false);
  }, [initialReel]);

  useEffect(() => {
    if (isActive && videoRef.current) {
      videoRef.current.play().catch(() => {});
      if (!viewedRef.current) {
        viewedRef.current = true;
        api.post(`/reels/${reel._id}/view`)
          .then(({ data }) => {
            setReel((prev) => ({ ...prev, views: data.views ?? prev.views }));
          })
          .catch(() => {});
      }
    } else if (videoRef.current) {
      videoRef.current.pause();
    }
  }, [isActive, reel._id]);

  const handleLike = async () => {
    if (liking) return;
    setLiking(true);
    try {
      const { data } = await api.post(`/reels/${reel._id}/like`);
      setReel((prev) => ({
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
    try {
      const { data } = await api.post(`/reels/${reel._id}/comments`, { text: comment });
      setReel(data.reel);
      setComment('');
    } catch (error) {
      console.error('Comment error:', error);
    }
  };

  return (
    <div className="relative w-full h-full snap-start snap-always flex items-center justify-center bg-black">
      {videoError ? (
        <div className="px-8 text-center text-white">
          <p className="text-lg font-bold">Video unavailable</p>
          <p className="mt-2 text-sm text-white/60">This reel could not be played.</p>
        </div>
      ) : (
        <video
          ref={videoRef}
          src={reel.videoUrl}
          loop
          muted
          playsInline
          controls
          onError={() => setVideoError(true)}
          className="w-full h-full object-contain max-h-screen"
        />
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/85 to-transparent" />

      <div className="absolute bottom-0 left-0 right-16 p-4 text-white">
        <Link to={`/profile/${reel.author?.username}`} className="flex items-center gap-2 mb-2">
          <UserAvatar user={reel.author} />
          <span className="font-semibold text-sm">{reel.author?.username}</span>
        </Link>
        {reel.caption && <p className="text-sm">{reel.caption}</p>}
        <p className="text-xs text-gray-300 mt-1">{reel.views || 0} views</p>
      </div>

      <div className="absolute right-4 bottom-20 flex flex-col items-center gap-6">
        <button
          onClick={handleLike}
          disabled={liking}
          className="flex flex-col items-center disabled:opacity-50"
          aria-label={isLiked ? 'Unlike reel' : 'Like reel'}
        >
          {isLiked ? (
            <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          ) : (
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          )}
          <span className="text-white text-xs mt-1">{reel.likes?.length || 0}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex flex-col items-center"
          aria-label="Toggle comments"
        >
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="text-white text-xs mt-1">{reel.comments?.length || 0}</span>
        </button>
      </div>

      {showComments && (
        <div className="absolute bottom-0 left-0 right-0 max-h-72 overflow-y-auto rounded-t-3xl bg-black/90 p-4 backdrop-blur">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-bold text-white">Comments</p>
            <button onClick={() => setShowComments(false)} className="text-sm text-white/60">Close</button>
          </div>
          {reel.comments?.length ? (
            reel.comments.map((c) => (
              <p key={c._id} className="mb-2 text-sm text-white">
                <span className="mr-1 font-semibold">{c.author?.username}</span>
                {c.text}
              </p>
            ))
          ) : (
            <p className="mb-3 text-sm text-white/50">No comments yet.</p>
          )}
          <form onSubmit={handleComment} className="flex gap-2 mt-2">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white placeholder:text-white/40"
            />
            <button
              type="submit"
              disabled={!comment.trim()}
              className="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-950 disabled:opacity-40"
            >
              Post
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
