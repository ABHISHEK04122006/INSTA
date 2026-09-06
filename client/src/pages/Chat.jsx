import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Send, Smile, Phone, Video, MoreVertical } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Layout from '../components/Layout';
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
      <Layout>
        <div className="flex h-[70vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-app-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-4xl flex-col overflow-hidden rounded-[26px] border border-app-border bg-white shadow-xl transition-colors duration-300 dark:border-app-dark-border dark:bg-app-dark-card">
        {/* Chat Top Header */}
        <div className="flex items-center justify-between border-b border-app-border px-5 py-3.5 backdrop-blur-md dark:border-app-dark-border">
          <div className="flex items-center gap-3.5">
            <Link
              to="/messages"
              className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            {participant && (
              <div className="flex items-center gap-3">
                <div className="relative">
                  <UserAvatar user={participant} size="md" />
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-400 dark:border-slate-900" />
                </div>
                <div>
                  <Link
                    to={`/profile/${participant.username}`}
                    className="text-sm font-extrabold text-app-text hover:underline dark:text-app-dark-text"
                  >
                    {participant.username}
                  </Link>
                  <p className="text-[11px] font-medium text-emerald-500">Active now</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
              <Phone className="h-4 w-4" />
            </button>
            <button className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
              <Video className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Messages Body */}
        <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/50 p-5 dark:bg-slate-900/40">
          {messages.map((msg) => {
            const isOwn = msg.sender?._id === user?._id || msg.sender === user?._id;
            return (
              <div key={msg._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] rounded-[20px] px-4 py-2.5 text-xs leading-5 shadow-xs ${
                    isOwn
                      ? 'rounded-br-sm bg-primary-gradient font-semibold text-white shadow-active'
                      : 'rounded-bl-sm border border-slate-200/80 bg-white font-medium text-slate-800 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}
          {isTyping && (
            <div className="flex justify-start">
              <div className="rounded-full bg-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-500 animate-pulse dark:bg-slate-800 dark:text-slate-400">
                typing...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSend}
          className="flex items-center gap-2 border-t border-app-border bg-white p-3.5 dark:border-app-dark-border dark:bg-app-dark-card"
        >
          <Smile className="h-5 w-5 shrink-0 text-slate-400" />
          <input
            type="text"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              handleTyping();
            }}
            placeholder="Type a message..."
            className="field flex-1 text-xs"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="btn-primary h-11 w-11 rounded-full p-0 shadow-active disabled:opacity-40"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </Layout>
  );
}
