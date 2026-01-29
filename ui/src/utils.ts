import type { PColumnSpec } from '@platforma-sdk/model';
import { computed, type ComputedRef } from 'vue';

export const lengthTypeOptions = [
  { label: 'Amino acid', value: 'aminoacid' },
  { label: 'Nucleotide', value: 'nucleotide' },
] as const;

export function useIsSingleCell(datasetSpec: ComputedRef<PColumnSpec | undefined>): ComputedRef<boolean> {
  return computed(() => {
    const spec = datasetSpec.value;
    if (!spec) {
      return false;
    }
    return spec.axesSpec[1]?.name === 'pl7.app/vdj/scClonotypeKey';
  });
}

export function useScChainOptions(datasetSpec: ComputedRef<PColumnSpec | undefined>) {
  return computed(() => {
    const spec = datasetSpec.value;
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
}
