<script setup lang="ts">
import { PlBtnGroup, PlDropdownRef, PlTextField } from "@platforma-sdk/ui-vue";
import { computed } from "vue";
import { useApp } from "../app";
import { lengthTypeOptions, useIsSingleCell, useScChainOptions } from "../utils";

const app = useApp();

const isSingleCell = useIsSingleCell(computed(() => app.model.outputs.datasetSpec));
const scChainOptions = useScChainOptions(
  computed(() => app.model.outputs.datasetSpec),
  computed(() => app.model.outputs.availableScChains),
);
</script>

<template>
  <PlDropdownRef
    v-model="app.model.data.datasetRef"
    :options="app.model.outputs.datasetOptions"
    label="Select dataset"
    required
    clearable
  />

  <PlTextField
    v-model="app.model.data.customBlockLabel"
    label="Block title"
    :clearable="true"
    :placeholder="app.model.data.defaultBlockLabel"
  />

  <PlBtnGroup
    v-model="app.model.data.lengthType"
    :options="lengthTypeOptions"
    label="Length type"
  />

  <PlBtnGroup
    v-if="isSingleCell && (scChainOptions?.length ?? 0) > 1"
    v-model="app.model.data.scChain"
    :options="scChainOptions ?? []"
    label="Chain"
  />
</template>
