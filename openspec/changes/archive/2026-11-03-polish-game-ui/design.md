# Design

## Context

The game is a React + Redux Toolkit app styled with shadcn/ui on Tailwind v4. A single `game` slice holds `board`, `currentPlayer`, `score`, `opponent`, `humanPlayer` and `gameId`, and the reducer is the only place that enforces the rules. Status text and score labels come from selectors in `selectors.ts`. `useComputerTurn` schedules the computer's move on a 500 ms timer and drops it when `board` or `gameId` changes. `src/index.css` already defines a full `.dark` palette and `@custom-variant dark (&:is(.dark *))`, but nothing sets the `.dark` class yet. Tests run in jsdom, where Vite's imported CSS files are not applied.

Requirements are in `specs/tic-tac-toe/spec.md`, `specs/computer-opponent/spec.md` and `specs/color-theme/spec.md`.

## Goals / Non-Goals

**Goals:**
- Keep the forfeit rule in the reducer, next to the other scoring rules.
- No layout shift from the Reset button, the hidden side switch, or status text that wraps.
- No flash of the wrong theme on load.

**Non-Goals:**
- No Redux state for the theme. It is a page-level preference, separate from the game.
- No live tracking of system theme changes after load.

## Decisions

**`resetGame` reducer.** A new action in `gameSlice`:
- Empty board: does nothing. The button is hidden then, and doing nothing avoids bumping `gameId`, which would restart the computer's pending opening move.
- Game in progress (`isInProgress`): the loser is `currentPlayer` in two-player play and `humanPlayer` against the computer. The reducer does `score[other(loser)] += 1`, sets `forfeitedBy = loser`, then calls `startNewGame`. Always charging the human against the computer means a reset during the computer's 500 ms pause can't be used to farm wins.
- Game over: `startNewGame` only, with `forfeitedBy = null`.

**Forfeit notice.** Add `forfeitedBy: Player | null` (default `null`) to `GameState`. Only a mid-game `resetGame` sets it. It is cleared by `playMove`, both when a human mark is placed and when a click restarts a finished game, and by `setOpponent`/`setHumanPlayer`. `computerMove` leaves it alone, so the notice survives the computer's opening move when the human plays O. `selectStatus` prefixes the normal status with `"You forfeited. "` against the computer, or `` `${forfeitedBy} forfeited. ` `` in two-player play. Because it is part of the same `role="status"` text, it is announced with no extra live region. *Alternative*: a transient toast. Rejected because it needs its own live region and dismissal timing.

**Focus after Reset.** `Game` keeps a ref to the board group and passes `onReset` to `ResetButton`. The handler dispatches `resetGame`, then focuses the board's first cell button. Cells are never hidden, so the target always exists, and focus moves before the button's `visibility: hidden` takes effect. *Alternative*: keep the button visible after a reset. Rejected because it goes against the requested hide-on-empty behaviour.

`startNewGame` already bumps `gameId` and clears the board, so `useComputerTurn` cancels any pending computer move and the reducer rejects a late one. No hook changes are needed. *Alternative*: compute the forfeit in the component and dispatch a separate scoring action. Rejected because it splits the rules across layers.

**Status wording.** Remove the `(${mark})` suffixes from the four computer-mode strings. Two-player strings (`X's turn`, `X wins!`) stay as they are: there the mark is the only way to tell the players apart, which is the "absolutely necessary" case. Score labels change to `You` and `Opponent`, and the tally keys `you` and `opponent` stay.

**Side switch.** Add the shadcn `switch` component (`npx shadcn@latest add switch`, built on the existing `radix-ui` package). Remove `radio-group` in the same task that stops importing it. Markup:

```
<span id=label>You play as</span>
<span aria-hidden onClick→X>X</span> <Switch aria-label="You play as O" checked={human==='O'}/> <span aria-hidden onClick→O>O</span>
```

The switch carries the accessible name and state. The X and O text is decorative for assistive technology but clickable, and its click handlers are ignored while the controls are locked. "On = O" fits a switch's left-off/right-on visual convention. *Alternative*: a two-button segmented control. Rejected because the user asked for a switch.

**Reserving space without showing.** The side group (when the opponent is Human) and the Reset button (on an empty board) are always rendered, with an inline `style={{ visibility: 'hidden' }}`. Visibility hidden keeps the layout box but removes the element from the tab order and the accessibility tree. It is set inline rather than through a CSS class so that jsdom's `toBeVisible` and `getByRole` see it in tests. In the picker, the side group comes first in the DOM, so on-screen order and keyboard order match.

