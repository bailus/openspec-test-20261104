# Spec Delta

## MODIFIED Requirements

### Requirement: Human side selection
When the opponent is a computer, the user SHALL be able to choose whether they play X or O, with X selected by default. The choice SHALL be a single switch labelled "You play as", with an "X" label on its left and an "O" label on its right, shown before the opponent drop-down. The switch is on when the human plays O; selecting either label also selects that side. The computer SHALL play the other mark. Changing the side SHALL start a new game. The side choice SHALL be kept when the opponent changes, including through Human. The side choice SHALL NOT be shown when the opponent is Human, but its space SHALL be kept so the opponent drop-down does not move.

#### Scenario: Default side
- **WHEN** the app loads
- **THEN** the human is X and the computer is O
- **AND** the "You play as" switch is off, towards the X label

#### Scenario: Choosing O
- **WHEN** the user toggles the switch, or selects the "O" label, while playing a computer opponent on an empty board
- **THEN** a new game starts with the human as O and the computer as X

#### Scenario: Switch is accessible
- **WHEN** a keyboard or screen-reader user reaches the side switch
- **THEN** it is announced as a switch named "You play as O", on when the human plays O
- **AND** pressing Space toggles it

#### Scenario: Control order
- **WHEN** the opponent is a computer
- **THEN** the "You play as" switch appears before the opponent drop-down, both on screen and in keyboard order

#### Scenario: Side kept across opponent changes
- **WHEN** the user plays O against Computer (Easy), switches to Human, then switches to Computer (Hard), each time on an empty or finished board
- **THEN** the human is still O and the computer, as X, makes the first move

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
