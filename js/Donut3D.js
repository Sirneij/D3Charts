!(function () {
  var Donut3D = {};
  const colors = d3.scaleOrdinal(d3.schemeCategory10);

  function pieTop(d, rx, ry, ir) {
    if (d.endAngle - d.startAngle == 0) return "M 0 0";
    var sx = rx * Math.cos(d.startAngle),
      sy = ry * Math.sin(d.startAngle),
      ex = rx * Math.cos(d.endAngle),
      ey = ry * Math.sin(d.endAngle);

    var ret = [];
    ret.push(
      "M",
      sx,
      sy,
      "A",
      rx,
      ry,
      "0",
      d.endAngle - d.startAngle > Math.PI ? 1 : 0,
      "1",
      ex,
      ey,
      "L",
      ir * ex,
      ir * ey
    );
    ret.push(
      "A",
      ir * rx,
      ir * ry,
      "0",
      d.endAngle - d.startAngle > Math.PI ? 1 : 0,
      "0",
      ir * sx,
      ir * sy,
      "z"
    );
    return ret.join(" ");
  }

  function pieOuter(d, rx, ry, h) {
    var startAngle = d.startAngle > Math.PI ? Math.PI : d.startAngle;
    var endAngle = d.endAngle > Math.PI ? Math.PI : d.endAngle;

    var sx = rx * Math.cos(startAngle),
      sy = ry * Math.sin(startAngle),
      ex = rx * Math.cos(endAngle),
      ey = ry * Math.sin(endAngle);

    var ret = [];
    ret.push(
      "M",
      sx,
      h + sy,
      "A",
      rx,
      ry,
      "0 0 1",
      ex,
      h + ey,
      "L",
      ex,
      ey,
      "A",
      rx,
      ry,
      "0 0 0",
      sx,
      sy,
      "z"
    );
    return ret.join(" ");
  }

  function pieInner(d, rx, ry, h, ir) {
    var startAngle = d.startAngle < Math.PI ? Math.PI : d.startAngle;
    var endAngle = d.endAngle < Math.PI ? Math.PI : d.endAngle;

    var sx = ir * rx * Math.cos(startAngle),
      sy = ir * ry * Math.sin(startAngle),
      ex = ir * rx * Math.cos(endAngle),
      ey = ir * ry * Math.sin(endAngle);

    var ret = [];
    ret.push(
      "M",
      sx,
      sy,
      "A",
      ir * rx,
      ir * ry,
      "0 0 1",
      ex,
      ey,
      "L",
      ex,
      h + ey,
      "A",
      ir * rx,
      ir * ry,
      "0 0 0",
      sx,
      h + sy,
      "z"
    );
    return ret.join(" ");
  }

  function getPercent(d) {
    return d.endAngle - d.startAngle > 0.2
      ? `${d.data.grade} - ${
          Math.round((1000 * (d.endAngle - d.startAngle)) / (Math.PI * 2)) / 10
        }%`
      : "";
  }

  Donut3D.transition = function (id, data, rx, ry, h, ir) {
    function arcTweenInner(a) {
      var i = d3.interpolate(this._current, a);
      this._current = i(0);
      return function (t) {
        return pieInner(i(t), rx + 0.5, ry + 0.5, h, ir);
      };
    }
    function arcTweenTop(a) {
      var i = d3.interpolate(this._current, a);
      this._current = i(0);
      return function (t) {
        return pieTop(i(t), rx, ry, ir);
      };
    }
    function arcTweenOuter(a) {
      var i = d3.interpolate(this._current, a);
      this._current = i(0);
      return function (t) {
        return pieOuter(i(t), rx - 0.5, ry - 0.5, h);
      };
    }
    function textTweenX(a) {
      var i = d3.interpolate(this._current, a);
      this._current = i(0);
      return function (t) {
        return 0.6 * rx * Math.cos(0.5 * (i(t).startAngle + i(t).endAngle));
      };
    }
    function textTweenY(a) {
      var i = d3.interpolate(this._current, a);
      this._current = i(0);
      return function (t) {
        return 0.6 * rx * Math.sin(0.5 * (i(t).startAngle + i(t).endAngle));
      };
    }

    var _data = d3
      .pie()
      .sort(null)
      .value(function (d) {
        return d.value;
      })(data);

    d3.select("#" + id)
      .selectAll(".innerSlice")
      .data(_data)
      .transition()
      .duration(750)
      .attrTween("d", arcTweenInner);

    d3.select("#" + id)
      .selectAll(".topSlice")
      .data(_data)
      .transition()
      .duration(750)
      .attrTween("d", arcTweenTop);

    d3.select("#" + id)
      .selectAll(".outerSlice")
      .data(_data)
      .transition()
      .duration(750)
      .attrTween("d", arcTweenOuter);

    d3.select("#" + id)
      .selectAll(".percent")
      .data(_data)
      .transition()
      .duration(750)
      .attrTween("x", textTweenX)
      .attrTween("y", textTweenY)
      .text(getPercent)
      .style("text-anchor", "middle");
  };

  Donut3D.draw = function (
    id,
    data,
    x /*center x*/,
    y /*center y*/,
    rx /*radius x*/,
    ry /*radius y*/,
    h /*height*/,
    ir /*inner radius*/
  ) {
    var _data = d3
      .pie()
      .sort(null)
      .value((d) => d.student)(data);
    colors.domain(_data.map((d) => d.data));
    var slices = d3
      .select("#" + id)
      .append("g")
      .attr("transform", "translate(" + x + "," + y + ")")
      .attr("class", "slices");

    slices
      .selectAll(".innerSlice")
      .data(_data)
      .enter()
      .append("path")
      .attr("class", "innerSlice")
      .attr("id", (d) => "tag-" + d.data.grade)
      .style("fill", (d) => d3.hsl(colors(d.data.grade)).darker(0.7))
      .attr("d", function (d) {
        return pieInner(d, rx + 0.5, ry + 0.5, h, ir);
      })
      .each(function (d) {
        this._current = d;
      });

    slices
      .selectAll(".topSlice")
      .data(_data)
      .enter()
      .append("path")
      .attr("class", "topSlice")
      .attr("id", (d) => "tag-" + d.data.grade)
      .style("fill", (d) => colors(d.data.grade))
      .style("stroke", (d) => colors(d.data.grade))
      .attr("d", function (d) {
        return pieTop(d, rx, ry, ir);
      })
      .each(function (d) {
        this._current = d;
      });

    slices
      .selectAll(".outerSlice")
      .data(_data)
      .enter()
      .append("path")
      .attr("class", "outerSlice")
      .attr("id", (d) => "tag-" + d.data.grade)
      .style("fill", (d) => d3.hsl(colors(d.data.grade)).darker(0.7))
      .attr("d", function (d) {
        return pieOuter(d, rx - 0.5, ry - 0.5, h);
      })
      .each(function (d) {
        this._current = d;
      });

    slices
      .selectAll(".percent")
      .data(_data)
      .enter()
      .append("text")
      .attr("class", "percent")
      .attr("id", (d) => "tag-" + d.data.grade)
      .attr("x", function (d) {
        return 0.6 * rx * Math.cos(0.5 * (d.startAngle + d.endAngle));
      })
      .attr("y", function (d) {
        return 0.6 * ry * Math.sin(0.5 * (d.startAngle + d.endAngle));
      })
      .text(getPercent)
      .style("text-anchor", "middle")
      .each(function (d) {
        this._current = d;
      });
    const containerId = d3.select("g").attr("id", id).node().parentNode;
    console.log(containerId);
    const chartContainerWidth = containerId.clientWidth;
    const chartContainerHeight = containerId.clientHeight;
    console.log(chartContainerHeight);
    const legendSpace = chartContainerWidth / (2 * data.length); //Ensures the automatic placement of legends
    const legend = d3
      .select("#myChart > svg")
      .selectAll(".legend")
      .data(_data)
      .enter()
      .append("g")
      .attr("class", "legend")
      .attr("id", (d) => "legend-" + d.data.grade)
      .attr(
        "transform",
        `translate(${chartContainerHeight / 3}, ${chartContainerHeight / 6})`
      )
      .on("click", (e, d) => {
        // Determine if current line is visible
        const active = d.active ? false : true,
          newOpacity = active ? 0 : 1,
          lengendOpacity = active ? 0.4 : 1;
        // Hide or show the elements based on the ID
        d3.selectAll("#tag-" + d.data.grade)
          .transition()
          .duration(100)
          // .attr("transform", `translate(${x},${y})`);
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
      .attr("cy", chartContainerHeight / 2 + margin.bottom / 2 + 15)
      .attr("r", 4)
      .attr("width", 10)
      .attr("height", 10)
      .style("fill", (d) => colors(d.data.grade));

    legend
      .append("text")
      .attr("x", (d, i) => legendSpace / 2 + i * legendSpace)
      .attr("y", chartContainerHeight / 2 + margin.bottom / 2 + 20)
      .text((d) => d.data.grade)
      .style("fill", (d) => colors(d.data.grade))
      .style("text-anchor", "middle");
  };

  this.Donut3D = Donut3D;
})();
