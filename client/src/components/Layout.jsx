import { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Search,
  Compass,
  Film,
  MessageCircle,
  PlusSquare,
  Bell,
  User,
  Sun,
  Moon,
  LogOut,
  Settings,
  Sparkles,
  TrendingUp,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import UserAvatar from './UserAvatar';
import FollowButton from './FollowButton';
import NotificationDropdown from './NotificationDropdown';

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/search', label: 'Search', icon: Search },
  { path: '/explore', label: 'Explore', icon: Compass },
  { path: '/reels', label: 'Reels', icon: Film },
  { path: '/messages', label: 'Messages', icon: MessageCircle },
  { path: '/create', label: 'Create', icon: PlusSquare },
];

export default function Layout({ children, wide = false }) {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const { theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const wideRoutes = ['/explore', '/search', '/settings', '/messages'];
  const isWide = wide || wideRoutes.some((path) => location.pathname.startsWith(path)) || location.pathname.startsWith('/profile/');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-app-bg transition-colors duration-300 dark:bg-app-dark-bg dark:text-app-dark-text">
      {/* Desktop Sidebar */}
      <aside className="fixed hidden h-screen min-h-screen w-[280px] flex-col overflow-y-auto scrollbar-hide border-r border-app-border bg-[#FCF9F7] px-5 py-6 shadow-sidebar transition-colors duration-300 dark:border-app-dark-border dark:bg-app-dark-card md:flex">
        {/* Brand Logo */}
        <Link to="/" className="group mb-8 flex shrink-0 items-center gap-3 rounded-2xl p-1 transition">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#903945,#E8AA8D)] text-xl font-black text-white shadow-active transition duration-300 group-hover:scale-105">
            N
          </span>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-app-primary">
              Nexora
            </h1>
            <p className="text-[11px] font-semibold text-app-muted dark:text-app-dark-muted">
              Social moments, refined
            </p>
          </div>
        </Link>

        {/* Primary Nav Navigation */}
        <nav className="flex shrink-0 flex-col gap-2 pb-5">
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex h-[50px] items-center gap-4 rounded-[14px] px-4 text-sm font-bold transition duration-200 ${
                  isActive
                    ? 'bg-app-primary text-white shadow-active [&>svg]:text-white'
                    : 'text-[#3A3437] [&>svg]:text-[#5E5157] hover:bg-[#F5E7E5] hover:text-app-deep hover:[&>svg]:text-app-primary dark:text-slate-300 dark:[&>svg]:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-white'
                }`
              }
            >
              <Icon className="h-5 w-5 shrink-0 stroke-[2.2]" />
              <span>{label}</span>
            </NavLink>
          ))}

          {/* Notifications Button */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`flex h-[50px] w-full items-center gap-4 rounded-[14px] px-4 text-sm font-bold transition duration-200 ${
                showNotifications
                  ? 'bg-[#F5E7E5] text-app-deep [&_svg]:text-app-primary dark:bg-slate-800 dark:text-white'
                  : 'text-[#3A3437] [&_svg]:text-[#5E5157] hover:bg-[#F5E7E5] hover:text-app-deep hover:[&_svg]:text-app-primary dark:text-slate-300 dark:[&_svg]:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-white'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Bell className="h-5 w-5 stroke-[2.2]" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-app-primary px-1 text-[10px] font-extrabold text-white ring-2 ring-white dark:ring-slate-900">
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

          {/* Profile Navigation */}
          <NavLink
            to={`/profile/${user?.username}`}
            className={({ isActive }) =>
              `flex h-[50px] items-center gap-3.5 rounded-[14px] px-3.5 text-sm font-bold transition duration-200 ${
                isActive
                  ? 'bg-app-primary text-white shadow-active'
                  : 'text-[#3A3437] hover:bg-[#F5E7E5] hover:text-app-deep dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-white'
              }`
            }
          >
            <UserAvatar user={user} size="sm" disableLink />
            <span>Profile</span>
          </NavLink>
        </nav>

        <div className="relative mb-4 block shrink-0 overflow-hidden rounded-[22px] bg-app-deep p-4 text-white min-[900px]:p-5">
          <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-app-primary" />
          <div className="absolute -bottom-12 left-8 h-24 w-24 rounded-full border-[18px] border-[#7A2638]" />
          <div className="absolute bottom-5 right-7 h-7 w-7 rounded-full bg-[#E8AA8D]" />
          <p className="relative text-sm font-black leading-5 min-[900px]:text-base">Good People.<br />Brighter World.</p>
          <p className="relative mt-2 text-[11px] font-semibold text-[#FBD0BD] min-[900px]:mt-3">Connect. Create. Belong.</p>
        </div>

        {/* Sidebar Footer (Theme Toggle + User Profile Card) */}
        <div className="mt-auto shrink-0 space-y-3 pt-1">
          <button
            onClick={toggleTheme}
            className="flex h-11 w-full items-center justify-between rounded-xl border border-app-border bg-white px-4 text-xs font-bold text-[#3A3437] transition hover:bg-[#F5E7E5] dark:border-app-dark-border dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-850"
          >
            <span className="flex items-center gap-2">
              {theme === 'dark' ? (
                <>
                  <Moon className="h-4 w-4 text-[#E8AA8D]" />
                  Dark Mode
                </>
              ) : (
                <>
                  <Sun className="h-4 w-4 text-[#DC8876]" />
                  Light Mode
                </>
              )}
            </span>
            <span className="rounded-full bg-[#F5E7E5] px-2 py-0.5 text-[10px] font-extrabold text-app-primary shadow-xs dark:bg-slate-800 dark:text-slate-400">
              {theme === 'dark' ? 'ON' : 'OFF'}
            </span>
          </button>

          <div className="rounded-[20px] border border-app-border bg-app-card p-3.5 shadow-sm transition dark:border-app-dark-border dark:bg-slate-900">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <UserAvatar user={user} size="sm" />
                <div className="min-w-0">
                  <p className="truncate text-xs font-extrabold text-app-text dark:text-app-dark-text">
                    {user?.username}
                  </p>
                  <p className="truncate text-[11px] font-medium text-app-muted dark:text-app-dark-muted">
                    {user?.fullName || 'Creator'}
                  </p>
                </div>
              </div>
              <Link
                to="/settings"
                className="rounded-lg p-1 text-app-muted hover:bg-[#F5E7E5] hover:text-app-primary dark:hover:bg-slate-800 dark:hover:text-slate-200"
                title="Settings"
              >
                <Settings className="h-4 w-4" />
              </Link>
            </div>
            <button onClick={handleLogout} className="btn-danger-outline h-9 w-full text-xs">
              <LogOut className="h-3.5 w-3.5" />
              Log out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="pb-24 md:ml-[280px] md:pb-8">
        <div className={`${isWide ? 'max-w-[1240px]' : 'max-w-[700px]'} mx-auto px-4 py-6 sm:px-6`}>
          {children}
        </div>
      </main>

      {/* Floating Create Button for Desktop */}
      <Link
        to="/create"
        className="fixed bottom-8 right-8 z-40 hidden h-[58px] w-[58px] items-center justify-center rounded-full bg-app-primary text-white shadow-fab transition duration-300 hover:scale-110 hover:bg-app-deep active:scale-95 md:flex"
        aria-label="Create post"
      >
        <PlusSquare className="h-6 w-6 stroke-[2.2]" />
      </Link>

      {/* Mobile Glass Bottom Navigation Bar */}
      <nav className="fixed bottom-3 left-3 right-3 z-40 flex items-center justify-around rounded-3xl border border-slate-200/80 bg-white/90 p-2 shadow-2xl backdrop-blur-xl transition dark:border-slate-800/80 dark:bg-slate-900/90 md:hidden">
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            aria-label={label}
            className={({ isActive }) =>
              `rounded-2xl p-2.5 transition duration-200 ${
                isActive
                  ? 'bg-app-primary text-white shadow-active'
                  : 'text-[#5E5157] hover:bg-[#F5E7E5] hover:text-app-primary dark:text-slate-400 dark:hover:bg-slate-800'
              }`
            }
          >
            <Icon className="h-5 w-5 stroke-[2.2]" />
          </NavLink>
        ))}
        <NavLink
          to={`/profile/${user?.username}`}
          aria-label="Profile"
          className={({ isActive }) =>
            `rounded-2xl p-1 transition duration-200 ${
              isActive ? 'ring-2 ring-app-primary ring-offset-2' : ''
            }`
          }
        >
          <UserAvatar user={user} size="xs" disableLink />
        </NavLink>
      </nav>
    </div>
  );
}

