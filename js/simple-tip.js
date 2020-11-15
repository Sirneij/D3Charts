// set the dimensions and margins of the graph
const margin = { top: 20, right: 20, bottom: 30, left: 50 },
  width = 960 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

// parse the date / time
const parseTime = d3.timeParse("%d-%b-%y");
const formatTime = d3.timeFormat("%e %B");

// set the ranges
const x = d3.scaleTime().range([0, width]);
const y = d3.scaleLinear().range([height, 0]);

// define the line
const valueline = d3
  .line()
  .x(function (d) {
    return x(d.date);
  })
  .y(function (d) {
    return y(d.close);
  });

const div = d3
  .select("#chart")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

// append the svg obgect to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
const svg = d3
  .select("#chart")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Get the data
d3.csv("data/data.csv").then(function (data) {
  console.log(data);

  // format the data
  data.forEach(function (d) {
    d.date = parseTime(d.date);
    d.close = +d.close;
  });

  // scale the range of the data
  x.domain(
    d3.extent(data, function (d) {
      return d.date;
    })
  );
  y.domain([
    0,
    d3.max(data, function (d) {
      return d.close;
    }),
  ]);

  // add the valueline path.
  svg.append("path").data([data]).attr("class", "line").attr("d", valueline);

  // add the dots with tooltips
  svg
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("r", 5)
    .attr("cx", function (d) {
      return x(d.date);
    })
    .attr("cy", function (d) {
      return y(d.close);
    })
    .on("mouseover", function (event, d) {
      div.transition().duration(200).style("opacity", 0.9);
      div
        .html(formatTime(d.date) + "<br/>" + d.close)
        .style("left", event.pageX + "px")
        .style("top", event.pageY - 28 + "px");
    })
    .on("mouseout", function (d) {
      div.transition().duration(500).style("opacity", 0);
    });

  // add the X Axis
  svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  // add the Y Axis
  svg.append("g").call(d3.axisLeft(y));
});
