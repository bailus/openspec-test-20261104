import { describe, expect, test, vi } from 'vitest'
import {
  DIFFICULTY_WEIGHTS,
  type Difficulty,
  type Rng,
  STRATEGY_ORDER,
  bestMoves,
  chooseComputerMove,
  perfectMove,
  pickStrategy,
  randomMove,
  tacticalMove,
} from './ai'
import { type Cell, type Player, calculateWinner, createEmptyBoard, isBoardFull } from './logic'

/** Builds a board from a 9-character string such as 'XO-|-X-|--O' ('|' and spaces ignored). */
function board(layout: string): Cell[] {
  const chars = layout.replace(/[|\s]/g, '')
  if (chars.length !== 9) throw new Error(`bad layout: ${layout}`)
  return [...chars].map((c) => (c === 'X' || c === 'O' ? c : null))
}

/** An rng that returns the given values in order, then repeats the last one. */
function rolls(...values: number[]): Rng {
  let i = 0
  return () => values[Math.min(i++, values.length - 1)]
}

const other = (p: Player): Player => (p === 'X' ? 'O' : 'X')

describe('randomMove', () => {
  const b = board('X-O|-X-|O--') // empty cells: 1, 3, 5, 7, 8

  test('maps the roll uniformly onto the empty cells', () => {
    const empty = [1, 3, 5, 7, 8]
    empty.forEach((cell, k) => {
      expect(randomMove(b, rolls((k + 0.5) / empty.length))).toBe(cell)
    })
    expect(randomMove(b, rolls(0))).toBe(1)
    expect(randomMove(b, rolls(0.999999))).toBe(8)
  })

  test('never returns an occupied cell', () => {
    for (let r = 0; r < 1; r += 0.01) {
      expect(b[randomMove(b, rolls(r))]).toBeNull()
    }
  })

  test('throws on a full board', () => {
    expect(() => randomMove(board('XOX|XOO|OXX'), rolls(0))).toThrow()
  })
})

describe('tacticalMove', () => {
  test('completes its own line rather than blocking', () => {
    // O can win at 5 (middle row); X threatens 2 (top row).
    expect(tacticalMove(board('XX-|OO-|X--'), 'O', rolls(0))).toBe(5)
  })

  test('blocks a row', () => {
    expect(tacticalMove(board('XX-|-O-|---'), 'O', rolls(0))).toBe(2)
  })

  test('blocks a column', () => {
    expect(tacticalMove(board('X--|XO-|---'), 'O', rolls(0))).toBe(6)
  })

  test('blocks a diagonal', () => {
    expect(tacticalMove(board('O-X|-X-|---'), 'O', rolls(0))).toBe(6)
  })

  test('falls back to a random empty cell when there is no threat', () => {
    const b = board('X--|-O-|---') // empty: 1, 2, 3, 5, 6, 7, 8
    expect(tacticalMove(b, 'O', rolls(0))).toBe(1)
    expect(tacticalMove(b, 'O', rolls(0.999))).toBe(8)
  })
})

describe('perfect play', () => {
  test('takes an immediate win', () => {
    expect(bestMoves(board('OO-|XX-|X--'), 'O')).toEqual([2])
    expect(perfectMove(board('OO-|XX-|X--'), 'O', rolls(0.7))).toBe(2)
  })

  test('blocks an immediate threat', () => {
    expect(bestMoves(board('XX-|-O-|---'), 'O')).toEqual([2])
  })

  test('avoids the opposite-corners fork by playing an edge', () => {
    // A corner reply here lets X fork and win; only the edges hold the draw.
    expect(bestMoves(board('X--|-O-|--X'), 'O')).toEqual([1, 3, 5, 7])
  })

  test('picks among tied best moves with the rng', () => {
    const b = board('X--|-O-|--X')
    expect(perfectMove(b, 'O', rolls(0))).toBe(1)
    expect(perfectMove(b, 'O', rolls(0.999))).toBe(7)
  })

  test('returns no moves once the game is over', () => {
    expect(bestMoves(board('XXX|OO-|---'), 'O')).toEqual([])
    expect(() => perfectMove(board('XXX|OO-|---'), 'O', rolls(0))).toThrow()
  })

  test('perfect vs perfect always draws, over every tied choice', () => {
    let endings = 0
    function explore(b: Cell[], toMove: Player) {
      if (calculateWinner(b) || isBoardFull(b)) {
        expect(calculateWinner(b)).toBeNull()
        endings++
        return
      }
      for (const m of bestMoves(b, toMove)) {
        const next = [...b]
        next[m] = toMove
        explore(next, other(toMove))
      }
    }
    explore(createEmptyBoard(), 'X')
    expect(endings).toBeGreaterThan(0)
  })

  test.each<Player>(['X', 'O'])(
    'never loses as %s against any sequence of human moves',
    (computer) => {
      let endings = 0
      function explore(b: Cell[], toMove: Player) {
        const result = calculateWinner(b)
        if (result || isBoardFull(b)) {
          expect(result?.winner).not.toBe(other(computer))
          endings++
          return
        }
        const moves =
          toMove === computer
            ? bestMoves(b, toMove)
            : b.flatMap((cell, i) => (cell === null ? [i] : []))
        for (const m of moves) {
          const next = [...b]
          next[m] = toMove
          explore(next, other(toMove))
        }
      }
      explore(createEmptyBoard(), 'X')
      expect(endings).toBeGreaterThan(0)
    },
  )

  test('searches from an empty board within the time budget', async () => {
    vi.resetModules()
    const fresh = await import('./ai')
    const start = performance.now()
    fresh.bestMoves(createEmptyBoard(), 'X')
    expect(performance.now() - start).toBeLessThan(200)
  })
})

