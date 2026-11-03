import { Button } from '@/components/ui/button'
import type { Cell } from '../logic'

interface SquareProps {
  index: number
  value: Cell
  isWinning: boolean
  /** True during the computer's turn, when no cell can be played. */
  isLocked: boolean
  /** True once the game is won or drawn: any cell then starts the next game. */
  isGameOver: boolean
  onSelect: (index: number) => void
}

function cellLabel(index: number, value: Cell): string {
  const row = Math.floor(index / 3) + 1
  const column = (index % 3) + 1
  return `Row ${row}, column ${column}, ${value ?? 'empty'}`
}

export function Square({ index, value, isWinning, isLocked, isGameOver, onSelect }: SquareProps) {
  // Never use `disabled`: it removes the cell from the Tab order. The reducer ignores
  // occupied cells mid-game and every cell on the computer's turn, and turns a click on a
  // finished board into the next game, so after game over every cell is active again.
  const inactive = isLocked || (value !== null && !isGameOver)

  return (
    <Button
      type="button"
      variant="outline"
      className="square"
      aria-label={cellLabel(index, value)}
      aria-disabled={inactive || undefined}
      data-winning={isWinning || undefined}
      data-mark={value ?? undefined}
      onClick={() => onSelect(index)}
    >
      <span aria-hidden="true">{value}</span>
    </Button>
  )
}
