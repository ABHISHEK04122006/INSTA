import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Search, Sparkles } from 'lucide-react';
import api from '../api';
import Layout, { EmptyState, PageHeader } from '../components/Layout';
import UserAvatar from '../components/UserAvatar';

export default function Messages() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const { data } = await api.get('/messages/conversations');
        setConversations(data.conversations || []);
      } catch (error) {
        console.error('Conversations error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  const filteredConversations = conversations.filter((c) =>
    c.participant?.username?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <Layout>
        <div className="app-card space-y-4 p-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3.5">
              <div className="h-12 w-12 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-28 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-3 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
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
        eyebrow="Direct Inbox"
        title="Messages"
        description="Private chats and real-time conversations with your network."
      />

      {/* Search Inbox Filter Bar */}
      <div className="relative mb-5">
        <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search chats..."
          className="field pl-11 text-xs"
        />
      </div>

      {filteredConversations.length === 0 ? (
        <EmptyState
          title="No messages found"
          description="Start a chat directly from a user's profile."
        />
      ) : (
        <div className="space-y-3">
          {filteredConversations.map((conv) => (
            <button
              key={conv._id}
              onClick={() => navigate(`/messages/${conv._id}`)}
              className="app-card group flex w-full items-center gap-4 p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:border-app-primary/40 hover:shadow-lg"
            >
              <div className="relative">
                <UserAvatar user={conv.participant} size="lg" disableLink />
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-400 dark:border-slate-900" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="truncate text-sm font-extrabold text-app-text group-hover:text-app-primary dark:text-app-dark-text">
                    {conv.participant?.username}
                  </p>
                </div>
                <p className="truncate text-xs font-medium text-app-muted dark:text-app-dark-muted">
                  {conv.lastMessage || 'Start conversation...'}
                </p>
              </div>

              {conv.unreadCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-gradient px-1.5 text-[11px] font-extrabold text-white shadow-active">
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
