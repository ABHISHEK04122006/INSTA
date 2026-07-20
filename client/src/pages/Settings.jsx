import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import Layout, { PageHeader } from '../components/Layout';
import UserAvatar from '../components/UserAvatar';

export default function Settings() {
  const { user, updateUser } = useAuth();
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
      setMessage('Profile updated!');
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
        title="Edit Profile"
        description="Keep your public profile sharp and recognizable."
      />
      <div className="app-card p-6">

        {message && (
          <div className={`mb-4 rounded-xl p-3 text-sm font-medium ${message.includes('updated') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex items-center gap-4">
            <UserAvatar user={{ ...user, avatar: preview }} size="xl" />
            <label className="cursor-pointer text-sm font-bold text-insta-pink">
              Change profile photo
              <input type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
            </label>
          </div>

          <div>
            <label className="text-sm font-bold text-slate-600">Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="field mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-slate-600">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              maxLength={150}
              className="field mt-1 resize-none"
            />
            <p className="text-right text-xs text-slate-400">{bio.length}/150</p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary w-full"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </form>
      </div>
    </Layout>
  );
}
