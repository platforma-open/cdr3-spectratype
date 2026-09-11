import { describe, expect, it } from "vitest";
import { kind } from "./index";

const parse = (params: unknown) => kind.parseInitializationParams(params);

/** The reference form the dataset dropdown writes: an expanded `PlRef`. */
const DATASET_REF = { __isRef: true as const, blockId: "b1", name: "pf/dataset" };

describe("the envelope", () => {
  it("accepts an empty object — a fresh block has nothing configured", () => {
    expect(parse({})).toEqual({
      datasetRef: undefined,
      lengthType: undefined,
      scChain: undefined,
      weightedFlag: undefined,
      customBlockLabel: undefined,
    });
  });

  it.each([
    ["null", null],
    ["a string", "aminoacid"],
    ["a number", 1],
    ["an array", []],
  ])("rejects %s as the params object", (_label, params) => {
    expect(() => parse(params)).toThrow();
  });

  it("drops a key the contract does not name", () => {
    expect(parse({ bubblePlotState: { title: "x" } })).not.toHaveProperty("bubblePlotState");
  });

  it("round-trips a fully configured block", () => {
    const params = {
      datasetRef: DATASET_REF,
      lengthType: "nucleotide" as const,
      scChain: "B" as const,
      weightedFlag: false,
      customBlockLabel: "Heavy chain, nt",
    };
    expect(parse(params)).toEqual(params);
  });
});

describe("datasetRef", () => {
  it("accepts an expanded PlRef", () => {
    expect(parse({ datasetRef: DATASET_REF })).toMatchObject({ datasetRef: DATASET_REF });
  });

  it.each([
    ["a bare string", "pf/dataset"],
    ["null", null],
    ["an object missing the ref marker", { blockId: "b1", name: "pf/dataset" }],
    ["an object missing the block id", { __isRef: true, name: "pf/dataset" }],
    ["an object missing the name", { __isRef: true, blockId: "b1" }],
    ["an array", []],
  ])("rejects %s", (_label, datasetRef) => {
    expect(() => parse({ datasetRef })).toThrow("'datasetRef' must be a reference");
  });
});

describe("lengthType", () => {
  it.each([["aminoacid"], ["nucleotide"]])("accepts %s", (lengthType) => {
    expect(parse({ lengthType })).toMatchObject({ lengthType });
  });

  it.each([
    ["an unknown alphabet", "protein"],
    ["the wrong case", "aminoAcid"],
    ["a number", 0],
    ["null", null],
  ])("rejects %s", (_label, lengthType) => {
    expect(() => parse({ lengthType })).toThrow("'lengthType' must be one of");
  });
});

describe("scChain", () => {
  it.each([["A"], ["B"]])("accepts %s", (scChain) => {
    expect(parse({ scChain })).toMatchObject({ scChain });
  });

  // The letter is checked as an envelope only. Whether a chain means anything depends on
  // the dataset being single-cell, and the contract cannot see the dataset — a bulk
  // dataset carrying "A" is a state the UI itself leaves behind when the selector hides.
  it("accepts a chain letter alongside no dataset at all", () => {
    expect(parse({ scChain: "B" })).toMatchObject({ scChain: "B", datasetRef: undefined });
  });

  it.each([
    ["a chain letter the block does not use", "C"],
    ["a lowercase letter", "a"],
    ["a chain name", "Heavy"],
    ["a number", 0],
  ])("rejects %s", (_label, scChain) => {
    expect(() => parse({ scChain })).toThrow("'scChain' must be one of");
  });
});

describe("weightedFlag", () => {
  it.each([[true], [false]])("accepts %s", (weightedFlag) => {
    expect(parse({ weightedFlag })).toMatchObject({ weightedFlag });
  });

  it.each([
    ["a string", "true"],
    ["a number", 1],
    ["null", null],
  ])("rejects %s", (_label, weightedFlag) => {
    expect(() => parse({ weightedFlag })).toThrow("'weightedFlag' must be a boolean");
  });
});

describe("customBlockLabel", () => {
  it("accepts a label the user typed", () => {
    expect(parse({ customBlockLabel: "Donor 3" })).toMatchObject({ customBlockLabel: "Donor 3" });
  });

  it("accepts the empty string the block is created with", () => {
    expect(parse({ customBlockLabel: "" })).toMatchObject({ customBlockLabel: "" });
  });

  it.each([
    ["a number", 1],
    ["null", null],
    ["an object", {}],
  ])("rejects %s", (_label, customBlockLabel) => {
    expect(() => parse({ customBlockLabel })).toThrow("'customBlockLabel' must be a string");
  });
});
