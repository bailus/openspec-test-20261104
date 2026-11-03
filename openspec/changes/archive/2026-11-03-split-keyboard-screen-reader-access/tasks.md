# Tasks

## 1. Verify the split

- [x] 1.1 Check that the two new requirements together carry the removed requirement's description sentence for sentence, and all five of its scenarios word for word, with nothing added or dropped. Verify by comparing the removed requirement in the main spec with the delta, each sentence and scenario appearing exactly once.
- [x] 1.2 Confirm that no code, test or README text refers to the old requirement name. Verify with a search for "Keyboard and screen-reader" outside `openspec/` returning nothing.
- [x] 1.3 Run `openspec validate split-keyboard-screen-reader-access --strict`, and verify that it passes.

## Workflow follow-up

- Archive the change with a spec sync, then verify that `openspec validate --specs --strict` passes for both main specs.
