import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api';
import Layout, { EmptyState, LoadingSkeleton } from '../components/Layout';
import PostCard from '../components/PostCard';
import StoryBar, { StoryViewer } from '../components/StoryBar';

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [storyGroups, setStoryGroups] = useState([]);
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

  useEffect(() => {
    Promise.all([fetchFeed(), fetchStories()]).finally(() => setLoading(false));
  }, [fetchFeed, fetchStories]);

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

  const handleViewStory = async (group) => {
    const idx = storyGroups.findIndex((g) => g.author._id === group.author._id);
    setStoryIndex(idx);
    setViewingStory(group);
    for (const story of group.stories) {
      await api.post(`/stories/${story._id}/view`).catch(() => {});
    }
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
      <Layout>
        <LoadingSkeleton />
      </Layout>
    );
  }

  return (
    <Layout>
      <StoryBar
        storyGroups={storyGroups}
        onViewStory={handleViewStory}
      />

      {error ? (
        <EmptyState
          title="Feed unavailable"
          description={error}
        />
      ) : posts.length === 0 ? (
        <EmptyState
          title="Welcome to Insta"
          description="Search for people to follow or share your first post to bring this feed to life."
        />
      ) : (
        posts.map((post) => <PostCard key={post._id} post={post} />)
      )}

      {hasMore && <div ref={observerRef} className="h-10" />}

      {viewingStory && (
        <StoryViewer
          storyGroup={viewingStory}
          onClose={() => setViewingStory(null)}
          onNext={handleStoryNext}
          onPrev={handleStoryPrev}
        />
      )}
    </Layout>
  );
}
