
function ts_plot(counts, raw_days){

    // convert date format
    days = [];
    for (d in raw_days){
        days.push(new Date(raw_days[d]));
    }

    var margin = {top: 10, right: 30, bottom: 50, left: 50},
        width = 480 - margin.left - margin.right,
        height = 220 - margin.top - margin.bottom;

    var x = d3.time.scale()
        .domain([new Date(Math.min.apply(null,days)), new Date(Math.max.apply(null,days))])
        .range([0, width]);

    var y = d3.scale.linear()
        .domain([0, Math.max.apply(null,counts)])
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickFormat(d3.format(""));

    var line = d3.svg.line()
        .x(function(d) {return x(new Date(d[0])); })
        .y(function(d) { return y(d[1]); })

    var svg = d3.select("#tooltip").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
      .selectAll('text')
        .attr("dy", ".35em")
        .attr("transform", "rotate(90)")
        .attr("x", 9)
        .attr("y", 0)
        .style("text-anchor", "start")
      
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("class", "label")
        .attr("x", -90)
        .attr("y", -45)
        .attr("dy", ".35em")
        .attr("transform", "rotate(270)")
        .style("text-anchor", "middle")
        .text("Count of Crawled Ads");

    svg.append("g")
        .append("text")
        .attr("class", "label")
        .attr("x", width/2 - 5)
        .attr("y", 10)
        .style("text-anchor", "middle")
        .style("font-weight", "bold")
        .style("font-size", "11pt")
        .text("Trend");

    sorted_data = []
    for (j in days){
       sorted_data.push([days[j], counts[j]])
    }

    function lineData(x_counts){
        return x_counts.map(function(x,i){
            return [x[0], x[1]]
        })
    }

    var ld = lineData(sorted_data)

    svg.append("path")
        .datum(ld)
        .attr("class", "line")
        .attr("d", line);

    document.getElementById("tooltip").innerHTML += '<div style="y: 1000px; vertical-align: bottom; x: 250px; position: absolute;">\
        *Kernel density estimates have been artificially inflated for demo purposes</div>'
}

