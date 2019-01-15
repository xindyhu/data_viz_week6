

/*
 * BarChart - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the bar charts
 * @param _data						-- the dataset 'household characteristics'
 * @param _config					-- variable from the dataset (e.g. 'electricity') and title for each bar chart
 */

BarChart = function(_parentElement, _data, _config){
	this.parentElement = _parentElement;
	this.data = _data;
	this.config = _config;
	this.displayData = _data;

	this.initVis();
}



/*
 * Initialize visualization (static content; e.g. SVG area, axes)
 */

BarChart.prototype.initVis = function(){
	var vis = this;

	vis.margin = { top: 30, right: 60, bottom: 10, left: 100 };

	vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right,
		vis.height = 200 - vis.margin.top - vis.margin.bottom;

	// SVG drawing area
	vis.svg = d3.select("#" + vis.parentElement).append("svg")
		.attr("width", vis.width + vis.margin.left + vis.margin.right)
		.attr("height", vis.height + vis.margin.top + vis.margin.bottom)
		.append("g")
		.attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

	// Scales and axes
	vis.y = d3.scaleBand()
		.rangeRound([0,vis.height])
		.paddingInner(0.3);

	vis.x = d3.scaleLinear()
		.range([0,vis.width]);

	vis.yAxis = d3.axisLeft()
		.scale(vis.y);

	vis.svg.append("g")
		.attr("class", "y-axis axis");

	// (Filter, aggregate, modify data)
	vis.wrangleData();
}



/*
 * Data wrangling
 */

BarChart.prototype.wrangleData = function(){
	var vis = this;

	// (1) Group data by key variable (e.g. 'electricity') and count leaves
	// (2) Sort columsn descending

	var key = vis.config.key;
	//console.log(key);

	vis.countByConfig = d3.nest()
		.key(function(d){return d[key];})
		.rollup(function(leaves) { return leaves.length; })
		.entries(vis.displayData);

	console.log('the nested dataset');
	vis.countByConfig.sort(function(a,b){
		return b.value-a.value;
	});
	console.log(vis.countByConfig);

	// Update the visualization
	vis.updateVis();
}



/*
 * The drawing function - should use the D3 update sequence (enter, update, exit)
 */

BarChart.prototype.updateVis = function(){
	var vis = this;

	// (1) Update domains
	vis.y.domain(vis.countByConfig.map(function(d) { return d.key; }));
	vis.x.domain([0, d3.max(vis.countByConfig, function(d) { return d.value; })]);
	// (2) Draw rectangles
	vis.bar = vis.svg.selectAll("rect")
		.remove()
		.exit()
		.data(vis.countByConfig);

	console.log('data for bar plot');
	console.log(vis.countByConfig);

	vis.bar.enter().append("rect")
		.attr('class','bar')
		.merge(vis.bar)
		.attr('height', vis.y.bandwidth())
		//.attr("width", 0)
		.attr('fill','steelblue')
		.attr("x", 0)
		.attr("y", function(d) {
			return vis.y(d.key); })
		.transition().duration(1000) //how to keep the existing bars?
		.attr('width', function(d){
			//console.log(vis.x(d.value));
			return vis.x(d.value);
		});

	//vis.bar.exit().remove();

	vis.svg.append("text")
		.attr("class","title")
		.attr("transform", "translate(" + (0.5*vis.width) + " ," + (-0.5*vis.margin.top) + ")")
		.style("text-anchor", "middle")
		.text(vis.config.title)
		.attr('fill','navy');

	// (3) Draw labels
	vis.label = vis.svg.selectAll("text.ylabel")
		.remove()
		.exit()
		.data(vis.countByConfig);

	vis.label.enter()
		.append("text")
		.attr("class","ylabel")
		.attr('text-anchor',"middle")
		.attr('x',function(d){
			return (vis.x(d.value)+20);})
		.attr('y',function(d) {
			return vis.y(d.key)+0.65*vis.y.bandwidth(); })
		.text(function(d) {
			//console.log(d.value);
			return d.value;
		})
		.attr('fill','grey');

	vis.label.exit().remove();

	// Update the y-axis
	vis.svg.select(".y-axis").call(vis.yAxis);
}



/*
 * Filter data when the user changes the selection
 * Example for brushRegion: 07/16/2016 to 07/28/2016
 */

BarChart.prototype.selectionChanged = function(brushRegion){
	var vis = this;

	// Filter data accordingly without changing the original data
	vis.displayData = vis.data.filter(function(d) {
		return (d.survey>=brushRegion[0]) && (d.survey<=brushRegion[1]);
	});

	console.log('filtered data');
	console.log(vis.displayData);

	// Update the visualization
	vis.wrangleData();
}
