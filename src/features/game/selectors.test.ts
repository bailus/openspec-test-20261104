import { describe, expect, test } from 'vitest'
import reducer, {
  type GameState,
  computerMove,
  initialState,
  playMove,
  resetGame,
  setHumanPlayer,
  setOpponent,
} from './gameSlice'
import {
  selectHumanPlayer,
  selectIsComputerTurn,
  selectIsDraw,
  selectIsInProgress,
  selectOpponent,
  selectScoreTallies,
  selectIsGameOver,
  selectStatus,
  selectWinner,
  selectWinningLine,
} from './selectors'

function stateAfter(moves: number[]): { game: GameState } {
  const twoPlayer = reducer(initialState, setOpponent('human'))
  return { game: moves.reduce((s, i) => reducer(s, playMove(i)), twoPlayer) }
}

describe('selectors', () => {
  test('a new game is in progress with X to move', () => {
    const state = stateAfter([])
    expect(selectWinner(state)).toBeNull()
    expect(selectWinningLine(state)).toBeNull()
    expect(selectIsDraw(state)).toBe(false)
    expect(selectIsGameOver(state)).toBe(false)
    expect(selectStatus(state)).toBe("X's turn")
  })

  test('mid-game shows whose turn it is', () => {
    const state = stateAfter([4])
    expect(selectStatus(state)).toBe("O's turn")
    expect(selectIsGameOver(state)).toBe(false)
  })

  test('an X win reports the winner and the winning line', () => {
    const state = stateAfter([0, 3, 1, 4, 2])
    expect(selectWinner(state)).toBe('X')
    expect(selectWinningLine(state)).toEqual([0, 1, 2])
    expect(selectIsDraw(state)).toBe(false)
    expect(selectIsGameOver(state)).toBe(true)
    expect(selectStatus(state)).toBe('X wins! Click the board to play again.')
  })

  test('an O diagonal win reports O and the diagonal', () => {
    // O takes 2, 4, 6
    const state = stateAfter([0, 2, 1, 4, 8, 6])
    expect(selectWinner(state)).toBe('O')
    expect(selectWinningLine(state)).toEqual([2, 4, 6])
    expect(selectStatus(state)).toBe('O wins! Click the board to play again.')
  })

  test('a full board with no line is a draw', () => {
    const state = stateAfter([0, 1, 2, 4, 3, 5, 7, 6, 8])
    expect(selectWinner(state)).toBeNull()
    expect(selectIsDraw(state)).toBe(true)
    expect(selectIsGameOver(state)).toBe(true)
    expect(selectStatus(state)).toBe("It's a draw. Click the board to play again.")
  })

  test('selectors are memoized for an unchanged board', () => {
    const state = stateAfter([0, 3, 1, 4, 2])
    expect(selectWinningLine(state)).toBe(selectWinningLine({ game: { ...state.game } }))
  })
})

