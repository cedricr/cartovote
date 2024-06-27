library(readr)
library(dplyr)
library(janitor)
library(stringr)


prepare_bv = function(election) {
  results = read_csv2("raw_data/general_results.csv", show_col_types = FALSE) |>
    clean_names() |>
    filter(id_election == election) |>
    mutate(
      codeDepartement = case_when(
        code_du_departement == "ZA" ~ "971",
        code_du_departement == "ZB" ~ "972",
        code_du_departement == "ZC" ~ "973",
        code_du_departement == "ZD" ~ "974",
        code_du_departement == "ZM" ~ "976",
        .default = code_du_departement
      ),
      codeCommune = if_else(
        str_starts(codeDepartement, "97"),
        str_c(codeDepartement, str_sub(code_de_la_commune, 2)),
        str_c(codeDepartement, code_de_la_commune)
      ),
      codeCirco = str_c(codeDepartement, code_de_la_circonscription),
    ) |>
    select(
      codeDepartement,
      codeCommune,
      codeCirco,
      nomCirco = libelle_de_la_circonscription,
      numeroBureauVote = code_du_b_vote,
      inscrits, abstentions,
      votants, blancs, nuls, exprimes
    )
  format_csv(results, na = "")
}


prepare_candidats = function(election) {
  results = read_csv2("raw_data/candidats_results.csv", show_col_types = FALSE) |>
    clean_names() |>
    filter(id_election == election, voix > 0) |>
    mutate(
      codeDepartement = case_when(
        code_du_departement == "ZA" ~ "971",
        code_du_departement == "ZB" ~ "972",
        code_du_departement == "ZC" ~ "973",
        code_du_departement == "ZD" ~ "974",
        code_du_departement == "ZM" ~ "976",
        .default = code_du_departement
      ),
      codeCommune = if_else(
        str_starts(codeDepartement, "97"),
        str_c(codeDepartement, str_sub(code_de_la_commune, 2)),
        str_c(codeDepartement, code_de_la_commune)
      ),
      liste = if_else(is.na(nom), libelle_abrege_liste, str_c(prenom, " ", nom))
    ) |>
    select(
      codeDepartement,
      codeCommune,
      numeroBureauVote = code_du_b_vote,
      liste, nuance,
      nbVoix = voix,
      libelle_abrege_liste,
      prenom,
      nom
    )
  format_csv(results, na = "")
}
