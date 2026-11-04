# Spec Delta

## MODIFIED Requirements

### Requirement: New game
After a game has been won or drawn, the status SHALL add "Click the board to play again", and selecting any cell SHALL start a new game with the same opponent and side. A new game can also be started at any time with the Reset button, as described in "Reset button". A new game clears the board and gives the first move to X. When the human plays O against a computer opponent, the computer, as X, then makes the first move.

#### Scenario: Play-again hint
- **WHEN** a game has been won or drawn
- **THEN** the status shows the result followed by "Click the board to play again"

#### Scenario: Reset after a finished game
- **WHEN** the game has ended and the user selects any cell
- **THEN** all nine cells are empty, nothing is highlighted, and the status reads that it is X's turn
- **AND** the score is unchanged

#### Scenario: Reset mid-game
- **WHEN** a game is in progress
- **THEN** the Reset button is the only way to clear the board, and it counts as a forfeit as described in "Reset forfeits a game in progress"
- **AND** selecting an occupied cell does not start a new game

#### Scenario: Restart with the computer as X
- **WHEN** the human plays O against a computer opponent, the game has ended, and the user selects any cell
- **THEN** all nine cells are empty and the status reads that it is the computer's turn
- **AND** the computer then places the first X

### Requirement: Running score
The game SHALL show a tally of wins for each side and of draws. Each tally goes up by one when a game ends with that result, including a game ended early with the Reset button, which counts as a win for the side that was not to move in two-player play, and as a win for the computer against a computer opponent. The score SHALL be kept in memory only: it lasts across new games and resets to zero when the page is reloaded. The score SHALL also reset to zero when the user changes the opponent or the side they play. Against a computer opponent the tallies are labelled from the human's point of view, as described in the computer-opponent capability.

#### Scenario: Score after an X win
- **WHEN** a two-player game ends with X winning
- **THEN** the X wins tally goes up by one and the other tallies are unchanged

#### Scenario: Score after an O win
- **WHEN** a two-player game ends with O winning
- **THEN** the O wins tally goes up by one and the other tallies are unchanged

#### Scenario: Score after a draw
- **WHEN** a game ends in a draw
- **THEN** the draws tally goes up by one

#### Scenario: Score after a forfeit
- **WHEN** a two-player game is in progress with X to move and the user presses Reset
- **THEN** the O wins tally goes up by one and the other tallies are unchanged

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

### Requirement: Responsive layout
The board SHALL fit the viewport and stay usable from phone width (360px) up to desktop widths, with no horizontal scrolling.

#### Scenario: Phone width
- **WHEN** the app is viewed at 360px wide
- **THEN** the whole board, the status, the Reset button space, the score, the game controls and the theme switch are visible without horizontal scrolling

## ADDED Requirements

### Requirement: App title
The app SHALL be named "Vibe-tac-slop". The page's main heading and the browser tab title SHALL both read "Vibe-tac-slop". The app logo SHALL appear immediately to the left of the main heading. The logo is decorative and SHALL NOT be announced by screen readers, since the heading already names the app.

#### Scenario: Title on load
- **WHEN** the user opens the app
- **THEN** the main heading reads "Vibe-tac-slop"
- **AND** the browser tab title reads "Vibe-tac-slop"

#### Scenario: Logo beside the title
- **WHEN** the app is shown
- **THEN** the logo appears to the left of the heading, on the same line
- **AND** a screen reader announces only the heading, not the logo

#### Scenario: Tab icon
- **WHEN** the app is open in a browser tab
- **THEN** the tab icon is the app logo, drawn in black when the system uses a light colour scheme and in white when it uses a dark one

### Requirement: Reset button
The game SHALL show a button labelled "Reset" below the board. Pressing it SHALL clear the board and start a new game with the same opponent and side. While the board is empty the button SHALL be hidden and unreachable by keyboard or screen reader, but SHALL keep its space so nothing on the page moves when it appears or disappears. After Reset is pressed, keyboard focus SHALL move to the cell in row 1, column 1.

#### Scenario: Hidden on an empty board
- **WHEN** the board is empty, including while the computer is about to make its opening move
- **THEN** the Reset button is not visible, cannot be focused, and is not announced by screen readers
- **AND** the score below it is in the same position as when the button is shown

