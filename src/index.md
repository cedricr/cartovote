---
style: main.css
---

<link rel="preconnect" href="https://rsms.me/">
<link rel="stylesheet" href="https://rsms.me/inter/inter.css">

```js
//////////
// Imports
//////////

import * as L from "npm:leaflet";

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
/////////
// Inputs
/////////

const departements = (
  await d3.json("https://geo.api.gouv.fr/departements")
).filter((d) => d.code != "976"); // TODO: récupérer les données de Mayotte

const deptInput = Inputs.select(departements, {
  format: (t) => `${t.code} – ${t.nom}`,
});
const selectedDept = Generators.input(deptInput);

const electionInput = Inputs.select(elections, {
  format: (t) => `${t.nom}`,
  value: elections[2],
});
const selectedElection = Generators.input(electionInput);

const opacityInput = html`<input
  type="range"
  step="0.1"
  min="0"
  max="1"
  value="0.9"
/>`;
const opacity = Generators.input(opacityInput);
```

```js
/////////////////////////
// Chargement des données
/////////////////////////

const bureauxVoteEtCommunes = FileAttachment(
  "./static/bureaux_vote_et_communes.topojson"
).json();

const resultatsGlobaux = selectedElection
  ? getGeneralResults(selectedElection)
  : null;
const resultatsCandidats = selectedElection
  ? getCandidatesResults(selectedElection)
  : null;
```

```js
///////////////////////////////////////
// Filtrage des données par département
///////////////////////////////////////

const bureauxVote = {
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

const bureauxVoteDept = {
  type: "FeatureCollection",
  features: bureauxVote.features.filter(
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
```

```js
///////////////////////////
// Préparation de l’infobox
///////////////////////////

const infosBureauVote = Mutable({});
const setInfosBureauVote = (bv, commune, candidates) => {
  infosBureauVote.value = { bv, commune, candidates };
};

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
//////////////////////////
// Préparation de la carte
//////////////////////////

const valuemap = new Map(
  bureauxVoteDept.features.map((d) => {
    const b = getBVInfo(resGlobauxDept, d);

    return [
      d.properties.codeBureauVote,
      parseFloat(b?.abstentions / b?.inscrits),
    ];
  })
);

const legend = Legend(d3.scaleSequential([20, 80], d3.interpolateBlues), {
  title: "Abstention (%)",
  tickFormat: ".0f",
  reverted: false,
  opacity,
});
```

<!------------------------------------------------------------------------------------>
<!--                                     HTML                                       -->
<!------------------------------------------------------------------------------------>

# ${selectedElection.nom}

${electionInput}

${deptInput}

<div class="map-container">
 <div class="card map">
    <div style="display: flex; flex-direction: row; column-gap: 2rem; align-items: center; flex-wrap: wrap">
      <div>${display(legend )}</div>
      <div>Opacité : ${opacityInput}</div>
    </div>
    <div id="map" style="flex-grow: 1">
    </div>
  </div>
  
  
  <div class="card map-info">

```jsx
display(<Results infos={infosBureauVote} />);
```

  </div>
</div>

```js
MainMap(
  width,
  bureauxVoteDept,
  communes_dept,
  valuemap,
  handleMapClick,
  opacity
);
```
