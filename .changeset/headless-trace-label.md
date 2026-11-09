---
"@platforma-open/milaboratories.cdr3-spectratype.model": patch
"@platforma-open/milaboratories.cdr3-spectratype.ui": patch
---

Compute the block subtitle without opening the block

The subtitle shows the dataset's label, written when the user picks a dataset, followed
by the length type, computed from the block's settings. It no longer depends on opening
the block, and opening the block no longer rewrites it. Existing blocks show the length
type alone until the dataset is picked again.
