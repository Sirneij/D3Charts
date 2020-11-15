// set the dimensions and margins of the graph
const margin = { top: 40, right: 20, bottom: 70, left: 70 },
  width = 960 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;
// parse the date / time
const parseTime = d3.timeParse("%d-%b-%y");
// set the ranges
const x = d3.scaleTime().range([0, width]);
const y = d3.scaleLinear().range([height, 0]);

// define the area
var area = d3
  .area()
  .x((d) => x(d.date))
  .y0(height) //for above fill y0(0)
  .y1((d) => y(d.close));
// define the line
const valueline = d3
  .line()
  .x((d) => x(d.date))
  .y((d) => y(d.close));
// append the svg obgect to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
const svg = d3
  .select("#chart")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);
// Get the data
d3.csv("data/data.csv").then((data) => {
  // format the data
  data.forEach((d) => {
    d.date = parseTime(d.date);
    d.close = +d.close;
  });
  // Scale the range of the data
  x.domain(d3.extent(data, (d) => d.date));
  y.domain([0, d3.max(data, (d) => d.close)]);

  // add the area
  svg.append("path").data([data]).attr("class", "area").attr("d", area);
  // Add the valueline path.
  svg.append("path").data([data]).attr("class", "line").attr("d", valueline);

  // Add the X Axis
  svg
    .append("g")
    .classed("axis", true)
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(9));

  // text label for the x axis
  svg
    .append("text")
    .attr("transform", `translate(${width / 2},${height + margin.top + 20})`)
    .style("text-anchor", "middle")
    .text("Date");
  // Add the Y Axis
  svg.append("g").classed("axis", true).call(d3.axisLeft(y));
  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - height / 2)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Value");

  // add a title
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", 25)
    .attr("text-anchor", "middle")
    .style("font-size", "24px")
    .style("text-decoration", "underline")
    .attr("class", "shadow")
    .text("Value vs Date Graph");
});
