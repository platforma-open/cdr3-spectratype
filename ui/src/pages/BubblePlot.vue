<script setup lang="ts">
import type { PredefinedGraphOption } from '@milaboratories/graph-maker';
import { GraphMaker } from '@milaboratories/graph-maker';
import '@milaboratories/graph-maker/styles';
import { plRefsEqual } from '@platforma-sdk/model';
import { PlBtnGroup } from '@platforma-sdk/ui-vue';
import { computed, watchEffect } from 'vue';
import { useApp } from '../app';
import { lengthTypeOptions, useIsSingleCell, useScChainOptions } from './constants';
import Settings from './Settings.vue';

const app = useApp();

// Build defaultBlockLabel from dataset name, length type and chain (for single-cell)
const isSingleCell = useIsSingleCell(computed(() => app.model.outputs.datasetSpec));
const scChainOptions = useScChainOptions(computed(() => app.model.outputs.datasetSpec));

watchEffect(() => {
  const parts: string[] = [];
  // Add dataset name
  const datasetRef = app.model.args.datasetRef;
  if (datasetRef) {
    const selectedOption = app.model.outputs.datasetOptions?.find(
      (option) => plRefsEqual(option.ref, datasetRef),
    );
    if (selectedOption?.label) {
      parts.push(selectedOption.label);
    }
  }
  // Add length type
  const lengthTypeLabel = lengthTypeOptions.find((o) => o.value === app.model.args.lengthType)?.label;
  if (lengthTypeLabel) {
    parts.push(lengthTypeLabel);
  }
  // Add chain info for single-cell datasets
  if (isSingleCell.value && scChainOptions.value) {
    const chainLabel = scChainOptions.value.find((o) => o.value === app.model.args.scChain)?.label;
    if (chainLabel) {
      parts.push(chainLabel);
    }
  }
  app.model.args.defaultBlockLabel = parts.join(' - ');
});

const defaultOptions = computed((): PredefinedGraphOption<'bubble'>[] => {
  if (!app.model.outputs.pfPcols) return [];

  // Use the PColumns exposed from the PFrame
  const spectratypePcols = app.model.outputs.pfPcols;

  // Important note:
  // The workflow creates separate PColumns with different domain structures for weighted vs unweighted:
  // - Weighted: includes both "pl7.app/vdj/cdr3Spectratype/type": "weighted" AND "pl7.app/abundance/unit"
  // - Unweighted: only includes "pl7.app/vdj/cdr3Spectratype/type": "unweighted"
  // Domain must match exactly.
  const targetType = app.model.ui.weightedFlag ? 'weighted' : 'unweighted';
  const mainCol = spectratypePcols.find((pcol) =>
    pcol.spec.name === 'pl7.app/vdj/vSpectratype'
    && pcol.spec.domain?.['pl7.app/vdj/cdr3Spectratype/type'] === targetType,
  );

  if (!mainCol) return [];

  // Spectratype Pcol has structure [sampleId][cdr3Length][geneHit] -> sum
  // We can use axesSpec to get the correct column for each input

  return [
    {
      inputName: 'valueSize',
      selectedSource: mainCol.spec,
    },
    {
      inputName: 'valueColor',
      selectedSource: mainCol.spec,
    },
    {
      inputName: 'x',
      selectedSource: mainCol.spec.axesSpec[2],
    },
    {
      inputName: 'y',
      selectedSource: mainCol.spec.axesSpec[1],
    },
    {
      inputName: 'tabBy',
      selectedSource: mainCol.spec.axesSpec[0],
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
  pf: app.model.outputs.pf.ok ? app.model.outputs.pf.value : undefined,
  weightedFlag: app.model.ui.weightedFlag,
}));

const setWeightedFlag = (flag: boolean) => {
  app.model.ui.weightedFlag = flag;
};
</script>

<template>
  <GraphMaker
    v-model="app.model.ui.bubblePlotState"
    :data-state-key="stateKey"
    chart-type="bubble"
    :p-frame="app.model.outputs.pf"
    :default-options="defaultOptions"
    :readonly-inputs="['x', 'y', 'valueSize', 'valueColor']"
  >
    <template #titleLineSlot>
      <PlBtnGroup v-model="app.model.ui.weightedFlag" :options="weightOptions" @v-model:set="setWeightedFlag"/>
    </template>
    <template #settingsSlot>
      <Settings />
    </template>
  </GraphMaker>
</template>
