import pandas as pd
import argparse

import argparse

input_file = "input.tsv"

data = pd.read_csv(input_file, sep="\t")

data["cdr3Length"] = data["CDR3"].str.len()

#
# V Spectratype: expected columns:
#
# Sample	vGene	cdr3Length	size    sum

vSpectratype = data.groupby(["Sample", "vGene", "cdr3Length"])[
    "weight"].agg(['size', 'sum']).reset_index()

vSpectratype.to_csv("vSpectratype.result.tsv", sep="\t", index=False)

#
# CDR3 Spectratype: expected columns:
#
# Sample	CDR3	cdr3Length	size    sum

# Get top 20 CDR3s for each Sample
top_cdr3s = data.groupby('Sample')['weight'].apply(
    lambda x: data[data['weight'].isin(
        x)]['CDR3'].value_counts().nlargest(20).index.tolist()
).explode().unique()

# Replace non-top CDR3s with 'other'
data['CDR3'] = data.apply(
    lambda row: row['CDR3'] if row['CDR3'] in top_cdr3s else 'other',
    axis=1
)

cdr3Spectratype = data.groupby(["Sample", "CDR3", "cdr3Length"])[
    "weight"].agg(['size', 'sum']).reset_index()


cdr3Spectratype.to_csv("cdr3Spectratype.result.tsv", sep="\t", index=False)
