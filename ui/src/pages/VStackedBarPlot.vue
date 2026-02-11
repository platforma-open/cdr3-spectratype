<script setup lang="ts">
import type { PredefinedGraphOption } from '@milaboratories/graph-maker';
import { GraphMaker } from '@milaboratories/graph-maker';
import '@milaboratories/graph-maker/styles';
import strings from '@milaboratories/strings';
import { PlBtnGroup } from '@platforma-sdk/ui-vue';
import { computed } from 'vue';
import { useApp } from '../app';

const app = useApp();

const defaultOptions = computed((): PredefinedGraphOption<'discrete'>[] | null => {
  if (!app.model.outputs.pfPcols) return null;

  const spectratypePcols = app.model.outputs.pfPcols;

  // Find the correct spectratype PColumn based on the weighted flag
  const targetType = app.model.ui.weightedFlag ? 'weighted' : 'unweighted';
  const mainCol = spectratypePcols.find((pcol) =>
    pcol.spec.name === 'pl7.app/vdj/vSpectratype'
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
      selectedSource: mainCol.spec.axesSpec[2], // geneHit
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

</script>

<template>
  <GraphMaker
    v-model="app.model.ui.vStackedBarPlotState"
    chart-type="discrete"
    :p-frame="app.model.outputs.pf"
    :default-options="defaultOptions"
    :readonly-inputs="[ 'y', 'primaryGrouping', 'secondaryGrouping']"
    :status-text="{ noPframe: { title: strings.callToActions.configureSettingsAndRun } }"
  >
    <template #titleLineSlot>
      <PlBtnGroup v-model="app.model.ui.weightedFlag" :options="weightOptions" />
    </template>
  </GraphMaker>
</template>
