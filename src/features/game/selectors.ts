import { createSelector } from '@reduxjs/toolkit'
import { type GameState, isComputerToMove } from './gameSlice'
import { calculateWinner, isBoardFull } from './logic'

/** Any root state that mounts the game slice under `game`. */
export interface GameRootState {
  game: GameState
}

export const selectBoard = (state: GameRootState) => state.game.board
export const selectCurrentPlayer = (state: GameRootState) => state.game.currentPlayer
export const selectScore = (state: GameRootState) => state.game.score
export const selectOpponent = (state: GameRootState) => state.game.opponent
export const selectHumanPlayer = (state: GameRootState) => state.game.humanPlayer
export const selectGameId = (state: GameRootState) => state.game.gameId

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

/** True once a mark has been placed and until the game is won or drawn. */
export const selectIsInProgress = createSelector(
  [selectBoard, selectIsGameOver],
  (board, isGameOver) => !isGameOver && board.some((cell) => cell !== null),
)

/** True while an unfinished game is waiting for the computer's move. */
export const selectIsComputerTurn = (state: GameRootState) =>
  isComputerToMove(state.game) && !selectIsGameOver(state)

export const PLAY_AGAIN_HINT = 'Click the board to play again.'

export const selectStatus = createSelector(
  [selectWinner, selectIsDraw, selectCurrentPlayer, selectOpponent, selectHumanPlayer],
  (winner, isDraw, currentPlayer, opponent, humanPlayer) => {
    const vsComputer = opponent !== 'human'
    if (isDraw) return `It's a draw. ${PLAY_AGAIN_HINT}`
    if (winner) {
      const result = !vsComputer
        ? `${winner} wins!`
        : winner === humanPlayer
          ? `You win! (${winner})`
          : `Computer wins (${winner})`
      return `${result} ${PLAY_AGAIN_HINT}`
    }
    if (!vsComputer) return `${currentPlayer}'s turn`
    return currentPlayer === humanPlayer
      ? `Your turn (${currentPlayer})`
      : `Computer's turn (${currentPlayer})`
  },
)

export interface ScoreTally {
  key: 'x' | 'o' | 'you' | 'opponent' | 'draws'
  label: string
  value: number
}

/**
 * The Scoreboard rows. Two-player play counts by mark; against the computer the same
 * tallies are shown from the human's side. Changing side resets the score, so a mark's
 * tally always belongs to the same player.
 */
export const selectScoreTallies = createSelector(
  [selectScore, selectOpponent, selectHumanPlayer],
  (score, opponent, humanPlayer): ScoreTally[] => {
    const draws: ScoreTally = { key: 'draws', label: 'Draws', value: score.draws }
    if (opponent === 'human') {
      return [
        { key: 'x', label: 'X wins', value: score.X },
        { key: 'o', label: 'O wins', value: score.O },
        draws,
      ]
    }
    const computer = humanPlayer === 'X' ? 'O' : 'X'
    return [
      { key: 'you', label: 'Your wins', value: score[humanPlayer] },
      { key: 'opponent', label: 'Opponent wins', value: score[computer] },
      draws,
    ]
  },
)
