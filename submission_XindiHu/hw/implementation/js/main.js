
// Bar chart configurations: data keys and chart titles
var configs = [
	{ key: "ownrent", title: "Own or Rent" },
	{ key: "electricity", title: "Electricity" },
	{ key: "latrine", title: "Latrine" },
	{ key: "hohreligion", title: "Religion" }
];


// Initialize variables to save the charts later
var barcharts = [];
var areachart; 


// Date parser to convert strings to date objects
var parseDate = d3.timeParse("%Y-%m-%d");
var formatDate = d3.timeFormat("%Y-%m-%d");


var data;

d3.csv("data/household_characteristics.csv", function(csv){

	// * TO-DO *
	// (1) Load CSV data
	csv.forEach(function(d){
		// 	(2) Convert strings to date objects
		d.survey = parseDate(d.survey);
		d.surveystring = formatDate(d.survey);
	});

	// Store csv data in global variable
	data = csv;
	//console.log('the whole dataset');
	//console.log(data);

	// 	(3) Create new bar chart objects
	barcharts[0] = new BarChart('bar-chart-area-1', data, configs[0]);
	barcharts[1] = new BarChart('bar-chart-area-1', data, configs[1]);
	barcharts[2] = new BarChart('bar-chart-area-1', data, configs[2]);
	barcharts[3] = new BarChart('bar-chart-area-1', data, configs[3]);
	// 	(4) Create new are chart object
	areachart = new AreaChart('area-chart-area',data);
});


// React to 'brushed' event and update all bar charts
function brushed() {

	// Get the extent of the current brush
	var selectionRange = d3.brushSelection(d3.select(".brush").node());
	// Convert the extent into the corresponding domain values
	var selectionDomain = selectionRange.map(areachart.x.invert);
	console.log(selectionDomain);
	// Redraw barchart
	barcharts[0].selectionChanged(selectionDomain);
	barcharts[1].selectionChanged(selectionDomain);
	barcharts[2].selectionChanged(selectionDomain);
	barcharts[3].selectionChanged(selectionDomain);

}
