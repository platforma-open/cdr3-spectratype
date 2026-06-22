import { isJsonEqual } from "@milaboratories/helpers";
import {
  getDefaultBlockLabel,
  platforma,
} from "@platforma-open/milaboratories.cdr3-spectratype.model";
import { defineAppV3 } from "@platforma-sdk/ui-vue";
import { computed, watchEffect } from "vue";
import BubblePlot from "./pages/BubblePlot.vue";
import CDR3StackedBarPlot from "./pages/CDR3StackedBarPlot.vue";
import VStackedBarPlot from "./pages/VStackedBarPlot.vue";
import { useIsSingleCell, useScChainOptions } from "./utils";

export const sdkPlugin = defineAppV3(platforma, (app) => {
  syncDefaultBlockLabel(app.model);

  return {
    routes: {
      "/": () => BubblePlot,
      "/vStackedBarPlot": () => VStackedBarPlot,
      "/cdr3StackedBarPlot": () => CDR3StackedBarPlot,
    },
  };
});

export const useApp = sdkPlugin.useApp;

type AppModel = ReturnType<typeof useApp>["model"];

function syncDefaultBlockLabel(model: AppModel) {
  const isSingleCell = useIsSingleCell(() => model.outputs.datasetSpec);
  const scChainOptions = useScChainOptions(() => model.outputs.datasetSpec);

  const datasetLabel = computed(() => {
    if (!model.data.datasetRef) return;
    return model.outputs.datasetOptions?.find((option) =>
      isJsonEqual(option.ref, model.data.datasetRef),
    )?.label;
  });

  // Get chain label for single-cell datasets
  const chainLabel = computed(() => {
    if (!isSingleCell.value) return;
    return scChainOptions.value?.find((o) => o.value === model.data.scChain)?.label;
  });

  watchEffect(() => {
    // Get length type label
    const lengthType = model.data.lengthType;

    model.data.defaultBlockLabel = getDefaultBlockLabel({
      datasetLabel: datasetLabel.value,
      lengthType,
      isSingleCell: isSingleCell.value,
      chainLabel: chainLabel.value,
    });
  });
}
