import { useContext } from 'react';
import { PlayerContext } from '../context/PlayerContext';
import { Play, Pause, Music2, SkipBack, SkipForward, Shuffle, Repeat, Repeat1 } from 'lucide-react';

export default function PlayerBar() {
  const {
    currentSong,
    isPlaying,
    progress,
    duration,
    isShuffle,
    repeatMode,
    togglePlay,
    seek,
    playPrevious,
    playNext,
    toggleShuffle,
    cycleRepeatMode,
  } = useContext(PlayerContext);

  if (!currentSong) return null;

  const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e) => {
    const newTime = (e.target.value / 100) * duration;
    seek(newTime);
  };

  const progressPercent = duration ? (progress / duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 md:left-64 right-0 bg-neutral-900 border-t border-neutral-800 px-4 md:px-6 py-3 flex items-center gap-4 z-40">
      <div className="flex items-center gap-3 w-40 md:w-64 flex-shrink-0">
        {currentSong.coverUrl ? (
          <img src={currentSong.coverUrl} alt={currentSong.title} className="w-12 h-12 rounded object-cover" />
        ) : (
          <div className="w-12 h-12 bg-neutral-800 rounded flex items-center justify-center">
            <Music2 size={18} className="text-gray-600" />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-medium text-white truncate">{currentSong.title}</p>
          <p className="text-xs text-gray-400 truncate hidden sm:block">{currentSong.artist}</p>
        </div>
      </div>

      <div className="flex-1 flex items-center gap-3">
        {/* Shuffle */}
        <button
          onClick={toggleShuffle}
          className={`hidden sm:block transition ${isShuffle ? 'text-green-500' : 'text-gray-400 hover:text-white'}`}
          title="Shuffle"
        >
          <Shuffle size={16} />
        </button>

        {/* Previous */}
        <button
          onClick={playPrevious}
          className="text-gray-300 hover:text-white transition flex-shrink-0"
          title="Previous"
        >
          <SkipBack size={18} fill="currentColor" />
        </button>

        {/* Play / Pause */}
        <button
          onClick={togglePlay}
          className="bg-white hover:scale-105 rounded-full p-2 transition flex-shrink-0"
        >
          {isPlaying ? <Pause size={18} fill="black" color="black" /> : <Play size={18} fill="black" color="black" />}
        </button>

        {/* Next */}
        <button
          onClick={playNext}
          className="text-gray-300 hover:text-white transition flex-shrink-0"
          title="Next"
        >
          <SkipForward size={18} fill="currentColor" />
        </button>

        {/* Repeat: off -> all -> one */}
        <button
          onClick={cycleRepeatMode}
          className={`hidden sm:block transition ${repeatMode !== 'off' ? 'text-green-500' : 'text-gray-400 hover:text-white'}`}
          title={`Repeat: ${repeatMode}`}
        >
          {repeatMode === 'one' ? <Repeat1 size={16} /> : <Repeat size={16} />}
        </button>

        <span className="text-xs text-gray-400 w-10 text-right hidden sm:block">{formatTime(progress)}</span>

        <input
          type="range"
          min="0"
          max="100"
          value={progressPercent || 0}
          onChange={handleSeek}
          className="flex-1 h-1 accent-green-500 cursor-pointer"
        />

        <span className="text-xs text-gray-400 w-10 hidden sm:block">{formatTime(duration)}</span>
      </div>

      <div className="w-64 hidden md:block"></div>
    </div>
  );
}
