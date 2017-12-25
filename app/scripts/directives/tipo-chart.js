"use strict";

angular.module("obrasMduytApp").directive("tipoChart", function() {
	return {
		restrict: "E",
		scope: {
			obras: "=",
			filterFn: "&",
			finishFn: "&",
			selectedFilter: "=",
			tipoColors: "="
		},
		template:
			"<div id='tipo-chart' class='row chart-item'><div class='col-md-2'><h4>Filtrar por tipo de obra</h4></div></div>",
		replace: true,
		link: function($scope, elm, attrs) {
			var w = 0;

			$(window).load(function() {
				w = $(window).width();
			});

			var data;
			var chart = {};

			$scope.$watch(attrs.obras, function(value) {
				if (value && typeof value == "object") {
					data = value;
					parseData();
				}
			});

			$scope.$watch(attrs.selectedFilter, function(value) {
				if (chart.groups) {
					selectFilter();
				}
			});

			function parseData() {
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

				window.$(window).resize(function() {
					if (w != $(window).width()) {
						clearTimeout($scope.timeoutId);
						$scope.timeoutId = setTimeout(function() {
							renderChart();
						}, 1000);
					}
				});
			}

			function renderChart() {
				chart.w = d3
					.select("#tipo-chart")
					.node()
					.getBoundingClientRect().width;

				chart.margin = chart.w / 100;
				chart.barh = 40;
				chart.gap = 10;

				chart.h =
					$scope.total_obras_by_tipo.length *
						(chart.barh + chart.gap) +
					chart.gap * 2;

				if (!chart.tipo_chart_container) {
					//Create
					chart.tipo_chart_container = d3
						.select("#tipo-chart")
						.append("div")
						.attr("id", "tipo-chart-container")
						.classed("col-md-10", true);
					chart.groups = chart.tipo_chart_container
						.selectAll("div.tipo-group")
						.data($scope.total_obras_by_tipo);

					chart.groups
						.enter()
						.append("div")
						.attr("id", function(d) {
							return "tipo-group-" + d.slug;
						})
						.classed("tipo-group", true)
						.each(function(d) {
							var group = d3.select(this);

							var container = group
								.append("a")
								.datum(d)
								.classed("tipo-container", true)
								.on("click", function(d) {
									$scope.filterFn({ filter: d.slug });
								});

							var imgGroup = container
								.append("div")
								.classed("image-container", true);

							container
								.append("span")
								.datum(d)
								.classed("tipo-text", true)
								.attr("fill", "#fff")
								.text(function() {
									return d.tipo;
								});

							//Load svg inline to change its color
							d3.xml("images/iconos/" + d.slug + ".svg", function(
								error,
								documentFragment
							) {
								if (error) {
									console.error(error);
									return;
								}

								var svgNode = documentFragment.getElementsByTagName(
									"svg"
								)[0];
								//use plain Javascript to extract the node

								imgGroup.node().appendChild(svgNode);
								//d3's selection.node() returns the DOM node, so we
								//can use plain Javascript to append content

								var color = $scope.tipoColors(d.tipo);

								var innerSVG = imgGroup
									.select("svg")
									.attr("height", 50)
									.attr("width", 50);

								innerSVG
									.selectAll("path,rect")
									.attr("fill", color);
							});
						});
				}

				//Update

				$scope.finishFn();
			}

			function selectFilter() {
				if ($scope.selectedFilter) {
					var target = chart.tipo_chart_container.select(
						"#tipo-group-" + $scope.selectedFilter
					);
					if (!target.empty()) {
						chart.tipo_chart_container
							.selectAll(".tipo-group")
							.classed("selected", false);
						target.classed("selected", true);
					} else {
						chart.tipo_chart_container
							.selectAll(".tipo-group")
							.classed("selected", false);
					}
				} else {
					chart.tipo_chart_container
						.selectAll(".tipo-group")
						.classed("selected", false);
				}
			}
		}
	};
});
