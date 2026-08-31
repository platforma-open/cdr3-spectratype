---
'@platforma-open/milaboratories.cdr3-spectratype.workflow': minor
'@platforma-open/milaboratories.cdr3-spectratype.model': minor
'@platforma-open/milaboratories.cdr3-spectratype.ui': minor
'@platforma-open/milaboratories.cdr3-spectratype': minor
---

Single-cell chain selection now uses the `pl7.app/vdj/scClonotypeChain` domain letter everywhere, matching the producers (mixcr-clonotyping, import-vdj-data) and the vj-usage block: A is the more diverse chain — Heavy, Beta, Delta. The workflow no longer inverts A/B for TCRAB/TCRGD, and the selector lists chains in the classic annotation order — Heavy/Light, Alpha/Beta, Gamma/Delta. Emitted spectratype columns are labelled with the chain name instead of the raw letter.

Unlike the vj-usage fix, this one changes results for existing single-cell TCR blocks: the stored letter is kept but now selects the other chain of the pair, so those blocks re-run on the opposite chain. Re-pick the chain in Settings after upgrading.
