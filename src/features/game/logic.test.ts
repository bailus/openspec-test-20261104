import { describe, expect, test } from 'vitest'
import {
  type Cell,
  WINNING_LINES,
  calculateWinner,
  createEmptyBoard,
  isBoardFull,
} from './logic'

/** Builds a board from a 9-character string such as "XXO.O...X" ('.' is empty). */
function board(cells: string): Cell[] {
  return [...cells].map((c) => (c === '.' ? null : (c as Cell)))
}

describe('calculateWinner', () => {
  test('an empty board has no winner', () => {
    expect(calculateWinner(createEmptyBoard())).toBeNull()
  })

  test.each([
    ['top row', 'XXX......', [0, 1, 2]],
    ['middle row', '...XXX...', [3, 4, 5]],
    ['bottom row', '......XXX', [6, 7, 8]],
    ['left column', 'O..O..O..', [0, 3, 6]],
    ['middle column', '.O..O..O.', [1, 4, 7]],
    ['right column', '..O..O..O', [2, 5, 8]],
    ['main diagonal', 'X...X...X', [0, 4, 8]],
    ['anti-diagonal', '..O.O.O..', [2, 4, 6]],
  ])('detects a win on the %s', (_name, cells, line) => {
    const result = calculateWinner(board(cells))
    expect(result).toEqual({ winner: cells.replaceAll('.', '')[0], line })
  })

  test('covers exactly the eight winning lines', () => {
    expect(WINNING_LINES).toHaveLength(8)
  })

  test('returns null for a full board with no line (draw)', () => {
    const draw = board('XOXXOOOXX')
    expect(isBoardFull(draw)).toBe(true)
    expect(calculateWinner(draw)).toBeNull()
  })

  test('a ninth move that completes a line is a win, not a draw', () => {
    const full = board('XOXOXOOXX')
    expect(isBoardFull(full)).toBe(true)
    expect(calculateWinner(full)).toEqual({ winner: 'X', line: [0, 4, 8] })
  })

  test('two marks in a line are not a win', () => {
    expect(calculateWinner(board('XX.OO....'))).toBeNull()
  })
})

describe('isBoardFull', () => {
  test('is false for an empty board', () => {
    expect(isBoardFull(createEmptyBoard())).toBe(false)
  })

  test('is false while any cell is empty', () => {
    expect(isBoardFull(board('XOXOXOOX.'))).toBe(false)
  })
})
