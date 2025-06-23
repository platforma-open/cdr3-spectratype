<script setup lang="ts">
import type { GraphMakerProps } from '@milaboratories/graph-maker';
import { GraphMaker } from '@milaboratories/graph-maker';
import '@milaboratories/graph-maker/styles';
import type { PDataColumnSpec } from '@platforma-sdk/model';
import { PlBtnGroup, PlDropdown, PlDropdownRef } from '@platforma-sdk/ui-vue';
import { computed, useTemplateRef } from 'vue';
import { useApp } from '../app';

const app = useApp();

const defaultOptions = computed((): GraphMakerProps['defaultOptions'] => {
  const mainCol: PDataColumnSpec = {
    kind: 'PColumn',
    valueType: 'Float',
    name: 'pl7.app/vdj/vSpectratype',
    domain: {
      'pl7.app/vdj/cdr3Spectratype/type': app.model.ui.weightedFlag ? 'weighted' : 'unweighted',
    },
    axesSpec: [],
  };
  return [
    {
      inputName: 'valueSize',
      selectedSource: mainCol,
    },
    {
      inputName: 'valueColor',
      selectedSource: mainCol,
    },
    {
      inputName: 'x',
      selectedSource: {
        type: 'String',
        name: 'pl7.app/vdj/geneHit',
      },
    },
    {
      inputName: 'y',
      selectedSource: {
        type: 'Int',
        name: 'pl7.app/vdj/cdr3Length',
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

const sequenceTypeOptions = [
  {
    label: 'Amino Acid',
    value: 'aminoacid',
  },
  {
    label: 'Nucleotide',
    value: 'nucleotide',
  },
];

const graphMakerRef = useTemplateRef('graphMaker');

const setWeightedFlag = (flag: boolean) => {
  app.model.ui.weightedFlag = flag;
  graphMakerRef.value?.reset();
};
</script>

<template>
  <GraphMaker
    ref="graphMaker"
    v-model="app.model.ui.bubblePlotState"
    chart-type="bubble"
    :p-frame="app.model.outputs.pf"
    :default-options="defaultOptions"
    :readonly-inputs="['x', 'y', 'valueSize', 'valueColor']"
  >
    <template #titleLineSlot>
      <PlBtnGroup v-model="app.model.ui.weightedFlag" :options="weightOptions" @v-model:set="setWeightedFlag"/>
    </template>
    <template #settingsSlot>
      <PlDropdownRef
        v-model="app.model.args.datasetRef"
        :options="app.model.outputs.datasetOptions"
        label="Dataset"
        required
      />

      <PlDropdown
        v-model="app.model.args.sequenceType"
        :options="sequenceTypeOptions"
        label="Sequence Type"
        required
      />
    </template>
  </GraphMaker>
</template>
