import { model } from '@platforma-open/milaboratories.cdr3-spectratype.model';
import { defineApp } from '@platforma-sdk/ui-vue';
import BubblePlot from './pages/BubblePlot.vue';
import CDR3StackedBarPlot from './pages/CDR3StackedBarPlot.vue';
import VStackedBarPlot from './pages/VStackedBarPlot.vue';

export const sdkPlugin = defineApp(model, () => {
  return {
    routes: {
      '/': () => BubblePlot,
      '/vStackedBarPlot': () => VStackedBarPlot,
      '/cdr3StackedBarPlot': () => CDR3StackedBarPlot,
    },
  };
});

export const useApp = sdkPlugin.useApp;
