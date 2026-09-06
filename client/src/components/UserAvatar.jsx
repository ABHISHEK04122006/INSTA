import { Link } from 'react-router-dom';

export default function UserAvatar({ user, size = 'md', className = '', disableLink = false }) {
  const sizes = {
    xs: 'w-7 h-7 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl',
    '2xl': 'w-32 h-32 text-3xl',
  };

  const initials = (user?.fullName || user?.username || 'User')
    .trim()
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'U';

  const avatar = user?.avatar ? (
    <img
      src={user.avatar}
      alt={user?.username || 'User'}
      className={`${sizes[size]} shrink-0 rounded-full border border-slate-200/80 object-cover shadow-sm transition-transform duration-200 dark:border-slate-800 ${className}`}
    />
  ) : (
    <div
      className={`${sizes[size]} shrink-0 flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#903945,#E8AA8D)] font-black text-white shadow-sm ring-1 ring-white/20 ${className}`}
      aria-label={user?.username || 'User'}
    >
      {initials}
    </div>
  );

  if (user?.username && !disableLink) {
    return (
      <Link to={`/profile/${user.username}`} className="shrink-0 transition-opacity hover:opacity-90">
        {avatar}
      </Link>
    );
  }

  return avatar;
}
