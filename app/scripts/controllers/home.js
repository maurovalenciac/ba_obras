'use strict';

angular.module('obrasMduytApp')
  .controller('HomeCtrl', function ($scope,DataService,$filter) {

	var d3 = window.d3;

	$scope.pymChild = new window.pym.Child({ polling: 1000 });
	var chart = {};
	var sidechart = {};
	var scalechart = {};
	var sankeychart = {};
	var bubbles = {};
	var tipo_colors = d3.scale.ordinal()
	  .range(['#A5E668', '#678DD8' , '#F94745','#EE73A7','#FF8F12','#00BDB7','#FFD500']);
	$scope.selectedGroup = 'comunas';
	$scope.selectedObra = false;

	$scope.tooltip = d3.select("#tooltip-home-chart");

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

	var resetFunctions = {
		'comunas':resetComunas,
		'etapas':resetEtapas,
		'map':resetMap
	};

	var initialized = {
		'comunas':false,
		'etapas':false,
		'map':false
	};

	var _ = window._;

	var w = 0;
 
	$( window ).load( function(){

	   w = $( window ).width();

	});

	DataService.getAll()
	.then(function(data){
		$scope.obras = data;
		
		$scope.obras_by_tipo = _.groupBy(data,'tipo');
		$scope.tipo_keys = _.keys($scope.obras_by_tipo);
		
		$scope.total_obras_by_tipo = _.reduce($scope.obras_by_tipo, function(result, value, key) {
		  result.push({'tipo':key,'slug':value[0].tipo_slug,'candidad':value.length});
		  return result;
		}, []);

		renderSideChart();
		renderSankeyChart();
		renderChart();
		window.$(window).resize(function() {

			if( w != $( window ).width() ){
				clearTimeout($scope.timeoutId);
				$scope.timeoutId = setTimeout(function(){
					renderSideChart();
					renderSankeyChart();
					renderChart();
					initialized = {
						'comunas':false,
						'etapas':false,
						'map':false
					};
				}, 1000);
			}
		});
	});


	/** Generic Functions ====================================================== **/

	function renderChart(){

		//chart.w = $('#home-chart-container').width();
		chart.w = d3.select('#home-chart-container').node().getBoundingClientRect().width;

		chart.w = (!chart.svg ||  (chart.w<500) )?chart.w-15:chart.w;

		$scope.isSmallDevice = (chart.w<700)?true:false;
		
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


	function renderSideChart(){

		sidechart.w = d3.select('#side-chart-container').node().getBoundingClientRect().width;

		sidechart.h = 400;
		sidechart.margin = sidechart.w/100;

		sidechart.gap = 2;

		if(!sidechart.svg) {

			//Create
			sidechart.svg = d3.select('#side-chart-container').append('svg');
			sidechart.mainGroup = sidechart.svg.append('g').classed('main-group',true);
			sidechart.mainGroup.append('rect').attr('fill','white');
			
		}
		
		sidechart.scale = d3.scale.linear()
			.domain([0,$scope.obras.length])
			.range([0,sidechart.h - (($scope.total_obras_by_tipo.length-1)*sidechart.gap) ]);
		
		//Update
		sidechart.svg
			.attr('width',sidechart.w)
			.attr('height',sidechart.h);

		sidechart.mainGroup
			.select('rect')
			.attr('width',sidechart.w)
			.attr('height',sidechart.h);


		sidechart.groups = sidechart.mainGroup.selectAll('g.tipo-group')
			.data($scope.total_obras_by_tipo);

		sidechart.groups
			.enter()
			.append('g')
			.attr('id',function (d){
				return 'tipo-group-'+d.slug;
			})
			.classed('tipo-group',true)
			.each(function(d) {

				var group = d3.select(this);

				group
					.append('rect')
					.datum(d)
					.classed('tipo-rect',true)
					.attr('fill',function(d){
						return tipo_colors(d.tipo);
					});

				group
					.append('text')
					.datum(d)
					.classed('tipo-text',true)
					.attr('fill','#000')
					.attr('x',30)
					.text(function(){
						return d.tipo;
					});

			});

		sidechart.groups
			.selectAll('rect.tipo-rect')
			.attr('width',20)
			.attr('height',function(d){
				return sidechart.scale(d.candidad);
			});

		sidechart.groups
			.selectAll('text.tipo-text')
			.attr('y',function(d){
				return sidechart.scale(d.candidad)/2+5;
			});

		var acum = 0;
		sidechart.groups
			.transition()
			.attr('transform',function(d){
				var y = acum;
				acum = acum + sidechart.gap + sidechart.scale(d.candidad);
				return 'translate(0,' + y + ')';
			});
			

	}

	function renderScaleChart(){

		scalechart.w = d3.select('#scale-chart-container').node().getBoundingClientRect().width;

		scalechart.h = 300;
		scalechart.margin = scalechart.w/100;

		scalechart.gap = 5;

		scalechart.nFormatter = function(num, digits) {
		  var si = [
/*		    { value: 1E18, symbol: "E" },
		    { value: 1E15, symbol: "P" },
		    { value: 1E12, symbol: "T" },
		    { value: 1E9,  symbol: "G" },*/
		    { value: 1E6,  symbol: " millones" },
		    { value: 1E3,  symbol: " mil" }
		  ], rx = /\.0+$|(\.[0-9]*[1-9])0+$/, i;
		  for (i = 0; i < si.length; i++) {
		    if (num >= si[i].value) {
		      return $filter('currency')((num / si[i].value).toFixed(digits).replace(rx, "$1"), '$', 0).replace(/\,/g,'.') + si[i].symbol;
		    }
		  }
		  return num.toFixed(digits).replace(rx, "$1");
		}

		if(!scalechart.svg) {

			//Create
			scalechart.svg = d3.select('#scale-chart-container').append('svg');
			scalechart.mainGroup = scalechart.svg.append('g').classed('main-group',true);
			scalechart.mainGroup.append('rect').attr('fill','white');
			
		}
		
		var legendData;
		if(bubbles.scale){
			var domain = bubbles.scale.domain();
			var range = bubbles.scale.range();

			//format $
			//var max = $filter('currency')(NN, '$', 0).replace(/\,/g,'.')
			//$filter('currency')((domain[0]+domain[1])/2, '$', 0).replace(/\,/g,'.')

			legendData = [
					{legend:scalechart.nFormatter(domain[1],0),radius:scalechart.w/2},
					{legend:scalechart.nFormatter((domain[0]+domain[1])/2,0),radius:scalechart.w/4},
					{legend:scalechart.nFormatter(domain[0],0),radius:scalechart.w/6}
				];
		} else {
			legendData = [
					{legend:'Obra',radius:10}
			];
		}

		//Update

		scalechart.groups = scalechart.mainGroup.selectAll('g.legend-group')
			.data(legendData);

		scalechart.groups
			.enter()
			.append('g')
			.attr('id',function (d,i){
				return 'legend-group-'+i;
			})
			.classed('legend-group',true)
			.each(function(d) {

				var group = d3.select(this);

				group
					.append('circle')
					.datum(d)
					.classed('legend-circle',true)
					.attr('fill','#B5B5B5');

				group
					.append('text')
					.datum(d)
					.classed('legend-text',true)
					.attr('fill','#000');

			});

		scalechart.groups
			.each(function(d) {

					var group = d3.select(this);

					group
						.select('circle')
						.datum(d);

					group
						.select('text')
						.datum(d);

				});

		scalechart.groups
			.exit()
			.remove();

		var acum = 0;

		scalechart.groups
			.transition()
			.attr('transform',function(d){
				var y = acum;
				acum += scalechart.gap + (d.radius*2);
				return 'translate(0,' + y + ')';
			});

		var maxRadius = d3.max(legendData,function(d){return d.radius;})

		scalechart.groups
			.selectAll('circle.legend-circle')
			.attr('cy',function(d){
				return d.radius;
			})
			.attr('cx',function(d){
				return maxRadius;
			})
			.attr('r',function(d){
				return d.radius;
			});

		scalechart.groups
			.selectAll('text.legend-text')
			.attr('text-anchor','middle')
			.attr('x',function(d){
				return maxRadius;
			})
			.attr('y',function(d){
				return d.radius+5;
			})
			.style('opacity',0)
			.text(function(d){
				return d.legend;
			})
			.transition()
			.style('opacity',1);

		scalechart.svg
			.attr('width',scalechart.w)
			.attr('height',acum);

		scalechart.mainGroup
			.select('rect')
			.attr('width',scalechart.w)
			.attr('height',acum);

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


	$scope.showGroup = function(group){

		if($scope.selectedGroup !== group){
			$scope.closeTooltip();
			resetFunctions[$scope.selectedGroup](true);
			chart.svg.selectAll('.child')
			.style('opacity',0)
			.style('display','none');
			chart.svg.selectAll('circle.obra').transition().style('opacity',0.5);
			$scope.selectedGroup = group;
		}

		renderFunctions[group]();

		var time = (initialized[group] || group === 'map')?100:2000;
		initialized[group] = true;

		setTimeout(function(){
			prepareNodesFunctions[group]();
			renderBubbles();
		},time);

	};

	function renderSankeyChart(){

		sankeychart.w = d3.select('#sankey-chart-container').node().getBoundingClientRect().width;

		sankeychart.w = (!sankeychart.svg ||  (sankeychart.w<500) )?sankeychart.w-15:sankeychart.w;
		
		sankeychart.h = 400;
		sankeychart.margin = sankeychart.w/100;

		// the function for moving the nodes
		function dragmove(d) {
			d3.select(this).attr("transform", 
				"translate(" + d.x + "," + (
				d.y = Math.max(0, Math.min(sankeychart.h - d.dy, d3.event.y))
				) + ")");			
			
			sankeychart.sankey.relayout();
			
			sankeychart.link.attr("d", sankeychart.path);
		}

		function prepareSankeyData(){

			//set up graph in same style as original example but empty
  			var graph = {"nodes" : [], "links" : []};
			
  			var data = [];

			var temp =  d3.nest()
				.key(function(d){
					return d.comuna;
				})
				.rollup(function(hojasComuna) {
					return {
						"candidad": hojasComuna.length, 
						"hijos": d3.nest()
							.key(function(d){
								return d.tipo;
							})
							.rollup(function(hojasTipo) { 
								return {
									"candidad": hojasTipo.length, 
									"hijos": d3.nest()
										.key(function(d){
											return d.etapa;
										})
										.rollup(function(hojasEtapa) { 
											return {
												"candidad": hojasEtapa.length, 
												"hijos": hojasEtapa
											} 
										})
										.map(hojasTipo.filter(function(d){
											return d.etapa != '';
										}))
								} 
							})
							.map(hojasComuna.filter(function(d){
								return d.tipo != '';
							}))
					} 
				})
				.map($scope.obras.filter(function(d){
					return (d.comuna);
				}));

			_.each(temp,function(c,comuna){
				_.each(c.hijos,function(t,tipo){
					data.push({source:comuna,target:tipo,value:t.candidad});
					_.each(t.hijos,function(e,etapa){
						data.push({source:tipo,target:etapa,value:e.candidad})
					});
				});
			});

		    data.forEach(function (d) {
		      graph.nodes.push({ "name": d.source });
		      graph.nodes.push({ "name": d.target });
		      graph.links.push({ "source": d.source,
		                         "target": d.target,
		                         "value": +d.value });
		     });

		     // return only the distinct / unique nodes
		     graph.nodes = d3.keys(d3.nest()
		       .key(function (d) { return d.name; })
		       .map(graph.nodes));

		     // loop through each link replacing the text with its index from node
		     graph.links.forEach(function (d, i) {
		       graph.links[i].source = graph.nodes.indexOf(graph.links[i].source);
		       graph.links[i].target = graph.nodes.indexOf(graph.links[i].target);
		     });

		     //now loop through each nodes to make nodes an array of objects
		     // rather than an array of strings
		     graph.nodes.forEach(function (d, i) {
		       graph.nodes[i] = { "node:":i,"name": d };
		     });

			return graph
		}


		if(!sankeychart.svg) {
			//Create
			sankeychart.svg = d3.select('#sankey-chart-container').append('svg');
			sankeychart.mainGroup = sankeychart.svg.append('g').classed('main-group',true);
			sankeychart.mainGroup.append('rect').attr('fill','white');

		}
		
		//Update
		sankeychart.svg
			.attr('width',sankeychart.w)
			.attr('height',sankeychart.h);

		sankeychart.mainGroup
			.select('rect')
			.attr('width',sankeychart.w)
			.attr('height',sankeychart.h);

		sankeychart.sankey = d3.sankey()
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

		sankeychart.link = sankeychart.mainGroup.selectAll(".link")
			.data(sankeychart.graph.links)
			.enter()
			.append("path")
			.attr("class", "link")
			.attr("d", sankeychart.path)
			.style("stroke-width", function(d) { return Math.max(1, d.dy); })
			.style("stroke", function(d) {
				return (tipo_colors.domain().indexOf(d.source.name)>-1)?tipo_colors(d.source.name):tipo_colors(d.target.name);
			})
			.sort(function(a, b) { return b.dy - a.dy; });

		// add the link titles
		sankeychart.link.append("title")
			.text(function(d) {
				return d.source.name + " → " + 
				d.target.name + "\nObras: " + d.value; 
			});

		// add in the nodes
		sankeychart.node = sankeychart.mainGroup.selectAll(".node")
			.data(sankeychart.graph.nodes)
			.enter()
			.append("g")
			.attr("class", "node")
			.attr("transform", function(d) { 
				return "translate(" + d.x + "," + d.y + ")"; 
			})
			.call(d3.behavior.drag()
			.origin(function(d) { return d; })
			.on("dragstart", function() { 
				this.parentNode.appendChild(this); 
			})
			.on("drag", dragmove));

		// add the rectangles for the nodes
		sankeychart.node.append("rect")
			.attr("height", function(d) { return d.dy; })
			.attr("width", sankeychart.sankey.nodeWidth())
			.style("fill", function(d) { 
				return (tipo_colors.domain().indexOf(d.name)>-1)?tipo_colors(d.name):'#000';
			})
			.append("title")
			.text(function(d) { 
				return d.name; 
			});

		// add in the title for the nodes
		sankeychart.node.append("text")
			.attr("y", function(d) { return d.dy / 2; })
			.attr("x", function(d) { return (isNaN(d.name))?-3:3+sankeychart.sankey.nodeWidth();})
			.attr("text-anchor", function(d) { return (isNaN(d.name))?'end':'start';})
			.attr("dy", ".35em")
			.attr("transform", null)
			.text(function(d) { return d.name; })
			.filter(function(d) { return d.x < sankeychart.width / 2; })


		//default, comunas
		//$scope.showGroup($scope.selectedGroup);
	}

	/** MAPA Functions ====================================================== **/


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
				.style('display','block')
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
				
				chart.mapCentroids = {};

				chart.mapFeatures = data.features;

				_.each(chart.mapFeatures,function(f){
					chart.mapCentroids['mapa-comuna-'+f.properties.comuna] = chart.mapPath.centroid(f);
				});

				chart.mapGroup.selectAll('path.map-item')
					.data(chart.mapFeatures)
					.enter()
					.append('path')
					.classed('child',true)
					.classed('map-item',true)
					.attr('id',function(d){
						return 'mapa-comuna-'+d.properties.comuna;
					})
					.classed('shape',true)
					.on('click',clickedMap);

				updateMap();
			});

		} else {
				updateMap();
		}

	}

	function prepareNodesMapGroup(){

		bubbles.clusters = {};
		bubbles.clusterPoints = {};

		bubbles.nodesComuna =[];

		bubbles.nodes = $scope.obras
				.filter(function(d){
					return (d.lat && d.lng);
				})
				.map(function(d) {
				  var i = 'i'+d.id,
					  r = 5,
					  c = {cluster: i, radius: r, data:d};
					  
					  bubbles.clusters[i] = c;

					  var point = chart.mapProjection([parseFloat(d.lng),parseFloat(d.lat)]);

					  bubbles.clusterPoints[i] = {
						x: point[0],
						y: point[1],
						radius:5
					  };

					  /*if(d.comuna.length>1){
						_.each(d.comuna,function(cid){
							var clone = _.clone(c);
							clone.comuna = cid;
							bubbles.nodesComuna.push(clone);
						});
					  }*/

				  return c;
				});

		bubbles.scale = false;
		renderScaleChart();

	}


	var activeMap = d3.select(null);
	function clickedMap(d) {
	  $scope.closeTooltip();
	  if (activeMap.node() === this){ return resetMap();}
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



	/** COMUNAS Functions ====================================================== **/

	function renderComunasGroup(clear){

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
						.on('click',clickedComunas);

					group
						.append('text')
						.classed('comunas-item-text',true)
						.attr('fill','#000')
						.text(function(d){
							return 'Comuna '+d;
						});

				});


		}

		if(!clear){
			chart.comunasGroup.selectAll('g.comunas-item')
				.style('display','block');	
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


	function prepareNodesComunasGroup(comunaID){

		bubbles.clusters = {};
		bubbles.clusterPoints = {};

		bubbles.nodesComuna =[];

		var filterId = (comunaID)?comunaID.replace('comunas-item-',''):false;

		var filtered = $scope.obras
				.filter(function(d){
					return ( d.comuna && (!filterId || (filterId && d.comuna===filterId ) ) );
				});

		var max = Math.ceil(d3.max(filtered,function(d){return d.monto_contrato;}));
		var min = Math.floor(d3.min(filtered,function(d){return d.monto_contrato;}));

		bubbles.scale = d3.scale.linear()
			.domain([parseInt(min),parseInt(max)])
			.range([10,(filterId)?100:50]);

		renderScaleChart();

		bubbles.nodes = filtered
				.filter(function(d){
					return ( d.comuna && (!filterId || (filterId && d.comuna===filterId ) ) );
				})
				.map(function(d) {
				  var i = 'c'+d.comuna,
					  //r = 10,
					  r = bubbles.scale((d.monto_contrato)?d.monto_contrato:0),
					  c = {cluster: i, radius: (r)?r:10, data:d};
					  
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
				radius:20
			};
		});

	}

	var activeComuna = d3.select(null);
	function clickedComunas(d) {
		$scope.closeTooltip();
		if (activeComuna.node() === this){ return resetComunas();}
		activeComuna.classed("active", false);
		activeComuna = d3.select(this)
			.classed("active", true);
		
		var selectedG = activeComuna
			.node().parentNode;

		d3.selectAll('g.comunas-item')
			.transition()
			.style('opacity',function () {
				return (this === selectedG) ? 1.0 : 0;
			})
			.each('end', function () {
				if(this !== selectedG){
					d3.select(this).style('display','none');
				}
			});

		activeComuna.transition()
			.duration(750)
			.attr('height',chart.h-chart.margin*2)
			.attr('width',chart.w-chart.margin*2);

		d3.select(selectedG)
			.transition()
			.duration(750)
			.attr('transform','translate(0,0)')
			.each('end',function(){
				prepareNodesComunasGroup(d3.select(selectedG).attr('id'));
				renderBubbles();
			});
	}

	function resetComunas(clear) {
	  activeComuna.classed("active", false);

	  activeComuna = d3.select(null);

	  d3.selectAll('g.comunas-item')
		.style('display','block');

		renderComunasGroup(clear);

		if(!clear){
			setTimeout(function(){
				prepareNodesComunasGroup();
				renderBubbles();
			},2000);			
		}

	}


	/* ETAPAS Functions ====================================================== */

	function renderEtapasGroup(clear){

		var etapas = ['en-proyecto','en-licitacion','en-ejecucion','finalizada'];
		var etapas_string = {
			'en-proyecto':'En Proyecto',
			'en-licitacion':'En Licitación',
			'en-ejecucion':'En Ejecución',
			'finalizada':'Finalizada'
		};
		
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
						.on('click',clickedEtapas);

					group
						.append('text')
						.classed('etapas-item-text',true)
						.attr('fill','#000')
						.text(function(d){
							return etapas_string[d];
						});

				});


		}

		if(!clear){
			chart.etapasGroup.selectAll('g.etapas-item')
				.style('display','block');			
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

	function prepareNodesEtapasGroup(etapaID){

		bubbles.clusters = {};
		bubbles.clusterPoints = {};

		bubbles.nodesComuna =[];

		var filterId = (etapaID)?etapaID.replace('etapas-item-',''):false;

		var filtered = $scope.obras
				.filter(function(d){
					return (d.etapa && (!filterId || (filterId && d.etapa_slug===filterId) ));
				});

		var max = Math.ceil(d3.max(filtered,function(d){return d.monto_contrato;}));
		var min = Math.floor(d3.min(filtered,function(d){return d.monto_contrato;}));

		bubbles.scale = d3.scale.linear()
			.domain([parseInt(min),parseInt(max)])
			.range([10,(filterId)?100:50]);

		renderScaleChart();

		bubbles.nodes = filtered
				.map(function(d) {
				  var i = 'e-'+d.etapa_slug,
					  r = bubbles.scale((d.monto_contrato)?d.monto_contrato:10),
					  c = {cluster: i, radius: (r)?r:10, data:d};

					  if (!bubbles.clusters[i] || (r > bubbles.clusters[i].radius)){
						bubbles.clusters[i] = c;
					  }

				  return c;
				});

		if(!filterId){
			d3.selectAll('g.etapas-item').each(function(d){
				var g = d3.select(this);
				var rect = g.select('rect');

				bubbles.clusterPoints['e-'+d] = {
					x: d3.transform(g.attr('transform')).translate[0]+rect.attr('width')/2,
					y: d3.transform(g.attr('transform')).translate[1]+rect.attr('height')/2,
					radius:10
				};
			});
		} else {
			bubbles.clusterPoints = false;
		}

	}

	var activeEtapa = d3.select(null);
	function resetEtapas(clear) {
	  activeEtapa.classed("active", false);

	  activeEtapa = d3.select(null);

	  d3.selectAll('g.etapas-item')
		.style('display','block');

		renderEtapasGroup(clear);

		if(!clear){
			setTimeout(function(){
				prepareNodesEtapasGroup();
				renderBubbles();
			},2000);    		
		}

	}

	function clickedEtapas(d) {
		$scope.closeTooltip();
		if (activeEtapa.node() === this){  return resetEtapas(); }
		activeEtapa.classed("active", false);
		activeEtapa = d3.select(this)
			.classed("active", true);
		
		var selectedG = activeEtapa
			.node().parentNode;

		d3.selectAll('g.etapas-item')
			.transition()
			.style('opacity',function () {
				return (this === selectedG) ? 1.0 : 0;
			})
			.each('end', function () {
				if(this !== selectedG){
					d3.select(this).style('display','none');
				}
			});

		activeEtapa.transition()
			.duration(750)
			.attr('height',chart.h-chart.margin*2)
			.attr('width',chart.w-chart.margin*2);

		d3.select(selectedG)
			.transition()
			.duration(750)
			.attr('transform','translate(0,0)')
			.each('end',function(){
				prepareNodesEtapasGroup(d3.select(selectedG).attr('id'));
				renderBubbles();
			});
	}


	/* Bubble functions ====================================================== */

	function renderBubbles(){

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
			.classed('obra',true)
			.on("click", function(d) {
				$scope.selectedObra = d;
				$scope.$apply();
				$scope.tooltip
					.transition()
					.duration(200)
					.style("left", (d3.event.pageX) + "px")		
					.style("top", (d3.event.pageY) + "px")
					.style("opacity", 1);
				//d3.select('#detalle').html(JSON.stringify(d.data));
			});

		bubbles.circles
			.attr('id',function(d){return 'e'+d.data.id;})
			.style('fill', function(d) { 
				return tipo_colors(d.data.tipo); 
			});
			//.call(bubbles.force.drag);

		 bubbles.circles
			.transition()
			.style('opacity',1)
			.attr('r', function(d) {
			  return d.radius; 
			});

		bubbles.circles.exit().remove();

		/*if(bubbles.nodesComuna.length){

			bubbles.lines = bubbles.group.selectAll('line.obra-comuna')
				.data(bubbles.nodesComuna);

			bubbles.lines
				.enter()
				.append('line')
				.classed('obra-comuna',true);

			bubbles.lines
				.attr('id',function(d){ return 'obra-'+d.data.id+'-comuna-'+d.comuna;})
				.style('stroke', function(d) { 
				  return tipo_colors(d.data.tipo); 
				})
				.attr('x1',function(d){
					var center = chart.mapCentroids['mapa-comuna-'+d.comuna];
					return center[0];
				})
				.attr('y1',function(d){
					var center = chart.mapCentroids['mapa-comuna-'+d.comuna];
					return center[1];
				})
				.attr('x2',100)
				.attr('y2',100);

			 bubbles.lines
				.transition()
				.style('opacity',1);

			bubbles.lines.exit().remove();


		} else {
			if(bubbles.lines){
				bubbles.lines.style('opacity',0);
			}
		}*/

		bubbles.circles	
			.each(function(d){

				/*if(d.data.comuna.length>1 && $scope.selectedGroup=='map'){
					_.each(d.data.comuna,function(c){
						var id = 'obra-'+d.data.id+'-comuna-'+c;
	
						var center = chart.mapCentroids['mapa-comuna-'+c];
						
						bubbles.group.append('line')
							.attr('id',id)
							.attr('x1',center[0])
							.attr('y1',center[1])
							.attr('x2',0)
							.attr('y2',0)
							.style('stroke', function() { 
							  return tipo_colors(d.data.tipo); 
							});
						
					})


				}*/


			});

	}

	function tick(e) {
	  bubbles.circles
		  .each(cluster(10 * e.alpha * e.alpha))
		  .each(collide(0.5))
		  .attr('cx', function(d) { return d.x; })
		  .attr('cy', function(d) { return d.y; })
		  /*.each(function(d){
			if(d.data.comuna.length>1 && $scope.selectedGroup=='map'){
					_.each(d.data.comuna,function(c){
						var id = 'obra-'+d.data.id+'-comuna-'+c;
							
						bubbles.group.select('#'+id)
							.attr('x2',d.x)
							.attr('y2',d.y);
						
					});
			}
		  })*/
		  ;

		/*if(bubbles.lines && $scope.selectedGroup=='map'){
			bubbles.lines
			  .each(cluster(10 * e.alpha * e.alpha))
			  .each(collide(0.5))
			  .attr('x2', function(d) { return d.x; })
			  .attr('y2', function(d) { return d.y; });
		}*/
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
		var r = d.radius + 2,
			nx1 = d.x - r,
			nx2 = d.x + r,
			ny1 = d.y - r,
			ny2 = d.y + r;
		quadtree.visit(function(quad, x1, y1, x2, y2) {
		  if (quad.point && (quad.point !== d)) {
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

	$scope.closeTooltip = function(){
		$scope.tooltip
			.transition()
			.duration(200)
			.style("top", -100)
			.style("left", -100)
			.style("opacity", 0);
	}



  });
