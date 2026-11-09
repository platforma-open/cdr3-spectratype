import type { BlockData } from "./types";

/**
 * Subtitle shown when the user has not set a custom block label: the dataset's label, then the
 * length type. The chain is not named: its name ("Heavy", "Alpha", …) depends on the dataset's
 * receptor, which the subtitle cannot see.
 */
export function defaultSubtitle(data: Pick<BlockData, "subtitleLabel" | "lengthType">): string {
  const lengthLabel = data.lengthType === "nucleotide" ? "Nucleotide" : "Amino acid";
  return [data.subtitleLabel, lengthLabel].filter(Boolean).join(" - ");
}
