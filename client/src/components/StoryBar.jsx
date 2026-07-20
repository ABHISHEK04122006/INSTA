import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import UserAvatar from './UserAvatar';

export default function StoryBar({ storyGroups, onViewStory, onCreateStory }) {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="mb-6 h-[110px] rounded-[20px] border border-app-border bg-white px-5 py-4 shadow-card">
      <div className="flex h-full items-center gap-5 overflow-x-auto scrollbar-hide">
        <button onClick={() => setShowCreate(true)} className="flex flex-col items-center gap-1 flex-shrink-0">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-gradient text-white shadow-active transition hover:scale-105">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="text-xs font-bold text-app-muted">Add story</span>
        </button>

        {storyGroups?.map((group) => (
          <button
            key={group.author._id}
            onClick={() => onViewStory(group)}
            className="flex flex-col items-center gap-1 flex-shrink-0"
          >
            <div
              className={`p-0.5 rounded-full ${
                group.hasUnviewed
                  ? 'bg-gradient-to-tr from-insta-yellow via-insta-pink to-insta-purple'
                  : 'bg-slate-300'
              }`}
            >
              <div className="bg-white p-0.5 rounded-full">
                <UserAvatar user={group.author} size="lg" className="!w-14 !h-14" />
              </div>
            </div>
            <span className="w-16 truncate text-center text-xs font-bold text-app-muted">
              {group.author.username}
            </span>
          </button>
        ))}
      </div>

      {showCreate && (
        <CreateStoryModal onClose={() => setShowCreate(false)} onCreated={() => setShowCreate(false)} />
      )}
    </div>
  );
}

function CreateStoryModal({ onClose, onCreated }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('media', file);
      await api.post('/stories', formData);
      onCreated();
      onClose();
    } catch (error) {
      console.error('Story upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="app-card w-full max-w-md p-6">
        <h2 className="mb-4 text-lg font-bold">Create Story</h2>
        {!preview ? (
          <label className="block cursor-pointer rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center transition hover:border-insta-pink">
            <input type="file" accept="image/*,video/*" onChange={handleFile} className="hidden" />
            <p className="text-sm font-semibold text-slate-600">Click to select photo or video</p>
          </label>
        ) : (
          <div className="mb-4">
            {file?.type.startsWith('video/') ? (
              <video src={preview} className="w-full rounded-lg max-h-64 object-cover" />
            ) : (
              <img src={preview} alt="" className="w-full rounded-lg max-h-64 object-cover" />
            )}
          </div>
        )}
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="btn-primary"
          >
            {uploading ? 'Uploading...' : 'Share'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function StoryViewer({ storyGroup, onClose, onNext, onPrev }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const story = storyGroup.stories[currentIndex];

  const handleNext = () => {
    if (currentIndex < storyGroup.stories.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      onNext?.();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    } else {
      onPrev?.();
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <button onClick={onClose} className="absolute top-4 right-4 text-white z-10">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
        <UserAvatar user={storyGroup.author} />
        <Link to={`/profile/${storyGroup.author.username}`} className="text-white font-semibold text-sm">
          {storyGroup.author.username}
        </Link>
      </div>

      <div className="absolute top-2 left-2 right-2 flex gap-1 z-10">
        {storyGroup.stories.map((_, i) => (
          <div key={i} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
            <div
              className={`h-full bg-white transition-all duration-300 ${
                i < currentIndex ? 'w-full' : i === currentIndex ? 'w-full' : 'w-0'
              }`}
            />
          </div>
        ))}
      </div>

      <button onClick={handlePrev} className="absolute left-0 top-0 bottom-0 w-1/3 z-10" />
      <button onClick={handleNext} className="absolute right-0 top-0 bottom-0 w-1/3 z-10" />

      <div className="max-w-md w-full max-h-[80vh]">
        {story.mediaType === 'video' ? (
          <video src={story.mediaUrl} autoPlay className="w-full h-full object-contain" />
        ) : (
          <img src={story.mediaUrl} alt="" className="w-full h-full object-contain" />
        )}
      </div>
    </div>
  );
}
