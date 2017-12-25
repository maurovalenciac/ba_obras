"use strict";

angular.module("obrasMduytApp").directive("areaResponsableChart", function() {
	return {
		restrict: "E",
		scope: {
			obras: "=",
			filterFn: "&",
			selectedFilter: "="
		},
		template:
			"<div id='area-responsable-chart' class='row chart-item'>" +
			"<div class='col-md-2'><h4>Filtrar por área de gobierno</h4></div>" +
			"<div class='col-md-5'>" +
			"<select ng-show='total_obras_by_area' id='areas' class='form-control' ng-model='selected'>" +
			"<option value=''>TODAS</option>" +
			"<option ng-repeat='option in total_obras_by_area' value='{{option.slug}}'>{{option.area}}</option>" +
			"</select>" +
			"</div>" +
			"<div class='col-md-5'><div id='mini-chart'></div><p ng-show='selectedCantidad'>{{selectedCantidad}} obras <span ng-show='selectedCantidad!=total'>({{selectedCantidad*100/total | number:0}}% del total)</span> </p></div>" +
			"</div>",
		replace: true,
		link: function($scope, elm, attrs) {
			var w = 0;

			$(window).load(function() {
				w = $(window).width();
			});

			var data;
			var chart = {};

			$scope.$watch(attrs.obras, function(value) {
				if (value) {
					data = value;
					parseData();
				}
			});

			$scope.$watch(attrs.selectedFilter, function(value) {
				if (chart.groups) {
					selectFilter();
				}
			});

			$scope.selected = "";

			function parseData() {
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

				$scope.total_obras_by_area_key = _.groupBy(
					$scope.total_obras_by_area,
					"slug"
				);

				var select = d3
					.select("#area-responsable-chart #areas")
					.on("change", function(e) {
						var val = d3
							.select("#area-responsable-chart #areas")
							.property("value");
						$scope.filterFn({ filter: val });
					});
				renderChart();
			}

			function renderChart() {
				chart.w = d3
					.select("#area-responsable-chart #mini-chart")
					.node()
					.getBoundingClientRect().width;

				chart.margin = chart.w / 100;
				chart.barh = 27;
				chart.gap = 2;

				chart.h = chart.barh + chart.gap * 2;

				if (!chart.svg) {
					//Create
					chart.svg = d3
						.select("#area-responsable-chart #mini-chart")
						.append("svg");
					chart.mainGroup = chart.svg
						.append("g")
						.classed("main-group", true);
				}

				$scope.total = d3.sum($scope.total_obras_by_area, function(to) {
					return to.cantidad;
				});
				$scope.selectedCantidad = $scope.total;

				chart.scale = d3.scale
					.linear()
					.domain([0, $scope.total])
					.range([
						0,
						chart.w -
							($scope.total_obras_by_area.length + 2 * chart.gap)
					]);

				//Update
				chart.svg.attr("width", chart.w).attr("height", chart.h);

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
							.attr("x", chart.gap);

						group
							.append("rect")
							.datum(d)
							.classed("click-rect", true)
							.attr("x", chart.gap)
							.on("click", function(d) {
								$scope.filterFn({ filter: d.slug });
							});
					});

				chart.groups
					.selectAll("rect.area-rect")
					.attr("height", chart.barh)
					.attr("width", function(d) {
						return chart.scale(d.cantidad);
					});

				chart.groups
					.selectAll("rect.click-rect")
					.attr("height", chart.barh)
					.attr("width", function(d) {
						return chart.scale(d.cantidad);
					});

				var acum = 0;
				chart.groups.transition().attr("transform", function(d) {
					var x = acum;
					acum =
						acum + chart.scale(d.cantidad) + chart.scale(chart.gap);
					return "translate(" + x + ",0)";
				});
			}

			function selectFilter() {
				chart.mainGroup
					.selectAll(".area-rect")
					.classed("selected", false);
				if ($scope.total_obras_by_area_key[$scope.selectedFilter]) {
					$scope.selected = $scope.selectedFilter;
					var target = chart.mainGroup
						.select("#area-group-" + $scope.selectedFilter)
						.select(".area-rect");

					if (!target.empty()) {
						target.classed("selected", true);
					}

					$scope.selectedCantidad =
						$scope.total_obras_by_area_key[
							$scope.selectedFilter
						][0]["cantidad"];
				} else {
					$scope.selected = "";
					$scope.selectedCantidad = $scope.total;
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
