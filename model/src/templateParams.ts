import type { BlockParams } from "@platforma-open/milaboratories.cdr3-spectratype.kind";
import type { BlockData } from "./types";

/**
 * The params a project exported as a template hands the block it seeds — the inverse of
 * `initBlockData` over every field a user sets by hand.
 *
 * `defaultBlockLabel` does not travel. A `watchEffect` in `ui/src/app.ts` rebuilds it from the
 * dataset's and the chain's option labels, which come from the result pool — so it is projected
 * into args, where the workflow reads it for the trace, but never templated.
 *
 * The three graph-maker states do not travel either: they are the plotting component's own view
 * state, and a template pinning them would be pinning a camera position rather than an analysis.
 */
export function deriveTemplateParams(data: BlockData): BlockParams {
  return {
    datasetRef: data.datasetRef,
    lengthType: data.lengthType,
    scChain: data.scChain,
    weightedFlag: data.weightedFlag,
    customBlockLabel: data.customBlockLabel,
  };
}
