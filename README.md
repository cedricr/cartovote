# CartoVote

Attention, peinture fraiche !

Une plateforme de visualisation des résultats électoraux français récents.

## Prérequis

- npm
- R
- mapshaper  
  `npm install -g mapshaper`

## Lancer le projet

`make dev` va récupérer et formater les données, puis lancer le projet
localement.

Il s’agit d’un projet Observable Framework, voir la
[documentation](https://observablehq.com/framework/)

## Sources utilisées :

- Données des élections agrégées par data.gouv.fr  :  
  https://www.data.gouv.fr/fr/datasets/donnees-des-elections-agregees/

  - Résultats généraux  
    https://object.files.data.gouv.fr/data-pipeline-open/prod/elections/general_results.csv
  - Résultats par candidat  
    https://object.files.data.gouv.fr/data-pipeline-open/prod/elections/candidats_results.csv

- Contour des bureaux de vote, selon la méhode de l’INSEE :
  https://www.data.gouv.fr/fr/datasets/proposition-de-contours-des-bureaux-de-vote-selon-la-methode-de-linsee/

---
