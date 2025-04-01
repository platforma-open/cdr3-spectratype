import type { GraphMakerState } from '@milaboratories/graph-maker';
import type { InferOutputsType, PlDataTableState, PlRef } from '@platforma-sdk/model';
import { BlockModel, createPFrameForGraphs, createPlDataTable, createPlDataTableSheet, getUniquePartitionKeys, isPColumnSpec } from '@platforma-sdk/model';

export type BlockArgs = {
  cdr3LengthRef?: PlRef;
  weight: 'read' | 'none';
  clonotypingRunId?: string; // TODO: remove this
  scClonotypeChain?: string; // TODO: remove this
};

export type UiState = {
  blockTitle: string;
  bubblePlotState: GraphMakerState;
  stackedBarPlotState: GraphMakerState;
  tableState?: PlDataTableState;
};

export const model = BlockModel.create()

  .withArgs<BlockArgs>({
    weight: 'read',
  })

  .withUiState<UiState>({
    blockTitle: 'CDR3 Spectratype',
    bubblePlotState: {
      title: 'CDR3 Spectratype',
      template: 'bubble',
    },
    stackedBarPlotState: {
      title: 'CDR3 Spectratype',
      template: 'stackedBar',
    },
    tableState: {
      gridState: {},
      pTableParams: {
        sorting: [],
        filters: [],
      },
    },
  })

  .argsValid((ctx) => ctx.args.cdr3LengthRef !== undefined)

  .output('cdr3Options', (ctx) =>
    ctx.resultPool.getOptions((c) =>
      isPColumnSpec(c) && c.valueType === 'Int'
      && c.name === 'pl7.app/vdj/sequenceLength'
      && c.domain?.['pl7.app/vdj/feature'] === 'CDR3',
    ))

  .output('pt', (ctx) => {
    const pCols = ctx.outputs?.resolve('spectratype')?.getPColumns();
    if (pCols === undefined) {
      return undefined;
    }

    const anchor = pCols[0];
    if (!anchor) return undefined;

    const r = getUniquePartitionKeys(anchor.data);
    if (!r) return undefined;

    return {
      table: createPlDataTable(ctx, pCols, ctx.uiState?.tableState),
      sheets: r.map((values, i) => createPlDataTableSheet(ctx, anchor.spec.axesSpec[i], values)),
    };
  })

  .output('pf', (ctx) => {
    const pCols = ctx.outputs?.resolve('spectratype')?.getPColumns();
    if (pCols === undefined) {
      return undefined;
    }

    return createPFrameForGraphs(ctx, pCols);
  })

  .output('isRunning', (ctx) => ctx.outputs?.getIsReadyOrError() === false)

  .title((ctx) => ctx.uiState?.blockTitle ?? 'CDR3 Spectratype')

  .sections((_) => [
    { type: 'link', href: '/', label: 'Table' },
    { type: 'link', href: '/bubblePlot', label: 'Bubble Plot' },
    { type: 'link', href: '/stackedBarPlot', label: 'Bar Plot' },
  ])

  .done();

export type BlockOutputs = InferOutputsType<typeof model>;
