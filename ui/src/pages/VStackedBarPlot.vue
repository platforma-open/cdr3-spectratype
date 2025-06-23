<script setup lang="ts">
import type { GraphMakerProps } from '@milaboratories/graph-maker';
import { GraphMaker } from '@milaboratories/graph-maker';
import '@milaboratories/graph-maker/styles';
import { PlBtnGroup } from '@platforma-sdk/ui-vue';
import { computed } from 'vue';
import { useApp } from '../app';

const app = useApp();

const defaultOptions = computed((): GraphMakerProps['defaultOptions'] => {
  return [
    {
      inputName: 'y',
      selectedSource: {
        kind: 'PColumn',
        valueType: 'Float',
        name: 'pl7.app/vdj/vSpectratype',
        domain: {
          'pl7.app/vdj/cdr3Spectratype/type': app.model.ui.weightedFlag ? 'weighted' : 'unweighted',
        },
        axesSpec: [],
      },
    },
    {
      inputName: 'primaryGrouping',
      selectedSource: {
        type: 'Int',
        name: 'pl7.app/vdj/cdr3Length',
      },
    },
    {
      inputName: 'secondaryGrouping',
      selectedSource: {
        type: 'String',
        name: 'pl7.app/vdj/geneHit',
      },
    },
    {
      inputName: 'tabBy',
      selectedSource: {
        type: 'String',
        name: 'pl7.app/sampleId',
      },
    },
  ];
});

const weightOptions = [
  {
    label: 'Weighted',
    value: true,
  },
  {
    label: 'Unweighted',
    value: false,
  },
];

const stateKey = computed(() => ({
  pf: app.model.outputs.pf,
  weightedFlag: app.model.ui.weightedFlag,
}));

const setWeightedFlag = (flag: boolean) => {
  app.model.ui.weightedFlag = flag;
};

</script>

<template>
  <GraphMaker
    v-model="app.model.ui.vStackedBarPlotState"
    :data-state-key="stateKey"
    chart-type="discrete"
    :p-frame="app.model.outputs.pf"
    :default-options="defaultOptions"
    :readonly-inputs="[ 'y', 'primaryGrouping', 'secondaryGrouping']"
  >
    <template #titleLineSlot>
      <PlBtnGroup v-model="app.model.ui.weightedFlag" :options="weightOptions" @v-model:set="setWeightedFlag"/>
    </template>
  </GraphMaker>
</template>
