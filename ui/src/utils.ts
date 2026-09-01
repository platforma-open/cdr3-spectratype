import type { ScChain } from "@platforma-open/milaboratories.cdr3-spectratype.model";
import type { PColumnSpec } from "@platforma-sdk/model";
import type { MaybeRefOrGetter } from "vue";
import { computed, toValue, type ComputedRef } from "vue";

export const lengthTypeOptions = [
  { label: "Amino acid", value: "aminoacid" },
  { label: "Nucleotide", value: "nucleotide" },
] as const;

export function useIsSingleCell(
  datasetSpec: MaybeRefOrGetter<PColumnSpec | undefined>,
): ComputedRef<boolean> {
  return computed(() => {
    const spec = toValue(datasetSpec);
    if (!spec) {
      return false;
    }
    return spec.axesSpec[1]?.name === "pl7.app/vdj/scClonotypeKey";
  });
}

export function useScChainOptions(
  datasetSpec: MaybeRefOrGetter<PColumnSpec | undefined>,
  availableChains: MaybeRefOrGetter<string[] | undefined>,
) {
  return computed(() => {
    const spec = toValue(datasetSpec);
    if (!spec) {
      return undefined;
    }

    const axisSpec = spec.axesSpec[1];
    if (!axisSpec) {
      return undefined;
    }

    const receptor = axisSpec.domain?.["pl7.app/vdj/receptor"];

    // Listed in classic biological order; values are domain letters, so TCR pairs read B, A.
    let options: { label: string; value: ScChain }[];
    switch (receptor) {
      case "IG":
        options = [
          { label: "Heavy", value: "A" },
          { label: "Light", value: "B" },
        ];
        break;
      case "TCRAB":
        options = [
          { label: "Alpha", value: "B" },
          { label: "Beta", value: "A" },
        ];
        break;
      case "TCRGD":
        options = [
          { label: "Gamma", value: "B" },
          { label: "Delta", value: "A" },
        ];
        break;
      default:
        return [];
    }

    // Only offer chains that actually have columns. While the presence list is
    // still resolving (undefined), fall back to the full receptor-derived list.
    const available = toValue(availableChains);
    if (available === undefined) {
      return options;
    }
    return options.filter((o) => available.includes(o.value));
  });
}
