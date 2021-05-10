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
  merge,
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
  var initialCells = 8;
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

    var initialPolygons = generateVoronoi(sites).polygons();

    const drawVoronoi = (parent, polygons, level) => {
      parent
        .append("g")
        .attr("class", "voronoi" + level)
        .selectAll("path")
        .data(polygons)
        .join("path")
        .attr("data-level", level)
        .attr("fill", (d, i) => color(Math.random()))
        .attr("stroke", "#333333")
        .call(redrawPolygon);
    };

    const drawSubVoronoi = (parent, parentLevel) => {
      var parentPolygons = d3.selectAll(
        'path[data-level="' + parentLevel + '"]'
      );

      parentPolygons.each((x, i) => {
        var filt = x.filter((y) => y !== "data");
        console.log(filt);

        const bounds = [
          Math.min(...filt.map((y) => y[0])),
          Math.max(...filt.map((y) => y[0])),
          Math.min(...filt.map((y) => y[1])),
          Math.max(...filt.map((y) => y[1])),
        ];

        const newData = generatePoints(
          30,
          bounds[0],
          bounds[1],
          bounds[2],
          bounds[3]
        );

        var generateVoronoi2 = voronoi()
          .x((d) => d[0])
          .y((d) => d[1])
          .extent([
            [bounds[0], bounds[2]],
            [bounds[1], bounds[3]],
          ]);

        var newPolygons = generateVoronoi2(newData).polygons();
        return drawVoronoi(parent, newPolygons, parentLevel + 1);
      });
    };

    function redrawPolygon(polygon) {
      polygon.attr("d", function (d) {
        return d ? "M" + d.join("L") + "Z" : null;
      });
    }

    drawVoronoi(svg, initialPolygons, 1);
    drawSubVoronoi(svg, 1);
    drawSubVoronoi(svg, 2);
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

// var test = svg.append("g").attr("class", className + i);

// test
//   .selectAll("path")
//   .data(generateVoronoi2(newData).polygons())
//   .enter()
//   .append("path")
//   .attr("fill", (d, i) => color(Math.random()))
//   .attr("stroke", "#333333")
//   .call(redrawPolygon);
