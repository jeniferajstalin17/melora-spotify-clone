import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { Home, Search, Library, PlusSquare, LogOut, Heart, Menu, X, User as UserIcon } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { PlayerContext } from '../context/PlayerContext';
import Logo from './Logo';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const { stopPlayback } = useContext(PlayerContext);
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    stopPlayback();
    logout();
    navigate('/login');
  };

  const handleLinkClick = () => setIsOpen(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-black flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2">
          <Logo size={26} />
          <h1 className="text-lg font-bold text-white">Melora</h1>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="text-white">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`h-screen w-64 bg-black text-white flex flex-col p-6 fixed left-0 top-0 z-50 transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        <div className="flex items-center gap-2 mb-8 hidden md:flex">
          <Logo size={30} />
          <h1 className="text-2xl font-bold">Melora</h1>
        </div>
        <div className="h-8 md:hidden"></div>

        <nav className="flex flex-col gap-4">
          <Link onClick={handleLinkClick} to="/" className={`flex items-center gap-3 hover:text-blue-500 transition ${isActive('/') ? 'text-white font-bold' : 'text-gray-400'}`}>
            <Home size={22} />
            Home
          </Link>
          <Link onClick={handleLinkClick} to="/search" className={`flex items-center gap-3 hover:text-blue-500 transition ${isActive('/search') ? 'text-white font-bold' : 'text-gray-400'}`}>
            <Search size={22} />
            Search
          </Link>
          <Link onClick={handleLinkClick} to="/liked" className={`flex items-center gap-3 hover:text-blue-500 transition ${isActive('/liked') ? 'text-white font-bold' : 'text-gray-400'}`}>
            <Heart size={22} />
            Liked Songs
          </Link>
          <Link onClick={handleLinkClick} to="/library" className={`flex items-center gap-3 hover:text-blue-500 transition ${isActive('/library') ? 'text-white font-bold' : 'text-gray-400'}`}>
            <Library size={22} />
            Your Library
          </Link>
        </nav>

        <div className="mt-8 border-t border-gray-800 pt-6">
          <Link onClick={handleLinkClick} to="/upload" className="flex items-center gap-3 text-gray-400 hover:text-blue-500 transition">
            <PlusSquare size={22} />
            Upload Song
          </Link>
        </div>

        <div className="mt-auto pt-6 border-t border-gray-800">
          {/* Profile section - now links to Edit Profile */}
          <Link
            onClick={handleLinkClick}
            to="/edit-profile"
            className="flex items-center gap-3 mb-3 hover:text-blue-500 transition group"
          >
            {user?.profilePic ? (
              <img
                src={user.profilePic}
                alt={user.username}
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center flex-shrink-0">
                <UserIcon size={16} className="text-gray-400" />
              </div>
            )}
            <p className="text-sm text-gray-400 truncate group-hover:text-blue-500">
              Hi, {user?.username}
            </p>
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-gray-400 hover:text-red-500 transition w-full"
          >
            <LogOut size={22} />
            Logout
          </button>
        </div>
      </div>
    </>
  );
}
