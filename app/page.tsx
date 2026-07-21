'use client';

import { useState, useRef, useEffect } from "react";
import AudioMotionAnalyzer from "audiomotion-analyzer";


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

export default function Home() {

  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [taps, setTaps] = useState<number[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const visualizerRef = useRef<HTMLDivElement>(null);
  const audioMotionRef = useRef<AudioMotionAnalyzer | null>(null);

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

  useEffect(() => {
    if (!audioUrl || !audioRef.current || !visualizerRef.current) return;
    if (audioMotionRef.current) return;

    audioMotionRef.current = new AudioMotionAnalyzer(visualizerRef.current, {
      source: audioRef.current,
      mode: 2,
      radial: true,
      radius: 0.5,
      gradient: 'prism',
      showScaleX: false,
      overlay: true,
      showBgColor: false,
      showPeaks: false
    });

    return () => {
      audioMotionRef.current?.destroy();
      audioMotionRef.current = null;
    };
    
  }, [audioUrl])


  const bpm = calculateBPM(taps);
  return ( 
    // TODO: Decide and Change background color later 
    <main className="w-full h-screen bg-cyan-700 flex flex-col justify-center items-center gap-8">
      <p className="text-white text-xl">Tap to the beat</p>

      <div className="relative w-[28rem] h-[28rem] flex items-center justify-center">
        <div ref={visualizerRef} className="absolute inset-0" />
        <div className="relative w-44 h-44 rounded-full bg-cyan-950/50 border-2 border-cyan-300 flex items-center justify-center pointer-events-none">
          <p className="text-white text-2xl font-bold">{bpm ? `${bpm} BPM` : '--'}</p>
        </div>
      </div>

      {audioUrl && <audio ref={audioRef} src={audioUrl} className="hidden" />}
      <input type="file" accept="audio/*" onChange={handleFileChange} />
    </main>
  );
}
