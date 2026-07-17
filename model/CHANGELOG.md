# @platforma-open/milaboratories.cdr3-spectratype.model

## 4.3.1

### Patch Changes

- 44774d9: Only offer single-cell chains that actually have columns. The chain selector was
  built from the receptor type alone, so on heavy-chain-only (VHH) single-cell input
  it still offered "Light" — picking it failed the workflow with `expected exactly 1
CDR3 column for chain, got 0`. A new `availableScChains` model output reports the
  chains present for the selected dataset; the selector now lists only those (and is
  hidden when a single chain leaves nothing to choose), and a stale selection is reset to
  a present chain when switching a block's dataset narrows the available chains.

## 4.3.0

### Minor Changes

- 2b9444b: Migrate onto the block-tools structurer (full SDK upgrade: model/ui-vue 1.79.14,
  workflow-tengo 6.6.3, tengo-builder 4.0.8) and BlockModelV3.

  Persisted state is preserved via the legacy upgrader. UI bindings move to
  `app.model.data`. The three plot view states, `weightedFlag`, and the derived
  block label are now UI-only and no longer stale the block; only the dataset,
  length type, single-cell chain, and custom block label do. The custom
  dataset-scoped pFrame is preserved.

## 4.2.0

### Minor Changes

- 8d5f408: Update SDK and prevent samples from other datasets seeping into sample selection options

## 4.1.2

### Patch Changes

- dc10b2e: update dependencies

## 4.1.1

### Patch Changes

- ea9167f: Improve block subtitle generation, automatically open/close Settings panel

## 4.1.0

### Minor Changes

- 1f3f02b: Support custom block title

## 4.0.0

### Major Changes

- 93c1dc5: Show running state for tables and graphs

## 3.1.4

### Patch Changes

- be586c3: technical release

## 3.1.3

### Patch Changes

- 738aa7c: technical release
- 745d678: technical release
- ae20cc4: technical release
- 956034d: technical release
- e07cad7: technical release

## 3.1.2

### Patch Changes

- 8591a9e: Full SDK update

## 3.1.1

### Patch Changes

- 8352d7a: Updated SDK to support polars.

## 3.1.0

### Minor Changes

- 62c3c07: Add trace, fix bugs: UI showing same plot when two blocks present; Exported outputs for nt/aa all have same label

## 3.0.0

### Major Changes

- 138f43a: Switch to anchored queries

## 2.0.1

### Patch Changes

- 3984e7d: Update SDK

## 2.0.0

### Major Changes

- 619231e: Block v2

## 1.1.0

### Minor Changes

- 1d45e7d: Added table and bar plot
