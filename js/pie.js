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
const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
const radius = Math.min(width, height) / 2 - margin.top;
const svg = d3
  .select("#myChart")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .call(responsivefy); // Call responsivefy to make the chart responsive
// Compute the position of each group on the pie:
// var pie = d3
//   .pie()
//   .sort(null) // Do not sort group by size
//   .value(function (d) {
//     return d.student;
//   });
// var data = pie(students.entries());

const data = d3
  .pie()
  .sort(null)
  .value((d) => d.student)(students);
// console.log(data.map((d) => d.data));
colorScale.domain(data.map((d) => d.data));
const arc = d3
  .arc()
  .innerRadius(0)
  .outerRadius(radius * 0.9);
// .padAngle(0.05)
// .padRadius(50);

// Another arc that won't be drawn. Just for labels positioning
var outerArc = d3
  .arc()
  .innerRadius(radius * 0.96)
  .outerRadius(radius * 0.98);

// svg
//   .append("g")
//   .attr("transform", `translate(${width / 2}, ${height / 2})`)
//   .selectAll("path")
//   .data(data)
//   .enter()
//   .append("path")
//   .attr("d", arc)
//   .attr("id", (d) => `tag-${d.data.grade}`)
//   .attr("fill", (d) => colorScale(d.data.grade))
//   .on("mouseover", (e, d) => {
//     // Determine if current line is visible
//     const active = d.active ? false : true,
//       newOpacity = active ? 0.4 : 1;
//     // Hide or show the elements based on the ID
//     d3.select("#tag-" + d.data.grade)
//       .transition()
//       .duration(100)
//       .style("opacity", newOpacity);
//     d.active = active;
//   })
//   .on("mouseout", (e, d) => {
//     d3.select("#tag-" + d.data.grade)
//       .transition()
//       .style("opacity", 1);
//   });
// Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
svg
  .append("g")
  .attr("transform", `translate(${width / 2}, ${height / 2})`)
  .selectAll("allSlices")
  .data(data)
  .enter()
  .append("path")
  .attr("d", arc)
  .attr("id", (d) => `tag-${d.data.grade}`)
  .attr("fill", function (d) {
    return colorScale(d.data.grade);
  })
  .attr("stroke", "white")
  .style("stroke-width", "2px")
  .style("opacity", 0.7);
// const content = d3
//   .select("g")
//   .selectAll("text")
//   .data(data)
//   .enter()
//   .append("text")
//   .text((d) => d.data.student)
//   .attr("transform", (d) => "translate(" + arc.centroid(d) + ")")
//   .style("text-anchor", "middle");

// Add the polylines between chart and labels:
svg
  .append("g")
  .attr("transform", `translate(${width / 2}, ${height / 2})`)
  .selectAll("allPolylines")
  .data(data)
  .enter()
  .append("polyline")
  .attr("stroke", (d) => colorScale(d.data.grade))
  .style("fill", "none")
  .attr("stroke-width", 1)
  .attr("points", function (d) {
    var posA = arc.centroid(d); // line insertion in the slice
    var posB = outerArc.centroid(d); // line break: we use the other arc generator that has been built only for that
    var posC = outerArc.centroid(d); // Label position = almost the same as posB
    var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2; // we need the angle to see if the X position will be at the extreme right or extreme left
    posC[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
    return [posA, posB, posC];
  });

// Add the polylines between chart and labels:
svg
  .append("g")
  .attr("transform", `translate(${width / 2}, ${height / 2})`)
  .selectAll("allLabels")
  .data(data)
  .enter()
  .append("text")
  .text((d) => `${d.data.grade}(${d.data.student})`)
  .attr("transform", function (d) {
    var pos = outerArc.centroid(d);
    var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
    pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
    return "translate(" + pos + ")";
  })
  .style("text-anchor", function (d) {
    var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
    return midangle < Math.PI ? "start" : "end";
  })
  .style("fill", (d) => colorScale(d.data.grade));

const legendSpace = width / data.length; //Ensures the automatic placement of legends
const legend = svg
  .selectAll(".legend")
  .data(data)
  .enter()
  .append("g")
  .attr("class", "legend")
  .attr("id", (d) => "legend-" + d.data.grade)
  .attr("transform", `translate(0, ${height / 2})`)
  .on("click", (e, d) => {
    // Determine if current line is visible
    const active = d.active ? false : true,
      newOpacity = active ? 0 : 1,
      lengendOpacity = active ? 0.4 : 1;
    // Hide or show the elements based on the ID
    d3.select("#tag-" + d.data.grade)
      .transition()
      .duration(100)
      .style("opacity", newOpacity);
    // Update whether or not the elements are active
    d3.select("#legend-" + d.data.grade)
      .transition()
      .duration(100)
      .style("opacity", lengendOpacity);
    d.active = active;
  });

legend
  .append("circle")
  .attr("cx", (d, i) => legendSpace / 2 + i * legendSpace - 15)
  .attr("cy", height / 2 + margin.bottom / 2 + 15)
  .attr("r", 4)
  .attr("width", 10)
  .attr("height", 10)
  .style("fill", (d) => colorScale(d.data.grade));

legend
  .append("text")
  .attr("x", (d, i) => legendSpace / 2 + i * legendSpace)
  .attr("y", height / 2 + margin.bottom / 2 + 20)
  .text((d) => d.data.grade)
  .style("fill", (d) => colorScale(d.data.grade))
  .style("text-anchor", "middle");

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
