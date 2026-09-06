import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Send, Volume2, VolumeX, Music, Eye, X, Check } from 'lucide-react';
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
  const [isMuted, setIsMuted] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [copied, setCopied] = useState(false);
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

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

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

  const handleShare = () => {
    const reelUrl = `${window.location.origin}/reels`;
    navigator.clipboard.writeText(reelUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
    <div className="relative h-full w-full snap-start snap-always overflow-hidden bg-slate-950 flex items-center justify-center">
      {videoError ? (
        <div className="px-8 text-center text-white">
          <p className="text-base font-extrabold">Video Unavailable</p>
          <p className="mt-1 text-xs text-white/60">This video could not be played.</p>
        </div>
      ) : (
        <video
          ref={videoRef}
          src={reel.videoUrl}
          loop
          muted={isMuted}
          playsInline
          onError={() => setVideoError(true)}
          className="h-full w-full object-cover"
        />
      )}

      {/* Mute/Unmute Floating Button */}
      <button
        onClick={toggleMute}
        className="absolute top-5 right-5 z-20 rounded-full bg-black/40 p-2.5 text-white backdrop-blur-md transition hover:bg-black/60"
        aria-label="Toggle sound"
      >
        {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
      </button>

      {/* Bottom Gradient Protection Overlay */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

      {/* Left Info Overlay */}
      <div className="absolute bottom-6 left-4 right-20 z-10 text-white">
        <Link to={`/profile/${reel.author?.username}`} className="mb-3 flex items-center gap-3">
          <UserAvatar user={reel.author} size="md" disableLink />
          <div>
            <span className="text-sm font-extrabold hover:underline">{reel.author?.username}</span>
            <p className="flex items-center gap-1.5 text-[11px] text-white/70">
              <Eye className="h-3.5 w-3.5" />
              {reel.views || 0} views
            </p>
          </div>
        </Link>

        {reel.caption && (
          <p className="line-clamp-2 text-xs leading-5 text-white/90">{reel.caption}</p>
        )}

        <div className="mt-3 flex items-center gap-2 text-xs text-white/80">
          <Music className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: '4s' }} />
          <span className="truncate text-[11px] font-semibold">Original Audio • {reel.author?.username}</span>
        </div>
      </div>

      {/* Right Floating Actions Stack */}
      <div className="absolute bottom-8 right-4 z-10 flex flex-col items-center gap-5">
        <button
          onClick={handleLike}
          disabled={liking}
          className="group flex flex-col items-center gap-1 text-white transition hover:scale-110 active:scale-95"
          aria-label="Like reel"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/40 backdrop-blur-md">
            <Heart
              className={`h-6 w-6 transition ${
                isLiked ? 'fill-red-500 text-red-500' : 'text-white group-hover:text-red-500'
              }`}
            />
          </div>
          <span className="text-[11px] font-extrabold">{reel.likes?.length || 0}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="group flex flex-col items-center gap-1 text-white transition hover:scale-110 active:scale-95"
          aria-label="Toggle comments"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/40 backdrop-blur-md">
            <MessageCircle className="h-6 w-6 text-white group-hover:text-app-primary" />
          </div>
          <span className="text-[11px] font-extrabold">{reel.comments?.length || 0}</span>
        </button>

        <button
          onClick={handleShare}
          className="group flex flex-col items-center gap-1 text-white transition hover:scale-110 active:scale-95"
          aria-label="Share reel"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/40 backdrop-blur-md">
            {copied ? (
              <Check className="h-6 w-6 text-emerald-400 stroke-[2.5]" />
            ) : (
              <Send className="h-6 w-6 text-white group-hover:text-indigo-400" />
            )}
          </div>
          <span className="text-[11px] font-extrabold">Share</span>
        </button>

        {/* Vinyl Disc Indicator */}
        <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-white/40 p-0.5 shadow-lg animate-spin" style={{ animationDuration: '6s' }}>
          <UserAvatar user={reel.author} size="xs" disableLink className="!h-full !w-full" />
        </div>
      </div>

      {/* Slide-Up Comments Drawer */}
      {showComments && (
        <div className="absolute inset-x-0 bottom-0 z-30 flex max-h-[65%] flex-col rounded-t-[28px] border-t border-white/10 bg-slate-900/95 p-5 text-white shadow-2xl backdrop-blur-2xl">
          <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-extrabold">Comments ({reel.comments?.length || 0})</h3>
            <button
              onClick={() => setShowComments(false)}
              className="rounded-full p-1 text-white/60 hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto space-y-3 pr-1">
            {reel.comments?.length ? (
              reel.comments.map((c) => (
                <div key={c._id} className="flex items-start gap-2.5 text-xs">
                  <UserAvatar user={c.author} size="xs" />
                  <div className="min-w-0 flex-1">
                    <p className="font-extrabold text-white">{c.author?.username}</p>
                    <p className="mt-0.5 leading-5 text-white/80">{c.text}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-xs text-white/40">Be the first to comment on this reel!</p>
            )}
          </div>

          <form onSubmit={handleComment} className="mt-4 flex items-center gap-2 pt-2 border-t border-white/10">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              className="h-10 flex-1 rounded-full border border-white/15 bg-white/10 px-4 text-xs text-white placeholder:text-white/40 outline-none focus:border-app-primary"
            />
            <button
              type="submit"
              disabled={!comment.trim()}
              className="h-10 rounded-full bg-primary-gradient px-5 text-xs font-bold text-white shadow-active disabled:opacity-40"
            >
              Post
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
