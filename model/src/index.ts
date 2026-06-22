import type { InferOutputsType, PColumnIdAndSpec } from "@platforma-sdk/model";
import { BlockModelV3 } from "@platforma-sdk/model";
import { blockDataModel } from "./dataModel";
import type { BlockArgs } from "./types";

export { getDefaultBlockLabel } from "./label";
export { blockDataModel } from "./dataModel";
export * from "./types";

export const platforma = BlockModelV3.create(blockDataModel)
  .args<BlockArgs>((data) => {
    if (data.datasetRef === undefined) throw new Error("Dataset is required");
    return {
      datasetRef: data.datasetRef,
      lengthType: data.lengthType,
      scChain: data.scChain,
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
