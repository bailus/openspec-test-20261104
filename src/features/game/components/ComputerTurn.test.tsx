import { act, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { renderGame } from '@/test/renderGame'
import { computerMove, playMove, setHumanPlayer, setOpponent } from '../gameSlice'
import { COMPUTER_MOVE_DELAY_MS } from '../useComputerTurn'

const cells = () =>
  within(screen.getByRole('group', { name: 'Tic-tac-toe board' })).getAllByRole('button')
const marks = () => cells().map((c) => c.textContent ?? '')
const markCount = () => marks().filter(Boolean).length
const status = () => screen.getByRole('status')

/** Advances fake time inside act, so the computer's dispatch is flushed. */
async function advance(ms: number) {
  await act(async () => {
    vi.advanceTimersByTime(ms)
  })
}

/** Renders the game with fake timers; returns the store and a user wired to them. */
function setup() {
  return renderGame({ user: { advanceTimers: vi.advanceTimersByTime } })
}

beforeEach(() => {
  vi.useFakeTimers()
  // React Testing Library waits on a 0 ms timer after each user-event action, and only
  // advances fake timers for it when it finds a `jest` global. Give it Vitest's clock so
  // that wait resolves, while time otherwise moves only when a test calls `advance`.
  vi.stubGlobal('jest', { advanceTimersByTime: (ms: number) => vi.advanceTimersByTime(ms) })
  // Roll 0 everywhere: the strategy roll picks "perfect" on every difficulty, and the
  // tie-break picks the first of the best moves. The roll, not the difficulty, fixes the move.
  vi.spyOn(Math, 'random').mockReturnValue(0)
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('computer takes its turn', () => {
  test('replies after the delay and hands the turn back', async () => {
    const { user, store } = setup()
    act(() => {
      store.dispatch(setOpponent('easy'))
    })
    await user.click(cells()[4])
    expect(status()).toHaveTextContent("Computer's turn (O)")

    await advance(COMPUTER_MOVE_DELAY_MS - 1)
    expect(markCount()).toBe(1)

    await advance(1)
    // Best replies to a centre opening are the corners; roll 0 takes the first, cell 0.
    expect(marks()[0]).toBe('O')
    expect(markCount()).toBe(2)
    expect(status()).toHaveTextContent('Your turn (X)')
  })

  test("makes no move once the human's move ends the game", async () => {
    const { user, store } = setup()
    act(() => {
      store.dispatch(setOpponent('hard'))
      // Human X: 0, 1. Computer O: 3, 4. Human to move and can win at 2.
      for (const [human, computer] of [
        [0, 3],
        [1, 4],
      ]) {
        store.dispatch(playMove(human))
        store.dispatch(computerMove({ index: computer, gameId: store.getState().game.gameId }))
      }
    })
    await user.click(cells()[2])
    expect(status()).toHaveTextContent('You win! (X)')

    await advance(COMPUTER_MOVE_DELAY_MS * 4)
    expect(markCount()).toBe(5)
    expect(status()).toHaveTextContent('You win! (X)')
  })
})

describe("board during the computer's turn", () => {
  test('clicking an empty cell does nothing', async () => {
    const { user, store } = setup()
    act(() => {
      store.dispatch(setOpponent('medium'))
    })
    await user.click(cells()[4])
    await user.click(cells()[8])
    expect(marks()[8]).toBe('')
    for (const cell of cells()) expect(cell).toHaveAttribute('aria-disabled', 'true')

    await advance(COMPUTER_MOVE_DELAY_MS)
    expect(marks()[0]).toBe('O')
    expect(marks()[8]).toBe('')
    expect(markCount()).toBe(2)
    expect(cells()[8]).not.toHaveAttribute('aria-disabled')
  })

  test('every cell stays in the Tab order and keeps its label', async () => {
    const { user, store } = setup()
    act(() => {
      store.dispatch(setOpponent('hard'))
    })
    await user.click(cells()[4])
    expect(status()).toHaveTextContent("Computer's turn (O)")

    cells()[0].focus()
    for (let i = 0; i < 9; i++) {
      if (i > 0) await user.tab()
      expect(cells()[i]).toHaveFocus()
      expect(cells()[i]).not.toHaveAttribute('disabled')
    }
    expect(cells()[4]).toHaveAccessibleName('Row 2, column 2, X')
    expect(cells()[8]).toHaveAccessibleName('Row 3, column 3, empty')
  })
})

describe('computer as X and cancelled moves', () => {
  test('opens as X after the human switches to O', async () => {
    const { store } = setup()
    act(() => {
      store.dispatch(setOpponent('hard'))
      store.dispatch(setHumanPlayer('O'))
    })
    expect(status()).toHaveTextContent("Computer's turn (X)")

    await advance(COMPUTER_MOVE_DELAY_MS)
    expect(markCount()).toBe(1)
    expect(marks().filter((m) => m === 'X')).toHaveLength(1)
    expect(status()).toHaveTextContent('Your turn (O)')
  })

  test('opens as X again after a restart from the board', async () => {
    const { user, store } = setup()
    act(() => {
      store.dispatch(setOpponent('hard'))
      store.dispatch(setHumanPlayer('O'))
      // Computer X takes the top row (0, 1, 2); human O plays 3 and 4.
      for (const [computer, human] of [
        [0, 3],
        [1, 4],
      ]) {
        store.dispatch(computerMove({ index: computer, gameId: store.getState().game.gameId }))
        store.dispatch(playMove(human))
      }
      store.dispatch(computerMove({ index: 2, gameId: store.getState().game.gameId }))
    })
    expect(status()).toHaveTextContent('Computer wins (X) Click the board to play again.')

    await user.click(cells()[8])
    expect(markCount()).toBe(0)
    expect(status()).toHaveTextContent("Computer's turn (X)")

    await advance(COMPUTER_MOVE_DELAY_MS)
    expect(markCount()).toBe(1)
    expect(status()).toHaveTextContent('Your turn (O)')
  })

  // A computer move can only be pending while the options are unlocked when it is the
  // opening move on an empty board (human as O). Mid-game the options are disabled.
  test('switching to X before the opening move: the board stays empty', async () => {
    const { store } = setup()
    act(() => {
      store.dispatch(setOpponent('hard'))
      store.dispatch(setHumanPlayer('O'))
    })
    await advance(COMPUTER_MOVE_DELAY_MS - 100)
    act(() => {
      store.dispatch(setHumanPlayer('X'))
    })

    await advance(COMPUTER_MOVE_DELAY_MS * 4)
    expect(markCount()).toBe(0)
    expect(status()).toHaveTextContent('Your turn (X)')
  })

  test('changing difficulty before the opening move: empty at 499 ms and one X at 500 ms', async () => {
    const { store } = setup()
    act(() => {
      store.dispatch(setOpponent('hard'))
      store.dispatch(setHumanPlayer('O'))
    })
    await advance(COMPUTER_MOVE_DELAY_MS - 100)
    act(() => {
      store.dispatch(setOpponent('easy'))
    })

    await advance(COMPUTER_MOVE_DELAY_MS - 1)
    expect(markCount()).toBe(0)
    await advance(1)
    expect(markCount()).toBe(1)
    expect(marks().filter((m) => m === 'X')).toHaveLength(1)
  })
})
