import { FileAttachment } from "npm:@observablehq/stdlib";

export const elections = [
  {
    id: "2024_euro_t1",
    candidats: FileAttachment("../data/resultats_candidats_2024_euro_t1.csv"),
    general: FileAttachment("../data/resultats_generaux_2024_euro_t1.csv"),
    nom: "Élections européennes 2024",
  },
  {
    id: "2022_legi_t2",
    candidats: FileAttachment("../data/resultats_candidats_2022_legi_t2.csv"),
    general: FileAttachment("../data/resultats_generaux_2022_legi_t2.csv"),
    nom: "Élections législatives 2022, 2e tour",
  },
  {
    id: "2022_legi_t1",
    candidats: FileAttachment("../data/resultats_candidats_2022_legi_t1.csv"),
    general: FileAttachment("../data/resultats_generaux_2022_legi_t1.csv"),
    nom: "Élections législatives 2022, 1er tour",
  },
  {
    id: "2022_pres_t2",
    candidats: FileAttachment("../data/resultats_candidats_2022_pres_t2.csv"),
    general: FileAttachment("../data/resultats_generaux_2022_pres_t2.csv"),
    nom: "Élection présidentielle 2022, 2e tour",
  },
  {
    id: "2022_pres_t1",
    candidats: FileAttachment("../data/resultats_candidats_2022_pres_t1.csv"),
    general: FileAttachment("../data/resultats_generaux_2022_pres_t1.csv"),
    nom: "Élection présidentielle 2022, 1er tour",
  },
];

export function getBVInfo(results, bv) {
  return results.find((f) => f.codeBureauVote === bv.properties.codeBureauVote);
}

export function getCommuneInfo(communes, bv) {
  return communes.features.find(
    (f) => f.properties.codeCommune === bv.properties.codeCommune
  )?.properties;
}

export function getCandidatesInfo(deptCandidats, bv) {
  return deptCandidats
    .filter((c) => {
      return c.codeBureauVote === bv.properties.codeBureauVote;
    })
    .sort((a, b) => parseInt(b.nbVoix) - parseInt(a.nbVoix));
}
