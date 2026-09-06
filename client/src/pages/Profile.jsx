import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Grid, Heart, MessageCircle, Settings, Share2, Film, Bookmark } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState('posts');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get(`/users/${username}`);
        setProfile(data);
        setPosts(data.posts || []);
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
        <EmptyState
          title="User not found"
          description="This profile may have been removed or the username may be incorrect."
        />
      </Layout>
    );
  }

  const { user, isFollowing, isOwnProfile } = profile;

  return (
    <Layout>
      {/* Profile Header Hero Card */}
      <div className="app-card mb-8 p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
          <div className="relative shrink-0 self-center sm:self-auto">
            <div className="rounded-full bg-story-ring p-1 shadow-active">
              <div className="rounded-full bg-white p-1 dark:bg-slate-900">
                <UserAvatar user={user} size="2xl" disableLink />
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="page-title">{user.username}</h1>
                <p className="text-xs font-bold text-app-muted dark:text-app-dark-muted">
                  {user.fullName || 'Nexora Creator'}
                </p>
              </div>

              {isOwnProfile ? (
                <div className="flex items-center gap-2">
                  <Link to="/settings" className="btn-secondary text-xs h-10 px-4">
                    <Settings className="h-4 w-4" />
                    Edit Profile
                  </Link>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <FollowButton
                    userId={user._id}
                    isFollowing={isFollowing}
                    onToggle={() => setProfile((p) => ({ ...p, isFollowing: !p.isFollowing }))}
                  />
                  <button onClick={handleMessage} className="btn-secondary text-xs h-10 px-4">
                    <MessageCircle className="h-4 w-4" />
                    Message
                  </button>
                </div>
              )}
            </div>

            {/* Stats Cards Row */}
            <div className="mb-4 grid grid-cols-3 gap-2.5 text-center sm:max-w-md">
              <div className="rounded-2xl border border-app-border bg-slate-50/70 p-3 dark:border-app-dark-border dark:bg-slate-900">
                <strong className="block text-base font-black text-app-text dark:text-app-dark-text">
                  {posts.length}
                </strong>
                <span className="text-[11px] font-bold text-app-muted dark:text-app-dark-muted">
                  Posts
                </span>
              </div>
              <div className="rounded-2xl border border-app-border bg-slate-50/70 p-3 dark:border-app-dark-border dark:bg-slate-900">
                <strong className="block text-base font-black text-app-text dark:text-app-dark-text">
                  {user.followersCount || 0}
                </strong>
                <span className="text-[11px] font-bold text-app-muted dark:text-app-dark-muted">
                  Followers
                </span>
              </div>
              <div className="rounded-2xl border border-app-border bg-slate-50/70 p-3 dark:border-app-dark-border dark:bg-slate-900">
                <strong className="block text-base font-black text-app-text dark:text-app-dark-text">
                  {user.followingCount || 0}
                </strong>
                <span className="text-[11px] font-bold text-app-muted dark:text-app-dark-muted">
                  Following
                </span>
              </div>
            </div>

            {user.bio && (
              <p className="text-xs leading-5 text-slate-700 dark:text-slate-300">
                {user.bio}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="mb-6 flex justify-center border-b border-app-border dark:border-app-dark-border">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex items-center gap-2 border-b-2 pb-3 text-xs font-black transition ${
              activeTab === 'posts'
                ? 'border-app-primary text-app-primary'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Grid className="h-4 w-4" />
            POSTS
          </button>
          <button
            onClick={() => setActiveTab('reels')}
            className={`flex items-center gap-2 border-b-2 pb-3 text-xs font-black transition ${
              activeTab === 'reels'
                ? 'border-app-primary text-app-primary'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Film className="h-4 w-4" />
            REELS
          </button>
          {isOwnProfile && (
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex items-center gap-2 border-b-2 pb-3 text-xs font-black transition ${
                activeTab === 'saved'
                  ? 'border-app-primary text-app-primary'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <Bookmark className="h-4 w-4" />
              SAVED
            </button>
          )}
        </div>
      </div>

      {/* Grid Content */}
      {posts.length === 0 ? (
        <EmptyState
          title="No posts yet"
          description="Photos and videos shared will show up here."
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post._id}
              to={`/post/${post._id}`}
              className="group relative aspect-square overflow-hidden rounded-2xl bg-slate-900 shadow-sm"
            >
              {post.mediaType === 'video' ? (
                <video src={post.mediaUrl[0]} className="h-full w-full object-cover" />
              ) : (
                <img
                  src={post.mediaUrl[0]}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              )}
              {/* Hover Overlay with Likes and Comments */}
              <div className="absolute inset-0 flex items-center justify-center gap-6 bg-black/50 text-sm font-extrabold text-white opacity-0 backdrop-blur-xs transition-opacity duration-200 group-hover:opacity-100">
                <span className="flex items-center gap-1.5">
                  <Heart className="h-5 w-5 fill-white" />
                  {post.likes?.length || 0}
                </span>
                <span className="flex items-center gap-1.5">
                  <MessageCircle className="h-5 w-5 fill-white" />
                  {post.comments?.length || 0}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Layout>
  );
}
