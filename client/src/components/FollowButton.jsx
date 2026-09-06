import { useEffect, useState } from 'react';
import api from '../api';

export default function FollowButton({ userId, isFollowing: initialFollowing, onToggle, compact = false }) {
  const [isFollowing, setIsFollowing] = useState(Boolean(initialFollowing));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsFollowing(Boolean(initialFollowing));
  }, [initialFollowing]);

  const handleClick = async () => {
    if (!userId || loading) return;

    setLoading(true);
    try {
      const nextFollowing = !isFollowing;
      if (isFollowing) {
        await api.delete(`/users/${userId}/follow`);
      } else {
        await api.post(`/users/${userId}/follow`);
      }
      setIsFollowing(nextFollowing);
      onToggle?.(nextFollowing);
    } catch (error) {
      console.error('Follow error:', error);
      const message = error.response?.data?.message;
      if (message === 'Already following') {
        setIsFollowing(true);
        onToggle?.(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading || !userId}
      aria-pressed={isFollowing}
      className={`${compact ? 'h-8 rounded-lg px-3 text-[11px]' : 'h-[46px] rounded-[14px] px-4 text-sm'} font-bold transition ${
        isFollowing
          ? 'border border-app-border bg-white text-app-text hover:bg-app-bg'
          : compact
            ? 'border border-transparent bg-[#FBEDEE] text-app-primary hover:bg-app-primary hover:text-white'
            : 'bg-primary-gradient text-white shadow-active hover:-translate-y-0.5 hover:shadow-fab'
      } disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-50`}
    >
      {loading ? 'Working...' : isFollowing ? 'Following' : 'Follow'}
    </button>
  );
}
