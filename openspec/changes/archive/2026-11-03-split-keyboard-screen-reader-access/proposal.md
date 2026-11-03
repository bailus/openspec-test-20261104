# Proposal

## Why

The tic-tac-toe requirement "Keyboard and screen-reader access" covers three behaviours in one 531-character description: keyboard focus and activation, cell labels, and status announcements. That is over the 500-character guideline, so `openspec validate --strict` fails on the main spec. Separating keyboard behaviour from screen-reader behaviour makes each requirement state one concern.

## What Changes

- Replace "Keyboard and screen-reader access" with two requirements:
  - **Keyboard access**: cells are focusable, stay focusable when occupied, after the game ends and during the computer's turn, and what activating a cell does in each case.
  - **Screen-reader access**: each cell's accessible label, and status changes announced to assistive technology.
- Every existing scenario moves, word for word, to the requirement it tests:
  - "Keyboard play", "Occupied cells stay reachable" and "Keyboard restart" go to Keyboard access.
  - "Cell labels" and "Status announced" go to Screen-reader access.
- No behaviour changes. The requirement text is the same, divided between the two requirements, and the app's code and tests are untouched.

## Capabilities

### New Capabilities

None.

### Modified Capabilities
- `tic-tac-toe`: "Keyboard and screen-reader access" is removed and replaced by "Keyboard access" and "Screen-reader access", with the same wording and scenarios.

## Impact

- `openspec/specs/tic-tac-toe/spec.md` only, once the change is archived.
- No code, test or dependency changes.
