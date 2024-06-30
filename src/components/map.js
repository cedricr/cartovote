import * as d3 from "npm:d3";
import { getPath } from "./projection.js";
import { addTooltip } from "./tooltip.js";

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

  const g = svg.append("g");

  const zoom = d3
    .zoom()
    .scaleExtent([1, 10])
    .on("zoom", zoomed)
    .clickDistance(5);

  const tooltip = addTooltip(svg);
  g.selectAll("path")
    .data(layer.features)
    .join("path")
    .attr("d", path)
    .attr("cursor", "pointer")
    .attr("fill", (d) => getColor(d))
    .attr("stroke-opacity", 0.3)
    .attr("stroke", bvColor)
    .on("touchmove mousemove", function (event, d) {
      d3.select(this).attr("fill", "red");
      const data = d.properties;
      const [mx, my] = d3.pointer(event);
      tooltip.show(
        `<strong>${
          data.nomCommune
        }</strong><br />Bureau n⁰${data?.numeroBureauVote.replace(/^0+/, "")}`,
        mx,
        my
      );
    })
    .on("touchend mouseleave", function (event) {
      d3.select(this).attr("fill", (d) => getColor(d));
      tooltip.hide();
    })
    .on("click", (event, d) => onMapClick(d));

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
