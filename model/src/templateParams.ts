import type { BlockParams } from "@platforma-open/milaboratories.cdr3-spectratype.kind";
import type { BlockData } from "./types";

/**
 * The params a project exported as a template hands the block it seeds — the inverse of
 * `initBlockData` over every field a user sets by hand.
 *
 * `subtitleLabel` does not travel: it is the dataset's label as the source project's result pool
 * shows it, a display cache rather than a setting. The seeded block shows the settings part of
 * the subtitle until the block is opened.
 *
 * The three graph-maker states do not travel either: they are the plotting component's own view
 * state, and a template pinning them would be pinning a camera position rather than an analysis.
 */
export function deriveTemplateParams(data: BlockData): BlockParams {
  return {
    datasetRef: data.datasetRef,
    filterRef: data.filterRef,
    lengthType: data.lengthType,
    scChain: data.scChain,
    weightedFlag: data.weightedFlag,
    customBlockLabel: data.customBlockLabel,
  };
}
