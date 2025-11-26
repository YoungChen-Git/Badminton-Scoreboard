import React, { useState, useEffect, useRef } from 'react';
import { Timer } from './components/Timer';
import { ScoreCard } from './components/ScoreCard';
import { Button } from './components/Button';
import { RotateCcw, ArrowLeftRight, Settings, History, Trophy, Share2, Palette } from 'lucide-react';
import { GameState, PlayerSide, PlayerConfig, SetScore } from './types';

// Constants
const TARGET_SCORE = 21;
const MAX_SCORE = 30; // Hard cap
const WIN_BY = 2;

const INITIAL_STATE: GameState = {
  scoreA: 0,
  scoreB: 0,
  setsA: 0,
  setsB: 0,
  currentSet: 1,
  previousSets: [],
  servingSide: 'A', // Usually determined by toss, we default to A
  matchWinner: null,
  history: []
};

// Default colors
const DEFAULT_COLOR_A = '#FFFFFF';
const DEFAULT_COLOR_B = '#FFFFFF';

function App() {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [players, setPlayers] = useState<PlayerConfig>({ 
    nameA: '球隊 A', 
    nameB: '球隊 B',
    colorA: DEFAULT_COLOR_A,
    colorB: DEFAULT_COLOR_B
  });
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [swapped, setSwapped] = useState(false); // To visually swap sides on UI

  // Effect to stop timer on match end
  useEffect(() => {
    if (gameState.matchWinner) {
      setIsTimerRunning(false);
    }
  }, [gameState.matchWinner]);

  const pushToHistory = (currentState: GameState) => {
    // We only store essential state to restore later.
    // Deep copy to prevent reference issues
    const historyEntry: GameState = JSON.parse(JSON.stringify({
      ...currentState,
      history: [] // Don't nest history inside history
    }));

    setGameState(prev => ({
      ...prev,
      history: [...prev.history, historyEntry]
    }));
  };

  const handleScore = (side: PlayerSide) => {
    if (gameState.matchWinner) return;

    // Push current state to history before modifying
    pushToHistory(gameState);

    // Auto-start timer on first point if not running and at 00:00
    if (!isTimerRunning && timerSeconds === 0) {
      setIsTimerRunning(true);
    }

    setGameState(prev => {
      let newScoreA = prev.scoreA;
      let newScoreB = prev.scoreB;
      let newServingSide = side; // Winner of rally serves

      if (side === 'A') newScoreA++;
      else newScoreB++;

      // Check Set Win Conditions
      let setWinner: PlayerSide | null = null;
      
      // Standard Win: >= 21 and diff >= 2
      if ((newScoreA >= TARGET_SCORE || newScoreB >= TARGET_SCORE) && Math.abs(newScoreA - newScoreB) >= WIN_BY) {
        setWinner = newScoreA > newScoreB ? 'A' : 'B';
      }
      // Hard Cap Win: Reach 30
      else if (newScoreA === MAX_SCORE || newScoreB === MAX_SCORE) {
        setWinner = newScoreA > newScoreB ? 'A' : 'B';
      }

      if (setWinner) {
        const newSetsA = prev.setsA + (setWinner === 'A' ? 1 : 0);
        const newSetsB = prev.setsB + (setWinner === 'B' ? 1 : 0);
        const newPreviousSets: SetScore[] = [
          ...prev.previousSets, 
          { scoreA: newScoreA, scoreB: newScoreB, winner: setWinner }
        ];

        // Check Match Win (Best of 3)
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
          // Next Set
          return {
            ...prev,
            scoreA: 0,
            scoreB: 0,
            setsA: newSetsA,
            setsB: newSetsB,
            currentSet: prev.currentSet + 1,
            previousSets: newPreviousSets,
            servingSide: newServingSide // Winner of previous set/point serves? Usually previous game winner serves first in next game.
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

  const undoLastAction = () => {
    setGameState(prev => {
      if (prev.history.length === 0) return prev;
      const lastState = prev.history[prev.history.length - 1];
      const newHistory = prev.history.slice(0, -1);
      return { ...lastState, history: newHistory };
    });
  };

  const resetMatch = () => {
    if (confirm('確定要重新開始比賽嗎？所有紀錄將會清除。')) {
      setGameState(INITIAL_STATE);
      setTimerSeconds(0);
      setIsTimerRunning(false);
    }
  };

  const toggleSides = () => {
    setSwapped(!swapped);
  };

  // UI Helpers
  const leftPlayer = swapped 
    ? { id: 'B' as PlayerSide, name: players.nameB, color: players.colorB, score: gameState.scoreB, sets: gameState.setsB } 
    : { id: 'A' as PlayerSide, name: players.nameA, color: players.colorA, score: gameState.scoreA, sets: gameState.setsA };
  
  const rightPlayer = swapped 
    ? { id: 'A' as PlayerSide, name: players.nameA, color: players.colorA, score: gameState.scoreA, sets: gameState.setsA } 
    : { id: 'B' as PlayerSide, name: players.nameB, color: players.colorB, score: gameState.scoreB, sets: gameState.setsB };

  return (
    <div className="min-h-screen bg-ios-bg text-gray-900 font-sans pb-safe-area-bottom">
      
      {/* Header / Nav */}
      <header className="sticky top-0 z-50 bg-ios-bg/80 backdrop-blur-md border-b border-gray-200 px-4 pt-safe-area-top pb-2">
        <div className="flex items-center justify-between h-12 max-w-2xl mx-auto">
          <div className="font-bold text-xl">羽球計分高手</div>
          <button onClick={() => setShowSettings(!showSettings)} className="p-2 text-ios-blue transition-opacity hover:opacity-70">
            <Settings size={24} />
          </button>
        </div>
        
        {/* Settings Panel Expansion */}
        {showSettings && (
          <div className="max-w-2xl mx-auto py-4 animate-fade-in-down">
            <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
              <div className="flex items-center gap-2 mb-2 text-gray-500">
                <Palette size={16} />
                <h3 className="font-bold text-xs uppercase tracking-wider">球隊設定 (名稱與顏色)</h3>
              </div>
              
              <div className="space-y-3">
                {/* Team A Input */}
                <div className="flex gap-3 items-center">
                   <div className="relative w-10 h-10 flex-shrink-0 rounded-full overflow-hidden shadow-sm border border-gray-200">
                    <input 
                      type="color"
                      value={players.colorA}
                      onChange={(e) => setPlayers(p => ({...p, colorA: e.target.value}))}
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] p-0 m-0 border-none cursor-pointer"
                    />
                  </div>
                  <input 
                    value={players.nameA} 
                    onChange={(e) => setPlayers(p => ({...p, nameA: e.target.value}))}
                    className="flex-1 bg-gray-100 p-2 rounded-lg border-none focus:ring-2 focus:ring-ios-blue outline-none"
                    placeholder="球隊 A 名稱"
                  />
                </div>

                {/* Team B Input */}
                <div className="flex gap-3 items-center">
                  <div className="relative w-10 h-10 flex-shrink-0 rounded-full overflow-hidden shadow-sm border border-gray-200">
                    <input 
                      type="color"
                      value={players.colorB}
                      onChange={(e) => setPlayers(p => ({...p, colorB: e.target.value}))}
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] p-0 m-0 border-none cursor-pointer"
                    />
                  </div>
                  <input 
                    value={players.nameB} 
                    onChange={(e) => setPlayers(p => ({...p, nameB: e.target.value}))}
                    className="flex-1 bg-gray-100 p-2 rounded-lg border-none focus:ring-2 focus:ring-ios-blue outline-none"
                    placeholder="球隊 B 名稱"
                  />
                </div>
              </div>
              
            </div>
          </div>
        )}
      </header>

      <main className="max-w-md mx-auto px-4 pt-4 pb-8 space-y-6">
        
        {/* Timer Section */}
        <section className="bg-white rounded-2xl shadow-sm p-4">
          <Timer 
            seconds={timerSeconds} 
            isRunning={isTimerRunning} 
            onToggle={() => setIsTimerRunning(!isTimerRunning)} 
            onReset={() => {
              setIsTimerRunning(false);
              setTimerSeconds(0);
            }}
            setSeconds={setTimerSeconds}
          />
        </section>

        {/* Previous Sets History (Mini View) */}
        {gameState.previousSets.length > 0 && (
          <div className="flex justify-center gap-4 text-sm text-gray-500">
            {gameState.previousSets.map((set, idx) => (
              <div key={idx} className="bg-gray-100 px-3 py-1 rounded-full">
                Set {idx + 1}: <span className={set.winner === 'A' ? 'font-bold text-gray-900' : ''}>{set.scoreA}</span> - <span className={set.winner === 'B' ? 'font-bold text-gray-900' : ''}>{set.scoreB}</span>
              </div>
            ))}
          </div>
        )}

        {/* Score Board */}
        <section className="flex justify-between items-center -mx-2">
           <ScoreCard 
             side="left"
             name={leftPlayer.name}
             score={leftPlayer.score}
             setsWon={leftPlayer.sets}
             color={leftPlayer.color}
             isServing={gameState.servingSide === leftPlayer.id}
             onScoreClick={() => handleScore(leftPlayer.id)}
             isWinner={gameState.matchWinner === leftPlayer.id}
           />
           <ScoreCard 
             side="right"
             name={rightPlayer.name}
             score={rightPlayer.score}
             setsWon={rightPlayer.sets}
             color={rightPlayer.color}
             isServing={gameState.servingSide === rightPlayer.id}
             onScoreClick={() => handleScore(rightPlayer.id)}
             isWinner={gameState.matchWinner === rightPlayer.id}
           />
        </section>

        {/* Match Info/Status */}
        <div className="text-center">
            {gameState.matchWinner ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full font-bold animate-pulse">
                <Trophy size={20} />
                {gameState.matchWinner === 'A' ? players.nameA : players.nameB} 獲勝!
              </div>
            ) : (
              <div className="text-gray-400 font-medium text-sm">
                第 {gameState.currentSet} 局
                {gameState.scoreA === 20 && gameState.scoreB === 20 && <span className="ml-2 text-ios-red">Deuce!</span>}
              </div>
            )}
        </div>

        {/* Controls */}
        <section className="grid grid-cols-2 gap-4">
          <Button 
            variant="secondary" 
            onClick={undoLastAction} 
            disabled={gameState.history.length === 0}
            className="col-span-1"
          >
            <div className="flex items-center gap-2">
              <History size={20} />
              <span>撤銷</span>
            </div>
          </Button>

          <Button 
            variant="secondary" 
            onClick={toggleSides} 
            className="col-span-1"
          >
            <div className="flex items-center gap-2">
              <ArrowLeftRight size={20} />
              <span>交換場地</span>
            </div>
          </Button>

          <Button 
            variant="destructive" 
            onClick={resetMatch} 
            className="col-span-2 mt-4"
          >
            <div className="flex items-center gap-2">
              <RotateCcw size={20} />
              <span>重新開始比賽</span>
            </div>
          </Button>
        </section>

      </main>
    </div>
  );
}

export default App;