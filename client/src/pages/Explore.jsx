import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Sparkles, Compass, TrendingUp } from 'lucide-react';
import api from '../api';
import Layout, { EmptyState, PageHeader } from '../components/Layout';

export default function Explore() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [error, setError] = useState('');
  const observerRef = useRef();

  const categories = ['All', 'Trending', 'Style', 'Art', 'Photography', 'Travel', 'Food'];

  const fetchExplore = useCallback(async (pageNum = 1) => {
    try {
      if (pageNum === 1) setError('');
      const { data } = await api.get(`/posts/explore?page=${pageNum}&limit=15`);
      if (pageNum === 1) {
        setPosts(data.posts);
      } else {
        setPosts((prev) => [...prev, ...data.posts]);
      }
      setHasMore(pageNum < data.totalPages);
    } catch (error) {
      console.error('Explore error:', error);
      setError('Explore could not be loaded right now.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExplore();
  }, [fetchExplore]);

  useEffect(() => {
    if (!hasMore || loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setPage((p) => p + 1);
      },
      { threshold: 0.1 }
    );
    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading]);

  useEffect(() => {
    if (page > 1) fetchExplore(page);
  }, [page, fetchExplore]);

  if (loading) {
    return (
      <Layout>
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="aspect-square animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageHeader
        eyebrow="Discover"
        title="Explore"
        description="Browse trending photos, videos, and inspiration from the community."
      />

      {/* Category Pills Slider */}
      <div className="mb-6 flex items-center gap-2 overflow-x-auto scrollbar-hide py-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-extrabold transition duration-200 ${
              activeCategory === cat
                ? 'bg-primary-gradient text-white shadow-active'
                : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-850 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {error ? (
        <EmptyState title="Explore unavailable" description={error} />
      ) : posts.length === 0 ? (
        <EmptyState
          title="Nothing to explore yet"
          description="Once creators start sharing posts, their content will show up here."
        />
      ) : (
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3">
          {posts.map((post, idx) => {
            const isFeatured = idx % 7 === 0;
            return (
              <Link
                key={post._id}
                to={`/post/${post._id}`}
                className={`group relative overflow-hidden rounded-2xl bg-slate-900 shadow-sm ${
                  isFeatured ? 'col-span-2 row-span-2 aspect-square sm:col-span-2 sm:row-span-2' : 'aspect-square'
                }`}
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
                <div className="absolute inset-0 flex items-center justify-center gap-6 bg-black/45 text-sm font-extrabold text-white opacity-0 backdrop-blur-xs transition-opacity duration-200 group-hover:opacity-100">
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
            );
          })}
        </div>
      )}
      {hasMore && <div ref={observerRef} className="h-10" />}
    </Layout>
  );
}
