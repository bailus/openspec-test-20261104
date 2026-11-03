# tic-tac-toe Specification

## Purpose

Lets two people play tic-tac-toe against each other on one device: taking turns on a 3×3 board, seeing who won or whether it was a draw, and keeping a running score until the page is reloaded.

## Requirements

### Requirement: Empty board at start
The game SHALL show a 3×3 board of nine empty cells when the app loads, with player X to move.

#### Scenario: App loads
- **WHEN** the user opens the app
- **THEN** nine empty cells are shown in a 3×3 grid
- **AND** the status reads that it is X's turn

### Requirement: Alternating turns
Players SHALL take turns placing their mark, starting with X and then alternating between X and O. Against a computer opponent, the user places only the human's mark and the computer places the other.

#### Scenario: First move
- **WHEN** X is to move, X is played by a person, and the user selects an empty cell
- **THEN** that cell shows X
- **AND** the status reads that it is O's turn

#### Scenario: Second move
- **WHEN** O is to move, O is played by a person, and the user selects an empty cell
- **THEN** that cell shows O
- **AND** the status reads that it is X's turn

### Requirement: Occupied cells cannot be changed
Selecting a cell that already holds a mark SHALL have no effect. The board and the current turn stay unchanged.

#### Scenario: Selecting an occupied cell
- **WHEN** the user selects a cell that already shows X or O
- **THEN** the cell keeps its mark
- **AND** the current player does not change

### Requirement: Win detection
A player SHALL win as soon as they have three of their marks in a row, column or diagonal. The game SHALL then announce the winner and highlight the three winning cells. Against a computer opponent, the announcement uses the computer-opponent status wording.

#### Scenario: Row win
- **WHEN** X places a mark that completes a horizontal line of three X marks
- **THEN** the status announces X as the winner
- **AND** the three cells of that line are visually highlighted

#### Scenario: Column win
- **WHEN** O places a mark that completes a vertical line of three O marks
- **THEN** the status announces O as the winner
- **AND** the three cells of that column are visually highlighted

#### Scenario: Diagonal win
- **WHEN** O places a mark that completes a diagonal line of three O marks
- **THEN** the status announces O as the winner
- **AND** the three cells of that diagonal are visually highlighted

#### Scenario: Win on the last cell
- **WHEN** the ninth mark fills the board and also completes a line
- **THEN** the game is reported as a win for that player, not a draw

### Requirement: Draw detection
When all nine cells are filled and no player has a line of three, the game SHALL end in a draw.

#### Scenario: Full board without a line
- **WHEN** the ninth mark is placed and it completes no line
- **THEN** the status announces a draw

### Requirement: Board locked after game over
Once a game has been won or drawn, no further mark SHALL be placed in it. The result and the winning line SHALL stay on screen until the user selects a cell, which starts the next game as described in "New game".

#### Scenario: Selecting a cell after a win
- **WHEN** the game has a winner and the user selects an empty cell
- **THEN** no mark is placed in that cell
- **AND** a new game starts with an empty board

#### Scenario: Selecting a cell after a draw
- **WHEN** the game has ended in a draw and the user selects any cell
- **THEN** no mark is placed
- **AND** a new game starts with an empty board
- **AND** the score is unchanged

### Requirement: New game
After a game has been won or drawn, the status SHALL add "Click the board to play again", and selecting any cell SHALL start a new game with the same opponent and side. A new game clears the board and gives the first move to X. When the human plays O against a computer opponent, the computer, as X, then makes the first move. There SHALL be no separate "New game" control, and a game in progress cannot be restarted.

#### Scenario: Play-again hint
- **WHEN** a game has been won or drawn
- **THEN** the status shows the result followed by "Click the board to play again"

#### Scenario: Reset after a finished game
- **WHEN** the game has ended and the user selects any cell
- **THEN** all nine cells are empty, nothing is highlighted, and the status reads that it is X's turn
- **AND** the score is unchanged

#### Scenario: Reset mid-game
- **WHEN** a game is in progress
- **THEN** no control is offered that clears the board
- **AND** selecting an occupied cell does not start a new game

#### Scenario: Restart with the computer as X
- **WHEN** the human plays O against a computer opponent, the game has ended, and the user selects any cell
- **THEN** all nine cells are empty and the status reads that it is the computer's turn
- **AND** the computer then places the first X

### Requirement: Running score
The game SHALL show a tally of wins for each side and of draws. Each tally goes up by one when a game ends with that result. The score SHALL be kept in memory only: it lasts across new games and resets to zero when the page is reloaded. The score SHALL also reset to zero when the user changes the opponent or the side they play. Against a computer opponent the tallies are labelled from the human's point of view, as described in the computer-opponent capability.

#### Scenario: Score after an X win
- **WHEN** a two-player game ends with X winning
- **THEN** the X wins tally goes up by one and the other tallies are unchanged

#### Scenario: Score after an O win
- **WHEN** a two-player game ends with O winning
- **THEN** the O wins tally goes up by one and the other tallies are unchanged

#### Scenario: Score after a draw
- **WHEN** a game ends in a draw
- **THEN** the draws tally goes up by one

#### Scenario: Score survives new game
- **WHEN** the user starts a new game after one or more finished games
- **THEN** the tallies keep their values

#### Scenario: Score resets on reload
- **WHEN** the user reloads the page
- **THEN** all tallies show zero

#### Scenario: Score resets when the opponent changes
- **WHEN** one or more games have finished and the user selects a different opponent
- **THEN** all tallies show zero

#### Scenario: Score resets when the side changes
- **WHEN** one or more games have finished against a computer opponent and the user switches between X and O
- **THEN** all tallies show zero

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

### Requirement: Responsive layout
The board SHALL fit the viewport and stay usable from phone width (360px) up to desktop widths, with no horizontal scrolling.

#### Scenario: Phone width
- **WHEN** the app is viewed at 360px wide
- **THEN** the whole board, the status and the controls are visible without horizontal scrolling
