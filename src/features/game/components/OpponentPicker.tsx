import { useId } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { Label } from '@/components/ui/label'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { type Opponent, setHumanPlayer, setOpponent } from '../gameSlice'
import type { Player } from '../logic'
import { selectHumanPlayer, selectIsInProgress, selectOpponent } from '../selectors'

const OPPONENTS: readonly { value: Opponent; label: string }[] = [
  { value: 'human', label: 'Human' },
  { value: 'easy', label: 'Computer (Easy)' },
  { value: 'medium', label: 'Computer (Medium)' },
  { value: 'hard', label: 'Computer (Hard)' },
]

const SIDES: readonly { value: Player; label: string }[] = [
  { value: 'X', label: 'X' },
  { value: 'O', label: 'O' },
]

/**
 * Chooses the opponent and, against the computer, which mark the human plays.
 * Both controls are disabled while a game is in progress.
 */
export function OpponentPicker() {
  const dispatch = useAppDispatch()
  const opponent = useAppSelector(selectOpponent)
  const humanPlayer = useAppSelector(selectHumanPlayer)
  const locked = useAppSelector(selectIsInProgress)
  const id = useId()
  const selectId = `${id}-opponent`
  const sideLabelId = `${id}-side-label`

  return (
    <div className="opponent-picker">
      <div className="picker-group">
        <Label htmlFor={selectId} className="picker-label">
          Opponent
        </Label>
        <NativeSelect
          id={selectId}
          value={opponent}
          disabled={locked}
          onChange={(event) => {
            const option = OPPONENTS.find((o) => o.value === event.target.value)
            if (option) dispatch(setOpponent(option.value))
          }}
        >
          {OPPONENTS.map((option) => (
            <NativeSelectOption key={option.value} value={option.value}>
              {option.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>

      {opponent !== 'human' && (
        <div className="picker-group">
          <span id={sideLabelId} className="picker-label">
            You play
          </span>
          <RadioGroup
            className="picker-options"
            aria-labelledby={sideLabelId}
            value={humanPlayer}
            disabled={locked}
            onValueChange={(next) => {
              const side = SIDES.find((s) => s.value === next)
              if (side) dispatch(setHumanPlayer(side.value))
            }}
          >
            {SIDES.map((side) => (
              <div key={side.value} className="picker-option">
                <RadioGroupItem id={`${id}-side-${side.value}`} value={side.value} />
                <Label htmlFor={`${id}-side-${side.value}`}>{side.label}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      )}
    </div>
  )
}
