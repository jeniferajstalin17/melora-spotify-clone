import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { PlayerContext } from '../context/PlayerContext';
import { Trash2, Play, Pause, Music2, Heart } from 'lucide-react';

export default function Home() {
  const [songs, setSongs] = useState([]);
  const [likedIds, setLikedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, token } = useContext(AuthContext);
  const { currentSong, isPlaying, playSong } = useContext(PlayerContext);

  const fetchSongs = async () => {
    setLoading(true);
    try {
      const res = await axios.get('https://melora-spotify-clone.onrender.com/api/songs');
      setSongs(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLiked = async () => {
    if (!token) return;
    try {
      const res = await axios.get('https://melora-spotify-clone.onrender.com/api/songs/user/liked', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLikedIds(res.data.map((s) => s._id));
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchSongs();
    fetchLiked();
  }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this song?')) return;
    try {
      await axios.delete(`https://melora-spotify-clone.onrender.com/api/songs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSongs(songs.filter((s) => s._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleLike = async (id, e) => {
    e.stopPropagation();
    const isLiked = likedIds.includes(id);
    try {
      if (isLiked) {
        await axios.put(`https://melora-spotify-clone.onrender.com/api/songs/${id}/unlike`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLikedIds(likedIds.filter((likedId) => likedId !== id));
      } else {
        await axios.put(`https://melora-spotify-clone.onrender.com/api/songs/${id}/like`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLikedIds([...likedIds, id]);
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="p-8 text-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Good evening, {user?.username}</h1>
        <p className="text-gray-400 mt-1">Here's what's playing</p>
      </div>

      <h2 className="text-2xl font-bold mb-5">All Songs</h2>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {!loading && songs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <Music2 size={48} className="mb-4" />
          <p className="text-lg">No songs yet</p>
          <p className="text-sm">Upload your first song to get started</p>
        </div>
      )}

      {!loading && songs.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {songs.map((song) => {
            const isCurrentSong = currentSong?._id === song._id;
            const isLiked = likedIds.includes(song._id);
            return (
              <div
                key={song._id}
                className="group bg-neutral-900 hover:bg-neutral-800 rounded-lg p-4 transition-all duration-200 relative"
              >
                {song.uploadedBy === user?.id && (
                  <button
                    onClick={(e) => handleDelete(song._id, e)}
                    className="absolute top-6 right-6 z-10 bg-black/70 hover:bg-red-600 rounded-full p-2 opacity-0 group-hover:opacity-100 transition"
                    title="Delete song"
                  >
                    <Trash2 size={14} color="white" />
                  </button>
                )}

                <div onClick={() => playSong(song)} className="relative mb-4 cursor-pointer">
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

                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm truncate">{song.title}</h3>
                    <Link
                      to={`/artist/${song.uploadedBy}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-gray-400 text-xs mt-1 truncate hover:text-green-500 hover:underline block"
                    >
                      {song.artist}
                    </Link>
                  </div>
                  <button onClick={(e) => handleLike(song._id, e)} className="flex-shrink-0 ml-2">
                    <Heart
                      size={18}
                      fill={isLiked ? '#1DB954' : 'none'}
                      color={isLiked ? '#1DB954' : '#9ca3af'}
                      className="hover:scale-110 transition"
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}