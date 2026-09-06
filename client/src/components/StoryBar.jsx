import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, X, UploadCloud, Heart, Send } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import UserAvatar from './UserAvatar';

const IMAGE_DURATION_MS = 5000;

const sameUser = (first, second) => String(first?._id || first) === String(second?._id || second);

export default function StoryBar({ storyGroups, onViewStory, onCreated }) {
  const { user } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const ownGroup = storyGroups?.find((group) => sameUser(group.author, user));
  const otherGroups = storyGroups?.filter((group) => !sameUser(group.author, user)) || [];

  return (
    <div className="mb-6 rounded-[24px] border border-app-border bg-app-card p-4 shadow-card transition-colors duration-300 dark:border-app-dark-border dark:bg-app-dark-card">
      <div className="flex items-start gap-4 overflow-x-auto scrollbar-hide py-1">
        <div className="flex shrink-0 flex-col items-center gap-1.5">
          <div className="relative">
            <button
              type="button"
              onClick={() => (ownGroup ? onViewStory(ownGroup) : setShowCreate(true))}
              className="group block rounded-full focus:outline-none"
              aria-label={ownGroup ? 'View your story' : 'Create a story'}
            >
              <div className={`rounded-full p-[2.5px] transition duration-300 group-hover:scale-105 ${ownGroup ? 'bg-story-ring shadow-active' : 'bg-app-primary shadow-active'}`}>
                <div className="rounded-full bg-white p-0.5 dark:bg-slate-900">
                  <UserAvatar user={ownGroup?.author || user} size="lg" className="!h-14 !w-14" disableLink />
                </div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-app-primary text-white shadow-sm transition hover:scale-110 dark:border-app-dark-card"
              aria-label="Add to your story"
            >
              <Plus className="h-3.5 w-3.5 stroke-[3]" />
            </button>
          </div>
          <span className="w-16 truncate text-center text-[11px] font-extrabold text-app-text dark:text-app-dark-text">Your story</span>
        </div>

        {otherGroups.map((group) => (
          <button
            key={group.author._id}
            type="button"
            onClick={() => onViewStory(group)}
            className="group flex shrink-0 flex-col items-center gap-1.5 focus:outline-none"
          >
            <div className={`rounded-full p-[2.5px] transition duration-300 group-hover:scale-105 ${group.hasUnviewed ? 'bg-story-ring shadow-active' : 'bg-slate-300 dark:bg-slate-700'}`}>
              <div className="rounded-full bg-white p-0.5 dark:bg-slate-900">
                <UserAvatar user={group.author} size="lg" className="!h-14 !w-14" disableLink />
              </div>
            </div>
            <span className="w-16 truncate text-center text-[11px] font-extrabold text-app-text dark:text-app-dark-text">{group.author.username}</span>
          </button>
        ))}
      </div>

      {showCreate && (
        <CreateStoryModal
          onClose={() => setShowCreate(false)}
          onCreated={async (story) => {
            await onCreated?.(story);
            setShowCreate(false);
          }}
        />
      )}
    </div>
  );
}

