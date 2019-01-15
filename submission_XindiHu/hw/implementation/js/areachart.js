
/*
 * AreaChart - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the area chart
 * @param _data						-- the dataset 'household characteristics'
 */

AreaChart = function(_parentElement, _data){
	this.parentElement = _parentElement;
	this.data = _data;
	this.displayData = [];
	//console.log(this.data); //debug raw data
	this.initVis();
}


/*
 * Initialize visualization (static content; e.g. SVG area, axes, brush component)
 */

AreaChart.prototype.initVis = function(){
	var vis = this;

	// * TO-DO *
	vis.margin = { top: 40, right: 0, bottom: 60, left: 60 };

	vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right,
		vis.height = 400 - vis.margin.top - vis.margin.bottom;
	// SVG drawing area
	vis.svg = d3.select("#" + vis.parentElement).append("svg")
		.attr("width", vis.width + vis.margin.left + vis.margin.right)
		.attr("height", vis.height + vis.margin.top + vis.margin.bottom)
		.append("g")
		.attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")")
		.attr("viewbox", "0 0 800 600");

	// Scales and axes
	vis.x = d3.scaleTime()
		.range([0, vis.width]);

	vis.y = d3.scaleLinear()
		.range([vis.height, 0]);

	vis.xAxis = d3.axisBottom()
		.scale(vis.x);

	vis.yAxis = d3.axisLeft()
		.scale(vis.y);

	vis.svg.append("g")
		.attr("class", "x-axis axis")
		.attr("transform", "translate(0," + vis.height + ")");

	vis.svg.append("g")
		.attr("class", "y-axis axis");

	vis.area = d3.area()
		.curve(d3.curveCardinal)
		.x(function(d) {
			//console.log(vis.x(d.key));
			return vis.x(d.key); }) //x is defined within d3, need to refer to vis.x
		.y1(function(d) {
			//console.log(vis.y(d.value));
			return vis.y(d.value); })
		.y0(vis.height);

	vis.brush = d3.brushX()
		.extent([[0, 0], [vis.width, vis.height]])
		.on("brush", brushed);

	// (Filter, aggregate, modify data)
	vis.wrangleData();
}


/*
 * Data wrangling
 */

AreaChart.prototype.wrangleData = function(){
	var vis = this;

	// (1) Group data by date and count survey results for each day
	// (2) Sort data by day

	//console.log(vis.data);

	vis.countByDay = d3.nest()
		.key(function(d){return d.surveystring;})
		.rollup(function(leaves) { return leaves.length; })
		.entries(vis.data);

	vis.countByDay.forEach(function(d){
		d.key = parseDate(d.key);
		//console.log(d.key);
	});

	//console.log('number of surveys by date');
	vis.countByDay.sort(function(a,b){
		return a.key-b.key;
	});
	//console.log(vis.countByDay);

	// Update the visualization
	vis.updateVis();
}


/*
 * The drawing function
 */

AreaChart.prototype.updateVis = function(){
	var vis = this;
	vis.x.domain([d3.min(vis.countByDay, function(d){
		return d.key;
	}), d3.max(vis.countByDay, function(d){
		return d.key;
	})]);

	vis.y.domain([0, d3.max(vis.countByDay, function(d) {
			return d.value;
		})]);

	//console.log('data used for area plot');
	//console.log(vis.countByDay);

	// Draw the layers
	var path = vis.svg.append('path')
		.datum(vis.countByDay)
		.attr("class", "area")
		.attr("fill",'steelblue')
		.attr("d",vis.area);


	// Call axis functions with the new domain
	vis.svg.select(".x-axis").call(vis.xAxis);
	vis.svg.select(".y-axis").call(vis.yAxis);

	//brush
	vis.svg.append("g")
		.attr("class", "x brush")
		.call(vis.brush)
		.selectAll("rect")
		.attr("y", -6)
		.attr("height", vis.height + 7);
}

