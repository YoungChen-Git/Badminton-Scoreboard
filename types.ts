export type PlayerSide = 'A' | 'B';

export interface SetScore {
  scoreA: number;
  scoreB: number;
  winner: PlayerSide | null;
}

export interface GameState {
  scoreA: number;
  scoreB: number;
  setsA: number;
  setsB: number;
  currentSet: number; // 1, 2, or 3
  previousSets: SetScore[];
  servingSide: PlayerSide; // Who is currently serving
  matchWinner: PlayerSide | null;
  history: GameHistory[];
}

export interface GameHistory {
  scoreA: number;
  scoreB: number;
  setsA: number;
  setsB: number;
  currentSet: number;
  previousSets: SetScore[];
  servingSide: PlayerSide;
  matchWinner: PlayerSide | null;
}

export interface PlayerConfig {
  nameA: string;
  nameB: string;
  colorA: string;
  colorB: string;
}