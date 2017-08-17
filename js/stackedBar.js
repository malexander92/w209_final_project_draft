barMarginBottom = 0
barMarginTop = 0

barWidth = 50

barSVGHeight = height + 25

// create the svg canvas with height and width for the bottom chart
var svg_right_bar = d3.select('#svg_container')
  .append('svg')
    .attr('width', width)
    .attr('height', barSVGHeight)
    .attr('x', width*2 + map_padding*2)

// add bottom background rectangle
svg_right_bar.append('rect')
  .attr('class', 'bar_background')
  .attr('width', width)
  .attr('height', height)

var x_bar = d3.scaleBand()
    .rangeRound([25, barWidth+25])
    .paddingInner(0.05)
    .align(0.1);

var y_bar = d3.scaleLinear()
    .rangeRound([height-barMarginBottom, barMarginTop]);

d3.csv('./data/crime_bar_test.csv', function(d, i, columns) {
  if (parseInt(d.Year) == curYear) {
    for (i = 1, t = 0; i < columns.length; ++i) t += d[columns[i]] = +d[columns[i]];
    d.total = t;
    return d;
  }
}, function(error, data) {
  if (error) throw error;

  var keys = data.columns.slice(1);

  data.sort(function(a, b) { return b.total - a.total; });
  x_bar.domain(data.map(function(d) { return d.Year; }));
  y_bar.domain([0, d3.max(data, function(d) { return d.total; })]).nice();
  category_z.domain(keys);

  svg_right_bar.append('g')
    .selectAll('g')
    .data(d3.stack().keys(keys)(data))
    .enter().append('g')
      .attr('fill', function(d) { return category_z(d.key); })
    .selectAll('rect')
    .data(function(d) {return d; })
    .enter().append('rect')
      .classed('barchartStacks', true)
      .attr('x', function(d) { return x_bar(d.data.Year); })
      .attr('y', function(d) { return y_bar(d[1]); })
      .attr('height', function(d) { return y_bar(d[0]) - y_bar(d[1]); })
      .attr('width', x_bar.bandwidth());
  /*
  svg_right_bar.append('g')
      .attr('class', 'axis')
      .attr('transform', 'translate(0,' + (height-barMarginBottom) + ')')
      .call(d3.axisBottom(x_bar));
  */
  var legend = svg_right_bar.append('g')
      .attr('font-family', 'sans-serif')
      .attr('font-size', 10)
      .attr('text-anchor', 'end')
    .selectAll('g')
    .data(keys.slice().reverse())
    .enter().append('g')
      .attr('transform', function(d, i) { return 'translate(0,' + i * 20 + ')'; });

  legend.append('rect')
      .attr('x', width - (19+150))
      .attr('width', 19)
      .attr('height', 19)
      .attr('fill', category_z);

  legend.append('text')
      .attr('x', width - (24+150))
      .attr('y', 9.5)
      .attr('dy', '0.32em')
      .text(function(d) { return d; });
});

function updateBars() {

  d3.csv('./data/crime_bar_test.csv', function(d, i, columns) {
  if (parseInt(d.Year) == curYear) {
    for (i = 1, t = 0; i < columns.length; ++i) t += d[columns[i]] = +d[columns[i]];
    d.total = t;
    return d;
  }
}, function(error, data) {
  if (error) throw error;

  var keys = data.columns.slice(1);
  x_bar.domain(data.map(function(d) { return d.Year; }));

  data.sort(function(a, b) { return b.total - a.total; });

  svg_right_bar.selectAll('rect.barchartStacks').remove()

  svg_right_bar.append('g')
    .selectAll('g')
    .data(d3.stack().keys(keys)(data))
    .enter().append('g')
      .attr('fill', function(d) { return category_z(d.key); })
    .selectAll('rect')
    .data(function(d) {return d; })
    .enter().append('rect')
      .classed('barchartStacks', true)
      .attr('x', function(d) { return x_bar(d.data.Year); })
      .attr('y', function(d) { return y_bar(d[1]); })
      .attr('height', function(d) { return y_bar(d[0]) - y_bar(d[1]); })
      .attr('width', x_bar.bandwidth());
  })
  /*
  svg_right_bar.selectAll('.axis').remove()
  
  svg_right_bar.append('g')
      .attr('class', 'axis')
      .attr('transform', 'translate(0,' + (height-barMarginBottom) + ')')
      .call(d3.axisBottom(x_bar))
  */

}