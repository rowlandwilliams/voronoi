import { useEffect, useRef } from "react";
import * as d3 from "d3";

function generateCoords(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function Voronoi() {
  const dataset = [];
  for (var i = 0; i < 1000; i++) {
    dataset.push([generateCoords(0, 100) + "%", generateCoords(0, 100) + "%"]);
  }
  console.log(dataset);

  const ref = useRef();

  useEffect(() => {
    plotPoints();
  }, [dataset]);

  const plotPoints = () => {
    const svgElement = d3.select(ref.current);
    svgElement
      .selectAll("circle")
      .data(dataset)
      .join("circle")
      .attr("cx", (d) => d[0])
      .attr("cy", (d) => d[1])
      .attr("r", 3)
      .attr("fill", "blue");
  };

  return (
    <div style={{ margin: "10px", boxSizing: "border-box" }}>
      <svg width="100%" height="calc(100vh - 20px)" ref={ref}></svg>
    </div>
  );
}

export default Voronoi;
