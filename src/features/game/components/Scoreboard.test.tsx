import { screen, within } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { renderGame } from '@/test/renderGame'
import { DRAW, O_DIAGONAL_WIN, X_ROW_WIN } from './testMoves'

type User = ReturnType<typeof renderGame>['user']

const cells = () => screen.getAllByRole('button', { name: /^Row/ })

async function playAll(user: User, moves: number[]) {
  for (const i of moves) await user.click(cells()[i])
}

async function newGame(user: User) {
  await user.click(screen.getByRole('button', { name: 'New game' }))
}

function tallies() {
  const read = (key: string) =>
    Number(within(screen.getByTestId(`tally-${key}`)).getByRole('definition').textContent)
  return { X: read('x'), O: read('o'), draws: read('draws') }
}

describe('Scoreboard and New game', () => {
  test('starts at zero', () => {
    renderGame()
    expect(screen.getByRole('region', { name: 'Score' })).toBeInTheDocument()
    expect(tallies()).toEqual({ X: 0, O: 0, draws: 0 })
  })

  test('counts an X win, an O win and a draw', async () => {
    const { user } = renderGame()
    await playAll(user, X_ROW_WIN)
    expect(tallies()).toEqual({ X: 1, O: 0, draws: 0 })

    await newGame(user)
    await playAll(user, O_DIAGONAL_WIN)
    expect(tallies()).toEqual({ X: 1, O: 1, draws: 0 })

    await newGame(user)
    await playAll(user, DRAW)
    expect(tallies()).toEqual({ X: 1, O: 1, draws: 1 })
  })

  test('clicking after a draw leaves the score unchanged', async () => {
    const { user } = renderGame()
    await playAll(user, DRAW)
    await playAll(user, [0, 4, 8])
    expect(tallies()).toEqual({ X: 0, O: 0, draws: 1 })
  })

  test('New game after a finished game clears the board and highlight, and keeps the score', async () => {
    const { user } = renderGame()
    await playAll(user, X_ROW_WIN)
    await newGame(user)

    for (const cell of cells()) {
      expect(cell).toHaveTextContent('')
      expect(cell).not.toHaveAttribute('data-winning')
      expect(cell).not.toHaveAttribute('aria-disabled')
    }
    expect(screen.getByRole('status')).toHaveTextContent("X's turn")
    expect(tallies()).toEqual({ X: 1, O: 0, draws: 0 })
  })

  test('New game mid-game clears the board and keeps the score', async () => {
    const { user } = renderGame()
    await playAll(user, X_ROW_WIN)
    await newGame(user)
    await playAll(user, [4, 0, 8])
    await newGame(user)

    for (const cell of cells()) expect(cell).toHaveTextContent('')
    expect(screen.getByRole('status')).toHaveTextContent("X's turn")
    expect(tallies()).toEqual({ X: 1, O: 0, draws: 0 })
  })
})
