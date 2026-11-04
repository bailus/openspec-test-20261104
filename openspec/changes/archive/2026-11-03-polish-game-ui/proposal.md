# Proposal

## Why

The game screen has picked up some clutter and rough edges: redundant labels and headings, mark letters repeated in brackets in the status, a pair of radio buttons for what is really a two-way toggle, and no way to abandon a game that has gone wrong. There is also no dark mode. This change tidies the screen, adds a light/dark switch, and adds a Reset button that ends the current game as a forfeit.

## What Changes

- **Side control**: the "You play" label becomes **"You play as"**, and the X/O radio buttons become a single switch with an **X** label on its left and an **O** label on its right.
- **Control order**: "You play as" now comes first, at the left edge, and **Opponent** second, at the right edge (previously Opponent first, with both packed to the left). Both controls move from above the board to the bottom of the page, below the Reset button.
- **Header**: the logo (`/logo.svg`) sits to the left of the title and is shown in white in dark mode. The logo and title are left-aligned to the width of the board instead of centred.
- **Tab icon**: `favicon.svg` becomes the logo, black on light system themes and white on dark ones.
- **Score**: the score moves to the top, directly under the title, as plain tallies: the card's "Score" heading, border, shadow and background are removed. Against the computer the tallies are labelled **"You"**, **"Opponent"** and **"Draws"** (previously "Your wins" and "Opponent wins"). Two-player labels stay "X wins", "O wins" and "Draws".
- **Status wording**: the bracketed mark is dropped against the computer: "Your turn", "Computer's turn", "You win!", "Computer wins". Two-player status still names the mark ("X's turn", "O wins!") because there it is the only way to tell the players apart.
- **Status placement**: the status moves from above the board to directly below it, in smaller text.
- **Reset button** (new): a button under the board, below the status, that clears the board and starts a new game with the same opponent and side.
  - It is hidden while the board is empty, but still takes up its space so nothing shifts when it appears.
  - **BREAKING**: a game in progress can now be abandoned, and doing so counts as a forfeit. In two-player play the **player whose turn it is** loses. Against the computer **the human always loses**, whoever's turn it is. Resetting a finished game only clears the board and leaves the score alone.
  - After a forfeit, the status opens with a notice, "X forfeited." in two-player play or "You forfeited." against the computer. Screen readers announce it, and it stays until a person next places a mark.
  - After Reset, keyboard focus moves to the first board cell, because the button hides itself once the board is empty.
- **Light/dark mode** (new): a switch fixed to the top-right corner of the page toggles between light and dark themes. On a first visit the theme follows the operating system's preference; after that the user's choice is remembered in the browser and reused on reload.
- **Name**: the app is renamed from "Tic-tac-slop" to **"Vibe-tac-slop"**, in both the page heading and the browser tab title. The npm package name changes from `tic-tac-toe` to `vibe-tac-slop` to match.

Assumptions (minor, not confirmed with the requester):
- The side switch is "on" when the human plays O. Clicking the X or O label also selects that side.
- When the opponent is Human and the side switch is hidden, it keeps its space so the Opponent drop-down does not jump sideways (the same no-layout-shift rule the user asked for on the Reset button).
- The tab icon can only follow the system colour scheme, not the app's light/dark switch, because browsers render it outside the page.
- The score card keeps the accessible name "Score" for screen readers even though the visible heading is gone.
- The forfeit notice is worded "X forfeited." / "You forfeited.", and the computer's opening move does not clear it.

Out of scope: a confirmation prompt before reset, theme choices beyond light and dark, and any change to the computer's strategies.

## Capabilities

### New Capabilities
- `color-theme`: the light/dark switch, its starting value from the system preference, remembering the user's choice, and the logo following the theme.

### Modified Capabilities
- `tic-tac-toe`:
  - "New game" now allows a game in progress to be ended with the Reset button.
  - "Running score" counts a mid-game reset as a win for the other side (two-player) or for the computer.
  - "Responsive layout" adds the Reset button space and the theme switch to what must fit at 360px.
  - New "Reset button" requirement: the button below the board, hidden but keeping its space on an empty board, with focus moving to the board after use.
  - New "Reset forfeits a game in progress" requirement: who loses, and the forfeit notice in the status.
  - New "Screen layout" requirement: the order is header, score, board, status, Reset and controls. The header is left-aligned, the two controls sit at opposite edges, and the score has no visible heading, border or background.
  - New "App title" requirement: the page heading and browser tab read "Vibe-tac-slop", with the logo before the heading and as the tab icon.
- `computer-opponent`:
  - "Human side selection" becomes a switch labelled "You play as", shown before the opponent drop-down.
  - "Options locked during a game" refers to the switch rather than the X/O choice.
  - "Status text against the computer" drops the bracketed mark and allows for the forfeit notice.
  - "Score labels against the computer" becomes "You", "Opponent" and "Draws".

## Impact

- `src/features/game/gameSlice.ts`: a new `resetGame` action that scores a forfeit when a game is in progress, then starts a new game, and a new `forfeitedBy` state field for the notice.
- `src/features/game/selectors.ts`: status wording, the forfeit notice and score labels.
- Components: `OpponentPicker` (switch, labels, order, reserved space), `Scoreboard` (no heading), `Status` (styling), `Game` (order, Reset button), a new `ResetButton`, a new `ThemeToggle`, and `game.css`.
- New shadcn/ui `switch` component added through the shadcn CLI (uses the existing `radix-ui` dependency). `radio-group` becomes unused and is removed.
- `index.html`: the `<title>` becomes "Vibe-tac-slop", and a small inline script that applies the saved or system theme before first paint, to avoid a flash of the wrong theme. `src/index.css` already defines the `.dark` palette.
- Tests: selector, reducer and component tests that check the old wording, the radio group or the "Score" heading need updating; new tests for reset and the theme switch. README update, including its heading.
- `package.json` and `package-lock.json`: package name `vibe-tac-slop`.
- `public/logo.svg`: the logo, shown in a new header in `Game`.
- `public/favicon.svg`: rewritten as the logo, with its own light/dark colours.
