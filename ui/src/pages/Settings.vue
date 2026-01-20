<script setup lang="ts">
import type { PlRef } from '@platforma-sdk/model';
import { PlBtnGroup, PlDropdownRef, PlTextField } from '@platforma-sdk/ui-vue';
import { computed } from 'vue';
import { useApp } from '../app';
import { lengthTypeOptions, useIsSingleCell, useScChainOptions } from './constants';

const app = useApp();

function setInput(inputRef?: PlRef) {
  app.model.args.datasetRef = inputRef;
}

const isSingleCell = useIsSingleCell(computed(() => app.model.outputs.datasetSpec));
const scChainOptions = useScChainOptions(computed(() => app.model.outputs.datasetSpec));
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
