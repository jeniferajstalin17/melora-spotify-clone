import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { PlayerContext } from '../context/PlayerContext';
import { ListMusic, Plus, X, Play, Pause } from 'lucide-react';

export default function PlaylistDetail() {
  const { id } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [allSongs, setAllSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const { token } = useContext(AuthContext);
  const { currentSong, isPlaying, playSong } = useContext(PlayerContext);

  const fetchPlaylist = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`https://melora-spotify-clone.onrender.com/api/playlists/${id}`);
      setPlaylist(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllSongs = async () => {
    try {
      const res = await axios.get('https://melora-spotify-clone.onrender.com/api/songs');
      setAllSongs(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchPlaylist();
    fetchAllSongs();
  }, [id]);

  const handleAddSong = async (songId) => {
    try {
      await axios.put(
        `https://melora-spotify-clone.onrender.com/api/playlists/${id}/add-song`,
        { songId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPlaylist();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not add song');
    }
  };

  const handleRemoveSong = async (songId, e) => {
    e.stopPropagation();
    try {
      await axios.put(
        `https://melora-spotify-clone.onrender.com/api/playlists/${id}/remove-song`,
        { songId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPlaylist();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not remove song');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!playlist) {
    return <div className="p-8 text-white">Playlist not found</div>;
  }

  const songsInPlaylist = playlist.songs.map((s) => s._id);
  const availableSongs = allSongs.filter((s) => !songsInPlaylist.includes(s._id));

  return (
    <div className="p-8 text-white">
      <div className="flex items-end gap-6 mb-8">
        <div className="w-40 h-40 bg-gradient-to-br from-green-700 to-neutral-900 rounded-md flex items-center justify-center shadow-xl">
          <ListMusic size={56} className="text-white/70" />
        </div>
        <div>
          <p className="text-xs uppercase text-gray-400">Playlist</p>
          <h1 className="text-4xl font-bold mt-1">{playlist.name}</h1>
          <p className="text-gray-400 text-sm mt-2">{playlist.songs.length} songs</p>
        </div>
      </div>

      <button
        onClick={() => setShowAdd(!showAdd)}
        className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-semibold px-4 py-2 rounded-full transition mb-6"
      >
        <Plus size={18} />
        Add Songs
      </button>

      {showAdd && (
        <div className="mb-8 bg-neutral-900 rounded-lg p-4 max-w-2xl">
          <h3 className="font-semibold mb-3">Available Songs</h3>
          {availableSongs.length === 0 ? (
            <p className="text-gray-500 text-sm">No more songs to add</p>
          ) : (
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
              {availableSongs.map((song) => (
                <div key={song._id} className="flex items-center justify-between p-2 hover:bg-neutral-800 rounded">
                  <div>
                    <p className="text-sm font-medium">{song.title}</p>
                    <p className="text-xs text-gray-400">{song.artist}</p>
                  </div>
                  <button
                    onClick={() => handleAddSong(song._id)}
                    className="text-green-500 hover:text-green-400 text-sm font-semibold"
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {playlist.songs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <ListMusic size={40} className="mb-3" />
          <p>This playlist is empty</p>
          <p className="text-sm">Add some songs to get started</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {playlist.songs.map((song) => {
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
                        <ListMusic size={20} className="text-gray-600" />
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
                    <p className="text-xs text-gray-400">{song.artist}</p>
                  </div>
                </div>

                <button
                  onClick={(e) => handleRemoveSong(song._id, e)}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition"
                  title="Remove from playlist"
                >
                  <X size={18} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}