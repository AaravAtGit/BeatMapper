'use client';

import { useState, useRef, useEffect } from "react";

export default function Home() {

  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [taps, setTaps] = useState<number[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setAudioUrl(URL.createObjectURL(file));
    }
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.code !== 'Space') return;
      e.preventDefault;

      const audio = audioRef.current;
      if (!audio) return;

      if (audio.paused) {
        audio.play();
      } else {
        setTaps((prev) => [...prev, audio.currentTime]);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    // TODO: Decide and Change background color later 
    <main className="w-full h-screen bg-cyan-700 flex justify-center items-center ">
      <input type="file" accept="audio/*" onChange={handleFileChange} />
      {audioUrl && <audio ref={audioRef} src={audioUrl} className="hidden"></audio>}

      <p className="text-white text-4xl font-bold">Tap to the Beat!</p>
      <p className="text-white">Taps recorded: {taps.length}</p>
    </main>
  );
}
