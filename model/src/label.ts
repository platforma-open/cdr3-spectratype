export function getDefaultBlockLabel(data: {
  datasetLabel?: string;
  lengthType?: 'aminoacid' | 'nucleotide';
  isSingleCell: boolean;
  chainLabel?: string;
}) {
  const parts: string[] = [];

  // Add dataset name
  if (data.datasetLabel) {
    parts.push(data.datasetLabel);
  }

  // Add length type
  if (data.lengthType === 'aminoacid') {
    parts.push('Amino acid');
  } else if (data.lengthType === 'nucleotide') {
    parts.push('Nucleotide');
  }

  // Add chain info for single-cell datasets
  if (data.isSingleCell && data.chainLabel) {
    parts.push(data.chainLabel);
  }

  return parts.join(' - ');
}
