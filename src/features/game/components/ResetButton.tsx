import { useAppSelector } from '@/app/hooks'
import { Button } from '@/components/ui/button'
import { selectBoard } from '../selectors'

interface ResetButtonProps {
  /** Dispatches the reset and moves focus away, as the button hides itself on an empty board. */
  onReset: () => void
}

/**
 * Clears the board. Hidden on an empty board, but kept in the layout so nothing moves when
 * it appears. The style is inline so that jsdom, which has no stylesheet, sees it too;
 * visibility: hidden also takes the button out of the Tab order and the accessibility tree.
 */
export function ResetButton({ onReset }: ResetButtonProps) {
  const isEmpty = useAppSelector(selectBoard).every((cell) => cell === null)

  return (
    <Button
      type="button"
      variant="outline"
      className="reset-button"
      style={isEmpty ? { visibility: 'hidden' } : undefined}
      onClick={onReset}
    >
      Reset
    </Button>
  )
}
