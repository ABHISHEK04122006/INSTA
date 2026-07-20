import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Layout, { PageHeader } from '../components/Layout';

export default function CreatePost() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [caption, setCaption] = useState('');
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
        description="Upload photos or videos, add a caption, and share it with your followers."
      />
      <div className="app-card p-6">

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-600">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!previews.length ? (
            <label className="block cursor-pointer rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 p-12 text-center transition hover:border-insta-pink hover:bg-white">
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleFiles}
                className="hidden"
              />
              <svg className="mx-auto mb-3 h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="font-semibold text-slate-700">Drag photos and videos here</p>
              <p className="mt-2 text-sm font-bold text-insta-pink">Select from computer</p>
              <p className="mt-2 text-xs text-slate-400">Up to 10 files, 50 MB each</p>
            </label>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {previews.map((src, i) => (
                  <div key={src} className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100">
                    {files[i]?.type.startsWith('video/') ? (
                      <video src={src} controls className="h-full w-full object-cover" />
                    ) : (
                      <img src={src} alt={`Selected media ${i + 1}`} className="h-full w-full object-cover" />
                    )}
                    <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-1 text-xs font-bold text-white">
                      {files[i]?.type.startsWith('video/') ? 'Video' : 'Image'}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-sm font-medium text-slate-500">
                {files.length} {files.length === 1 ? 'file' : 'files'} selected
              </p>
            </div>
          )}

          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write a caption..."
            rows={3}
            className="field resize-none"
          />

          <div className="flex gap-2">
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
              {uploading ? 'Sharing...' : 'Share'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
