import { useId } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { Label } from '@/components/ui/label'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Switch } from '@/components/ui/switch'
import { type Opponent, setHumanPlayer, setOpponent } from '../gameSlice'
import type { Player } from '../logic'
import { selectHumanPlayer, selectIsInProgress, selectOpponent } from '../selectors'

const OPPONENTS: readonly { value: Opponent; label: string }[] = [
  { value: 'human', label: 'Human' },
  { value: 'easy', label: 'Computer (Easy)' },
  { value: 'medium', label: 'Computer (Medium)' },
  { value: 'hard', label: 'Computer (Hard)' },
]

/**
 * Chooses which mark the human plays against the computer, then the opponent.
 * Both controls are disabled while a game is in progress.
 */
export function OpponentPicker() {
  const dispatch = useAppDispatch()
  const opponent = useAppSelector(selectOpponent)
  const humanPlayer = useAppSelector(selectHumanPlayer)
  const locked = useAppSelector(selectIsInProgress)
  const id = useId()
  const selectId = `${id}-opponent`
  const sideHidden = opponent === 'human'

  const chooseSide = (side: Player) => {
    if (!locked) dispatch(setHumanPlayer(side))
  }

  return (
    <div className="opponent-picker">
      {/*
        Hidden rather than removed for two-player play, so the Opponent drop-down keeps its
        place. Inline so tests (jsdom, no stylesheet) see it too; visibility: hidden also
        takes the switch out of the Tab order and the accessibility tree.
      */}
      <div
        className="picker-group"
        style={sideHidden ? { visibility: 'hidden' } : undefined}
      >
        <span className="picker-label">You play as</span>
        <div className="side-switch" data-disabled={locked || undefined}>
          {/* The X and O text is a mouse shortcut; the switch carries the name and state. */}
          <span aria-hidden="true" className="side-mark" onClick={() => chooseSide('X')}>
            X
          </span>
          <Switch
            aria-label="You play as O"
            checked={humanPlayer === 'O'}
            disabled={locked}
            onCheckedChange={(checked) => chooseSide(checked ? 'O' : 'X')}
          />
          <span aria-hidden="true" className="side-mark" onClick={() => chooseSide('O')}>
            O
          </span>
        </div>
      </div>

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
    </div>
  )
}
