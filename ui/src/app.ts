import { model } from '@platforma-open/milaboratories.cdr3-spectratype.model';
import { defineApp } from '@platforma-sdk/ui-vue';
import BubblePlot from './pages/BubblePlot.vue';
import MainPage from './pages/MainPage.vue';
import StackedBarPlot from './pages/StackedBarPlot.vue';

export const sdkPlugin = defineApp(model, () => {
  return {
    routes: {
      '/': () => MainPage,
      '/bubblePlot': () => BubblePlot,
      '/stackedBarPlot': () => StackedBarPlot,
    },
  };
});

export const useApp = sdkPlugin.useApp;
