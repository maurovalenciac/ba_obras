'use strict';

angular.module('obrasMduytApp')
.directive('tipoChart', function() {
	return {
	        restrict: 'E',
	        scope: {
	            obras: '=',
	            filterFn: '&',
	            finishFn: '&',
	            selectedFilter: '=',
	            tipoColors: '='
	        },
	        template: "<div id='tipo-chart'></div>",
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

			    	var obras_by_tipo = _.groupBy(
						data.filter(function(o) {
							return typeof o.tipo != "undefined";
						}),
						"tipo"
					);

					$scope.total_obras_by_tipo = _.orderBy(
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
					);
					renderChart();
			    }

			    function renderChart(){
			    	chart.w = d3
						.select("#tipo-chart")
						.node()
						.getBoundingClientRect().width;

					chart.margin = chart.w / 100;
					chart.barh = 40;
					chart.gap = 10;

					chart.h = $scope.total_obras_by_tipo.length * (chart.barh+chart.gap) + chart.gap*2;


					if (!chart.svg) {
						//Create
						chart.svg = d3
							.select("#tipo-chart")
							.append("svg");
						chart.mainGroup = chart.svg
							.append("g")
							.classed("main-group", true);
						chart.selection = chart.mainGroup
							.append("rect")
							.classed('selection',true)
							.attr("height", chart.gap+chart.barh)
							.attr('x',-chart.w)
							.attr('y',-chart.gap)
							.attr("fill", "#ffbc00");
					}

					chart.scale = d3.scale
						.linear()
						.domain([
							0,
							d3.max($scope.total_obras_by_tipo, function(to) {
								return to.cantidad;
							})
						])
						.range([0, chart.w - chart.barh*5 - chart.gap*2]);

					//Update
					chart.svg
						.attr("width", chart.w)
						.attr("height", chart.h);

					chart.selection
						.attr("width", chart.w-chart.gap);

					chart.groups = chart.mainGroup
						.selectAll("g.tipo-group")
						.data($scope.total_obras_by_tipo);

					chart.groups
						.enter()
						.append("g")
						.attr("id", function(d) {
							return "tipo-group-" + d.slug;
						})
						.classed("tipo-group", true)
						.each(function(d) {
							var group = d3.select(this);

							group
								.append("rect")
								.datum(d)
								.classed("tipo-rect", true)
								.attr("x",chart.barh*5+chart.gap)
								.attr("fill", function(d) {
									return $scope.tipoColors(d.tipo);
								});

							group
								.append("text")
								.datum(d)
								.classed("tipo-text", true)
								.attr("text-anchor", "end")
								.attr("fill", "#000")
								.attr("x", chart.barh*4)
								.text(function() {
									return d.tipo;
								});

							group
								.append("image")
								.datum(d)
								.classed("tipo-icon", true)
								.attr("x", chart.barh*4+chart.gap/2)
								.attr("y", 0)
								.attr("height", chart.barh)
								.attr("width", chart.barh)
								.attr("xlink:href", function() {
									return "images/iconos/" + d.slug + ".svg";
								});

							group
								.append("rect")
								.datum(d)
								.classed("click-rect", true)
								.attr("fill", "white")
								.attr("fill-opacity", 0)
								.on("click", function(d) {
									$scope.filterFn({filter:d.slug});
								});
						});

					chart.groups
						.selectAll("rect.tipo-rect")
						.attr("height", chart.barh)
						.attr("width", function(d) {
							return chart.scale(d.cantidad);
						});

					chart.groups.selectAll("text.tipo-text")
						.attr("y", function(d) {
							return chart.barh * (2/3);
						});

					chart.groups
						.selectAll("image.tipo-icon")
						.attr("y", function(d) {
							return 0;
						});

					chart.groups
						.selectAll("rect.click-rect")
						.attr("width", chart.w)
						.attr("height", chart.barh);

					var acum = chart.gap;
					chart.groups.transition().attr("transform", function(d) {
						var y = acum;
						acum = acum + chart.gap + chart.barh;
						return "translate(0," + y + ")";
					});

					$scope.finishFn();
			    }

			    function selectFilter(){
			    	if($scope.selectedFilter){
				    	var target = chart.mainGroup.select('#tipo-group-'+$scope.selectedFilter);
				    	if(!target.empty()){
				    		var t = d3.transform(target.attr("transform")),
							    x = t.translate[0],
							    y = t.translate[1];
				    		chart.selection
				    			.transition()
				    			.attr('x',x+chart.gap/2)
				    			.attr('y',y-chart.gap/2);
				    	} else {
				    		chart.selection
				    			.transition()
				    			.attr('x',-chart.w);
				    	}
			    	} else {
			    		chart.selection
				    			.transition()
				    			.attr('x',-chart.w);
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