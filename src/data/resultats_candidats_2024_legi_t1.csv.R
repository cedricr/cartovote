source("src/data/prepare_results.R")

results_bv = prepare_candidats_miom("raw_data/resultats-provisoires-par-bureau-de-votevmn.csv")
cat(results_bv)
