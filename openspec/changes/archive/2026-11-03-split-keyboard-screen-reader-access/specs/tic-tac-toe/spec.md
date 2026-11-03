# Spec Delta

## ADDED Requirements

### Requirement: Keyboard access
Each cell SHALL be a focusable control that the keyboard can activate. Cells SHALL stay focusable when they are occupied, after the game ends and during the computer's turn, so their contents can still be reached. Activating an occupied cell during a game, or any cell during the computer's turn, has no effect; activating any cell after the game ends starts a new game.

#### Scenario: Keyboard play
- **WHEN** it is a person's turn and a keyboard user focuses an empty cell and presses Enter or Space
- **THEN** the current player's mark is placed in that cell

#### Scenario: Occupied cells stay reachable
- **WHEN** a keyboard user presses Tab through the board after some cells are filled, or after the game has ended
- **THEN** every cell receives focus, including filled ones
- **AND** pressing Enter or Space on a filled cell during a game changes nothing

#### Scenario: Keyboard restart
- **WHEN** the game has ended and a keyboard user presses Enter or Space on any cell
- **THEN** a new game starts with an empty board

### Requirement: Screen-reader access
Each cell SHALL have an accessible label giving its row, its column and its contents (X, O or empty). Status changes SHALL be announced to assistive technology.

#### Scenario: Cell labels
- **WHEN** a screen reader user moves to the cell in row 1, column 2
- **THEN** it is announced as "Row 1, column 2, empty" while empty, or with "X" or "O" in place of "empty" once filled

#### Scenario: Status announced
- **WHEN** the status text changes
- **THEN** it is exposed in a live region so screen readers announce it

## REMOVED Requirements

### Requirement: Keyboard and screen-reader access
**Reason**: Split into "Keyboard access" and "Screen-reader access" so each requirement covers one concern and stays within the 500-character description guideline.
**Migration**: No behaviour change. The description text and all five scenarios carry over word for word: keyboard focus and activation go to "Keyboard access", and cell labels and status announcements go to "Screen-reader access".
