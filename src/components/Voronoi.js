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
  polygonCentroid,
} from "d3";
import "./styles.css";

function Voronoi2() {
  var margin = { top: 50, bottom: 20, right: 20, left: 20 };

  const width = window.innerWidth; //- margin.left - margin.right;
  const height = window.innerHeight; //- -margin.top - margin.bottom;

  const color = interpolateInferno;
  var pointSeed = 8;
  var pointIncreaseFactor = 30;

  //   const ref = useRef();

  function generateRandomPoints(nPoints, minX, maxX, minY, maxY) {
    return d3.range(0, nPoints).map(function (i) {
      return [
        Math.floor(Math.random() * (maxX - minX)) + minX,
        Math.floor(Math.random() * (maxY - minY)) + minY,
      ];
    });
  }

  var points = generateRandomPoints(pointSeed, 0, width, 0, height);

  useEffect(() => {
    plot();
    // window.addEventListener("resize", plot());
  }, [points]);

  var generateVoronoi = voronoi()
    //   .x((d) => d[0])
    //   .y((d) => d[1])
    .extent([
      [0, 0],
      [width, height],
    ]);

  var initialPolygons = generateVoronoi(points).polygons();

  const plot = () => {
    var svg = d3.select(".chart").attr("width", "100%").attr("height", "100%");

    var defs = d3.select(".chart").append("defs");

    drawVoronoi(svg, initialPolygons, undefined, 0);
    var subPolygons = drawSubPolygons(svg, initialPolygons, 1, defs);
    subPolygons = drawSubPolygons(svg, subPolygons, 2, defs);
    subPolygons = drawSubPolygons(svg, subPolygons, 3, defs);
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
        return level === 0 ? "" : interpolateInferno(Math.random());
      })
      .attr("fill-opacity", "0.3")
      .attr("d", polyToPath);
  }

  function drawSubPolygons(parent, parentPols, level, defs) {
    // TOOD: generate random points, should be limited to the bounding box

    var parentLevel = level - 1;

    // we process each of the parent polygons
    var selection = d3.selectAll('path[data-level="' + parentLevel + '"]');

    var totalPolygons = [];
    selection.each(function (d, i) {
      var box = this.getBBox();

      // var points3 = generateRandomPoints(pointSeed * (level * pointIncreaseFactor), box.x, box.x + box.width, box.y, box.y + box.height);
      var points20 = generateRandomPoints(
        pointSeed * level,
        box.x,
        box.x + box.width,
        box.y,
        box.y + box.height
      );

      // use the extent to define where the new voronoi needs to be rendered.
      var voronoi2 = voronoi().extent([
        [box.x, box.y],
        [box.x + box.width, box.y + box.height],
      ]);
      var polygons2 = voronoi2.polygons(points20);

      // draw the new voronois suh
      if (polygons2.length > 0) {
        // the new voronois need to be added in the group with the parent clippath

        drawVoronoi(
          d3.select(this.parentNode),
          polygons2,
          "cp-" + parentLevel + "-" + i,
          level
        );
        addClipPath(d, "cp-" + parentLevel + "-" + i, defs);
      }

      totalPolygons = totalPolygons.concat(polygons2);
    });

    return totalPolygons.flat().flat();
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

export default Voronoi2;
