'use strict';

angular.module('obrasMduytApp')
  .controller('HomeCtrl', function ($scope,DataService) {

  	$scope.pymChild = new pym.Child({ polling: 1000 });
    $scope.pymChild.sendHeight();

    DataService.getAll()
    .then(function(data){
    	console.log(data);
		$scope.obras = data;
    });

	var projection = d3.geo.mercator()
	    .center([ -58.381592,-34.603722])
	    .scale(70*1000);

    var svg = d3.select("#home-mapa-container")
    	.append("svg")
	    .attr("width", 600)
	    .attr("height", 400);

	function circle(coordinates) {
	  var circle = [],
	      length = 0,
	      lengths = [length],
	      polygon = d3.geom.polygon(coordinates),
	      p0 = coordinates[0],
	      p1,
	      x,
	      y,
	      i = 0,
	      n = coordinates.length;

	  // Compute the distances of each coordinate.
	  while (++i < n) {
	    p1 = coordinates[i];
	    x = p1[0] - p0[0];
	    y = p1[1] - p0[1];
	    lengths.push(length += Math.sqrt(x * x + y * y));
	    p0 = p1;
	  }

	  var area = polygon.area(),
	      radius = Math.sqrt(Math.abs(area) / Math.PI),
	      centroid = polygon.centroid(-1 / (6 * area)),
	      angleOffset = -Math.PI / 2, // TODO compute automatically
	      angle,
	      i = -1,
	      k = 2 * Math.PI / lengths[lengths.length - 1];

	  // Compute points along the circle’s circumference at equivalent distances.
	  while (++i < n) {
	    angle = angleOffset + lengths[i] * k;
	    circle.push([
	      centroid[0] + radius * Math.cos(angle),
	      centroid[1] + radius * Math.sin(angle)
	    ]);
	  }

	  return circle;
	}

	var comunasGeometries = [];
	var paths;

    d3.json("geo/comunas.simple.geojson", function(data) {
    	_.each(data.features,function(f){

    		var geoProjection = f.geometry.coordinates[0].map(projection);
    		var id = 'c'+f.properties.comuna;

    		comunasGeometries.push({
    			id: id,
    			data: f.properties,
    			coordinatesGeo: "M" + geoProjection.join("L") + "Z",
    			coordinatesSquare: "M" + circle(geoProjection).join("L") + "Z"
    		});

    	});

	    paths = svg.selectAll('path.shape')
	    	.data(comunasGeometries)
	    	.enter()
			.append("path")
			.classed('shape',true)
			.attr('id',function(d){
				return d.id;
			});

     	loop();

		function loop() {
			paths
				.attr("d", function(d){
					return d.coordinatesGeo;
				})
				.transition()
				.duration(5000)
				.attr("d", function(d){
					return d.coordinatesSquare;
				})
				.transition()
				.delay(5000)
				.attr("d", function(d){
					return d.coordinatesGeo;
				})
				.each("end", loop);
		}
	});

  });
