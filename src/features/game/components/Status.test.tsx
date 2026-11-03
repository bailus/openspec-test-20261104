import { screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { renderGame } from '@/test/renderGame'
import { DRAW, O_DIAGONAL_WIN, X_ROW_WIN } from './testMoves'

async function playAll(user: ReturnType<typeof renderGame>['user'], moves: number[]) {
  for (const i of moves) await user.click(screen.getAllByRole('button', { name: /^Row/ })[i])
}

describe('Status', () => {
  test('is a polite live region', () => {
    renderGame({ opponent: 'human' })
    const status = screen.getByRole('status')
    expect(status).toHaveAttribute('aria-live', 'polite')
  })

  test("shows whose turn it is, starting with X", async () => {
    const { user } = renderGame({ opponent: 'human' })
    expect(screen.getByRole('status')).toHaveTextContent("X's turn")
    await playAll(user, [4])
    expect(screen.getByRole('status')).toHaveTextContent("O's turn")
    await playAll(user, [0])
    expect(screen.getByRole('status')).toHaveTextContent("X's turn")
  })

  test('announces an X win', async () => {
    const { user } = renderGame({ opponent: 'human' })
    await playAll(user, X_ROW_WIN)
    expect(screen.getByRole('status')).toHaveTextContent('X wins!')
  })

  test('announces an O win', async () => {
    const { user } = renderGame({ opponent: 'human' })
    await playAll(user, O_DIAGONAL_WIN)
    expect(screen.getByRole('status')).toHaveTextContent('O wins!')
  })

  test('announces a draw with the play-again hint, until a cell starts the next game', async () => {
    const { user } = renderGame({ opponent: 'human' })
    await playAll(user, DRAW)
    expect(screen.getByRole('status')).toHaveTextContent(
      "It's a draw. Click the board to play again.",
    )
    await playAll(user, [4])
    expect(screen.getByRole('status')).toHaveTextContent("X's turn")
  })
})
