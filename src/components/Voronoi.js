function generateCoords(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function Voronoi() {
  const dataset = [];
  for (var i = 0; i < 1000; i++) {
    dataset.push([generateCoords(0, 100) + "%", generateCoords(0, 100) + "%"]);
  }
  console.log(generateCoords(0, 100));

  return (
    <div style={{ margin: "10px", boxSizing: "border-box" }}>
      <svg width="100%" height="calc(100vh - 20px)">
        {dataset.map((x) => (
          <circle cx={x[0]} cy={x[1]} r="3px" fill="blue" />
        ))}
        {/* <rect width="100%" height="100%" fill="red"></rect> */}
      </svg>
    </div>
  );
}

export default Voronoi;
