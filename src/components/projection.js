// Basé sur https://observablehq.com/@ericmauviere/le-fond-de-carte-simplifie-des-communes-2021-avec-droms-rapp

import proj4 from "npm:proj4";
import * as d3 from "npm:d3";
let epsg2154 =
  "+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs";
proj4.defs([["EPSG:2154", `+title=France Lambert93 ${epsg2154}`]]);

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

export function getPath(layer, size) {
  const proj_epsg2154 = proj4d3(2154);
  const margin = 0;
  const map_extent = [
    [margin, margin],
    [size.width - margin, size.height - margin],
  ];

  const proj_e4326_to_map_e2154 = proj_epsg2154.fitExtent(map_extent, layer);

  return d3.geoPath(proj_e4326_to_map_e2154);
}
