import { createContext, useState, useRef, useEffect } from 'react';

export const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [queue, setQueue] = useState([]);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off'); // 'off' | 'all' | 'one'
  const [volume, setVolumeState] = useState(1); // NEW: 0 to 1
  const [previousVolume, setPreviousVolume] = useState(1); // NEW: for mute/unmute toggle
  const audioRef = useRef(new Audio());

  const playSong = (song, songList = []) => {
    if (currentSong?._id === song._id) {
      togglePlay();
      return;
    }
    audioRef.current.src = song.audioUrl;
    audioRef.current.volume = volume;
    audioRef.current.play();
    setCurrentSong(song);
    setIsPlaying(true);

    if (songList.length > 0) {
      setQueue(songList);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const seek = (time) => {
    audioRef.current.currentTime = time;
    setProgress(time);
  };

  // NEW: set volume (0 to 1) and keep the <audio> element in sync
  const setVolume = (value) => {
    const clamped = Math.min(1, Math.max(0, value));
    audioRef.current.volume = clamped;
    setVolumeState(clamped);
  };

  // NEW: mute/unmute toggle button
  const toggleMute = () => {
    if (volume > 0) {
      setPreviousVolume(volume);
      setVolume(0);
    } else {
      setVolume(previousVolume || 1);
    }
  };

  const playPrevious = () => {
    if (queue.length === 0 || !currentSong) return;
    const currentIndex = queue.findIndex((s) => s._id === currentSong._id);
    const prevSong = queue[currentIndex - 1];
    if (prevSong) {
      audioRef.current.src = prevSong.audioUrl;
      audioRef.current.play();
      setCurrentSong(prevSong);
      setIsPlaying(true);
    }
  };

  const playNext = () => {
    if (queue.length === 0 || !currentSong) return;
    const currentIndex = queue.findIndex((s) => s._id === currentSong._id);

    let nextSong;
    if (isShuffle) {
      const otherSongs = queue.filter((_, idx) => idx !== currentIndex);
      if (otherSongs.length > 0) {
        nextSong = otherSongs[Math.floor(Math.random() * otherSongs.length)];
      }
    } else {
      nextSong = queue[currentIndex + 1] || (repeatMode === 'all' ? queue[0] : null);
    }

    if (nextSong) {
      audioRef.current.src = nextSong.audioUrl;
      audioRef.current.play();
      setCurrentSong(nextSong);
      setIsPlaying(true);
    }
  };

  const toggleShuffle = () => setIsShuffle((prev) => !prev);

  const cycleRepeatMode = () => {
    setRepeatMode((prev) => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  };

  const stopPlayback = () => {
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    audioRef.current.src = '';

    setCurrentSong(null);
    setIsPlaying(false);
    setProgress(0);
    setDuration(0);
    setQueue([]);
  };

  useEffect(() => {
    const audio = audioRef.current;
    const updateProgress = () => setProgress(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    const handleEnd = () => {
      setCurrentSong((prevSong) => {
        setQueue((prevQueue) => {
          if (prevQueue.length === 0) {
            setIsPlaying(false);
            return prevQueue;
          }

          if (repeatMode === 'one') {
            audio.currentTime = 0;
            audio.play();
            setIsPlaying(true);
            return prevQueue;
          }

          const currentIndex = prevQueue.findIndex((s) => s._id === prevSong?._id);
          let nextSong;

          if (isShuffle) {
            const otherSongs = prevQueue.filter((_, idx) => idx !== currentIndex);
            if (otherSongs.length > 0) {
              nextSong = otherSongs[Math.floor(Math.random() * otherSongs.length)];
            }
          } else {
            nextSong = prevQueue[currentIndex + 1];
            if (!nextSong && repeatMode === 'all') {
              nextSong = prevQueue[0];
            }
          }

          if (nextSong) {
            audio.src = nextSong.audioUrl;
            audio.play();
            setCurrentSong(nextSong);
            setIsPlaying(true);
          } else {
            setIsPlaying(false);
          }

          return prevQueue;
        });
        return prevSong;
      });
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnd);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnd);
    };
  }, [isShuffle, repeatMode]);

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        progress,
        duration,
        queue,
        isShuffle,
        repeatMode,
        volume, // NEW
        playSong,
        togglePlay,
        seek,
        stopPlayback,
        playPrevious,
        playNext,
        toggleShuffle,
        cycleRepeatMode,
        setVolume, // NEW
        toggleMute, // NEW
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
