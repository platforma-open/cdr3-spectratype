import type { PColumnSpec, PlRef, ResultPool } from "@platforma-sdk/model";

type AxisSpec = PColumnSpec["axesSpec"][number];

/**
 * Whether the dataset's key axis is a receptor record this block can compute spectratypes on.
 *
 * `pl7.app/variantKey` is shared vocabulary: peptide-extraction stamps
 * `pl7.app/peptide/extractionRunId`, synthetic-repertoire-profiler stamps
 * `pl7.app/repertoire/extractionRunId`, and import-vdj-data's imported ("bare") sets stamp
 * `pl7.app/vdj/clonotypingRunId`. Only the last are antibody/TCR records, so the run-id key is
 * what admits them without also offering peptides and amplicon variants.
 *
 * The value of that key is the producing block's id, so it cannot be written into a declarative
 * axis selector — hence the predicate form of `getOptions`.
 */
export function isReceptorRecordAxis(axis: AxisSpec | undefined): boolean {
  if (axis === undefined) return false;
  if (axis.name === "pl7.app/vdj/clonotypeKey" || axis.name === "pl7.app/vdj/scClonotypeKey") {
    return true;
  }
  return isBareSetAxis(axis);
}

/** An imported (bare) antibody/TCR set: `variantKey` carrying the VDJ run-id key. */
export function isBareSetAxis(axis: AxisSpec | undefined): boolean {
  return (
    axis?.name === "pl7.app/variantKey" &&
    axis.domain?.["pl7.app/vdj/clonotypingRunId"] !== undefined
  );
}

export function isDatasetSpec(spec: PColumnSpec): boolean {
  return (
    spec.annotations?.["pl7.app/isAnchor"] === "true" &&
    spec.axesSpec.length >= 2 &&
    spec.axesSpec[0]?.name === "pl7.app/sampleId" &&
    isReceptorRecordAxis(spec.axesSpec[1])
  );
}

/**
 * Whether records carry two chains in one frame, in the `pl7.app/vdj/scClonotypeChain` COLUMN
 * domain.
 *
 * Legacy MiXCR single-cell declares pairing on the axis NAME; an imported paired set declares it
 * only on the columns, so the axis alone cannot answer. Probing for such a column covers both.
 */
export function isPairedDataset(resultPool: ResultPool, ref: PlRef): boolean {
  if (resultPool.getPColumnSpecByRef(ref)?.axesSpec[1]?.name === "pl7.app/vdj/scClonotypeKey") {
    return true;
  }
  // Scoped to the dataset's record axis. A selector without `axes` carries no anchor reference
  // at all, so it is matched against the whole result pool: a single-cell block anywhere in the
  // project would mark every bulk dataset as paired.
  const perChain = resultPool.getAnchoredPColumns({ main: ref }, [
    {
      axes: [{ anchor: "main", idx: 1 }],
      name: "pl7.app/vdj/sequence",
      domain: { "pl7.app/vdj/scClonotypeChain/index": "primary" },
    },
  ]);
  return (perChain?.length ?? 0) > 0;
}

/**
 * The chains that carry a gene column for every one of `references` (`VGene`, `JGene`): chain
 * letters (`A`/`B`) for a paired dataset, `""` for a dataset whose gene columns name no chain.
 * `undefined` while the pool is still resolving.
 *
 * Only the primary chain of each letter counts, as the workflow picks exactly that one.
 */
export function chainsWithGenes(
  resultPool: ResultPool,
  ref: PlRef,
  references: string[],
): string[] | undefined {
  const geneCols = resultPool.getAnchoredPColumns(
    { main: ref },
    references.map((reference) => ({
      axes: [{ anchor: "main", idx: 1 }],
      name: "pl7.app/vdj/geneHit",
      domain: { "pl7.app/vdj/reference": reference },
    })),
    { ignoreMissingDomains: true },
  );
  if (geneCols === undefined) return undefined;

  const byChain = new Map<string, Set<string>>();
  for (const col of geneCols) {
    const domain = col.spec.domain ?? {};
    const letter = domain["pl7.app/vdj/scClonotypeChain"] ?? "";
    if (letter !== "" && domain["pl7.app/vdj/scClonotypeChain/index"] !== "primary") continue;
    const reference = domain["pl7.app/vdj/reference"];
    if (reference === undefined) continue;
    byChain.set(letter, (byChain.get(letter) ?? new Set()).add(reference));
  }
  return [...byChain]
    .filter(([, found]) => references.every((reference) => found.has(reference)))
    .map(([letter]) => letter)
    .sort();
}
