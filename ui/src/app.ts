import { getDefaultBlockLabel, model } from '@platforma-open/milaboratories.cdr3-spectratype.model';
import { defineApp } from '@platforma-sdk/ui-vue';
import { computed, watchEffect } from 'vue';
import BubblePlot from './pages/BubblePlot.vue';
import CDR3StackedBarPlot from './pages/CDR3StackedBarPlot.vue';
import VStackedBarPlot from './pages/VStackedBarPlot.vue';
import { useIsSingleCell, useScChainOptions } from './utils';

export const sdkPlugin = defineApp(model, (app) => {
  app.model.args.customBlockLabel ??= '';

  syncDefaultBlockLabel(app.model);

  return {
    routes: {
      '/': () => BubblePlot,
      '/vStackedBarPlot': () => VStackedBarPlot,
      '/cdr3StackedBarPlot': () => CDR3StackedBarPlot,
    },
  };
});

export const useApp = sdkPlugin.useApp;

type AppModel = ReturnType<typeof useApp>['model'];

function syncDefaultBlockLabel(model: AppModel) {
  const datasetSpecRef = computed(() => model.outputs.datasetSpec);
  const isSingleCell = useIsSingleCell(datasetSpecRef);
  const scChainOptions = useScChainOptions(datasetSpecRef);

  watchEffect(() => {
    const datasetLabel = model.args.datasetRef
      ? model.outputs.datasetOptions
        ?.find((option) => option.ref === model.args.datasetRef)
        ?.label
      : undefined;

    // Get chain label for single-cell datasets
    const chainLabel = isSingleCell.value
      ? scChainOptions.value?.find((o) => o.value === model.args.scChain)?.label
      : undefined;

    // Get length type label
    const lengthType = model.args.lengthType;

    model.args.defaultBlockLabel = getDefaultBlockLabel({
      datasetLabel,
      lengthType,
      isSingleCell: isSingleCell.value,
      chainLabel,
    });
  });
}
