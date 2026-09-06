import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Image as ImageIcon, Film, UploadCloud, X, Sparkles } from 'lucide-react';
import api from '../api';
import Layout, { PageHeader } from '../components/Layout';

export default function CreatePost() {
  const navigate = useNavigate();
  const location = useLocation();
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [caption, setCaption] = useState(() => location.state?.caption || '');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const maxFileSize = 50 * 1024 * 1024;
  const maxFiles = 10;

  useEffect(() => {
    return () => previews.forEach((src) => URL.revokeObjectURL(src));
  }, [previews]);

  const clearSelection = () => {
    previews.forEach((src) => URL.revokeObjectURL(src));
    setFiles([]);
    setPreviews([]);
  };

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files || []);
    e.target.value = '';

    if (!selected.length) return;

    if (selected.length > maxFiles) {
      setError(`You can upload up to ${maxFiles} files in one post.`);
      return;
    }

    const supported = selected.filter((file) => file.type.startsWith('image/') || file.type.startsWith('video/'));
    if (selected.length !== supported.length) {
      setError('Only image and video files are supported.');
      return;
    }

    const tooLarge = selected.find((file) => file.size > maxFileSize);
    if (tooLarge) {
      setError(`"${tooLarge.name}" is too large. Each file must be 50 MB or smaller.`);
      return;
    }

    clearSelection();
    setError('');
    setFiles(supported);
    setPreviews(supported.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!files.length) {
      setError('Please select at least one image or video');
      return;
    }

    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append('media', f));
      formData.append('caption', caption);
      await api.post('/posts', formData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Layout>
      <PageHeader
        eyebrow="Publish"
        title="Create new post"
        description="Upload photos or videos, add a caption, and share with your followers."
      />
      <div className="app-card p-6 sm:p-8">
        {error && (
          <div className="mb-4 rounded-2xl bg-red-50 p-4 text-xs font-semibold text-red-600 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {!previews.length ? (
            <label className="group flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-12 text-center transition duration-300 hover:border-app-primary hover:bg-pink-50/20 dark:border-slate-700 dark:bg-slate-900/50">
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleFiles}
                className="hidden"
              />
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-app-primary shadow-md transition duration-300 group-hover:scale-110 dark:bg-slate-800">
                <UploadCloud className="h-8 w-8" />
              </div>
              <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                Drag photos and videos here
              </p>
              <p className="mt-1.5 text-xs font-extrabold text-app-primary">
                Select from computer
              </p>
              <p className="mt-2 text-[11px] text-slate-400">
                Up to 10 files, 50 MB each
              </p>
            </label>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {previews.map((src, i) => (
                  <div
                    key={src}
                    className="relative aspect-square overflow-hidden rounded-2xl bg-slate-900 shadow-sm"
                  >
                    {files[i]?.type.startsWith('video/') ? (
                      <video src={src} controls className="h-full w-full object-cover" />
                    ) : (
                      <img
                        src={src}
                        alt={`Selected media ${i + 1}`}
                        className="h-full w-full object-cover"
                      />
                    )}
                    <span className="absolute left-2.5 top-2.5 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-extrabold text-white backdrop-blur-xs">
                      {files[i]?.type.startsWith('video/') ? 'Video' : 'Image'}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {files.length} {files.length === 1 ? 'file' : 'files'} selected
              </p>
            </div>
          )}

          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write a caption..."
            rows={3}
            className="field h-auto py-3 resize-none text-xs"
          />

          <div className="flex gap-3">
            {previews.length > 0 && (
              <button
                type="button"
                onClick={clearSelection}
                className="btn-secondary"
              >
                Clear
              </button>
            )}
            <button
              type="submit"
              disabled={uploading || !files.length}
              className="btn-primary flex-1"
            >
              {uploading ? 'Sharing...' : 'Share Post'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
