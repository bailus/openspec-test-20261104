# computer-opponent Specification

## Purpose

Lets one person play tic-tac-toe against the computer, choosing which mark to play and how strong the computer is (Easy, Medium or Hard), as an alternative to two people sharing one device.

## Requirements

### Requirement: Opponent selection
The game SHALL offer the opponent as a drop-down list with four choices: "Human", "Computer (Easy)", "Computer (Medium)" and "Computer (Hard)". "Computer (Medium)" SHALL be selected when the app loads. Changing the opponent SHALL start a new game.

#### Scenario: Default opponent
- **WHEN** the user opens the app
- **THEN** the opponent drop-down shows "Computer (Medium)" as selected
- **AND** the human plays X against the Medium computer

#### Scenario: Choosing two-player play
- **WHEN** the user selects "Human" on an empty board
- **THEN** a new two-player game begins, with both X and O placed by people

#### Scenario: Choosing a different computer
- **WHEN** the user selects "Computer (Hard)" after a game has ended
- **THEN** the board is cleared and a new game against the Hard computer begins

#### Scenario: Drop-down is accessible
- **WHEN** a keyboard or screen-reader user reaches the opponent drop-down
- **THEN** it has the accessible name "Opponent"
- **AND** each choice can be selected with the keyboard

### Requirement: Human side selection
When the opponent is a computer, the user SHALL be able to choose whether they play X or O, with X selected by default. The computer SHALL play the other mark. Changing the side SHALL start a new game. The side choice SHALL be kept when the opponent changes, including through Human.

#### Scenario: Default side
- **WHEN** the app loads
- **THEN** the human is X and the computer is O

#### Scenario: Choosing O
- **WHEN** the user toggles the switch, or selects the "O" label, while playing a computer opponent on an empty board
- **THEN** a new game starts with the human as O and the computer as X

#### Scenario: Side kept across opponent changes
- **WHEN** the user plays O against Computer (Easy), switches to Human, then switches to Computer (Hard), each time on an empty or finished board
- **THEN** the human is still O and the computer, as X, makes the first move

### Requirement: Side switch
The side choice SHALL be a single switch labelled "You play as", with an "X" label on its left and an "O" label on its right, shown before the opponent drop-down. The switch is on when the human plays O. Selecting either label SHALL also select that side.

#### Scenario: Switch off by default
- **WHEN** the app loads
- **THEN** the "You play as" switch is off, towards the X label

#### Scenario: Switch is accessible
- **WHEN** a keyboard or screen-reader user reaches the side switch
- **THEN** it is announced as a switch named "You play as O", on when the human plays O
- **AND** pressing Space toggles it

#### Scenario: Control order
- **WHEN** the opponent is a computer
- **THEN** the "You play as" switch appears before the opponent drop-down, both on screen and in keyboard order

### Requirement: Side choice hidden for two-player play
The side choice SHALL NOT be shown when the opponent is Human, but its space SHALL be kept so the opponent drop-down does not move.

#### Scenario: Side hidden for two-player play
- **WHEN** the opponent is Human
- **THEN** no side choice is shown, focusable or announced
- **AND** the opponent drop-down stays in the same position as when the side choice is shown

### Requirement: Options locked during a game
While a game is in progress, the opponent drop-down and the side switch SHALL be disabled. A game is in progress once at least one mark has been placed and until it has been won or drawn. On an empty board and after the game has ended, both SHALL be enabled.

#### Scenario: Locked after the first mark
- **WHEN** the first mark of a game has been placed and the game has not ended
- **THEN** the opponent drop-down and the side switch are disabled and cannot be changed, including by selecting the X or O label

#### Scenario: Unlocked on an empty board
- **WHEN** the board is empty, including while the computer is about to make its opening move
- **THEN** the opponent drop-down and the side switch are enabled

#### Scenario: Unlocked after the game ends
- **WHEN** the game has been won or drawn
- **THEN** the opponent drop-down and the side switch are enabled

### Requirement: Computer takes its turn automatically
When it is the computer's turn in an unfinished game, the computer SHALL place its mark on an empty cell by itself after a short pause of no more than one second. If a new game starts, or the opponent or side changes, before that move is placed, the pending move SHALL be cancelled.

#### Scenario: Computer replies to the human
- **WHEN** the human is X and places a mark that does not end the game
- **THEN** within one second the computer places an O on an empty cell
- **AND** it is then the human's turn

#### Scenario: Computer opens when the human is O
- **WHEN** a new game starts with the human as O
- **THEN** within one second the computer places an X on an empty cell
- **AND** it is then the human's turn

#### Scenario: No move after the game ends
- **WHEN** the human's move wins the game or fills the board
- **THEN** the computer places no mark

