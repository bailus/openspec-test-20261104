import { describe, expect, test } from 'vitest'
import reducer, { type GameState, initialState, playMove } from './gameSlice'
import {
  selectIsDraw,
  selectIsGameOver,
  selectStatus,
  selectWinner,
  selectWinningLine,
} from './selectors'

function stateAfter(moves: number[]): { game: GameState } {
  return { game: moves.reduce((s, i) => reducer(s, playMove(i)), initialState) }
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
    expect(selectStatus(state)).toBe('X wins!')
  })

  test('an O diagonal win reports O and the diagonal', () => {
    // O takes 2, 4, 6
    const state = stateAfter([0, 2, 1, 4, 8, 6])
    expect(selectWinner(state)).toBe('O')
    expect(selectWinningLine(state)).toEqual([2, 4, 6])
    expect(selectStatus(state)).toBe('O wins!')
  })

  test('a full board with no line is a draw', () => {
    const state = stateAfter([0, 1, 2, 4, 3, 5, 7, 6, 8])
    expect(selectWinner(state)).toBeNull()
    expect(selectIsDraw(state)).toBe(true)
    expect(selectIsGameOver(state)).toBe(true)
    expect(selectStatus(state)).toBe("It's a draw")
  })

  test('selectors are memoized for an unchanged board', () => {
    const state = stateAfter([0, 3, 1, 4, 2])
    expect(selectWinningLine(state)).toBe(selectWinningLine({ game: { ...state.game } }))
  })
})
