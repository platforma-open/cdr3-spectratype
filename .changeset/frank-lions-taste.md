---
"@platforma-open/milaboratories.cdr3-spectratype.workflow": patch
---

Split output p-frame into two: pfOutput (with filtered labels, for UI) and pfExport (spectratype columns only, for result pool)Prevents duplicate pl7.app/label entries in the result pool that could break downstream addSingle label queries
