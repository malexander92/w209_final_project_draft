// create the svg canvas with height and width for the bottom chart
var svg_right_bar = d3.select('#svg_container')
  .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('x', width*2 + map_padding*2)

// add bottom background rectangle
svg_right_bar.append('rect')
  .attr('class', 'bar_background')
  .attr('width', width)
  .attr('height', height)

var x_bar = d3.scaleBand()
    .rangeRound([0, width])
    .paddingInner(0.05)
    .align(0.1);

var y_bar = d3.scaleLinear()
    .rangeRound([height, 0]);

d3.csv('./data/crime_bar_test.csv', function(d, i, columns) {
  for (i = 1, t = 0; i < columns.length; ++i) t += d[columns[i]] = +d[columns[i]];
  d.total = t;
  return d;
}, function(error, data) {
  if (error) throw error;

  var keys = data.columns.slice(1);

  data.sort(function(a, b) { return b.total - a.total; });
  x_bar.domain(data.map(function(d) { return d.PrimaryType; }));
  y_bar.domain([0, d3.max(data, function(d) { return d.total; })]).nice();
  category_z.domain(keys);

  svg_right_bar.append('g')
    .selectAll('g')
    .data(d3.stack().keys(keys)(data))
    .enter().append('g')
      .attr('fill', function(d) { return category_z(d.key); })
    .selectAll('rect')
    .data(function(d) { return d; })
    .enter().append('rect')
      .attr('x', function(d) { return x_bar(d.data.PrimaryType); })
      .attr('y', function(d) { return y_bar(d[1]); })
      .attr('height', function(d) { return y_bar(d[0]) - y_bar(d[1]); })
      .attr('width', x_bar.bandwidth());

  svg_right_bar.append('g')
      .attr('class', 'axis')
      .attr('transform', 'translate(0,' + height + ')')
      .call(d3.axisBottom(x_bar));

  svg_right_bar.append('g')
      .attr('class', 'axis')
      .call(d3.axisLeft(y_bar).ticks(null, 's'))
    .append('text')
      .attr('x', 2)
      .attr('y', y_bar(y_bar.ticks().pop()) + 0.5)
      .attr('dy', '0.32em')
      .attr('fill', '#000')
      .attr('font-weight', 'bold')
      .attr('text-anchor', 'start')
      .text('Population');

  var legend = svg_right_bar.append('g')
      .attr('font-family', 'sans-serif')
      .attr('font-size', 10)
      .attr('text-anchor', 'end')
    .selectAll('g')
    .data(keys.slice().reverse())
    .enter().append('g')
      .attr('transform', function(d, i) { return 'translate(0,' + i * 20 + ')'; });

  legend.append('rect')
      .attr('x', width - 19)
      .attr('width', 19)
      .attr('height', 19)
      .attr('fill', category_z);

  legend.append('text')
      .attr('x', width - 24)
      .attr('y', 9.5)
      .attr('dy', '0.32em')
      .text(function(d) { return d; });
});