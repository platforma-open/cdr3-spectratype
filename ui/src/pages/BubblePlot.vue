<script setup lang="ts">
import type { GraphMakerProps } from '@milaboratories/graph-maker';
import { GraphMaker } from '@milaboratories/graph-maker';
import '@milaboratories/graph-maker/styles';
// import { ref } from 'vue';
import { useApp } from '../app';

const app = useApp();

const defaultOptions: GraphMakerProps['defaultOptions'] = [
  {
    inputName: 'valueSize',
    selectedSource: {
      kind: 'PColumn',
      valueType: 'Float',
      name: 'pl7.app/vdj/cdr3Spectratype',
      axesSpec: [],
    },
  },
  {
    inputName: 'valueColor',
    selectedSource: {
      kind: 'PColumn',
      valueType: 'Float',
      name: 'pl7.app/vdj/cdr3Spectratype',
      axesSpec: [],
    },
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

</script>

<template>
  <GraphMaker
    v-model="app.model.ui.bubblePlotState"
    chart-type="bubble"
    :p-frame="app.model.outputs.pf"
    :default-options="defaultOptions"
  />
</template>
