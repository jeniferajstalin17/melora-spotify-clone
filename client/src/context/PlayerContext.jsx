import { createContext, useState, useRef, useEffect } from 'react';

export const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [queue, setQueue] = useState([]); // NEW: list of songs currently playing from
  const audioRef = useRef(new Audio());

  // playSong now optionally accepts the full song list it was played from,
  // so we know what "next" means.
  const playSong = (song, songList = []) => {
    if (currentSong?._id === song._id) {
      togglePlay();
      return;
    }
    audioRef.current.src = song.audioUrl;
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

  // stop playback completely (used on logout)
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

    // NEW: when song ends, auto-play the next song in the queue
    const handleEnd = () => {
      setIsPlaying(false);

      setCurrentSong((prevSong) => {
        setQueue((prevQueue) => {
          if (prevQueue.length === 0) return prevQueue;

          const currentIndex = prevQueue.findIndex((s) => s._id === prevSong?._id);
          const nextSong = prevQueue[currentIndex + 1];

          if (nextSong) {
            audio.src = nextSong.audioUrl;
            audio.play();
            setCurrentSong(nextSong);
            setIsPlaying(true);
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
  }, []);

  return (
    <PlayerContext.Provider
      value={{ currentSong, isPlaying, progress, duration, queue, playSong, togglePlay, seek, stopPlayback }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
