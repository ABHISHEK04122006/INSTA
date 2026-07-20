import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Layout, { EmptyState, PageHeader } from '../components/Layout';
import UserAvatar from '../components/UserAvatar';

export default function Messages() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const { data } = await api.get('/messages/conversations');
        setConversations(data.conversations);
      } catch (error) {
        console.error('Conversations error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="app-card animate-pulse space-y-4 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-12 h-12 bg-slate-200 rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-slate-200 rounded w-24 mb-1" />
                <div className="h-3 bg-slate-200 rounded w-40" />
              </div>
            </div>
          ))}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageHeader
        eyebrow="Inbox"
        title="Messages"
        description="Continue conversations with people you follow."
      />

      {conversations.length === 0 ? (
        <EmptyState title="No messages yet" description="Start a conversation from someone’s profile." />
      ) : (
        <div className="space-y-3">
          {conversations.map((conv) => (
            <button
              key={conv._id}
              onClick={() => navigate(`/messages/${conv._id}`)}
              className="app-card flex w-full items-center gap-3 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <UserAvatar user={conv.participant} size="lg" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-900">{conv.participant?.username}</p>
                <p className="truncate text-sm text-slate-500">{conv.lastMessage || 'No messages yet'}</p>
              </div>
              {conv.unreadCount > 0 && (
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-insta-pink px-2 text-xs font-bold text-white">
                  {conv.unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </Layout>
  );
}
