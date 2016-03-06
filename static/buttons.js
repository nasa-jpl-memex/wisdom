function sortObject(o) {
    var sorted = {},
    key, a = [];

    for (key in o) {
        if (o.hasOwnProperty(key)) {
            a.push(key);
        }
    }

    a.sort();

    for (key = 0; key < a.length; key++) {
        sorted[a[key]] = o[a[key]];
    }
    return sorted;
}


function build_buttons(data){
	// holds data needed for dynamically adding buttons for each weapon
	var button_data = {};
	for (x=0; x < data.length; x++){
		if(button_data[data[x].result.weapon_type]){
			if (data[x].result.kde[data[x].result.kde.length - most_recent] < red_cutoff
				&& Math.max.apply(null, data[x].result.kde) > .05
				&& data[x].result.cnt.reduce(add, 0) > min_sum_of_counts){
					button_data[data[x].result.weapon_type]["red"] += 1;
			} else if(data[x].result.kde[data[x].result.kde.length - most_recent] < yellow_cutoff
				&& Math.max.apply(null, data[x].result.kde) > .05
				&& data[x].result.cnt.reduce(add, 0) > min_sum_of_counts){
					button_data[data[x].result.weapon_type]["yellow"] += 1;
			} else{
				button_data[data[x].result.weapon_type]["green"] += 1;
			}
		} else{
			// initialize
			button_data[data[x].result.weapon_type] = {};
			button_data[data[x].result.weapon_type]['red'] = 0;
			button_data[data[x].result.weapon_type]['yellow'] = 0;
			button_data[data[x].result.weapon_type]['green'] = 0;
		}
	}
	button_data = sortObject(button_data);

	//Add buttons for weapon types
	//----------------------
	document.getElementById("buttons").innerHTML += '\
	<div>\
		<span id="current_weapon"> Weapon Type: <b>' + current_weapon + '</b></span>\
	</div>\
	<div class="list-group">\
		<button class="list-group-item active">\
	    	Filters\
	  	</button>\
	  	<div>\
		    <button id="green_filter" class="btn btn-default" type="button">Green</button>\
		    <button id="yellow_filter" class="btn btn-default" type="button">Yellow</button>\
		    <button id="red_filter" class="btn btn-default" type="button">Red</button>\
	    </div><br>\
		<button class="list-group-item active">\
	    	Alarm Thresholds\
	  	</button>\
		<div>\
	        <input type="text" class="form-control" id="red_alarm" placeholder="' + red_cutoff + '">' 
	        + '<input type="text" class="form-control" id="yellow_alarm" placeholder="' + yellow_cutoff + '">'
		    + '<button class="btn btn-default" id="update_thresholds" type="button">Update</button>\
	    </div><!-- /input-group -->\
		<br><button class="list-group-item active">\
	    	Weapon Types\
	  	</button>\
	  	<div id="button_scroll" class="list-group">'
	for (j=0; j < Object.keys(button_data).length; j++){
		document.getElementById("button_scroll").innerHTML += '\
            <button type="button" class="list-group-item" id="' + Object.keys(button_data)[j] + 
             '_button"><span class="badge" style="background-color: red; opacity: .7;" id="' 
             + Object.keys(button_data)[j] + '_span1">' + button_data[Object.keys(button_data)[j]].red + '</span>\
            <span class="badge" style="background-color: yellow; color: black; opacity: 1;" id="' + Object.keys(button_data)[j] + 
            '_span2">' + button_data[Object.keys(button_data)[j]].yellow + '</span>'
        	+ Object.keys(button_data)[j] + '</button>';
	        
	    //update data/circles when button clicked
	    $(document).on("click", "#" + Object.keys(button_data)[j] + "_button", function(e){
	    	map(data, e.currentTarget.id.split("_")[0]);
	    	current_weapon = e.currentTarget.id.split("_")[0];
	    	document.getElementById("current_weapon").innerHTML = "Weapon Type: <b>" + current_weapon + "</b>";
	    })
	}
	document.getElementById("buttons").innerHTML +=	'</div></div>';	

	//Redraw with new alarms
	//----------------------
	$("#update_thresholds").on("click", function(){
		var all_good = true;
		if($("#red_alarm")[0].value < .25){
			red_cutoff = $("#red_alarm")[0].value;
		} else{
			all_good = false;
			alert("Red Alarm value too high");
		}
		if($("#yellow_alarm")[0].value < .50){
			yelllow_cutoff = $("#yellow_alarm")[0].value;
		} else{
			all_good = false;;
			alert("Yellow alarm value too high");
		}
		if(all_good){
			if($("#red_alarm")[0].value != "" && $("#yellow_alarm")[0].value != ""){
				map(msg, current_weapon);
			}
			else{
				alert("One or more values not filled in");
			}
		} 
	})
	//Filter circles
	//----------------------
	function toggle_display(color){
		// console.log($("." + color + "_circle").css("pointer-events"))
		if($("." + color + "_circle").css("display") == "inline"){
			$("." + color + "_circle").css("display", "none");
			$("." + color + "_circle").css("pointer-events", "none");
			$(".subunit-label-" + color).css("pointer-events", "none");
			$(".subunit-label-" + color).css("opacity", "0");
		}
		else if($("." + color +  "_circle").css("display") == "none"){
			$("." + color + "_circle").css("display", "inline");
			$("." + color + "_circle").css("pointer-events", "auto");
			$(".subunit-label-" + color).css("pointer-events", "auto");
			$(".subunit-label-" + color).css("opacity", "0.6");
		}
	}

	$("#red_filter, #yellow_filter, #green_filter").on("click", function(id){
		toggle_display(id.toElement.id.split("_")[0]);
	});


}

