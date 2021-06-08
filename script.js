document.querySelector("#filter-btn").addEventListener("click",filterButtonClicked);
document.querySelector("#reset-filter").addEventListener("click",resetButtonClicked);
document.querySelector("#back").addEventListener("click",backButtonClicked);


var colors=d3.scale.linear().domain([500000,90000000]).range([ "#eafaf1","#14916a"])
		
		var year=9;
		all=1;
		let country_data=Array();
		fetch("country_data.json")
		.then(response=>{return response.json();})
		.then(data=>dataReady(data));
		var chart;
		var years=[2010,2011,2012,2013,2014,2015,2016,2017,2018,2019];
		let map_data;
		var countries;	
		var barchart;
	    var mapWidth = 540;
	    var mapHeight = 700;
		var popGraphWidth=700;
		var popGraphHeight=350;
		var barPadding=8;
		var barWidthAllCountries;
		var barWidthOneCountry=popGraphWidth/10-30;
		var pieChartWidth=450;
		var pieChartHeight=300;
		var pieChartMargin=30;
		var radius=120;
		var popChartMarginTop=40;
		var arc=d3.svg.arc()
			.innerRadius(80)
			.outerRadius(radius)
	    var projection = d3.geo.mercator()
	    .center([10, 55])
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
		.attr("width", popGraphWidth + 150)
		.attr("height", popGraphHeight + 200)
		.style("background-color", "white")
		.append("g")
		.attr("transform", "translate(" + 100 + "," +0 +")");

		var pieSvg=d3.select("#pie")
			.append("svg")
			.attr("width",pieChartWidth)
			.attr("height",pieChartHeight)
			.append("g")
			.attr("transform","translate("+120+","+pieChartHeight/2+")")
		
		
			
		var xScaleYears=d3.scale.ordinal()
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
	var legendWidth = 400;
	var legendHeight = 50;

	var legendSvg = d3.select("#legend")
						.append("svg")
						.attr("width", 600)
						.attr("height", 100);
					
	var legend = legendSvg.append("defs")
						.append("svg:linearGradient")
						.attr("id", "gradient")
						.attr("x1", "0%")
						.attr("y1", "100%")
						.attr("x2", "100%")
						.attr("y2", "100%")
						.attr("spreadMethod", "pad");
		createLegend()
						  
			
 
	function dataReady(data){
		data.forEach(element => {
			country_data.push(
				{
					country_name: element.country_name,
					country_code:element.country_code,
					isIncluded:1,
					population:element.population,
					urban_population:element.urban_population,
					rural_population:element.rural_population
				}
			)
		});
		createMap();
		document.querySelector("#lower").value=d3.min(country_data.map(function(d){return d3.min(d.population.map(function(e){return e;}))}));
		document.querySelector("#lower").min=d3.min(country_data.map(function(d){return d3.min(d.population.map(function(e){return e;}))}));
		document.querySelector("#upper").value=d3.max(country_data.map(function(d){return d3.max(d.population.map(function(e){return e;}))}));
		document.querySelector("#upper").max=d3.max(country_data.map(function(d){return d3.max(d.population.map(function(e){return e;}))}));
		lower=d3.min(country_data.map(function(d){return d3.min(d.population.map(function(e){return e;}))}));
		upper=d3.max(country_data.map(function(d){return d3.max(d.population.map(function(e){return e;}))}));
		document.querySelector("#lower-min-p").innerHTML=`Min (${lower})`;	
		document.querySelector("#lower-max-p").innerHTML=`Max (${upper})`;
		document.querySelector("#back").disabled=true;
		document.querySelector("#back").setAttribute("style","color:white");

							
						}
	function backButtonClicked(){
		all=1;
		document.querySelector("#back").disabled=true;
		document.querySelector("#back").setAttribute("style","color:white");
		
		document.querySelector("#country_name").innerHTML=`<h3>European Union Countries<h3>`
		year=9;
		filterCountries();
		createGraph();
		
		document.querySelector("#year").innerHTML=`<h3>Year: ${years[year]}</h3>`;
		removePieChart();
	}
	function filterButtonClicked(){
		
		upper=document.querySelector("#upper").value;
		lower=document.querySelector("#lower").value;
		changeLegend();
		filterCountries();
		
		colors.domain([lower,upper]);
		
		if(all===1){
		createGraph();
		
					}
		changeMap(year);					
									
		}

		function resetButtonClicked(){
			document.querySelector("#lower").value=d3.min(country_data.map(function(d){return d3.min(d.population.map(function(e){return e;}))}));
			document.querySelector("#upper").value=d3.max(country_data.map(function(d){return d3.max(d.population.map(function(e){return e;}))}));
			upper=document.querySelector("#upper").value;
			lower=document.querySelector("#lower").value;
			filterCountries();
			changeLegend();
			colors.domain([lower,upper]);
		
			if(all===1){
			createGraph();
			
		}
		changeMap(year);
	}
					
		function filterCountries(){
		
		var i;
			for(i=0;i<country_data.length;i++){
				
				if(country_data[i].population[year]<lower || country_data[i].population[year]>upper){
					country_data[i].isIncluded=0;
					
				}
				else{
					country_data[i].isIncluded=1;
				}
			}			
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
			var c=getCountryData(d.properties.adm0_a3);
			if(c!=null && c.isIncluded===1){
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
			var c=getCountryData(d.properties.adm0_a3);
				if(c!=null && c.isIncluded===1){
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
			if(country!=null && country.isIncluded===1){
				if(all===1){
					createCountryBarchart(country);
					createPieChart(country.country_code,year)
				}else{
				changeBarchart(country);
				updatePieChart(country.country_code,year)
				}
				
			}
		});
		map_data=eu;
	    })
       createGraph();
	  
	}


	

	function highlightCountry(countryCode){
		countries
			.data(map_data.features)
			.style("fill",function(d){
				if(d.properties.adm0_a3===countryCode) return "#eeffc4";
				else return getColor(d.properties.adm0_a3,year);
			});


	}


	function changeBarchart(country){
		var yScalepopGraph=d3.scale.linear()
			.domain([0,d3.max(country.population.map(function(d){return d;}))])
			.range([popGraphHeight,0]);
		
		var popGraphYAxis=d3.svg.axis()
						.scale(yScalepopGraph)
						.orient("left")
						.ticks(4);
		popGraphSvg.selectAll(".yaxis").call(popGraphYAxis)

		barchart
		.data(country.population.map(function(d){return [d,country.country_code]}))
		.attr("x",function(d,i){return xScaleYears(years[i]);})	
		.attr("y",0)
		.attr("height", 0);

		popGraphSvg.selectAll("rect")
				.transition()
				.duration(800)
				.attr("y", function(d){return yScalepopGraph(d[0]);})
				.attr("height",function(d){return popGraphHeight-yScalepopGraph(d[0]); })
				.delay(function(d,i){ return(i*100)})
		
		
	}

	function createCountryBarchart(country){
		all=0;
		document.querySelector("#back").disabled=false;
		document.querySelector("#back").setAttribute("style","color:blue");
			
		popGraphSvg.selectAll("*").remove();
		var yScalepopGraph=d3.scale.linear()
			.domain([0,d3.max(country.population.map(function(d){return d;}))])
			.range([popGraphHeight,0]);

		var popGraphXAxis=d3.svg.axis()
					.scale(xScaleYears)
					.orient("bottom");

		var popGraphYAxis=d3.svg.axis()
						.scale(yScalepopGraph)
						.orient("left")
						.ticks(4);

		popGraphSvg.append("g")
			.attr("class","xaxis")
			.attr("transform","translate(0,"+(popGraphHeight+popChartMarginTop)+")")
			.call(popGraphXAxis)
			.selectAll("text")
			.style("text-anchor", "middle")
			
			popGraphSvg.append("g")
			.attr("class", "yaxis")
			.attr("transform","translate(0,"+popChartMarginTop+")")
			.call(popGraphYAxis)
			.append("text")
			.style("text-anchor","end")
			.attr("x",-100)
			.attr("y",-90.5)
			.text("population")
			.attr("transform","rotate(-90)");
		
		 barchart = popGraphSvg.selectAll("rect")
			.data(country.population.map(function(d){return [d,country.country_code]}))
			.enter()
			.append("rect")
			.attr("transform","translate(0,"+popChartMarginTop+")")
			.attr("x",function(d,i){return xScaleYears(years[i]);})	
			.attr("y",0)
			.attr("height", 0)
			.attr("width",barWidthOneCountry)
			.attr("fill","#7bafc7")
			.on("mouseover", function(d,i){
				d3.select(this).attr("fill","#b8e1f5");
				d3.select(this).transition()
					.duration(50)
					.attr("opacity",0.85);
				barchartDiv.transition()
					.duration(50)
					.style("opacity",1);
				let num=d[0];
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
			.on("click",function(d,i){
				year=i;
				filterCountries();
				changeMap(year); 
				document.querySelector("#year").innerHTML=`<h3>Year:${years[year]}</h3>`;
				updatePieChart(d[1],i);

			 });
		
			popGraphSvg.selectAll("rect")
				
				.transition()
				.duration(1000)
				.attr("y", function(d){return yScalepopGraph(d[0]);})
				.attr("height",function(d){return popGraphHeight-yScalepopGraph(d[0]); })
				.delay(function(d,i){ return(i*100*2)})

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
	function createGraph(){
		all=1;
		document.querySelector("#back").disabled=true;
		var c=country_data.filter(element=>element.isIncluded===1)
		if(c.length<5){
		barWidthAllCountries=popGraphWidth/c.length-150;
		}
		else if(c.length<8){
			barWidthAllCountries=popGraphWidth/c.length-70;
		}
		else{
			barWidthAllCountries=popGraphWidth/c.length-barPadding;
		}
		popGraphSvg.selectAll("*").remove();
		var c=country_data.filter(
			element=>element.isIncluded===1);
		var yScale=d3.scale.linear()
			.domain([0,d3.max(c.map(function(d){return d.population[9];}))])
						.range([popGraphHeight,0]);
		var xScale=d3.scale.ordinal()
		.domain(c.map(function(d){return d.country_name;}))
						.rangeRoundBands([0,popGraphWidth],.5);
		
		var popGraphXAxis=d3.svg.axis()
					.scale(xScale)
					.orient("bottom");

		var popGraphYAxis=d3.svg.axis()
						.scale(yScale)
						.orient("left")
						.ticks(4);

		popGraphSvg.append("g")
			.attr("class","xaxis")
			.attr("transform","translate(0,"+(popGraphHeight+popChartMarginTop)+")")
			.attr("y",50)
			.call(popGraphXAxis)
			.selectAll("text")
			.style("text-anchor", "end")
			.attr("transform","rotate(-45)");
		
			
		popGraphSvg.append("g")
			.attr("class", "yaxis")
			.attr("transform","translate(0,"+popChartMarginTop+")")
			.call(popGraphYAxis)
			.append("text")
			.style("text-anchor","end")
			.attr("x",-100)
			.attr("y",-90.5)
			.text("population")
			.attr("transform","rotate(-90)");
		
		 barchart = popGraphSvg.selectAll("rect")
			.data(c)
			.enter()
			.append("rect")
			.attr("transform","translate(0,"+popChartMarginTop+")")
			.attr("x",function(d){return xScale(d.country_name);})	
			.attr("y",0)
			.attr("height", 0)
			.attr("width",barWidthAllCountries)
			.attr("fill","#7bafc7")
			.on("mouseover", function(d,i){
				d3.select(this).attr("fill","#b8e1f5");
				d3.select(this).transition()
					.duration(50)
					.attr("opacity",0.85);
				barchartDiv.transition()
					.duration(50)
					.style("opacity",1);
				let num=d.country_name+", population: "+d.population[9];
				barchartDiv.html(num)
					.style("left",(d3.event.pageX)+"px")
					.style("top",(d3.event.pageY)+"px")
				highlightCountry(d.country_code);
			})
			.on("mouseout",function(d,i){
				d3.select(this).attr("fill","#7bafc7");
				d3.select(this).transition()
					.duration(50)
					.attr("opacity",1);
				barchartDiv.transition()
					.duration(50)
					.style("opacity",0);
				changeMap(9);
			})
			.on("click",function(d,i){ 
				document.querySelector("#country_name").innerHTML=`<h3>${d.country_name}</h3>`;
				 createCountryBarchart(d);
				createPieChart(d.country_code,i);});
		
			popGraphSvg.selectAll("rect")
				
				.transition()
				.duration(1000)
				.attr("y", function(d){return yScale(d.population[9]);})
				.attr("height",function(d){return popGraphHeight-yScale(d.population[9]); })
				.delay(function(d,i){ return(i*100)})

		
		
	}
	function removePieChart(){
		pieSvg.selectAll("*").remove();
		
		document.querySelector("#pie_title").innerHTML=`<h3></h3>`;
	}
	function updatePieChart(countryCode,index){
			chart.remove();
			var country=getCountryData(countryCode);
			document.querySelector("#pie_title").innerHTML=`Percentage of rural and urban population for ${country.country_name} in ${years[year]}`;
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
				if(i===0) return "#83e6c4";
				else return "#fca956";
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
		document.querySelector("#pie_title").innerHTML=`Percentage of rural and urban population for ${country.country_name} in ${years[year]}`;
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
					if(i===0) return "#83e6c4";
					else return "#fca956";
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
	
		pieSvg.append("circle").attr("cx",150).attr("cy",0).attr("r", 6).style("fill", "#83e6c4")
		pieSvg.append("circle").attr("cx",150).attr("cy",30).attr("r", 6).style("fill", "#fca956")
		pieSvg.append("text").attr("x", 160).attr("y", 5).text("Urban population (%)").style("font-size", "15px").attr("alignment-baseline","middle")
		pieSvg.append("text").attr("x", 160).attr("y", 35).text("Rural population (%)").style("font-size", "15px").attr("alignment-baseline","middle")



	}

	
	
	function getOpacity(countryCode){
		let country=getCountryData(countryCode);
		if(country!=null && country.isIncluded===1){return 1;}
		else return 0;
	}

		function getColor(countryCode,index){
			let country=getCountryData(countryCode);
			if(country!=null && country.isIncluded===1){
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
			.attr("x",40);
					
	var y = d3.scale.linear()
					.range([440, 40])
					.domain([84,0.4]);
					
	var yAxis = d3.svg.axis()
				.orient("bottom")
				 .scale(y)
				.tickValues(y.domain())
				.tickFormat(function(d){return d+"mil"});
					
	legendSvg.append("g")
			.attr("class", "yAxis")
			.attr("transform", "translate(0,30)")
			.call(yAxis)
			.attr("x",10)
			.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 0)
			.attr("dy", ".5em")
			.style("text-anchor", "end")
}

function changeLegend(){
	var l=getLowerValue();
	var u=getUpperValue();
	legendSvg.selectAll(".yAxis").remove();
	var y = d3.scale.linear()
					.range([440, 40])
					.domain([u,l]);
					var yAxis = d3.svg.axis()
					.orient("bottom")
					 .scale(y)
					.tickValues(y.domain())
					.tickFormat(function(d){
						if(d>=1){return d.toFixed(0)+"mil";}
						else return d.toFixed(1)+"mil";});
						
		legendSvg.append("g")
				.attr("class", "yAxis")
				.attr("transform", "translate(0,30)")
				.call(yAxis)
				.attr("x",10)
				.append("text")
				.attr("transform", "rotate(-90)")
				.attr("y", 0)
				.attr("dy", ".71em")
				.style("text-anchor", "end")
	
}
	
function getUpperValue(){
	var value=upper;
	var i=0;

	while(i<6){
		value/=10;
			i++;
		}
	if(upper%10!=0){
	return value+1;
		}
	else {return value;}


}
function getLowerValue(){
	var value=lower;
	var i=0;
	
		while(i<6)
		{
			value/=10;
			i++;
		}
		
	return value;


}