import { act, screen, within } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { renderGame } from '@/test/renderGame'
import { computerMove, playMove } from '../gameSlice'
import { X_ROW_WIN } from './testMoves'

const opponentSelect = () => screen.getByRole('combobox', { name: 'Opponent' })
const sideSwitch = () => screen.getByRole('switch', { name: 'You play as O' })
const querySideSwitch = () => screen.queryByRole('switch', { name: 'You play as O' })
/** The clickable X or O beside the switch (hidden from assistive technology). */
const sideMark = (mark: 'X' | 'O') =>
  screen.getByText(mark, { selector: '.side-mark', ignore: false })
const cells = () =>
  within(screen.getByRole('group', { name: 'Tic-tac-toe board' })).getAllByRole('button')
const scoreRows = () =>
  within(screen.getByRole('region', { name: 'Score' }))
    .getAllByRole('term')
    .map((term) => `${term.textContent}: ${term.nextElementSibling?.textContent}`)

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
    expect(screen.getByRole('status')).toHaveTextContent('Your turn')
  })

  test('shows the "You play as" switch, off (X), against the computer and hides it for Human', async () => {
    const { user } = renderGame()
    expect(screen.getByText('You play as')).toBeVisible()
    expect(sideSwitch()).not.toBeChecked()

    await user.selectOptions(opponentSelect(), 'Human')
    expect(querySideSwitch()).toBeNull()
    expect(screen.getByText('You play as')).not.toBeVisible()
    expect(screen.getByRole('status')).toHaveTextContent("X's turn")
  })

  test('the side group keeps its place for Human, so the drop-down does not move', async () => {
    const { user } = renderGame()
    const group = screen.getByText('You play as').parentElement!
    await user.selectOptions(opponentSelect(), 'Human')
    expect(group).toBeInTheDocument()
    expect(group).toHaveStyle({ visibility: 'hidden' })
    expect(group.compareDocumentPosition(opponentSelect()) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  test('choosing an opponent after a game clears the board and zeroes the score', async () => {
    const { user, store } = renderGame({ opponent: 'human' })
    for (const i of X_ROW_WIN) await user.click(cells()[i])
    expect(scoreRows()[0]).toBe('X wins: 1')

    await user.selectOptions(opponentSelect(), 'Computer (Hard)')
    expect(store.getState().game.opponent).toBe('hard')
    for (const cell of cells()) expect(cell).toHaveTextContent('')
    expect(scoreRows()).toEqual(['You: 0', 'Opponent: 0', 'Draws: 0'])
    expect(screen.getByRole('status')).toHaveTextContent('Your turn')
  })

  test('choosing a side after a game clears the board and zeroes the score', async () => {
    const { user, store } = renderGame()
    humanWinsThroughStore(store)
    expect(scoreRows()[0]).toBe('You: 1')

    await user.click(sideSwitch())
    expect(store.getState().game.humanPlayer).toBe('O')
    expect(sideSwitch()).toBeChecked()
    for (const cell of cells()) expect(cell).toHaveTextContent('')
    expect(scoreRows()).toEqual(['You: 0', 'Opponent: 0', 'Draws: 0'])
    expect(screen.getByRole('status')).toHaveTextContent("Computer's turn")
  })

  test('clicking the O and X letters selects that side', async () => {
    const { user, store } = renderGame()
    await user.click(sideMark('O'))
    expect(store.getState().game.humanPlayer).toBe('O')
    expect(sideSwitch()).toBeChecked()
    await user.click(sideMark('X'))
    expect(store.getState().game.humanPlayer).toBe('X')
    expect(sideSwitch()).not.toBeChecked()
  })

  test('both controls are disabled once the first mark is placed', async () => {
    const { user, store } = renderGame()
    await user.click(cells()[4])
    expect(opponentSelect()).toBeDisabled()
    expect(sideSwitch()).toBeDisabled()

    await user.selectOptions(opponentSelect(), 'Human').catch(() => {})
    await user.click(sideSwitch())
    await user.click(sideMark('O'))
    expect(store.getState().game.opponent).toBe('medium')
    expect(store.getState().game.humanPlayer).toBe('X')
  })

  test('both controls are enabled on an empty board, even before the computer opens', async () => {
    const { user } = renderGame()
    expect(opponentSelect()).toBeEnabled()
    await user.click(sideSwitch()) // the computer's opening move is now pending
    expect(cells().every((c) => !c.textContent)).toBe(true)
    expect(opponentSelect()).toBeEnabled()
    expect(sideSwitch()).toBeEnabled()
  })

  test('both controls are enabled again once the game ends', async () => {
    const { store } = renderGame()
    humanWinsThroughStore(store)
    expect(screen.getByRole('status')).toHaveTextContent('You win!')
    expect(opponentSelect()).toBeEnabled()
    expect(sideSwitch()).toBeEnabled()
  })

  test('is keyboard-operable: Tab reaches the side switch, then the drop-down', async () => {
    const { user, store } = renderGame()
    // The controls follow the board; on an empty board the Reset button is hidden, so the
    // next stop after the last cell is the side switch.
    cells()[8].focus()
    await user.tab()
    expect(sideSwitch()).toHaveFocus()
    await user.keyboard(' ')
    expect(sideSwitch()).toBeChecked()
    expect(store.getState().game.humanPlayer).toBe('O')

    await user.tab()
    expect(opponentSelect()).toHaveFocus()
    // jsdom has no native drop-down UI; selectOptions fires the same change event a
    // keyboard choice does in a browser.
    await user.selectOptions(opponentSelect(), 'Computer (Easy)')
    expect(store.getState().game.opponent).toBe('easy')
  })

  test('the side is kept when switching Easy → Human → Hard', async () => {
    const { user } = renderGame()
    await user.selectOptions(opponentSelect(), 'Computer (Easy)')
    await user.click(sideSwitch())
    await user.selectOptions(opponentSelect(), 'Human')
    await user.selectOptions(opponentSelect(), 'Computer (Hard)')
    expect(sideSwitch()).toBeChecked()
    expect(screen.getByRole('status')).toHaveTextContent("Computer's turn")
  })
})
