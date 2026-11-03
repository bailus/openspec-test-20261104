import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { chooseComputerMove } from './ai'
import { computerMove } from './gameSlice'
import {
  selectBoard,
  selectCurrentPlayer,
  selectGameId,
  selectIsComputerTurn,
  selectOpponent,
} from './selectors'

/** Pause before the computer places its mark, so its move reads as a separate turn. */
export const COMPUTER_MOVE_DELAY_MS = 500

/**
 * Plays the computer's move after a short pause whenever it is the computer's turn.
 * A new game, or a change of opponent or side, changes the board and `gameId`, which
 * clears the pending timer; the reducer also rejects a move tagged with an old `gameId`.
 */
export function useComputerTurn(): void {
  const dispatch = useAppDispatch()
  const isComputerTurn = useAppSelector(selectIsComputerTurn)
  const board = useAppSelector(selectBoard)
  const player = useAppSelector(selectCurrentPlayer)
  const opponent = useAppSelector(selectOpponent)
  const gameId = useAppSelector(selectGameId)

  useEffect(() => {
    if (!isComputerTurn || opponent === 'human') return
    const timer = setTimeout(() => {
      const index = chooseComputerMove(board, player, opponent, Math.random)
      dispatch(computerMove({ index, gameId }))
    }, COMPUTER_MOVE_DELAY_MS)
    return () => clearTimeout(timer)
  }, [dispatch, isComputerTurn, board, player, opponent, gameId])
}
