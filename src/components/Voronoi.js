import { useEffect, useRef } from "react";
import * as d3 from "d3";
import voronoi from "d3-voronoi/src/voronoi";
import {
  interpolateRainbow,
  interpolatePlasma,
  interpolateTurbo,
  interpolateCool,
  interpolateInferno,
  interpolateYlOrRd,
} from "d3";

function Voronoi() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  // generate array of all color schemes
  const colorSchemes = [
    interpolatePlasma,
    interpolateRainbow,
    interpolateTurbo,
    interpolateCool,
    interpolateInferno,
    interpolateYlOrRd,
  ];

  // set color scheme each time
  const color = colorSchemes[Math.floor(Math.random() * colorSchemes.length)];

  // define dataset
  var nCells = 100;
  var sites = d3.range(nCells).map(function (d) {
    return [Math.random() * width, Math.random() * height];
  });

  const ref = useRef();

  useEffect(() => {
    plotPoints();
    window.addEventListener("resize", plotPoints());
  }, [sites]);

  const plotPoints = () => {
    d3.select(".svg").remove();

    const svg = d3
      .select(ref.current)
      .append("svg")
      .attr("class", "svg")
      .attr("viewBox", [0, 0, width, height])
      .on("mousemove", moved);

    var generateVoronoi = voronoi()
      .x((d) => d[0])
      .y((d) => d[1])
      .extent([
        [0, 0],
        [width, height],
      ]);

    var cols = Array.from(
      { length: nCells },
      () => "#" + Math.floor(Math.random() * 16777215).toString(16)
    );

    var polygon = svg
      .append("g")
      .attr("class", "voronoi")
      .selectAll("path")
      .data(generateVoronoi(sites).polygons())
      .enter()
      .append("path")
      .attr("fill", (d, i) => color(Math.random()))
      .attr("stroke", "#333333")
      .call(redrawPolygon);

    function moved(event) {
      sites[0] = d3.pointer(event);
      redraw();
    }

    function redraw() {
      var diagram = generateVoronoi(sites);
      polygon = polygon.data(diagram.polygons()).call(redrawPolygon);
    }

    function redrawPolygon(polygon) {
      polygon.attr("d", function (d) {
        return d ? "M" + d.join("L") + "Z" : null;
      });
    }
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        boxSizing: "border-box",
      }}
      ref={ref}
    ></div>
  );
}

export default Voronoi;
