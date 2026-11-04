import { act, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { renderGame } from '@/test/renderGame'
import { setHumanPlayer } from '../gameSlice'
import { COMPUTER_MOVE_DELAY_MS } from '../useComputerTurn'
import { X_ROW_WIN } from './testMoves'

type User = ReturnType<typeof renderGame>['user']

const cells = () =>
  within(screen.getByRole('group', { name: 'Tic-tac-toe board' })).getAllByRole('button')
const marks = () => cells().map((c) => c.textContent ?? '')
const resetButton = () => screen.getByRole('button', { name: 'Reset' })
const queryResetButton = () => screen.queryByRole('button', { name: 'Reset' })
const status = () => screen.getByRole('status')
const rows = () =>
  within(screen.getByRole('region', { name: 'Score' }))
    .getAllByRole('term')
    .map((term) => `${term.textContent}: ${term.nextElementSibling?.textContent}`)

async function playAll(user: User, moves: number[]) {
  for (const i of moves) await user.click(cells()[i])
}

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('Reset button', () => {
  test('is hidden on load but keeps its place in the layout', () => {
    renderGame()
    expect(queryResetButton()).toBeNull()
    const hidden = screen.getByText('Reset')
    expect(hidden).toHaveStyle({ visibility: 'hidden' })
  })

  test('appears once the first mark is placed', async () => {
    const { user } = renderGame({ opponent: 'human' })
    await user.click(cells()[4])
    expect(resetButton()).toBeVisible()
  })

  test('two-player mid-game reset: the player to move forfeits', async () => {
    const { user } = renderGame({ opponent: 'human' })
    await playAll(user, [4]) // O to move
    await user.click(resetButton())
    expect(marks().every((m) => m === '')).toBe(true)
    expect(rows()).toEqual(['X wins: 1', 'O wins: 0', 'Draws: 0'])
    expect(status()).toHaveTextContent("O forfeited. X's turn")
    expect(queryResetButton()).toBeNull()
  })

  test('against the computer, a reset on your turn is your loss', async () => {
    vi.useFakeTimers()
    vi.stubGlobal('jest', { advanceTimersByTime: (ms: number) => vi.advanceTimersByTime(ms) })
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const { user } = renderGame({ user: { advanceTimers: vi.advanceTimersByTime } })
    await user.click(cells()[0])
    await act(async () => {
      vi.advanceTimersByTime(COMPUTER_MOVE_DELAY_MS)
    })
    expect(status()).toHaveTextContent('Your turn')
    await user.click(resetButton())
    expect(rows()).toEqual(['You: 0', 'Opponent: 1', 'Draws: 0'])
    expect(status()).toHaveTextContent('You forfeited. Your turn')
  })

  test("a reset during the computer's delay is still your loss, and its move never lands", async () => {
    vi.useFakeTimers()
    vi.stubGlobal('jest', { advanceTimersByTime: (ms: number) => vi.advanceTimersByTime(ms) })
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const { user } = renderGame({ user: { advanceTimers: vi.advanceTimersByTime } })
    await user.click(cells()[4])
    expect(status()).toHaveTextContent("Computer's turn")
    await user.click(resetButton())
    await act(async () => {
      vi.runAllTimers()
    })
    expect(marks().every((m) => m === '')).toBe(true)
    expect(rows()).toEqual(['You: 0', 'Opponent: 1', 'Draws: 0'])
    expect(status()).toHaveTextContent('You forfeited. Your turn')
  })

  test('is hidden while the computer is about to open, and the notice survives its move', async () => {
    vi.useFakeTimers()
    vi.stubGlobal('jest', { advanceTimersByTime: (ms: number) => vi.advanceTimersByTime(ms) })
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const { user, store } = renderGame({ user: { advanceTimers: vi.advanceTimersByTime } })
    act(() => {
      store.dispatch(setHumanPlayer('O'))
    })
    expect(queryResetButton()).toBeNull()
    await act(async () => {
      vi.advanceTimersByTime(COMPUTER_MOVE_DELAY_MS)
    })
    await user.click(resetButton())
    expect(status()).toHaveTextContent("You forfeited. Computer's turn")
    expect(queryResetButton()).toBeNull()
    await act(async () => {
      vi.advanceTimersByTime(COMPUTER_MOVE_DELAY_MS)
    })
    expect(marks().filter(Boolean)).toEqual(['X'])
    expect(status()).toHaveTextContent('You forfeited. Your turn')
  })

  test('after a finished game it only clears the board', async () => {
    const { user } = renderGame({ opponent: 'human' })
    await playAll(user, X_ROW_WIN)
    await user.click(resetButton())
    expect(marks().every((m) => m === '')).toBe(true)
    expect(rows()).toEqual(['X wins: 1', 'O wins: 0', 'Draws: 0'])
    expect(status()).toHaveTextContent("X's turn")
    expect(status()).not.toHaveTextContent('forfeited')
  })

  test('the notice clears once a person places a mark', async () => {
    const { user } = renderGame({ opponent: 'human' })
    await playAll(user, [4])
    await user.click(resetButton())
    await user.click(cells()[0])
    expect(status()).toHaveTextContent("O's turn")
    expect(status()).not.toHaveTextContent('forfeited')
  })

  test('activating it with the keyboard moves focus to the first cell', async () => {
    const { user } = renderGame({ opponent: 'human' })
    await playAll(user, [4, 0])
    resetButton().focus()
    await user.keyboard('{Enter}')
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Row 1, column 1, empty' }))
  })
})
