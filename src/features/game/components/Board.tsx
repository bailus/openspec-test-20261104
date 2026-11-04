import type { Ref } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { playMove } from '../gameSlice'
import {
  selectBoard,
  selectIsComputerTurn,
  selectIsGameOver,
  selectWinningLine,
} from '../selectors'
import { Square } from './Square'

export function Board({ ref }: { ref?: Ref<HTMLDivElement> }) {
  const dispatch = useAppDispatch()
  const board = useAppSelector(selectBoard)
  const winningLine = useAppSelector(selectWinningLine)
  const isGameOver = useAppSelector(selectIsGameOver)
  const isComputerTurn = useAppSelector(selectIsComputerTurn)

  return (
    <div ref={ref} className="board" role="group" aria-label="Tic-tac-toe board">
      {board.map((value, index) => (
        <Square
          key={index}
          index={index}
          value={value}
          isWinning={winningLine?.includes(index) ?? false}
          isLocked={isComputerTurn}
          isGameOver={isGameOver}
          onSelect={(i) => dispatch(playMove(i))}
        />
      ))}
    </div>
  )
}
