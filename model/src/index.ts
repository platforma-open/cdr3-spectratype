import type { GraphMakerState } from '@milaboratories/graph-maker';
import type { InferOutputsType, PlRef, SUniversalPColumnId } from '@platforma-sdk/model';
import { BlockModel, createPFrameForGraphs, isPColumnSpec } from '@platforma-sdk/model';

export type BlockArgs = {
  cdr3Ref?: PlRef;
  abundanceRef?: SUniversalPColumnId;
  vGeneRef?: SUniversalPColumnId;
};

export type UiState = {
  blockTitle: string;
  bubblePlotState: GraphMakerState;
  weightedFlag: boolean;
  vStackedBarPlotState: GraphMakerState;
  cdr3StackedBarPlotState: GraphMakerState;
};

export const model = BlockModel.create()

  .withArgs<BlockArgs>({})

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

  .argsValid((ctx) => ctx.args.cdr3Ref !== undefined)

  .output('cdr3Options', (ctx) =>
    ctx.resultPool.getOptions((c) =>
      isPColumnSpec(c) && c.valueType === 'String'
      && c.name === 'pl7.app/vdj/sequence'
      && c.domain?.['pl7.app/vdj/feature'] === 'CDR3',
    ))

  .output('abundanceOptions', (ctx) => {
    const inputRef = ctx.args.cdr3Ref;
    if (inputRef === undefined) return undefined;
    return ctx.resultPool.getCanonicalOptions({ main: inputRef },
      {
        axes: [{/* sampleId */}, { anchor: 'main', idx: 0 }],
        annotations: {
          'pl7.app/isAbundance': 'true',
          'pl7.app/abundance/normalized': 'false',
        },
      },
    );
  })

  .output('vGeneOptions', (ctx) => {
    const inputRef = ctx.args.cdr3Ref;
    if (inputRef === undefined) return undefined;
    return ctx.resultPool.getCanonicalOptions({ main: inputRef }, [
      {
        axes: [{ anchor: 'main', idx: 0 }],
        name: 'pl7.app/vdj/geneHit',
        domain: {
          'pl7.app/vdj/reference': 'VGene',
          'pl7.app/vdj/scClonotypeChain': { anchor: 'main' },
          'pl7.app/vdj/scClonotypeChain/index': { anchor: 'main' },
        },
      },
      {
        axes: [{ anchor: 'main', idx: 0 }],
        name: 'pl7.app/vdj/geneHitWithAllele',
        domain: {
          'pl7.app/vdj/reference': 'VGene',
          'pl7.app/vdj/scClonotypeChain': { anchor: 'main' },
          'pl7.app/vdj/scClonotypeChain/index': { anchor: 'main' },
        },
      },
    ], { ignoreMissingDomains: true });
  })

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
