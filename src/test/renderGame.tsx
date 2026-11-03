import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { makeStore } from '@/app/store'
import { Game } from '@/features/game/components/Game'
import { type Opponent, setOpponent } from '@/features/game/gameSlice'

export interface RenderGameOptions {
  /** Opponent to select before rendering. The app's default is Computer (Medium). */
  opponent?: Opponent
  /** user-event options, such as `{ advanceTimers: vi.advanceTimersByTime }` with fake timers. */
  user?: Parameters<typeof userEvent.setup>[0]
}

/** Renders <Game /> against a fresh store. */
export function renderGame({ opponent, user: userOptions }: RenderGameOptions = {}) {
  const store = makeStore()
  if (opponent) store.dispatch(setOpponent(opponent))
  const user = userEvent.setup(userOptions)
  const utils = render(
    <Provider store={store}>
      <Game />
    </Provider>,
  )
  return { store, user, ...utils }
}
