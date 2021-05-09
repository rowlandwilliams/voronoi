import { useEffect, useRef } from "react";
import * as d3 from "d3";
import voronoi from "d3-voronoi/src/voronoi";
import "./styles.css";

function Voronoi() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  var nCells = 1000;

  function generateCoords(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
  const dataset = [];
  for (var i = 0; i < nCells; i++) {
    dataset.push([generateCoords(0, width), generateCoords(0, height)]);
  }
  console.log(dataset);

  const ref = useRef();

  useEffect(() => {
    plotPoints();
    window.addEventListener("resize", plotPoints());
  }, [dataset]);

  const plotPoints = () => {
    d3.select(".svg").remove();

    const svg = d3
      .select(ref.current)
      .append("svg")
      .attr("class", "svg")
      .attr("viewBox", [0, 0, width, height]);

    var voronoiTest = voronoi()
      .x((d) => d[0])
      .y((d) => d[1])
      .extent([
        [0, 0],
        [width, height],
      ]);

    var voronoiGroup = svg.append("g").attr("class", "voronoi");

    var cols = Array.from(
      { length: nCells },
      () => "#" + Math.floor(Math.random() * 16777215).toString(16)
    );

    voronoiGroup
      .selectAll("path")
      .data(voronoiTest(dataset).polygons())
      .enter()
      .append("path")
      .attr("fill", (d, i) => cols[i])
      .attr("d", function (d) {
        return d ? "M" + d.join("L") + "Z" : null;
      });

    svg
      .append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(voronoiTest.links(dataset))
      .enter()
      .append("line");
    //   .call(redrawLink);
    svg
      .selectAll("circle")
      .data(dataset)
      .join("circle")
      .attr("cx", (d) => d[0])
      .attr("cy", (d) => d[1])
      .attr("r", 1)
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
