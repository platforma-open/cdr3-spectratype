<script setup lang="ts">
import type { PredefinedGraphOption } from '@milaboratories/graph-maker';
import { GraphMaker } from '@milaboratories/graph-maker';
import strings from '@milaboratories/strings';
import { computed } from 'vue';
import { useApp } from '../app';

const app = useApp();

const defaultOptions = computed((): PredefinedGraphOption<'discrete'>[] | null => {
  const pcols = app.model.outputs.aaPositionPCols;
  if (!pcols) return null;

  const countCol = pcols.find((pcol) => pcol.spec.name === 'pl7.app/count');
  if (!countCol) return [];

  const aaCol = pcols.find((pcol) => pcol.spec.name === 'pl7.app/aminoacid');

  const positionAxis = countCol.spec.axesSpec.find((a) => a.name === 'pl7.app/vdj/numberingPosition');
  const sampleAxis = countCol.spec.axesSpec[0]; // sampleId

  const options: PredefinedGraphOption<'discrete'>[] = [
    {
      inputName: 'y',
      selectedSource: countCol.spec,
    },
  ];

  if (positionAxis) {
    options.push({
      inputName: 'primaryGrouping',
      selectedSource: positionAxis,
    });
  }

  if (aaCol) {
    options.push({
      inputName: 'secondaryGrouping',
      selectedSource: aaCol.spec,
    });
  }

  if (sampleAxis) {
    options.push({
      inputName: 'tabBy',
      selectedSource: sampleAxis,
    });
  }

  return options;
});
</script>

<template>
  <GraphMaker
    v-model="app.model.ui.aaPositionPlotState"
    chart-type="discrete"
    :p-frame="app.model.outputs.aaPositionPf"
    :default-options="defaultOptions"
    :readonly-inputs="['y', 'primaryGrouping', 'secondaryGrouping']"
    :status-text="{ noPframe: { title: strings.callToActions.configureSettingsAndRun } }"
  />
</template>
