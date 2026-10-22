---
"@platforma-open/milaboratories.cdr3-spectratype": minor
"@platforma-open/milaboratories.cdr3-spectratype.kind": minor
"@platforma-open/milaboratories.cdr3-spectratype.model": minor
"@platforma-open/milaboratories.cdr3-spectratype.ui": minor
"@platforma-open/milaboratories.cdr3-spectratype.workflow": minor
---

Update the SDK and accept a subset filter (e.g. a Repertoire Labeling label or Lead Selection picks) with the input dataset. The dataset list is built with buildDatasetOptions (requireEnrichments: false). The subset restricts the clonotypes before the spectratypes are computed, so per-sample counts, weights and the top 20 CDR3s describe the subset only. Outputs of a subset run carry pl7.app/inputSubset in their domain and a trace rooted in the subset, so their labels name it; the default subtitle names the subset too. Unfiltered runs are unchanged.
