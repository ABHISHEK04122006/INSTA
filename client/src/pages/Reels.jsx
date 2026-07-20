import { useEffect, useRef, useState } from 'react';
import api from '../api';
import Layout, { EmptyState, PageHeader } from '../components/Layout';
import ReelPlayer from '../components/ReelPlayer';

export default function Reels() {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showUpload, setShowUpload] = useState(false);
  const [error, setError] = useState('');
  const containerRef = useRef();

  const fetchReels = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/reels');
      setReels(data.reels || []);
    } catch (error) {
      console.error('Reels error:', error);
      setError(error.response?.data?.message || 'Reels could not be loaded right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReels();
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const itemHeight = container.clientHeight;
      const index = Math.round(scrollTop / itemHeight);
      setActiveIndex(Math.min(Math.max(index, 0), Math.max(reels.length - 1, 0)));
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [reels]);

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-insta-pink" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageHeader
        eyebrow="Watch"
        title="Reels"
        description="Swipe through short videos from the community."
        action={
          <button onClick={() => setShowUpload(true)} className="btn-primary">
            Upload Reel
          </button>
        }
      />

      {error ? (
        <EmptyState
          title="Reels unavailable"
          description={error}
          action={<button onClick={fetchReels} className="btn-primary">Try again</button>}
        />
      ) : reels.length === 0 ? (
        <EmptyState
          title="No reels yet"
          description="Upload the first short video and it will appear here."
          action={<button onClick={() => setShowUpload(true)} className="btn-primary">Create the first reel</button>}
        />
      ) : (
        <div className="mx-auto max-w-md">
          <div
            ref={containerRef}
            className="h-[calc(100vh-11rem)] min-h-[620px] overflow-y-scroll snap-y snap-mandatory scrollbar-hide rounded-[2rem] bg-black shadow-2xl shadow-slate-300"
          >
            {reels.map((reel, i) => (
              <div key={reel._id} className="h-full snap-start">
                <ReelPlayer reel={reel} isActive={i === activeIndex} />
              </div>
            ))}
          </div>
          <p className="mt-3 text-center text-xs font-medium text-slate-500">
            Reel {activeIndex + 1} of {reels.length}
          </p>
        </div>
      )}

      {showUpload && (
        <UploadReelModal
          onClose={() => setShowUpload(false)}
          onUploaded={(reel) => {
            setReels((prev) => [reel, ...prev]);
            setActiveIndex(0);
            setShowUpload(false);
          }}
        />
      )}
    </Layout>
  );
}

function UploadReelModal({ onClose, onUploaded }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFile = (event) => {
    const selected = event.target.files?.[0];
    if (!selected) return;

    if (!selected.type.startsWith('video/')) {
      setError('Please choose a video file.');
      return;
    }

    if (selected.size > 50 * 1024 * 1024) {
      setError('Video must be 50 MB or smaller.');
      return;
    }

    if (preview) URL.revokeObjectURL(preview);
    setError('');
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('video', file);
      formData.append('caption', caption);
      const { data } = await api.post('/reels', formData);
      onUploaded(data.reel);
    } catch (error) {
      console.error('Reel upload error:', error);
      setError(error.response?.data?.message || 'Reel upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="app-card w-full max-w-md p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-950">Upload Reel</h2>
            <p className="mt-1 text-sm text-slate-500">Choose a short video up to 50 MB.</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100">
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        {!preview ? (
          <label className="mb-4 block cursor-pointer rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 p-10 text-center transition hover:border-insta-pink hover:bg-white">
            <input
              type="file"
              accept="video/mp4,video/webm,video/*"
              onChange={handleFile}
              className="hidden"
            />
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
              ▶
            </div>
            <p className="font-semibold text-slate-700">Select a video</p>
            <p className="mt-1 text-xs text-slate-400">MP4 or WebM recommended</p>
          </label>
        ) : (
          <div className="mb-4 overflow-hidden rounded-3xl bg-black">
            <video src={preview} controls className="max-h-72 w-full object-contain" />
          </div>
        )}

        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Caption..."
          rows={2}
          maxLength={2200}
          className="field mb-2 resize-none"
        />
        <p className="mb-4 text-right text-xs text-slate-400">{caption.length}/2200</p>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} disabled={uploading} className="btn-secondary">Cancel</button>
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
