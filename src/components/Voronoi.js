import { useEffect, useRef } from "react";
import * as d3 from "d3";
import voronoi from "d3-voronoi/src/voronoi";
import {
  interpolateRainbow,
  interpolatePlasma,
  interpolateTurbo,
  interpolateCool,
} from "d3";

function Voronoi() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const colorSchemes = [
    interpolatePlasma,
    interpolateRainbow,
    interpolateTurbo,
    interpolateCool,
  ];
  const color = colorSchemes[Math.floor(Math.random() * colorSchemes.length)];
  console.log(color);
  var nCells = 100;

  var sites = d3.range(nCells).map(function (d) {
    return [Math.random() * width, Math.random() * height];
  });

  const ref = useRef();

  // const colorScheme =
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

    var link = svg
      .append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(generateVoronoi(sites).links())
      .enter()
      .append("line")
      .attr("stroke", "blue");
    // .call(redrawLink);

    var site = svg
      .selectAll("circle")
      .data(sites)
      .join("circle")
      .attr("r", 1)
      .attr("fill", "white");
    // .call(redrawSite);

    function moved(event) {
      sites[0] = d3.pointer(event);
      redraw();
    }

    function redraw() {
      var diagram = generateVoronoi(sites);
      polygon = polygon.data(diagram.polygons()).call(redrawPolygon);
      // link = link.data(diagram.links());
      // link.exit().remove();
      // link = link.enter().append("line").merge(link).call(redrawLink);
      // site = site.data(sites).call(redrawSite);
    }

    function redrawPolygon(polygon) {
      polygon.attr("d", function (d) {
        return d ? "M" + d.join("L") + "Z" : null;
      });
    }

    function redrawLink(link) {
      link
        .attr("x1", function (d) {
          return d.source[0];
        })
        .attr("y1", function (d) {
          return d.source[1];
        })
        .attr("x2", function (d) {
          return d.target[0];
        })
        .attr("y2", function (d) {
          return d.target[1];
        });
    }

    function redrawSite(site) {
      site
        .attr("cx", function (d) {
          return d[0];
        })
        .attr("cy", function (d) {
          return d[1];
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
