
function kde_plot(estimates, counts, location, weapon_type, days){

    var margin = {top: 20, right: 30, bottom: 35, left: 50},
        width = 480 - margin.left - margin.right,
        height = 220 - margin.top - margin.bottom;


    var x = d3.scale.linear()
        .domain([Math.min.apply(null,counts), Math.max.apply(null,counts)])
        .range([0, width]);

    var y = d3.scale.linear()
        .domain([0, .4])
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickFormat(d3.format("%"));

    var line = d3.svg.line()
        .x(function(d) {return x(d[0]); })
        .y(function(d) { return y(d[1]); })

    var histogram = d3.layout.histogram()
        .frequency(false)
        .bins(x.ticks(40));

    var svg = d3.select("#tooltip")
        .style("opacity", ".8")
      .append("svg")
        .attr("id", "tooltip_chart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
      .append("text")
        .attr("class", "label")
        .attr("x", width/2)
        .attr("y", 30)
        .style("text-anchor", "middle")
        .text("Daily Ads Crawled");

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("class", "label")
        .attr("x", -100)
        .attr("y", -45)
        .attr("dy", ".35em")
        .attr("transform", "rotate(270)")
        .style("text-anchor", "middle")
        .text("Density");;

    svg.append("g")
        .append("text")
        .attr("class", "label")
        .attr("x", width/2 - 5)
        .attr("y", 0)
        .style("text-anchor", "middle")
        .style("font-weight", "bold")
        .style("font-size", "11pt")
        .text("Density Estimation");

    var hist_data = histogram(counts);

    sorted_data = []
    for (j in estimates){
       sorted_data.push([estimates[j], counts[j]])
    }
    sorted_data = sorted_data.sort(function(a,b){
        return a[1] < b[1] ? 1 : -1;
    });
  

    function lineData(x_counts){
        return x_counts.map(function(x,i){
              return [x[1], x[0]];
        })
    }

    var ld = lineData(sorted_data);

    svg.selectAll(".bar")
        .data(hist_data)
          .enter().insert("rect", ".axis")
              .attr("class", "bar")
              .attr("x", function(d) { return x(d.x) + 1; })
              .attr("y", function(d) { return y(d.y); })
              .attr("width", x(hist_data[0].dx + hist_data[0].x) - x(hist_data[0].x) - 1)
              .attr("height", function(d) { return height - y(d.y); });

    //kernel density line
    svg.append("path")
        .datum(ld)
        .attr("class", "line")
        .attr("d", line);

    // add line for most recent day of data
    svg.append("line")
       .attr("y1", y(0))
       .attr("y2", y(50))
       .attr("x1", (x(counts[counts.length - most_recent])))
       .attr("x2", (x(counts[counts.length - most_recent])))
       .style("opacity", .6)
       .attr( "stroke", function(){
            if (estimates[estimates.length - most_recent] <= red_cutoff && Math.max.apply(null, estimates) > .05){
                return "red";
            }else if(estimates[estimates.length - most_recent] < yellow_cutoff && estimates[estimates.length - most_recent] > red_cutoff
                && Math.max.apply(null, estimates) > .05){
                return "yellow";
            }else{
                return "green";
            }

            
       } )
       .attr( "stroke-width", "4" );

    svg.append("text")
        .attr("y", x(counts[counts.length - most_recent]-5))
        .attr("x", -50)
        .attr("dy", ".35em")
        .attr("transform", "rotate(270)")
        .style("text-anchor", "end")
        .text("Most Recent");

}

