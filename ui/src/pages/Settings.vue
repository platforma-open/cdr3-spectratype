<script setup lang="ts">
import type { PlRef } from '@platforma-sdk/model';
import { plRefsEqual } from '@platforma-sdk/model';
import { PlBtnGroup, PlDropdownRef } from '@platforma-sdk/ui-vue';
import { computed } from 'vue';
import { useApp } from '../app';

const app = useApp();

function setInput(inputRef?: PlRef) {
  app.model.args.datasetRef = inputRef;
  if (inputRef) {
    const datasetLabel = app.model.outputs.datasetOptions?.find((o) => plRefsEqual(o.ref, inputRef))?.label;
    if (datasetLabel)
      app.model.ui.blockTitle = 'CDR3 Spectratype - ' + datasetLabel;
  }
}

const isSingleCell = computed(() => {
  const spec = app.model.outputs.datasetSpec;
  if (!spec) {
    return false;
  }
  return spec.axesSpec[1]?.name === 'pl7.app/vdj/scClonotypeKey';
});

const lengthTypeOptions = [
  { label: 'Amino acid', value: 'aminoacid' },
  { label: 'Nucleotide', value: 'nucleotide' },
];

const scChainOptions = computed(() => {
  const spec = app.model.outputs.datasetSpec;
  if (!spec) {
    return undefined;
  }

  const axisSpec = spec.axesSpec[1];
  if (!axisSpec) {
    return undefined;
  }

  const receptor = axisSpec.domain?.['pl7.app/vdj/receptor'];

  switch (receptor) {
    case 'IG':
      return [
        { label: 'Heavy', value: 'A' },
        { label: 'Light', value: 'B' },
      ];
    case 'TCRAB':
      return [
        { label: 'Alpha', value: 'A' },
        { label: 'Beta', value: 'B' },
      ];
    case 'TCRGD':
      return [
        { label: 'Gamma', value: 'A' },
        { label: 'Delta', value: 'B' },
      ];
    default:
      return [];
  }
});
</script>

<template>
  <PlDropdownRef
    v-model="app.model.args.datasetRef"
    :options="app.model.outputs.datasetOptions"
    label="Dataset"
    required
    clearable
    @update:model-value="setInput"
  />

  <PlBtnGroup
    v-model="app.model.args.lengthType"
    :options="lengthTypeOptions"
    label="Length type"
  />

  <PlBtnGroup
    v-if="isSingleCell"
    v-model="app.model.args.scChain"
    :options="scChainOptions ?? []"
    label="Chain"
  />
</template>
