import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import Layout, { EmptyState, PageHeader, SuggestedUsers } from '../components/Layout';
import UserAvatar from '../components/UserAvatar';
import FollowButton from '../components/FollowButton';

export default function Search() {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [suggested, setSuggested] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
        setUsers(data.users);
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
        description="Look up creators by username or name, or browse suggested people to follow."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,560px)_320px] lg:items-start lg:justify-center">
        <section className="min-w-0">
          <div className="mb-6">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search users"
              className="field h-12 rounded-full"
              autoFocus
            />
          </div>

          {loading && <p className="text-center text-sm font-medium text-slate-500">Searching...</p>}

          {!loading && error && (
            <EmptyState title="Search unavailable" description={error} />
          )}

          {!loading && !error && query && users.length === 0 && (
            <EmptyState title="No users found" description="Try a different username, name, or spelling." />
          )}

          {!loading && !error && !query && (
            <EmptyState title="Start typing to search" description="Use search, or pick from the suggestions beside it." />
          )}

          <div className="space-y-3">
            {users.map((user) => (
              <div key={user._id} className="app-card flex items-center justify-between p-5">
                <Link to={`/profile/${user.username}`} className="flex items-center gap-3">
                  <UserAvatar user={user} />
                  <div>
                    <p className="text-sm font-bold text-slate-900">{user.username}</p>
                    <p className="text-xs text-slate-500">{user.fullName}</p>
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
