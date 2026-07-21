'use client';

import AudioMotionAnalyzer from "audiomotion-analyzer";
import confetti from 'canvas-confetti';
import { useEffect, useRef, useState } from "react";


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
  const [fileName, SetFileName] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setAudioUrl(URL.createObjectURL(file));
      SetFileName(file.name)
    }
  }

  function handleExport() {
    const data = { fileName, bpm, taps };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName ?? 'beatmap'}.json`;
    a.click();
    URL.revokeObjectURL(url);
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
        confetti({
          particleCount: 50,
          spread: 60,
          origin: {y: 0.6}
        });
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
    <main className="relative w-full h-screen bg-cyan-700 flex flex-col justify-center items-center gap-8">
      <p className="text-white text-xl">Tap(space) to the beat</p>

      <div className="relative w-[28rem] h-[28rem] flex items-center justify-center">
        <div ref={visualizerRef} className="absolute inset-0" />
        <div className="relative w-44 h-44 rounded-full bg-cyan-950/50 border-2 border-cyan-300 flex items-center justify-center pointer-events-none">
          <p className="text-white text-2xl font-bold">{bpm ? `${bpm} BPM` : '--'}</p>
        </div>
      </div>

      {audioUrl && <audio ref={audioRef} src={audioUrl} className="hidden" />}
      <div className="flex flex-col items-center gap-2">
        <label
          htmlFor="audio-upload"
          className="cursor-pointer bg-white text-cyan-700 font-semibold px-6 py-2 rounded-full hover:bg-cyan-100 transition"
        > Choose a track </label>
        <input
          id="audio-upload"
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          className="hidden"
        />
        {fileName && <p className="text-white text-sm">{fileName}</p>}
      </div>
      {taps.length > 0 && (
        <button
          onClick={handleExport}
          className="absolute top-6 left-6 bg-white text-cyan-700 font-semibold px-6 py-2 rounded-full hover:bg-cyan-100 transition"
        >
          Export JSON
        </button>
      )}
    </main>
  );
}
  
