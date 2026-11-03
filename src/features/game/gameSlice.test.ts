import { describe, expect, test } from 'vitest'
import reducer, {
  type GameState,
  computerMove,
  initialState,
  playMove,
  setHumanPlayer,
  setOpponent,
} from './gameSlice'

/** A fresh two-player game (the app's default opponent is the computer). */
const twoPlayer = reducer(initialState, setOpponent('human'))

/** Applies a sequence of moves starting from `state` (or a fresh two-player game). */
function play(moves: number[], state: GameState = twoPlayer): GameState {
  return moves.reduce((s, i) => reducer(s, playMove(i)), state)
}

// X: 0, 1, 2 (top row); O: 3, 4
const X_ROW_WIN = [0, 3, 1, 4, 2]
// X: 0, 1, 8; O: 3, 4, 5 (middle row)
const O_ROW_WIN = [0, 3, 1, 4, 8, 5]
// Ends X O X / X O O / O X X with no line
const DRAW = [0, 1, 2, 4, 3, 5, 7, 6, 8]

describe('game slice', () => {
  test('starts with an empty board, X to move and a zero score', () => {
    const state = reducer(undefined, { type: '@@INIT' })
    expect(state.board).toEqual(Array(9).fill(null))
    expect(state.currentPlayer).toBe('X')
    expect(state.score).toEqual({ X: 0, O: 0, draws: 0 })
  })

  test('alternates turns starting with X', () => {
    const afterX = play([4])
    expect(afterX.board[4]).toBe('X')
    expect(afterX.currentPlayer).toBe('O')

    const afterO = play([0], afterX)
    expect(afterO.board[0]).toBe('O')
    expect(afterO.currentPlayer).toBe('X')
  })

  test('ignores a move on an occupied cell', () => {
    const before = play([4])
    const after = reducer(before, playMove(4))
    expect(after).toBe(before)
    expect(after.board[4]).toBe('X')
    expect(after.currentPlayer).toBe('O')
  })

  test.each([-1, 9, 1.5, Number.NaN])('ignores an out-of-range index (%s)', (index) => {
    const before = play([4])
    expect(reducer(before, playMove(index))).toBe(before)
  })

  test('selecting a cell after a win starts a new game without placing a mark', () => {
    const won = play(X_ROW_WIN)
    const after = reducer(won, playMove(8))
    expect(after.board).toEqual(Array(9).fill(null))
    expect(after.currentPlayer).toBe('X')
    expect(after.score).toEqual({ X: 1, O: 0, draws: 0 })
    expect(after.gameId).toBe(won.gameId + 1)
  })

  test('selecting any cell after a draw starts a new game without placing a mark', () => {
    const drawn = play(DRAW)
    expect(drawn.board.every((c) => c !== null)).toBe(true)
    for (let i = 0; i < 9; i++) {
      const after = reducer(drawn, playMove(i))
      expect(after.board).toEqual(Array(9).fill(null))
      expect(after.score).toEqual({ X: 0, O: 0, draws: 1 })
    }
  })

  test('an out-of-range index on a finished board does not restart', () => {
    const won = play(X_ROW_WIN)
    expect(reducer(won, playMove(-1))).toBe(won)
  })

  test('increments X wins when X wins', () => {
    expect(play(X_ROW_WIN).score).toEqual({ X: 1, O: 0, draws: 0 })
  })

  test('increments O wins when O wins', () => {
    expect(play(O_ROW_WIN).score).toEqual({ X: 0, O: 1, draws: 0 })
  })

  test('increments draws on a draw', () => {
    expect(play(DRAW).score).toEqual({ X: 0, O: 0, draws: 1 })
  })

  test('a win on the ninth move counts as a win, not a draw', () => {
    // X: 0, 2, 3, 4, 8 ... ends with X completing 0-4-8 on the last empty cell
    const state = play([0, 1, 2, 5, 3, 6, 4, 7, 8])
    expect(state.board.every((c) => c !== null)).toBe(true)
    expect(state.score).toEqual({ X: 1, O: 0, draws: 0 })
  })

  test('the score carries over into the next game', () => {
    const restarted = reducer(play(DRAW), playMove(0))
    const won = play(X_ROW_WIN, restarted)
    expect(won.score).toEqual({ X: 1, O: 0, draws: 1 })
  })

  test('selecting an occupied cell mid-game does not restart', () => {
    const midGame = play([4, 0])
    expect(reducer(midGame, playMove(4))).toBe(midGame)
  })
})

