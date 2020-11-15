const margin = {
  top: 30,
  right: 20,
  bottom: 50,
  left: 50,
};

// Dimensions: 400 x 400
// used for the initial rendering
// width to height proportion
// its preserved as the chart is resized
const width = 900 - margin.left - margin.right;
const height = 380 - margin.top - margin.bottom;
const xScale = d3.scaleBand().padding(0.2).range([0, width]);
const yScale = d3.scaleLinear().range([height, 0]);
const colorColumn = "label";
const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
const svg = d3
  .select("#myChart")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .call(responsivefy) // Call responsivefy to make the chart responsive
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

d3.json("data/smartdata.json").then((data) => {
  data.forEach((d) => {
    d.value = +d.value;
  });
  xScale.domain(data.map((d) => d.label));
  yScale.domain([0, d3.max(data, (d) => d.value) + 30]);
  colorScale.domain(
    data.map(function (data) {
      return data[colorColumn];
    })
  );
  const rects = svg
    .selectAll("rect")
    .data(data, (d) => d.value)
    .enter()
    .append("rect")
    .attr("x", (d) => xScale(d.label))
    .attr("y", (d) => yScale(d.value))
    .attr("width", xScale.bandwidth())
    .attr("height", (d) => height - yScale(d.value))
    .style("fill", function (d) {
      return colorScale(d[colorColumn]);
    });

  // -------- TIP CODE ---------
  const tip = d3
    .tip()
    .attr("class", "d3-tip")
    .offset([-10, 0])
    .html(function (event, data) {
      return (
        "<strong>Energy:</strong> <span style='color:red'>" +
        data.value +
        "</span>"
      );
    });
  svg.call(tip);
  rects.on("mouseenter.tip", tip.show).on("mouseleave.tip", tip.hide);

  svg.append("g").call(d3.axisLeft(yScale).tickFormat(d3.format(".2s")));

  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - height / 2)
    .attr("dy", ".9em")
    .style("text-anchor", "middle")
    .text("Energy consumed (Wh)");

  svg
    .append("g")
    .classed("axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(xScale))
    .selectAll(".domain, .tick line")
    .remove();

  // text label for the x axis
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", height + margin.top + 20)
    .style("text-anchor", "middle")
    .text("Zone");

  // add a title
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", 0 - margin.top / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "20px")
    .text("Smart Energy Data Analysis");
});

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
