
function map(kde_data, weapon_type){

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
		.scale(150)
		.translate([width / 2, height / 1.5]);

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
		.attr("height", height)
		.on("click", country_clicked);

	var g = svg.append("g");

	d3.json("/static/geo/countries.topo.json", function(error, us) {
	  	g.append("g")
			.attr("id", "countries")
			.selectAll("path")
			.data(topojson.feature(us, us.objects.countries).features)
			.enter()
			.append("path")
			.attr("id", function(d) { return d.id; })
			.attr("d", path)
			.on("click", country_clicked);
	

		// Define the div for the tooltip
		var tooltip = d3.select("#map").append("div")	
		    .attr("class", "tooltip")
		    .attr("id", "tooltip")				
		    .style("opacity", 0);

		var circles = svg.selectAll("circles")
			.data(kde_data)

		var circlesEnter = circles.enter()
			.append("g");

		// add circles
		var circle = circlesEnter.append("circle")
			.filter(function(d){
				return d.result.weapon_type == weapon_type;
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
				// console.log(d.result.cnt);
				sum = 0
				for (cnt in d.result.cnt){
					sum += d.result.cnt[cnt];
				}
				var radius = Math.log(sum / d.result.cnt.length);
				if(radius < 0){radius = .3};
	            return radius;
	        })
	        .style("fill", function(d){
	        	if(d.result.kde[d.result.kde.length - 2] <= red_cutoff){
	        		return "red";
	        	}else if(d.result.kde[d.result.kde.length - 2] <= yellow_cutoff && 
	        		d.result.kde[d.result.kde.length - 2] > red_cutoff){
	        		return "yellow";
	        	}else{
	        		return "green";
	        	}
	        })
	        .style("fill-opacity", .7)
	        .style("cursor", "pointer")

	        // call kde and time series chart functions to be appended to tooltip
			.on("mouseover", function(d) {
				console.log(d.result.day[d.result.day.length - most_recent])
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
	                .style("height", "500px")

	                //call functions to draw charts (in kde.js and time-series.js)
	                kde_plot(d.result.kde, d.result.cnt, d.result.location, d.result.weapon_type, d.result.day);
	                ts_plot(d.result.cnt, d.result.day);
	        })					
	        .on("mouseout", function(d) {		
	            tooltip.transition()		
	                .duration(500)		
	                .style("opacity", 0);	
			})
			.on("click", circle_clicked)
			.each(pulse);
					
			//add labels and make invisible initially, add tooltip hover to text as well
			var text = circlesEnter.append("text")
				.filter(function(d){
					return d.result.weapon_type == weapon_type;
				})
				.text(function(d){
						return d.result.location;
					})
			    .attr("x", function(d){
					return projection([d.result.lon,d.result.lat])[0];
				})
				.attr("y", function(d){
					return projection([d.result.lon,d.result.lat])[1];
				})
				.attr("class", "subunit-label")
				.on("mouseover", function(d) {	
		            tooltip.transition()		
		                .duration(200)		
		                .style("opacity", .8);
		            tooltip.html("Daily <b style='font-size: 13pt;'>" + d.result.weapon_type + "</b> ads in <b style='font-size: 13pt;'>" + d.result.location + "</b> between " + 
		            	d.result.day[0].split("T")[0] + " and " + d.result.day[d.result.day.length - 1].split("T")[0] + "<br><br>")
		                // .style("left", d3.select(this).attr("cx") + "px")
		                .style("left", m_width - 500 + "px")		
		                // .style("top", d3.select(this).attr("cy") + "px")
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
				})
				.on("click", circle_clicked);
		});	//end of d3.json data binding		
						
	//pulse red circles
	function pulse() {
		if (d3.select(this)[0][0].style.fill == "red"){
			var circle = d3.select(this);
			original_radius = circle[0][0].r.baseVal.value;
			(function repeat() {
			circle = circle.transition()
				.duration(1300)
				.attr("stroke-width", 20)
				.attr("r", 5)
				.transition()
				.duration(1300)
				.attr('stroke-width', 1)
				.attr("r", 10)
				.ease('sine')
				.each("end", repeat);
			})();
		}
	}		        
					

	// zoom and translate positions
	function zoom(xyz) {
		g.transition()
			.duration(750)
			.attr("transform", "translate(" + projection.translate() + ")scale(" + xyz[2] + ")translate(-" + xyz[0] + ",-" + xyz[1] + ")")
			.selectAll(["#countries", "#states", "#cities"])
			.style("stroke-width", 1.0 / xyz[2] + "px")
			.selectAll(".city")
			.attr("d", path.pointRadius(20.0 / xyz[2]));

		svg.selectAll("circle").transition()
			.duration(750)
			.attr("transform", "translate(" + projection.translate() + ")scale(" + xyz[2] + ")translate(-" + xyz[0] + ",-" + xyz[1] + ")")
	        .attr("cx", function(d) {
	            return projection([d.result.lon,d.result.lat])[0];
	        })
	        .attr("cy", function(d) {
	            return projection([d.result.lon,d.result.lat])[1];
	        });
	
		svg.selectAll(".subunit-label").transition()
			// .data(kde_data)
			.duration(750)
			// .attr("transform", "translate(" + projection.translate() + ")scale(" + xyz[2] + ")translate(-" + xyz[0] + ",-" + xyz[1] + ")")
			.attr("transform", function(d) { return "translate(" + projection.translate() + ")scale(" + xyz[2] + ")translate(-" + xyz[0] + ",-" + xyz[1] + ")"; })
			.style("fill-opacity", ".6")
			.style("fill", "white")
			.style("font-size", ".6pt");
	}


	function get_xyz(d) {
	  	var bounds = path.bounds(d);
	  	var w_scale = (bounds[1][0] - bounds[0][0]) / width;
	  	var h_scale = (bounds[1][1] - bounds[0][1]) / height;
	  	var z = .96 / Math.max(w_scale, h_scale);
	  	var x = (bounds[1][0] + bounds[0][0]) / 2;
	  	var y = (bounds[1][1] + bounds[0][1]) / 2 + (height / z / 6);
	  	return [x, y, z];
	}


	function circle_clicked(d) {
		var w_scale = 20 / width;
		var h_scale = 20 / height;
		var z = .96 / Math.max(w_scale, h_scale);
		var x = projection([d.result.lon,d.result.lat])[0];
		var y = projection([d.result.lon,d.result.lat])[1] + (height / z / 6);
		zoom([x,y,z]);
	}

	function country_clicked(d) {
	    g.selectAll(["#states", "#cities"]).remove();
	    state = null;

	    if (country) {
			g.selectAll("#" + country.id).style('display', null);
	    }

	    if (d && country !== d) {
			var xyz = get_xyz(d);
			country = d;

			if (d.id  == 'USA'){
				d3.json("/static/geo/states_usa.topo.json", function(error, us) {
				  g.append("g")
					.attr("id", "states")
					.selectAll("path")
				  .data(topojson.feature(us, us.objects.states_usa).features)
					.enter()
					.append("path")
					.attr("id", function(d) { return d.id; })
					.attr("class", "active")
					.attr("d", path)
					.on("click", state_clicked);

					zoom(xyz);
			  		g.selectAll("#" + d.id).style('display', 'none');
				});  
			} else{
		  		zoom(xyz);
			}
	  	} else {
			var xyz = [width / 2, height / 1.5, 1];
			country = null;
			zoom(xyz);
	  	}
	}

	function state_clicked(d) {
	  	g.selectAll("#cities").remove();

	  	if (d && state !== d) {
			var xyz = get_xyz(d);
			state = d;

			country_code = state.id.substring(0, 3).toLowerCase();
			state_name = state.properties.name;

			d3.json("/static/geo/cities.topo.json", function(error, us) {
			  g.append("g")
				.attr("id", "cities")
				.selectAll("path")
				.data(topojson.feature(us, us.objects.cities).features.filter(function(d) { return state_name == d.properties.state; }))
				.enter()
				.append("path")
				.attr("id", function(d) { return d.properties.name; })
				.attr("class", "city")
				.attr("d", path.pointRadius(20 / xyz[2]));

		  		zoom(xyz);
			});      
	  	} else {
			state = null;
			country_clicked(country);
	  	}
	}

	$(window).resize(function() {
	  	var w = $("#map").width();
	  	svg.attr("width", w);
	  	svg.attr("height", w * height / width);
	});
	
}

