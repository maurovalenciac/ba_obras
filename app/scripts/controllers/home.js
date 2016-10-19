'use strict';

angular.module('obrasMduytApp')
  .controller('HomeCtrl', function ($scope,DataService) {

	var d3 = window.d3;

	$scope.pymChild = new window.pym.Child({ polling: 1000 });
	var chart = {};
	var bubbles = {};
	$scope.selectedGroup = 'comunas';

	var renderFunctions = {
		'comunas':renderComunasGroup,
		'etapas':renderEtapasGroup,
		'map':renderMapGroup
	};

	var prepareNodesFunctions = {
		'comunas':prepareNodesComunasGroup,
		'etapas':prepareNodesEtapasGroup,
		'map':prepareNodesMapGroup
	};

	var initialized = {
		'comunas':false,
		'etapas':false,
		'map':false
	};

	DataService.getAll()
	.then(function(data){
		console.log(data);
		$scope.obras = data;
		renderChart();
		window.$(window).resize(function() {
			clearTimeout($scope.timeoutId);
			$scope.timeoutId = setTimeout(function(){
				renderChart();
				initialized = {
					'comunas':false,
					'etapas':false,
					'map':false
				}
			}, 1000);
		});
	});

	function renderChart(){

		//chart.w = $('#home-chart-container').width();
		chart.w = d3.select('#home-chart-container').node().getBoundingClientRect().width;

		chart.w = (!chart.svg ||  (chart.w<500) )?chart.w-15:chart.w;

		$scope.isSmallDevice = (chart.w<500)?true:false;
		
		if($scope.isSmallDevice){

			chart.h = chart.w;
			chart.margin = chart.w/100;

		} else {

			chart.h = (3*chart.w)/4;
			chart.margin = chart.w/200;

		}

		if(!chart.svg) {
			//Create
			chart.svg = d3.select('#home-chart-container').append('svg');
			chart.mainGroup = chart.svg.append('g').classed('main-group',true);
			chart.mainGroup.append('rect').attr('fill','white');
			
			chart.svg.append('g').attr('id','comunas-group');
			chart.svg.append('g').attr('id','map-group');
			chart.svg.append('g').attr('id','etapas-group');

			bubbles.group = chart.svg
				.append('g')
				.attr('id','bubbles-group');
		}
		
		//Update
		chart.svg
			.attr('width',chart.w)
			.attr('height',chart.h);

		chart.mainGroup
			.select('rect')
			.attr('width',chart.w)
			.attr('height',chart.h);

		//default, comunas
		$scope.showGroup($scope.selectedGroup);
	}

	function renderMapGroup(){

		chart.mapProjection = d3.geo.mercator()
			.center([ -58.43992,-34.618])
			.translate([chart.w / 2, chart.h / 2])		    
			.scale(190*chart.w);

		chart.mapPath = d3.geo.path()
			.projection(chart.mapProjection);

		function updateMap(){
			if($scope.isSmallDevice){
				chart.svg.attr('height',chart.w);
			}

			chart.mapGroup.selectAll('path.map-item')
				.style('stroke-width',0)
				.transition()
				.duration(1000)
				.style('stroke-width',3)
				.attr('d', chart.mapPath)
				.style('opacity',1);
		}

		if(!chart.mapGroup) {

			chart.mapGroup = chart.svg
				.select('#map-group');

			d3.json('geo/comunas.simple.geojson', function(data) {
				
				chart.mapFeatures = data.features;

				chart.mapGroup.selectAll('path.map-item')
					.data(chart.mapFeatures)
					.enter()
					.append('path')
					.classed('child',true)
					.classed('map-item',true)
					.attr('id',function(d){
						return d.id;
					})
					.classed('shape',true)
					.on('click',clickedMap);

				updateMap();
			});

		} else {
				updateMap();
		}

	}

	function renderComunasGroup(){

		var comunas = d3.range(1,16);
		
		var itemH,itemW;
		if($scope.isSmallDevice){
			itemH = chart.w;
			itemW = chart.w;
			chart.svg.attr('height',comunas.length*chart.w);
			chart.mainGroup
				.select('rect')
				.attr('height',comunas.length*chart.w);
		} else {
			itemH = chart.h/3;
			itemW = chart.w/5;
		}
		
		if(!chart.comunasGroup) {

			chart.comunasGroup = chart.svg
				.select('#comunas-group');

			chart.comunasGroup.selectAll('g.comunas-item')
				.data(comunas)
				.enter()
				.append('g')
				.classed('child',true)
				.classed('comunas-item',true)
				.style('opacity',0)
				.attr('transform', function(d,i) {
					return 'translate(' + (chart.w/2-itemW/2) +',' + (chart.h/2-itemH/2) + ')';
				})
				.attr('id',function(d){return 'comunas-item-'+d;})
				.each(function() {

					var group = d3.select(this);

					group
						.append('rect')
						.classed('comunas-item-frame',true)
						.attr('fill','#dedede');

					group
						.append('text')
						.classed('comunas-item-text',true)
						.attr('fill','#000')
						.text(function(d){
							return 'Comuna '+d;
						});

				});


		}

		//update
		chart.comunasGroup
			.selectAll('rect.comunas-item-frame')
			.transition()
			.duration(700)
			.attr('x',chart.margin)
			.attr('y',chart.margin)
			.attr('height',itemH-chart.margin*2)
			.attr('width',itemW-chart.margin*2);

		chart.comunasGroup
			.selectAll('text.comunas-item-text')
			.transition()
			.duration(700)
			.attr('x',15)
			.attr('y',25);

		sortItems(chart.comunasGroup
			.selectAll('g.comunas-item')
			.transition()
			.duration(1000)
			.style('opacity',1),itemW,itemH);

	}

	function renderEtapasGroup(){

		var etapas = d3.range(1,5);
		
		var itemH,itemW;
		if($scope.isSmallDevice){
			itemH = chart.w;
			itemW = chart.w;
			chart.svg.attr('height',etapas.length*chart.w);
			chart.mainGroup
				.select('rect')
				.attr('height',etapas.length*chart.w);
		} else {
			itemH = chart.h/2;
			itemW = chart.w/2;
		}

		if(!chart.etapasGroup) {

			chart.etapasGroup = chart.svg
				.select('#etapas-group');

			chart.etapasGroup.selectAll('g.etapas-item')
				.data(etapas)
				.enter()
				.append('g')
				.classed('child',true)
				.classed('etapas-item',true)
				.style('opacity',0)
				.attr('transform', function(d,i) {
					return 'translate(' + (chart.w/2-itemW/2) +',' + (chart.h/2-itemH/2) + ')';
				})
				.attr('id',function(d){return 'etapas-item-'+d;})
				.each(function() {

					var group = d3.select(this);

					group
						.append('rect')
						.classed('etapas-item-frame',true)
						.attr('fill','#dedede');

					group
						.append('text')
						.classed('etapas-item-text',true)
						.attr('fill','#000')
						.text(function(d){
							return 'Etapa '+d;
						});

				});


		}

		//update
		chart.etapasGroup
			.selectAll('rect.etapas-item-frame')
			.transition()
			.duration(700)
			.attr('x',chart.margin)
			.attr('y',chart.margin)
			.attr('height',itemH-chart.margin*2)
			.attr('width',itemW-chart.margin*2);

		chart.etapasGroup
			.selectAll('text.etapas-item-text')
			.transition()
			.duration(700)
			.attr('x',15)
			.attr('y',25);

		sortItems(chart.etapasGroup
			.selectAll('g.etapas-item')
			.transition()
			.duration(1000)
			.style('opacity',1),itemW,itemH);


	}

	function sortItems($items,itemW,itemH){

		var xLimit = Math.floor(chart.w/itemW),
			xCount = 0,
			yCount = 0;

		$items
		  .transition()
		  .duration(700)
		  .attr('transform', function(d,i) {
			
			var x = xCount*itemW;
			var y = yCount*itemH;
			if(xCount<xLimit-1){
			  xCount++;
			} else if($items[0].length!==i+1) {
			  xCount = 0;
			  yCount++;
			}

			return 'translate(' + x +',' + y + ')';
		  });

	}

	function prepareNodesComunasGroup(){

		bubbles.clusters = {};
		bubbles.clusterPoints = {};

		bubbles.nodes = $scope.obras
				.filter(function(d){
					return (d.comuna[0]);
				})
				.map(function(d) {
				  var i = 'c'+d.comuna[0],
					  r = 10,
					  c = {cluster: i, radius: r, data:d};
					  
					  if (!bubbles.clusters[i] || (r > bubbles.clusters[i].radius)){
						bubbles.clusters[i] = c;
					  }

				  return c;
				});

		d3.selectAll('g.comunas-item').each(function(d){
			var g = d3.select(this);
			var rect = g.select('rect');

			bubbles.clusterPoints['c'+d] = {
				x: d3.transform(g.attr('transform')).translate[0]+rect.attr('width')/2,
				y: d3.transform(g.attr('transform')).translate[1]+rect.attr('height')/2,
				radius:10
			};
		});

	}

	function prepareNodesEtapasGroup(){

		bubbles.clusters = {};
		bubbles.clusterPoints = {};

		bubbles.nodes = $scope.obras
				.filter(function(d){
					return (d.etapa);
				})
				.map(function(d) {
				  var i = 'e'+(Math.floor(Math.random() * 4)+1),
					  r = 10,
					  c = {cluster: i, radius: r, data:d};
					  
					  if (!bubbles.clusters[i] || (r > bubbles.clusters[i].radius)){
						bubbles.clusters[i] = c;
					  }

				  return c;
				});

		d3.selectAll('g.etapas-item').each(function(d){
			var g = d3.select(this);
			var rect = g.select('rect');

			bubbles.clusterPoints['e'+d] = {
				x: d3.transform(g.attr('transform')).translate[0]+rect.attr('width')/2,
				y: d3.transform(g.attr('transform')).translate[1]+rect.attr('height')/2,
				radius:10
			};
		});

	}

	function prepareNodesMapGroup(){

		bubbles.clusters = {};
		bubbles.clusterPoints = {};

		bubbles.nodes = $scope.obras
				.filter(function(d){
					return (d.lat && d.lng);
				})
				.map(function(d) {
				  var i = 'i'+d.id,
					  r = 5,
					  c = {cluster: i, radius: r, data:d};
					  
					  bubbles.clusters[i] = c;

					  var randLat = -1*(Math.random() * (34.50001 - 34.70001) + 34.70001).toFixed(5);
					  var randLng = -1*(Math.random() * (58.30001 - 58.50001) + 58.50001).toFixed(5);

					  var point = chart.mapProjection([parseFloat(d.lng),parseFloat(d.lat)]);
					  //var point = chart.mapProjection([randLng,randLat]);

					  bubbles.clusterPoints[i] = {
						x: point[0],
						y: point[1],
						radius:5
					  };

				  return c;
				});

	}

	$scope.showGroup = function(group){

		if($scope.selectedGroup !== group){
			chart.svg.selectAll('.child').style('opacity',0);
			chart.svg.selectAll('circle.obra').transition().style('opacity',0.5);
			$scope.selectedGroup = group;
		}

		renderFunctions[group]();

		var time = (initialized[group])?100:2000;
		initialized[group] = true;

		setTimeout(function(){
			prepareNodesFunctions[group]();
			renderBubbles();
		},time);

	};

	function renderBubbles(){

		bubbles.colors = d3.scale.category20();

		bubbles.force = d3.layout.force()
			.nodes(bubbles.nodes)
			.size([chart.w, chart.h])
			.gravity(0)
			.charge(1)
			.on('tick', tick)
			.start();

		bubbles.circles = bubbles.group.selectAll('circle.obra')
			.data(bubbles.nodes);

		bubbles.circles
			.enter()
			.append('circle')
			.classed('obra',true);

		bubbles.circles
			.attr('id',function(d){return 'e'+d.data.id;})
			.style('fill', function(d) { 
			  return bubbles.colors(d.data.tipo[0]); 
			})
			//.call(bubbles.force.drag);

		 bubbles.circles
			.transition()
			.style('opacity',1)
			.attr('r', function(d) {
			  return d.radius; 
			});

		bubbles.circles.exit().remove();

	}

	function tick(e) {
	  bubbles.circles
		  .each(cluster(10 * e.alpha * e.alpha))
		  .each(collide(0.5))
		  .attr('cx', function(d) { return d.x; })
		  .attr('cy', function(d) { return d.y; });
	}

	// Move d to be adjacent to the cluster node.
	function cluster(alpha) {
	  return function(d) {

		var cluster = bubbles.clusters[d.cluster];
		var k = 1;

		if(cluster){
			// For cluster nodes, apply custom gravity.
			if (cluster === d) {
				if(bubbles.clusterPoints){
					cluster = bubbles.clusterPoints[d.cluster];
					cluster = {x: cluster.x, y: cluster.y, radius: -cluster.radius};
					k = 0.5 * Math.sqrt(d.radius);
				} else {
					cluster = {x: chart.w / 2, y: chart.h / 2, radius: -d.radius};
					k = 0.1 * Math.sqrt(d.radius);
				}
			}

			var x = d.x - cluster.x,
				y = d.y - cluster.y,
				l = Math.sqrt(x * x + y * y),
				r = d.radius + cluster.radius;
			if (l !== r) {
			  l = (l - r) / l * alpha * k;
			  d.x -= x *= l;
			  d.y -= y *= l;
			  cluster.x += x;
			  cluster.y += y;
			}
		}

	  };
	}

	// Resolves collisions between d and all other circles.
	function collide(alpha) {
	  var quadtree = d3.geom.quadtree(bubbles.nodes);
	  return function(d) {
		var r = d.radius + 10,
			nx1 = d.x - r,
			nx2 = d.x + r,
			ny1 = d.y - r,
			ny2 = d.y + r;
		quadtree.visit(function(quad, x1, y1, x2, y2) {
		  if (quad.point && (quad.point !== d)) {
			var x = d.x - quad.point.x,
				y = d.y - quad.point.y,
				l = Math.sqrt(x * x + y * y),
				r = d.radius + quad.point.radius + 5;
			if (l < r) {
			  l = (l - r) / l * alpha;
			  d.x -= x *= l;
			  d.y -= y *= l;
			  quad.point.x += x;
			  quad.point.y += y;
			}
		  }
		  return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
		});
	  };
	}

	var activeMap = d3.select(null);
	function clickedMap(d) {
	  if (activeMap.node() === this) return resetMap();
	  activeMap.classed("active", false);
	  activeMap = d3.select(this).classed("active", true);

	  var bounds = chart.mapPath.bounds(d),
		  dx = bounds[1][0] - bounds[0][0],
		  dy = bounds[1][1] - bounds[0][1],
		  x = (bounds[0][0] + bounds[1][0]) / 2,
		  y = (bounds[0][1] + bounds[1][1]) / 2,
		  scale = .9 / Math.max(dx / chart.w, dy / chart.h),
		  translate = [chart.w / 2 - scale * x, chart.h / 2 - scale * y];

	  chart.mapGroup.transition()
		  .duration(750)
		  .attr("transform", "translate(" + translate + ")scale(" + scale + ")");

	   chart.mapGroup.selectAll('path')
			.transition()
			.duration(750)
			.style("stroke-width", 1 + "px");

	   bubbles.group
	   		.transition()
			.duration(750)
			.attr("transform", "translate(" + translate + ")scale(" + scale + ")");
	}

	function resetMap() {
	  activeMap.classed("active", false);
	  activeMap = d3.select(null);

	  chart.mapGroup
	  		.transition()
		  .duration(750)
		  .attr("transform", "");

	   chart.mapGroup.selectAll('path')
	   		.transition()
		  	.duration(750)
		  	.style("stroke-width", "3px");

	   bubbles.group
	   		.transition()
		  	.duration(750)
		  	.attr("transform", "");

	}

  });
