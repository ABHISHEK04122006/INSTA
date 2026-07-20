import { Link } from 'react-router-dom';

export default function UserAvatar({ user, size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
    '2xl': 'w-32 h-32',
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
      className={`${sizes[size]} rounded-full border border-white object-cover shadow-sm ${className}`}
    />
  ) : (
    <div
      className={`${sizes[size]} flex items-center justify-center rounded-full bg-insta-gradient text-xs font-black text-white shadow-sm ${className}`}
      aria-label={user?.username || 'User'}
    >
      {initials}
    </div>
  );

  if (user?.username) {
    return <Link to={`/profile/${user.username}`}>{avatar}</Link>;
  }

  return avatar;
}
