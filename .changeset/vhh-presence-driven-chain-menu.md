---
"@platforma-open/milaboratories.cdr3-spectratype.model": patch
"@platforma-open/milaboratories.cdr3-spectratype.ui": patch
"@platforma-open/milaboratories.cdr3-spectratype": patch
---

Only offer single-cell chains that actually have columns. The chain selector was
built from the receptor type alone, so on heavy-chain-only (VHH) single-cell input
it still offered "Light" — picking it failed the workflow with `expected exactly 1
CDR3 column for chain, got 0`. A new `availableScChains` model output reports the
chains present for the selected dataset; the selector now lists only those (and is
hidden when a single chain leaves nothing to choose), and a stale selection is reset to
a present chain when switching a block's dataset narrows the available chains.