describe('computer opponent state', () => {
  /** A state against the given computer opponent, with the human on `side`. */
  function vsComputer(side: 'X' | 'O' = 'X', opponent: GameState['opponent'] = 'hard') {
    let state = reducer(initialState, setOpponent(opponent))
    state = reducer(state, setHumanPlayer(side))
    return state
  }

  /** Dispatches a computer move for the state's current game. */
  function cpu(state: GameState, index: number): GameState {
    return reducer(state, computerMove({ index, gameId: state.gameId }))
  }

  test('defaults to Computer (Medium) with the human as X and game 0', () => {
    const state = reducer(undefined, { type: '@@INIT' })
    expect(state.opponent).toBe('medium')
    expect(state.humanPlayer).toBe('X')
    expect(state.gameId).toBe(0)
  })

  /** Human X wins the top row against the computer (O plays 3 and 4). */
  function humanWins(state: GameState): GameState {
    state = cpu(play([0], state), 3)
    state = cpu(play([1], state), 4)
    return play([2], state)
  }

  test('restarting from the board increments gameId', () => {
    const won = play(X_ROW_WIN)
    expect(reducer(won, playMove(0)).gameId).toBe(won.gameId + 1)
  })

  test('setOpponent after a game clears the board, gives X the move, zeroes the score and starts a new game', () => {
    const won = play(X_ROW_WIN)
    const changed = reducer(won, setOpponent('medium'))
    expect(changed.opponent).toBe('medium')
    expect(changed.board).toEqual(Array(9).fill(null))
    expect(changed.currentPlayer).toBe('X')
    expect(changed.score).toEqual({ X: 0, O: 0, draws: 0 })
    expect(changed.gameId).toBe(won.gameId + 1)
  })

  test('setHumanPlayer after a game clears the board, gives X the move, zeroes the score and starts a new game', () => {
    const state = humanWins(vsComputer('X'))
    expect(state.score.X).toBe(1)
    const changed = reducer(state, setHumanPlayer('O'))
    expect(changed.humanPlayer).toBe('O')
    expect(changed.board).toEqual(Array(9).fill(null))
    expect(changed.currentPlayer).toBe('X')
    expect(changed.score).toEqual({ X: 0, O: 0, draws: 0 })
    expect(changed.gameId).toBe(state.gameId + 1)
  })

  test('selecting the current opponent or side again changes nothing', () => {
    const state = humanWins(vsComputer('X'))
    expect(reducer(state, setOpponent('hard'))).toBe(state)
    expect(reducer(state, setHumanPlayer('X'))).toBe(state)
  })

  test('opponent and side changes are refused while a game is in progress', () => {
    const midGame = play([4], vsComputer('X'))
    expect(reducer(midGame, setOpponent('easy'))).toBe(midGame)
    expect(reducer(midGame, setHumanPlayer('O'))).toBe(midGame)
    const twoPlayerMidGame = play([4, 0])
    expect(reducer(twoPlayerMidGame, setOpponent('hard'))).toBe(twoPlayerMidGame)
  })

  test('opponent and side changes are allowed on an empty board, even with the computer about to open', () => {
    const empty = vsComputer('O') // computer's opening move is pending
    expect(reducer(empty, setOpponent('easy')).opponent).toBe('easy')
    expect(reducer(empty, setHumanPlayer('X')).humanPlayer).toBe('X')
  })

  test('opponent and side changes are allowed after a draw', () => {
    const drawn = play(DRAW)
    expect(reducer(drawn, setOpponent('easy')).opponent).toBe('easy')
  })

  test('the side is kept through Easy → Human → Hard', () => {
    let state = vsComputer('O', 'easy')
    state = reducer(state, setOpponent('human'))
    expect(state.humanPlayer).toBe('O')
    state = reducer(state, setOpponent('hard'))
    expect(state.opponent).toBe('hard')
    expect(state.humanPlayer).toBe('O')
  })

  test.each(['X', 'O'] as const)('the human as %s cannot move on the computer turn', (side) => {
    // Human as X: after the human's first move it is O (computer). Human as O: X (computer) opens.
    const state = side === 'X' ? play([4], vsComputer('X')) : vsComputer('O')
    expect(state.currentPlayer).not.toBe(side)
    expect(reducer(state, playMove(0))).toBe(state)
  })

  test('computerMove places the computer mark and passes the turn back', () => {
    const state = cpu(play([4], vsComputer('X')), 0)
    expect(state.board[0]).toBe('O')
    expect(state.currentPlayer).toBe('X')
  })

  test('computerMove is refused on the human turn', () => {
    const state = vsComputer('X')
    expect(cpu(state, 0)).toBe(state)
  })

  test('computerMove is refused in two-player play', () => {
    const state = play([4])
    expect(cpu(state, 0)).toBe(state)
  })

  test('computerMove is refused after game over', () => {
    const state = humanWins(vsComputer('X'))
    expect(state.score.X).toBe(1)
    expect(cpu(state, 8)).toBe(state)
  })

  test('computerMove from an earlier game is refused, even when it is the computer turn again', () => {
    const before = vsComputer('O')
    const staleId = before.gameId
    const fresh = reducer(before, setOpponent('easy'))
    // The human is O, so on the fresh board it is the computer's turn again.
    expect(fresh.currentPlayer).toBe('X')
    expect(reducer(fresh, computerMove({ index: 4, gameId: staleId }))).toBe(fresh)
    expect(cpu(fresh, 4).board[4]).toBe('X')
  })

  test('a computer win updates the score', () => {
    // Human X: 0, 1, 8. Computer O: 3, 4, 5 (middle row).
    let state = vsComputer('X')
    for (const [human, computer] of [
      [0, 3],
      [1, 4],
      [8, 5],
    ]) {
      state = cpu(play([human], state), computer)
    }
    expect(state.score).toEqual({ X: 0, O: 1, draws: 0 })
  })

  test('a draw ending on a computer move updates the score', () => {
    // Human O; computer X plays the X moves of DRAW (0, 2, 3, 7, 8) and makes the last move.
    let state = vsComputer('O')
    DRAW.forEach((index, n) => {
      state = n % 2 === 0 ? cpu(state, index) : play([index], state)
    })
    expect(state.board.every((c) => c !== null)).toBe(true)
    expect(state.score).toEqual({ X: 0, O: 0, draws: 1 })
  })
})
