import { useRef } from 'react'
import { useAppDispatch } from '@/app/hooks'
import { resetGame } from '../gameSlice'
import { useComputerTurn } from '../useComputerTurn'
import { Board } from './Board'
import { OpponentPicker } from './OpponentPicker'
import { ResetButton } from './ResetButton'
import { Scoreboard } from './Scoreboard'
import { Status } from './Status'
import './game.css'
import logoUrl from '@/assets/logo.svg'

export function Game() {
  useComputerTurn()
  const dispatch = useAppDispatch()
  const boardRef = useRef<HTMLDivElement>(null)

  const reset = () => {
    dispatch(resetGame())
    // The Reset button hides itself on the now-empty board, so give focus to the first cell.
    boardRef.current?.querySelector<HTMLButtonElement>('button')?.focus()
  }

  return (
    <main className="game">
      <header className="game-header">
        {/* Decorative: the title beside it names the app. The logo is solid black, so
            inverting it in dark mode makes it white. */}
        <img src={logoUrl} alt="" className="game-logo dark:invert" />
        <h1 className="game-title">Vibe-tac-slop</h1>
      </header>
      <Scoreboard />
      <Board ref={boardRef} />
      <Status />
      <ResetButton onReset={reset} />
      <OpponentPicker />
    </main>
  )
}
