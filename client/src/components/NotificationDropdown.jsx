import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Heart,
  MessageSquare,
  UserPlus,
  MessageCircle,
  AtSign,
  X,
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import UserAvatar from './UserAvatar';

export default function NotificationDropdown({ isOpen, onClose, placement = 'sidebar' }) {
  const { notifications, markAllRead, markRead } = useNotifications();
  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return <Heart className="h-3.5 w-3.5 fill-app-primary text-app-primary" />;
      case 'comment':
        return <MessageSquare className="h-3.5 w-3.5 text-[#A65363]" />;
      case 'follow':
        return <UserPlus className="h-3.5 w-3.5 text-app-primary" />;
      case 'dm':
        return <MessageCircle className="h-3.5 w-3.5 text-[#DC8876]" />;
      case 'mention':
        return <AtSign className="h-3.5 w-3.5 text-[#E8AA8D]" />;
      default:
        return <Bell className="h-3.5 w-3.5 text-app-primary" />;
    }
  };

  const getMessage = (n) => {
    switch (n.type) {
      case 'follow':
        return 'started following you';
      case 'like':
        return 'liked your post';
      case 'comment':
        return 'commented on your post';
      case 'mention':
        return 'mentioned you in a post';
      case 'dm':
        return 'sent you a message';
      default:
        return 'interacted with you';
    }
  };

  const getLink = (n) => {
    switch (n.type) {
      case 'follow':
        return `/profile/${n.actor?.username}`;
      case 'dm':
        return `/messages/${n.targetId}`;
      default:
        return `/profile/${n.actor?.username}`;
    }
  };

  const getTimeLabel = (date) => {
    if (!date) return 'now';
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  const getSection = (notification) => {
    const created = new Date(notification.createdAt || Date.now());
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);

    if (created >= startOfToday) return 'Today';
    if (created >= startOfYesterday) return 'Yesterday';
    return 'Earlier';
  };

  const grouped = notifications.reduce((acc, notification) => {
    const section = getSection(notification);
    acc[section] = [...(acc[section] || []), notification];
    return acc;
  }, {});

  const sections = ['Today', 'Yesterday', 'Earlier'];

  const placementClasses = placement === 'header'
    ? 'fixed left-4 right-4 top-20 md:absolute md:left-auto md:right-0 md:top-12 md:w-[380px]'
    : 'fixed left-4 right-4 top-20 md:left-[300px] md:right-auto md:top-6 md:w-[min(380px,calc(100vw-320px))]';

  return (
    <div
      ref={dropdownRef}
      className={`${placementClasses} z-50 flex max-h-[calc(100vh-6rem)] flex-col overflow-hidden rounded-[26px] border border-app-border bg-white shadow-2xl transition duration-200 dark:border-slate-800 dark:bg-slate-900 md:max-h-[calc(100vh-3rem)] md:shadow-2xl animate-fade-in`}
    >
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-app-border p-4 dark:border-slate-800">
        <div>
          <h3 className="text-base font-black text-app-text dark:text-white">Notifications</h3>
          <p className="text-[11px] font-semibold text-app-muted dark:text-slate-400">
            Recent activity from your network
          </p>
        </div>

        <div className="flex items-center gap-2">
          {notifications.length > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-app-primary transition hover:bg-[#F5E7E5] dark:hover:bg-slate-800"
              title="Mark all as read"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark read
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded-full p-1 text-app-muted hover:bg-[#F5E7E5] hover:text-app-primary dark:hover:bg-slate-800"
            aria-label="Close notifications"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Body List */}
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-10 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
            <Bell className="h-6 w-6 stroke-[1.8]" />
          </div>
          <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200">No notifications yet</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            When people follow you or like your posts, you'll see them here.
          </p>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto py-2">
          {sections.map((section) =>
            grouped[section]?.length ? (
              <div key={section} className="py-1">
                <p className="px-5 pb-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                  {section}
                </p>
                {grouped[section].map((n) => (
                  <Link
                    key={n._id}
                    to={getLink(n)}
                    onClick={() => {
                      markRead(n._id);
                      onClose();
                    }}
                    className={`mx-2 flex items-center gap-3 rounded-2xl p-3 transition duration-150 ${
                      !n.read
                        ? 'bg-[#FBEDEE] font-semibold dark:bg-white/5'
                        : 'hover:bg-[#F5E7E5] dark:hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <UserAvatar user={n.actor} size="sm" disableLink />
                      <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white shadow-xs dark:bg-slate-900">
                        {getNotificationIcon(n.type)}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 text-xs leading-4">
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        {n.actor?.username}
                      </span>{' '}
                      <span className="text-app-muted dark:text-slate-300">{getMessage(n)}</span>
                      <p className="mt-1 text-[10px] font-medium text-slate-400">{getTimeLabel(n.createdAt)} ago</p>
                    </div>
                    {!n.read && <div className="h-2 w-2 shrink-0 rounded-full bg-app-primary" />}
                  </Link>
                ))}
              </div>
            ) : null
          )}
        </div>
      )}
    </div>
  );
}
