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
import "./styles.css";

function Voronoi() {
  //set width for initial point plot
  var width = window.innerWidth;
  var height = window.innerHeight;

  // randomly pick color scheme
  const colorSchemes = [
    interpolateRainbow,
    interpolatePlasma,
    interpolateTurbo,
    interpolateCool,
    interpolateInferno,
    interpolateYlOrRd,
  ];

  const color = colorSchemes[Math.floor(Math.random() * colorSchemes.length)];

  // number of initial polygons
  var pointSeed = 8;

  // generate points for a given g size
  function generateRandomPoints(nPoints, minX, maxX, minY, maxY) {
    return d3.range(0, nPoints).map(function (i) {
      return [
        Math.floor(Math.random() * (maxX - minX)) + minX,
        Math.floor(Math.random() * (maxY - minY)) + minY,
      ];
    });
  }

  // initial points
  var points = generateRandomPoints(
    pointSeed,
    0,
    window.innerWidth,
    0,
    window.innerHeight
  );

  // plot on load
  useEffect(() => {
    plot();
  }, [points]);

  // initial voronoit function
  var generateVoronoi = voronoi().extent([
    [0, 0],
    [width, height],
  ]);

  var initialPolygons = generateVoronoi(points).polygons();

  const plot = () => {
    var svg = d3.select(".chart").attr("width", "100%").attr("height", "100%");

    // append defs here and pass down
    var defs = d3.select(".chart").append("defs");

    drawVoronoi(svg, initialPolygons, undefined, 0);
    var subPolygons = drawSubPolygons(svg, initialPolygons, 1, defs);
    subPolygons = drawSubPolygons(svg, subPolygons, 2, defs);
  };

  function drawVoronoi(parent, polygons, clipArea, level) {
    parent
      .insert("g", ":first-child")
      .attr("clip-path", function (d) {
        return clipArea ? "url(#" + clipArea + ")" : "";
      })
      .attr("class", "polygons")
      .selectAll("path")
      .data(polygons)
      .enter()
      .insert("path")
      .attr("data-level", level)
      .attr("stroke-width", function () {
        return 6 / ((level + 1) * 2);
      })
      .attr("stroke", function () {
        d3.hsl("#000").brighter(level);
      })
      .attr("fill", function () {
        return level === 0 ? "" : color(Math.random());
      })
      .attr("fill-opacity", "0.3")
      .attr("d", polyToPath);
  }

  function drawSubPolygons(parent, parentPols, level, defs) {
    var parentLevel = level - 1;

    // find all parent polygons using parent level
    var selection = d3.selectAll('path[data-level="' + parentLevel + '"]');

    // iterate across each parent polygon
    selection.each(function (d, i) {
      // determine the bounding box
      var box = this.getBBox();

      // gernerate new points for the bounding box of each polygon
      var pointsNew = generateRandomPoints(
        pointSeed * level,
        box.x,
        box.x + box.width,
        box.y,
        box.y + box.height
      );

      // set extent of new voronoi based on bounding coords
      var voronoi2 = voronoi().extent([
        [box.x, box.y],
        [box.x + box.width, box.y + box.height],
      ]);

      //define new coords
      var polygons2 = voronoi2.polygons(pointsNew);

      // draw new Voronoi and clip based on parent clip path id
      drawVoronoi(
        d3.select(this.parentNode),
        polygons2,
        "cp-" + parentLevel + "-" + i,
        level
      );
      addClipPath(d, "cp-" + parentLevel + "-" + i, defs);
    });

  }

  function addClipPath(outline, pathId, defs) {
    defs
      .append("clipPath")
      .attr("id", pathId)
      .append("path")
      .attr("d", polyToPath(outline));
  }

  function polyToPath(polygon) {
    return polygon ? "M" + polygon.join("L") + "Z" : null;
  }

  return (
    <div className="chart-wrap">
      <svg class="chart"></svg>
    </div>
  );
}

export default Voronoi;
