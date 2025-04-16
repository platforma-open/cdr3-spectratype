<script setup lang="ts">
import { GraphMaker, PredefinedGraphOption } from '@milaboratories/graph-maker';
import '@milaboratories/graph-maker/styles';
import { PlBtnGroup } from '@platforma-sdk/ui-vue';
import { computed, ref, useTemplateRef } from 'vue';
import { useApp } from '../app';

const app = useApp();

function createDefaultOptions(weightedFlag:boolean):PredefinedGraphOption<'discrete'>[] {
  return [
    {
      inputName: 'y',
      selectedSource: {
        kind: 'PColumn',
        valueType: 'Float',
        name: 'pl7.app/vdj/vSpectratype',
        domain: {
          'pl7.app/vdj/cdr3Spectratype/type': weightedFlag ? 'weighted' : 'unweighted',
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
    v-model="app.model.ui.vStackedBarPlotState"
    chart-type="discrete"
    :p-frame="app.model.outputs.pf"
    :default-options="defaultOptions"
    :readonly-inputs="[ 'y', 'primaryGrouping', 'secondaryGrouping']"
  >
    <template #titleLineSlot>
      <PlBtnGroup v-model="weightedFlag" :options="weightOptions" />
    </template>
  </GraphMaker>
</template>
