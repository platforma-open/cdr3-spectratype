<script setup lang="ts">
import type { GraphMakerProps } from '@milaboratories/graph-maker';
import { GraphMaker } from '@milaboratories/graph-maker';
import '@milaboratories/graph-maker/styles';
import { plRefsEqual, type PlRef } from '@platforma-sdk/model';
import { PlDropdownRef } from '@platforma-sdk/ui-vue';
// import { ref } from 'vue';
import { useApp } from '../app';

const app = useApp();

// const settingsOpen = ref(false);

function setInput(inputRef?: PlRef) {
  if (!inputRef) return;
  app.model.args.cdr3LengthRef = inputRef;
  app.model.args.clonotypingRunId = inputRef?.blockId;

  const l = app.model.outputs.cdr3Options?.find((o) => plRefsEqual(o.ref, inputRef))?.label;

  if (l?.indexOf('heavy') !== -1) {
    app.model.args.scClonotypeChain = 'IGHeavy';
  } else if (l?.indexOf('light') !== -1) {
    app.model.args.scClonotypeChain = 'IGLight';
  }
}

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
    v-model="app.model.ui.graphState"
    chart-type="bubble"
    :p-frame="app.model.outputs.pf"
    :default-options="defaultOptions"
  >
    <template #titleLineSlot>
      <PlDropdownRef
        v-model="app.model.args.cdr3LengthRef"
        :options="app.model.outputs.cdr3Options"
        label="CDR3 length"
        :style="{ width: '300px' }"
        @update:model-value="setInput"
      />
    </template>
  </GraphMaker>

  <!-- <PlBlockPage>
    <template #title>
      <PlEditableTitle v-model="app.model.ui.blockTitle" max-width="600px" :max-length="40" />
    </template>
    <template #append>
      <PlAgDataTableToolsPanel />

      <PlBtnGhost @click.stop="settingsOpen = true">
        Settings
        <template #append>
          <PlMaskIcon24 name="settings" />
        </template>
      </PlBtnGhost>
    </template>
  </PlBlockPage>

  <PlSlideModal v-model="settingsOpen">
    <template #header>Settings</template>

    <PlDropdownRef v-model="app.model.args.cdr3LengthRef" :options="app.model.outputs.cdr3Options" @update:model-value="setInput"/>
    <PlDropdownRef v-model="app.model.args.weightRef" :options="app.model.outputs.weightOptions" />
    <PlDropdownRef v-model="app.model.args.vGeneRef" :options="app.model.outputs.vGeneOptions" />
  </PlSlideModal> -->
</template>
