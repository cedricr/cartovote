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
  getTerritoryInfo,
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
  value: elections[0],
});
const selectedElection = Generators.input(electionInput);

const mailleInput = Inputs.select(["commune", "bureau de vote"]);
const maille = Generators.input(mailleInput);

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

const communesDept = {
  type: "FeatureCollection",
  features: topojson
    .feature(bureauxVoteEtCommunes, bureauxVoteEtCommunes.objects.communes)
    .features.filter(
      (item) => item.properties.codeDepartement == selectedDept.code
    ),
};

let resGlobauxDept = resultatsGlobaux
  .filter((c) => c.codeDepartement === selectedDept.code)
  .map((c) => ({
    ...c,
    codeBureauVote: `${c.codeCommune}_${c.numeroBureauVote}`,
  }));

if (maille === "commune") {
  resGlobauxDept = resGlobauxDept.reduce((acc, val) => {
    let communeData = acc.find((r) => r.codeCommune === val.codeCommune);
    if (!communeData) {
      communeData = {
        codeDepartement: val.codeDepartement,
        codeCommune: val.codeCommune,
      };
      acc.push(communeData);
    }
    communeData.abstentions =
      (communeData.abstentions || 0) + parseInt(val.abstentions);
    communeData.blancs = (communeData.blancs || 0) + parseInt(val.blancs);
    communeData.exprimes = (communeData.exprimes || 0) + parseInt(val.exprimes);
    communeData.inscrits = (communeData.inscrits || 0) + parseInt(val.inscrits);
    communeData.nuls = (communeData.nuls || 0) + parseInt(val.nuls);
    communeData.votants = (communeData.votants || 0) + parseInt(val.votants);

    return acc;
  }, []);
}

let resCandidatsDept = resultatsCandidats
  .filter((c) => c.codeDepartement === selectedDept.code)
  .map((c) => ({
    ...c,
    codeBureauVote: `${c.codeCommune}_${c.numeroBureauVote}`,
  }));

if (maille === "commune") {
  resCandidatsDept = resCandidatsDept.reduce((acc, val) => {
    let candidateData = acc.find(
      (r) => r.codeCommune === val.codeCommune && r.liste === val.liste
    );
    if (!candidateData) {
      candidateData = {
        codeDepartement: val.codeDepartement,
        codeCommune: val.codeCommune,
        liste: val.liste,
        nuance: val.nuance,
      };
      acc.push(candidateData);
    }
    candidateData.nbVoix = (candidateData.nbVoix || 0) + parseInt(val.nbVoix);
    return acc;
  }, []);
}
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
    getTerritoryInfo(resGlobauxDept, maille, d),
    getCommuneInfo(communesDept, d),
    getCandidatesInfo(resCandidatsDept, maille, d)
  );
}
```

```js
//////////////////////////
// Préparation de la carte
//////////////////////////

const valuemap = new Map(
  (maille === "commune" ? communesDept : bureauxVoteDept).features.map((d) => {
    const b = getTerritoryInfo(resGlobauxDept, maille, d);

    return [
      maille === "commune"
        ? d.properties.codeCommune
        : d.properties.codeBureauVote,
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

${mailleInput}

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
  maille === "commune" ? communesDept : bureauxVoteDept,
  maille,
  communesDept,
  valuemap,
  handleMapClick,
  opacity
);
```
