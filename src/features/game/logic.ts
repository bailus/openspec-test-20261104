export type Player = 'X' | 'O'
export type Cell = Player | null
export type Board = readonly Cell[]
export type Line = readonly [number, number, number]

export interface WinResult {
  winner: Player
  line: Line
}

export const BOARD_SIZE = 9

/** The eight winning lines on a row-major 3×3 board: rows, columns, diagonals. */
export const WINNING_LINES: readonly Line[] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
]

export function createEmptyBoard(): Cell[] {
  return Array<Cell>(BOARD_SIZE).fill(null)
}

export function calculateWinner(board: Board): WinResult | null {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line
    const mark = board[a]
    if (mark && mark === board[b] && mark === board[c]) {
      return { winner: mark, line }
    }
  }
  return null
}

export function isBoardFull(board: Board): boolean {
  return board.every((cell) => cell !== null)
}

export function isValidIndex(index: number): boolean {
  return Number.isInteger(index) && index >= 0 && index < BOARD_SIZE
}
