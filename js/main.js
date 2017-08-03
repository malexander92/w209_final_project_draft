// set initial variables
var curYear = 2001
var curCrimeType = 'TOTAL CRIME'

var	margin = {top: 0, right: 0, bottom: 0, left: 0}
var width = 450 - margin.left - margin.right
var height = 500 - margin.top - margin.bottom
var map_padding = 5

var centered_left
var centered_right

// create the initial color scale for the maps
var colorLeft = d3.scaleLinear()
	.domain([0, 300])
	.range(['white','red'])

var colorRight = d3.scaleLog()
	.domain([0.1, 150])
	.range(['white','blue'])

// set projection to use for the maps (centered on Chicago manually) (using the good ol' mercator)
var projection = d3.geoMercator()
	.scale(50000)
	.center([-87.7, 41.825])
	.translate([width / 2, height / 2])

// initialize the path
var path_left = d3.geoPath()
	.projection(projection)

// initialize the path
var path_right = d3.geoPath()
	.projection(projection)

// create the svg container for the viz
var svg_container = d3.select('body')
	.append('svg')
		.attr('width', width*3 + margin.left + margin.right)
		.attr('height', height*2 + margin.top + margin.bottom)
		.attr('id', 'svg_container')
	.append('g')
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

// create the svg canvas with height and width for left and right maps
var svg_left = d3.select('#svg_container')
	.append('svg')
		.attr('width', width)
		.attr('height', height)

var svg_right = d3.select('#svg_container')
	.append('svg')
		.attr('width', width)
		.attr('height', height)
		.attr('x', width + map_padding)

// create the svg canvas with height and width for the bottom chart
var svg_bottom = d3.select('#svg_container')
	.append('svg')
		.attr('width', width*3)
		.attr('height', height)
		.attr('y', height)

// add left background rectangle
svg_left.append('rect')
	.attr('class', 'left_background')
	.attr('width', width)
	.attr('height', height)
	.on('click', clickedLeft)

// add right background rectangle
svg_right.append('rect')
	.attr('class', 'right_background')
	.attr('width', width)
	.attr('height', height)
	.on('click', clickedRight)

// add bottom background rectangle
svg_bottom.append('rect')
	.attr('class', 'bottom_background')
	.attr('width', (width*3))
	.attr('height', height/(1.61803398875))

var g = svg_left.append('g')

var g2 = svg_right.append('g')

// create left side map layer
var leftMap = g.append('g')
	.classed('map-layer', true)

// create right side map layer
var rightMap = g2.append('g')
	.classed('map-layer', true)

// create left side hover text
var hoverTextLeft = svg_left.append('text')
	.classed('hover-text', true)
	.attr('x', 20)
	.attr('y', 45)

// create right side hover text
var hoverTextRight = svg_right.append('text')
	.classed('hover-text', true)
	.attr('x', 20)
	.attr('y', 45)

// create dictionary for values and load crime data into it
crime_value_dict = {}
surprise_value_dict = {}
crime_value_dict_max = {}

years_set = new Set()
zip_set = new Set()
crime_category_set = new Set()

d3.csv('./data/category_crime_agg_v3.csv', crime_data_load, function(data) {

	crime_category_set.forEach(function(c) {

		max_rate = 0
		
		years_set.forEach(function(y) {

			zip_set.forEach(function(z) {

				if (crime_value_dict[y.concat(z).concat(c)] > max_rate) {

					max_rate = crime_value_dict[y.concat(z).concat(c)]

				}    
			})    
		})
		crime_value_dict_max[c] = max_rate
	})
})

function crime_data_load (d) {

	d.Year = d.Year
	d.zipcode = d.zipcode
	d.PrimaryType = d.PrimaryType
	d.CrimesPerThousand = +d.CrimesPerThousand
	d.SurpriseRatio = +d.SurpriseRatio

	//filter out 2017 records bc the data is incomplete
	if (d.Year != '2017') {

	crime_value_dict[d.Year.concat(d.zipcode).concat(d.PrimaryType)] = d.CrimesPerThousand

	surprise_value_dict[d.Year.concat(d.zipcode).concat(d.PrimaryType)] = d.SurpriseRatio

	years_set.add(d.Year)
	zip_set.add(d.zipcode)
	crime_category_set.add(d.PrimaryType)

	return d
	}
}

// load geo json file with Chicago zipcode shapes
d3.json('./data/ZIP_Codes.geojson', function(error, mapData) {

	var features = mapData.features

	// draw each zipcode area on the left map
	leftMap.selectAll('path')
			.data(features)
		.enter().append('path')
			.attr('d', path_left)
			.attr('vector-effect', 'non-scaling-stroke')
			.style('fill', fillLeft)
			.on('mouseover', mouseoverLeft)
			.on('mouseout', mouseoutLeft)
			.on('click', clickedLeft)

	// draw each zipcode area on the right map
	rightMap.selectAll('path')
			.data(features)
		.enter().append('path')
			.attr('d', path_right)
			.attr('vector-effect', 'non-scaling-stroke')
			.style('fill', fillRight)
			.on('mouseover', mouseoverRight)
			.on('mouseout', mouseoutRight)
			.on('click', clickedRight)

})

