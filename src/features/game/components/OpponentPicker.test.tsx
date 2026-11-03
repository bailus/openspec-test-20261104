import { act, screen, within } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { renderGame } from '@/test/renderGame'
import { computerMove, playMove } from '../gameSlice'
import { X_ROW_WIN } from './testMoves'

const opponentSelect = () => screen.getByRole('combobox', { name: 'Opponent' })
const sideGroup = () => screen.queryByRole('radiogroup', { name: 'You play' })
const side = (mark: 'X' | 'O') => within(sideGroup()!).getByRole('radio', { name: mark })
const cells = () =>
  within(screen.getByRole('group', { name: 'Tic-tac-toe board' })).getAllByRole('button')
const scoreRows = () =>
  within(screen.getByRole('region', { name: 'Score' }))
    .getAllByRole('term')
    .map((term) => `${term.textContent}: ${term.nextElementSibling?.textContent}`)

/**
 * Presses and then releases an arrow key as two steps. Radix moves focus on a timer after
 * keydown and selects the option only if the key is still down, as it is in a browser;
 * user-event's one-step `{ArrowRight}` releases the key before that timer runs.
 */
async function arrow(user: ReturnType<typeof renderGame>['user'], key: string) {
  await user.keyboard(`{${key}>}`)
  await user.keyboard(`{/${key}}`)
}

/** Plays a human-X win over the computer (computer O on 3 and 4) through the store. */
function humanWinsThroughStore(store: ReturnType<typeof renderGame>['store']) {
  act(() => {
    for (const [human, computer] of [
      [0, 3],
      [1, 4],
    ]) {
      store.dispatch(playMove(human))
      store.dispatch(computerMove({ index: computer, gameId: store.getState().game.gameId }))
    }
    store.dispatch(playMove(2))
  })
}

describe('OpponentPicker', () => {
  test('is a drop-down of four opponents with Computer (Medium) selected by default', () => {
    renderGame()
    const select = opponentSelect()
    expect(
      within(select)
        .getAllByRole('option')
        .map((o) => o.textContent),
    ).toEqual(['Human', 'Computer (Easy)', 'Computer (Medium)', 'Computer (Hard)'])
    expect(select).toHaveValue('medium')
    expect(within(select).getByRole('option', { name: 'Computer (Medium)' })).toHaveProperty(
      'selected',
      true,
    )
    expect(screen.getByRole('status')).toHaveTextContent('Your turn (X)')
  })

  test('shows the side choice, X first, against the computer and hides it for Human', async () => {
    const { user } = renderGame()
    expect(side('X')).toBeChecked()
    expect(side('O')).not.toBeChecked()

    await user.selectOptions(opponentSelect(), 'Human')
    expect(sideGroup()).toBeNull()
    expect(screen.getByRole('status')).toHaveTextContent("X's turn")
  })

  test('choosing an opponent after a game clears the board and zeroes the score', async () => {
    const { user, store } = renderGame({ opponent: 'human' })
    for (const i of X_ROW_WIN) await user.click(cells()[i])
    expect(scoreRows()[0]).toBe('X wins: 1')

    await user.selectOptions(opponentSelect(), 'Computer (Hard)')
    expect(store.getState().game.opponent).toBe('hard')
    for (const cell of cells()) expect(cell).toHaveTextContent('')
    expect(scoreRows()).toEqual(['Your wins: 0', 'Opponent wins: 0', 'Draws: 0'])
    expect(screen.getByRole('status')).toHaveTextContent('Your turn (X)')
  })

  test('choosing a side after a game clears the board and zeroes the score', async () => {
    const { user, store } = renderGame()
    humanWinsThroughStore(store)
    expect(scoreRows()[0]).toBe('Your wins: 1')

    await user.click(side('O'))
    expect(store.getState().game.humanPlayer).toBe('O')
    for (const cell of cells()) expect(cell).toHaveTextContent('')
    expect(scoreRows()).toEqual(['Your wins: 0', 'Opponent wins: 0', 'Draws: 0'])
    expect(screen.getByRole('status')).toHaveTextContent("Computer's turn (X)")
  })

  test('both controls are disabled once the first mark is placed', async () => {
    const { user, store } = renderGame()
    await user.click(cells()[4])
    expect(opponentSelect()).toBeDisabled()
    expect(side('X')).toBeDisabled()
    expect(side('O')).toBeDisabled()

    await user.selectOptions(opponentSelect(), 'Human').catch(() => {})
    await user.click(side('O'))
    expect(store.getState().game.opponent).toBe('medium')
    expect(store.getState().game.humanPlayer).toBe('X')
  })

  test('both controls are enabled on an empty board, even before the computer opens', async () => {
    const { user } = renderGame()
    expect(opponentSelect()).toBeEnabled()
    await user.click(side('O')) // the computer's opening move is now pending
    expect(cells().every((c) => !c.textContent)).toBe(true)
    expect(opponentSelect()).toBeEnabled()
    expect(side('X')).toBeEnabled()
  })

  test('both controls are enabled again once the game ends', async () => {
    const { store } = renderGame()
    humanWinsThroughStore(store)
    expect(screen.getByRole('status')).toHaveTextContent('You win! (X)')
    expect(opponentSelect()).toBeEnabled()
    expect(side('O')).toBeEnabled()
  })

  test('is keyboard-operable: Tab reaches the drop-down, then the side choice', async () => {
    const { user, store } = renderGame()
    await user.tab()
    expect(opponentSelect()).toHaveFocus()
    // jsdom has no native drop-down UI; selectOptions fires the same change event a
    // keyboard choice does in a browser.
    await user.selectOptions(opponentSelect(), 'Computer (Easy)')
    expect(store.getState().game.opponent).toBe('easy')

    await user.tab()
    expect(side('X')).toHaveFocus()
    await arrow(user, 'ArrowRight')
    expect(side('O')).toBeChecked()
    expect(store.getState().game.humanPlayer).toBe('O')
  })

  test('the side is kept when switching Easy → Human → Hard', async () => {
    const { user } = renderGame()
    await user.selectOptions(opponentSelect(), 'Computer (Easy)')
    await user.click(side('O'))
    await user.selectOptions(opponentSelect(), 'Human')
    await user.selectOptions(opponentSelect(), 'Computer (Hard)')
    expect(side('O')).toBeChecked()
    expect(screen.getByRole('status')).toHaveTextContent("Computer's turn (X)")
  })
})
