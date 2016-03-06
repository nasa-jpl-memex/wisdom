var info_tooltip = d3.select("#map").append("div")	
		    .attr("class", "tooltip")			
		    .style("text-align", "left");

d3.select("#info")
	.on("mouseover", function(d) {
	    info_tooltip.transition()		
	        .duration(200)		
	        .style("opacity", 1);

	    //text at top of tooltip window
	    info_tooltip.html('\
	    	<div id="info_tooltip"> \
		    	<span> <b> Overview: </b><br> Using weapon types and locations extracted from crawled weapons ads, \
		    		daily ad counts are aggregated by location and weapon type and compared to a density estimate \
		    		derived from previous days\' ad counts. If the current day\'s ad total (density) is higher than the majority \
		    		of previously seen daily ad totals, it will be identified as anomalous by its color. Thresholds for \
		    		anomalies can be adjusted from this interface.\
	    		</span><br><br>\
	    		<b> Data: </b>\
		    	<ul>\
		    		<li> This prototype considers crawled data from 9-20-15 to 10-21-15 </li>\
		    		<li> The current view demonstrates what the tool would look like as of 10-21-15 </li>\
		    		<li> Not all weapon type and location combinations have been included  </li>\
		    		<li> The total number of weapons ads (summed over all days) required for a location to appear is ' + min_sum_of_counts +
		    		'<li> All alarm counts are worldwide</li>\
		    	</ul><br> \
		    	<b> Functionality: </b> \
		    	<ul>\
		    		<li> Click on a circle to view original ads in facetview </li>\
		    		<li> A worldwide view is available by zooming out (via scrolling) </li>\
		    		<li> Alarm thresholds specificy the maximum density estimate for a data point to be considered anomalous (yellow or red)  </li>\
		    		<br>\
		    	</ul>\
		    </div>')
	        // .style("left", d3.select(this).attr("cx") + "px")
	        .style("left", $("#map").width() - 500 + "px")
	        .style("margin-left", "12px")		
	        // .style("top", d3.select(this).attr("cy") + "px")
	        .style("top", 0 + "px")
	        .style("width", "500px")
	        .style("height", "400px")
	})					
	.on("mouseout", function(d) {		
	    info_tooltip.transition()		
	        .duration(500)		
	        .style("opacity", 0);	
	});
