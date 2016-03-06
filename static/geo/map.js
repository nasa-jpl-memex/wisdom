function add(a, b) {
    return a + b;
}

function map(kde_data, weapon_type){
	console.log(kde_data)
	console.log(weapon_type)

	//clear when updating weapon type
	d3.select("#main").remove();
	d3.select("#tooltip").remove();

	//replaceAll for converting locations into proper format for html id's
	String.prototype.replaceAll = function(search, replace){
	    if (replace === undefined) {
	        return this.toString();
	    }
	    return this.replace(new RegExp('[' + search + ']', 'g'), replace);
	};

	var m_width = $("#map").width(),
		width = 938,
		height = 500,
		country,
		state;

	var projection = d3.geo.mercator()
		.scale(600)
		.center([0,36])
		.rotate([-260,0]);

	var scale0 = (width - 1) / 2 / Math.PI;

	var zoom = d3.behavior.zoom()
	    .on("zoom", zoomed);

	var path = d3.geo.path()
		.projection(projection);

	var svg = d3.select("#map").append("svg")
		.attr("preserveAspectRatio", "xMidYMid")
		.attr("id", "main")
		.attr("viewBox", "0 0 " + width + " " + height)
		.attr("width", m_width)
		.attr("height", m_width * height / width);

	svg.append("rect")
		.attr("class", "background")
		.attr("width", width)
		.attr("height", height);

	var g = svg.append("g");

	svg.call(zoom);	

	d3.json("/static/geo/states_usa.topo.json", function(error, us) {
        g.append("g")
          .attr("id", "states")
          .selectAll("path")
          .data(topojson.feature(us, us.objects.states_usa).features)
          .enter()
          .append("path")
          .attr("id", function(d) { return d.id; })
          .style("stroke", "#bbb")
          .style("stroke-linejoin", "round")
          .attr("d", path);
      });

	d3.json("/static/geo/countries.topo.json", function(error, us) {
	  	g.append("g")
			.attr("id", "countries")
			.selectAll("path")
			.data(topojson.feature(us, us.objects.countries).features)
			.enter()
			.append("path")
			// .filter(function(d){
			// 	return d.id != "USA"; //fill in US with states (below)
			// })
			.attr("id", function(d) { return d.id; })
			.attr("d", path);

		// Define the div for the tooltip
		var tooltip = d3.select("#map").append("div")	
		    .attr("class", "tooltip")
		    .attr("id", "tooltip")				
		    .style("opacity", 0);

		var circles = g.selectAll("circle")
			.data(kde_data)

		var circlesEnter = circles.enter()
			.append("g");

		// add circles
		var circle = circlesEnter.append("circle")
			.filter(function(d){
				return d.result.weapon_type == weapon_type && 
					d.result.cnt.reduce(add, 0) > min_sum_of_counts;
			})
			.attr("id",function(d){
				return d.result.location.replaceAll(" ", "-");
			})
			.attr("cx", function(d){
				return projection([d.result.lon,d.result.lat])[0];
			})
			.attr("cy", function(d){
				key = Object.keys(d)[0]
				return projection([d.result.lon,d.result.lat])[1];
			})
			.attr("r", function(d) {
				sum = 0
				for (cnt in d.result.cnt){
					sum += d.result.cnt[cnt];
				}
				var logmax = Math.log(Math.max.apply(null, d.result.cnt))
				var radius = Math.log(sum / d.result.cnt.length);
				if(radius < .2){radius = .2};
	            return radius;
	        })
	        .attr("class", function(d){
	        	if(d.result.kde[d.result.kde.length - 2] <= red_cutoff && Math.max.apply(null, d.result.kde) > .05){
	        		return "red_circle";
	        	}else if(d.result.kde[d.result.kde.length - 2] <= yellow_cutoff && 
	        		d.result.kde[d.result.kde.length - 2] > red_cutoff && Math.max.apply(null, d.result.kde) > .05){
	        		return "yellow_circle";
	        	}else{
	        		return "green_circle";
	        	}
	        })
	        .style("fill", function(d){
	        	if(d.result.kde[d.result.kde.length - 2] <= red_cutoff && Math.max.apply(null, d.result.kde) > .05){
	        		return "red";
	        	}else if(d.result.kde[d.result.kde.length - 2] <= yellow_cutoff && 
	        		d.result.kde[d.result.kde.length - 2] > red_cutoff && Math.max.apply(null, d.result.kde) > .05){
	        		return "yellow";
	        	}else{
	        		return "green";
	        	}
	        })
	        .style("fill-opacity", .7)
	        .style("display", "normal")
	        .style("cursor", "pointer")

	        // Link to facetview to see original ads
	        .on("click", function(d){
	        	window.open('https://weapons.memexproxy.com/facet_space/?source={"query":{"bool":{"must":[{"term":{"itemOffered.keywords":"' + d.result.weapon_type + '"}},{"term":{"tika_location.geo_name":"' + d.result.location + '"}}]}},"sort":[{"dateCreated":{"order":"desc"}}]}')
	        })

	        // call kde and time series chart functions to be appended to tooltip
			.on("mouseover", function(d) {
	            tooltip.transition()		
	                .duration(200)		
	                .style("opacity", .8);

	            //text at top of tooltip window
	            tooltip.html("Daily <b style='font-size: 13pt;'>" + d.result.weapon_type + "</b> ads in <b style='font-size: 13pt;'>" + d.result.location + "</b> between " + 
	            	d.result.day[0].split("T")[0] + " and " + d.result.day[d.result.day.length - most_recent].split("T")[0] + "<br><br>")
	                // .style("left", d3.select(this).attr("cx") + "px")
	                .style("left", m_width - 500 + "px")		
	                // .style("top", d3.select(this).attr("cy") + "px")
	                .style("top", 0 + "px")
	                .style("width", "500px")
	                .style("height", "540px")

	                //call functions to draw charts (in kde.js and time-series.js)
	                kde_plot(d.result.kde, d.result.cnt, d.result.location, d.result.weapon_type, d.result.day);
	                ts_plot(d.result.cnt, d.result.day);
	        })					
	        .on("mouseout", function(d) {		
	            tooltip.transition()		
	                .duration(500)		
	                .style("opacity", 0);	
			});
					
			//add labels and make invisible initially, add tooltip hover to text as well
			var text = circlesEnter.append("text")
				.filter(function(d){
					return d.result.weapon_type == weapon_type && d.result.cnt.reduce(add, 0) > min_sum_of_counts;
				})
				.text(function(d){
						return d.result.location;
					})
			    .attr("cx", function(d){
					return projection([d.result.lon,d.result.lat])[0];
				})
				.attr("cy", function(d){
					return projection([d.result.lon,d.result.lat])[1];
				})
				.attr("class", function(d){
		        	if(d.result.kde[d.result.kde.length - 2] <= red_cutoff){
		        		return "subunit-label-red";
		        	}else if(d.result.kde[d.result.kde.length - 2] <= yellow_cutoff && 
		        		d.result.kde[d.result.kde.length - 2] > red_cutoff){
		        		return "subunit-label-yellow";
		        	}else{
		        		return "subunit-label-green";
		        	}
		        })
				.on("mouseover", function(d) {	
		            tooltip.transition()		
		                .duration(200)		
		                .style("opacity", .8);
		            tooltip.html("Daily <b style='font-size: 13pt;'>" + d.result.weapon_type + "</b> ads in <b style='font-size: 13pt;'>" + d.result.location + "</b> between " + 
		            	d.result.day[0].split("T")[0] + " and " + d.result.day[d.result.day.length - 1].split("T")[0] + "<br><br>")
		                .style("left", m_width - 500 + "px")		
		                .style("top", 0 + "px")
		                .style("width", "500px")
		                .style("height", "500px")
		                
		                kde_plot(d.result.kde, d.result.cnt, d.result.location, d.result.weapon_type, d.result.day);
		                ts_plot(d.result.cnt, d.result.day);     
	        	})					
		        .on("mouseout", function(d) {		
		            tooltip.transition()		
		                .duration(500)		
		                .style("opacity", 0);	
				});

				d3.select("#USA").style("display", "None");
				
		});	//end of d3.json data binding	

	function draw_states(){
		
	}
	

	function zoomed() {

		g.attr("transform","translate("+ 
            d3.event.translate.join(",")+")scale("+d3.event.scale+")");

		svg.selectAll("circle")
			.attr("d", path.projection(projection));

	    g.selectAll("path")  
            .attr("d", path.projection(projection)); 
	}
						
	//pulse red circles
	// function pulse() {
	// 	if (d3.select(this)[0][0].style.fill == "red"){
	// 		var circle = d3.select(this);
	// 		original_radius = circle[0][0].r.baseVal.value;
	// 		(function repeat() {
	// 		circle = circle.transition()
	// 			.duration(1300)
	// 			.attr("stroke-width", 20)
	// 			.attr("r", 5)
	// 			.transition()
	// 			.duration(1300)
	// 			.attr('stroke-width', 1)
	// 			.attr("r", 10)
	// 			.ease('sine')
	// 			.each("end", repeat);
	// 		})();
	// 	}
	// }		        
	
}

