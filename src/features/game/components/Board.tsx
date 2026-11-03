import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { playMove } from '../gameSlice'
import { selectBoard, selectIsGameOver, selectWinningLine } from '../selectors'
import { Square } from './Square'

export function Board() {
  const dispatch = useAppDispatch()
  const board = useAppSelector(selectBoard)
  const winningLine = useAppSelector(selectWinningLine)
  const isGameOver = useAppSelector(selectIsGameOver)

  return (
    <div className="board" role="group" aria-label="Tic-tac-toe board">
      {board.map((value, index) => (
        <Square
          key={index}
          index={index}
          value={value}
          isWinning={winningLine?.includes(index) ?? false}
          isLocked={isGameOver}
          onSelect={(i) => dispatch(playMove(i))}
        />
      ))}
    </div>
  )
}
