import { Link } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import UserAvatar from './UserAvatar';

export default function NotificationDropdown({ isOpen, onClose }) {
  const { notifications, markAllRead, markRead } = useNotifications();

  if (!isOpen) return null;

  const getMessage = (n) => {
    switch (n.type) {
      case 'follow': return 'started following you';
      case 'like': return 'liked your post';
      case 'comment': return 'commented on your post';
      case 'mention': return 'mentioned you';
      case 'dm': return 'sent you a message';
      default: return 'interacted with you';
    }
  };

  const getLink = (n) => {
    switch (n.type) {
      case 'follow': return `/profile/${n.actor?.username}`;
      case 'dm': return `/messages/${n.targetId}`;
      default: return `/profile/${n.actor?.username}`;
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

  return (
    <div className="fixed left-4 right-4 top-20 z-50 flex max-h-[calc(100vh-6rem)] flex-col overflow-hidden rounded-[22px] border border-app-border bg-white shadow-dropdown sm:left-auto sm:right-6 sm:w-[380px] md:left-[280px] md:right-auto md:top-6">
      <div className="shrink-0 flex items-center justify-between border-b border-app-border p-5">
        <div>
          <h3 className="text-base font-black text-app-text">Notifications</h3>
          <p className="mt-1 text-xs font-medium text-app-muted">Recent activity from your network</p>
        </div>
        <button onClick={markAllRead} className="text-xs font-bold text-app-secondary">Mark all read</button>
      </div>

      {notifications.length === 0 ? (
        <p className="p-6 text-center text-sm text-app-muted">No notifications yet</p>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto py-2">
          {sections.map((section) => grouped[section]?.length ? (
            <div key={section} className="py-2">
              <p className="px-5 pb-2 text-xs font-black uppercase tracking-[0.18em] text-app-muted">
                {section}
              </p>
              {grouped[section].map((n) => (
                <Link
                  key={n._id}
                  to={getLink(n)}
                  onClick={() => { markRead(n._id); onClose(); }}
                  className={`mx-3 flex items-center gap-3 rounded-2xl p-3 transition hover:bg-indigo-50 ${
                    !n.read ? 'border-l-4 border-app-secondary bg-app-bg' : ''
                  }`}
                >
                  <UserAvatar user={n.actor} size="sm" />
                  <div className="min-w-0 flex-1 text-sm leading-5">
                    <span className="font-black text-app-text">{n.actor?.username}</span>{' '}
                    <span className="text-app-muted">{getMessage(n)}</span>
                    <p className="text-xs font-medium text-app-muted">{getTimeLabel(n.createdAt)} ago</p>
                  </div>
                  {!n.read && <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-app-secondary" />}
                </Link>
              ))}
            </div>
          ) : null)}
        </div>
      )}
    </div>
  );
}
