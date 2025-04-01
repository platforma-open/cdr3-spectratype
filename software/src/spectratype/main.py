import pandas as pd
import argparse

import argparse

parser = argparse.ArgumentParser(
    description="Calculate CDR3 spectratype"
)
parser.add_argument("--unweighted", action="store_true", help="Unweighted")
args = parser.parse_args()

# expected columns:
#
# Sample	vGene	cdr3Length	weight

input_file = "input.tsv"

data = pd.read_csv(input_file, sep="\t")

aggColumns = ["cdr3Length"]

if "Sample" in data.columns:
    aggColumns += ["Sample"]

if "vGene" in data.columns:
    aggColumns += ["vGene"]

if "weight" in data.columns and not args.unweighted:
    agg = data.groupby(aggColumns)["weight"].sum().reset_index()
else:
    agg = data.groupby(aggColumns).size().reset_index(name='weight')

agg.to_csv("result.tsv", sep="\t", index=False)