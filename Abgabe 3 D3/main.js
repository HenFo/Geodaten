 // Map of bezirke in the world

 // shapefiles were taken from https://www.naturalearthdata.com/downloads/
 // the conversion to topjson was done using https://mapshaper.org/

 // svg margin parameters
 var margin = {
 	top: 20,
 	right: 20,
 	bottom: 20,
 	left: 20
 };
 var width = 800 - margin.left - margin.right,
 	height = 600 - margin.top - margin.bottom;

 var width2 = 500 - margin.left - margin.right,
 	height2 = 675 - margin.top - margin.bottom;


 // svg parameters
 var svg = d3.select("body").append("svg")
 	.attr("width", width + margin.left + margin.right)
 	.attr("height", height + margin.top + margin.bottom)
 	.style("background", "#ececec")
 	.append("g")
 	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

 // parameters of the svg for the bar charts
 var svg2 = d3.select("body").append("svg")
 	.attr("width", width2 + margin.left + margin.right)
 	.attr("height", height2 + margin.top + margin.bottom)
 	.style("background", "white")
 	.append("g")
 	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

 // div for the information
 var div = d3.select("body").append("div")
 	.attr("id", "infodiv");

 //  //  color scale 
 var color = d3.scaleOrdinal()
 	.domain(["Sensors",
 		"Cityparts"
 	])
 	.range(['darkgoldenrod', '#86a888']);


 // currrent projection
 var currentprojection = d3.geoMercator()
 	.center([7.628694, 51.962944])
 	.scale(90000)
 	.translate([width / 2, height / 2]);

 // geopath                        
 var geopath = d3.geoPath().projection(currentprojection);

 // format number for human consumption 
 var formatNumber = d3.format(",.0f");

  // Labels of the legend are the same as the domain of the color scale
 var legend_labels = color.domain().reverse(); 

 var legend = d3.select("body")
 	.append("svg")
 	.attr("width", 70)
 	.attr("height", 40)
 	.style("background", "#d6cbd3")
 	.attr("class", "legend")
 	.selectAll("g") // create one group per label
 	.data(legend_labels)
 	.enter().append("g")
 	.attr("transform", function (d, i) {
 		return "translate(0," + i * 20 + ")";
 	});

 //  // create rectangles, one with the color
 legend.append("rect")
 	.attr("width", 18)
 	.attr("height", 18)
 	.style("fill", function (d) {
		 return color(d)
	 });

  // add text, next to the rectangle about what the colors mean
 legend.append("text")
 	.attr("x", 24)
 	.attr("y", 9)
 	.attr("dy", ".35em")
 	.text(function (d) {
 		return d;
 	});

 d3.json("shapefile_m_nster_stadtteile.json")
 	.then(
 		function (dataset) {

 			//console.log(dataset); 
			// get all cityparts as shapes
 			var bezirke = topojson.feature(dataset, dataset.objects.shapefile_m_nster_stadtteile).features;

 			d3.csv("https://raw.githubusercontent.com/Anika2/Geodaten_WS18_19/master/Daten_Geodaten_WS18_19/temperaturdaten_stundenmittel.csv")
 				.then(function (tempData) {
 					// delimiter for the parser
 					var parser = d3.dsvFormat(",");

 					// format the dataset as csv, and then use the parser to return the data elements
 					var tempDataset = parser.parse(d3.csvFormat(tempData));
 					console.log(tempDataset)

					//  convert temperatur dataset to GeoJSON points
 					var tempData = tempDataset.map(function (data) {
 						var geojson = {
 							'type': 'Feature',
 							'geometry': {
 								'type': 'Point',
 								'coordinates': [
 									data.lon,
 									data.lat
 								]
 							},
 							'properties': {
 								data
 							}
 						};
 						return geojson;
 					});

 					// data binding
 					var cityShapes = d3.select("svg").selectAll("path").data(bezirke);
 					var circles = d3.select("svg").selectAll("circle").data(tempData);

 					// create paths
 					cityShapes.enter()
 						.append("path")
 						.attr("d", geopath)
 						.attr("class", "country")
 						.attr("fill", "#86a888")
 						.on("mouseover", function (d) {
							//  change color when hovering the citypart
 							d3.select(this).classed("country hovered", true);
 							div.style("display", "inline")
 							div.text(d.properties.name_stati);
 						})
 						.on("mouseout", function (d) {
							//  chnage color back to original
 							d3.select(this).classed("country hovered", false);
 							d3.select(this).classed("country", true);
 							div.style("display", "none");
 						});

 					circles.enter().append("circle")
 						.attr("transform", function (d) { 
							//  put circles in correct position on the map
 							return "translate(" + geopath.centroid(d) + ")";
 						})
 						.attr("r", 10)
 						.attr("class", "circle")
 						.on("mouseover", function (d) {
							//  create the diagram showing the temperature 
 							createDiagram(d.properties.data.boxId);
 						})
 						.on("mouseout", function (d) {
							//  clear the diagram svg
 							svg2.selectAll("*").remove();
 						})
 						.append("title")
 						.text(function (d) {
 							return "BoxName: " + d.properties.data.boxName +
 								"\nPhänomen: " + 'Temperatur';
 						});


 					function createDiagram(boxID) {

 						console.log("Current BoxID: " + boxID);

 						var currentboxid = new Object();
 						tempDataset.forEach(function (obj) {
							// search for correct Box
 							if (parseInt(obj.boxId) == parseInt(boxID)) {
 								currentboxid = obj;
 							}

 						});

						//  check if there is anything to show
 						if (currentboxid == undefined || currentboxid == null || Object.keys(currentboxid).length === 0) {
 							console.log("No information available for this Box");
 							svg2.append("text").text("No information available for this Box");
 						} else {
 							// retrieve information about the current box
 							var dataitem = formatObject(currentboxid);
							 
 							// create the scales for x and y axis
 							var x = d3.scaleBand().rangeRound([40, width2]).padding(0.1), // time scale did not work
 								y = d3.scaleLinear().rangeRound([height2 - 75, 0]);

 							var line = d3.line()
 								.x(function (d) {
 									return x(d[0])
 								})
 								.y(function (d) {
 									return y(d[1])
 								})

 							x.domain(dataitem.map(function (d) {
 								return d[0];
 							}));

 							y.domain([0, d3.max(dataitem, function (d) {
 								return d[1];
							 })]);
							 
							//  create the x-axis
 							svg2.append("g")
 								.attr("transform", "translate(0," + height + ")")
 								.call(d3.axisBottom(x))
 								.selectAll("text")
 								.style("text-anchor", "end") // positioning the text below the x-axis
 								.attr("dx", "-.8em")
 								.attr("dy", ".15em")
 								.attr("transform", "rotate(-70)") // rotate the text to make it readable
 								.select(".domain")
 								.remove();

							//  create y-axis
 							svg2.append("g")
 								.call(d3.axisLeft(y))
 								.append("text") // add text for y-axis
 								.attr("fill", "#000")
 								.attr("transform", "rotate(-90)")
 								.attr("y", 6)
 								.attr("dy", "0.71em")
 								.attr("text-anchor", "end")
 								.text("Temperature");

							//  create the diagram path
 							svg2.append("path")
 								.datum(dataitem)
 								.attr("fill", "none")
 								.attr("stroke", "steelblue")
 								.attr("stroke-linejoin", "round")
 								.attr("stroke-linecap", "round")
 								.attr("stroke-width", 1.5)
 								.attr("d", line);
 						}
 					}

 					// go through the whole data item for a box, and only keep the temperatur values
 					var formatObject = function (rawdataobject) {
 						var formattedObject = new Array();

 						for (var key in rawdataobject) {
 							if (key.search("2018") >= 0) {
 								// remove spaces from the string, and convert it to Float
 								var value = parseFloat(rawdataobject[key].replace(/\s/g, ''));
 								var temp = new Array(key, value);
 								formattedObject.push(temp);
 							}
 						}

 						return formattedObject;
 					}
 				}),

 				function (error) {
 					console.log(error);

 				}
 			/* 

 			  // https://d3indepth.com/geographic/ [choice of right parameters for scaling]

 			  // https://github.com/d3/d3-geo [path.centroid]

 			  // DIV Formatting: https://stackoverflow.com/questions/8865458/vertically-center-text-with-css

 			  // Legend: code taken, and slightly modified from https://bl.ocks.org/mbostock/3888852 

 			  // Bubble map ideas adapted from https://bl.ocks.org/mbostock/9943478 

 			  // Small entry on scaleSqrt() https://bl.ocks.org/d3indepth/775cf431e64b6718481c06fc45dc34f9

 			  // d3 format: format numbers for human consumption https://github.com/d3/d3-format

 			  */
 		},


 		function (error) {
 			console.log(error);
 		}
 	);