describe('selectors against the computer', () => {
  /**
   * Plays `moves` (cell indices, X first) against a Hard computer with the human on `side`.
   * Each move is dispatched as a human or computer move according to whose turn it is.
   */
  function vsComputer(side: 'X' | 'O', moves: number[] = []): { game: GameState } {
    let game = reducer(reducer(initialState, setOpponent('hard')), setHumanPlayer(side))
    for (const index of moves) {
      game =
        game.currentPlayer === side
          ? reducer(game, playMove(index))
          : reducer(game, computerMove({ index, gameId: game.gameId }))
    }
    return { game }
  }

  test('exposes the opponent and the human side', () => {
    const state = vsComputer('O')
    expect(selectOpponent(state)).toBe('hard')
    expect(selectHumanPlayer(state)).toBe('O')
  })

  test("is the computer's turn only when the computer is to move in an unfinished game", () => {
    expect(selectIsComputerTurn(stateAfter([4]))).toBe(false) // two-player
    expect(selectIsComputerTurn(vsComputer('X'))).toBe(false)
    expect(selectIsComputerTurn(vsComputer('X', [4]))).toBe(true)
    expect(selectIsComputerTurn(vsComputer('O'))).toBe(true)
    // Human X wins the top row: the game is over, so it is nobody's turn.
    expect(selectIsComputerTurn(vsComputer('X', [0, 3, 1, 4, 2]))).toBe(false)
  })

  test('says "Your turn" and "Computer\'s turn" without the mark', () => {
    expect(selectStatus(vsComputer('X'))).toBe('Your turn')
    expect(selectStatus(vsComputer('X', [4]))).toBe("Computer's turn")
    expect(selectStatus(vsComputer('O'))).toBe("Computer's turn")
    expect(selectStatus(vsComputer('O', [4]))).toBe('Your turn')
  })

  test('announces a human win from the human point of view', () => {
    // O takes 2, 4, 6
    expect(selectStatus(vsComputer('O', [0, 2, 1, 4, 8, 6]))).toBe('You win! Click the board to play again.')
    expect(selectStatus(vsComputer('X', [0, 3, 1, 4, 2]))).toBe('You win! Click the board to play again.')
  })

  test('announces a computer win', () => {
    // O takes 3, 4, 5 (middle row)
    expect(selectStatus(vsComputer('X', [0, 3, 1, 4, 8, 5]))).toBe('Computer wins. Click the board to play again.')
    expect(selectStatus(vsComputer('O', [0, 3, 1, 4, 2]))).toBe('Computer wins. Click the board to play again.')
  })

  test('never names the mark in brackets', () => {
    const states = [
      vsComputer('X'),
      vsComputer('X', [4]),
      vsComputer('O'),
      vsComputer('O', [0, 2, 1, 4, 8, 6]),
      vsComputer('X', [0, 3, 1, 4, 8, 5]),
    ]
    for (const state of states) expect(selectStatus(state)).not.toMatch(/\((X|O)\)/)
  })

  test('announces a draw', () => {
    expect(selectStatus(vsComputer('X', [0, 1, 2, 4, 3, 5, 7, 6, 8]))).toBe("It's a draw. Click the board to play again.")
  })
})

describe('game in progress', () => {
  test('is false on an empty board and true after the first mark', () => {
    expect(selectIsInProgress(stateAfter([]))).toBe(false)
    expect(selectIsInProgress(stateAfter([4]))).toBe(true)
  })

  test('is false once the game is won or drawn', () => {
    expect(selectIsInProgress(stateAfter([0, 3, 1, 4, 2]))).toBe(false)
    expect(selectIsInProgress(stateAfter([0, 1, 2, 4, 3, 5, 7, 6, 8]))).toBe(false)
  })
})

describe('score tallies', () => {
  const score = { X: 3, O: 1, draws: 2 }
  const withScore = (opponent: GameState['opponent'], humanPlayer: 'X' | 'O') => ({
    game: { ...initialState, opponent, humanPlayer, score },
  })
  const rows = (state: { game: GameState }) =>
    selectScoreTallies(state).map(({ label, value }) => `${label}: ${value}`)

  test('two-player play counts by mark', () => {
    expect(rows(withScore('human', 'O'))).toEqual(['X wins: 3', 'O wins: 1', 'Draws: 2'])
  })

  test('against the computer, "You" follows the human side', () => {
    expect(rows(withScore('medium', 'X'))).toEqual(['You: 3', 'Opponent: 1', 'Draws: 2'])
    expect(rows(withScore('hard', 'O'))).toEqual(['You: 1', 'Opponent: 3', 'Draws: 2'])
  })
})

describe('forfeit notice', () => {
  test('two-player: names the mark that forfeited', () => {
    const twoPlayer = reducer(initialState, setOpponent('human'))
    const game = reducer(reducer(twoPlayer, playMove(4)), resetGame()) // O was to move
    expect(selectStatus({ game })).toBe("O forfeited. X's turn")
  })

  test('against the computer: "You forfeited." on the human turn', () => {
    const game = reducer(reducer(initialState, playMove(4)), resetGame())
    expect(selectStatus({ game })).toBe('You forfeited. Your turn')
  })

  test("against the computer: \"You forfeited.\" before the computer opens as X", () => {
    let game = reducer(reducer(initialState, setHumanPlayer('O')), setOpponent('hard'))
    game = reducer(game, computerMove({ index: 4, gameId: game.gameId }))
    game = reducer(game, resetGame())
    expect(selectStatus({ game })).toBe("You forfeited. Computer's turn")
    game = reducer(game, computerMove({ index: 0, gameId: game.gameId }))
    expect(selectStatus({ game })).toBe('You forfeited. Your turn')
  })

  test('is gone once a person places a mark', () => {
    let game = reducer(reducer(initialState, playMove(4)), resetGame())
    game = reducer(game, playMove(0))
    expect(selectStatus({ game })).not.toContain('forfeited')
  })
})
