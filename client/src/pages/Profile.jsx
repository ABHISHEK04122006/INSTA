import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import Layout, { EmptyState, LoadingSkeleton } from '../components/Layout';
import UserAvatar from '../components/UserAvatar';
import FollowButton from '../components/FollowButton';

export default function Profile() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get(`/users/${username}`);
        setProfile(data);
        setPosts(data.posts);
      } catch (error) {
        console.error('Profile error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

  const handleMessage = async () => {
    try {
      const { data } = await api.post('/messages/conversations', {
        userId: profile.user._id,
      });
      navigate(`/messages/${data.conversation._id}`);
    } catch (error) {
      console.error('Message error:', error);
    }
  };

  if (loading) {
    return (
      <Layout>
        <LoadingSkeleton />
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <EmptyState title="User not found" description="This profile may have been removed or the username may be incorrect." />
      </Layout>
    );
  }

  const { user, isFollowing, isOwnProfile } = profile;

  return (
    <Layout>
      <div className="app-card mb-8 p-5 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
          <UserAvatar user={user} size="2xl" />
          <div className="flex-1">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <h1 className="page-title">{user.username}</h1>
              {isOwnProfile ? (
                <Link
                  to="/settings"
                  className="btn-secondary"
                >
                  Edit profile
                </Link>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <FollowButton
                    userId={user._id}
                    isFollowing={isFollowing}
                    onToggle={() => setProfile((p) => ({ ...p, isFollowing: !p.isFollowing }))}
                  />
                  <button
                    onClick={handleMessage}
                    className="btn-secondary"
                  >
                    Message
                  </button>
                </div>
              )}
            </div>

            <div className="mb-4 grid grid-cols-3 gap-3 text-center sm:max-w-md">
              <span className="rounded-2xl bg-slate-50 p-3 text-sm"><strong className="block text-lg text-slate-950">{posts.length}</strong> posts</span>
              <span className="rounded-2xl bg-slate-50 p-3 text-sm"><strong className="block text-lg text-slate-950">{user.followersCount}</strong> followers</span>
              <span className="rounded-2xl bg-slate-50 p-3 text-sm"><strong className="block text-lg text-slate-950">{user.followingCount}</strong> following</span>
            </div>

            <p className="text-sm font-bold text-slate-900">{user.fullName}</p>
            {user.bio && <p className="mt-1 text-sm leading-6 text-slate-600">{user.bio}</p>}
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 pt-5">
        {posts.length === 0 ? (
          <EmptyState title="No posts yet" description="Shared photos and videos will appear on this profile." />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post._id}
                to={`/post/${post._id}`}
                className="group relative aspect-square overflow-hidden rounded-2xl bg-slate-100 shadow-sm"
              >
                {post.mediaType === 'video' ? (
                  <video src={post.mediaUrl[0]} className="w-full h-full object-cover" />
                ) : (
                  <img src={post.mediaUrl[0]} alt="" className="w-full h-full object-cover" loading="lazy" />
                )}
                <div className="absolute inset-0 flex items-center justify-center gap-4 bg-black/35 text-sm font-bold text-white opacity-0 transition-opacity group-hover:opacity-100">
                  <span>♥ {post.likes?.length || 0}</span>
                  <span>💬 {post.comments?.length || 0}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
