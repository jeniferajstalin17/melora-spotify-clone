import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { PlayerContext } from '../context/PlayerContext';
import { Heart, Play, Pause, Music2 } from 'lucide-react';

export default function LikedSongs() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useContext(AuthContext);
  const { currentSong, isPlaying, playSong } = useContext(PlayerContext);

  const fetchLiked = async () => {
    setLoading(true);
    try {
      const res = await axios.get('https://melora-spotify-clone.onrender.com/api/songs/user/liked', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSongs(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiked();
  }, []);

  const handleUnlike = async (id, e) => {
    e.stopPropagation();
    try {
      await axios.put(`https://melora-spotify-clone.onrender.com/api/songs/${id}/unlike`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSongs(songs.filter((s) => s._id !== id));
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="p-8 text-white">
      <div className="flex items-end gap-6 mb-8">
        <div className="w-40 h-40 bg-gradient-to-br from-purple-700 to-blue-500 rounded-md flex items-center justify-center shadow-xl">
          <Heart size={56} fill="white" color="white" />
        </div>
        <div>
          <p className="text-xs uppercase text-gray-400">Playlist</p>
          <h1 className="text-4xl font-bold mt-1">Liked Songs</h1>
          <p className="text-gray-400 text-sm mt-2">{songs.length} songs</p>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {!loading && songs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <Heart size={40} className="mb-3" />
          <p>Songs you like will appear here</p>
        </div>
      )}

      {!loading && songs.length > 0 && (
        <div className="flex flex-col gap-2">
          {songs.map((song) => {
            const isCurrentSong = currentSong?._id === song._id;
            return (
              <div
                key={song._id}
                onClick={() => playSong(song)}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-800 transition group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="relative w-12 h-12 flex-shrink-0">
                    {song.coverUrl ? (
                      <img src={song.coverUrl} alt={song.title} className="w-12 h-12 rounded object-cover" />
                    ) : (
                      <div className="w-12 h-12 bg-neutral-800 rounded flex items-center justify-center">
                        <Music2 size={20} className="text-gray-600" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      {isCurrentSong && isPlaying ? (
                        <Pause size={16} fill="white" color="white" />
                      ) : (
                        <Play size={16} fill="white" color="white" />
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{song.title}</p>
                    <Link
                      to={`/artist/${song.uploadedBy}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs text-gray-400 hover:text-green-500 hover:underline"
                    >
                      {song.artist}
                    </Link>
                  </div>
                </div>

                <button
                  onClick={(e) => handleUnlike(song._id, e)}
                  className="opacity-0 group-hover:opacity-100 transition"
                  title="Remove from Liked Songs"
                >
                  <Heart size={18} fill="#1DB954" color="#1DB954" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}