function CreateStoryModal({ onClose, onCreated }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  const handleFile = (event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setError('');
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const handleUpload = async () => {
    if (!file || uploading) return;

    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('media', file);
      const { data } = await api.post('/stories', formData);
      await onCreated(data.story);
    } catch (uploadError) {
      setError(uploadError.response?.data?.message || 'Could not share your story. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
      <div className="app-card w-full max-w-md p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-app-text dark:text-app-dark-text">Add to Story</h2>
            <p className="mt-1 text-[11px] text-app-muted dark:text-app-dark-muted">Photos and videos disappear after 24 hours.</p>
          </div>
          <button type="button" onClick={onClose} disabled={uploading} className="rounded-full p-1.5 text-app-muted hover:bg-[#F5E7E5] hover:text-app-primary disabled:cursor-not-allowed dark:hover:bg-slate-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600 dark:bg-red-950/30 dark:text-red-300">{error}</div>}

        {!preview ? (
          <label className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-app-border bg-[#FBEDEE] p-10 text-center transition hover:border-app-primary hover:bg-[#F5E7E5] dark:border-slate-700 dark:bg-slate-900/50">
            <input type="file" accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm" onChange={handleFile} className="hidden" />
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-app-primary shadow-md transition group-hover:scale-110 dark:bg-slate-800">
              <UploadCloud className="h-7 w-7" />
            </div>
            <p className="text-xs font-bold text-app-text dark:text-slate-300">Choose a photo or video</p>
            <p className="mt-1 text-[11px] text-app-muted">JPG, PNG, GIF, WebP, MP4, or WebM — up to 50 MB</p>
          </label>
        ) : (
          <div className="mb-5 overflow-hidden rounded-2xl bg-black">
            {file?.type.startsWith('video/') ? (
              <video src={preview} className="max-h-72 w-full object-cover" controls />
            ) : (
              <img src={preview} alt="Selected story preview" className="max-h-72 w-full object-cover" />
            )}
          </div>
        )}

        <div className="mt-4 flex justify-end gap-3">
          <button type="button" onClick={onClose} disabled={uploading} className="btn-secondary h-10 text-xs">Cancel</button>
          <button type="button" onClick={handleUpload} disabled={!file || uploading} className="btn-primary h-10 text-xs">
            {uploading ? 'Sharing...' : 'Share to Story'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function StoryViewer({ storyGroup, onClose, onNext, onPrev, onStoryView }) {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reply, setReply] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [sendingReply, setSendingReply] = useState(false);
  const [replyStatus, setReplyStatus] = useState('');
  const stories = storyGroup.stories || [];
  const story = stories[currentIndex] || stories[0];
  const isOwnStory = sameUser(storyGroup.author, user);

  useEffect(() => {
    setCurrentIndex(0);
    setVideoProgress(0);
    setReply('');
    setReplyStatus('');
    setIsLiked(false);
  }, [storyGroup.author?._id]);

  const handleNext = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((index) => index + 1);
    } else {
      onNext?.();
    }
  }, [currentIndex, onNext, stories.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((index) => index - 1);
    } else {
      onPrev?.();
    }
  }, [currentIndex, onPrev]);

  useEffect(() => {
    if (!story) return undefined;

    setVideoProgress(0);
    if (!isOwnStory) onStoryView?.(story);

    if (story.mediaType === 'video') return undefined;
    const timer = window.setTimeout(handleNext, IMAGE_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [handleNext, isOwnStory, onStoryView, story?._id, story?.mediaType]);

  const sendReply = async (text, isReaction = false) => {
    const message = text.trim();
    if (!message || sendingReply || isOwnStory) return;

    setSendingReply(true);
    setReplyStatus('');
    try {
      const { data: conversationData } = await api.post('/messages/conversations', { userId: storyGroup.author._id });
      await api.post(`/messages/conversations/${conversationData.conversation._id}/messages`, { text: message });
      setReply('');
      setReplyStatus(isReaction ? 'Reaction sent' : 'Reply sent');
      if (isReaction) setIsLiked(true);
    } catch (messageError) {
      setReplyStatus(messageError.response?.data?.message || 'Could not send your reply.');
    } finally {
      setSendingReply(false);
    }
  };

  if (!story) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 p-0 backdrop-blur-xl sm:p-4">
      <button type="button" onClick={onClose} aria-label="Close story" className="absolute right-4 top-4 z-30 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20">
        <X className="h-6 w-6" />
      </button>

      <div className="relative flex h-full w-full max-w-md flex-col justify-between overflow-hidden rounded-none border border-white/10 bg-black shadow-2xl sm:h-[88vh] sm:rounded-3xl">
        <div className="absolute left-3 right-3 top-3 z-20 flex gap-1.5">
          {stories.map((item, index) => {
            const isCurrent = index === currentIndex;
            const width = index < currentIndex ? '100%' : isCurrent && item.mediaType === 'video' ? `${videoProgress}%` : '0%';

            return (
              <div key={item._id} className="h-1 flex-1 overflow-hidden rounded-full bg-white/30">
                <div
                  key={isCurrent ? item._id : undefined}
                  className={`h-full bg-white ${isCurrent && item.mediaType !== 'video' ? 'animate-story-progress' : ''}`}
                  style={{ width }}
                />
              </div>
            );
          })}
        </div>

        <div className="absolute left-4 top-7 z-20 flex items-center gap-3">
          <UserAvatar user={storyGroup.author} size="sm" disableLink />
          <Link to={`/profile/${storyGroup.author.username}`} className="text-xs font-black text-white drop-shadow-md hover:underline" onClick={onClose}>
            {storyGroup.author.username}
          </Link>
        </div>

        <button type="button" onClick={handlePrev} className="absolute bottom-0 left-0 top-0 z-10 w-1/3 focus:outline-none" aria-label="Previous story" />
        <button type="button" onClick={handleNext} className="absolute bottom-0 right-0 top-0 z-10 w-1/3 focus:outline-none" aria-label="Next story" />

        <div className="flex h-full w-full items-center justify-center bg-black">
          {story.mediaType === 'video' ? (
            <video
              src={story.mediaUrl}
              autoPlay
              playsInline
              className="h-full w-full object-contain"
              onEnded={handleNext}
              onError={handleNext}
              onTimeUpdate={(event) => {
                const { currentTime, duration } = event.currentTarget;
                if (Number.isFinite(duration) && duration > 0) setVideoProgress(Math.min(100, (currentTime / duration) * 100));
              }}
            />
          ) : (
            <img src={story.mediaUrl} alt="Story content" className="h-full w-full object-contain" onError={handleNext} />
          )}
        </div>

        {!isOwnStory && (
          <div className="absolute bottom-4 left-4 right-4 z-20">
            {replyStatus && <p className="mb-2 text-center text-[11px] font-bold text-white drop-shadow">{replyStatus}</p>}
            <form
              className="flex items-center gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                sendReply(reply);
              }}
            >
              <input
                type="text"
                value={reply}
                onChange={(event) => setReply(event.target.value)}
                placeholder={`Reply to ${storyGroup.author.username}...`}
                maxLength={1000}
                className="h-11 flex-1 rounded-full border border-white/20 bg-white/15 px-4 text-xs font-medium text-white outline-none backdrop-blur-md placeholder:text-white/60 focus:border-white/50"
              />
              <button type="submit" disabled={!reply.trim() || sendingReply} className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50" aria-label="Send reply">
                <Send className="h-4 w-4" />
              </button>
              <button type="button" disabled={isLiked || sendingReply} onClick={() => sendReply('❤️', true)} className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50" aria-label="Send heart reaction">
                <Heart className={`h-5 w-5 ${isLiked ? 'fill-app-primary text-app-primary' : ''}`} />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