export function LoadingSkeleton() {
  return (
    <div className="app-card space-y-4 p-5">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
        <div className="h-4 w-28 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      </div>
      <div className="aspect-square w-full animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
      <div className="h-4 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
    </div>
  );
}

export function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="mb-1 text-xs font-extrabold uppercase tracking-[0.2em] text-nexora-pink">
            {eyebrow}
          </p>
        )}
        <h1 className="page-title">{title}</h1>
        {description && (
          <p className="mt-1 max-w-2xl text-sm text-app-muted dark:text-app-dark-muted">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="empty-state">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl text-app-primary dark:bg-slate-800">
        <Sparkles className="h-7 w-7 stroke-[1.8]" />
      </div>
      <p className="text-lg font-extrabold text-app-text dark:text-app-dark-text">{title}</p>
      {description && (
        <p className="mx-auto mt-2 max-w-sm text-sm text-app-muted dark:text-app-dark-muted">
          {description}
        </p>
      )}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}

export function SuggestedUsers({ users, onFollowToggle }) {
  const { user } = useAuth();

  if (!users?.length) {
    return (
      <aside className="hidden lg:block lg:w-[320px]">
        <div className="app-card sticky top-8 overflow-hidden p-5">
          <div className="absolute inset-x-0 top-0 h-1 bg-primary-gradient" />
          <p className="text-sm font-extrabold text-app-text dark:text-app-dark-text">Suggested for you</p>
          <p className="mt-2 text-xs leading-5 text-app-muted dark:text-app-dark-muted">
            You are all caught up! New people to follow will show up here.
          </p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-full space-y-5 lg:sticky lg:top-8 lg:w-[320px] lg:self-start">
      {/* Current User Card */}
      <div className="hidden rounded-[22px] bg-white p-4 shadow-card transition dark:bg-app-dark-card lg:block">
        <div className="flex items-center gap-3">
          <UserAvatar user={user} size="md" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-extrabold text-app-text dark:text-app-dark-text">
              {user?.username}
            </p>
            <p className="truncate text-xs text-app-muted dark:text-app-dark-muted">
              {user?.fullName || 'Creator'}
            </p>
          </div>
          <Link
            to="/settings"
            className="text-xs font-bold text-app-primary transition hover:underline"
          >
            Switch
          </Link>
        </div>
      </div>

      {/* Suggested Friends */}
      <div className="overflow-hidden rounded-[22px] bg-white shadow-card transition dark:bg-app-dark-card">
        <div className="h-1 bg-primary-gradient" />
        <div className="border-b border-app-border p-4 dark:border-app-dark-border">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-extrabold text-app-text dark:text-app-dark-text">
                Suggested for you
              </p>
              <p className="text-[11px] font-medium text-app-muted dark:text-app-dark-muted">
                Fresh profiles worth following
              </p>
            </div>
            <Link
              to="/search"
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              See all
            </Link>
          </div>
        </div>

        <div className="divide-y divide-app-border dark:divide-app-dark-border">
          {users.slice(0, 5).map((suggestedUser) => (
            <div
              key={suggestedUser._id}
              className="group flex items-center gap-3 p-3.5 transition hover:bg-slate-50 dark:hover:bg-slate-800/40"
            >
              <UserAvatar user={suggestedUser} size="md" />
              <div className="min-w-0 flex-1">
                <Link
                  to={`/profile/${suggestedUser.username}`}
                  className="truncate text-xs font-extrabold text-app-text hover:underline dark:text-app-dark-text"
                >
                  {suggestedUser.username}
                </Link>
                <p className="truncate text-[11px] text-app-muted dark:text-app-dark-muted">
                  {suggestedUser.fullName || 'User'}
                </p>
              </div>
              <FollowButton
                userId={suggestedUser._id}
                isFollowing={suggestedUser.isFollowing}
                onToggle={(nextFollowing) => onFollowToggle?.(suggestedUser._id, nextFollowing)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Trending Topics */}
      <div className="rounded-[22px] bg-white p-5 shadow-card transition dark:bg-app-dark-card">
        <div className="mb-3 flex items-center justify-between">
          <p className="flex items-center gap-1.5 text-sm font-extrabold text-app-text dark:text-app-dark-text">
            <TrendingUp className="h-4 w-4 text-app-primary" />
            Trending Topics
          </p>
          <span className="rounded-full bg-pink-100 px-2.5 py-0.5 text-[10px] font-extrabold text-pink-600 dark:bg-pink-900/40 dark:text-pink-300">
            Live
          </span>
        </div>
        <div className="space-y-2">
          {['#creatorlife', '#dailyshots', '#reels', '#aesthetic'].map((tag, index) => (
            <Link
              key={tag}
              to={`/search?q=${tag.slice(1)}`}
              className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs transition hover:bg-pink-50 dark:bg-slate-900 dark:hover:bg-slate-800"
            >
              <span className="font-bold text-slate-800 dark:text-slate-200">{tag}</span>
              <span className="text-[11px] font-semibold text-slate-400">
                {index + 2}.{index + 5}k
              </span>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
