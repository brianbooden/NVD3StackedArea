define(["jquery", "./d3.min", "css!./nv.d3.min.css", "./nv.d3.min"], 
function($) {
	'use strict';
	
	return {
		initialProperties: {
			qHyperCubeDef: {
				qDimensions: [],
				qMeasures: [],
				qInitialDataFetch: [{
					qWidth: 3,
					qHeight: 3333
				}]
			}
		},
		definition: {
			type: "items",
			component: "accordion",
			items: {
				dimensions: {
					uses: "dimensions",
					min: 2,
					max: 2
				},
				measures: {
					uses: "measures",
					min: 1,
					max: 1
				},
				sorting: {
					uses: "sorting"
				},
				settings : {
					uses : "settings",
					items : {
						chartType: {
							ref: "chartType",
							type: "string",
							component: "dropdown",
							label: "Chart Type",
							options: 
								[ {
									value: "stack",
									label: "Stacked"
								}, {
									value: "stream",
									label: "Stream"
								}, {
									value: "expand",
									label: "Expanded"
								}
								],
							defaultValue: "stream"
						},
						colors: {
								  ref: "ColorSchema",
								  type: "string",
								  component: "dropdown",
								  label: "Color and Legend",
								  options: 
									[ {
										value: "#fff7bc, #fee391, #fec44f, #fe9929, #ec7014, #cc4c02, #993404, #662506",
										label: "Sequencial"
									}, {
										value: "#662506, #993404, #cc4c02, #ec7014, #fe9929, #fec44f, #fee391, #fff7bc",
										label: "Sequencial (Reverse)"
									}, {
										value: "#d73027, #f46d43, #fdae61, #fee090, #e0f3f8, #abd9e9, #74add1, #4575b4",
										label: "Diverging RdYlBu"
									}, {
										value: "#4575b4, #74add1, #abd9e9, #e0f3f8, #fee090, #fdae61, #f46d43, #d73027",
										label: "Diverging BuYlRd (Reverse)"
									}, {
										value: "#deebf7, #c6dbef, #9ecae1, #6baed6, #4292c6, #2171b5, #08519c, #08306b",
										label: "Blues"
									}, {
										value: "#fee0d2, #fcbba1, #fc9272, #fb6a4a, #ef3b2c, #cb181d, #a50f15, #67000d",
										label: "Reds"
									}, {
										value: "#edf8b1, #c7e9b4, #7fcdbb, #41b6c4, #1d91c0, #225ea8, #253494, #081d58",
										label: "YlGnBu"
									}
								],
									defaultValue: "#fff7bc, #fee391, #fec44f, #fe9929, #ec7014, #cc4c02, #993404, #662506"
								},
						showLegend:{
							type: "boolean",
							component: "switch",
							translation: "Show Legend",
							ref: "showLegend",
							defaultValue: true,
							trueOption: {
							  value: true,
							  translation: "properties.on"
							},
							falseOption: {
							  value: false,
							  translation: "properties.off"
							},
							show: true
						  },
						  showControls:{
							type: "boolean",
							component: "switch",
							translation: "Show Controls",
							ref: "showControls",
							defaultValue: true,
							trueOption: {
							  value: true,
							  translation: "properties.on"
							},
							falseOption: {
							  value: false,
							  translation: "properties.off"
							},
							show: true
						  },
						  showInteractiveGuideline:{
							type: "boolean",
							component: "switch",
							translation: "Interactive Guideline",
							ref: "showInteractiveGuideline",
							defaultValue: true,
							trueOption: {
							  value: true,
							  translation: "properties.on"
							},
							falseOption: {
							  value: false,
							  translation: "properties.off"
							},
							show: true
						  },
						
						}
				}
			}
		},
		snapshot: {
			canTakeSnapshot: true
		},
	
		
	
		paint: function ($element, layout) {
		
		
			// Call SenseUtils to page the data for > 10000 points
			//senseUtils.pageExtensionData(this, $element, layout, drawStreamChart, self);
			drawStreamChart($element, layout, layout.qHyperCube.qDataPages[0].qMatrix, self);
			
		}
	};
});

function drawStreamChart($element, layout, fullMatrix, self) {
			
			// get qMatrix data array
			//var qMatrix = layout.qHyperCube.qDataPages[0].qMatrix;
			//create matrix variable
			var qMatrix = fullMatrix;
		
			//console.log(qMatrix);
		
			// create a new array that contains the measure labels
			var measureLabels = layout.qHyperCube.qMeasureInfo.map(function(d) {
				return d.qFallbackTitle;
			});
			// Create a new array for our extension with a row for each row in the qMatrix
			// Filter dimesnion Null value 
			var data = qMatrix;

			// Get the selected counts for the 2 dimensions, which will be used later for custom selection logic
			var selections = {
				dim1_count: layout.qHyperCube.qDimensionInfo[0].qStateCounts.qSelected,
				dim2_count: layout.qHyperCube.qDimensionInfo[1].qStateCounts.qSelected
			};
			 
			// Chart object width
			var width = $element.width();
			// Chart object height
			var height = $element.height();
			// Chart object id
			var id = "container_" + layout.qInfo.qId;
		    		 
			// Check to see if the chart element has already been created
			// if (document.getElementById(id)) {
				// // if it has been created, empty it's contents so we can redraw it
				// $("#" + id).empty();
			// }
			// else {
				// if it hasn't been created, create it with the appropriate id and size
				$element.empty().append($('<div />').attr({ "id": id, "class": "qv-object-nvd3-stacked-area" }).css({ height: height, width: width }));
			// }
			
			viz(self, data, measureLabels, width, height, id, selections, layout, $element);
	
}
			
