# @platforma-open/milaboratories.cdr3-spectratype.kind

## 1.1.0

### Minor Changes

- de8f0da: Update the SDK and accept a subset filter (e.g. a Repertoire Labeling label or Lead Selection picks) with the input dataset. The dataset list is built with buildDatasetOptions (requireEnrichments: false). The subset restricts the clonotypes before the spectratypes are computed, so per-sample counts, weights and the top 20 CDR3s describe the subset only. Outputs of a subset run carry pl7.app/inputSubset in their domain and a trace rooted in the subset, so their labels name it; the default subtitle names the subset too. Unfiltered runs are unchanged.

## 1.0.1

### Patch Changes

- 33fe801: Bump the kind version: its source changed after 1.0.0 was published, so the registry refused to republish 1.0.0 with different content and releases 3.3.0 and 3.4.0 never went out
