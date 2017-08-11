
// create the svg canvas with height and width for the bottom chart
var svg_bottom = d3.select('#svg_container')
  .append('svg')
    .attr('width', width*3)
    .attr('height', height)
    .attr('y', height)

// add bottom background rectangle
svg_bottom.append('rect')
  .attr('class', 'bottom_background')
  .attr('width', (width*3))
  .attr('height', height/(1.61803398875))

var	lineMargin = {top: 30, right: 0, bottom: 0, left: 30}
var gLine = svg_bottom.append('g').attr('transform', 'translate(' + lineMargin.left + ',' + lineMargin.top + ')')
var parseTime = d3.timeParse('%Y')


var line_x = d3.scaleTime().range([0, (width*2)-lineMargin.left+map_padding])
var line_y = d3.scaleLinear().range([height/(1.61803398875) - lineMargin.top, 0])
var category_z = d3.scaleOrdinal(d3.schemeCategory20)

var line = d3.line()
    .curve(d3.curveBasis)
    .x(function(d) { return line_x(d.date) })
    .y(function(d) { return line_y(d.crimeRate) })

var crimeTypesFiltered
var crimeTypes




d3.csv('./data/citywide_crime_test_v2.csv', type, function(error, data) {
if (error) throw error;
crimeTypes = data.columns.slice(1).map(function(id) {
  return {
    id: id,
    values: data.map(function(d) {
      return {date: d.date, crimeRate: d[id]}
    })
  };
});

crimeTypesFiltered =  crimeTypes.filter(function(crimeType){
                  return crimeType.id == curCrimeType;
                })
line_x.domain(d3.extent(data, function(d) { return d.date }))
line_y.domain([
  d3.min(crimeTypes, function(c) { return d3.min(c.values, function(d) { return d.crimeRate }) }),
  d3.max(crimeTypes, function(c) { return d3.max(c.values, function(d) { return d.crimeRate }) })
]);
category_z.domain(crimeTypes.map(function(c) { return c.id }))

gLine.append('g')
    .attr('class', 'axis axis--x')
    .attr('transform', 'translate(0,' + (height/(1.61803398875) - lineMargin.top) + ')')
    .call(d3.axisBottom(line_x))

gLine.append('g')
    .attr('class', 'axis axis--y')
    .call(d3.axisLeft(line_y))
  .append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', -30)
    .attr('x', -40)
    .attr('dy', '0.71em')
    .attr('fill', '#000')
    .text('Crime Rate per Thousand People')
    	.style('font', '12px sans-serif')

var crimeType = gLine.selectAll('.crimeType')
  .data(crimeTypesFiltered)
  .enter().append('g')
    .attr('class', 'crimeType')

crimeType.append('path')
    .attr('class', 'line')
    .attr('d', function(d) { return line(d.values); })
    .style('stroke', function(d) { return category_z(d.id) })

crimeType.append('text')
    .datum(function(d) { return {id: d.id, value: d.values[d.values.length - 1]} })
    .attr('transform', function(d) { return 'translate(' + line_x(d.value.date) + ',' + line_y(d.value.crimeRate) + ')' })
    .attr('x', 3)
    .attr('dy', '0.35em')
    .style('font', '10px sans-serif')
    .text(function(d) { return d.id; })

});

function update_chart(){
  d3.csv('./data/citywide_crime_test_v2.csv', type, function(error, data) {
  if (error) throw error;
  crimeTypes = data.columns.slice(1).map(function(id) {
    return {
      id: id,
      values: data.map(function(d) {
        return {date: d.date, crimeRate: d[id]}
      })
    };
  });

  crimeTypesFiltered =  crimeTypes.filter(function(crimeType){
                    return crimeType.id == curCrimeType;
                  })
  //line_x.domain(d3.extent(data, function(d) { return d.date }))
  line_y.domain([
    //d3.min(crimeTypesFiltered, function(c) { return d3.min(c.values, function(d) { return d.crimeRate }) }),
    d3.min(crimeTypesFiltered, function(c) { return d3.min(c.values, function(d) { return 0 }) }),
    d3.max(crimeTypesFiltered, function(c) { return d3.max(c.values, function(d) { return d.crimeRate }) })
  ]);
  category_z.domain(crimeTypes.map(function(c) { return c.id }))

  // gLine.append('g')
  //     .attr('class', 'axis axis--x')
  //     .attr('transform', 'translate(0,' + (height/(1.61803398875) - lineMargin.top) + ')')
  //     .call(d3.axisBottom(line_x))
  //

  gLine.selectAll('.axis--y').remove()
  gLine.append('g')
      .attr('class', 'axis axis--y')
      .call(d3.axisLeft(line_y))
    .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -30)
      .attr('x', -40)
      .attr('dy', '0.71em')
      .attr('fill', '#000')
      .text('Crime Rate per Thousand People')
      	.style('font', '12px sans-serif')

  //gLine.selectAll('.crimeType').remove()


  var crimeType = gLine.selectAll('.crimeType')
    .data(crimeTypesFiltered)
  // crimeType.exit().remove();
  crimeType.enter()
    .append('g')
    .attr('class', 'crimeType')


  crimeType.selectAll('path').remove()
  crimeType.append('path')
      .attr('class', 'line')
      .attr('d', function(d) { return line(d.values); })
      .style('stroke', function(d) { return category_z(d.id) })
  crimeType.selectAll('path').exit().remove()

  crimeType.select('text').remove()
  crimeType.append('text')
      .datum(function(d) { return {id: d.id, value: d.values[d.values.length - 1]} })
      .attr('transform', function(d) { return 'translate(' + line_x(d.value.date) + ',' + line_y(d.value.crimeRate) + ')' })
      .attr('x', 3)
      .attr('dy', '0.35em')
      .style('font', '10px sans-serif')
      .text(function(d) { return d.id; })
  crimeType.select('text').exit().remove()
  });



}


function type(d, _, columns) {
  d.date = parseTime(d.Year)
  for (var i = 1, n = columns.length, c; i < n; ++i) d[c = columns[i]] = +d[c]
  return d
};
