"use strict";

angular
	.module("obrasMduytApp")
	.controller("HomeCtrl", function($scope, DataService, $filter) {
		var d3 = window.d3;

		$scope.pymChild = new window.pym.Child({ polling: 1000 });
		var chart = {};
		var scalechart = {};
		var sankeychart = {};
		var bubbles = {};
		
    $scope.tipo_colors = d3.scale
			.ordinal()
			.range([
				"#036633",
				"#698AC6",
				"#956336",
				"#92C14D",
				"#2B3180",
				"#E3117E",
				"#EF830C",
				"#E31F20"
			]);

		$scope.selectedGroup = "mapa";
		$scope.oldGroup = "mapa";
		$scope.selectedObra = false;

    $scope.selectedFilter = false;

    $scope.availableGroups = [
      {id:"mapa",name:"Mapa"},
      {id:"comunas",name:"Comunas"},
      {id:"montos",name:"Inversión"}
    ];

		$scope.selectedRadioDimension = "monto_contrato";

		$scope.tooltip = d3.select("#tooltip-home-chart");

		var renderFunctions = {
			comunas: renderComunasGroup,
			montos: renderMontosGroup,
			mapa: renderMapGroup
		};

		var prepareNodesFunctions = {
			comunas: prepareNodesComunasGroup,
			montos: prepareNodesMontosGroup,
			mapa: prepareNodesMapGroup
		};

		var resetFunctions = {
			comunas: resetComunas,
			montos: resetMontos,
			mapa: resetMap
		};

		var initialized = {
			comunas: false,
			montos: false,
			mapa: false
		};

		var _ = window._;

		var w = 0;

		$(window).load(function() {
			w = $(window).width();
		});

		DataService.getAll().then(function(data) {

      $scope.obras = data;

		  renderSankeyChart();	
			renderChart();
			window.$(window).resize(function() {
				if (w != $(window).width()) {
					clearTimeout($scope.timeoutId);
					$scope.timeoutId = setTimeout(function() {
						initialized = {
							comunas: false,
							montos: false,
							mapa: false
						};
						renderSankeyChart();
						renderChart();
					}, 1000);
				}
			});
		});

		/** Generic Functions ====================================================== **/

		function renderChart() {
			chart.w = d3
				.select("#home-chart-container")
				.node()
				.getBoundingClientRect().width;

			chart.w = !chart.svg || chart.w < 500 ? chart.w - 15 : chart.w;

			$scope.isSmallDevice = chart.w < 700 ? true : false;

			if ($scope.isSmallDevice) {
				chart.h = chart.w;
				chart.margin = chart.w / 100;
			} else {
				chart.h = chart.w;
				chart.margin = chart.w / 200;
			}

			if (!chart.svg) {
				//Create
				chart.svg = d3.select("#home-chart-container").append("svg");
				chart.mainGroup = chart.svg
					.append("g")
					.classed("main-group", true);
				chart.mainGroup.append("rect").attr("fill", "white");

				chart.svg.append("g").attr("id", "comunas-group");
				chart.svg.append("g").attr("id", "map-group");
				chart.svg.append("g").attr("id", "montos-group");


        bubbles.group = chart.svg
          .append("g")
          .attr("id", "bubbles-group");

        chart.selection = chart.svg.append('circle')
          .attr("class", "selection-cicle")
          .attr('cx',0)
          .attr('cy',0)
          .attr('r',0)
          .style('fill','none')
          .style('stroke','black')
          .style('stroke-width',2);
			}

			//Update
			chart.svg.attr("width", chart.w).attr("height", chart.h);

			chart.mainGroup
				.select("rect")
				.attr("width", chart.w)
				.attr("height", chart.h);

			//default, comunas
			$scope.showGroup();
		}

		function renderScaleChart() {
			scalechart.w = d3
				.select("#scale-chart-container")
				.node()
				.getBoundingClientRect().width;

			scalechart.h = 300;
			scalechart.margin = scalechart.w / 100;

			scalechart.gap = 5;

			scalechart.nFormatter = function(num, digits) {
				var si = [
						/*		    { value: 1E18, symbol: "E" },
		    { value: 1E15, symbol: "P" },
		    { value: 1E12, symbol: "T" },
		    { value: 1E9,  symbol: "G" },*/
						{ value: 1e6, symbol: " millones" },
						{ value: 1e3, symbol: " mil" }
					],
					rx = /\.0+$|(\.[0-9]*[1-9])0+$/,
					i;
				for (i = 0; i < si.length; i++) {
					if (num >= si[i].value) {
						return (
							$filter("currency")(
								(num / si[i].value)
									.toFixed(digits)
									.replace(rx, "$1"),
								"$",
								0
							).replace(/\,/g, ".") + si[i].symbol
						);
					}
				}
				return num.toFixed(digits).replace(rx, "$1");
			};

			if (!scalechart.svg) {
				//Create
				scalechart.svg = d3
					.select("#scale-chart-container")
					.append("svg");
				scalechart.mainGroup = scalechart.svg
					.append("g")
					.classed("main-group", true);
				scalechart.mainGroup.append("rect").attr("fill", "white");
			}

			var legendData;
			if (bubbles.scale) {
				var domain = bubbles.scale.domain();
				var range = bubbles.scale.range();

				//format $
				//var max = $filter('currency')(NN, '$', 0).replace(/\,/g,'.')
				//$filter('currency')((domain[0]+domain[1])/2, '$', 0).replace(/\,/g,'.')

				legendData = [
					{
						legend: scalechart.nFormatter(domain[1], 0),
						radius: scalechart.w / 8
					},
					{
						legend: scalechart.nFormatter(
							(domain[0] + domain[1]) / 2,
							0
						),
						radius: scalechart.w / 12
					},
					{
						legend: scalechart.nFormatter(domain[0], 0),
						radius: scalechart.w / 16
					}
				];
			} else {
				legendData = [{ legend: "Obra", radius: 10 }];
			}

			//Update

			scalechart.groups = scalechart.mainGroup
				.selectAll("g.legend-group")
				.data(legendData);

			scalechart.groups
				.enter()
				.append("g")
				.attr("id", function(d, i) {
					return "legend-group-" + i;
				})
				.classed("legend-group", true)
				.each(function(d) {
					var group = d3.select(this);

					group
						.append("circle")
						.datum(d)
						.classed("legend-circle", true)
						.attr("fill", "#B5B5B5");

					group
						.append("text")
						.datum(d)
						.classed("legend-text", true)
						.attr("fill", "#000");
				});

			scalechart.groups.each(function(d) {
				var group = d3.select(this);

				group.select("circle").datum(d);

				group.select("text").datum(d);
			});

			scalechart.groups.exit().remove();

			var acum = 0;

			scalechart.groups.transition().attr("transform", function(d) {
				var y = acum;
				acum += scalechart.gap + d.radius * 2;
				return "translate(0," + y + ")";
			});

			var maxRadius = d3.max(legendData, function(d) {
				return d.radius;
			});

			scalechart.groups
				.selectAll("circle.legend-circle")
				.attr("cy", function(d) {
					return d.radius;
				})
				.attr("cx", function(d) {
					return maxRadius;
				})
				.attr("r", function(d) {
					return d.radius;
				});

			scalechart.groups
				.selectAll("text.legend-text")
				.attr("text-anchor", "start")
				.attr("x", function(d) {
					return maxRadius * 2 + 3;
				})
				.attr("y", function(d) {
					return d.radius + 5;
				})
				.style("opacity", 0)
				.text(function(d) {
					return d.legend;
				})
				.transition()
				.style("opacity", 1);

			scalechart.svg.attr("width", scalechart.w).attr("height", acum);

			scalechart.mainGroup
				.select("rect")
				.attr("width", scalechart.w)
				.attr("height", acum);
		}

		function sortItems($items, itemW, itemH) {
			var xLimit = Math.floor(chart.w / itemW),
				xCount = 0,
				yCount = 0;

			$items.transition().duration(700).attr("transform", function(d, i) {
				var x = xCount * itemW;
				var y = yCount * itemH;
				if (xCount < xLimit - 1) {
					xCount++;
				} else if ($items[0].length !== i + 1) {
					xCount = 0;
					yCount++;
				}

				return "translate(" + x + "," + y + ")";
			});
		}

    $scope.tipoChartFinished = function(){
      console.log('$scope.tipoChartFinished');
      //renderSankeyChart();
      //renderChart();
      /*bubbles.circles
        .style("fill", function(d) {
          return $scope.tipo_colors(d.data.tipo);
        });*/
    }

    $scope.filterBubbles = function(filterSlug) {

      if($scope.selectedFilter == filterSlug){
        d3.selectAll("circle.obra").style("opacity", 1);
        filterSlug = false;
      } else {
        d3
          .selectAll("circle.obra")
          .style("opacity", 0.3);
        d3
          .selectAll("circle.obra." + filterSlug)
          .style("opacity", 1);
      }
      $scope.selectedFilter = filterSlug;
      $scope.closeTooltip();
      $scope.$apply();
    }

    $scope.changeGroup = function(group) {
      $scope.selectedGroup=group;
      $scope.showGroup();
    }

		$scope.showGroup = function() {
			if ($scope.oldGroup !== $scope.selectedGroup) {
				$scope.closeTooltip();
				resetFunctions[$scope.oldGroup](true);
				chart.svg
					.selectAll(".child")
					.style("opacity", 0)
					.style("display", "none");
				chart.svg
					.selectAll("circle.obra")
					.transition()
					.style("opacity", 0.5);
				$scope.oldGroup = $scope.selectedGroup;
			}

			renderFunctions[$scope.selectedGroup]();

			var time =
				initialized[$scope.selectedGroup] ||
				$scope.selectedGroup === "mapa"
					? 100
					: 2000;
			initialized[$scope.selectedGroup] = true;

			setTimeout(function() {
				prepareNodesFunctions[$scope.selectedGroup]();
				renderBubbles();
			}, time);
		};

		function renderSankeyChart() {
			sankeychart.w = d3
				.select("#sankey-chart-container")
				.node()
				.getBoundingClientRect().width;

			sankeychart.w =
				!sankeychart.svg || sankeychart.w < 500
					? sankeychart.w - 15
					: sankeychart.w;

			sankeychart.h = 700;
			sankeychart.margin = sankeychart.w / 100;

			// the function for moving the nodes
			function dragmove(d) {
				d3
					.select(this)
					.attr(
						"transform",
						"translate(" +
							d.x +
							"," +
							(d.y = Math.max(
								0,
								Math.min(sankeychart.h - d.dy, d3.event.y)
							)) +
							")"
					);

				sankeychart.sankey.relayout();

				sankeychart.link.attr("d", sankeychart.path);
			}

			function prepareSankeyData() {
				//set up graph in same style as original example but empty
				var graph = { nodes: [], links: [] };

				var data = [];

				var temp = d3
					.nest()
					.key(function(d) {
						return d.comuna;
					})
					.rollup(function(hojasComuna) {
						return {
							cantidad: hojasComuna.length,
							hijos: d3
								.nest()
								.key(function(d) {
									return d.tipo;
								})
								.rollup(function(hojasTipo) {
									return {
										cantidad: hojasTipo.length,
										hijos: d3
											.nest()
											.key(function(d) {
												return d.etapa;
											})
											.rollup(function(hojasEtapa) {
												return {
													cantidad: hojasEtapa.length,
													hijos: hojasEtapa
												};
											})
											.map(
												hojasTipo.filter(function(d) {
													return d.etapa != "";
												})
											)
									};
								})
								.map(
									hojasComuna.filter(function(d) {
										return d.tipo != "";
									})
								)
						};
					})
					.map(
						$scope.obras.filter(function(d) {
							return d.comuna && d.tipo && d.etapa;
						})
					);

				_.each(temp, function(c, comuna) {
					_.each(c.hijos, function(t, tipo) {
						data.push({
							source: comuna,
							target: tipo,
							value: t.cantidad
						});
						_.each(t.hijos, function(e, etapa) {
							data.push({
								source: tipo,
								target: etapa,
								value: e.cantidad
							});
						});
					});
				});

				var links = {};

				data.forEach(function(d) {
					graph.nodes.push({ name: d.source });
					graph.nodes.push({ name: d.target });

					if (!links[d.source + "|" + d.target]) {
						links[d.source + "|" + d.target] = {
							source: d.source,
							target: d.target,
							value: 0
						};
					}

					links[d.source + "|" + d.target].value += d.value;

					/*graph.links.push({ "source": d.source,
		                         "target": d.target,
		                         "value": +d.value });*/
				});

				_.forOwn(links, function(value, key) {
					graph.links.push(value);
				});

				// return only the distinct / unique nodes
				graph.nodes = d3.keys(
					d3
						.nest()
						.key(function(d) {
							return d.name;
						})
						.map(graph.nodes)
				);

				// loop through each link replacing the text with its index from node
				graph.links.forEach(function(d, i) {
					graph.links[i].source = graph.nodes.indexOf(
						graph.links[i].source
					);
					graph.links[i].target = graph.nodes.indexOf(
						graph.links[i].target
					);
				});

				//now loop through each nodes to make nodes an array of objects
				// rather than an array of strings
				graph.nodes.forEach(function(d, i) {
					graph.nodes[i] = { "node:": i, name: d };
				});

				return graph;
			}

			if (!sankeychart.svg) {
				//Create
				sankeychart.svg = d3
					.select("#sankey-chart-container")
					.append("svg");
				sankeychart.mainGroup = sankeychart.svg
					.append("g")
					.classed("main-group", true);
				sankeychart.mainGroup.append("rect").attr("fill", "white");
			}

			//Update
			sankeychart.svg
				.attr("width", sankeychart.w)
				.attr("height", sankeychart.h);

			sankeychart.mainGroup
				.select("rect")
				.attr("width", sankeychart.w)
				.attr("height", sankeychart.h);

			sankeychart.sankey = d3
				.sankey()
				.nodeWidth(20)
				.nodePadding(2)
				.size([sankeychart.w, sankeychart.h]);

			sankeychart.path = sankeychart.sankey.link();

			sankeychart.graph = prepareSankeyData();

			//render
			sankeychart.sankey
				.nodes(sankeychart.graph.nodes)
				.links(sankeychart.graph.links)
				.layout(32);

			sankeychart.link = sankeychart.mainGroup
				.selectAll(".link")
				.data(sankeychart.graph.links)
				.enter()
				.append("path")
				.attr("class", "link")
				.attr("d", sankeychart.path)
				.style("stroke-width", function(d) {
					return Math.max(1, d.dy);
				})
				.style("stroke", function(d) {
					return $scope.tipo_colors.domain().indexOf(d.source.name) > -1
						? $scope.tipo_colors(d.source.name)
						: $scope.tipo_colors(d.target.name);
				})
				.sort(function(a, b) {
					return b.dy - a.dy;
				});

			// add the link titles
			sankeychart.link.append("title").text(function(d) {
				var from = isNaN(d.source.name)
					? d.source.name
					: "Comuna " + d.source.name;
				return from + " → " + d.target.name + "\nObras: " + d.value;
			});

			// add in the nodes
			sankeychart.node = sankeychart.mainGroup
				.selectAll(".node")
				.data(sankeychart.graph.nodes)
				.enter()
				.append("g")
				.attr("class", "node")
				.attr("transform", function(d) {
					return "translate(" + d.x + "," + d.y + ")";
				});

			// add the rectangles for the nodes
			sankeychart.node
				.append("rect")
				.attr("height", function(d) {
					return d.dy;
				})
				.attr("width", sankeychart.sankey.nodeWidth())
				.style("fill", function(d) {
					return $scope.tipo_colors.domain().indexOf(d.name) > -1
						? $scope.tipo_colors(d.name)
						: "#000";
				})
				.append("title")
				.text(function(d) {
					var name = isNaN(d.name) ? d.name : "Comuna " + d.name;
					name += "\nObras: " + d.value;
					return name;
				});

			// add in the title for the nodes
			sankeychart.node
				.append("text")
				.attr("y", function(d) {
					return d.dy / 2;
				})
				.attr("x", function(d) {
					return isNaN(d.name)
						? -3
						: 3 + sankeychart.sankey.nodeWidth();
				})
				.attr("text-anchor", function(d) {
					return isNaN(d.name) ? "end" : "start";
				})
				.attr("dy", ".35em")
				.attr("transform", null)
				.style("font-size", function(d) {
					return isNaN(d.name) ? "14px" : "10px";
				})
				.text(function(d) {
					return d.name;
				})
				.filter(function(d) {
					return d.x < sankeychart.width / 2;
				});

			//default, comunas
			//$scope.showGroup($scope.selectedGroup);
		}

		/** MAPA Functions ====================================================== **/

		function renderMapGroup() {
			chart.mapProjection = d3.geo
				.mercator()
				.center([-58.43992, -34.618])
				.translate([chart.w / 2, chart.h / 2])
				.scale(240 * chart.w);

			chart.mapPath = d3.geo.path().projection(chart.mapProjection);

			function updateMap() {
				if ($scope.isSmallDevice) {
					chart.svg.attr("height", chart.w);
				}

				chart.mapGroup
					.selectAll("path.map-item")
					.style("display", "block")
					.style("stroke-width", 0)
					.transition()
					.duration(1000)
					.style("stroke-width", 3)
					.attr("d", chart.mapPath)
					.style("opacity", 1);
			}

			if (!chart.mapGroup) {
				chart.mapGroup = chart.svg.select("#map-group");

				d3.json("geo/comunas.simple.geojson", function(data) {
					chart.mapCentroids = {};

					chart.mapFeatures = data.features;

					_.each(chart.mapFeatures, function(f) {
						chart.mapCentroids[
							"mapa-comuna-" + f.properties.comuna
						] = chart.mapPath.centroid(f);
					});

					chart.mapGroup
						.selectAll("path.map-item")
						.data(chart.mapFeatures)
						.enter()
						.append("path")
						.classed("child", true)
						.classed("map-item", true)
						.attr("id", function(d) {
							return "mapa-comuna-" + d.properties.comuna;
						})
						.classed("shape", true)
						.on("click", clickedMap);

					updateMap();
				});
			} else {
				updateMap();
			}
		}

		function prepareNodesMapGroup() {
			bubbles.clusters = {};
			bubbles.clusterPoints = {};

			bubbles.nodesComuna = [];

			bubbles.nodes = $scope.obras
				.filter(function(d) {
					return d.lat && d.lng;
				})
				.map(function(d) {
					var i = "i" + d.id,
						r = 4,
						c = { cluster: i, radius: r, data: d };

					bubbles.clusters[i] = c;

					var point = chart.mapProjection([
						parseFloat(d.lng),
						parseFloat(d.lat)
					]);

					bubbles.clusterPoints[i] = {
						x: point[0],
						y: point[1],
						radius: 4
					};

					return c;
				});

			bubbles.scale = false;
			//renderScaleChart();
		}

		var activeMap = d3.select(null);
		function clickedMap(d) {
			$scope.closeTooltip();
			if (activeMap.node() === this) {
				return resetMap();
			}
			activeMap.classed("active", false);
			activeMap = d3.select(this).classed("active", true);

			var bounds = chart.mapPath.bounds(d),
				dx = bounds[1][0] - bounds[0][0],
				dy = bounds[1][1] - bounds[0][1],
				x = (bounds[0][0] + bounds[1][0]) / 2,
				y = (bounds[0][1] + bounds[1][1]) / 2,
				scale = 0.9 / Math.max(dx / chart.w, dy / chart.h),
				translate = [chart.w / 2 - scale * x, chart.h / 2 - scale * y];

			chart.mapGroup
				.transition()
				.duration(750)
				.attr(
					"transform",
					"translate(" + translate + ")scale(" + scale + ")"
				);

			chart.mapGroup
				.selectAll("path")
				.transition()
				.duration(750)
				.style("stroke-width", 1 + "px");

			bubbles.group
				.transition()
				.duration(750)
				.attr(
					"transform",
					"translate(" + translate + ")scale(" + scale + ")"
				);
		}

		function resetMap() {
			activeMap.classed("active", false);
			activeMap = d3.select(null);

			chart.mapGroup.transition().duration(750).attr("transform", "");

			chart.mapGroup
				.selectAll("path")
				.transition()
				.duration(750)
				.style("stroke-width", "3px");

			bubbles.group.transition().duration(750).attr("transform", "");
		}

		/** COMUNAS Functions ====================================================== **/

		function renderComunasGroup(clear) {
			var comunas = d3.range(1, 16);

			var itemH, itemW;
			if ($scope.isSmallDevice) {
				itemH = chart.w;
				itemW = chart.w;
				chart.svg.attr("height", comunas.length * chart.w);
				chart.mainGroup
					.select("rect")
					.attr("height", comunas.length * chart.w);
			} else {
				itemH = chart.h / 3;
				itemW = chart.w / 5;
			}

			if (!chart.comunasGroup) {
				chart.comunasGroup = chart.svg.select("#comunas-group");

				chart.comunasGroup
					.selectAll("g.comunas-item")
					.data(comunas)
					.enter()
					.append("g")
					.classed("child", true)
					.classed("comunas-item", true)
					.style("opacity", 0)
					.attr("transform", function(d, i) {
						return (
							"translate(" +
							(chart.w / 2 - itemW / 2) +
							"," +
							(chart.h / 2 - itemH / 2) +
							")"
						);
					})
					.attr("id", function(d) {
						return "comunas-item-" + d;
					})
					.each(function() {
						var group = d3.select(this);

						group
							.append("rect")
							.classed("comunas-item-frame", true)
							.on("click", clickedComunas);

						group
							.append("text")
							.classed("comunas-item-text", true)
							.attr("fill", "#000")
							.text(function(d) {
								return "Comuna " + d;
							});
					});
			}

			if (!clear) {
				chart.comunasGroup
					.selectAll("g.comunas-item")
					.style("display", "block");
			}

			//update
			chart.comunasGroup
				.selectAll("rect.comunas-item-frame")
				.transition()
				.duration(700)
				.attr("x", chart.margin)
				.attr("y", chart.margin)
				.attr("height", itemH - chart.margin * 2)
				.attr("width", itemW - chart.margin * 2);

			chart.comunasGroup
				.selectAll("text.comunas-item-text")
				.transition()
				.duration(700)
				.attr("x", 15)
				.attr("y", 25);

			sortItems(
				chart.comunasGroup
					.selectAll("g.comunas-item")
					.transition()
					.duration(1000)
					.style("opacity", 1),
				itemW,
				itemH
			);
		}

		function prepareNodesComunasGroup(comunaID) {
			bubbles.clusters = {};
			bubbles.clusterPoints = {};

			var filterId = comunaID
				? comunaID.replace("comunas-item-", "")
				: false;

			var filtered = $scope.obras.filter(function(d) {
				return (
					d.comuna &&
					d.comuna != "" &&
					(!filterId || (filterId && d.comuna === filterId))
				);
			});

			var max = Math.ceil(
				d3.max(filtered, function(d) {
					return d[$scope.selectedRadioDimension];
				})
			);
			var min = Math.floor(
				d3.min(filtered, function(d) {
					return d[$scope.selectedRadioDimension];
				})
			);

			bubbles.scale = d3.scale
				.linear()
				.domain([parseInt(min), parseInt(max)])
				.range([10, filterId ? 100 : 50]);

			//renderScaleChart();

			bubbles.nodes = filtered
				.filter(function(d) {
					return (
						d.comuna &&
						(!filterId || (filterId && d.comuna === filterId))
					);
				})
				.map(function(d) {
					var i = "c" + d.comuna,
						r = filterId ? 10 : 5,
						/*r = bubbles.scale(
							d[$scope.selectedRadioDimension]
								? d[$scope.selectedRadioDimension]
								: 0
						),*/
						c = { cluster: i, radius: r ? r : 10, data: d };

					if (
						!bubbles.clusters[i] ||
						r > bubbles.clusters[i].radius
					) {
						bubbles.clusters[i] = c;
					}

					return c;
				});

			d3.selectAll("g.comunas-item").each(function(d) {
				var g = d3.select(this);
				var rect = g.select("rect");

				bubbles.clusterPoints["c" + d] = {
					x:
						d3.transform(g.attr("transform")).translate[0] +
						rect.attr("width") / 2,
					y:
						d3.transform(g.attr("transform")).translate[1] +
						rect.attr("height") / 2,
					radius: 20
				};
			});
		}

		var activeComuna = d3.select(null);
		function clickedComunas(d) {
			if (!$scope.isSmallDevice) {
				$scope.closeTooltip();
				if (activeComuna.node() === this) {
					return resetComunas();
				}
				activeComuna.classed("active", false);
				activeComuna = d3.select(this).classed("active", true);

				var selectedG = activeComuna.node().parentNode;

				d3
					.selectAll("g.comunas-item")
					.transition()
					.style("opacity", function() {
						return this === selectedG ? 1.0 : 0;
					})
					.each("end", function() {
						if (this !== selectedG) {
							d3.select(this).style("display", "none");
						}
					});

				activeComuna
					.transition()
					.duration(750)
					.attr("height", chart.h - chart.margin * 2)
					.attr("width", chart.w - chart.margin * 2);

				d3
					.select(selectedG)
					.transition()
					.duration(750)
					.attr("transform", "translate(0,0)")
					.each("end", function() {
						prepareNodesComunasGroup(
							d3.select(selectedG).attr("id")
						);
						renderBubbles();
					});
			}
		}

		function resetComunas(clear) {
			activeComuna.classed("active", false);

			activeComuna = d3.select(null);

			d3.selectAll("g.comunas-item").style("display", "block");

			renderComunasGroup(clear);

			if (!clear) {
				setTimeout(function() {
					prepareNodesComunasGroup();
					renderBubbles();
				}, 2000);
			}
		}

		/* MONTOS Functions ====================================================== */

		function renderMontosGroup(clear) {

			var montos = [
				"monto_0_50",
				"monto_50_100",
				"monto_100_150",
				"monto_mas_50"
			];
			var montos_string = {
				"monto_0_50":"Hasta 50 millones",
				"monto_50_100": "50  a 100 millones",
				"monto_100_150": "100 a 150 millones",
				"monto_mas_50": "Más de 150 millones"
			};

			var itemH, itemW;
			if ($scope.isSmallDevice) {
				itemH = chart.w;
				itemW = chart.w;
				chart.svg.attr("height", montos.length * chart.w);
				chart.mainGroup
					.select("rect")
					.attr("height", montos.length * chart.w);
			} else {
				itemH = chart.h / 2;
				itemW = chart.w / 2;
			}

			if (!chart.montosGroup) {
				chart.montosGroup = chart.svg.select("#montos-group");

				chart.montosGroup
					.selectAll("g.montos-item")
					.data(montos)
					.enter()
					.append("g")
					.classed("child", true)
					.classed("montos-item", true)
					.style("opacity", 0)
					.attr("transform", function(d, i) {
						return (
							"translate(" +
							(chart.w / 2 - itemW / 2) +
							"," +
							(chart.h / 2 - itemH / 2) +
							")"
						);
					})
					.attr("id", function(d) {
						return "montos-item-" + d;
					})
					.each(function() {
						var group = d3.select(this);

						group
							.append("rect")
							.classed("montos-item-frame", true)
							.on("click", clickedMontos);

						group
							.append("text")
							.classed("montos-item-text", true)
							.attr("fill", "#000")
							.text(function(d) {
								return montos_string[d];
							});
					});
			}

			if (!clear) {
				chart.montosGroup
					.selectAll("g.montos-item")
					.style("display", "block");
			}

			//update
			chart.montosGroup
				.selectAll("rect.montos-item-frame")
				.transition()
				.duration(700)
				.attr("x", chart.margin)
				.attr("y", chart.margin)
				.attr("height", itemH - chart.margin * 2)
				.attr("width", itemW - chart.margin * 2);

			chart.montosGroup
				.selectAll("text.montos-item-text")
				.transition()
				.duration(700)
				.attr("x", 15)
				.attr("y", 25);

			sortItems(
				chart.montosGroup
					.selectAll("g.montos-item")
					.transition()
					.duration(1000)
					.style("opacity", 1),
				itemW,
				itemH
			);
		}

		function prepareNodesMontosGroup(montoID) {
			bubbles.clusters = {};
			bubbles.clusterPoints = {};


			var filterId = montoID
				? montoID.replace("montos-item-", "")
				: false;

			var filtered = $scope.obras.filter(function(d) {
				return (
					d.monto_contrato &&
					d.monto_contrato != "" &&
					(!filterId || (filterId && d.monto_slug === filterId))
				);
			});

			var max = Math.ceil(
				d3.max(filtered, function(d) {
					return d[$scope.selectedRadioDimension];
				})
			);
			var min = Math.floor(
				d3.min(filtered, function(d) {
					return d[$scope.selectedRadioDimension];
				})
			);

			bubbles.scale = d3.scale
				.linear()
				.domain([parseInt(min), parseInt(max)])
				.range([10, filterId ? 100 : 50]);


			bubbles.nodes = filtered.map(function(d) {
				var i = "m-" + d.monto_slug,
					r = filterId ? 10 : 5,
					c = { cluster: i, radius: r ? r : 10, data: d };

				if (!bubbles.clusters[i] || r > bubbles.clusters[i].radius) {
					bubbles.clusters[i] = c;
				}

				return c;
			});

			if (!filterId) {
				d3.selectAll("g.montos-item").each(function(d) {
					var g = d3.select(this);
					var rect = g.select("rect");

					bubbles.clusterPoints["m-" + d] = {
						x:
							d3.transform(g.attr("transform")).translate[0] +
							rect.attr("width") / 2,
						y:
							d3.transform(g.attr("transform")).translate[1] +
							rect.attr("height") / 2,
						radius: 10
					};
				});
			} else {
				bubbles.clusterPoints = false;
			}

		}

		var activeMonto = d3.select(null);
		
		function resetMontos(clear) {
			activeMonto.classed("active", false);

			activeMonto = d3.select(null);

			d3.selectAll("g.montos-item").style("display", "block");

			renderMontosGroup(clear);

			if (!clear) {
				setTimeout(function() {
					prepareNodesMontosGroup();
					renderBubbles();
				}, 2000);
			}
		}

		function clickedMontos(d) {
			if (!$scope.isSmallDevice) {
				$scope.closeTooltip();
				if (activeMonto.node() === this) {
					return resetMontos();
				}
				activeMonto.classed("active", false);
				activeMonto = d3.select(this).classed("active", true);

				var selectedG = activeMonto.node().parentNode;

				d3
					.selectAll("g.montos-item")
					.transition()
					.style("opacity", function() {
						return this === selectedG ? 1.0 : 0;
					})
					.each("end", function() {
						if (this !== selectedG) {
							d3.select(this).style("display", "none");
						}
					});

				activeMonto
					.transition()
					.duration(750)
					.attr("height", chart.h - chart.margin * 2)
					.attr("width", chart.w - chart.margin * 2);

				d3
					.select(selectedG)
					.transition()
					.duration(750)
					.attr("transform", "translate(0,0)")
					.each("end", function() {
						prepareNodesMontosGroup(
							d3.select(selectedG).attr("id")
						);
						renderBubbles();
					});
			}
		}

		/* Bubble functions ====================================================== */

		function renderBubbles() {
			bubbles.force = d3.layout
				.force()
				.nodes(bubbles.nodes)
				.size([chart.w, chart.h])
				.gravity(0)
				.charge(1)
				.on("tick", tick)
				.start();

			bubbles.circles = bubbles.group
				.selectAll("circle.obra")
				.data(bubbles.nodes);

			if(!$scope.isSmallDevice){
				bubbles.circles
					.enter()
					.append("circle")
					.attr("class", function(d) {
						return "obra " + d.data.tipo_slug + " " + d.data.area_slug;
					})
					.on("mouseenter", function(d) {
						d.color_tipo_obra = $scope.tipo_colors(d.data.tipo);
						$scope.selectedObra = d;
						$scope.$apply();
            var current = d3.select(this);
            chart.selection
              .attr('cx',current.attr('cx'))
              .attr('cy',current.attr('cy'))
              .attr('r',0)
              .style('stroke',d.color_tipo_obra)
              .transition()
              .duration(500)
              .attr('r',13)
              .style('opacity',1);

						$scope.tooltip
							.style("width", "250px")
							.transition()
							.duration(200)
							.style("left", d3.event.pageX + "px")
							.style("top", d3.event.pageY + "px")
							.style("opacity", 1);
					})
					.on("mouseout", function(d) {
						
					})
			}
			if($scope.isSmallDevice){
				bubbles.circles
					.enter()
					.append("circle")
					.attr("class", function(d) {
						return "obra " + d.data.tipo_slug;
					})
					.on("click", function(d) {
								d.color_tipo_obra = $scope.tipo_colors(d.data.tipo);
								$scope.selectedObra = d;
                d3.selectAll('circle.obra').style('opacity',0.3);
                d3.select(this).style('opacity',1);
								$scope.$apply();
									$scope.tooltip
										.style("width", chart.w - 20 + "px")
										.transition()
										.duration(200)
										.style("left", "10px")
										.style("top", d3.event.pageY + "px")
										.style("opacity", 1);
					})
			}

			bubbles.circles
				.attr("id", function(d) {
					return "e" + d.data.id;
				})
        .style("fill", function(d) {
          return $scope.tipo_colors(d.data.tipo);
        });

			bubbles.circles
				.transition()
				.style("opacity", 1)
				.attr("r", function(d) {
					return d.radius;
				});

			bubbles.circles.exit().remove();

      $scope.filterBubbles($scope.selectedFilter);

		}

		function tick(e) {
			bubbles.circles
				.each(cluster(10 * e.alpha * e.alpha))
				.each(collide(0.2))
				.attr("cx", function(d) {
					return d.x;
				})
				.attr("cy", function(d) {
					return d.y;
				});

		}

		// Move d to be adjacent to the cluster node.
		function cluster(alpha) {
			return function(d) {
				var cluster = bubbles.clusters[d.cluster];
				var k = 1;

				if (cluster) {
					// For cluster nodes, apply custom gravity.
					if (cluster === d) {
						if (bubbles.clusterPoints) {
							cluster = bubbles.clusterPoints[d.cluster];

							cluster = {
								x: cluster.x,
								y: cluster.y,
								radius: -cluster.radius
							};
							k = 5 * Math.sqrt(d.radius);
						} else {
							cluster = {
								x: chart.w / 2,
								y: chart.h / 2,
								radius: -d.radius
							};
							k = Math.sqrt(d.radius);
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
				var r = d.radius + 2,
					nx1 = d.x - r,
					nx2 = d.x + r,
					ny1 = d.y - r,
					ny2 = d.y + r;
				quadtree.visit(function(quad, x1, y1, x2, y2) {
					if (quad.point && quad.point !== d) {
						var x = d.x - quad.point.x,
							y = d.y - quad.point.y,
							l = Math.sqrt(x * x + y * y),
							r = d.radius + quad.point.radius + 2;
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

		$scope.closeTooltip = function() {
      chart.selection
        .transition()
        .duration(200)
        .attr('r',0)
        .style('opacity',0);
			$scope.tooltip
        .transition()
        .duration(200)
        .style("top", "-100px")
        .style("opacity", 0);
		};
	});
