<script setup lang="ts">
import type { PlRef } from '@platforma-sdk/model';
import { plRefsEqual } from '@platforma-sdk/model';
import { PlBtnGroup, PlDropdownRef, PlTextField } from '@platforma-sdk/ui-vue';
import { computed, watchEffect } from 'vue';
import { useApp } from '../app';

const app = useApp();

function setInput(inputRef?: PlRef) {
  app.model.args.datasetRef = inputRef;
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

// Build defaultBlockLabel from dataset name, length type and chain (for single-cell)
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

  <PlTextField
    v-model="app.model.args.customBlockLabel"
    label="Custom label"
    :clearable="true"
    :placeholder="app.model.args.defaultBlockLabel"
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