**Layout order.** In `Game`: header, score, board, status, Reset, picker. With the picker last, the board's first cell is the first Tab stop, and the side switch and drop-down follow the board (and the Reset button when it is shown). The status changes to roughly `0.95rem` at weight 500, with `min-height: 2lh`, so a result plus the play-again hint that wraps onto two lines at 360px does not push the Reset button and the score down. The Reset button is a shadcn `Button` with the `outline` variant, centred.

**Header and logo.** `Game` renders a `<header>` with the logo then the `<h1>`, as a left-justified flex row capped at the board's `22rem` width so its left edge lines up with the board. The logo is one `<img src="/logo.svg">` with `dark:invert`. The artwork is solid black, so inverting it gives white. Tailwind's `dark` variant keys off the `.dark` class on `<html>`, so the colour follows the theme switch and the pre-paint script with no JavaScript. It has `alt=""` because the heading already names the app. *Alternatives*: a second `logo-dark.svg` swapped in with `dark:hidden` / `hidden dark:block`, rejected because it is one more asset to keep in step; a `prefers-color-scheme` rule inside the SVG, rejected because it follows the system rather than the app's switch; and choosing `src` in React, rejected because it needs shared theme state and would flash on load.

**Favicon.** `public/favicon.svg` is the logo with its strokes and fill set to `currentColor`, and an embedded `<style>` sets `color` to black, or to white under `@media (prefers-color-scheme: dark)`. Browsers draw the tab icon outside the page, so it cannot see the `.dark` class; the system preference is the only signal available. The mask that cuts the logo's gaps keeps literal black and white, since it shapes the artwork rather than colouring it.

**Controls row.** `.opponent-picker` uses `justify-content: space-between`, so the side group sits at the left edge and the Opponent drop-down at the right edge of the board's width. When the side group is hidden for two-player play it still takes its space, so the drop-down stays on the right.

**Scoreboard.** Drop the `CardHeader`/`CardTitle`, and give the `Card` `aria-label="Score"` in place of `aria-labelledby`. Tests that query `region` by name `Score` keep working. Unlayered rules on `.scoreboard` in `game.css` remove the card's border, shadow, background and block padding, overriding the Card's Tailwind utilities, so it reads as plain tallies under the title. The `Card` stays as the region wrapper rather than being swapped for a `<section>`, to keep the change to styling only.

**Theme.**
- `index.html` gets a small inline `<script>` in `<head>`. It reads `localStorage.theme` (`'light' | 'dark'`), falls back to `matchMedia('(prefers-color-scheme: dark)')`, and toggles `.dark` on `<html>` before first paint. The script is wrapped in try/catch for when storage is blocked.
- `ThemeToggle` (`src/components/ThemeToggle.tsx`) reads its starting state from `document.documentElement.classList`. On change it toggles the class and writes `localStorage.theme`. It renders a shadcn `Switch` with `aria-label="Dark mode"`, between decorative sun and moon `lucide-react` icons, in a `position: fixed; top/right: 0.75rem` wrapper, and is mounted from `App`.
- Add `color-scheme: dark` under `.dark` (and `light` under `:root`) so the native `<select>` popup and scrollbars match the theme.

*Alternative*: a React context or Redux theme slice. That is overkill for one boolean with no other readers.

## Risks / Trade-offs

- [Against the computer, the human is charged even when they reset during the computer's turn, which can feel harsh] → This is intentional. It closes the reset-to-farm-wins loophole and was chosen by the requester.
- [At 360px the fixed theme switch could crowd the centred title] → Keep the switch compact (icons rather than text), and allow for it with top padding on `.game` if they overlap. Check at 360px during implementation.
- [The inline script is duplicated logic outside React] → It is a few lines. `ThemeToggle` reads the class the script set rather than recomputing it, so they cannot disagree.
- [Tests that match the old strings (`(X)`, `Your wins`, the `radiogroup` role, the `Score` heading) will fail] → Update them in the same change. The task list names the files.

## Migration Plan

Client-only, with no stored data to migrate apart from the new `localStorage.theme` key. Roll back by reverting the commit. A leftover `theme` key is harmless.
