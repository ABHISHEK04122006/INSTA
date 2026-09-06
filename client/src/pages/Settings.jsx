import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings as SettingsIcon, Upload, Check, Sun, Moon } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Layout, { PageHeader } from '../components/Layout';
import UserAvatar from '../components/UserAvatar';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(user?.avatar || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleAvatar = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatar(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const formData = new FormData();
      formData.append('fullName', fullName);
      formData.append('bio', bio);
      if (avatar) formData.append('avatar', avatar);

      const { data } = await api.put('/users/profile', formData);
      updateUser(data.user);
      setMessage('Profile updated successfully!');
      setTimeout(() => navigate(`/profile/${data.user.username}`), 1000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <PageHeader
        eyebrow="Account"
        title="Settings & Profile"
        description="Customize your public persona, avatar, bio, and display preferences."
      />
      <div className="space-y-6">
        {/* Theme Settings Card */}
        <div className="app-card p-6">
          <h2 className="mb-1 text-sm font-extrabold text-app-text dark:text-app-dark-text">
            Appearance & Theme
          </h2>
          <p className="mb-4 text-xs text-app-muted dark:text-app-dark-muted">
            Choose how Nexora looks on your device.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => theme === 'dark' && toggleTheme()}
              className={`flex items-center justify-between rounded-2xl border p-4 transition ${
                theme === 'light'
                  ? 'border-app-primary bg-pink-50/40 text-app-primary shadow-sm'
                  : 'border-app-border bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Sun className="h-5 w-5 text-amber-500" />
                <span className="text-xs font-bold">Light Mode</span>
              </div>
              {theme === 'light' && <Check className="h-4 w-4" />}
            </button>

            <button
              onClick={() => theme === 'light' && toggleTheme()}
              className={`flex items-center justify-between rounded-2xl border p-4 transition ${
                theme === 'dark'
                  ? 'border-app-primary bg-slate-900 text-app-primary shadow-sm'
                  : 'border-app-border bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Moon className="h-5 w-5 text-indigo-400" />
                <span className="text-xs font-bold">Dark Mode</span>
              </div>
              {theme === 'dark' && <Check className="h-4 w-4 text-app-primary" />}
            </button>
          </div>
        </div>

        {/* Profile Info Form Card */}
        <div className="app-card p-6 sm:p-8">
          <h2 className="mb-1 text-sm font-extrabold text-app-text dark:text-app-dark-text">
            Profile Information
          </h2>
          <p className="mb-6 text-xs text-app-muted dark:text-app-dark-muted">
            Update your photo and bio details.
          </p>

          {message && (
            <div
              className={`mb-5 rounded-2xl p-4 text-xs font-bold ${
                message.includes('successfully')
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400'
                  : 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400'
              }`}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-5">
            <div className="flex items-center gap-5 rounded-2xl border border-app-border bg-slate-50/50 p-4 dark:border-app-dark-border dark:bg-slate-900/50">
              <UserAvatar user={{ ...user, avatar: preview }} size="xl" disableLink />
              <div>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-primary-gradient px-4 py-2 text-xs font-bold text-white shadow-active transition hover:scale-105">
                  <Upload className="h-4 w-4" />
                  Change Profile Photo
                  <input type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
                </label>
                <p className="mt-1.5 text-[11px] text-slate-400">JPG, PNG, or GIF up to 10 MB</p>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="field text-xs"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                maxLength={150}
                className="field h-auto py-3 resize-none text-xs"
              />
              <p className="mt-1 text-right text-[10px] text-slate-400">{bio.length}/150</p>
            </div>

            <button type="submit" disabled={saving} className="btn-primary w-full">
              {saving ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
