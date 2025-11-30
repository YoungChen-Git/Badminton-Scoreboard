import React, { useRef } from 'react';
import { Minus, ChevronDown } from 'lucide-react';

interface ScoreCardProps {
  name: string;
  score: number;
  setsWon: number;
  isServing: boolean;
  onScoreClick: () => void;
  onScoreDecrement: () => void;
  isWinner?: boolean;
  side: 'left' | 'right'; 
  color: string;
}

const getContrastColor = (hexcolor: string) => {
  if (!hexcolor) return '#000000';
  const r = parseInt(hexcolor.substring(1, 3), 16);
  const g = parseInt(hexcolor.substring(3, 5), 16);
  const b = parseInt(hexcolor.substring(5, 7), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return yiq >= 128 ? '#111827' : '#ffffff';
};

export const ScoreCard: React.FC<ScoreCardProps> = ({ 
  name, 
  score, 
  setsWon, 
  isServing, 
  onScoreClick,
  onScoreDecrement,
  isWinner,
  color
}) => {
  const textColor = getContrastColor(color);
  const touchStartY = useRef<number | null>(null);
  const blockClick = useRef(false);
  const [showMinusHint, setShowMinusHint] = React.useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const touchEndY = e.changedTouches[0].clientY;
    const diffY = touchEndY - touchStartY.current;

    // Threshold for swipe down (50px)
    if (diffY > 50) {
      blockClick.current = true; // Prevent the click event from firing
      onScoreDecrement();
      setShowMinusHint(true);
      setTimeout(() => setShowMinusHint(false), 500);
      
      // Reset block click after a short delay
      setTimeout(() => { blockClick.current = false; }, 300);
    }
    touchStartY.current = null;
  };

  const handleClick = () => {
    if (blockClick.current) return;
    onScoreClick();
  };
  
  return (
    <div 
      className="w-full h-full flex flex-col items-center justify-center relative touch-none active:brightness-90 transition-all cursor-pointer select-none overflow-hidden group"
      style={{ 
        backgroundColor: color,
        color: textColor
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={handleClick}
    >
      {/* Visual Feedback for Decrement */}
      {showMinusHint && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/10 animate-pulse">
           <Minus size={100} className="opacity-50" />
        </div>
      )}

      {/* Service Indicator - Shuttlecock Icon */}
      {isServing && !isWinner && (
        <div className="absolute top-4 right-4 landscape:top-6 landscape:right-6 animate-bounce duration-[1500ms] z-10">
           <div 
             className="w-10 h-10 landscape:w-12 landscape:h-12 drop-shadow-md"
             style={{ color: textColor }} 
            >
             <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
               <path d="M12 14L12 21" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
               <path d="M12 14C12 14 15.5 12 15.5 9C15.5 6 14.5 2 12 2C9.5 2 8.5 6 8.5 9C8.5 12 12 14 12 14Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
               <path d="M8.5 9H15.5" stroke="currentColor" strokeWidth="1.5" />
             </svg>
           </div>
        </div>
      )}

      {/* Team Name */}
      <div className="absolute top-6 left-6 right-16 text-left z-0">
        <h2 className="text-xl landscape:text-2xl font-black uppercase tracking-wider opacity-90 truncate leading-none">
          {name}
        </h2>
        
        {/* Sets Won Dots */}
        <div className="flex gap-2 mt-2">
          {[0, 1].map((i) => (
            <div 
              key={i} 
              className={`w-3 h-3 rounded-full border-2 border-current transition-all duration-300 ${i < setsWon ? 'bg-current opacity-100' : 'bg-transparent opacity-30'}`}
            />
          ))}
        </div>
      </div>

      {/* Main Score - Massive */}
      <div className="flex-1 flex items-center justify-center w-full relative mt-8 landscape:mt-0">
        <span className="text-[42vw] landscape:text-[28vh] font-bold tabular-nums tracking-tighter leading-none drop-shadow-sm select-none">
          {score}
        </span>
      </div>

      {/* Tap Instruction */}
      <div className="absolute bottom-6 w-full flex flex-col items-center justify-center opacity-30 pointer-events-none transition-opacity group-hover:opacity-60">
        <div className="text-xs font-bold uppercase tracking-[0.2em] mb-1">
          點擊加分
        </div>
        <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider opacity-80">
          <ChevronDown size={14} />
          <span>下滑扣分</span>
        </div>
      </div>
    </div>
  );
};