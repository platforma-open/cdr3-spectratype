<script setup lang="ts">
import type { DatasetSelection } from "@platforma-sdk/model";
import { createDatasetSelection, createPrimaryRef } from "@platforma-sdk/model";
import { PlAlert, PlBtnGroup, PlDatasetSelector, PlTextField } from "@platforma-sdk/ui-vue";
import { computed } from "vue";
import { useApp } from "../app";
import { lengthTypeOptions, useScChainOptions } from "../utils";

const app = useApp();

const isSingleCell = computed(() => app.model.outputs.isSingleCell ?? false);
const scChainOptions = useScChainOptions(
  computed(() => app.model.outputs.datasetSpec),
  computed(() => app.model.outputs.availableScChains),
);

const datasetSelection = computed<DatasetSelection | undefined>({
  get: () => {
    const { datasetRef, filterRef } = app.model.data;
    if (datasetRef === undefined) return undefined;
    return createDatasetSelection(createPrimaryRef(datasetRef, filterRef));
  },
  set: (selection) => {
    app.model.data.datasetRef = selection?.primary.column;
    app.model.data.filterRef = selection?.primary.filter;
  },
});

const noNucleotideCdr3 = computed(() => app.model.outputs.hasNucleotideCdr3 === false);
</script>

<template>
  <PlDatasetSelector
    v-model="datasetSelection"
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
    :disabled="noNucleotideCdr3"
    label="Length type"
  />

  <PlAlert v-if="noNucleotideCdr3" type="info" :class="$style.wrap">
    The selected dataset has no nucleotide CDR3 sequence, so CDR3 length is measured in amino acids.
  </PlAlert>

  <PlBtnGroup
    v-if="isSingleCell && (scChainOptions?.length ?? 0) > 1"
    v-model="app.model.data.scChain"
    :options="scChainOptions ?? []"
    label="Chain"
  />
</template>

<style module>
/* Take the panel's width instead of setting it: the settings panel sizes to its widest child, so
   a long line of alert text would otherwise stretch it. */
.wrap {
  width: 0;
  min-width: 100%;
}
</style>
