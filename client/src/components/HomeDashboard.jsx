import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  ChevronRight,
  ImagePlus,
  MapPin,
  MessageCircle,
  Plus,
  Search,
  Smile,
  Sparkles,
  UserRoundPlus,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import FollowButton from './FollowButton';
import NotificationDropdown from './NotificationDropdown';
import UserAvatar from './UserAvatar';

const trendingTopics = [
  ['GoodVibes', '12.4K posts'],
  ['TravelDiaries', '8.7K posts'],
  ['BuildInPublic', '5.1K posts'],
  ['CreativeMinds', '3.9K posts'],
  ['StudentLife', '2.8K posts'],
];

export function HomeHeader() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const [query, setQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  const search = (event) => {
    event.preventDefault();
    const value = query.trim();
    navigate(value ? `/search?q=${encodeURIComponent(value)}` : '/search');
  };

  return (
    <header className="mb-5 flex items-center gap-3 rounded-[22px] border border-app-border bg-app-card px-3 py-3 shadow-card dark:border-app-dark-border dark:bg-app-dark-card sm:gap-4 sm:px-4">
      <form onSubmit={search} className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl bg-[#ECE7E7] px-4 py-2.5 dark:bg-white/5">
        <Search className="h-4 w-4 shrink-0 text-app-muted" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search for people, posts, or hashtags..."
          className="min-w-0 flex-1 bg-transparent text-xs font-medium text-app-text placeholder:text-app-muted dark:text-app-dark-text"
          aria-label="Search Nexora"
        />
      </form>

      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <Link to="/create" className="inline-flex h-10 items-center gap-2 rounded-xl bg-app-primary px-3 text-xs font-extrabold text-white shadow-active transition hover:-translate-y-0.5 hover:bg-app-deep sm:px-4" aria-label="Create a post">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Create</span>
        </Link>
        <Link to="/messages" className="rounded-xl p-2.5 text-app-muted transition hover:bg-[#F5E7E5] hover:text-app-primary dark:hover:bg-white/5" aria-label="Messages">
          <MessageCircle className="h-5 w-5" />
        </Link>
        <div className="relative">
          <button type="button" onClick={() => setShowNotifications((visible) => !visible)} className="relative rounded-xl p-2.5 text-app-muted transition hover:bg-[#F5E7E5] hover:text-app-primary dark:hover:bg-white/5" aria-label="Notifications">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-app-primary px-1 text-[9px] font-black text-white ring-2 ring-white dark:ring-app-dark-card">{unreadCount > 9 ? '9+' : unreadCount}</span>}
          </button>
          <NotificationDropdown isOpen={showNotifications} onClose={() => setShowNotifications(false)} placement="header" />
        </div>
        <Link to={`/profile/${user?.username}`} className="ml-1 rounded-full transition hover:scale-105" aria-label="Your profile">
          <UserAvatar user={user} size="sm" disableLink />
        </Link>
      </div>
    </header>
  );
}

export function PostComposer() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [draft, setDraft] = useState('');
  const openComposer = () => navigate('/create', { state: { caption: draft } });

  const actions = [
    { label: 'Photo / Video', icon: ImagePlus, accent: 'text-[#903945]' },
    { label: 'Tag People', icon: UserRoundPlus, accent: 'text-[#A65363]' },
    { label: 'Feeling', icon: Smile, accent: 'text-[#DC8876]' },
    { label: 'Location', icon: MapPin, accent: 'text-[#903945]' },
  ];

  return (
    <section className="mb-5 rounded-[24px] border border-app-border bg-app-card p-4 shadow-card dark:border-app-dark-border dark:bg-app-dark-card sm:p-5">
      <div className="flex gap-3">
        <UserAvatar user={user} size="md" disableLink />
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={`What's on your mind, ${user?.fullName?.split(' ')[0] || user?.username || 'there'}?`}
          rows={2}
          maxLength={2200}
          className="min-h-[62px] flex-1 resize-none rounded-2xl bg-[#F5E7E5] px-4 py-3 text-xs font-medium text-app-text placeholder:text-app-muted focus:ring-4 focus:ring-rose-900/10 dark:bg-white/5 dark:text-app-dark-text"
        />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-1 border-t border-app-border pt-3 dark:border-app-dark-border sm:gap-2">
        {actions.map(({ label, icon: Icon, accent }) => (
          <button key={label} type="button" onClick={openComposer} className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-[11px] font-bold text-[#3A3437] transition hover:bg-[#F5E7E5] hover:text-app-primary dark:text-slate-300 dark:hover:bg-white/5">
            <Icon className={`h-4 w-4 ${accent}`} />
            {label}
          </button>
        ))}
        <button type="button" onClick={openComposer} className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-xl bg-app-primary px-4 text-xs font-extrabold text-white transition hover:bg-app-deep">
          Post
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </section>
  );
}

export function HomeSidebar({ users }) {
  const [dismissedIds, setDismissedIds] = useState([]);
  const visibleUsers = (users || []).filter((user) => !dismissedIds.includes(user._id)).slice(0, 5);

  return (
    <aside className="hidden space-y-5 xl:block xl:w-[320px]">
      <section className="overflow-hidden rounded-[24px] border border-app-border bg-app-card shadow-card dark:border-app-dark-border dark:bg-app-dark-card">
        <div className="flex items-center justify-between px-5 pb-3 pt-5">
          <h2 className="text-sm font-black text-app-text dark:text-app-dark-text">Suggested for you</h2>
          <Link to="/search" className="text-[11px] font-extrabold text-app-primary hover:underline">See all</Link>
        </div>
        {visibleUsers.length ? (
          <div className="px-3 pb-3">
            {visibleUsers.map((suggestedUser) => (
              <div key={suggestedUser._id} className="group flex items-center gap-2.5 rounded-2xl px-2 py-2.5 transition hover:bg-[#F5E7E5] dark:hover:bg-white/5">
                <UserAvatar user={suggestedUser} size="sm" />
                <div className="min-w-0 flex-1">
                  <Link to={`/profile/${suggestedUser.username}`} className="block truncate text-xs font-extrabold text-app-text hover:underline dark:text-app-dark-text">
                    {suggestedUser.fullName || suggestedUser.username}
                  </Link>
                  <p className="truncate text-[11px] text-app-muted">@{suggestedUser.username}</p>
                </div>
                <FollowButton userId={suggestedUser._id} isFollowing={suggestedUser.isFollowing} compact />
                <button type="button" onClick={() => setDismissedIds((ids) => [...ids, suggestedUser._id])} className="rounded-lg p-1 text-app-muted opacity-0 transition hover:bg-[#F5E7E5] hover:text-app-primary group-hover:opacity-100 dark:hover:bg-white/10" aria-label={`Dismiss ${suggestedUser.username}`}>
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="px-5 pb-5 text-xs leading-5 text-app-muted">You’re all caught up with suggestions for now.</p>
        )}
      </section>

      <section className="rounded-[24px] border border-app-border bg-app-card p-5 shadow-card dark:border-app-dark-border dark:bg-app-dark-card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-black text-app-text dark:text-app-dark-text">What’s happening</h2>
          <Link to="/explore" className="text-[11px] font-extrabold text-app-primary hover:underline">See all</Link>
        </div>
        <div className="space-y-1">
          {trendingTopics.map(([topic, count]) => (
            <Link key={topic} to={`/search?q=${topic}`} className="block rounded-xl px-3 py-2.5 transition hover:bg-[#F5E7E5] dark:hover:bg-white/5">
              <p className="text-xs font-extrabold text-app-primary">#{topic}</p>
              <p className="mt-0.5 text-[11px] text-app-muted">{count}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden rounded-[24px] bg-app-deep p-6 text-white shadow-card">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-app-primary" />
        <div className="absolute -bottom-16 left-5 h-32 w-32 rounded-full border-[22px] border-[#7A2638]" />
        <div className="absolute bottom-5 right-7 h-8 w-8 rounded-full bg-[#E8AA8D]" />
        <Sparkles className="relative h-5 w-5 text-[#FBD0BD]" />
        <p className="relative mt-5 max-w-[220px] text-lg font-black leading-6">Share Stories. Build Connections. Create a Kinder Web.</p>
        <p className="relative mt-5 text-xs font-bold text-white">Nexora</p>
      </section>
    </aside>
  );
}

export function NexoraEmptyFeed() {
  return (
    <section className="rounded-[26px] border border-app-border bg-app-card px-6 py-14 text-center shadow-card dark:border-app-dark-border dark:bg-app-dark-card">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#FBD0BD] text-app-primary dark:bg-white/10">
        <Sparkles className="h-7 w-7" />
      </div>
      <h2 className="mt-5 text-xl font-black text-app-text dark:text-app-dark-text">Welcome to Nexora</h2>
      <p className="mt-2 text-sm font-bold text-app-primary">Your world starts here.</p>
      <p className="mx-auto mt-3 max-w-sm text-xs leading-6 text-app-muted">Follow people, discover ideas, and share moments that matter.</p>
      <Link to="/search" className="mt-6 inline-flex items-center gap-2 text-xs font-extrabold text-app-primary hover:underline">Discover people <ChevronRight className="h-3.5 w-3.5" /></Link>
    </section>
  );
}
