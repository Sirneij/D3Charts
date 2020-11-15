const nobelData = [
  { key: "USA", value: 336 },
  { key: "UK", value: 98 },
  { key: "Germany", value: 79 },
  { key: "France", value: 60 },
  { key: "Sweden", value: 29 },
  { key: "Switzerland", value: 23 },
  { key: "Japan", value: 21 },
  { key: "Russia", value: 19 },
  { key: "Netherlands", value: 17 },
  { key: "Austria", value: 14 },
];

const MARGINS = {
  bottom: 10,
  top: 20,
};
const CHART_WIDTH = 600;
const CHART_HEIGHT = 400 - MARGINS.top - MARGINS.bottom;
let selectedData = nobelData;

const xAxis = d3
  .scaleBand()
  .domain(nobelData.map((d) => d.key))
  .rangeRound([0, CHART_WIDTH])
  .padding(0.1);
const yAxis = d3
  .scaleLinear()
  .domain([0, d3.max(nobelData, (d) => d.value) + 30])
  .range([CHART_HEIGHT, 0]);

const chartContainer = d3
  .select("#chart svg")
  .attr("width", CHART_WIDTH)
  .attr("height", CHART_HEIGHT + MARGINS.top + MARGINS.bottom);

const chart = chartContainer.append("g");
let unselectedKey = [];

chart
  .append("g")
  .call(d3.axisBottom(xAxis).tickSizeOuter(0))
  .attr("transform", `translate(0, ${CHART_HEIGHT})`)
  .attr("color", "#4f009e");

const renderChart = () => {
  chart
    .selectAll(".bar")
    .data(selectedData, (data) => data.key)
    .enter()
    .append("rect")
    .classed("bar", true)
    .attr("width", xAxis.bandwidth())
    .attr("height", (data) => CHART_HEIGHT - yAxis(data.value))
    .attr("x", (data) => xAxis(data.key))
    .attr("y", (data) => yAxis(data.value));

  chart
    .selectAll(".bar")
    .data(selectedData, (data) => data.key)
    .exit()
    .remove();
  chart
    .selectAll(".label")
    .data(selectedData, (data) => data.key)
    .enter()
    .append("text")
    .text((data) => data.value)
    .attr("x", (data) => xAxis(data.key) + xAxis.bandwidth() / 2)
    .attr("y", (data) => yAxis(data.value) - 20)
    .attr("text-anchor", "middle")
    .classed("label", true);

  chart
    .selectAll(".label")
    .data(selectedData, (data) => data.key)
    .exit()
    .remove();
};
renderChart();
const listItems = d3
  .select("#data")
  .select("ul")
  .selectAll("li")
  .data(nobelData)
  .enter()
  .append("li");

listItems
  .append("label")
  .attr("for", (data) => data.key)
  .text((data) => data.key);
listItems
  .append("input")
  .attr("type", "checkbox")
  .attr("id", (data) => data.key)
  .attr("checked", true)
  .on("change", (event, data) => {
    if (unselectedKey.indexOf(data.key) === -1) {
      unselectedKey.push(data.key);
    } else {
      unselectedKey = unselectedKey.filter((key) => key !== data.key);
    }
    selectedData = nobelData.filter(
      (data) => unselectedKey.indexOf(data.key) === -1
    );
    renderChart();
  });

// const xScale = d3
//   .scaleBand()
//   .domain(nobelData.map((d) => d.key))
//   .rangeRound([0, 600])
//   .padding(0.1);
// const yScale = d3.scaleLinear().domain([0, 340]).range([340, 0]);

// const container = d3.select("#intro").classed("container", true);

// const bars = container
//   .selectAll(".bar")
//   .data(nobelData)
//   .enter()
//   .append("rect")
//   .classed("bar", true)
//   .attr("width", xScale.bandwidth())
//   .attr("height", (data) => 340 - yScale(data.value))
//   .attr("x", (data) => xScale(data.key))
//   .attr("y", (data) => yScale(data.value));
