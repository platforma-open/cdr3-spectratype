import type { InferOutputsType, PColumnIdAndSpec } from "@platforma-sdk/model";
import { BlockModelV3 } from "@platforma-sdk/model";
import { blockDataModel } from "./dataModel";
import type { BlockArgs } from "./types";

export { blockDataModel } from "./dataModel";
export { getDefaultBlockLabel } from "./label";
export * from "./types";

export const platforma = BlockModelV3.create(blockDataModel)
  .args<BlockArgs>((data) => {
    if (data.datasetRef === undefined) throw new Error("Dataset is required");
    return {
      datasetRef: data.datasetRef,
      lengthType: data.lengthType,
      scClonotypeChain: data.scChain,
      customBlockLabel: data.customBlockLabel,
    };
  })

  .output("datasetOptions", (ctx) =>
    ctx.resultPool.getOptions(
      [
        {
          axes: [{ name: "pl7.app/sampleId" }, { name: "pl7.app/vdj/clonotypeKey" }],
          annotations: { "pl7.app/isAnchor": "true" },
        },
        {
          axes: [{ name: "pl7.app/sampleId" }, { name: "pl7.app/vdj/scClonotypeKey" }],
          annotations: { "pl7.app/isAnchor": "true" },
        },
      ],
      {
        includeNativeLabel: false,
      },
    ),
  )

  .output("datasetSpec", (ctx) => {
    if (ctx.data.datasetRef === undefined) {
      return undefined;
    }
    return ctx.resultPool.getPColumnSpecByRef(ctx.data.datasetRef);
  })

  // Single-cell IG chain letters ("A" = heavy, "B" = light) that actually have columns
  // for the selected dataset. Returns undefined — meaning "don't filter" — for bulk
  // data, non-IG receptors, and while the pool is resolving.
  .output("availableScChains", (ctx) => {
    const ref = ctx.data.datasetRef;
    if (ref === undefined) return undefined;

    const spec = ctx.resultPool.getPColumnSpecByRef(ref);
    // Only single-cell IG can be single-chain (heavy-only VHH): bulk has no chain axis,
    // and single-cell TCR is always paired — nothing to filter in those cases.
    if (spec?.axesSpec[1]?.name !== "pl7.app/vdj/scClonotypeKey") return undefined;
    if (spec.axesSpec[1]?.domain?.["pl7.app/vdj/receptor"] !== "IG") return undefined;

    // Ask for just the V-gene-hit column per chain
    const vGeneCols = ctx.resultPool.getAnchoredPColumns(
      { main: ref },
      [
        {
          axes: [{ anchor: "main", idx: 1 }],
          name: "pl7.app/vdj/geneHit",
          domain: { "pl7.app/vdj/reference": "VGene" },
        },
      ],
      { ignoreMissingDomains: true },
    );
    if (vGeneCols === undefined) return undefined; // pool still resolving

    const chains = new Set<string>();
    for (const col of vGeneCols) {
      const domain = col.spec.domain;
      if (domain?.["pl7.app/vdj/scClonotypeChain/index"] !== "primary") continue;
      const letter = domain?.["pl7.app/vdj/scClonotypeChain"];
      if (letter) chains.add(letter);
    }
    return [...chains].sort();
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