// function to get zip code label for each area
function nameFn(d){
	return d && d.properties ? d.properties.zip : null
}

// function to get the fill value for the left map area given current year and crime type
function fillLeft(d){
	if (crime_value_dict[String(curYear).concat(d.properties.zip).concat(curCrimeType)] != null) {
		return colorLeft(crime_value_dict[String(curYear).concat(d.properties.zip).concat(curCrimeType)])
	}
	else {
		return colorLeft(0)
	}
}

// function to get the fill value for the right map area given current year and crime type
function fillRight(d){
	if (surprise_value_dict[String(curYear).concat(d.properties.zip).concat(curCrimeType)] != null) {
		return colorRight(surprise_value_dict[String(curYear).concat(d.properties.zip).concat(curCrimeType)])
	}
	else {
		return colorRight(0.1)
	}
}

// functions to zoom in on click
function clickedLeft(d) {
	var x, y, k

	// calculate the center of the selected area
	if (d && centered_left !== d) {
		var centroid = path_left.centroid(d)
		x = centroid[0]
		y = centroid[1]
		k = 4
		centered_left = d
	} else {
		x = width / 2
		y = height / 2
		k = 1
		centered_left = null
	}

	// highlight the selected zipcode area -dont need right now but may want to add in
	if (centered_left != null) {
		d3.select(this).style('fill', function() {
		//return d3.rgb(d3.select(this).style('fill')).brighter(1)
		return d3.rgb('#FFFF99')
		})
	}

	// zoom in (do we really need to zoom? -- probably not but its cool)
	g.transition()
		.duration(750)
		.attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')scale(' + k + ')translate(' + -x + ',' + -y + ')')
}

function clickedRight(d) {
	var x, y, k

	// calculate the center of the selected area
	if (d && centered_right !== d) {
		var centroid = path_right.centroid(d)
		x = centroid[0]
		y = centroid[1]
		k = 4
		centered_right = d
	} else {
		x = width / 2
		y = height / 2
		k = 1
		centered_right = null
	}

	// highlight the selected zipcode area
	if (centered_right != null) {
		d3.select(this).style('fill', function() {
		//return d3.rgb(d3.select(this).style('fill')).brighter(1)
		return d3.rgb('#FFFF99')
		})
	}

	// zoom in (do we really need to zoom? -- probably not but its cool)
	g2.transition()
		.duration(750)
		.attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')scale(' + k + ')translate(' + -x + ',' + -y + ')')
}

// functions for mouseover
function mouseoverLeft(d){

	// highlight the mouseovered zipcode area (change to a different color?)
	d3.select(this).style('fill', function() {
		//return d3.rgb(d3.select(this).style('fill')).brighter(1)
		return d3.rgb('#FFFF99')
	})

	// set mouseover label text
	hoverTextLeft
		.text(nameFn(d))
}

function mouseoverRight(d){

	// highlight the mouseovered zipcode area (change to a different color?)
	d3.select(this).style('fill', function() {
		//return d3.rgb(d3.select(this).style('fill')).brighter(1)
		return d3.rgb('#FFFF99')
	})

	// set mouseover label text
	hoverTextRight
		.text(nameFn(d))
}

// functions for end of mouseover
function mouseoutLeft(d){

	// reset the highlighting
	leftMap.selectAll('path').style('fill', fillLeft)

	// mouseover label text
	hoverTextLeft.text('')
}

function mouseoutRight(d){

	// reset the highlighting
	rightMap.selectAll('path').style('fill', fillRight)

	// mouseover label text
	hoverTextRight.text('')
}

// update function for changing crime type or year
function update(year, type){

	// update current year and crime variables
	curYear = year
	curCrimeType = type

	// update label on slider
	d3.select('#yearLabel').text(curYear)

	// update the color scale to align with max crime rate for the category
	colorLeft.domain([0, crime_value_dict_max[curCrimeType]])
	
	// re-call fill function on all zipcode area paths
	leftMap.selectAll('path').style('fill', fillLeft)
	rightMap.selectAll('path').style('fill', fillRight)

}


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
    


d3.csv('./data/citywide_crime_test.csv', type, function(error, data) {
  if (error) throw error;

  var crimeTypes = data.columns.slice(1).map(function(id) {
    return {
      id: id,
      values: data.map(function(d) {
        return {date: d.date, crimeRate: d[id]}
      })
    };
  });

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
    .data(crimeTypes)
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

function type(d, _, columns) {
  d.date = parseTime(d.Year)
  for (var i = 1, n = columns.length, c; i < n; ++i) d[c = columns[i]] = +d[c]
  return d
}