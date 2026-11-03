import { useAppDispatch } from '@/app/hooks'
import { Button } from '@/components/ui/button'
import { newGame } from '../gameSlice'

export function NewGameButton() {
  const dispatch = useAppDispatch()
  return (
    <Button type="button" onClick={() => dispatch(newGame())}>
      New game
    </Button>
  )
}
