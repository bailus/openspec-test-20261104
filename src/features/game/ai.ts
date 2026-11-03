import { type Board, type Cell, type Player, WINNING_LINES, calculateWinner, isBoardFull } from './logic'

/** Computer strength. Each one is a weighted mix of the three strategies. */
export type Difficulty = 'easy' | 'medium' | 'hard'

/** Source of randomness: returns a number in [0, 1), like `Math.random`. */
export type Rng = () => number

export type Strategy = 'perfect' | 'tactical' | 'random'

/** Order in which `pickStrategy` lays out the cumulative thresholds. */
export const STRATEGY_ORDER: readonly Strategy[] = ['perfect', 'tactical', 'random']

/**
 * Chance of each strategy per move, by difficulty, in whole percent. Each row sums to 100.
 * Whole numbers keep the cumulative thresholds exact (0.01 + 0.09 is not 0.1 in floating point).
 */
export const DIFFICULTY_WEIGHTS: Readonly<Record<Difficulty, Readonly<Record<Strategy, number>>>> = {
  easy: { perfect: 1, tactical: 9, random: 90 },
  medium: { perfect: 10, tactical: 50, random: 40 },
  hard: { perfect: 40, tactical: 50, random: 10 },
}

function opponentOf(player: Player): Player {
  return player === 'X' ? 'O' : 'X'
}

function emptyCells(board: Board): number[] {
  const cells: number[] = []
  board.forEach((cell, index) => {
    if (cell === null) cells.push(index)
  })
  return cells
}

/** Picks one item uniformly at random. `items` must not be empty. */
function pickOne<T>(items: readonly T[], rng: Rng): T {
  const index = Math.min(items.length - 1, Math.floor(rng() * items.length))
  return items[index]
}

/** Any empty cell, each equally likely. Throws if the board is full. */
export function randomMove(board: Board, rng: Rng): number {
  const empty = emptyCells(board)
  if (empty.length === 0) throw new Error('randomMove: the board has no empty cells')
  return pickOne(empty, rng)
}

/** The empty cell that completes a line of three for `player`, if there is one. */
function completingCell(board: Board, player: Player): number | null {
  for (const line of WINNING_LINES) {
    const marks = line.filter((i) => board[i] === player).length
    const empty = line.filter((i) => board[i] === null)
    if (marks === 2 && empty.length === 1) return empty[0]
  }
  return null
}

/** Win if possible, otherwise block the opponent's line, otherwise a random empty cell. */
export function tacticalMove(board: Board, player: Player, rng: Rng): number {
  return (
    completingCell(board, player) ??
    completingCell(board, opponentOf(player)) ??
    randomMove(board, rng)
  )
}

/**
 * Value of the position for `player`, who is to move, against best play.
 * Positive is a win, negative a loss, 0 a draw. The size shrinks by one per
 * ply, so a faster win scores higher and a slower loss scores less badly.
 * Keyed by board and player; tic-tac-toe has fewer than 6,000 positions.
 */
const positionValues = new Map<string, number>()

function positionKey(board: Board, player: Player): string {
  return board.map((cell) => cell ?? '-').join('') + player
}

function moveScore(board: Board, index: number, player: Player): number {
  const next: Cell[] = [...board]
  next[index] = player
  if (calculateWinner(next)) return 10
  if (isBoardFull(next)) return 0
  const reply = positionValue(next, opponentOf(player))
  const score = -reply
  return score - Math.sign(score)
}

function positionValue(board: Board, player: Player): number {
  const key = positionKey(board, player)
  const cached = positionValues.get(key)
  if (cached !== undefined) return cached

  let best = -Infinity
  for (const index of emptyCells(board)) {
    best = Math.max(best, moveScore(board, index, player))
  }
  positionValues.set(key, best)
  return best
}

/**
 * Every move for `player` that ties for the best result against best play.
 * Returns an empty list when the game is already over.
 */
export function bestMoves(board: Board, player: Player): number[] {
  if (calculateWinner(board) || isBoardFull(board)) return []

  let best = -Infinity
  let moves: number[] = []
  for (const index of emptyCells(board)) {
    const score = moveScore(board, index, player)
    if (score > best) {
      best = score
      moves = [index]
    } else if (score === best) {
      moves.push(index)
    }
  }
  return moves
}

/** One of the best moves, picked at random so play varies between games. */
export function perfectMove(board: Board, player: Player, rng: Rng): number {
  const moves = bestMoves(board, player)
  if (moves.length === 0) throw new Error('perfectMove: the game is already over')
  return pickOne(moves, rng)
}

/** Maps one roll in [0, 1) to a strategy using cumulative thresholds. */
export function pickStrategy(difficulty: Difficulty, roll: number): Strategy {
  const weights = DIFFICULTY_WEIGHTS[difficulty]
  let percent = 0
  for (const strategy of STRATEGY_ORDER) {
    percent += weights[strategy]
    if (roll < percent / 100) return strategy
  }
  return STRATEGY_ORDER[STRATEGY_ORDER.length - 1]
}

/** Rolls a strategy for this difficulty, then lets that strategy pick the cell. */
export function chooseComputerMove(
  board: Board,
  player: Player,
  difficulty: Difficulty,
  rng: Rng,
): number {
  switch (pickStrategy(difficulty, rng())) {
    case 'perfect':
      return perfectMove(board, player, rng)
    case 'tactical':
      return tacticalMove(board, player, rng)
    case 'random':
      return randomMove(board, rng)
  }
}
