'use strict';

angular.module('obrasMduytApp')
  .controller('HomeCtrl', function ($scope,DataService) {

  	$scope.pymChild = new pym.Child({ polling: 1000 });
    $scope.pymChild.sendHeight();
    $scope.timeoutId;
    var chart = {};
    var bubbles = {

    };
    $scope.isSmallDevice;
    $scope.selectedGroup = 'comunas';

    DataService.getAll()
    .then(function(data){
    	console.log(data);
		$scope.obras = data;
		renderChart();
		$(window).resize(function() {
            clearTimeout($scope.timeoutId);
		    $scope.timeoutId = setTimeout(renderChart, 1000);
		});
    });

    function renderChart(){

		//chart.w = $('#home-chart-container').width();
		chart.w = d3.select('#home-chart-container').node().getBoundingClientRect().width;

		chart.w = (!chart.svg ||  (chart.w<500) )?chart.w-15:chart.w;
		//console.log('ancho! ',chart.w);
		$scope.isSmallDevice = (chart.w<500)?true:false;
		
		if($scope.isSmallDevice){

			chart.h = chart.w
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

			renderPelotas();

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

		if(!chart.mapGroup) {

			chart.mapGroup = chart.svg
				.select('#map-group');

		    d3.json("geo/comunas.simple.geojson", function(data) {
		    	
		    	chart.mapFeatures = data.features;

				chart.mapGroup.selectAll('path.map-item')
			    	.data(chart.mapFeatures)
			    	.enter()
					.append("path")
					.classed('child',true)
					.classed('map-item',true)
					.attr('id',function(d){
						return d.id;
					})
					.classed('shape',true);

		    	updateMap();
			});

		} else {
		    	updateMap();
		}

		function updateMap(){
			if($scope.isSmallDevice){
				chart.svg.attr('height',chart.w);
			}

			chart.mapGroup.selectAll('path.map-item')
				.transition()
				.attr("d", chart.mapPath)
				.style('opacity',1);
		}

	}

	function renderComunasGroup(){

		var comunas = d3.range(1,16);
		
		if(!chart.comunasGroup) {

			chart.comunasGroup = chart.svg
				.select('#comunas-group');

			chart.comunasGroup.selectAll('g.comunas-item')
		    	.data(comunas)
		    	.enter()
				.append("g")
				.classed('child',true)
				.classed('comunas-item',true)
				.attr('id',function(d){return 'comunas-item-'+d;})
				.each(function(d) {

		            var group = d3.select(this);

		            group
		                .append('rect')
		                .classed('comunas-item-frame',true)
		                .attr('fill','#ccc');

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

		if($scope.isSmallDevice){
			var itemH = chart.w;
			var itemW = chart.w;
			chart.svg.attr('height',comunas.length*chart.w);
			chart.mainGroup
	            .select('rect')
				.attr('height',comunas.length*chart.w);
		} else {
			var itemH = chart.h/3;
			var itemW = chart.w/5;
		}

		chart.comunasGroup
			.selectAll('rect.comunas-item-frame')
			.transition()
		    .attr('x',chart.margin)
            .attr('y',chart.margin)
			.attr('height',itemH-chart.margin*2)
		    .attr('width',itemW-chart.margin*2);

		chart.comunasGroup
			.selectAll('text.comunas-item-text')
			.transition()
			.attr('x',15)
			.attr('y',25);

		sortItems(chart.comunasGroup
			.selectAll('g.comunas-item')
			.transition()
			.style('opacity',1),itemW,itemH);

	}

	function renderEtapasGroup(){

		var etapas = d3.range(1,5);
		
		if(!chart.etapasGroup) {

			chart.etapasGroup = chart.svg
				.select('#etapas-group');

			chart.etapasGroup.selectAll('g.etapas-item')
		    	.data(etapas)
		    	.enter()
				.append("g")
				.classed('child',true)
				.classed('etapas-item',true)
				.attr('id',function(d){return 'etapas-item-'+d;})
				.each(function(d) {

		            var group = d3.select(this);

		            group
		                .append('rect')
		                .classed('etapas-item-frame',true)
		                .attr('fill','#ccc');

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

		if($scope.isSmallDevice){
			var itemH = chart.w;
			var itemW = chart.w;
			chart.svg.attr('height',etapas.length*chart.w);
			chart.mainGroup
	            .select('rect')
				.attr('height',etapas.length*chart.w);
		} else {
			var itemH = chart.h/2;
			var itemW = chart.w/2;
		}

		chart.etapasGroup
			.selectAll('rect.etapas-item-frame')
			.transition()
		    .attr('x',chart.margin)
            .attr('y',chart.margin)
			.attr('height',itemH-chart.margin*2)
		    .attr('width',itemW-chart.margin*2);

		chart.etapasGroup
			.selectAll('text.etapas-item-text')
			.transition()
			.attr('x',15)
			.attr('y',25);

		sortItems(chart.etapasGroup
			.selectAll('g.etapas-item')
			.transition()
			.style('opacity',1),itemW,itemH);


	}

	var renderFunctions = {
		'comunas':renderComunasGroup,
		'etapas':renderEtapasGroup,
		'map':renderMapGroup
	}

	$scope.showGroup = function(group){

		if($scope.selectedGroup != group){
			chart.svg.selectAll('.child').style('opacity',0);
			$scope.selectedGroup = group;
		}

		renderFunctions[group]();

	}

	function sortItems($items,itemW,itemH){

        var xLimit = Math.floor(chart.w/itemW),
            xCount = 0,
            yCount = 0;

        $items
          .transition()
          .duration(1000)
          .attr("transform", function(d,i) {
          	
            var x = xCount*itemW;
            var y = yCount*itemH;
            if(xCount<xLimit-1){
              xCount++;
            } else if($items[0].length!==i+1) {
              xCount = 0;
              yCount++;
            }

            return "translate(" + x +"," + y + ")";
          });

      }

      	function renderPelotas(){


      		bubbles.clusters = new Array(15);

            bubbles.nodes = $scope.obras.map(function(d) {
              var i = d.sector,
                  r = 10,
                  d = {cluster: i, radius: r, data:d};
                  
                  if (!bubbles.clusters[i] || (r > bubbles.clusters[i].radius)){
                    bubbles.clusters[i] = d;
                  }

              return d;
            });

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
	            .attr('id',function(d){return 'e'+d.data.id})
	            .attr('r', function(d) {
	              return d.radius; 
	            })
	            .style('fill', function(d) { 
	              return bubbles.colors(d.data.id); 
	            })
	            .call(bubbles.force.drag);

        };

        function tick(e) {
          bubbles.circles
              .each(cluster(10 * e.alpha * e.alpha))
              .each(collide(.5))
              .attr('cx', function(d) { return d.x; })
              .attr('cy', function(d) { return d.y; });
        };

        // Move d to be adjacent to the cluster node.
        function cluster(alpha) {
          return function(d) {

            var cluster = bubbles.clusters[d.cluster];
            var k = 1;

            if(cluster){
                // For cluster nodes, apply custom gravity.
                if (cluster === d) {
                /*  if(clusterPoints){
                    cluster = clusterPoints[d.cluster];
                    cluster = {x: cluster.x, y: cluster.y, radius: -cluster.radius};
                    k = .5 * Math.sqrt(d.radius);
                  } else {*/
                    cluster = {x: chart.w / 2, y: chart.h / 3, radius: -d.radius};
                    k = .1 * Math.sqrt(d.radius);
                  //}
                }

                var x = d.x - cluster.x,
                    y = d.y - cluster.y,
                    l = Math.sqrt(x * x + y * y),
                    r = d.radius + cluster.radius;
                if (l != r) {
                  l = (l - r) / l * alpha * k;
                  d.x -= x *= l;
                  d.y -= y *= l;
                  cluster.x += x;
                  cluster.y += y;
                }
            }

          };
        };

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
        };

  });
