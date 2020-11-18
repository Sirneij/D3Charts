const margin = {
  top: 30,
  right: 20,
  bottom: 50,
  left: 50,
};

const students = [
  { grade: "A", student: 8 },
  { grade: "B", student: 21 },
  { grade: "C", student: 29 },
  { grade: "D", student: 15 },
  { grade: "E", student: 18 },
  { grade: "F", student: 3 },
];

const width = 900 - margin.left - margin.right;
const height = 380 - margin.top - margin.bottom;

const svg = d3
  .select("#myChart")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .call(responsivefy); // Call responsivefy to make the chart responsive

svg.append("g").attr("id", "quotesDonut");

Donut3D.draw("quotesDonut", students, 450, 150, 130, 100, 30, 0);

function responsivefy(svg) {
  // Container is the DOM element, svg is appended.
  // Then we measure the container and find its
  // aspect ratio.
  const container = d3.select(svg.node().parentNode),
    width = parseInt(svg.style("width"), 10),
    height = parseInt(svg.style("height"), 10),
    aspect = width / height;

  // Add viewBox attribute to set the value to initial size
  // add preserveAspectRatio attribute to specify how to scale
  // and call resize so that svg resizes on page load
  svg
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMinYMid")
    .call(resize);

  d3.select(window).on("resize." + container.attr("id"), resize);

  function resize() {
    const targetWidth = parseInt(container.style("width"));
    svg.attr("width", targetWidth);
    svg.attr("height", Math.round(targetWidth / aspect));
  }
}
