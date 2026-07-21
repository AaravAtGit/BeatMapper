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


  function calculateBPM(taps: number[]): number | null {
    if (taps.length < 2) return null;

    const recentTaps = taps.slice(-8);
    const intervals: number[] = [];

    for (let i = 1; i < recentTaps.length; i++) {
      intervals.push(recentTaps[i] - recentTaps[i - 1]);
    }

    const avgInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;

    return Math.round(60 / avgInterval);
    
  }

  const bpm = calculateBPM(taps);
  return ( 
    // TODO: Decide and Change background color later 
    <main className="w-full h-screen bg-cyan-700 flex justify-center items-center ">
      <input type="file" accept="audio/*" onChange={handleFileChange} />
      {audioUrl && <audio ref={audioRef} src={audioUrl} className="hidden"></audio>}

      <p className="text-white text-4xl font-bold">{bpm ? `${bpm} BPM`: "Tap to the Beat!"}</p>
    </main>
  );
}
