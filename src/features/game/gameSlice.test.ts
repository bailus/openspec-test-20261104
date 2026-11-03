import { describe, expect, test } from 'vitest'
import reducer, { type GameState, initialState, newGame, playMove } from './gameSlice'

/** Applies a sequence of moves starting from `state` (or a fresh game). */
function play(moves: number[], state: GameState = initialState): GameState {
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

  test('locks the board after a win', () => {
    const won = play(X_ROW_WIN)
    const after = reducer(won, playMove(8))
    expect(after).toBe(won)
    expect(after.board[8]).toBeNull()
    expect(after.score).toEqual({ X: 1, O: 0, draws: 0 })
  })

  test('locks the board after a draw', () => {
    const drawn = play(DRAW)
    expect(drawn.board.every((c) => c !== null)).toBe(true)
    for (let i = 0; i < 9; i++) {
      expect(reducer(drawn, playMove(i))).toBe(drawn)
    }
    expect(drawn.score).toEqual({ X: 0, O: 0, draws: 1 })
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

  test('newGame clears the board, gives X the move and keeps the score', () => {
    const won = play(X_ROW_WIN)
    const fresh = reducer(won, newGame())
    expect(fresh.board).toEqual(Array(9).fill(null))
    expect(fresh.currentPlayer).toBe('X')
    expect(fresh.score).toEqual({ X: 1, O: 0, draws: 0 })
  })

  test('newGame mid-game keeps the score', () => {
    const scored = play(DRAW)
    const midGame = play([4, 0], reducer(scored, newGame()))
    const reset = reducer(midGame, newGame())
    expect(reset.board).toEqual(Array(9).fill(null))
    expect(reset.currentPlayer).toBe('X')
    expect(reset.score).toEqual({ X: 0, O: 0, draws: 1 })
  })
})
