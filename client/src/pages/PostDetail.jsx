import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import Layout, { EmptyState, LoadingSkeleton } from '../components/Layout';
import PostCard from '../components/PostCard';

export default function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data } = await api.get(`/posts/${id}`);
        setPost(data.post);
      } catch (error) {
        console.error('Post error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <LoadingSkeleton />
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <EmptyState title="Post not found" description="This post may have been deleted or is no longer available." />
      </Layout>
    );
  }

  return (
    <Layout>
      <PostCard post={post} onUpdate={setPost} />
    </Layout>
  );
}
