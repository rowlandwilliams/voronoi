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
  var initialCells = 80;
  // var nCells = 100;

  const generatePoints = (nCells, startX, endX, startY, endY) =>
    d3.range(nCells).map(() => {
      const posWidth = endX - startX;
      const posHeight = endY - startY;
      return [
        startX + Math.random() * posWidth,
        startY + Math.random() * posHeight,
      ];
    });

  var sites = generatePoints(initialCells, 0, width, 0, height);
  const ref = useRef();

  useEffect(() => {
    plot();
    window.addEventListener("resize", plot());
  }, [sites]);

  const plot = () => {
    d3.select(".svg").remove();

    const svg = d3
      .select(ref.current)
      .append("svg")
      .attr("class", "svg")
      .attr("viewBox", [0, 0, width, height]);
    // .on("mousemove", moved);

    var generateVoronoi = voronoi()
      .x((d) => d[0])
      .y((d) => d[1])
      .extent([
        [0, 0],
        [width, height],
      ]);

    var intial = svg
      .append("g")
      .attr("class", "voronoi")
      .selectAll("path")
      .data(generateVoronoi(sites).polygons())
      .enter()
      .append("path")
      .attr("fill", (d, i) => color(Math.random()))
      .attr("stroke", "#333333")
      .call(redrawPolygon);

    var polygons = generateVoronoi(sites).polygons();

    // [min.x, max.x, min.y, max.y]

    polygons = polygons.map((x) => x.filter((y) => y !== "data"));

    polygons.forEach((x, i) => {
      const bounds = [
        Math.min(...x.map((y) => y[0])),
        Math.max(...x.map((y) => y[0])),
        Math.min(...x.map((y) => y[1])),
        Math.max(...x.map((y) => y[1])),
      ];

      // generate new points
      const level2 = generatePoints(
        10,
        bounds[0],
        bounds[1],
        bounds[2],
        bounds[3]
      );
      console.log(bounds);

      var test = svg.append("g").attr("class", "suh" + i);

      test
        .selectAll("circle")
        .data(level2)
        .join("circle")
        .attr("cx", (d) => d[0])
        .attr("cy", (d) => d[1])
        .attr("r", 3)
        .attr("fill", "blue");

      var generateVoronoi2 = voronoi()
        .x((d) => d[0])
        .y((d) => d[1])
        .extent([
          [0, 0],
          [bounds[1], bounds[3]],
        ]);

      test
        .selectAll("path")
        .data(generateVoronoi2(sites).polygons())
        .enter()
        .append("path")
        .attr("fill", (d, i) => color(Math.random()))
        .attr("stroke", "#333333")
        .call(redrawPolygon);
    });

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
        padding: "10px",
        boxSizing: "border-box",
      }}
      ref={ref}
    ></div>
  );
}

export default Voronoi;
