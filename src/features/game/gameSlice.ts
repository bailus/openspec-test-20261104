import { type PayloadAction, createSlice } from '@reduxjs/toolkit'
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

export interface GameState {
  /** Length 9, row-major. */
  board: Cell[]
  currentPlayer: Player
  score: Score
}

export const initialState: GameState = {
  board: createEmptyBoard(),
  currentPlayer: 'X',
  score: { X: 0, O: 0, draws: 0 },
}

function isGameOver(board: readonly Cell[]): boolean {
  return calculateWinner(board) !== null || isBoardFull(board)
}

export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    playMove(state, action: PayloadAction<number>) {
      const index = action.payload
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
    },
    newGame(state) {
      state.board = createEmptyBoard()
      state.currentPlayer = 'X'
    },
  },
})

export const { playMove, newGame } = gameSlice.actions
export default gameSlice.reducer
