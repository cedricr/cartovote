import * as d3 from "npm:d3";
import { getPath } from "./projection.js";

const naColor = "#ababab";
const comColor = "#212121";
const bvColor = "white";

export default function MainMap(
  width,
  layer,
  communes,
  dept,
  valuemap,
  onMapClick
) {
  const height = width;
  const color = d3.scaleSequential([0.2, 0.8], d3.interpolateBlues);
  const path = getPath(layer, width, width, dept.code);
  const comPath = getPath(communes, width, width, dept.code);

  function zoomed(event) {
    const { transform } = event;
    g.attr("transform", transform);
    g.attr("stroke-width", 1 / transform.k);
  }

  function getColor(d) {
    return d.properties.codeBureauVote &&
      Number.isFinite(valuemap.get(d.properties.codeBureauVote))
      ? color(valuemap.get(d.properties.codeBureauVote))
      : naColor;
  }

  const svg = d3
    .create("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("width", width)
    .attr("height", height);

  let data = {};
  const g = svg.append("g");

  const zoom = d3
    .zoom()
    .scaleExtent([1, 10])
    .on("zoom", zoomed)
    .clickDistance(5);

  g.selectAll("path")
    .data(layer.features)
    .join("path")
    .attr("d", path)
    .attr("fill", (d) => getColor(d))
    .attr("stroke-opacity", 0.3)
    .attr("stroke", bvColor)
    .on("touchmove mousemove", function (event, d) {
      d3.select(this).attr("fill", "red");
      data = d.properties;
    })
    .on("touchend mouseleave", function (event) {
      d3.select(this).attr("fill", (d) => getColor(d));
      data = {};
    })
    .on("click", (event, d) => onMapClick(d))
    .append("title");
  // .text((d, i) => {
  //   const bv = getBVInfo(d);
  //   const com = getCommuneInfo(d);
  //   return `${com.nom_commune}, bureau n⁰${bv?.code_bv.replace(/^0+/, "")}`;
  // });

  g.append("g")
    .attr("pointer-events", "none")
    .selectAll("path")
    .data(communes.features)
    .join("path")
    .attr("d", comPath)
    .attr("stroke", comColor)
    .attr("stroke-opacity", 0.5)
    .attr("fill-opacity", 0);

  svg.call(zoom);

  return svg.node();
}
