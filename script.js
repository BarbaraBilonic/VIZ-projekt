

var colors=d3.scale.linear().domain([500000,90000000]).range([ "#dddcef","#111023"])
		var year=9;
		let country_data;
		fetch("country_data.json")
		.then(response=>{return response.json();})
		.then(data=>dataReady(data));
		var chart;
		var years=[2010,2011,2012,2013,2014,2015,2016,2017,2018,2019];
		let map_data;
		var countries;	
		var barchart;
	    var mapWidth = 600;
	    var mapHeight = 650;
		var popGraphWidth=500;
		var popGraphHeight=400;
		var barPadding=10;
		var barWidth=popGraphWidth/10-barPadding;
		var pieChartWidth=600;
		var pieChartHeight=500;
		var pieChartMargin=30;
		var radius=120;
		var arc=d3.svg.arc()
			.innerRadius(80)
			.outerRadius(radius)
	    var projection = d3.geo.mercator()
	    .center([5, 55])
	    .scale(550)
       .translate([mapWidth / 2, mapHeight / 2]);

	    var path = d3.geo.path()
	    .projection(projection);

	    var svg = d3.select("#map").append("svg")
	    .attr("width", mapWidth)
	    .attr("height", mapHeight)
	    .style("background", "white");

		var popGraphSvg= d3.select("#population")
		.append("svg")
		.attr("width", popGraphWidth + 200)
		.attr("height", popGraphHeight + 200)
		.style("background-color", "white")
		.append("g")
		.attr("transform", "translate(" + 100 + "," + 100 +")");

		var pieSvg=d3.select("#pie")
			.append("svg")
			.attr("width",pieChartWidth)
			.attr("height",pieChartHeight)
			.append("g")
			.attr("transform","translate("+pieChartWidth/2+","+pieChartHeight/2+")")
		
		
			
		var xScalepopGraph=d3.scale.ordinal()
							.domain([2010,2011,2012,2013,2014,2015,2016,2017,2018,2019])
							.rangeRoundBands([0,popGraphWidth],.5);
		
		var barchartDiv=d3.select("#population").append("div")
						.attr("class","tootlip")
						.style("opacity",0);
		var pieDiv=d3.select("#pie").append("div")
						.attr("class","tootlip")
						.style("opacity",0); 	
		var mapDiv=d3.select("#map").append("div")
						.attr("class","tootlip")
						.style("opacity",0); 
		createLegend()
						  
			
 
	function dataReady(data){
		country_data=data;
		createMap();
							
						}
  

	function createMap(){
	    d3.json("eu.json", function(eu) {
	     countries = svg.selectAll("path.country")
	    .data(eu.features)
	    .enter()
	    .append("path")
	    .attr("class", "country")
	    .attr("id", function(d) { return d.id; })
	    .attr("d", path) 
		.style("fill", function(d){return getColor(d.properties.adm0_a3,9);})
	    .style("stroke", "gray")
	    .style("stroke-width", 1)
	    .style("stroke-opacity", function(d){;return getOpacity(d.properties.adm0_a3);})
		.on("mouseover", function(d){
			
			if(getCountryData(d.properties.adm0_a3)!=null){
			d3.select(this).style("fill","#eeffc4");
			d3.select(this).transition()
				.duration(50)
				.attr("opacity",.85);
			mapDiv.transition()
				.duration(50)
				.style("opacity",1);
			var country=getCountryData(d.properties.adm0_a3);
			let num=country.country_name+"\n"+"Population: "+country.population[year];
				mapDiv.html(num)
				.style("left", (d3.event.pageX + 10) + "px")
				.style("top", (d3.event.pageY - 15) + "px");
			}
			
		})
		.on("mouseout",function(d){
			if(getCountryData(d.properties.adm0_a3)!=null){
				d3.select(this).style("fill",function(d){return getColor(d.properties.adm0_a3,9)});
				d3.select(this).transition()
				.duration(50)
				.attr("opacity",1);
				mapDiv.transition()
				.duration(50)
				.style("opacity",0);
			}
		})
		.on("click",function(d){
			var country=getCountryData(d.properties.adm0_a3);
			if(country!=null){
				changeBarchart(country);
				updatePieChart(country.country_code,9)
			}
		});
		map_data=eu;
	    })
       createGraph("EUU");
	  createPieChart("EUU",9);
	}

	

	function changeBarchart(country){
		var yScalepopGraph=d3.scale.linear()
			.domain([(d3.min(country.population.map(function(d){return d;}))-50000),d3.max(country.population.map(function(d){return d;}))])
			.range([popGraphHeight,0]);
		
		var popGraphYAxis=d3.svg.axis()
						.scale(yScalepopGraph)
						.orient("left")
						.ticks(4);
		popGraphSvg.selectAll(".yaxis").call(popGraphYAxis)

		barchart
		.data(country.population)
		.attr("x",function(d,i){return xScalepopGraph(years[i]);})	
		.attr("y",300)
		.attr("height", 100);

		popGraphSvg.selectAll("rect")
				.transition()
				.duration(800)
				.attr("y", function(d){return yScalepopGraph(d);})
				.attr("height",function(d){return popGraphHeight-yScalepopGraph(d); })
				.delay(function(d,i){console.log(i) ; return(i*100)})
		
	}

	function changeMap(index){
		countries
			.data(map_data.features)
			.style("fill", function(d){return getColor(d.properties.adm0_a3,index);})
			.on("mouseout",function(d){
				if(getCountryData(d.properties.adm0_a3)!=null){
					d3.select(this).style("fill",function(d){return getColor(d.properties.adm0_a3,index)});
					d3.select(this).transition()
					.duration(50)
					.attr("opacity",1);
					mapDiv.transition()
					.duration(50)
					.style("opacity",0);
					}
			});
		
	}
	function createGraph(countryCode){
		var country=getCountryData(countryCode);

		var yScalepopGraph=d3.scale.linear()
			.domain([(d3.min(country.population.map(function(d){return d;}))-50000),d3.max(country.population.map(function(d){return d;}))])
			.range([popGraphHeight,0]);

		var popGraphXAxis=d3.svg.axis()
					.scale(xScalepopGraph)
					.orient("bottom");

		var popGraphYAxis=d3.svg.axis()
						.scale(yScalepopGraph)
						.orient("left")
						.ticks(4);

		popGraphSvg.append("g")
			.attr("class","xaxis")
			.attr("transform","translate(0,"+popGraphHeight+")")
			.call(popGraphXAxis)
			.selectAll("text")
			.style("text-anchor", "middle")
			
		popGraphSvg.append("g")
			.attr("class", "yaxis")
			.call(popGraphYAxis)
			.append("text")
			.style("text-anchor","end")
			.attr("x",0)
			.attr("y",0)
			.text("population")
			.attr("transform","rotate(-90)");
		
		 barchart = popGraphSvg.selectAll("rect")
			.data(country.population)
			.enter()
			.append("rect")
			.attr("x",function(d,i){return xScalepopGraph(years[i]);})	
			.attr("y",300)
			.attr("height", 100)
			.attr("width",barWidth)
			.attr("fill","#7bafc7")
			.on("mouseover", function(d,i){
				d3.select(this).attr("fill","#b8e1f5");
				d3.select(this).transition()
					.duration(50)
					.attr("opacity",0.85);
				barchartDiv.transition()
					.duration(50)
					.style("opacity",1);
				let num=d;
				barchartDiv.html(num)
					.style("left",(d3.event.pageX+10)+"px")
					.style("top",(d3.event.pageY-15)+"px")
			})
			.on("mouseout",function(d,i){
				d3.select(this).attr("fill","#7bafc7");
				d3.select(this).transition()
					.duration(50)
					.attr("opacity",1);
				barchartDiv.transition()
					.duration(50)
					.style("opacity",0);
			})
			.on("click",function(d,i){changeMap(i); updatePieChart(countryCode,i); year=i;});
		
			popGraphSvg.selectAll("rect")
				
				.transition()
				.duration(800)
				.attr("y", function(d){return yScalepopGraph(d);})
				.attr("height",function(d){return popGraphHeight-yScalepopGraph(d); })
				.delay(function(d,i){ return(i*100)})


		
		
	}
	function updatePieChart(countryCode,index){
			chart.remove();
			var country=getCountryData(countryCode);
			var pie=d3.layout.pie();
			var data=pie([country.urban_population[index],country.rural_population[index]]);
			chart=pieSvg.selectAll("path")
			.data(data)
			.enter()
			.append("path")
			
	chart
			.transition()
			.duration(1000)
			.attr("d",d3.svg.arc()
					.innerRadius(80)
					.outerRadius(radius)
				)
			.attr("fill", function(d,i){
				if(i===0) return "yellow";
				else return "green";
			});
	chart
			.on("mouseover",function(d,i){
				d3.select(this).transition()
					.duration(50)
					.attr("opacity",.85);
				pieDiv.transition()
					.duration(50)
					.style("opacity",1);
				let num=d.value+"%";
				pieDiv.html(num)
					.style("left", (d3.event.pageX + 10) + "px")
					.style("top", (d3.event.pageY - 15) + "px");

			})
			.on("mouseout",function(d){
				d3.select(this).transition()
					.duration(50)
					.attr("opacity",1);
				pieDiv.transition()
					.duration(50)
					.style("opacity",0);
			});
			
		
	}

	function createPieChart(countryCode,index){
		
		var country=getCountryData(countryCode);
		var pie=d3.layout.pie();
		var data=pie([country.urban_population[index],country.rural_population[index]]);
		chart=pieSvg.selectAll("path")
				.data(data)
				.enter()
				.append("path")
				
		chart
				.transition()
				.duration(1000)
				.attr("d",arc)
				.attr("fill", function(d,i){
					if(i===0) return "yellow";
					else return "green";
				})
	
		
		chart
			.on("mouseover",function(d,i){
				d3.select(this).transition()
					.duration(50)
					.attr("opacity",.85);
				pieDiv.transition()
					.duration(50)
					.style("opacity",1);
				let num=d.value+"%";
				pieDiv.html(num)
					.style("left", (d3.event.pageX + 10) + "px")
					.style("top", (d3.event.pageY - 15) + "px");

			})
			.on("mouseout",function(d){
				d3.select(this).transition()
					.duration(50)
					.attr("opacity",1);
				pieDiv.transition()
					.duration(50)
					.style("opacity",0);
			});		
	
		pieSvg.append("circle").attr("cx",150).attr("cy",0).attr("r", 6).style("fill", "yellow")
		pieSvg.append("circle").attr("cx",150).attr("cy",30).attr("r", 6).style("fill", "green")
		pieSvg.append("text").attr("x", 160).attr("y", 5).text("Urban population (%)").style("font-size", "15px").attr("alignment-baseline","middle")
		pieSvg.append("text").attr("x", 160).attr("y", 35).text("Rural population (%)").style("font-size", "15px").attr("alignment-baseline","middle")



	}

	
	
	function getOpacity(countryCode){
		let country=getCountryData(countryCode);
		if(country!=null){return 1;}
		else return 0;
	}

		function getColor(countryCode,index){
			let country=getCountryData(countryCode);
			if(country!=null){
				var color= colors(country.population[index]);
				return color;
			}
			else return "#edddd3";

		}

		function getCountryData(countryCode){
			
			let index=country_data.findIndex((country)=>country.country_code===countryCode)
			if(index >-1){ return country_data[index];}
			else	{return null;}
				
		}


