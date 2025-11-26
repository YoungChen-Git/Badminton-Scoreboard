import React from 'react';

interface ScoreCardProps {
  name: string;
  score: number;
  setsWon: number;
  isServing: boolean;
  onScoreClick: () => void;
  isWinner?: boolean;
  side: 'left' | 'right'; 
  color: string; // New prop for background color
}

// Helper to determine text color based on background brightness
const getContrastColor = (hexcolor: string) => {
  // If no color provided, default to black text
  if (!hexcolor) return '#000000';
  
  // Convert hex to RGB
  const r = parseInt(hexcolor.substring(1, 3), 16);
  const g = parseInt(hexcolor.substring(3, 5), 16);
  const b = parseInt(hexcolor.substring(5, 7), 16);
  
  // Calculate YIQ ratio
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  
  // Return black or white text based on brightness
  return yiq >= 128 ? '#1f2937' : '#ffffff'; // gray-900 or white
};

// Helper to get a slightly transparent version of the text color for secondary text
const getSecondaryColor = (textColor: string) => {
  return textColor === '#ffffff' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(31, 41, 55, 0.6)';
};

export const ScoreCard: React.FC<ScoreCardProps> = ({ 
  name, 
  score, 
  setsWon, 
  isServing, 
  onScoreClick,
  isWinner,
  color
}) => {
  const textColor = getContrastColor(color);
  const secondaryColor = getSecondaryColor(textColor);
  const borderColor = isWinner ? '#34C759' : 'transparent'; // iOS Green if winner

  return (
    <div 
      className={`relative flex flex-col items-center justify-center flex-1 h-64 mx-2 rounded-3xl shadow-sm border-4 transition-all active:scale-95 touch-manipulation cursor-pointer`}
      style={{ 
        backgroundColor: color,
        borderColor: borderColor,
        color: textColor
      }}
      onClick={onScoreClick}
    >
      {/* Service Indicator */}
      {isServing && !isWinner && (
        <div className="absolute top-4 right-4 animate-bounce">
          <div className="w-4 h-4 rounded-full shadow-sm bg-orange-500 border-2 border-white"></div>
        </div>
      )}

      {/* Sets Won Indicators */}
      <div className="absolute top-4 left-4 flex gap-1">
        {[0, 1].map((i) => (
          <div 
            key={i} 
            className={`w-3 h-3 rounded-full border border-current`}
            style={{ 
              backgroundColor: i < setsWon ? 'currentColor' : 'transparent',
              opacity: i < setsWon ? 1 : 0.3
            }} 
          />
        ))}
      </div>

      <div className="mb-2 w-full px-4">
        <div 
          className="text-lg font-medium text-center break-words line-clamp-2 leading-tight"
          style={{ color: secondaryColor }}
        >
          {name}
        </div>
      </div>

      <div className={`text-8xl font-bold tracking-tighter`} style={{ color: isWinner ? '#34C759' : textColor }}>
        {score}
      </div>
      
      <div 
        className="mt-4 text-sm font-medium uppercase tracking-widest opacity-50"
      >
        點擊加分
      </div>
    </div>
  );
};