#### Scenario: Shown once a mark is placed
- **WHEN** the first mark of a game is placed
- **THEN** the Reset button becomes visible and can be activated by mouse, touch or keyboard
- **AND** no other element on the page moves

#### Scenario: Reset after a finished game
- **WHEN** a game has been won or drawn and the user presses Reset
- **THEN** a new game starts with an empty board and X to move
- **AND** the score is unchanged

#### Scenario: Reset with the computer as X
- **WHEN** the human plays O against a computer opponent and presses Reset
- **THEN** the board is cleared and the computer then places the first X

#### Scenario: Focus after Reset
- **WHEN** a keyboard user presses Enter or Space on the Reset button
- **THEN** focus moves to the cell in row 1, column 1, even though the Reset button is now hidden

### Requirement: Reset forfeits a game in progress
Pressing Reset while a game is in progress SHALL end that game as a forfeit before the new game starts. In two-player play the player whose turn it is loses and the other side wins. Against a computer opponent the human always loses and the computer wins, whoever's turn it is.

#### Scenario: Two-player forfeit
- **WHEN** a two-player game is in progress with O to move and the user presses Reset
- **THEN** the X wins tally goes up by one
- **AND** a new game starts with an empty board

#### Scenario: Human forfeits against the computer
- **WHEN** the human is playing the computer, it is the human's turn, and the human presses Reset
- **THEN** the "Opponent" tally goes up by one

#### Scenario: Reset during the computer's turn
- **WHEN** the human is playing the computer, it is the computer's turn, and the human presses Reset before the computer moves
- **THEN** the "Opponent" tally goes up by one and the "You" tally is unchanged
- **AND** the computer's pending move is never placed

### Requirement: Forfeit notice
After a forfeit, the status SHALL begin with a notice naming who forfeited, followed by the new game's usual status. The notice is "X forfeited." or "O forfeited." in two-player play, and "You forfeited." against a computer opponent. It SHALL be announced like any other status change. It SHALL stay until a person places a mark, another new game starts, or the opponent or side changes; the computer's moves do not clear it.

#### Scenario: Two-player notice
- **WHEN** a two-player game is in progress with O to move and the user presses Reset
- **THEN** the status reads "O forfeited. X's turn"

#### Scenario: Notice against the computer
- **WHEN** the human plays X against the computer and presses Reset mid-game
- **THEN** the status reads "You forfeited. Your turn"

#### Scenario: Notice survives the computer's opening move
- **WHEN** the human plays O against the computer, presses Reset mid-game, and the computer then places its opening X
- **THEN** the status reads "You forfeited. Your turn"

#### Scenario: Notice cleared by the next move
- **WHEN** the forfeit notice is showing and a person places a mark
- **THEN** the status no longer contains "forfeited"

#### Scenario: No notice after a finished game
- **WHEN** a game has been won or drawn and the user presses Reset
- **THEN** the status does not contain "forfeited"

### Requirement: Screen layout
The game SHALL be laid out top to bottom as: the header (logo and title), the score, the board, the status, the Reset button and the game controls. The header SHALL be left-aligned with the board, and the two game controls SHALL sit at its opposite edges. The status SHALL appear directly below the board in text smaller than the title. The score SHALL be shown as plain tallies with no visible heading, border or background, and SHALL keep the accessible name "Score".

#### Scenario: Order on screen
- **WHEN** the app is shown
- **THEN** the score appears directly below the header and above the board
- **AND** the status appears below the board, the Reset button space below the status, and the game controls below that

#### Scenario: Left-aligned header
- **WHEN** the app is viewed at any width from 360px up
- **THEN** the logo's left edge lines up with the board's left edge, with the title after it

#### Scenario: Controls at opposite edges
- **WHEN** the opponent is a computer
- **THEN** the "You play as" switch group starts at the board's left edge and the opponent drop-down ends at the board's right edge

#### Scenario: Score without a heading
- **WHEN** the score is shown
- **THEN** no "Score" heading is visible, and the tallies have no border or background of their own
- **AND** a screen reader identifies the score region as "Score"
