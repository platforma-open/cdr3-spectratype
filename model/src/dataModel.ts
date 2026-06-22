import type { GraphMakerState } from "@milaboratories/graph-maker";
import { DataModelBuilder } from "@platforma-sdk/model";
import { getDefaultBlockLabel } from "./label";
import type { BlockData, LegacyBlockArgs, LegacyUiState } from "./types";

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

const initData = (): BlockData => ({
  datasetRef: undefined,
  lengthType: "aminoacid",
  scChain: "A",
  defaultBlockLabel: getDefaultBlockLabel({ lengthType: "aminoacid", isSingleCell: false }),
  customBlockLabel: "",
  weightedFlag: true,
  bubblePlotState: defaultBubble(),
  vStackedBarPlotState: defaultVStacked(),
  cdr3StackedBarPlotState: defaultCdr3(),
});

export const blockDataModel = new DataModelBuilder()
  .from<BlockData>("v1")
  // V1 split analysis params + block labels across `args`; the three plot states
  // and `weightedFlag` lived under `uiState`. Fold both into unified `data`.
  .upgradeLegacy<LegacyBlockArgs, LegacyUiState>(({ args, uiState }) => {
    const lengthType = args?.lengthType ?? "aminoacid";
    return {
      datasetRef: args?.datasetRef,
      lengthType,
      scChain: args?.scChain ?? "A",
      defaultBlockLabel:
        args?.defaultBlockLabel ?? getDefaultBlockLabel({ lengthType, isSingleCell: false }),
      customBlockLabel: args?.customBlockLabel ?? "",
      weightedFlag: uiState?.weightedFlag ?? true,
      bubblePlotState: uiState?.bubblePlotState ?? defaultBubble(),
      vStackedBarPlotState: uiState?.vStackedBarPlotState ?? defaultVStacked(),
      cdr3StackedBarPlotState: uiState?.cdr3StackedBarPlotState ?? defaultCdr3(),
    };
  })
  .init(initData);
