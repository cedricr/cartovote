source("src/data/prepare_results.R")

results_bv = prepare_candidats_miom_legi_2024("raw_data/res_2024_legi_t2.csv", "raw_data/res_2024_legi_t1.csv")
cat(results_bv)
