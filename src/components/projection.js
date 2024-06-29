// Basé sur https://observablehq.com/@ericmauviere/le-fond-de-carte-simplifie-des-communes-2021-avec-droms-rapp

import proj4 from "npm:proj4";
import * as d3 from "npm:d3";

// Projections officielles des DROM

// Références :
// https://github.com/etalab/project-legal/blob/master/projections.json
// https://geodesie.ign.fr/contenu/fichiers/documentation/SRCfrance.pdf
// https://fr.wikipedia.org/wiki/Code_officiel_g%C3%A9ographique

const DROM_ESPG_CODES = {
  // # Guadeloupe
  971: 5490,
  // # Martinique
  972: 5490,
  // # Guyane
  973: 2972,
  // # La Réunion
  974: 2975,
  // # Saint-Pierre-et-Miquelon
  975: 4467,
  // # Mayotte
  976: 4471,
  // # Saint-Barthélemy
  977: 5490,
  // # Saint-Martin
  978: 5490,
};

// https://epsg.io/2154
proj4.defs(
  "EPSG:2154",
  "+proj=lcc +lat_0=46.5 +lon_0=3 +lat_1=49 +lat_2=44 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs"
);
// https://epsg.io/5490
proj4.defs(
  "EPSG:5490",
  "+proj=utm +zone=20 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs"
);
// https://epsg.io/2972
proj4.defs(
  "EPSG:2972",
  "+proj=utm +zone=22 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs"
);
// https://epsg.io/2975
proj4.defs(
  "EPSG:2975",
  "+proj=utm +zone=40 +south +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs"
);
// https://epsg.io/4467
proj4.defs(
  "EPSG:4467",
  "+proj=utm +zone=21 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs"
);
// https://epsg.io/4471
proj4.defs(
  "EPSG:4471",
  "+proj=utm +zone=38 +south +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs"
);

function proj4d3(proj4string) {
  let raw;

  if (+proj4string == proj4string) raw = proj4("EPSG:" + proj4string);

  if (!raw) raw = proj4(proj4string);

  const degrees = 180 / Math.PI,
    radians = 1 / degrees,
    p = function (lambda, phi) {
      return raw.forward([lambda * degrees, phi * degrees]);
    };
  p.invert = function (x, y) {
    return raw.inverse([x, y]).map(function (d) {
      return d * radians;
    });
  };
  const projection = d3.geoProjection(p);
  projection.raw = raw;
  return projection;
}

export function getPath(layer, width, height, departement) {
  const espg_code = DROM_ESPG_CODES[departement] || 2154;
  const proj_departement = proj4d3(espg_code);
  const map_extent = [
    [0, 0],
    [width, height],
  ];

  const proj_4326_to_map = proj_departement.fitExtent(map_extent, layer);

  return d3.geoPath(proj_4326_to_map);
}
