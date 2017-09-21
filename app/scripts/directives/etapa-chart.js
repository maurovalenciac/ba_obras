'use strict';

angular.module('obrasMduytApp')
.directive('etapaChart', function() {
	return {
	        restrict: 'E',
	        scope: {
	            obras: '=',
	            filterFn: '&',
	            selectedFilter: '=',
	            tipoColors: '=',
	        },
	        template: "<div id='etapa-chart'></div>",
	        replace: true,        
	        link: function($scope, elm, attrs) {
	        	
	        	var w = 0;

				$(window).load(function() {
					w = $(window).width();
				});

	        	var data;
	        	var chart = {};

	        	$scope.$watch(attrs.obras, function(value) {
	        		if(value){
	        			data = value;
			      		parseData();
	        		}
			    });

			    $scope.$watch(attrs.selectedFilter, function(value) {
			    	if(chart.groups){
	        			selectFilter();
			    	}
			    });

			    function parseData(){

			    	$scope.obras_by_etapa = _.map(_.groupBy(
						data.filter(function(o) {
							return typeof o.etapa != "undefined";
						}),
						"etapa"
					),function(leaf,ix){

			    		var obras_by_tipo = _.groupBy(
							leaf.filter(function(o) {
								return typeof o.tipo != "undefined";
							}),
							"tipo"
						);

						var resp = {
							slug:leaf[0].etapa_slug,
							etapa:leaf[0].etapa,
							obras:_.orderBy(
								_.reduce(
									obras_by_tipo,
									function(result, value, key) {
										result.push({
											tipo: key,
											slug: value[0].tipo_slug,
											cantidad: value.length
										});
										return result;
									},
									[]
								),
								"cantidad",
								"desc"
							)
						};

						resp.cantidad = d3.sum(resp.obras, function(to) {
								return to.cantidad;
							});

						return resp
					});

					renderChart();
			    }

			    function renderChart(){
			    	chart.w = d3
						.select("#etapa-chart")
						.node()
						.getBoundingClientRect().width;

					chart.margin = chart.w / 100;
					chart.barh = 40;
					chart.gap = 10;

					chart.h = chart.barh*2 + chart.gap*2;

					if (!chart.svg) {
						//Create
						chart.svg = d3
							.select("#etapa-chart")
							.append("svg");
						chart.mainGroup = chart.svg
							.append("g")
							.classed("main-group", true);
						chart.selection = chart.mainGroup
							.append("rect")
							.classed('selection',true)
							.attr("height", chart.gap+chart.barh)
							.attr('x',chart.w)
							.attr('y',chart.barh)
							.attr("fill", "#ffbc00");
						chart.pipe = chart.mainGroup
							.append("line")
							.classed('pipe',true)
							.attr("height", chart.h)
							.attr('y1',chart.barh/2)
							.attr('y2',chart.barh*2 + chart.gap*2)
							.attr("fill", "black")
							.attr("stroke", "black")
							.attr("stroke-width",1);
					}

					chart.max = d3.max($scope.obras_by_etapa, function(to) {
								return to.cantidad;
							});

					chart.scale = d3.scale
						.linear()
						.domain([
							0,
							chart.max
						])
						.range([0, chart.w/2-chart.gap*2]);

					//Update
					chart.svg
						.attr("width", chart.w)
						.attr("height", chart.h);

					chart.selection
						.attr("width", chart.w/2-chart.gap);

					chart.groups = chart.mainGroup
						.selectAll("g.etapa-group")
						.data($scope.obras_by_etapa);

					chart.pipe
						.attr('x1',chart.w/2)
						.attr('x2',chart.w/2);

					chart.groups
						.enter()
						.append("g")
						.attr("id", function(d) {
							return "etapa-group-" + d.slug;
						})
						.classed("etapa-group", true)
						.each(function(d,ix) {
							var group = d3.select(this);

							d.index = ix;

							_.map(d.obras,function(o){
								o.index = ix;
								return o;
							});
							
							group
								.selectAll('rect.etapa-rect')
								.data(d.obras)
								.enter()
								.append("rect")
								.classed("etapa-rect", true)
								.attr("y",chart.barh+chart.gap)
								.attr("height",chart.barh)
								.attr("fill", function(d) {
									return $scope.tipoColors(d.tipo);
								});

							group
								.append("text")
								.datum(d)
								.classed("etapa-text", true)
								.attr("fill", "#000")
								.attr("y", chart.barh)
								.text(function() {
									return d.etapa;
								})
								.attr("text-anchor", function(){
									return (ix==0)?'end':'start';
								});


							group
								.append("rect")
								.datum(d)
								.classed("click-rect", true)
								.attr("fill", "red")
								.attr("fill-opacity", 0)
								.on("click", function(d) {
									$scope.filterFn({filter:d.slug});
								});
						});

					var acum = {
						g0:chart.scale(chart.max)+chart.gap,
						g1:chart.gap
					};

					chart.groups
						.selectAll("rect.etapa-rect")
						.attr("width", function(d) {
							return chart.scale(d.cantidad);
						})
						.attr("x", function(d) {
							var dato = d.cantidad;
							var resp = (d.index==0)?Math.abs(chart.scale(dato)-acum['g'+d.index]):chart.scale(0)+acum['g'+d.index];
							acum['g'+d.index] = (d.index==0)?acum['g'+d.index]-chart.scale(dato):acum['g'+d.index]+chart.scale(dato);
							return resp;
						});

					chart.groups.selectAll("text.etapa-text")
						.attr("x", function(d){
							return (d.index==0)?chart.w/2-chart.gap:chart.gap;
						});
						
					chart.groups
						.selectAll("rect.click-rect")
						.attr("width", chart.w/2)
						.attr("height", chart.barh*2+chart.gap*2);

					chart.groups.transition().attr("transform", function(d,ix) {
						var x = (ix==0)?0:chart.w/2;
						return "translate(" + x + ",0)";
					});
			    }

			    function selectFilter(){
			    	if($scope.selectedFilter){
				    	var target = chart.mainGroup.select('#etapa-group-'+$scope.selectedFilter);
				    	
				    	if(!target.empty()){
				    		var t = d3.transform(target.attr("transform")),
							    x = t.translate[0],
							    y = t.translate[1];
				    		chart.selection
				    			.transition()
				    			.attr('x',x+chart.gap/2)
				    			.attr('y',y+chart.barh+chart.gap/2);
				    	}else{
				    		chart.selection
				    			.transition()
				    			.attr('x',chart.w);
				    	}
			    	} else {
			    		chart.selection
				    			.transition()
				    			.attr('x',chart.w);
			    	}
			    }

			    window.$(window).resize(function() {
				if (w != $(window).width()) {
					clearTimeout($scope.timeoutId);
					$scope.timeoutId = setTimeout(function() {
						renderChart();
					}, 1000);
				}
			});

	        }
	    };
	});