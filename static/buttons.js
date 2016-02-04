function build_buttons(data){
	// holds data needed for dynamically adding buttons for each weapon
	var button_data = {};
	for (x=0; x < data.length; x++){
		if(button_data[data[x].result.weapon_type]){
			if (data[x].result.kde[data[x].result.kde.length - most_recent] < red_cutoff){
				button_data[data[x].result.weapon_type]["red"] += 1;
			} else if(data[x].result.kde[data[x].result.kde.length - most_recent] < yellow_cutoff){
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

	//Add buttons for weapon types
	//----------------------
	document.getElementById("buttons").innerHTML += '\
	<div class="list-group">\
		<button class="list-group-item active" style="margin-left: 10px; font-size: 14pt; margin-bottom: -15px; \
			background-color: #222; color: #white; border-color: #080808; margin-top: 25px; width: 200px; curser: default;">\
	    	Alarm Thresholds\
	  	</button>\
		<div style="width: 220px; margin-left: 13px; margin-top: 15px; margin-bottom: 10px;  display: inline-block; float: left;">\
	        <input type="text" class="form-control" id="red_alarm" placeholder="' + red_cutoff + '" style="width: 60px; display: inline-block; float: left; border-color: red; border-width: 3px; opacity: .7;">' 
	        + '<input type="text" class="form-control" id="yellow_alarm" placeholder="' + yellow_cutoff + '" style="width: 60px; display: inline-block; float: left;  border-color: yellow; opacity: .7; border-width: 3px; ">'
		    + '<button class="btn btn-default" id="update_thresholds" style="display: inline-block; float: left; width: 80px;"type="button">Update</button>\
	    </div><!-- /input-group -->\
		<br><button class="list-group-item active" style="margin-left: 10px; width: 200px; font-size: 14pt; margin-bottom: -15px; \
			background-color: #222; color: #white; border-color: #080808; margin-top: 25px; curser: default;">\
	    	Weapon Types\
	  	</button>'
	for (j=0; j < Object.keys(button_data).length; j++){
		document.getElementById("buttons").innerHTML += '\
            <button style="padding: 4px; margin-left: 10px;  margin-bottom: 3.5px; font-size: 12pt; width: 200px;"\
             type="button" class="list-group-item" id="' + Object.keys(button_data)[j] + 
             '_button"><span class="badge" style="background-color: red; opacity: .7;" id="' 
             + Object.keys(button_data)[j] + '_span1">' + button_data[Object.keys(button_data)[j]].red + '</span>\
            <span class="badge" style="background-color: yellow; color: black; opacity: 1;" id="' + Object.keys(button_data)[j] + 
            '_span2">' + button_data[Object.keys(button_data)[j]].yellow + '</span>'
            // <span class="badge" style="background-color: green; margin-left: 8px;" id="' + Object.keys(button_data)[j] + '_span3">' 
            // 	+ button_data[Object.keys(button_data)[j]].green + '</span>'
        	+ Object.keys(button_data)[j] + '</button>';

	    //update data/circles when button clicked
	    $(document).on("click", "#" + Object.keys(button_data)[j] + "_button", function(e){
	    	map(data, e.toElement.id.split("_")[0]);
	    	current_weapon = e.toElement.id.split("_")[0];
	    })
	}
	document.getElementById("buttons").innerHTML +=	'</div>';	

	//Redraw with new alarms
	//----------------------
	$("#update_thresholds").on("click", function(){
		var all_good = true;
		if($("#red_alarm")[0].value < .25){
			red_cutoff = $("#red_alarm")[0].value;
		} else{
			all_good = false;
			alert("Red AlarmValue too high");
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
}

