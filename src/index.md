---
theme: "alt"
---

# ${selectedElection.nom}

Cliquez sur un bureau de vote pour consulter ses résultats.

```js
import Legend from "./components/legend.js";
import MainMap from "./components/map.js";
import { getPath } from "./components/projection.js";
import Results from "./components/results.js";
import {
  elections,
  getBVInfo,
  getCommuneInfo,
  getCandidatesInfo,
  getCandidatesResults,
  getGeneralResults,
} from "./components/data.js";
```

```js
const selectedElection = view(
  Inputs.select(elections, {
    format: (t) => `${t.nom}`,
    value: elections[2],
  })
);
```

```js
const bureauxVoteEtCommunes = FileAttachment(
  "./static/bureaux_vote_et_communes.topojson"
).json();
// TODO: s’assurer qu’on n’affiche que les départements où on a des données
const departements = await d3.json("https://geo.api.gouv.fr/departements");
```

```js
// Chargement des données

const resultatsGlobaux = selectedElection
  ? await getGeneralResults(selectedElection)
  : null;
const resultatsCandidats = selectedElection
  ? await getCandidatesResults(selectedElection)
  : null;
```

```js
// Filtrage des données par département

const bureaux_vote_fixed_id = {
  type: "FeatureCollection",
  features: topojson
    .feature(bureauxVoteEtCommunes, bureauxVoteEtCommunes.objects.bureaux_vote)
    .features.map((f) => {
      return {
        ...f,
        properties: {
          ...f.properties,
          codeBureauVote: `${f.properties.codeCommune}_${
            f.properties.codeBureauVote?.split("_")[1]
          }`,
        },
      };
    }),
};

const bureaux_vote_dept = {
  type: "FeatureCollection",
  features: bureaux_vote_fixed_id.features.filter(
    (item) => item.properties.codeDepartement == selectedDept.code
  ),
};

const communes_dept = {
  type: "FeatureCollection",
  features: topojson
    .feature(bureauxVoteEtCommunes, bureauxVoteEtCommunes.objects.communes)
    .features.filter(
      (item) => item.properties.codeDepartement == selectedDept.code
    ),
};
const resGlobauxDept = resultatsGlobaux
  .filter((c) => c.codeDepartement === selectedDept.code)
  .map((c) => ({
    ...c,
    codeBureauVote: `${c.codeCommune}_${c.numeroBureauVote}`,
  }));

const resCandidatsDept = resultatsCandidats
  .filter((c) => c.codeDepartement === selectedDept.code)
  .map((c) => ({
    ...c,
    codeBureauVote: `${c.codeCommune}_${c.numeroBureauVote}`,
  }));

const infosBureauVote = Mutable({});
const setInfosBureauVote = (bv, commune, candidates) => {
  infosBureauVote.value = { bv, commune, candidates };
};
```

```js
// Préparation de la carte
const size = { width: Math.min(width, 600), height: Math.min(width, 600) };

const valuemap = new Map(
  bureaux_vote_dept.features.map((d) => {
    const b = getBVInfo(resGlobauxDept, d);

    return d
      ? [d.properties.codeBureauVote, parseFloat(b?.abstentions / b?.inscrits)]
      : 0;
  })
);

const path = getPath(bureaux_vote_dept, size, selectedDept.code);
const comPath = getPath(communes_dept, size, selectedDept.code);

function handleMapClick(d) {
  const p = d.properties;
  setInfosBureauVote(
    getBVInfo(resGlobauxDept, d),
    getCommuneInfo(communes_dept, d),
    getCandidatesInfo(resCandidatsDept, d)
  );
}
```

```js
const selectedDept = view(
  Inputs.select(departements, {
    format: (t) => `${t.code} – ${t.nom}`,
  })
);
```

<em>Il n’existe pour le moment pas de couche officielle des bureaux de vote sur
le territoire. Les contours présentés ici sont approximatifs.</em>

${display(Legend(d3.scaleQuantize([0, 100], d3.schemeBlues[5]), { title:
"Abstention (%)", tickFormat: ".0f", }) )}

${MainMap(size, bureaux_vote_dept, path, communes_dept, comPath, valuemap,
handleMapClick)}

```jsx
display(<Results infos={infosBureauVote} />);
```
