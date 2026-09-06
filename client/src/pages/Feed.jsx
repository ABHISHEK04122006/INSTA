import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api';
import Layout, { EmptyState, LoadingSkeleton } from '../components/Layout';
import PostCard from '../components/PostCard';
import StoryBar, { StoryViewer } from '../components/StoryBar';
import { useAuth } from '../context/AuthContext';
import { HomeHeader, HomeSidebar, NexoraEmptyFeed, PostComposer } from '../components/HomeDashboard';

const getViewerId = (viewer) => viewer?._id || viewer;

export default function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [storyGroups, setStoryGroups] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [viewingStory, setViewingStory] = useState(null);
  const [storyIndex, setStoryIndex] = useState(0);
  const [error, setError] = useState('');
  const observerRef = useRef();

  const fetchFeed = useCallback(async (pageNum = 1) => {
    try {
      if (pageNum === 1) setError('');
      const { data } = await api.get(`/posts/feed?page=${pageNum}&limit=5`);
      if (pageNum === 1) {
        setPosts(data.posts);
      } else {
        setPosts((prev) => [...prev, ...data.posts]);
      }
      setHasMore(pageNum < data.totalPages);
    } catch (error) {
      console.error('Feed error:', error);
      setError('We could not load your feed. Please check your connection and try again.');
    }
  }, []);

  const fetchStories = useCallback(async () => {
    try {
      const { data } = await api.get('/stories/feed');
      setStoryGroups(data.storyGroups);
    } catch (error) {
      console.error('Stories error:', error);
    }
  }, []);

  const fetchSuggested = useCallback(async () => {
    try {
      const { data } = await api.get('/search/users?q=a');
      setSuggestedUsers(data.users || []);
    } catch (error) {
      console.error('Suggested users error:', error);
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchFeed(), fetchStories(), fetchSuggested()]).finally(() => setLoading(false));
  }, [fetchFeed, fetchStories, fetchSuggested]);

  useEffect(() => {
    if (!hasMore || loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage((p) => p + 1);
        }
      },
      { threshold: 0.1 }
    );
    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading]);

  useEffect(() => {
    if (page > 1) fetchFeed(page);
  }, [page, fetchFeed]);

  const markStoryAsViewed = useCallback((story) => {
    if (!user?._id) return;
    const storyId = typeof story === 'string' ? story : story?._id;
    if (!storyId) return;

    setStoryGroups((groups) => groups.map((group) => {
      if (!group.stories.some((item) => item._id === storyId)) return group;

      const stories = group.stories.map((story) => {
        if (story._id !== storyId) return story;

        const hasViewed = story.viewers?.some((viewer) => String(getViewerId(viewer)) === String(user._id));
        return hasViewed ? story : { ...story, viewers: [...(story.viewers || []), user._id] };
      });
      const hasUnviewed = stories.some((story) => !story.viewers?.some(
        (viewer) => String(getViewerId(viewer)) === String(user._id)
      ));

      return { ...group, stories, hasUnviewed };
    }));

    api.post(`/stories/${storyId}/view`).catch(() => fetchStories());
  }, [fetchStories, user?._id]);

  const handleViewStory = (group) => {
    const idx = storyGroups.findIndex((g) => g.author._id === group.author._id);
    setStoryIndex(idx);
    setViewingStory(group);
  };

  const handleStoryNext = () => {
    if (storyIndex < storyGroups.length - 1) {
      const next = storyGroups[storyIndex + 1];
      setStoryIndex(storyIndex + 1);
      setViewingStory(next);
    } else {
      setViewingStory(null);
    }
  };

  const handleStoryPrev = () => {
    if (storyIndex > 0) {
      const prev = storyGroups[storyIndex - 1];
      setStoryIndex(storyIndex - 1);
      setViewingStory(prev);
    }
  };

  if (loading) {
    return (
      <Layout wide>
        <div className="space-y-6">
          <LoadingSkeleton />
          <LoadingSkeleton />
        </div>
      </Layout>
    );
  }

  return (
    <Layout wide>
      <HomeHeader />
      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
        <main className="min-w-0">
          <StoryBar storyGroups={storyGroups} onViewStory={handleViewStory} onCreated={fetchStories} />
          <PostComposer />

          {error ? (
            <EmptyState title="Feed unavailable" description={error} />
          ) : posts.length === 0 ? (
            <NexoraEmptyFeed />
          ) : (
            posts.map((post) => <PostCard key={post._id} post={post} />)
          )}

          {hasMore && <div ref={observerRef} className="h-10" />}
        </main>

        <HomeSidebar users={suggestedUsers} />
      </div>

      {viewingStory && (
        <StoryViewer
          storyGroup={viewingStory}
          onClose={() => setViewingStory(null)}
          onNext={handleStoryNext}
          onPrev={handleStoryPrev}
          onStoryView={markStoryAsViewed}
        />
      )}
    </Layout>
  );
}
