import { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { PlayerContext } from '../context/PlayerContext';
import { Search as SearchIcon, Trash2, Play, Pause, Music2 } from 'lucide-react';

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const { user, token } = useContext(AuthContext);
  const { currentSong, isPlaying, playSong } = useContext(PlayerContext);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/songs/search?q=${encodeURIComponent(query)}`);
      setResults(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this song?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/songs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResults(results.filter((s) => s._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="p-8 text-white">
      <h1 className="text-3xl font-bold mb-6">Search</h1>

      <form onSubmit={handleSearch} className="max-w-xl mb-8">
        <div className="relative">
          <SearchIcon size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by song title or artist..."
            className="w-full pl-12 pr-4 py-3 rounded-full bg-neutral-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </form>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <Music2 size={40} className="mb-3" />
          <p>No results found for "{query}"</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {results.map((song) => {
            const isCurrentSong = currentSong?._id === song._id;
            return (
              <div
                key={song._id}
                onClick={() => playSong(song)}
                className="group bg-neutral-900 hover:bg-neutral-800 rounded-lg p-4 transition-all duration-200 relative cursor-pointer"
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
                <p className="text-gray-400 text-xs mt-1 truncate">{song.artist}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}