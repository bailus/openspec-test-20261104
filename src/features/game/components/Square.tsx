import { Button } from '@/components/ui/button'
import type { Cell } from '../logic'

interface SquareProps {
  index: number
  value: Cell
  isWinning: boolean
  /** True when the board is locked because the game is over. */
  isLocked: boolean
  onSelect: (index: number) => void
}

function cellLabel(index: number, value: Cell): string {
  const row = Math.floor(index / 3) + 1
  const column = (index % 3) + 1
  return `Row ${row}, column ${column}, ${value ?? 'empty'}`
}

export function Square({ index, value, isWinning, isLocked, onSelect }: SquareProps) {
  // Never use `disabled`: it removes the cell from the Tab order. The reducer
  // ignores moves on occupied cells and after game over.
  const inactive = value !== null || isLocked

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
