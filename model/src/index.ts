import type { GraphMakerState } from '@milaboratories/graph-maker';
import type { InferOutputsType, PlRef } from '@platforma-sdk/model';
import { BlockModel, createPFrameForGraphs, isPColumnSpec } from '@platforma-sdk/model';

export type BlockArgs = {
  cdr3LengthRef?: PlRef;
  vGeneRef?: PlRef;
  weightRef?: PlRef;
  clonotypingRunId?: string;
  scClonotypeChain?: string;
};

export type UiState = {
  blockTitle: string;
  graphState: GraphMakerState;
};

export const model = BlockModel.create()

  .withArgs<BlockArgs>({})

  .withUiState<UiState>({
    blockTitle: 'CDR3 Spectratype',
    graphState: {
      title: 'CDR3 Spectratype',
      template: 'bubble',
    },
  })

  .output('cdr3Options', (ctx) =>
    ctx.resultPool.getOptions((c) =>
      isPColumnSpec(c) && c.valueType === 'Int'
      && c.name === 'pl7.app/vdj/sequenceLength'
      && c.domain?.['pl7.app/vdj/feature'] === 'CDR3',
    ))

  .output('weightOptions', (ctx) => {
    const cdr3LengthRef = ctx.args.cdr3LengthRef;
    if (cdr3LengthRef === undefined)
      return undefined;
    return ctx.resultPool.getOptions((c) =>
      isPColumnSpec(c)
      && (c.name === 'pl7.app/vdj/readCount' || c.name === 'pl7.app/vdj/umiCount')
      && c.domain?.['pl7.app/vdj/clonotypingRunId']
      === ctx.resultPool.getPColumnSpecByRef(cdr3LengthRef)?.domain?.['pl7.app/vdj/clonotypingRunId'],
    );
  })

  .output('vGeneOptions', (ctx) => {
    const cdr3LengthRef = ctx.args.cdr3LengthRef;
    if (cdr3LengthRef === undefined)
      return undefined;
    return ctx.resultPool.getOptions((c) =>
      isPColumnSpec(c)
      && c.name === 'pl7.app/vdj/geneHit'
      && c.domain?.['pl7.app/vdj/reference'] === 'VGene'
      && c.domain?.['pl7.app/vdj/clonotypingRunId']
      === ctx.resultPool.getPColumnSpecByRef(cdr3LengthRef)?.domain?.['pl7.app/vdj/clonotypingRunId'],
    );
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

  .sections((_ctx) => [{ type: 'link', href: '/', label: 'Main' }])

  .done();

export type BlockOutputs = InferOutputsType<typeof model>;
