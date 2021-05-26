

var colors=d3.scale.linear().domain([500000,90000000]).range(["white","blue"])
		let country_data;
		fetch("country_data.json")
			.then(response=>{return response.json();})
			.then(data=>dataReady(data));
			
		
	    var width = 600;
	    var height = 650;
	    var projection = d3.geo.mercator()
	    .center([5, 55])
	    .scale(550)
       .translate([width / 2, height / 2]);
	    var path = d3.geo.path()
	    .projection(projection);
	    var svg = d3.select("#map").append("svg")
	    .attr("width", width)
	    .attr("height", height)
	    .style("background", "white");

	function dataReady(data){
		country_data=data;
		createMap();
		
	}
    function pair(array) {
        return array.slice(1).map(function(b, i) {
            return [array[i], b];
        });
    }

    function createLegend(){
        
    
  

  
 
    }

	function createMap(){
	
	    d3.json("eu.json", function(eu) {
	    var countries = svg.selectAll("path.country")
	    .data(eu.features)
	    .enter()
	    .append("path")
	    .attr("class", "country")
	    .attr("id", function(d) { return d.id; })
	    .attr("d", path) 
		.style("fill", function(d){;return getColor(d.properties.adm0_a3);})
	    .style("stroke", "gray")
	    .style("stroke-width", 1)
	    .style("stroke-opacity", function(d){;return getOpacity(d.properties.adm0_a3);})
	    
	
	    })
        createLegend();
	}

	function getOpacity(countryCode){
		let country=getCountryData(countryCode);
		if(country!=null){return 1;}
		else return 0;
	}

		function getColor(countryCode){
			let country=getCountryData(countryCode);
			if(country!=null){
				var color= colors(country.population[0].Y2019);
				return color;
			}
			else return "#edddd3";

		}

		function getCountryData(countryCode){
			
			let index=country_data.findIndex((country)=>country.country_code===countryCode)
			if(index >-1){ return country_data[index];}
			else	{return null;}
				
		}