import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Plus, ListMusic } from 'lucide-react';

export default function Library() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);
  const { token } = useContext(AuthContext);

  const fetchPlaylists = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/playlists/mine', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlaylists(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    try {
      await axios.post(
        'http://localhost:5000/api/playlists',
        { name },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setName('');
      setShowForm(false);
      fetchPlaylists();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not create playlist');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-8 text-white">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Your Library</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-semibold px-4 py-2 rounded-full transition"
        >
          <Plus size={18} />
          New Playlist
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mb-8 flex gap-3 max-w-md">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Playlist name"
            autoFocus
            className="flex-1 px-4 py-2 rounded-full bg-neutral-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            type="submit"
            disabled={creating}
            className="bg-green-500 hover:bg-green-400 text-black font-semibold px-5 py-2 rounded-full transition disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Create'}
          </button>
        </form>
      )}

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {!loading && playlists.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <ListMusic size={48} className="mb-4" />
          <p className="text-lg">No playlists yet</p>
          <p className="text-sm">Create your first playlist to organize your songs</p>
        </div>
      )}

      {!loading && playlists.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {playlists.map((playlist) => (
            <Link
              to={`/playlist/${playlist._id}`}
              key={playlist._id}
              className="group bg-neutral-900 hover:bg-neutral-800 rounded-lg p-4 transition-all duration-200"
            >
              <div className="w-full aspect-square bg-gradient-to-br from-green-700 to-neutral-900 rounded-md flex items-center justify-center mb-4">
                <ListMusic size={40} className="text-white/70" />
              </div>
              <h3 className="font-semibold text-sm truncate">{playlist.name}</h3>
              <p className="text-gray-400 text-xs mt-1">{playlist.songs.length} songs</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}