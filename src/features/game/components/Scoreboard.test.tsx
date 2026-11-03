import { act, screen, within } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { renderGame } from '@/test/renderGame'
import { computerMove, playMove, setHumanPlayer } from '../gameSlice'
import { DRAW, O_DIAGONAL_WIN, X_ROW_WIN } from './testMoves'

type User = ReturnType<typeof renderGame>['user']

const cells = () => screen.getAllByRole('button', { name: /^Row/ })

async function playAll(user: User, moves: number[]) {
  for (const i of moves) await user.click(cells()[i])
}

/** Starts the next game the only way there is: selecting a cell on the finished board. */
async function restart(user: User) {
  await user.click(cells()[0])
}

/** Reads the tallies as `label: value` rows, in display order. */
function rows() {
  return within(screen.getByRole('region', { name: 'Score' }))
    .getAllByRole('term')
    .map((term) => `${term.textContent}: ${term.nextElementSibling?.textContent}`)
}

describe('Scoreboard and restarting', () => {
  test('starts at zero with mark-based labels in two-player play', () => {
    renderGame({ opponent: 'human' })
    expect(screen.getByRole('region', { name: 'Score' })).toBeInTheDocument()
    expect(rows()).toEqual(['X wins: 0', 'O wins: 0', 'Draws: 0'])
  })

  test('counts an X win, an O win and a draw', async () => {
    const { user } = renderGame({ opponent: 'human' })
    await playAll(user, X_ROW_WIN)
    expect(rows()).toEqual(['X wins: 1', 'O wins: 0', 'Draws: 0'])

    await restart(user)
    await playAll(user, O_DIAGONAL_WIN)
    expect(rows()).toEqual(['X wins: 1', 'O wins: 1', 'Draws: 0'])

    await restart(user)
    await playAll(user, DRAW)
    expect(rows()).toEqual(['X wins: 1', 'O wins: 1', 'Draws: 1'])
  })

  test('the play-again hint follows the result', async () => {
    const { user } = renderGame({ opponent: 'human' })
    await playAll(user, X_ROW_WIN)
    expect(screen.getByRole('status')).toHaveTextContent('X wins! Click the board to play again.')
  })

  test('restarting after a draw clears the board and keeps the score', async () => {
    const { user } = renderGame({ opponent: 'human' })
    await playAll(user, DRAW)
    await restart(user)

    for (const cell of cells()) {
      expect(cell).toHaveTextContent('')
      expect(cell).not.toHaveAttribute('data-winning')
      expect(cell).not.toHaveAttribute('aria-disabled')
    }
    expect(screen.getByRole('status')).toHaveTextContent("X's turn")
    expect(rows()).toEqual(['X wins: 0', 'O wins: 0', 'Draws: 1'])
  })

  test('Enter on a cell after the game ends starts the next game', async () => {
    const { user } = renderGame({ opponent: 'human' })
    await playAll(user, X_ROW_WIN)
    cells()[5].focus()
    await user.keyboard('{Enter}')
    for (const cell of cells()) expect(cell).toHaveTextContent('')
    expect(rows()).toEqual(['X wins: 1', 'O wins: 0', 'Draws: 0'])
  })

  test('selecting an occupied cell mid-game does not restart', async () => {
    const { user } = renderGame({ opponent: 'human' })
    await playAll(user, [4, 0])
    await user.click(cells()[4])
    expect(cells()[4]).toHaveTextContent('X')
    expect(cells()[0]).toHaveTextContent('O')
  })

  test('the title reads "Tic-tac-slop" and there is no "New game" button', () => {
    renderGame()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Tic-tac-slop')
    expect(screen.queryByRole('button', { name: 'New game' })).toBeNull()
  })

  test('against the computer the labels follow the human side', () => {
    const { store } = renderGame() // default: Computer (Medium), human X
    expect(rows()).toEqual(['Your wins: 0', 'Opponent wins: 0', 'Draws: 0'])

    // Human X wins the top row; computer O played 3 and 4.
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
    expect(rows()).toEqual(['Your wins: 1', 'Opponent wins: 0', 'Draws: 0'])

    // Switching side after the game resets the score; the human is now O.
    act(() => {
      store.dispatch(setHumanPlayer('O'))
    })
    expect(rows()).toEqual(['Your wins: 0', 'Opponent wins: 0', 'Draws: 0'])
  })
})
