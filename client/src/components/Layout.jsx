import { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import UserAvatar from './UserAvatar';
import FollowButton from './FollowButton';
import NotificationDropdown from './NotificationDropdown';

const navItems = [
  { path: '/', label: 'Home', icon: HomeIcon },
  { path: '/search', label: 'Search', icon: SearchIcon },
  { path: '/explore', label: 'Explore', icon: ExploreIcon },
  { path: '/reels', label: 'Reels', icon: ReelsIcon },
  { path: '/messages', label: 'Messages', icon: MessagesIcon },
  { path: '/create', label: 'Create', icon: CreateIcon },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const wideRoutes = ['/explore', '/search', '/settings'];
  const isWide = wideRoutes.some((path) => location.pathname.startsWith(path)) || location.pathname.startsWith('/profile/');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-app-bg">
      <aside className="fixed hidden h-screen w-[260px] flex-col border-r border-app-border bg-white p-6 shadow-sidebar md:flex">
        <Link to="/" className="mb-8 flex items-center gap-3 rounded-[20px] px-2 py-2">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-gradient text-lg font-black text-white shadow-active">
            I
          </span>
          <div>
            <h1 className="text-2xl font-black tracking-tight bg-primary-gradient bg-clip-text text-transparent">
            Insta
          </h1>
            <p className="text-xs font-medium text-app-muted">Social moments, refined</p>
          </div>
        </Link>

        <nav className="flex flex-col gap-2 flex-1">
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex h-[52px] items-center gap-4 rounded-[14px] pl-[18px] pr-4 text-sm font-bold transition duration-300 ${
                  isActive
                    ? 'bg-primary-gradient text-white shadow-active'
                    : 'text-app-muted hover:bg-slate-100 hover:text-app-text'
                }`
              }
            >
              <Icon className="w-6 h-6" />
              <span>{label}</span>
            </NavLink>
          ))}

          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="flex h-[52px] w-full items-center gap-4 rounded-[14px] pl-[18px] pr-4 text-sm font-bold text-app-muted transition duration-300 hover:bg-slate-100 hover:text-app-text"
            >
              <div className="relative">
                <BellIcon className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white ring-2 ring-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <span>Notifications</span>
            </button>
            <NotificationDropdown
              isOpen={showNotifications}
              onClose={() => setShowNotifications(false)}
            />
          </div>

          <NavLink
            to={`/profile/${user?.username}`}
            className={({ isActive }) =>
              `flex h-[52px] items-center gap-4 rounded-[14px] pl-[18px] pr-4 text-sm font-bold transition duration-300 ${
                isActive
                  ? 'bg-primary-gradient text-white shadow-active'
                  : 'text-app-muted hover:bg-slate-100 hover:text-app-text'
              }`
            }
          >
            <UserAvatar user={user} size="sm" />
            <span>Profile</span>
          </NavLink>
        </nav>

        <div className="rounded-[22px] border border-app-border bg-white p-4 shadow-profile">
          <div className="mb-3 flex items-center gap-3">
            <UserAvatar user={user} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-app-text">{user?.username}</p>
              <p className="truncate text-xs text-app-muted">{user?.fullName || 'Creator'}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-danger-outline w-full">
            Log out
          </button>
        </div>
      </aside>

      <main className="pb-24 md:ml-[260px] md:pb-0">
        <div className={`${isWide ? 'max-w-5xl' : 'max-w-[680px]'} mx-auto px-6 py-6`}>
          {children}
        </div>
      </main>

      <Link
        to="/create"
        className="fixed bottom-24 right-5 z-40 hidden h-[60px] w-[60px] items-center justify-center rounded-full bg-primary-gradient text-white shadow-fab transition hover:scale-105 md:flex"
        aria-label="Create post"
      >
        <CreateIcon className="h-7 w-7" />
      </Link>

      <nav className="fixed bottom-3 left-3 right-3 z-40 flex justify-around rounded-3xl border border-slate-200 bg-white/90 px-2 py-2 shadow-xl shadow-slate-200/80 backdrop-blur-xl md:hidden">
        {navItems.map(({ path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `rounded-2xl p-2 transition ${isActive ? 'bg-primary-gradient text-white shadow-active' : 'text-app-muted'}`
            }
          >
            <Icon className="h-5 w-5" />
          </NavLink>
        ))}
        <NavLink
          to={`/profile/${user?.username}`}
          className={({ isActive }) =>
            `rounded-2xl p-2 transition ${isActive ? 'bg-primary-gradient text-white shadow-active' : 'text-app-muted'}`
          }
        >
          <UserAvatar user={user} size="sm" />
        </NavLink>
      </nav>
    </div>
  );
}

function HomeIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

function SearchIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function ExploreIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
    </svg>
  );
}

function ReelsIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}

function MessagesIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}

function CreateIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
    </svg>
  );
}

function BellIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  );
}

export function LoadingSkeleton() {
  return (
    <div className="app-card animate-pulse space-y-4 p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-200 rounded-full" />
        <div className="h-4 bg-slate-200 rounded w-24" />
      </div>
      <div className="aspect-square bg-slate-200 rounded-2xl" />
      <div className="h-4 bg-slate-200 rounded w-16" />
    </div>
  );
}

export function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-insta-pink">
            {eyebrow}
          </p>
        )}
        <h1 className="page-title">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-slate-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="empty-state">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-app-bg text-2xl">
        ✦
      </div>
      <p className="text-lg font-bold text-slate-900">{title}</p>
      {description && <p className="mx-auto mt-2 max-w-sm text-sm">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function SuggestedUsers({ users, onFollowToggle }) {
  const { user } = useAuth();

  if (!users?.length) {
    return (
      <aside className="hidden lg:block">
        <div className="app-card sticky top-8 overflow-hidden p-5">
          <div className="absolute inset-x-0 top-0 h-1 bg-insta-gradient" />
          <p className="text-sm font-bold text-slate-900">Suggested for you</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            You are all caught up. New people to follow will appear here.
          </p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-full space-y-4 lg:sticky lg:top-8 lg:w-[320px] lg:self-start">
      <div className="hidden rounded-[20px] bg-white p-5 shadow-card lg:block">
        <div className="flex items-center gap-3">
          <UserAvatar user={user} size="md" />
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-app-text">{user?.username}</p>
            <p className="truncate text-xs text-app-muted">{user?.fullName || 'Creator'}</p>
          </div>
          <Link to="/settings" className="ml-auto text-xs font-bold text-app-primary">
            Edit
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-[20px] bg-white shadow-card">
        <div className="h-1 bg-insta-gradient" />
        <div className="border-b border-app-border p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-base font-black text-app-text">Suggested Friends</p>
              <p className="mt-1 text-xs font-medium text-app-muted">Fresh profiles worth following</p>
            </div>
            <Link to="/search" className="rounded-full bg-app-bg px-3 py-1.5 text-xs font-bold text-app-text transition hover:bg-slate-200">
              Search
            </Link>
          </div>
        </div>

        <div className="divide-y divide-app-border">
          {users.slice(0, 5).map((suggestedUser) => (
            <div key={suggestedUser._id} className="group flex items-center gap-3 p-4 transition hover:bg-slate-50">
              <Link to={`/profile/${suggestedUser.username}`} className="shrink-0">
                <UserAvatar user={suggestedUser} size="lg" />
              </Link>
              <Link to={`/profile/${suggestedUser.username}`} className="min-w-0 flex-1">
                <p className="truncate text-sm font-black text-app-text group-hover:underline">
                  {suggestedUser.username}
                </p>
                <p className="truncate text-xs font-medium text-app-muted">
                  {suggestedUser.fullName}
                </p>
                {suggestedUser.bio ? (
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-app-muted">
                    {suggestedUser.bio}
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-slate-400">
                    {suggestedUser.followersCount || 0} followers
                  </p>
                )}
              </Link>
              <FollowButton
                userId={suggestedUser._id}
                isFollowing={suggestedUser.isFollowing}
                onToggle={(nextFollowing) => onFollowToggle?.(suggestedUser._id, nextFollowing)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[20px] bg-white p-5 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-base font-black text-app-text">Trending</p>
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-app-secondary">Live</span>
        </div>
        <div className="space-y-3">
          {['#creatorlife', '#dailyshots', '#reels', '#weekend'].map((tag, index) => (
            <Link key={tag} to={`/search?q=${tag.slice(1)}`} className="flex items-center justify-between rounded-2xl bg-app-bg px-4 py-3 transition hover:bg-indigo-50">
              <span className="text-sm font-bold text-app-text">{tag}</span>
              <span className="text-xs font-semibold text-app-muted">{index + 2}.{index + 4}k</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="rounded-[20px] bg-white p-5 shadow-card">
        <p className="mb-4 text-base font-black text-app-text">Online Friends</p>
        <div className="flex -space-x-2">
          {users.slice(0, 5).map((onlineUser) => (
            <Link key={onlineUser._id} to={`/profile/${onlineUser.username}`} className="relative rounded-full ring-4 ring-white">
              <UserAvatar user={onlineUser} size="sm" />
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400" />
            </Link>
          ))}
        </div>
        <p className="mt-4 text-xs leading-5 text-app-muted">
          Follow people to personalize your feed and unlock more stories.
        </p>
      </div>
    </aside>
  );
}
