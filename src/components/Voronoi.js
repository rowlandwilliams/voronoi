import { useEffect, useRef } from "react";
import * as d3 from "d3";
import voronoi from "d3-voronoi/src/voronoi";

function Voronoi() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  function generateCoords(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
  const dataset = [];
  for (var i = 0; i < 1000; i++) {
    dataset.push({
      x: generateCoords(0, width),
      y: generateCoords(0, height),
    });
  }
  console.log(dataset);

  const ref = useRef();

  useEffect(() => {
    plotPoints();
  }, [dataset]);

  const plotPoints = () => {
    const svg = d3
      .select(ref.current)
      .append("svg")
      .attr("viewBox", [0, 0, width, height]);

    var voronoiTest = voronoi()
      .x((d) => d.x)
      .y((d) => d.y)
      .extent([
        [0, 0],
        [width, height],
      ]);

    var voronoiGroup = svg.append("g").attr("class", "voronoi");

    voronoiGroup
      .selectAll("path")
      .data(voronoiTest(dataset).polygons())
      .enter()
      .append("path")
      .attr("d", function (d) {
        return d ? "M" + d.join("L") + "Z" : null;
      });

    svg
      .selectAll("circle")
      .data(dataset)
      .join("circle")
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("r", 3)
      .attr("fill", "blue");
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
