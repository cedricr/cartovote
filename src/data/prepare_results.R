library(readr)
library(dplyr)
library(janitor)
library(stringr)
library(tidyr)

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

prepare_results_miom = function(filename) {
  results = read_csv2(filename, show_col_types = FALSE) |>
    clean_names() |>
    select(
      codeDepartement = code_departement,
      codeCommune = code_commune,
      numeroBureauVote = code_bv,
      inscrits, abstentions,
      votants, blancs, nuls, exprimes
    ) |>
    mutate(
      codeCirco = "",
      nomCirco = ""
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
      nbVoix = voix
    )
  format_csv(results, na = "")
}

prepare_candidats_miom = function(filename) {
  results = read_csv2(filename, show_col_types = FALSE) |>
    clean_names() |>
    select(
      codeDepartement = code_departement,
      codeCommune = code_commune,
      numeroBureauVote = code_bv,
      starts_with("nuance_candidat_") | starts_with("nom_candidat_") | starts_with("prenom_candidat_") | starts_with("voix_") | starts_with("elu_")
    ) |>
    pivot_longer(
      cols = starts_with("nuance_candidat_") | starts_with("nom_candidat_") | starts_with("prenom_candidat_") | starts_with("voix_") | starts_with("elu_"),
      names_to = c(".value", "num_candidat"),
      names_pattern = "(.*)_(\\d*)",
      values_drop_na = TRUE,
    ) |>
    rename(
      nuance = nuance_candidat, nbVoix = voix
    ) |>
    mutate(
      liste = str_c(prenom_candidat, " ", nom_candidat)
    ) |>
    select(-num_candidat, -prenom_candidat, -nom_candidat)
  format_csv(results, na = "")
}
