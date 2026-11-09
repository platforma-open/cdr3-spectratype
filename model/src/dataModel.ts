import type { GraphMakerState } from "@milaboratories/graph-maker";
import { DataModelBuilder } from "@platforma-sdk/model";
import { kind } from "@platforma-open/milaboratories.cdr3-spectratype.kind";
import type { BlockData, BlockDataV1, BlockParams, LegacyBlockArgs, LegacyUiState } from "./types";

const defaultBubble = (): GraphMakerState => ({
  title: "CDR3 V Spectratype",
  template: "bubble",
  currentTab: "settings",
});
const defaultVStacked = (): GraphMakerState => ({
  title: "CDR3 V Spectratype",
  template: "stackedBar",
  currentTab: null,
});
const defaultCdr3 = (): GraphMakerState => ({
  title: "CDR3 Spectratype",
  template: "stackedBar",
  currentTab: null,
});

/**
 * The state a block starts life in, from the params a template seeded it with — the inverse
 * of `deriveTemplateParams` over every field a user sets by hand.
 *
 * Exported so the round-trip test can drive it directly: `.init` is the only consumer in
 * production, but a projection that drifts from this function is exactly the bug that ships
 * silently while every parser test stays green.
 */
export const initBlockData = (params?: BlockParams): BlockData => {
  const lengthType = params?.lengthType ?? "aminoacid";
  return {
    datasetRef: params?.datasetRef,
    filterRef: params?.filterRef,
    lengthType,
    scChain: params?.scChain ?? "A",
    customBlockLabel: params?.customBlockLabel ?? "",
    // The dataset's label comes from the result pool, which `init` cannot reach; the subtitle
    // shows the settings part until the block is opened.
    subtitleLabel: "",
    weightedFlag: params?.weightedFlag ?? true,
    bubblePlotState: defaultBubble(),
    vStackedBarPlotState: defaultVStacked(),
    cdr3StackedBarPlotState: defaultCdr3(),
  };
};

export const blockDataModel = new DataModelBuilder({ kind })
  .from<BlockDataV1>("v1")
  // V1 split analysis params + block labels across `args`; the three plot states
  // and `weightedFlag` lived under `uiState`. Fold both into unified `data`.
  .upgradeLegacy<LegacyBlockArgs, LegacyUiState>(({ args, uiState }) => {
    const lengthType = args?.lengthType ?? "aminoacid";
    return {
      datasetRef: args?.datasetRef,
      lengthType,
      scChain: args?.scChain ?? "A",
      defaultBlockLabel: args?.defaultBlockLabel ?? "",
      customBlockLabel: args?.customBlockLabel ?? "",
      weightedFlag: uiState?.weightedFlag ?? true,
      bubblePlotState: uiState?.bubblePlotState ?? defaultBubble(),
      vStackedBarPlotState: uiState?.vStackedBarPlotState ?? defaultVStacked(),
      cdr3StackedBarPlotState: uiState?.cdr3StackedBarPlotState ?? defaultCdr3(),
    };
  })
  // The old label mixed the dataset's result-pool label with settings; the settings part is
  // recomputed from data, and the dataset part returns when the block is opened.
  .migrate<BlockData>("v2", ({ defaultBlockLabel: _, ...rest }) => ({
    ...rest,
    subtitleLabel: "",
  }))
  .init(({ params }) => initBlockData(params));
