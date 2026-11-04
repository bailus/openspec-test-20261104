import { screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { renderGame } from '@/test/renderGame'
import { X_ROW_WIN } from './testMoves'

const cells = () => screen.getAllByRole('button', { name: /^Row/ })

describe('keyboard play', () => {
  test('Tab reaches the first cell and Enter places a mark', async () => {
    const { user } = renderGame({ opponent: 'human' })
    // The game controls now sit below the score, so the board is the first Tab stop.
    await user.tab()
    expect(cells()[0]).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(cells()[0]).toHaveTextContent('X')
    expect(screen.getByRole('status')).toHaveTextContent("O's turn")
  })

  test('Space places a mark', async () => {
    const { user } = renderGame({ opponent: 'human' })
    await user.tab()
    await user.tab()
    expect(cells()[1]).toHaveFocus()
    await user.keyboard(' ')
    expect(cells()[1]).toHaveTextContent('X')
  })

  test('filled cells stay in the Tab order and Enter/Space on them changes nothing', async () => {
    const { user, store } = renderGame({ opponent: 'human' })
    await user.click(cells()[0])
    await user.click(cells()[1])

    ;(document.activeElement as HTMLElement).blur()
    await user.tab()
    expect(cells()[0]).toHaveFocus()
    const before = store.getState()
    await user.keyboard('{Enter}')
    await user.keyboard(' ')
    expect(store.getState()).toBe(before)

    await user.tab()
    expect(cells()[1]).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(store.getState()).toBe(before)
  })

  test('after game over every cell is reachable by Tab, and Space or Enter starts the next game', async () => {
    const { user, store } = renderGame({ opponent: 'human' })
    for (const i of X_ROW_WIN) await user.click(cells()[i])
    ;(document.activeElement as HTMLElement).blur()

    const before = store.getState()
    for (let i = 0; i < 9; i++) {
      await user.tab()
      expect(cells()[i]).toHaveFocus()
    }
    expect(store.getState()).toBe(before)
    expect(screen.getByRole('status')).toHaveTextContent('X wins!')

    await user.keyboard(' ')
    for (const cell of cells()) expect(cell).toHaveTextContent('')
    expect(screen.getByRole('status')).toHaveTextContent("X's turn")
  })
})
