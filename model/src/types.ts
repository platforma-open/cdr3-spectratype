import type { GraphMakerState } from "@milaboratories/graph-maker";
import type { PlRef } from "@platforma-sdk/model";

export type LengthType = "aminoacid" | "nucleotide";
export type ScChain = "A" | "B";

/**
 * Unified V3 data — the UI's persisted state. The three plot states,
 * `weightedFlag`, and `defaultBlockLabel` are display-only; the args lambda
 * projects only the analysis inputs (+ `customBlockLabel` for the trace).
 */
export type BlockData = {
  datasetRef?: PlRef;
  lengthType: LengthType;
  scChain: ScChain;
  defaultBlockLabel: string;
  customBlockLabel: string;
  weightedFlag: boolean;
  bubblePlotState: GraphMakerState;
  vStackedBarPlotState: GraphMakerState;
  cdr3StackedBarPlotState: GraphMakerState;
};

/**
 * Workflow-facing args. `defaultBlockLabel` and the plot/view state are not
 * projected; `customBlockLabel` is — the workflow uses it as the trace label.
 * `datasetRef` is required: the args lambda throws when absent.
 */
export type BlockArgs = {
  datasetRef: PlRef;
  lengthType: LengthType;
  scChain: ScChain;
  customBlockLabel: string;
};

/** Legacy V1 on-disk shapes, consumed once by `.upgradeLegacy`. */
export type LegacyBlockArgs = {
  defaultBlockLabel: string;
  customBlockLabel: string;
  datasetRef?: PlRef;
  lengthType: LengthType;
  scChain: ScChain;
};
export type LegacyUiState = {
  bubblePlotState: GraphMakerState;
  weightedFlag: boolean;
  vStackedBarPlotState: GraphMakerState;
  cdr3StackedBarPlotState: GraphMakerState;
};
