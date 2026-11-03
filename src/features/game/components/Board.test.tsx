import { screen, within } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { renderGame } from '@/test/renderGame'

function cells() {
  return within(screen.getByRole('group', { name: 'Tic-tac-toe board' })).getAllByRole('button')
}

describe('Board and Square', () => {
  test('starts with nine empty cells in a 3×3 grid', () => {
    renderGame()
    const all = cells()
    expect(all).toHaveLength(9)
    expect(all[0]).toHaveAccessibleName('Row 1, column 1, empty')
    expect(all[5]).toHaveAccessibleName('Row 2, column 3, empty')
    expect(all[8]).toHaveAccessibleName('Row 3, column 3, empty')
    for (const cell of all) expect(cell).toHaveTextContent('')
  })

  test('clicking cells places alternating X and O marks', async () => {
    const { user } = renderGame()
    await user.click(cells()[4])
    expect(cells()[4]).toHaveTextContent('X')
    expect(cells()[4]).toHaveAccessibleName('Row 2, column 2, X')

    await user.click(cells()[1])
    expect(cells()[1]).toHaveTextContent('O')
    expect(cells()[1]).toHaveAccessibleName('Row 1, column 2, O')

    await user.click(cells()[0])
    expect(cells()[0]).toHaveTextContent('X')
  })

  test('clicking an occupied cell does nothing', async () => {
    const { user, store } = renderGame()
    await user.click(cells()[4])
    const before = store.getState()
    await user.click(cells()[4])
    expect(store.getState()).toBe(before)
    expect(cells()[4]).toHaveTextContent('X')
    expect(screen.getByRole('status')).toHaveTextContent("O's turn")
  })

  test('occupied cells use aria-disabled and never the disabled attribute', async () => {
    const { user } = renderGame()
    await user.click(cells()[4])
    expect(cells()[4]).toHaveAttribute('aria-disabled', 'true')
    expect(cells()[4]).not.toHaveAttribute('disabled')
    expect(cells()[0]).not.toHaveAttribute('aria-disabled')
  })

  test('after a win, the winning cells are highlighted and every cell is locked', async () => {
    const { user } = renderGame()
    // X: 0, 1, 2 (top row); O: 3, 4
    for (const i of [0, 3, 1, 4, 2]) await user.click(cells()[i])

    const all = cells()
    expect(all.filter((c) => c.dataset.winning === 'true').map((c) => all.indexOf(c))).toEqual([
      0, 1, 2,
    ])
    for (const cell of all) {
      expect(cell).toHaveAttribute('aria-disabled', 'true')
      expect(cell).not.toHaveAttribute('disabled')
    }

    await user.click(all[8])
    expect(cells()[8]).toHaveTextContent('')
  })

  test('a column win highlights that column', async () => {
    const { user } = renderGame()
    // X: 0, 2, 6; O: 1, 4, 7 (middle column)
    for (const i of [0, 1, 2, 4, 6, 7]) await user.click(cells()[i])
    const winning = cells()
      .map((c, i) => (c.dataset.winning === 'true' ? i : -1))
      .filter((i) => i >= 0)
    expect(winning).toEqual([1, 4, 7])
    expect(screen.getByRole('status')).toHaveTextContent('O wins!')
  })
})
