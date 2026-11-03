import { useComputerTurn } from '../useComputerTurn'
import { Board } from './Board'
import { OpponentPicker } from './OpponentPicker'
import { Scoreboard } from './Scoreboard'
import { Status } from './Status'
import './game.css'

export function Game() {
  useComputerTurn()

  return (
    <main className="game">
      <h1 className="game-title">Tic-tac-slop</h1>
      <OpponentPicker />
      <Status />
      <Board />
      <Scoreboard />
    </main>
  )
}
