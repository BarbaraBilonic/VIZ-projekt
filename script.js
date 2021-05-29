

var colors=d3.scale.linear().domain([500000,80000000]).range(["white","black"])

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
		var pieChartWidth=300;
		var pieChartHeight=300;
		var pieChartMargin=30;
		var radius=Math.min(pieChartWidth,pieChartHeight)/2-pieChartMargin
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
			}
		})
		.on("mouseout",function(d){
			if(getCountryData(d.properties.adm0_a3)!=null){
				d3.select(this).style("fill",function(d){return getColor(d.properties.adm0_a3,9)});
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
			.on("mouseover", function(){
				d3.select(this).attr("fill","#b8e1f5");
			})
			.on("mouseout",function(){d3.select(this).attr("fill","#7bafc7");})
			.on("click",function(d,i){changeMap(i); updatePieChart(d.country_code,i);});
		
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
			})

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
				.attr("d",d3.svg.arc()
						.innerRadius(80)
						.outerRadius(radius)
					)
				.attr("fill", function(d,i){
					if(i===0) return "yellow";
					else return "green";
				})
	
				



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