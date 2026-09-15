import { describe, expect, it } from "vitest";
import { kind } from "@platforma-open/milaboratories.cdr3-spectratype.kind";
import { initBlockData } from "./dataModel";
import { deriveTemplateParams } from "./templateParams";
import type { BlockData } from "./types";

/**
 * The three steps a project template actually takes between two blocks: the source block's
 * state is projected out, the file's params are read back by the kind, and the new block is
 * initialised from them. Anything one of the three drops is a setting the user has to make
 * again.
 */
const roundTrip = (data: BlockData): BlockData =>
  initBlockData(
    kind.parseInitializationParams(JSON.parse(JSON.stringify(deriveTemplateParams(data)))),
  );

const CONFIGURED: BlockData = {
  datasetRef: { __isRef: true, blockId: "b1", name: "pf/dataset" },
  lengthType: "nucleotide",
  scChain: "B",
  defaultBlockLabel: "Donor 3 - Nucleotide - Light",
  customBlockLabel: "run 7",
  weightedFlag: false,
  bubblePlotState: { title: "moved", template: "bubble", currentTab: null },
  vStackedBarPlotState: { title: "moved", template: "stackedBar", currentTab: "settings" },
  cdr3StackedBarPlotState: { title: "moved", template: "stackedBar", currentTab: "settings" },
};

describe("export -> apply", () => {
  it("carries every field a user set", () => {
    const seeded = roundTrip(CONFIGURED);

    expect(seeded.datasetRef).toEqual(CONFIGURED.datasetRef);
    expect(seeded.lengthType).toBe(CONFIGURED.lengthType);
    expect(seeded.scChain).toBe(CONFIGURED.scChain);
    expect(seeded.weightedFlag).toBe(CONFIGURED.weightedFlag);
    expect(seeded.customBlockLabel).toBe(CONFIGURED.customBlockLabel);
  });

  it("is stable: seeding from the seeded block changes nothing", () => {
    const once = roundTrip(CONFIGURED);
    expect(roundTrip(once)).toEqual(once);
  });

  // `weightedFlag: false` and `customBlockLabel: ""` are the two values a `??` default would
  // silently overwrite on the way back in. They are ordinary states — the plots start weighted
  // and the subtitle starts empty — so the projection has to return them unchanged.
  it("carries the falsy values a default would swallow", () => {
    const seeded = roundTrip({ ...CONFIGURED, weightedFlag: false, customBlockLabel: "" });

    expect(seeded.weightedFlag).toBe(false);
    expect(seeded.customBlockLabel).toBe("");
  });

  it("survives a half-configured block, which the panel reaches and the projection must return", () => {
    const seeded = roundTrip({ ...CONFIGURED, datasetRef: undefined, customBlockLabel: "" });

    expect(seeded.datasetRef).toBeUndefined();
    expect(seeded.lengthType).toBe(CONFIGURED.lengthType);
    expect(seeded.scChain).toBe(CONFIGURED.scChain);
  });

  it("seeds a block with no params at all from the defaults", () => {
    const fresh = initBlockData(undefined);

    expect(fresh.datasetRef).toBeUndefined();
    expect(fresh.lengthType).toBe("aminoacid");
    expect(fresh.scChain).toBe("A");
    expect(fresh.weightedFlag).toBe(true);
    expect(fresh.customBlockLabel).toBe("");
  });

  it("leaves the derived label to the panel, and agrees with it on the part it can compute", () => {
    // The watchEffect in ui/src/app.ts builds the same string from the dataset's and the chain's
    // option labels. `init` cannot reach either -- both come from the result pool -- so only the
    // length alphabet is filled in here, and it must already match or the label would flicker
    // the moment the block is opened.
    const seeded = roundTrip(CONFIGURED);

    expect(seeded.defaultBlockLabel).not.toBe(CONFIGURED.defaultBlockLabel);
    expect(seeded.defaultBlockLabel).toBe("Nucleotide");
  });

  it("resets the plot view state rather than carrying it", () => {
    const seeded = roundTrip(CONFIGURED);

    expect(seeded.bubblePlotState.title).toBe("CDR3 V Spectratype");
    expect(seeded.bubblePlotState.currentTab).toBe("settings");
    expect(seeded.vStackedBarPlotState.currentTab).toBeNull();
    expect(seeded.cdr3StackedBarPlotState.currentTab).toBeNull();
  });
});
