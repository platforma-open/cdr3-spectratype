<script setup lang="ts">
import type { PredefinedGraphOption } from '@milaboratories/graph-maker';
import { GraphMaker } from '@milaboratories/graph-maker';
import '@milaboratories/graph-maker/styles';
import { PlBtnGroup } from '@platforma-sdk/ui-vue';
import { computed } from 'vue';
import { useApp } from '../app';

const app = useApp();

const defaultOptions = computed((): PredefinedGraphOption<'discrete'>[] | undefined => {
  if (!app.model.outputs.pfPcols) return [];

  const spectratypePcols = app.model.outputs.pfPcols;

  // Find the correct spectratype PColumn based on the weighted flag
  const targetType = app.model.ui.weightedFlag ? 'weighted' : 'unweighted';
  const mainCol = spectratypePcols.find((pcol) =>
    pcol.spec.name === 'pl7.app/vdj/cdr3Spectratype'
    && pcol.spec.domain?.['pl7.app/vdj/cdr3Spectratype/type'] === targetType,
  );

  if (!mainCol) return [];

  return [
    {
      inputName: 'y',
      selectedSource: mainCol.spec,
    },
    {
      inputName: 'primaryGrouping',
      selectedSource: mainCol.spec.axesSpec[1], // cdr3Length
    },
    {
      inputName: 'secondaryGrouping',
      selectedSource: mainCol.spec.axesSpec[2], // geneHit (for CDR3 plot, this is still geneHit)
    },
    {
      inputName: 'tabBy',
      selectedSource: mainCol.spec.axesSpec[0], // sampleId
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
    v-model="app.model.ui.cdr3StackedBarPlotState"
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
