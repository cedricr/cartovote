import * as d3 from "npm:d3";

export default function MainMap(
  size,
  layer,
  path2154,
  communes,
  comPath2154,
  valuemap,
  onMapClick
) {
  const color = d3.scaleQuantize(d3.schemeBlues[9]);

  const svg = d3
    .create("svg")
    .attr("viewBox", [0, 0, size.width, size.height])
    .attr("width", size.width)
    .attr("height", size.height);

  let data = {};
  const g = svg.append("g");
  function zoomed(event) {
    const { transform } = event;
    g.attr("transform", transform);
    g.attr("stroke-width", 1 / transform.k);
  }
  const zoom = d3
    .zoom()
    .scaleExtent([1, 10])
    .on("zoom", zoomed)
    .clickDistance(5);

  g.selectAll("path")
    .data(layer.features)
    .join("path")
    .attr("d", path2154)
    .attr("fill", (d) => {
      return color(
        d.properties.codeBureauVote
          ? valuemap.get(d.properties.codeBureauVote)
          : 0
      );
    })

    .attr("stroke", "#dfdfdf")
    .on("touchmove mousemove", function (event, d) {
      d3.select(this).attr("fill", "red");
      data = d.properties;
      // svg.dispatch("input");
    })
    .on("touchend mouseleave", function (event) {
      d3.select(this).attr("fill", (d) =>
        color(
          d.properties.codeBureauVote
            ? valuemap.get(d.properties.codeBureauVote)
            : 0
        )
      );
      data = {};
      // svg.dispatch("input");
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
    .attr("d", comPath2154)
    .attr("stroke", "#212121")
    .attr("fill-opacity", 0);

  svg.call(zoom);

  return svg.node();
}