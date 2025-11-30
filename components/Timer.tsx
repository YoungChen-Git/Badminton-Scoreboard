import React, { useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

interface TimerProps {
  seconds: number;
  isRunning: boolean;
  onToggle: () => void;
  onReset: () => void;
  setSeconds: React.Dispatch<React.SetStateAction<number>>;
  compact?: boolean;
}

export const Timer: React.FC<TimerProps> = ({ seconds, isRunning, onToggle, setSeconds, compact }) => {
  
  useEffect(() => {
    let interval: number | undefined;
    if (isRunning) {
      interval = window.setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning, setSeconds]);

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <button 
      onClick={onToggle}
      className={`
        flex flex-col items-center justify-center transition-opacity hover:opacity-80
        ${compact ? 'gap-1' : 'gap-2'}
      `}
    >
      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider hidden landscape:block">
        Match Time
      </div>
      <div className={`font-mono font-bold tabular-nums leading-none ${compact ? 'text-2xl landscape:text-xl' : 'text-4xl'}`}>
        {formatTime(seconds)}
      </div>
      <div className={`${isRunning ? 'text-green-400' : 'text-gray-500'}`}>
        {isRunning ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
      </div>
    </button>
  );
};