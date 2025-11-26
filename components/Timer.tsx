import React, { useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface TimerProps {
  seconds: number;
  isRunning: boolean;
  onToggle: () => void;
  onReset: () => void;
  setSeconds: React.Dispatch<React.SetStateAction<number>>;
}

export const Timer: React.FC<TimerProps> = ({ seconds, isRunning, onToggle, onReset, setSeconds }) => {
  
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
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center py-2">
      <div className="text-4xl font-variant-numeric tabular-nums font-light text-gray-800 tracking-tight">
        {formatTime(seconds)}
      </div>
      <div className="flex gap-6 mt-2">
        <button 
          onClick={onToggle}
          className={`p-2 rounded-full transition-colors ${isRunning ? 'text-ios-blue bg-blue-50' : 'text-ios-green bg-green-50'}`}
        >
          {isRunning ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
        </button>
        {!isRunning && seconds > 0 && (
           <button 
           onClick={onReset}
           className="p-2 rounded-full text-ios-gray bg-gray-100 transition-colors"
         >
           <RotateCcw size={24} />
         </button>
        )}
      </div>
    </div>
  );
};