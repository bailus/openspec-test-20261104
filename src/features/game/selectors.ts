import { createSelector } from '@reduxjs/toolkit'
import { type GameState, isComputerToMove } from './gameSlice'
import { type Player, calculateWinner, isBoardFull } from './logic'

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
export const selectForfeitedBy = (state: GameRootState) => state.game.forfeitedBy

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

function describeGame(
  winner: Player | null,
  isDraw: boolean,
  currentPlayer: Player,
  vsComputer: boolean,
  humanPlayer: Player,
): string {
  if (isDraw) return `It's a draw. ${PLAY_AGAIN_HINT}`
  if (winner) {
    const result = !vsComputer
      ? `${winner} wins!`
      : winner === humanPlayer
        ? 'You win!'
        : 'Computer wins.'
    return `${result} ${PLAY_AGAIN_HINT}`
  }
  if (!vsComputer) return `${currentPlayer}'s turn`
  return currentPlayer === humanPlayer ? 'Your turn' : "Computer's turn"
}

/** The status line, led by a forfeit notice after a mid-game Reset. */
export const selectStatus = createSelector(
  [
    selectWinner,
    selectIsDraw,
    selectCurrentPlayer,
    selectOpponent,
    selectHumanPlayer,
    selectForfeitedBy,
  ],
  (winner, isDraw, currentPlayer, opponent, humanPlayer, forfeitedBy) => {
    const vsComputer = opponent !== 'human'
    const status = describeGame(winner, isDraw, currentPlayer, vsComputer, humanPlayer)
    if (forfeitedBy === null) return status
    const notice = vsComputer ? 'You forfeited.' : `${forfeitedBy} forfeited.`
    return `${notice} ${status}`
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
      { key: 'you', label: 'You', value: score[humanPlayer] },
      { key: 'opponent', label: 'Opponent', value: score[computer] },
      draws,
    ]
  },
)
