define(["jquery", "./d3.min", "text!./nv.d3.min.css","./nv.d3.min","./senseUtils"], function($, cssContent) {'use strict';
	$("<style>").html(cssContent).appendTo("head");

	return {
		initialProperties: {
			qHyperCubeDef: {
				qDimensions: [],
				qMeasures: [],
				qInitialDataFetch: [{
					qWidth: 3,
					qHeight: 100
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
			}
		},
		snapshot: {
			canTakeSnapshot: true
		},
	
		
	
		paint: function ($element, layout) {
		
			// Call SenseUtils to page the data for > 10000 points
			senseUtils.pageExtensionData(this, $element, layout, drawStreamChart, self);
			
		}
	};
});

function drawStreamChart($element, layout, fullMatrix, self) {
			
			// get qMatrix data array
			//var qMatrix = layout.qHyperCube.qDataPages[0].qMatrix;
			//create matrix variable
			var qMatrix = fullMatrix;
			
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
			if (document.getElementById(id)) {
				// if it has been created, empty it's contents so we can redraw it
				$("#" + id).empty();
			}
			else {
				// if it hasn't been created, create it with the appropriate id and size
				$element.append($('<div />').attr({ "id": id, "class": "qv-object-qv-object-NVD3StackedArea" }).css({ height: height, width: width }))
			}
			
			viz(self, data, measureLabels, width, height, id, selections, layout, $element);
	
}
			
var viz = function (self, data, labels, width, height, id, selections, layout, $element) {

		
	var json = getJSONtoHyperCube(layout, data, labels, selections);

    var colors = d3.scale.category20();

	//var JSONarray = JSON.stringify(histcatexplong);
	//var JSONarray2 = JSON.stringify(json);
	
	
	//console.log(histcatexplong);
	//console.log(json);
	
	
	// Chart object width  
   var width = $element.width();  
   // Chart object height  
   var height = $element.height();  
   // Chart object id  
   var id = "container_" + layout.qInfo.qId;  
   // Check to see if the chart element has already been created  
   if (document.getElementById(id)) {  
		// if it has been created, empty its contents so we can redraw it  
		 $("#" + id).empty();  
   }  
   else {
		// if it hasn't been created, create it with the appropriate id and size
		$element.append($('<div />').attr({ "id": id, "class": "qv-object-NVD3StackedArea" }).css({ height: height, width: width }))
	}
   
   //var svg = d3.select("#" + id).append("svg")  
	//	.attr("width", width)  
	//	.attr("height", height);
	
	// Set the margins of the object
	var margin = {top: 20, right: 10, bottom: 50, left: 50},
		width = width - margin.left - margin.right,
		height = height - margin.top - margin.bottom;
	
	// Create the svg element	
	var svg = d3.select("#"+id)
		.append("svg:svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom);
		
	
    var chart;
	var colorrange = ["#deebf7", "#c6dbef", "#9ecae1", "#6baed6", "#4292c6", "#2171b5", "#08519c", "#08306b"];

	nv.addGraph(function() {
		chart = nv.models.stackedAreaChart()
                  //.margin({right: 100})
                  .x(function(d) { return d[0] })   //We can modify the data accessor functions...
                  .y(function(d) { return d[1] })   //...in case your data is formatted differently.
                  .useInteractiveGuideline(true)    //Tooltips which show all data points. Very nice!
                  .rightAlignYAxis(false)      //Let's move the y-axis to the right side.
                  .duration(100)
                  .showControls(false)       //Allow user to choose 'Stacked', 'Stream', 'Expanded' mode.
                  .clipEdge(true)
				  .pointActive(function(d) { return d.notActive })
				  .interpolate('cardinal-open')
				  .style('stream')
				  .showLegend(false)
				  .color(colorrange);

        chart.xAxis.tickFormat(function(d) { return d3.time.format('%x')(new Date(d)) });
        chart.yAxis.tickFormat(d3.format(',.2f'));

        chart.legend.vers('furious');

		var selfNew = self;
		
        d3.select('#'+id+' svg')
            .datum(json)
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

        nv.utils.windowResize(chart.update);
        return chart;
    });

		  
		  
}



function getJSONtoHyperCube(layout, data2, labels, selections) {

	//console.log(data2);

	// get qMatrix data array
	//var qMatrix = layout.qHyperCube.qDataPages[0].qMatrix;
	var qMatrix = data2;

	//console.log(qMatrix);
	
	// create a new array that contains the measure labels
	var dimensions = layout.qHyperCube.qDimensionInfo;			
	var LegendTitle = dimensions[0].qFallbackTitle;			
	
	// create a new array that contains the dimensions and metric values
	// depending on whether if 1 or 2 dimensions are being used
	if(dimensions.length==2){			 
		var dim1Labels = qMatrix.map(function(d) {
			 return d[0].qText;
		 });
		 var dim1Id = qMatrix.map(function(d) {
			 return d[0].qElemNumber;
		 });
		 var dim2Labels = qMatrix.map(function(d) {
			 return d[1].qNum;
		 });
		 var dim2Id = qMatrix.map(function(d) {
			 return d[1].qElemNumber;
		 });
		 var metric1Values = qMatrix.map(function(d) {
				 return d[2].qNum;
		 }) ;	 
	}
	else{				
		var dim1Labels = qMatrix.map(function(d) {
			 return d[0].qText;
		 });				 
		 var dim1Id = qMatrix.map(function(d) {
			 return d[0].qElemNumber;
		 });
		 var dim2Labels = dim1Labels;
		 var dim2Id = dim1Id;
		 var metric1Values = qMatrix.map(function(d) {
			 return d[1].qNum;
		 });				 		 
	} 
	
	// create a JSON array that contains dimensions and metric values
	var data = [];
	var actClassName = "";
	var myJson = {};
	myJson.dim_id = ""; 
	myJson.dim = ""; 
	myJson.values = [];
	var cont = 0;
	var contdata = 0;
	var LegendValues = [];								
	if(dimensions.length==2){
		for(var k=0;k<dim1Labels.length;k++){				
			if(actClassName!=dim1Labels[k] ){
				if(cont!=0){
					data[contdata] = myJson;
					contdata++;				
				}
				// it is a different grouping value of Dim1
				LegendValues.push(dim1Labels[k]);
				var myJson = {};
				myJson.key = "";
				myJson.values = [];							
				cont = 0;
				myJson.key = dim1Labels[k];	
					// Make sure radar_area_name is added for usage in the radar chart layers later
					myJson.values[cont]  = [dim2Labels[k], metric1Values[k]];
					cont++;		
					// Make sure radar_area_name is added for usage in the radar chart layers later
			}else{						
					myJson.values[cont]  = [dim2Labels[k], metric1Values[k]];
					cont++;
			}												
			actClassName =  dim1Labels[k];						
		}
		data[contdata] = myJson;			
	}else{
		for(var k=0;k<dim1Labels.length;k++){									
			// it is a different grouping value of Dim1
			LegendValues.push(dim1Labels[k]);	
					// Make sure radar_area_name is added for usage in the radar chart layers later
					myJson.values[cont]  = [dim2Labels[k], metric1Values[k]];
					cont++;
		}	
		data[contdata] = myJson;
	}
	
	//console.log('data = ', data);
	return data;
	
	
}

function MakeQSSelection(keyfield) {

console.log(self);


}