function createLegend(){
	var legendWidth = 400;
	var legendHeight = 50;

	var legendSvg = d3.select("#legend")
						.append("svg")
						.attr("width", 500)
						.attr("height", legendHeight);
					
	var legend = legendSvg.append("defs")
						.append("svg:linearGradient")
						.attr("id", "gradient")
						.attr("x1", "0%")
						.attr("y1", "100%")
						.attr("x2", "100%")
						.attr("y2", "100%")
						.attr("spreadMethod", "pad");
					
	legend.append("stop")
				.attr("offset", "0%")
				.attr("stop-color", colors(1000000))
				 .attr("stop-opacity", 1);
					
	legend.append("stop")
				.attr("offset", "33%")
				.attr("stop-color", colors(20000000))
				.attr("stop-opacity", 1);
					
	legend.append("stop")
				.attr("offset", "66%")
				.attr("stop-color", colors(50000000))
				.attr("stop-opacity", 1);
					
	legend.append("stop")
				.attr("offset", "100%")
				.attr("stop-color", colors(89000000))
				.attr("stop-opacity", 1);
					
	legendSvg.append("rect")
			.attr("width", legendWidth)
			.attr("height", legendHeight - 30)
			.style("fill", "url(#gradient)")
			.attr("transform", "translate(0,10)")
			.attr("x",20);
					
	var y = d3.scale.linear()
					.range([420, 20])
					.domain([90,0.5]);
					
	var yAxis = d3.svg.axis()
				.orient("bottom")
				 .scale(y)
				.tickValues(y.domain())
				.tickFormat(function(d){return d+"mil"});
					
	legendSvg.append("g")
			.attr("class", "y axis")
			.attr("transform", "translate(0,30)")
			.call(yAxis)
			.attr("x",10)
			.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 0)
			.attr("dy", ".71em")
			.style("text-anchor", "end")
}

	