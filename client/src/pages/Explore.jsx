import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import Layout, { EmptyState, PageHeader } from '../components/Layout';

export default function Explore() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState('');
  const observerRef = useRef();

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
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="aspect-square animate-pulse rounded-2xl bg-slate-200" />
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
        description="Browse the latest posts from the community."
      />

      {error ? (
        <EmptyState title="Explore unavailable" description={error} />
      ) : posts.length === 0 ? (
        <EmptyState title="Nothing to explore yet" description="Once people start posting, their photos and videos will appear here." />
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
      {hasMore && <div ref={observerRef} className="h-10" />}
    </Layout>
  );
}
