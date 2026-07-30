import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Camera, User as UserIcon } from 'lucide-react';

export default function EditProfile() {
  const { user, token, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Pre-fill the form with the latest profile data from the server
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('https://melora-spotify-clone.onrender.com/api/users/me/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsername(res.data.username || '');
        setBio(res.data.bio || '');
        setPreviewUrl(res.data.profilePic || '');
      } catch (err) {
        console.log(err);
      }
    };
    if (token) fetchProfile();
  }, [token]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // instant local preview
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('bio', bio);
      if (profilePicFile) {
        formData.append('profilePic', profilePicFile);
      }

      const res = await axios.put(
        'https://melora-spotify-clone.onrender.com/api/users/me',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Keep AuthContext (and localStorage) in sync so the new
      // username/pic shows up immediately across the app.
      updateUser({
        username: res.data.username,
        profilePic: res.data.profilePic,
        bio: res.data.bio,
      });

      setSuccess('Profile updated!');
      setTimeout(() => navigate('/'), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 text-white max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>

      {error && (
        <div className="bg-red-900/40 border border-red-700 text-red-300 text-sm rounded-lg px-4 py-2 mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-900/40 border border-green-700 text-green-300 text-sm rounded-lg px-4 py-2 mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Profile picture */}
        <div className="flex flex-col items-center gap-3">
          <label htmlFor="profilePicInput" className="cursor-pointer relative group">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Profile"
                className="w-28 h-28 rounded-full object-cover border-2 border-neutral-700"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-neutral-800 flex items-center justify-center border-2 border-neutral-700">
                <UserIcon size={40} className="text-gray-500" />
              </div>
            )}
            <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
              <Camera size={22} />
            </div>
          </label>
          <input
            id="profilePicInput"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <p className="text-xs text-gray-400">Click the picture to change it</p>
        </div>

        {/* Username */}
        <div>
          <label className="text-sm text-gray-400 mb-1 block">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-neutral-800 text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="text-sm text-gray-400 mb-1 block">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, 150))}
            rows={3}
            placeholder="Tell people a bit about yourself..."
            className="w-full bg-neutral-800 text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">{bio.length}/150</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-black font-semibold rounded-full py-2.5 transition"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
