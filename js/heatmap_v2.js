var heatMargin = {top: 20, right: 30, bottom: 0, left: 0},
    heatWidth = (450*2) - heatMargin.left - heatMargin.right,
    heatHeight = 550 - heatMargin.top - heatMargin.bottom,
    heatPadding = 5;

var svg_bottom_right = d3.select('#svg_container')
  .append('svg')
    .attr('width', heatWidth)
    .attr('height', heatHeight)
    .attr('y', height+heatPadding)
		.attr('x', 0)

// add bottom background rectangle
svg_bottom_right.append('rect')
  .attr('class', 'bottom_background')
  .attr('width', heatWidth)
  .attr('height', height)



var parseDate = d3.timeParse("%Y"),
    formatDate = d3.timeFormat("%Y");

var x = d3.scaleBand().rangeRound([200,heatWidth]),
    y = d3.scaleBand().rangeRound([0,height-20]),
    z = d3.scaleQuantile()
    	.domain([-1, 1])
    	.range(d3.schemeRdBu[11])


      d3.csv("./data/category_crime_agg_v5.csv", function(error, surprises) {
          if (error) throw error;

          // Coerce the CSV data to the appropriate types.
          surprises.forEach(function(d) {
            d.Year = parseDate(d.Year)
          	d.PrimaryType = d.PrimaryType
            d.SurpriseRatio = +d.SurpriseRatio
            d.zipcode = +d.zipcode

          });

          // filter by year and sort it by year and crimeType
          surprises = surprises
                      .filter(function(d){ return d.Year.getTime() == parseDate(curYear).getTime()})
                      .sort(function (d1, d2) {
                        return d1.PrimaryType.localeCompare(d2.PrimaryType) || d1.zipcode - d2.zipcode;
                      });


          // Compute the scale domains.
          x.domain(surprises.map(function(d){return d.zipcode}))
          y.domain(surprises.map(function(d){return d.PrimaryType}))
          // z.domain([0, d3.max(surprises, function(d) { return d.SurpriseRatio; })]);


        svg_bottom_right.selectAll(".tile")
            .data(surprises)
            .enter().append("rect")
            .attr("class", "tile")
            .attr("x", function(d) { return x(d.zipcode); })
            .attr("y", function(d) { return y(d.PrimaryType); })

            .attr("width", 8)
            .attr("height",8)
            .style("fill", function(d) { return z(d.SurpriseRatio) });

          // Add an x-axis with label.
          svg_bottom_right.append("g")
              .attr("class", "x axis")
              .attr("transform", "translate(0," + 470 + ")")
              .call(d3.axisBottom(x)
                      .tickValues(x.domain().filter(function(d, i) { return !(i % 4); })))
              .append("text")
              .attr("class", "label")
              .attr("x", heatWidth-40)
              .attr("y", -10)
              .attr("text-anchor", "center")
              .text("Zip Codes");

            // Add a y-axis with label.
            svg_bottom_right.append("g")
                .attr("class", "y axis")
                .call(d3.axisLeft(y))
                .attr("transform", "translate( " + 200 + ", 0)")
                .append("text")
                .attr("class", "label")
                .attr("y", 6)
                .attr("dy", ".71em")
                .attr("text-anchor", "end")
                .attr("transform", "rotate(-90)")
                .text("Value");


              svg_bottom_right.selectAll(".y").exit().remove()

  });

function updateHeatMap(){
  d3.csv("./data/category_crime_agg_v5.csv", function(error, surprises) {
      if (error) throw error;

      // Coerce the CSV data to the appropriate types.
      surprises.forEach(function(d) {
        d.Year = parseDate(d.Year)
      	d.PrimaryType = d.PrimaryType
        d.SurpriseRatio = +d.SurpriseRatio
        d.zipcode = +d.zipcode

      });

      // filter by year and sort it by year and crimeType
      surprises = surprises
                  .filter(function(d){ return d.Year.getTime() == parseDate(curYear).getTime()})
                  .sort(function (d1, d2) {
                    return d1.PrimaryType.localeCompare(d2.PrimaryType) || d1.zipcode - d2.zipcode;
                  });


      // Compute the scale domains.
      x.domain(surprises.map(function(d){return d.zipcode}))
      y.domain(surprises.map(function(d){return d.PrimaryType}))
      // z.domain([0, d3.max(surprises, function(d) { return d.SurpriseRatio; })]);

    svg_bottom_right.selectAll(".tile").remove()
    svg_bottom_right.selectAll(".tile")
        .data(surprises)
        .enter().append("rect")
        .attr("class", "tile")
        .attr("x", function(d) { return x(d.zipcode); })
        .attr("y", function(d) { return y(d.PrimaryType); })

        .attr("width", 8)
        .attr("height",8)
        .style("fill", function(d) { return z(d.SurpriseRatio) });

        svg_bottom_right.selectAll(".tile").exit().remove()

  });
}
