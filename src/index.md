---
style: main.css
---

<link rel="preconnect" href="https://rsms.me/">
<link rel="stylesheet" href="https://rsms.me/inter/inter.css">

# ${selectedElection.nom}

```js
import Legend from "./components/legend.js";
import MainMap from "./components/map.js";
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
          codeBureauVote: f.properties?.codeBureauVote
            ? `${f.properties.codeCommune}_${
                f.properties.codeBureauVote.split("_")[1]
              }`
            : null,
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

const valuemap = new Map(
  bureaux_vote_dept.features.map((d) => {
    const b = getBVInfo(resGlobauxDept, d);

    return [
      d.properties.codeBureauVote,
      parseFloat(b?.abstentions / b?.inscrits),
    ];
  })
);

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

<div class="map-container" >
  <div class="card map">
    ${display(Legend(
      d3.scaleSequential([20, 80], 
      d3.interpolateBlues), { 
          title: "Abstention (%)", tickFormat: ".0f", reverted: false
        }) 
    )}

${resize((width) => { return MainMap( width, bureaux_vote_dept, communes_dept,
selectedDept, valuemap, handleMapClick ) })}

  </div>
  <div class="card map-info">

```jsx
display(<Results infos={infosBureauVote} />);
```

  </div>
</div>
