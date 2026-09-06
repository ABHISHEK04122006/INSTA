import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, X, Sparkles } from 'lucide-react';
import api from '../api';
import Layout, { EmptyState, PageHeader, SuggestedUsers } from '../components/Layout';
import UserAvatar from '../components/UserAvatar';
import FollowButton from '../components/FollowButton';

export default function Search() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get('q') || '');
  const [users, setUsers] = useState([]);
  const [suggested, setSuggested] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setQuery(searchParams.get('q') || '');
  }, [searchParams]);

  const handleFollowToggle = (userId, nextFollowing) => {
    setUsers((prev) =>
      prev.map((user) =>
        user._id === userId ? { ...user, isFollowing: nextFollowing } : user
      )
    );

    setSuggested((prev) =>
      nextFollowing
        ? prev.filter((user) => user._id !== userId)
        : prev.map((user) =>
            user._id === userId ? { ...user, isFollowing: nextFollowing } : user
          )
    );
  };

  useEffect(() => {
    const fetchSuggested = async () => {
      try {
        const { data } = await api.get('/users/suggested');
        setSuggested(data.users || []);
      } catch (error) {
        console.error('Suggested error:', error);
      }
    };

    fetchSuggested();
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setUsers([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
        setUsers(data.users || []);
      } catch (error) {
        console.error('Search error:', error);
        setError('Search is not available right now.');
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <Layout>
      <PageHeader
        eyebrow="Find people"
        title="Search"
        description="Discover creators by username or name, or follow suggested accounts."
      />

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <section className="min-w-0 flex-1">
          {/* Search Input Bar */}
          <div className="relative mb-6">
            <SearchIcon className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or @username..."
              className="field h-12 pl-12 pr-10 text-xs font-semibold"
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3.5 top-3.5 rounded-full p-0.5 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {loading && (
            <div className="flex items-center justify-center py-10">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-300 border-t-app-primary dark:border-slate-700" />
            </div>
          )}

          {!loading && error && (
            <EmptyState title="Search unavailable" description={error} />
          )}

          {!loading && !error && query && users.length === 0 && (
            <EmptyState
              title="No users found"
              description="Try a different username, name, or spelling."
            />
          )}

          {!loading && !error && !query && (
            <EmptyState
              title="Start typing to search"
              description="Enter a keyword above or explore suggestions on the right."
            />
          )}

          <div className="space-y-3">
            {users.map((user) => (
              <div
                key={user._id}
                className="app-card flex items-center justify-between p-4 transition hover:border-app-primary/40"
              >
                <Link to={`/profile/${user.username}`} className="flex items-center gap-3.5 min-w-0">
                  <UserAvatar user={user} size="md" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-extrabold text-app-text hover:underline dark:text-app-dark-text">
                      {user.username}
                    </p>
                    <p className="truncate text-xs text-app-muted dark:text-app-dark-muted">
                      {user.fullName || 'User'}
                    </p>
                  </div>
                </Link>
                <FollowButton
                  userId={user._id}
                  isFollowing={user.isFollowing}
                  onToggle={(nextFollowing) => handleFollowToggle(user._id, nextFollowing)}
                />
              </div>
            ))}
          </div>
        </section>

        <SuggestedUsers users={suggested} onFollowToggle={handleFollowToggle} />
      </div>
    </Layout>
  );
}
