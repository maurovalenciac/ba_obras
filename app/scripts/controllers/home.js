'use strict';

angular.module('obrasMduytApp')
  .controller('HomeCtrl', function ($scope,DataService) {

  	$scope.pymChild = new pym.Child({ polling: 1000 });
    $scope.pymChild.sendHeight();
    $scope.timeoutId;
    var chart = {};
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

		if(!chart.mapGroup) {

			chart.mapGroup = chart.svg
				.append('g')
				.attr('id','map-group');

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
				.append('g')
				.attr('id','comunas-group');

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
				.append('g')
				.attr('id','etapas-group');

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

  });