#### Scenario: Pending opening move cancelled
- **WHEN** the human is O, the computer has not yet made its opening move, and the user changes the opponent or side
- **THEN** the cancelled move is never placed on the new board

### Requirement: Human cannot move on the computer's turn
While it is the computer's turn, selecting a cell SHALL have no effect. Cells SHALL stay focusable and keep their accessible labels.

#### Scenario: Selecting a cell during the computer's turn
- **WHEN** it is the computer's turn and the user selects an empty cell
- **THEN** the cell stays empty
- **AND** only the computer's move is then placed

#### Scenario: Cells reachable during the computer's turn
- **WHEN** a keyboard user presses Tab through the board during the computer's turn
- **THEN** every cell receives focus

### Requirement: Computer strategies
Each computer move SHALL be chosen by exactly one of three strategies. Perfect: a move that leads to the best result against best play, preferring a faster win and a slower loss. Tactical: complete its own line of three if possible, otherwise block the human's line of three, otherwise a random empty cell. Random: any empty cell, each equally likely.

#### Scenario: Perfect takes an immediate win
- **WHEN** the perfect strategy is used and the computer can complete a line of three
- **THEN** it completes that line

#### Scenario: Perfect never loses a drawable position
- **WHEN** the perfect strategy is used in a position where the computer can still at least draw
- **THEN** it places a mark that keeps at least a draw against best play

#### Scenario: Tactical wins before blocking
- **WHEN** the tactical strategy is used and the computer can both complete its own line and block the human's line
- **THEN** it completes its own line

#### Scenario: Tactical blocks
- **WHEN** the tactical strategy is used, the computer cannot complete a line, and the human has two in a line with the third cell empty
- **THEN** it places its mark in that third cell

#### Scenario: Random picks an empty cell
- **WHEN** the random strategy is used
- **THEN** it places its mark on an empty cell, each empty cell being equally likely

### Requirement: Difficulty strategy mix
For each move, the computer SHALL pick its strategy at random with these probabilities. Easy: 1% perfect, 9% tactical, 90% random. Medium: 10% perfect, 50% tactical, 40% random. Hard: 40% perfect, 50% tactical, 10% random. Each move's choice SHALL be independent of earlier moves.

#### Scenario: Easy mix
- **WHEN** the opponent is Computer (Easy) and the computer chooses a move
- **THEN** it uses perfect with probability 0.01, tactical with probability 0.09 and random with probability 0.9

#### Scenario: Medium mix
- **WHEN** the opponent is Computer (Medium) and the computer chooses a move
- **THEN** it uses perfect with probability 0.1, tactical with probability 0.5 and random with probability 0.4

#### Scenario: Hard mix
- **WHEN** the opponent is Computer (Hard) and the computer chooses a move
- **THEN** it uses perfect with probability 0.4, tactical with probability 0.5 and random with probability 0.1

### Requirement: Status text against the computer
When the opponent is a computer, the status SHALL describe the game from the human's point of view without naming the mark: "Your turn", "Computer's turn", "You win!", "Computer wins", or "It's a draw". After a forfeit, the status is preceded by the "You forfeited." notice defined in the tic-tac-toe capability. Two-player status wording SHALL stay as defined in the tic-tac-toe capability.

#### Scenario: Human's turn
- **WHEN** the human plays X and it is X's turn
- **THEN** the status reads "Your turn"

#### Scenario: Computer's turn
- **WHEN** the human plays X and it is O's turn
- **THEN** the status reads "Computer's turn"

#### Scenario: Human wins
- **WHEN** the human plays O and completes a line of three O marks
- **THEN** the status begins "You win!" and does not contain "(O)"

#### Scenario: Computer wins
- **WHEN** the computer plays O and completes a line of three O marks
- **THEN** the status begins "Computer wins" and does not contain "(O)"

#### Scenario: Draw against the computer
- **WHEN** the board fills with no line of three
- **THEN** the status begins "It's a draw"

### Requirement: Score labels against the computer
When the opponent is a computer, the score SHALL label its tallies "You", "Opponent" and "Draws", counting the human's wins, the computer's wins and draws. In two-player play the labels SHALL stay "X wins", "O wins" and "Draws".

#### Scenario: Human wins as O
- **WHEN** the human plays O against the computer and wins a game
- **THEN** the "You" tally goes up by one and "Opponent" is unchanged

#### Scenario: Computer wins
- **WHEN** the computer wins a game
- **THEN** the "Opponent" tally goes up by one

#### Scenario: Two-player labels
- **WHEN** the opponent is Human
- **THEN** the score shows "X wins", "O wins" and "Draws"
