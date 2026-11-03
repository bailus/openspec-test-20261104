import { type PayloadAction, createSlice } from '@reduxjs/toolkit'
import type { Difficulty } from './ai'
import {
  type Cell,
  type Player,
  calculateWinner,
  createEmptyBoard,
  isBoardFull,
  isValidIndex,
} from './logic'

export interface Score {
  X: number
  O: number
  draws: number
}

/** Who plays against the human: another person, or the computer at a difficulty. */
export type Opponent = 'human' | Difficulty

export interface GameState {
  /** Length 9, row-major. */
  board: Cell[]
  currentPlayer: Player
  score: Score
  opponent: Opponent
  /** The human's mark against a computer opponent. Ignored in two-player play. */
  humanPlayer: Player
  /** Goes up on every new game, so a computer move planned for an earlier game can be rejected. */
  gameId: number
}

export interface ComputerMovePayload {
  index: number
  /** The game the move was planned for. */
  gameId: number
}

export const initialState: GameState = {
  board: createEmptyBoard(),
  currentPlayer: 'X',
  score: { X: 0, O: 0, draws: 0 },
  opponent: 'medium',
  humanPlayer: 'X',
  gameId: 0,
}

function isGameOver(board: readonly Cell[]): boolean {
  return calculateWinner(board) !== null || isBoardFull(board)
}

/** True once a mark has been placed and until the game is won or drawn. */
export function isInProgress(state: GameState): boolean {
  return state.board.some((cell) => cell !== null) && !isGameOver(state.board)
}

/** True when the computer, not a person, is to place the next mark. */
export function isComputerToMove(state: GameState): boolean {
  return state.opponent !== 'human' && state.currentPlayer !== state.humanPlayer
}

/** Places the current player's mark if the move is legal, then scores or passes the turn. */
function applyMove(state: GameState, index: number): void {
  if (!isValidIndex(index)) return
  if (state.board[index] !== null) return
  if (isGameOver(state.board)) return

  state.board[index] = state.currentPlayer

  const result = calculateWinner(state.board)
  if (result) {
    state.score[result.winner] += 1
  } else if (isBoardFull(state.board)) {
    state.score.draws += 1
  } else {
    state.currentPlayer = state.currentPlayer === 'X' ? 'O' : 'X'
  }
}

/** Clears the board for the next game, keeping the score, opponent and side. */
function startNewGame(state: GameState): void {
  state.board = createEmptyBoard()
  state.currentPlayer = 'X'
  state.gameId += 1
}

function startOver(state: GameState): void {
  startNewGame(state)
  state.score = { X: 0, O: 0, draws: 0 }
}

export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    /**
     * A person selecting a cell. On a finished board this starts the next game without
     * placing a mark; otherwise it places the current player's mark. Ignored while it is
     * the computer's turn.
     */
    playMove(state, action: PayloadAction<number>) {
      if (!isValidIndex(action.payload)) return
      if (isGameOver(state.board)) {
        startNewGame(state)
        return
      }
      if (isComputerToMove(state)) return
      applyMove(state, action.payload)
    },
    /** The computer's move. Ignored unless it is the computer's turn in the game it was planned for. */
    computerMove(state, action: PayloadAction<ComputerMovePayload>) {
      if (action.payload.gameId !== state.gameId) return
      if (!isComputerToMove(state)) return
      applyMove(state, action.payload.index)
    },
    /** Ignored while a game is in progress. */
    setOpponent(state, action: PayloadAction<Opponent>) {
      if (isInProgress(state)) return
      if (action.payload === state.opponent) return
      state.opponent = action.payload
      startOver(state)
    },
    /** Ignored while a game is in progress. */
    setHumanPlayer(state, action: PayloadAction<Player>) {
      if (isInProgress(state)) return
      if (action.payload === state.humanPlayer) return
      state.humanPlayer = action.payload
      startOver(state)
    },
  },
})

export const { playMove, computerMove, setOpponent, setHumanPlayer } = gameSlice.actions
export default gameSlice.reducer
