import * as d3 from "npm:d3";
import { addTooltip } from "./tooltip.js";

let map = null;
let currentLayer = null;
let svgLayer = null;

export default function MainMap(
  width,
  layer,
  level,
  communes,
  valuemap,
  onMapClick,
  opacity
) {
  if (map != null) {
    map.invalidateSize();
  } else {
    map = L.map("map");
    L.tileLayer("https://igngp.geoapi.fr/tile.php/plan-ignv2/{z}/{x}/{y}.png", {
      attribution: "&copy; IGN",
    }).addTo(map);
  }
  if (currentLayer !== layer) {
    currentLayer = layer;
    map.fitBounds(L.geoJson(currentLayer).getBounds());
  }
  // https://leafletjs.com/reference-1.7.1.html#map-pane
  const overlayPane = d3.select(map.getPanes().overlayPane);
  displayOverlay(
    overlayPane,
    currentLayer,
    level,
    communes,
    valuemap,
    onMapClick,
    opacity
  );
}

function displayOverlay(
  overlay,
  layer,
  level,
  communes,
  valuemap,
  onMapClick,
  opacity
) {
  const naColor = "#ababab";
  const comColor = "#212121";
  const bvColor = "#212121";
  const color = d3.scaleSequential([0.2, 0.8], d3.interpolateBlues);

  function getColor(d) {
    if (level === "commune") {
      return d.properties.codeCommune &&
        Number.isFinite(valuemap.get(d.properties.codeCommune))
        ? color(valuemap.get(d.properties.codeCommune))
        : naColor;
    } else {
      return d.properties.codeBureauVote &&
        Number.isFinite(valuemap.get(d.properties.codeBureauVote))
        ? color(valuemap.get(d.properties.codeBureauVote))
        : naColor;
    }
  }
  const projection = d3.geoTransform({
    point: function (longitude, latitude) {
      const point = map.latLngToLayerPoint(new L.LatLng(latitude, longitude));
      this.stream.point(point.x, point.y);
    },
  });
  const path = d3.geoPath().projection(projection);

  if (svgLayer != null) {
    svgLayer.removeFrom(map);
  }
  svgLayer = L.svg({ pane: "overlayPane" }).addTo(map);
  const svg = overlay.select("svg").classed("leaflet-zoom-hide", true);
  const g1 = svg.append("g");
  const bureauxPath = g1
    .selectAll("path")
    .data(layer.features)
    .enter()
    .append("path")
    .attr("d", path)
    .style("pointer-events", "auto")
    .attr("cursor", "pointer")
    .attr("fill", (d) => getColor(d))
    .attr("fill-opacity", opacity)
    .attr("stroke-opacity", 0.3)
    .attr("stroke", bvColor)
    .on("touchmove mousemove", function (event, d) {
      d3.select(this).attr("fill", "red");
      const data = d.properties;
      const [mx, my] = d3.pointer(event);
      if (level === "commune") {
        tooltip.show(`<strong>${data.nomCommune}</strong>`, mx, my);
      } else {
        tooltip.show(
          `<strong>${
            data.nomCommune
          }</strong><br />Bureau nº${data?.numeroBureauVote.replace(
            /^0+/,
            ""
          )}`,
          mx,
          my
        );
      }
    })
    .on("touchend mouseleave", function (event) {
      d3.select(this).attr("fill", (d) => getColor(d));
      tooltip.hide();
    })
    .on("click", (event, d) => onMapClick(d));

  const g2 = svg.append("g");
  const comPath = g2
    .selectAll("path")
    .data(communes.features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("stroke", comColor)
    .attr("stroke-opacity", 0.5)
    .attr("fill-opacity", 0);

  const tooltip = addTooltip(svg);

  map.on("zoomend", function () {
    tooltip.hide();
    bureauxPath.attr("d", path);
    comPath.attr("d", path);
  });
}
