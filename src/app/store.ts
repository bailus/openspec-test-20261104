import { configureStore } from '@reduxjs/toolkit'
import gameReducer from '@/features/game/gameSlice'

export function makeStore() {
  return configureStore({
    reducer: {
      game: gameReducer,
    },
  })
}

export const store = makeStore()

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
