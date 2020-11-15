const margin = {
  top: 30,
  right: 20,
  bottom: 50,
  left: 50,
};
// used for the initial rendering
// width to height proportion
// its preserved as the chart is resized
const width = 900 - margin.left - margin.right;
const height = 380 - margin.top - margin.bottom;
const parseDate = d3.timeParse("%d-%b-%Y");
const xScale = d3.scaleTime().range([0, width]);
const yScale = d3.scaleLinear().rangeRound([height, 0]);
const color = d3.scaleOrdinal(d3.schemeCategory10);
const line = d3
  .line()
  .curve(d3.curveBasis)
  .x((d) => xScale(d.date))
  .y((d) => yScale(d.measurement));

const svg = d3
  .select("#myChart")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .call(responsivefy) // Call responsivefy to make the chart responsive
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

d3.csv("data/testing.csv").then(function (data) {
  const slices = data.columns.slice(1).map((id) => {
    return {
      id: id,
      values: data.map((d) => {
        return {
          date: parseDate(d.date),
          measurement: +d[id],
        };
      }),
    };
  });
  xScale.domain(d3.extent(data, (d) => parseDate(d.date)));
  yScale.domain([
    0,
    d3.max(slices, (c) => {
      return d3.max(c.values, (d) => d.measurement + 4);
    }),
  ]);
  color.domain(data.columns.slice(1).map((d) => d));
  const lines = svg
    .selectAll("lines")
    .data(slices)
    .enter()
    .append("g")
    .attr("id", (d) => "tag-" + d.id);

  lines
    .append("path")
    .attr("class", "line")
    .attr("d", (d) => line(d.values))
    .style("stroke", (d) => color(d.id));

  const yaxis = d3.axisLeft().ticks(slices[0].values.length).scale(yScale);

  const xaxis = d3
    .axisBottom()
    .ticks(d3.timeDay.every(1))
    .tickFormat(d3.timeFormat("%b %d"))
    .scale(xScale);

  svg
    .append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xaxis);

  svg.append("g").attr("class", "axis").call(yaxis);

  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - height / 2)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Energy Consumed (kWh)");

  // add a title
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", 0 - margin.top / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "20px")
    .style("text-decoration", "underline")
    .text("Energy Consumed per hour ");

  const legendSpace = width / slices.length; //Ensures the automatic placement of legends
  const legend = svg
    .selectAll(".legend")
    .data(slices)
    .enter()
    .append("g")
    .attr("class", "legend")
    .attr("id", (d) => "legend-" + d.id)
    .on("click", (e, d) => {
      // Determine if current line is visible
      const active = d.active ? false : true,
        newOpacity = active ? 0 : 1,
        lengendOpacity = active ? 0.4 : 1;
      // Hide or show the elements based on the ID
      d3.select("#tag-" + d.id)
        .transition()
        .duration(100)
        .style("opacity", newOpacity);
      // Update whether or not the elements are active
      d3.select("#legend-" + d.id)
        .transition()
        .duration(100)
        .style("opacity", lengendOpacity);
      d.active = active;
    });

  legend
    .append("circle")
    .attr("cx", (d, i) => legendSpace / 2 + (i * legendSpace - 25))
    .attr("cy", height + margin.bottom / 2 + 15)
    .attr("r", 4)
    .attr("width", 10)
    .attr("height", 10)
    .style("fill", (d) => color(d.id));

  legend
    .append("text")
    .attr("x", (d, i) => legendSpace / 2 + i * legendSpace)
    .attr("y", height + margin.bottom / 2 + 20)
    .text((d) => d.id)
    .style("fill", (d) => color(d.id))
    .style("text-anchor", "middle");

  const mouseG = svg.append("g").attr("class", "mouse-over-effects");

  mouseG
    .append("path") // this is the black vertical line to follow mouse
    .attr("class", "mouse-line")
    .style("stroke", "black")
    .style("stroke-width", "1px")
    .style("opacity", "0");

  const paths = document.getElementsByClassName("line");

  const mousePerLine = mouseG
    .selectAll(".mouse-per-line")
    .data(slices)
    .enter()
    .append("g")
    .attr("class", "mouse-per-line");

  mousePerLine
    .append("circle")
    .attr("r", 5)
    .style("stroke", (d) => color(d.id))
    .style("fill", "none")
    .style("stroke-width", "1px")
    .style("opacity", "0");

  mousePerLine.append("text").attr("transform", "translate(10,3)");

  mouseG
    .append("rect") // append a rect to catch mouse movements on canvas
    .attr("width", width) // can't catch mouse events on a g element
    .attr("height", height)
    .attr("fill", "none")
    .attr("pointer-events", "all")
    .on("mouseout", (event) => {
      // on mouse out hide line, circles and text
      d3.select(".mouse-line").style("opacity", "0");
      d3.selectAll(".mouse-per-line circle").style("opacity", "0");
      d3.selectAll(".mouse-per-line text").style("opacity", "0");
    })
    .on("mouseover", (event) => {
      // on mouse in show line, circles and text
      d3.select(".mouse-line").style("opacity", "1");
      d3.selectAll(".mouse-per-line circle").style("opacity", "1");
      d3.selectAll(".mouse-per-line text").style("opacity", "1");
    })
    .on("mousemove", (event) => {
      // mouse moving over canvas
      const mouse = d3.pointer(event);
      d3.select(".mouse-line").attr("d", () => {
        let d = `M ${mouse[0]},${height}`;
        d += ` ${mouse[0]},0`;
        return d;
      });

      d3.selectAll(".mouse-per-line").attr("transform", function (d, i) {
        const xDate = xScale.invert(mouse[0]),
          bisect = d3.bisector((d) => d.date).right;
        idx = bisect(d.values, xDate);

        let beginning = 0,
          end = paths[i].getTotalLength(),
          target = null;
        while (true) {
          target = Math.floor((beginning + end) / 2);
          pos = paths[i].getPointAtLength(target);
          if ((target === end || target === beginning) && pos.x !== mouse[0]) {
            break;
          }
          if (pos.x > mouse[0]) end = target;
          else if (pos.x < mouse[0]) beginning = target;
          else break; //position found
        }

        d3.select(this)
          .select("text")
          .text(`${yScale.invert(pos.y).toFixed(2)}kWh`); //, ${xScale.invert(pos.x)}

        return "translate(" + mouse[0] + "," + pos.y + ")";
      });
    });
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
