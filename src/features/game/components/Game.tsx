import { Board } from './Board'
import { NewGameButton } from './NewGameButton'
import { Scoreboard } from './Scoreboard'
import { Status } from './Status'
import './game.css'

export function Game() {
  return (
    <main className="game">
      <h1 className="game-title">Tic-tac-toe</h1>
      <Status />
      <Board />
      <div className="game-controls">
        <NewGameButton />
      </div>
      <Scoreboard />
    </main>
  )
}
