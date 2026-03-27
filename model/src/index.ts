import type { GraphMakerState } from '@milaboratories/graph-maker';
import type { InferOutputsType, PColumnIdAndSpec, PlRef } from '@platforma-sdk/model';
import { BlockModel } from '@platforma-sdk/model';
import { getDefaultBlockLabel } from './label';

export type BlockArgs = {
  defaultBlockLabel: string;
  customBlockLabel: string;
  datasetRef?: PlRef;
  lengthType: 'aminoacid' | 'nucleotide';
  scChain: 'A' | 'B';
};

export type UiState = {
  bubblePlotState: GraphMakerState;
  weightedFlag: boolean;
  vStackedBarPlotState: GraphMakerState;
  cdr3StackedBarPlotState: GraphMakerState;
  aaPositionPlotState: GraphMakerState;
};

export const model = BlockModel.create()

  .withArgs<BlockArgs>({
    defaultBlockLabel: getDefaultBlockLabel({
      lengthType: 'aminoacid',
      isSingleCell: false,
    }),
    customBlockLabel: '',
    lengthType: 'aminoacid',
    scChain: 'A',
  })

  .withUiState<UiState>({
    bubblePlotState: {
      title: 'CDR3 V Spectratype',
      template: 'bubble',
      currentTab: 'settings',
    },
    weightedFlag: true,
    vStackedBarPlotState: {
      title: 'CDR3 V Spectratype',
      template: 'stackedBar',
      currentTab: null,
    },
    cdr3StackedBarPlotState: {
      title: 'CDR3 Spectratype',
      template: 'stackedBar',
      currentTab: null,
    },
    aaPositionPlotState: {
      title: 'CDR3 AA Position',
      template: 'stackedBar',
      currentTab: null,
    },
  })

  .argsValid((ctx) => {
    return ctx.args.datasetRef !== undefined
      && ctx.args.lengthType !== undefined
      && ctx.args.scChain !== undefined;
  })

  .output('datasetOptions', (ctx) =>
    ctx.resultPool.getOptions(
      [
        {
          axes: [{ name: 'pl7.app/sampleId' }, { name: 'pl7.app/vdj/clonotypeKey' }],
          annotations: { 'pl7.app/isAnchor': 'true' },
        },
        {
          axes: [{ name: 'pl7.app/sampleId' }, { name: 'pl7.app/vdj/scClonotypeKey' }],
          annotations: { 'pl7.app/isAnchor': 'true' },
        },
      ],
      {
        includeNativeLabel: false,
      },
    ),
  )

  .output('datasetSpec', (ctx) => {
    if (ctx.args.datasetRef === undefined) {
      return undefined;
    }
    return ctx.resultPool.getPColumnSpecByRef(ctx.args.datasetRef);
  })

  .outputWithStatus('pf', (ctx) => {
    const pCols = ctx.outputs?.resolve('pf')?.getPColumns();
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
    const datasetRef = ctx.args.datasetRef;
    const anchoredMeta = datasetRef !== undefined
      ? (ctx.resultPool.getAnchoredPColumns(
          { main: datasetRef },
          [{ axes: [{ anchor: 'main', idx: 0 }] }],
        ) ?? []).filter((c) => c.spec.name !== 'pl7.app/label')
      : [];

    return ctx.createPFrame([...pCols, ...anchoredMeta]);
  })

  // Returns a list of Pcols for plot defaults - only from this block's workflow
  .output('pfPcols', (ctx) => {
    const pCols = ctx.outputs?.resolve('pf')?.getPColumns();
    if (pCols === undefined) {
      return undefined;
    }

    return pCols.map(
      (c) =>
        ({
          columnId: c.id,
          spec: c.spec,
        } satisfies PColumnIdAndSpec),
    );
  })

  .outputWithStatus('aaPositionPf', (ctx) => {
    const datasetRef = ctx.args.datasetRef;
    if (datasetRef === undefined) return undefined;

    const pCols = ctx.resultPool.getAnchoredPColumns(
      { main: datasetRef },
      [{
        axes: [
          { anchor: 'main', idx: 0 },
          { anchor: 'main', idx: 1 },
          { name: 'pl7.app/vdj/chain' },
          { name: 'pl7.app/vdj/numberingPosition' },
        ],
      }],
    );

    if (!pCols || pCols.length === 0) return undefined;
    return ctx.createPFrame(pCols);
  })

  .output('aaPositionPCols', (ctx) => {
    const datasetRef = ctx.args.datasetRef;
    if (datasetRef === undefined) return undefined;

    const pCols = ctx.resultPool.getAnchoredPColumns(
      { main: datasetRef },
      [{
        axes: [
          { anchor: 'main', idx: 0 },
          { anchor: 'main', idx: 1 },
          { name: 'pl7.app/vdj/chain' },
          { name: 'pl7.app/vdj/numberingPosition' },
        ],
      }],
    );

    if (!pCols || pCols.length === 0) return undefined;
    return pCols.map((c) => ({ columnId: c.id, spec: c.spec } satisfies PColumnIdAndSpec));
  })

  .output('isRunning', (ctx) => ctx.outputs?.getIsReadyOrError() === false)

  .title(() => 'CDR3 Spectratype')

  .subtitle((ctx) => ctx.args.customBlockLabel || ctx.args.defaultBlockLabel)

  .sections((ctx) => {
    const datasetRef = ctx.args?.datasetRef;
    const hasAaPositions = datasetRef
      ? (ctx.resultPool.getAnchoredPColumns(
          { main: datasetRef },
          [{
            axes: [
              { anchor: 'main', idx: 0 },
              { anchor: 'main', idx: 1 },
              { name: 'pl7.app/vdj/chain' },
              { name: 'pl7.app/vdj/numberingPosition' },
            ],
          }],
        ) ?? []).length > 0
      : false;

    return [
      { type: 'link', href: '/', label: 'Bubble Plot' },
      { type: 'link', href: '/vStackedBarPlot', label: 'V Spectratype' },
      { type: 'link', href: '/cdr3StackedBarPlot', label: 'CDR3 Spectratype' },
      ...(hasAaPositions ? [{ type: 'link' as const, href: '/aaPositionPlot' as const, label: 'AA Position' }] : []),
    ];
  })

  .done(2);

export type BlockOutputs = InferOutputsType<typeof model>;

export { getDefaultBlockLabel } from './label';