describe('difficulty mix', () => {
  test.each(Object.keys(DIFFICULTY_WEIGHTS) as Difficulty[])(
    '%s weights sum to 100%%',
    (difficulty) => {
      const w = DIFFICULTY_WEIGHTS[difficulty]
      expect(w.perfect + w.tactical + w.random).toBe(100)
    },
  )

  test('weights match the specified mix', () => {
    expect(DIFFICULTY_WEIGHTS).toEqual({
      easy: { perfect: 1, tactical: 9, random: 90 },
      medium: { perfect: 10, tactical: 50, random: 40 },
      hard: { perfect: 40, tactical: 50, random: 10 },
    })
    expect(STRATEGY_ORDER).toEqual(['perfect', 'tactical', 'random'])
  })

  const boundaries: [Difficulty, number, number][] = [
    // Easy's tactical end, 0.1, is exactly where 0.01 + 0.09 would drift to 0.09999999999999999.
    ['easy', 0.01, 0.1],
    ['medium', 0.1, 0.6],
    ['hard', 0.4, 0.9],
  ]

  test.each(boundaries)(
    '%s maps rolls to strategies at the cumulative thresholds',
    (difficulty, perfectEnd, tacticalEnd) => {
      const eps = 1e-9
      expect(pickStrategy(difficulty, 0)).toBe('perfect')
      expect(pickStrategy(difficulty, perfectEnd - eps)).toBe('perfect')
      expect(pickStrategy(difficulty, perfectEnd)).toBe('tactical')
      expect(pickStrategy(difficulty, tacticalEnd - eps)).toBe('tactical')
      expect(pickStrategy(difficulty, tacticalEnd)).toBe('random')
      expect(pickStrategy(difficulty, 1 - eps)).toBe('random')
    },
  )
})

describe('chooseComputerMove', () => {
  // O to move. X threatens 2 (top row), so perfect and tactical both block at 2.
  // Random picks from the empty cells [2, 3, 5, 6, 7, 8] using the second roll.
  const b = board('XX-|-O-|---')

  test('uses the strategy selected by the first roll', () => {
    // hard: roll 0.1 → perfect, then 0.999 for the tie-break (only one best move)
    expect(chooseComputerMove(b, 'O', 'hard', rolls(0.1, 0.999))).toBe(2)
    // hard: roll 0.5 → tactical (blocks at 2)
    expect(chooseComputerMove(b, 'O', 'hard', rolls(0.5, 0.999))).toBe(2)
    // hard: roll 0.95 → random, second roll 0.999 → last empty cell
    expect(chooseComputerMove(b, 'O', 'hard', rolls(0.95, 0.999))).toBe(8)
    // easy: roll 0.6 → random, second roll 0 → first empty cell
    expect(chooseComputerMove(b, 'O', 'easy', rolls(0.6, 0))).toBe(2)
    // easy: roll 0.6 → random, second roll 0.5 → index 3 of the empties → 6
    expect(chooseComputerMove(b, 'O', 'easy', rolls(0.6, 0.5))).toBe(6)
  })

  test('tactical and perfect differ where a fork must be prevented', () => {
    // Opposite corners: tactical (no threat) falls back to random; perfect plays an edge.
    const fork = board('X--|-O-|--X') // empty: 1, 2, 3, 5, 6, 7
    // medium: roll 0.2 → tactical → random fallback, roll 0.3 → index 1 of empties → 2 (a corner)
    expect(chooseComputerMove(fork, 'O', 'medium', rolls(0.2, 0.3))).toBe(2)
    // medium: roll 0.05 → perfect, roll 0.3 → index 1 of [1, 3, 5, 7] → 3 (an edge)
    expect(chooseComputerMove(fork, 'O', 'medium', rolls(0.05, 0.3))).toBe(3)
  })
})