var viz = function (self, data, labels, width, height, id, selections, layout, $element) {

	// Get the properties
	var chartType = layout.chartType,
		colorSchema = layout.ColorSchema.split(", "),
		showLegend = layout.showLegend,
		showControls = layout.showControls,
		showInteractiveGuideline = layout.showInteractiveGuideline;

	// get key elements in Qlik Sense order
	var listKey = [],
		dateKey = [],
		dateVal = 0;
	$.each(data, function( index, row ) {
		if ($.inArray(row[0].qText, listKey) === -1) {
			listKey.push(row[0].qText);
		}
		dateVal = convertToUnixTime(row[1].qNum);
		if ($.inArray(dateVal, dateKey) === -1) {
			dateKey.push(dateVal);
		}
	});

	var dataNVD3 = data.map(function(row){
					return {"key" : row[0].qText, "x" : convertToUnixTime(row[1].qNum), "y" : row[2].qNum};
				});
	// Transform data set
	dataNVD3 = d3.nest()
				.key(function(d) { return d.key; }).sortKeys(function(a,b) { return listKey.indexOf(a) - listKey.indexOf(b); })
				.entries(dataNVD3)
				.map(function(k){
					return {"key": k.key, "values": k.values.map(function(v){return [v.x,v.y]})}
				});
				
	// need values for all dates for all keys
	dataNVD3 = assignDefaultValues(dateKey, dataNVD3, 0);
	
    var colors = d3.scale.category20();
	
	// Set the margins of the object
	var margin = {top: 20, right: 10, bottom: 50, left: 50},
		width = width - margin.left - margin.right,
		height = height - margin.top - margin.bottom;
	
	// Create the svg element	
	var svg = d3.select("#"+id)
		.append("svg:svg");
			// .attr("width", width)
			// .attr("height", height);
		
	
    var chart;
	
	nv.addGraph(function() {
		chart = nv.models.stackedAreaChart()
                  .margin({right: 40})
                  .x(function(d) { return d[0] })   //We can modify the data accessor functions...
                  .y(function(d) { return d[1] })   //...in case your data is formatted differently.
                  .useInteractiveGuideline(showInteractiveGuideline)    //Tooltips which show all data points. Very nice!
                  .rightAlignYAxis(false)      //Let's move the y-axis to the right side.
                  .duration(100)
                  .showControls(showControls)       //Allow user to choose 'Stacked', 'Stream', 'Expanded' mode.
                  .clipEdge(true)
				  //.pointActive(function(d) { return d.notActive })
				  .interpolate('cardinal-open')
				  .style(chartType)
				  .showLegend(showLegend)
				  .color(colorSchema);

        chart.xAxis.tickFormat(function(d) { return d3.time.format('%x')(new Date(d)) });
        chart.yAxis.tickFormat(d3.format(',.2f'));

        chart.legend.vers('furious');

		var selfNew = self;
		
        d3.select('#'+id+' svg')
            .datum(dataNVD3)
            .transition().duration(0)
            .call(chart)
            .each('start', function() {
                setTimeout(function() {
                    d3.selectAll('#'+id+' svg *').each(function() {
                        if(this.__transition__)
                            this.__transition__.duration = 1;
                    })
                }, 0)
            });

        //nv.utils.windowResize(chart.update);
        return chart;
    });
		  
}


function MakeQSSelection(keyfield) {

console.log(self);

}


function dateFromQlikNumber(n) {
	var d = new Date((n - 25569)*86400*1000);
	// since date was created in UTC shift it to the local timezone
	d.setTime( d.getTime() + d.getTimezoneOffset()*60*1000 );
	return d;
}

function convertToUnixTime(_qNum) {
	console.log(_qNum);
	return dateFromQlikNumber(_qNum).getTime();
}

function findDate(_date, _arr, _offset) {
	for (var i = _offset, len = _arr.length; i < len; i++) {
		if (_arr[i][0] === _date) return i;
	}
	return -1;
}

function assignDefaultValues(dates, dataset, defaultValue) {
	var newData = [],
		sortDates = function(a,b){ return a > b ? 1 : -1; },
		sortValues = function(a,b){ return a[0] > b[0] ? 1 : -1; },
		i = -1;
		
	dates.sort(sortDates);
	$.each(dataset, function(index1, setObject){
		var newValues = [],
			lastPos = 0,
			i = -1;
		setObject.values.sort(sortValues);
		$.each(dates, function(index2, theDate){
			i = findDate(theDate, setObject.values, lastPos)
			if (i === -1) {
				newValues.push([theDate,defaultValue]);
			} else {
				newValues.push([theDate,setObject.values[i][1]]);
				lastPos = i;
			}
		});
		newData.push( { key: setObject.key, seriesIndex: setObject.seriesIndex, values: newValues });
	});
	return newData;
}
