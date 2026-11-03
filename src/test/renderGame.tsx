import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { makeStore } from '@/app/store'
import { Game } from '@/features/game/components/Game'

/** Renders <Game /> against a fresh store. */
export function renderGame() {
  const store = makeStore()
  const user = userEvent.setup()
  const utils = render(
    <Provider store={store}>
      <Game />
    </Provider>,
  )
  return { store, user, ...utils }
}
