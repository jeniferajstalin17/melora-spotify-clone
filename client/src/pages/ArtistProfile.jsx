import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { PlayerContext } from '../context/PlayerContext';
import { Music2, Play, Pause, UserPlus, UserCheck } from 'lucide-react';

export default function ArtistProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const { user, token } = useContext(AuthContext);
  const { currentSong, isPlaying, playSong } = useContext(PlayerContext);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`https://melora-spotify-clone.onrender.com/api/users/${id}`);
      setProfile(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const checkFollowing = async () => {
    if (!token) return;
    try {
      const res = await axios.get('https://melora-spotify-clone.onrender.com/api/users/me/following', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsFollowing(res.data.some((u) => u._id === id));
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchProfile();
    checkFollowing();
  }, [id]);

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await axios.put(
          `https://melora-spotify-clone.onrender.com/api/users/${id}/unfollow`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsFollowing(false);
      } else {
        await axios.put(
          `https://melora-spotify-clone.onrender.com/api/users/${id}/follow`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsFollowing(true);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile) {
    return <div className="p-8 text-white">User not found</div>;
  }

  const isOwnProfile = user?.id === id;

  return (
    <div className="p-8 text-white">
      <div className="flex items-end gap-6 mb-8">
        <div className="w-40 h-40 bg-gradient-to-br from-purple-700 to-neutral-900 rounded-full flex items-center justify-center shadow-xl">
          <span className="text-5xl font-bold">{profile.username[0].toUpperCase()}</span>
        </div>
        <div>
          <p className="text-xs uppercase text-gray-400">Artist</p>
          <h1 className="text-4xl font-bold mt-1">{profile.username}</h1>
          <p className="text-gray-400 text-sm mt-2">
            {profile.songs.length} songs · {profile.followersCount} followers
          </p>

          {!isOwnProfile && (
            <button
              onClick={handleFollow}
              className={`mt-4 flex items-center gap-2 px-5 py-2 rounded-full font-semibold text-sm transition ${
                isFollowing
                  ? 'bg-neutral-800 text-white hover:bg-neutral-700'
                  : 'bg-green-500 text-black hover:bg-green-400'
              }`}
            >
              {isFollowing ? <UserCheck size={16} /> : <UserPlus size={16} />}
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          )}
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">Songs</h2>

      {profile.songs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <Music2 size={40} className="mb-3" />
          <p>No songs uploaded yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {profile.songs.map((song) => {
            const isCurrentSong = currentSong?._id === song._id;
            return (
              <div
                key={song._id}
                onClick={() => playSong(song)}
                className="group bg-neutral-900 hover:bg-neutral-800 rounded-lg p-4 transition-all duration-200 cursor-pointer"
              >
                <div className="relative mb-4">
                  {song.coverUrl ? (
                    <img
                      src={song.coverUrl}
                      alt={song.title}
                      className="w-full aspect-square object-cover rounded-md shadow-lg"
                    />
                  ) : (
                    <div className="w-full aspect-square bg-neutral-800 rounded-md flex items-center justify-center">
                      <Music2 size={40} className="text-gray-600" />
                    </div>
                  )}
                  <button className="absolute bottom-2 right-2 bg-green-500 hover:bg-green-400 hover:scale-105 rounded-full p-3 shadow-xl opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200">
                    {isCurrentSong && isPlaying ? (
                      <Pause size={18} fill="black" color="black" />
                    ) : (
                      <Play size={18} fill="black" color="black" />
                    )}
                  </button>
                </div>
                <h3 className="font-semibold text-sm truncate">{song.title}</h3>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}