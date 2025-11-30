import React, { useState, useEffect } from 'react';
import { Timer } from './components/Timer';
import { ScoreCard } from './components/ScoreCard';
import { RotateCcw, ArrowLeftRight, Settings, History, Crown, X, Palette, Check } from 'lucide-react';
import { GameState, PlayerSide, PlayerConfig, SetScore } from './types';

// Constants
const WIN_BY = 2;

const INITIAL_STATE: GameState = {
  scoreA: 0,
  scoreB: 0,
  setsA: 0,
  setsB: 0,
  currentSet: 1,
  previousSets: [],
  servingSide: 'A',
  matchWinner: null,
  history: []
};

// Professional Default colors (High contrast)
const DEFAULT_COLOR_A = '#3b82f6'; // Blue-500
const DEFAULT_COLOR_B = '#ef4444'; // Red-500

function App() {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [players, setPlayers] = useState<PlayerConfig>({ 
    nameA: 'HOME', 
    nameB: 'GUEST',
    colorA: DEFAULT_COLOR_A,
    colorB: DEFAULT_COLOR_B
  });
  
  // Rules Config
  const [targetScore, setTargetScore] = useState(21);
  const [maxScore, setMaxScore] = useState(30);

  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [swapped, setSwapped] = useState(false);
  
  // State to manage if the winner celebration has been dismissed by the user
  const [celebrationDismissed, setCelebrationDismissed] = useState(false);

  // Stop timer on match end and reset celebration state
  useEffect(() => {
    if (gameState.matchWinner) {
      setIsTimerRunning(false);
      setCelebrationDismissed(false); // Show celebration when a new winner is decided
    }
  }, [gameState.matchWinner]);

  const pushToHistory = (currentState: GameState) => {
    const historyEntry: GameState = JSON.parse(JSON.stringify({
      ...currentState,
      history: [] 
    }));
    setGameState(prev => ({
      ...prev,
      history: [...prev.history, historyEntry]
    }));
  };

  const changeGameRule = (points: number) => {
    setTargetScore(points);
    // Common rule: Max score is usually Target + 9 (e.g. 21->30), or strict caps.
    // For 11 points (casual), usually cap at 15. For 21, cap at 30.
    setMaxScore(points === 11 ? 15 : 30);
  };

  const handleScore = (side: PlayerSide) => {
    if (gameState.matchWinner) return;

    pushToHistory(gameState);

    if (!isTimerRunning && timerSeconds === 0) {
      setIsTimerRunning(true);
    }

    setGameState(prev => {
      let newScoreA = prev.scoreA;
      let newScoreB = prev.scoreB;
      let newServingSide = side; 

      if (side === 'A') newScoreA++;
      else newScoreB++;

      let setWinner: PlayerSide | null = null;
      
      // Dynamic Winning Logic based on targetScore & maxScore
      if ((newScoreA >= targetScore || newScoreB >= targetScore) && Math.abs(newScoreA - newScoreB) >= WIN_BY) {
        setWinner = newScoreA > newScoreB ? 'A' : 'B';
      }
      else if (newScoreA === maxScore || newScoreB === maxScore) {
        setWinner = newScoreA > newScoreB ? 'A' : 'B';
      }

      if (setWinner) {
        const newSetsA = prev.setsA + (setWinner === 'A' ? 1 : 0);
        const newSetsB = prev.setsB + (setWinner === 'B' ? 1 : 0);
        const newPreviousSets: SetScore[] = [
          ...prev.previousSets, 
          { scoreA: newScoreA, scoreB: newScoreB, winner: setWinner }
        ];

        let matchWinner: PlayerSide | null = null;
        if (newSetsA === 2) matchWinner = 'A';
        if (newSetsB === 2) matchWinner = 'B';

        if (matchWinner) {
          return {
            ...prev,
            scoreA: newScoreA,
            scoreB: newScoreB,
            setsA: newSetsA,
            setsB: newSetsB,
            previousSets: newPreviousSets,
            matchWinner: matchWinner,
            servingSide: newServingSide
          };
        } else {
          return {
            ...prev,
            scoreA: 0,
            scoreB: 0,
            setsA: newSetsA,
            setsB: newSetsB,
            currentSet: prev.currentSet + 1,
            previousSets: newPreviousSets,
            servingSide: newServingSide 
          };
        }
      }

      return {
        ...prev,
        scoreA: newScoreA,
        scoreB: newScoreB,
        servingSide: newServingSide
      };
    });
  };

  const handleScoreDecrement = (side: PlayerSide) => {
    if (gameState.matchWinner) return;

    // Check if score is 0, cannot decrement
    const currentScore = side === 'A' ? gameState.scoreA : gameState.scoreB;
    if (currentScore === 0) return;

    pushToHistory(gameState);

    setGameState(prev => ({
      ...prev,
      scoreA: side === 'A' ? prev.scoreA - 1 : prev.scoreA,
      scoreB: side === 'B' ? prev.scoreB - 1 : prev.scoreB,
    }));
  };

  const undoLastAction = () => {
    setGameState(prev => {
      if (prev.history.length === 0) return prev;
      const lastState = prev.history[prev.history.length - 1];
      const newHistory = prev.history.slice(0, -1);
      return { ...lastState, history: newHistory };
    });
  };

  const resetMatch = () => {
    // Custom Confirm UI is handled by a simple check state or just careful UI interaction
    setGameState(INITIAL_STATE);
    setTimerSeconds(0);
    setIsTimerRunning(false);
    setShowSettings(false);
    setCelebrationDismissed(false);
  };

  // State for reset confirmation button
  const [resetConfirm, setResetConfirm] = useState(false);
  useEffect(() => {
    if (!showSettings) setResetConfirm(false);
  }, [showSettings]);

  // Logic to determine display order based on swap state
  const leftPlayer = swapped 
    ? { id: 'B' as PlayerSide, name: players.nameB, color: players.colorB, score: gameState.scoreB, sets: gameState.setsB } 
    : { id: 'A' as PlayerSide, name: players.nameA, color: players.colorA, score: gameState.scoreA, sets: gameState.setsA };
  
  const rightPlayer = swapped 
    ? { id: 'A' as PlayerSide, name: players.nameA, color: players.colorA, score: gameState.scoreA, sets: gameState.setsA } 
    : { id: 'B' as PlayerSide, name: players.nameB, color: players.colorB, score: gameState.scoreB, sets: gameState.setsB };

  return (
    <div className="h-[100dvh] w-screen bg-gray-900 overflow-hidden flex flex-col landscape:flex-row relative">
      
      {/* --- Settings Modal --- */}
      {showSettings && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Settings className="w-5 h-5" /> 比賽設定
              </h2>
              <button onClick={() => setShowSettings(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 flex-1">
              {/* Game Rules */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">賽制分數</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => changeGameRule(21)}
                    className={`
                      py-3 rounded-xl font-bold text-sm border-2 transition-all flex items-center justify-center gap-2
                      ${targetScore === 21 
                        ? 'border-blue-500 bg-blue-50 text-blue-600' 
                        : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'
                      }
                    `}
                  >
                    21 分制 (標準)
                    {targetScore === 21 && <Check size={16} />}
                  </button>
                  <button 
                    onClick={() => changeGameRule(11)}
                    className={`
                      py-3 rounded-xl font-bold text-sm border-2 transition-all flex items-center justify-center gap-2
                      ${targetScore === 11 
                        ? 'border-blue-500 bg-blue-50 text-blue-600' 
                        : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'
                      }
                    `}
                  >
                    11 分制 (休閒)
                    {targetScore === 11 && <Check size={16} />}
                  </button>
                </div>
              </div>

              {/* Team A */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">隊伍 1</label>
                <div className="flex gap-3">
                  <div className="relative w-12 h-12 flex-shrink-0 rounded-full overflow-hidden border-2 border-gray-200 shadow-inner">
                    <input type="color" value={players.colorA} onChange={(e) => setPlayers(p => ({...p, colorA: e.target.value}))} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] p-0 m-0 cursor-pointer" />
                  </div>
                  <input value={players.nameA} onChange={(e) => setPlayers(p => ({...p, nameA: e.target.value}))} className="flex-1 bg-gray-50 border border-gray-200 px-4 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none text-gray-800" placeholder="隊伍名稱" />
                </div>
              </div>

              {/* Team B */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">隊伍 2</label>
                <div className="flex gap-3">
                  <div className="relative w-12 h-12 flex-shrink-0 rounded-full overflow-hidden border-2 border-gray-200 shadow-inner">
                    <input type="color" value={players.colorB} onChange={(e) => setPlayers(p => ({...p, colorB: e.target.value}))} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] p-0 m-0 cursor-pointer" />
                  </div>
                  <input value={players.nameB} onChange={(e) => setPlayers(p => ({...p, nameB: e.target.value}))} className="flex-1 bg-gray-50 border border-gray-200 px-4 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none text-gray-800" placeholder="隊伍名稱" />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <button 
                  onClick={() => {
                    if (resetConfirm) {
                      resetMatch();
                    } else {
                      setResetConfirm(true);
                      setTimeout(() => setResetConfirm(false), 3000); // Reset confirmation state after 3s
                    }
                  }} 
                  className={`
                    w-full py-3 font-medium rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all
                    ${resetConfirm 
                      ? 'bg-red-600 text-white shadow-lg scale-105' 
                      : 'bg-red-50 text-red-600'
                    }
                  `}
                >
                  <RotateCcw size={18} /> 
                  {resetConfirm ? '確定要重置嗎？' : '重置比賽'}
                </button>
              </div>
            </div>
            
            <div className="mt-6">
              <button onClick={() => setShowSettings(false)} className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl shadow-lg active:scale-95 transition-transform">
                完成
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Main Game Interface --- */}
      
      {/* Player 1 Area */}
      <div className="flex-1 relative overflow-hidden transition-all duration-300">
        <ScoreCard 
          side="left"
          name={leftPlayer.name}
          score={leftPlayer.score}
          setsWon={leftPlayer.sets}
          color={leftPlayer.color}
          isServing={gameState.servingSide === leftPlayer.id}
          onScoreClick={() => handleScore(leftPlayer.id)}
          onScoreDecrement={() => handleScoreDecrement(leftPlayer.id)}
          isWinner={gameState.matchWinner === leftPlayer.id}
        />
      </div>

      {/* Control Strip (Center Bar) */}
      <div className="
        flex-shrink-0 z-20 bg-gray-800 text-white shadow-xl
        flex flex-row landscape:flex-col
        h-16 landscape:h-full landscape:w-20
        items-center justify-between landscape:justify-center
        px-4 landscape:px-0 landscape:py-4 gap-2 landscape:gap-6
      ">
        
        {/* Timer */}
        <div className="flex-1 landscape:flex-none flex justify-center">
          <Timer 
            seconds={timerSeconds} 
            isRunning={isTimerRunning} 
            onToggle={() => setIsTimerRunning(!isTimerRunning)} 
            onReset={() => {
              setIsTimerRunning(false);
              setTimerSeconds(0);
            }}
            setSeconds={setTimerSeconds}
            compact={true}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 landscape:flex-col items-center">
           <button 
            onClick={undoLastAction}
            disabled={gameState.history.length === 0}
            className="p-3 rounded-full bg-gray-700 text-gray-300 disabled:opacity-30 active:bg-gray-600 transition-colors"
          >
            <History size={20} />
          </button>

          <button 
            onClick={() => setSwapped(!swapped)}
            className="p-3 rounded-full bg-gray-700 text-gray-300 active:bg-gray-600 transition-colors"
          >
            <ArrowLeftRight size={20} />
          </button>

          <button 
            onClick={() => setShowSettings(true)}
            className="p-3 rounded-full bg-gray-700 text-gray-300 active:bg-gray-600 transition-colors"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Player 2 Area */}
      <div className="flex-1 relative overflow-hidden transition-all duration-300">
        <ScoreCard 
          side="right"
          name={rightPlayer.name}
          score={rightPlayer.score}
          setsWon={rightPlayer.sets}
          color={rightPlayer.color}
          isServing={gameState.servingSide === rightPlayer.id}
          onScoreClick={() => handleScore(rightPlayer.id)}
          onScoreDecrement={() => handleScoreDecrement(rightPlayer.id)}
          isWinner={gameState.matchWinner === rightPlayer.id}
        />
      </div>

      {/* Match Winner Overlay */}
      {gameState.matchWinner && !celebrationDismissed && (
        <div 
          onClick={() => setCelebrationDismissed(true)}
          className="absolute inset-0 z-40 bg-black/40 backdrop-blur-[2px] cursor-pointer flex items-center justify-center animate-in fade-in duration-300"
        >
           <div className="bg-white/90 backdrop-blur-md px-10 py-8 rounded-[2rem] shadow-2xl flex flex-col items-center transform scale-110 animate-in zoom-in duration-300 border-4 border-yellow-400/30">
              <Crown className="w-20 h-20 text-yellow-500 mb-4 drop-shadow-lg animate-bounce" fill="currentColor" />
              <div className="text-4xl font-black text-gray-800 tracking-tight text-center">
                {gameState.matchWinner === 'A' ? players.nameA : players.nameB}
              </div>
              <div className="text-yellow-600 font-bold uppercase tracking-[0.3em] mt-2 text-sm bg-yellow-100 px-4 py-1 rounded-full">
                Winner
              </div>
              <div className="mt-6 text-xs text-gray-400 font-medium animate-pulse uppercase tracking-wider">
                點擊任意處關閉
              </div>
           </div>
        </div>
      )}

    </div>
  );
}

export default App;