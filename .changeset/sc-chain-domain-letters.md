---
'@platforma-open/milaboratories.cdr3-spectratype.workflow': minor
'@platforma-open/milaboratories.cdr3-spectratype.model': minor
'@platforma-open/milaboratories.cdr3-spectratype.ui': minor
'@platforma-open/milaboratories.cdr3-spectratype': minor
---

Single-cell chain selection now uses the `pl7.app/vdj/scClonotypeChain` domain letter, matching the producers (mixcr-clonotyping, import-vdj-data) and the vj-usage block: A is the more diverse chain — Heavy, Beta, Delta. The workflow no longer inverts A/B for TCRAB/TCRGD, the args field is renamed `scClonotypeChain` to say which convention the letter is in, and emitted columns are labelled with the chain name instead of the raw letter. The selector keeps the classic annotation order, so TCR pairs read Alpha (B), Beta (A).

Every existing block goes stale and must be re-run, because the args field was renamed. For single-cell TCR that re-run is the point: the stored letter is unchanged but now selects the other chain of the pair, so those blocks switch chain and their exported columns change identity (the chain letter rides in the cdr3Length axis domain). Re-pick the chain in Settings if you wanted the one you had, and update any custom block label naming a chain, since it also becomes the trace label. Bulk and Ig blocks re-run to the same result, with the chain name replacing the letter in Ig labels.
