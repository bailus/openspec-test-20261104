import { createSelector } from '@reduxjs/toolkit'
import type { GameState } from './gameSlice'
import { calculateWinner, isBoardFull } from './logic'

/** Any root state that mounts the game slice under `game`. */
export interface GameRootState {
  game: GameState
}

export const selectBoard = (state: GameRootState) => state.game.board
export const selectCurrentPlayer = (state: GameRootState) => state.game.currentPlayer
export const selectScore = (state: GameRootState) => state.game.score

const selectResult = createSelector([selectBoard], (board) => calculateWinner(board))

export const selectWinner = createSelector([selectResult], (result) => result?.winner ?? null)

export const selectWinningLine = createSelector([selectResult], (result) => result?.line ?? null)

export const selectIsDraw = createSelector(
  [selectResult, selectBoard],
  (result, board) => result === null && isBoardFull(board),
)

export const selectIsGameOver = createSelector(
  [selectWinner, selectIsDraw],
  (winner, isDraw) => winner !== null || isDraw,
)

export const selectStatus = createSelector(
  [selectWinner, selectIsDraw, selectCurrentPlayer],
  (winner, isDraw, currentPlayer) => {
    if (winner) return `${winner} wins!`
    if (isDraw) return "It's a draw"
    return `${currentPlayer}'s turn`
  },
)
