<script setup lang="ts">
import { GraphMaker, PredefinedGraphOption } from '@milaboratories/graph-maker';
import '@milaboratories/graph-maker/styles';
import type { PDataColumnSpec } from '@platforma-sdk/model';
import { PlBtnGroup, PlDropdown, PlDropdownRef } from '@platforma-sdk/ui-vue';
import { computed, ref, useTemplateRef } from 'vue';
import { useApp } from '../app';

const app = useApp();

function createDefaultOptions(weightedFlag:boolean):PredefinedGraphOption<'bubble'>[] {
  const mainCol: PDataColumnSpec = {
    kind: 'PColumn',
    valueType: 'Float',
    name: 'pl7.app/vdj/vSpectratype',
    domain: {
      'pl7.app/vdj/cdr3Spectratype/type': weightedFlag ? 'weighted' : 'unweighted',
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
}
const defaultOptions = ref(createDefaultOptions(app.model.ui.weightedFlag));

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

const graphMakerRef = useTemplateRef('graphMaker');

const weightedFlag = computed({
  get: () => {
    return app.model.ui.weightedFlag;
  },
  set: (flag:boolean) => {
    app.model.ui.weightedFlag = flag;
    defaultOptions.value = createDefaultOptions(flag);
    graphMakerRef.value?.reset();
  }
});

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
      <PlBtnGroup v-model="weightedFlag" :options="weightOptions"/>
    </template>
    <template #settingsSlot>
      <PlDropdownRef
        v-model="app.model.args.cdr3Ref"
        :options="app.model.outputs.cdr3Options"
        label="CDR3 sequence"
        required
      />

      <PlDropdown
        v-model="app.model.args.abundanceRef"
        :options="app.model.outputs.abundanceOptions"
        label="Abundance (weight)"
        required
      />

      <PlDropdown
        v-model="app.model.args.vGeneRef"
        :options="app.model.outputs.vGeneOptions"
        label="V gene"
        required
      />
    </template>
  </GraphMaker>
</template>
