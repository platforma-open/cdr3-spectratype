import type { GraphMakerState } from '@milaboratories/graph-maker';
import type { InferOutputsType, PlRef } from '@platforma-sdk/model';
import { BlockModel, createPFrameForGraphs } from '@platforma-sdk/model';

export type BlockArgs = {
  datasetRef?: PlRef;
  sequenceType: 'aminoacid' | 'nucleotide';
};

export type UiState = {
  blockTitle: string;
  bubblePlotState: GraphMakerState;
  weightedFlag: boolean;
  vStackedBarPlotState: GraphMakerState;
  cdr3StackedBarPlotState: GraphMakerState;
};

export const model = BlockModel.create()

  .withArgs<BlockArgs>({
    sequenceType: 'aminoacid',
  })

  .withUiState<UiState>({
    blockTitle: 'CDR3 Spectratype',
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
  })

  .argsValid((ctx) => {
    return [
      ctx.args.datasetRef,
      ctx.args.sequenceType,
    ].every((arg) => arg !== undefined);
  })

  .output('datasetOptions', (ctx) =>
    ctx.resultPool.getOptions([{
      axes: [
        { name: 'pl7.app/sampleId' },
        { name: 'pl7.app/vdj/clonotypeKey' },
      ],
      annotations: { 'pl7.app/isAnchor': 'true' },
    }, {
      axes: [
        { name: 'pl7.app/sampleId' },
        { name: 'pl7.app/vdj/scClonotypeKey' },
      ],
      annotations: { 'pl7.app/isAnchor': 'true' },
    }],
    {
      // suppress native label of the column (e.g. "Number of Reads") to show only the dataset label
      label: { includeNativeLabel: false },
    }),
  )

  .output('pf', (ctx) => {
    const pCols = ctx.outputs?.resolve('pf')?.getPColumns();
    if (pCols === undefined) {
      return undefined;
    }

    return createPFrameForGraphs(ctx, pCols);
  })

  .output('isRunning', (ctx) => ctx.outputs?.getIsReadyOrError() === false)

  .title((ctx) => ctx.uiState?.blockTitle ?? 'CDR3 Spectratype')

  .sections((_) => [
    { type: 'link', href: '/', label: 'Bubble Plot' },
    { type: 'link', href: '/vStackedBarPlot', label: 'V Spectratype' },
    { type: 'link', href: '/cdr3StackedBarPlot', label: 'CDR3 Spectratype' },
  ])

  .done();

export type BlockOutputs = InferOutputsType<typeof model>;
