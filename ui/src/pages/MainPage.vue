<script setup lang="ts">
import '@milaboratories/graph-maker/styles';
import { plRefsEqual, type PlRef } from '@platforma-sdk/model';
import type { PlDataTableSettings } from '@platforma-sdk/ui-vue';
import { PlAgDataTable, PlAgDataTableToolsPanel, PlBlockPage, PlBtnGhost, PlBtnGroup, PlDropdownRef, PlEditableTitle, PlMaskIcon24, PlSlideModal } from '@platforma-sdk/ui-vue';
import { computed, ref } from 'vue';
import { useApp } from '../app';

const app = useApp();

const settingsOpen = ref(app.model.args.cdr3LengthRef === undefined);

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

const tableSettings = computed<PlDataTableSettings>(() => ({
  sourceType: 'ptable',
  pTable: app.model.outputs.pt?.table,
  sheets: app.model.outputs.pt?.sheets,
}));

const weightOptions = [{
  value: 'read',
  label: 'Reads',
}, {
  value: 'none',
  label: 'None',
}];

</script>

<template>
  <PlBlockPage>
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
    <PlAgDataTable v-model="app.model.ui.tableState" :settings="tableSettings" show-export-button />
  </PlBlockPage>

  <PlSlideModal v-model="settingsOpen">
    <template #title>Settings</template>

    <PlDropdownRef
      v-model="app.model.args.cdr3LengthRef"
      :options="app.model.outputs.cdr3Options"
      label="CDR3 length"
      required
      @update:model-value="setInput"
    />

    <PlBtnGroup v-model="app.model.args.weight" :options="weightOptions" label="Clonotype weight"/>
  </PlSlideModal>
</template>
