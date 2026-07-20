import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import UserAvatar from '../components/UserAvatar';

export default function Chat() {
  const { conversationId } = useParams();
  const { user } = useAuth();
  const socket = useSocket();
  const [messages, setMessages] = useState([]);
  const [participant, setParticipant] = useState(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef();
  const typingTimeout = useRef();

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const [msgRes, convRes] = await Promise.all([
          api.get(`/messages/conversations/${conversationId}/messages`),
          api.get('/messages/conversations'),
        ]);
        setMessages(msgRes.data.messages);
        const conv = convRes.data.conversations.find((c) => c._id === conversationId);
        setParticipant(conv?.participant);
      } catch (error) {
        console.error('Chat error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = ({ conversationId: convId, message }) => {
      if (convId === conversationId) {
        setMessages((prev) => [...prev, message]);
      }
    };

    const handleTyping = ({ conversationId: convId }) => {
      if (convId === conversationId) setIsTyping(true);
    };

    const handleStopTyping = ({ conversationId: convId }) => {
      if (convId === conversationId) setIsTyping(false);
    };

    socket.on('new_message', handleNewMessage);
    socket.on('typing', handleTyping);
    socket.on('stop_typing', handleStopTyping);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('typing', handleTyping);
      socket.off('stop_typing', handleStopTyping);
    };
  }, [socket, conversationId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    const messageText = text;
    setText('');

    try {
      const { data } = await api.post(`/messages/conversations/${conversationId}/messages`, {
        text: messageText,
      });
      setMessages((prev) => {
        if (prev.some((m) => m._id === data.message._id)) return prev;
        return [...prev, data.message];
      });
    } catch (error) {
      console.error('Send error:', error);
      setText(messageText);
    }

    if (socket && participant) {
      socket.emit('stop_typing', {
        conversationId,
        recipientId: participant._id,
      });
    }
  };

  const handleTyping = () => {
    if (!socket || !participant) return;
    socket.emit('typing', { conversationId, recipientId: participant._id });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit('stop_typing', { conversationId, recipientId: participant._id });
    }, 2000);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-insta-pink" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col bg-white shadow-xl shadow-slate-200/60">
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-slate-200 bg-white/90 p-4 backdrop-blur-xl">
        <Link to="/messages" className="rounded-full p-2 transition hover:bg-slate-100">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        {participant && (
          <>
            <UserAvatar user={participant} />
            <div>
              <Link to={`/profile/${participant.username}`} className="text-sm font-bold text-slate-950 hover:underline">
                {participant.username}
              </Link>
              <p className="text-xs text-slate-400">Direct message</p>
            </div>
          </>
        )}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4">
        {messages.map((msg) => {
          const isOwn = msg.sender?._id === user?._id || msg.sender === user?._id;
          return (
            <div key={msg._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] rounded-3xl px-4 py-2 text-sm shadow-sm ${
                  isOwn ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
        {isTyping && (
          <p className="text-xs font-medium text-slate-400">typing...</p>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2 border-t border-slate-200 bg-white p-4">
        <input
          type="text"
          value={text}
          onChange={(e) => { setText(e.target.value); handleTyping(); }}
          placeholder="Message..."
          className="field rounded-full"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="btn-primary rounded-full px-5"
        >
          Send
        </button>
      </form>
    </div>
  );
}
