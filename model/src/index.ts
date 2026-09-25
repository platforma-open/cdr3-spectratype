import type { InferOutputsType, PColumnIdAndSpec } from "@platforma-sdk/model";
import { BlockModelV3, isPColumnSpec } from "@platforma-sdk/model";
import { kind } from "@platforma-open/milaboratories.cdr3-spectratype.kind";
import { blockDataModel } from "./dataModel";
import { chainsWithGenes, isBareSetAxis, isDatasetSpec, isPairedDataset } from "./dataset";
import { deriveTemplateParams } from "./templateParams";
import type { BlockArgs } from "./types";

export { blockDataModel, initBlockData } from "./dataModel";
export { deriveTemplateParams } from "./templateParams";
export { getDefaultBlockLabel } from "./label";
export * from "./types";

/** The V spectratype groups by V gene, so a chain without one cannot be run. */
const GENES = ["VGene"];

export const platforma = BlockModelV3.create({ dataModel: blockDataModel, kind })
  .args<BlockArgs>((data) => {
    if (data.datasetRef === undefined) throw new Error("Dataset is required");
    return {
      datasetRef: data.datasetRef,
      lengthType: data.lengthType,
      scClonotypeChain: data.scChain,
      customBlockLabel: data.customBlockLabel,
    };
  })

  .templateParams(deriveTemplateParams)

  // MiXCR datasets always carry a V gene column; an imported (bare) set carries one only when
  // the file mapped it, so one without a V gene on some chain is not offered at all.
  .output("datasetOptions", (ctx) =>
    ctx.resultPool
      .getOptions((spec) => isPColumnSpec(spec) && isDatasetSpec(spec), {
        label: { includeNativeLabel: false },
      })
      .filter(
        (option) =>
          !isBareSetAxis(ctx.resultPool.getPColumnSpecByRef(option.ref)?.axesSpec[1]) ||
          (chainsWithGenes(ctx.resultPool, option.ref, GENES)?.length ?? 0) > 0,
      ),
  )

  .output("datasetSpec", (ctx) => {
    if (ctx.data.datasetRef === undefined) {
      return undefined;
    }
    return ctx.resultPool.getPColumnSpecByRef(ctx.data.datasetRef);
  })

  .output("isSingleCell", (ctx) => {
    const ref = ctx.data.datasetRef;
    if (ref === undefined) return undefined;
    return isPairedDataset(ctx.resultPool, ref);
  })

  // Chain letters ("A" / "B") that actually have a V gene column for the selected paired
  // dataset. Returns undefined — meaning "don't filter" — for unpaired data and while the pool
  // is resolving. Heavy-only VHH and imported sets with genes mapped for one chain only are
  // what this narrows.
  .output("availableScChains", (ctx) => {
    const ref = ctx.data.datasetRef;
    if (ref === undefined) return undefined;
    if (!isPairedDataset(ctx.resultPool, ref)) return undefined;
    return chainsWithGenes(ctx.resultPool, ref, GENES)?.filter((letter) => letter !== "");
  })

  // Whether the selected dataset (and chain, when paired) has a nucleotide CDR3 to measure.
  // Imported (bare) sets carry the amino-acid CDR3 only. undefined while nothing is selected or
  // the pool is resolving — meaning "don't restrict".
  .output("hasNucleotideCdr3", (ctx) => {
    const ref = ctx.data.datasetRef;
    if (ref === undefined) return undefined;
    const cdr3Cols = ctx.resultPool.getAnchoredPColumns(
      { main: ref },
      [
        {
          axes: [{ anchor: "main", idx: 1 }],
          name: "pl7.app/vdj/sequence",
          domain: { "pl7.app/vdj/feature": "CDR3", "pl7.app/alphabet": "nucleotide" },
        },
      ],
      { ignoreMissingDomains: true },
    );
    if (cdr3Cols === undefined) return undefined;
    if (!isPairedDataset(ctx.resultPool, ref)) return cdr3Cols.length > 0;
    return cdr3Cols.some(
      (col) =>
        col.spec.domain?.["pl7.app/vdj/scClonotypeChain"] === ctx.data.scChain &&
        col.spec.domain?.["pl7.app/vdj/scClonotypeChain/index"] === "primary",
    );
  })

  .outputWithStatus("pf", (ctx) => {
    const pCols = ctx.outputs?.resolve("pf")?.getPColumns();
    if (pCols === undefined) {
      return undefined;
    }

    // Use ctx.createPFrame (not createPFrameForGraphs) to avoid pulling in
    // result-pool columns from other datasets sharing the same samples block.
    // The workflow outputs a dataset-scoped pl7.app/label column in pCols.
    // Additionally, include single-axis (sampleId-only) metadata columns from
    // the result pool anchored to this dataset (e.g. sample groups, patient IDs
    // added in an upstream samples & data block) for use in graph-maker.
    // Exclude pl7.app/label since the workflow already provides a dataset-scoped version.
    const datasetRef = ctx.data.datasetRef;
    const anchoredMeta =
      datasetRef !== undefined
        ? (
            ctx.resultPool.getAnchoredPColumns({ main: datasetRef }, [
              { axes: [{ anchor: "main", idx: 0 }] },
            ]) ?? []
          ).filter((c) => c.spec.name !== "pl7.app/label")
        : [];

    return ctx.createPFrame([...pCols, ...anchoredMeta]);
  })

  // Returns a list of Pcols for plot defaults - only from this block's workflow
  .output("pfPcols", (ctx) => {
    const pCols = ctx.outputs?.resolve("pf")?.getPColumns();
    if (pCols === undefined) {
      return undefined;
    }

    return pCols.map(
      (c) =>
        ({
          columnId: c.id,
          spec: c.spec,
        }) satisfies PColumnIdAndSpec,
    );
  })

  .output("isRunning", (ctx) => ctx.outputs?.getIsReadyOrError() === false)

  .title(() => "CDR3 Spectratype")

  .subtitle((ctx) => ctx.data.customBlockLabel || ctx.data.defaultBlockLabel)

  .sections(() => [
    { type: "link" as const, href: "/" as const, label: "Bubble Plot" },
    { type: "link" as const, href: "/vStackedBarPlot" as const, label: "V Spectratype" },
    { type: "link" as const, href: "/cdr3StackedBarPlot" as const, label: "CDR3 Spectratype" },
  ])

  .done();

export type Platforma = typeof platforma;
export type BlockOutputs = InferOutputsType<typeof platforma>;
