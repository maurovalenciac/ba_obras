'use strict';

angular.module('obrasMduytApp')
.directive('areaResponsableChart', function() {
	return {
	        restrict: 'E',
	        scope: {
	            obras: '=',
	            filterFn: '&',
	            selectedFilter: '='
	        },
	        template: "<div id='area-responsable-chart'></div>",
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

			    	var obras_by_area = _.groupBy(
						data.filter(function(o) {
							return typeof o.area_responsable != "undefined";
						}),
						"area_responsable"
					);

					$scope.total_obras_by_area = _.orderBy(
						_.reduce(
							obras_by_area,
							function(result, value, key) {
								result.push({
									area: key,
									slug: value[0].area_slug,
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
						.select("#area-responsable-chart")
						.node()
						.getBoundingClientRect().width;

					chart.margin = chart.w / 100;
					chart.barh = 20;
					chart.gap = 10;

					chart.h = $scope.total_obras_by_area.length * (chart.barh+chart.gap) + chart.gap*2;


					if (!chart.svg) {
						//Create
						chart.svg = d3
							.select("#area-responsable-chart")
							.append("svg");
						chart.mainGroup = chart.svg
							.append("g")
							.classed("main-group", true);
						chart.selection = chart.mainGroup
							.append("rect")
							.classed('selection',true)
							.attr("height", chart.gap+chart.barh)
							.attr('x',chart.w)
							.attr('y',-chart.gap)
							.attr("fill", "#ffbc00");
					}

					chart.scale = d3.scale
						.linear()
						.domain([
							0,
							d3.max($scope.total_obras_by_area, function(to) {
								return to.cantidad;
							})
						])
						.range([0, chart.w - chart.gap*2]);

					//Update
					chart.svg
						.attr("width", chart.w)
						.attr("height", chart.h);

					chart.selection
						.attr("width", chart.w-chart.gap);

					chart.groups = chart.mainGroup
						.selectAll("g.area-group")
						.data($scope.total_obras_by_area);

					chart.groups
						.enter()
						.append("g")
						.attr("id", function(d) {
							return "area-group-" + d.slug;
						})
						.classed("area-group", true)
						.each(function(d) {
							var group = d3.select(this);

							group
								.append("rect")
								.datum(d)
								.classed("area-rect", true)
								.attr("x",chart.gap)
								.attr("fill", function(d) {
									return '#ccc';
								});

							group
								.append("text")
								.datum(d)
								.classed("area-text", true)
								.attr("fill", "#000")
								.attr("x", chart.gap*1.5)
								.text(function() {
									return d.area;
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
						.selectAll("rect.area-rect")
						.attr("height", chart.barh)
						.attr("width", function(d) {
							return chart.scale(d.cantidad);
						});

					chart.groups.selectAll("text.area-text")
						.attr("y", function(d) {
							return chart.barh * (2/3)+2;
						});

					chart.groups
						.selectAll("image.area-icon")
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
			    }

			    function selectFilter(){
			    	if($scope.selectedFilter){
				    	var target = chart.mainGroup.select('#area-group-'+$scope.selectedFilter);
				    	
				    	if(!target.empty()){
				    		var t = d3.transform(target.attr("transform")),
							    x = t.translate[0],
							    y = t.translate[1];
				    		chart.selection
				    			.transition()
				    			.attr('x',x+chart.gap/2)
				    			.attr('y',y-chart.gap/2);
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