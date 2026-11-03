import { useAppSelector } from '@/app/hooks'
import { selectStatus } from '../selectors'

export function Status() {
  const status = useAppSelector(selectStatus)
  return (
    <p className="status" role="status" aria-live="polite">
      {status}
    </p>
  )
}
