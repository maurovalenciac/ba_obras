"use strict";$.urlParam=function(a,b){var c=new RegExp("[?&]"+b+"=([^&#]*)").exec(a);return null===c?null:c[1]||0},angular.module("obrasMduytApp",["ngRoute","ngSanitize","slugifier","slick","leaflet-directive"]).config(["$routeProvider",function(a){a.when("/home",{templateUrl:"views/home.html",controller:"HomeCtrl",controllerAs:"home"}).when("/obra/:id",{templateUrl:"views/obra.html",controller:"ObraCtrl",controllerAs:"obra"}).when("/entorno/:entorno",{templateUrl:"views/entorno.html",controller:"EntornoCtrl",controllerAs:"entorno"}).otherwise({redirectTo:"/home"})}]).service("DataService",["$http","$q","Slug",function(a,b,c){var d=void 0,e=function(a){return a.entorno_slug=a.entorno?c.slugify(a.entorno):null,a.tipo=a.tipo?a.tipo.split("|"):[],a.comuna=a.comuna?a.comuna.split("|"):[],a.barrio=a.barrio?a.barrio.split("|"):[],a.licitacion_oferta_empresas=a.licitacion_oferta_empresas?a.licitacion_oferta_empresas.split("|"):[],a.id=parseInt(a.id),a.licitacion_anio=a.licitacion_anio?parseInt(a.licitacion_anio):null,a.monto_contrato=a.monto_contrato?parseFloat(a.monto_contrato):null,a.licitacion_presupuesto_oficial=a.licitacion_presupuesto_oficial?parseFloat(a.licitacion_presupuesto_oficial):null,a.plazo_meses=a.plazo_meses?parseInt(a.plazo_meses):null,a.porcentaje_avance=a.porcentaje_avance?parseFloat(a.porcentaje_avance):null,a},f=function(){return window.MDUYT_CONFIG||(console.error("Archivo de configuración inexistente, utilizando configuración default de desarrollo."),window.MDUYT_CONFIG={BASE_URL:"http://api.topranking.link/",HOME_CSV:"https://goo.gl/vcb6oX"}),window.MDUYT_CONFIG.BASE_URL+"?source_format=csv&source="+window.MDUYT_CONFIG.HOME_CSV+"&callback=JSON_CALLBACK"};this.getById=function(a){var c=void 0,d=b.defer();return this.retrieveAll().then(function(b){c=b.filter(function(b){return b.id==parseInt(a)}),d.resolve(c[0])}),c=d.promise,b.when(c)},this.getByEntorno=function(a){var c=void 0,d=b.defer();return this.retrieveAll().then(function(b){c=b.filter(function(b){return b.entorno_slug==a}),d.resolve(c)}),c=d.promise,b.when(c)},this.getAll=function(){var a=void 0,c=b.defer();return this.retrieveAll().then(function(a){c.resolve(a)}),a=c.promise,b.when(a)},this.retrieveAll=function(){if(!d){var c=b.defer();a.jsonp(f()).then(function(a){d=a.data.map(e),c.resolve(d)},function(a){d=a,c.reject(a)}),d=c.promise}return b.when(d)}}]).run(["$rootScope","$interval",function(a,b){}]),angular.module("obrasMduytApp").controller("HomeCtrl",["$scope","DataService",function(a,b){function c(){l.w=d3.select("#home-chart-container").node().getBoundingClientRect().width,l.w=!l.svg||l.w<500?l.w-15:l.w,a.isSmallDevice=l.w<500,a.isSmallDevice?(l.h=l.w,l.margin=l.w/100):(l.h=3*l.w/4,l.margin=l.w/200),l.svg||(l.svg=d3.select("#home-chart-container").append("svg"),l.mainGroup=l.svg.append("g").classed("main-group",!0),l.mainGroup.append("rect").attr("fill","white"),l.svg.append("g").attr("id","comunas-group"),l.svg.append("g").attr("id","map-group"),l.svg.append("g").attr("id","etapas-group"),m.group=l.svg.append("g").attr("id","bubbles-group")),l.svg.attr("width",l.w).attr("height",l.h),l.mainGroup.select("rect").attr("width",l.w).attr("height",l.h),h(),a.showGroup(a.selectedGroup)}function d(){function b(){a.isSmallDevice&&l.svg.attr("height",l.w),l.mapGroup.selectAll("path.map-item").transition().attr("d",l.mapPath).style("opacity",1)}l.mapProjection=d3.geo.mercator().center([-58.43992,-34.618]).translate([l.w/2,l.h/2]).scale(190*l.w),l.mapPath=d3.geo.path().projection(l.mapProjection),l.mapGroup?b():(l.mapGroup=l.svg.select("#map-group"),d3.json("geo/comunas.simple.geojson",function(a){l.mapFeatures=a.features,l.mapGroup.selectAll("path.map-item").data(l.mapFeatures).enter().append("path").classed("child",!0).classed("map-item",!0).attr("id",function(a){return a.id}).classed("shape",!0),b()}))}function e(){var b=d3.range(1,16);if(l.comunasGroup||(l.comunasGroup=l.svg.select("#comunas-group"),l.comunasGroup.selectAll("g.comunas-item").data(b).enter().append("g").classed("child",!0).classed("comunas-item",!0).attr("id",function(a){return"comunas-item-"+a}).each(function(a){var b=d3.select(this);b.append("rect").classed("comunas-item-frame",!0).attr("fill","#ccc"),b.append("text").classed("comunas-item-text",!0).attr("fill","#000").text(function(a){return"Comuna "+a})})),a.isSmallDevice){var c=l.w,d=l.w;l.svg.attr("height",b.length*l.w),l.mainGroup.select("rect").attr("height",b.length*l.w)}else var c=l.h/3,d=l.w/5;l.comunasGroup.selectAll("rect.comunas-item-frame").transition().attr("x",l.margin).attr("y",l.margin).attr("height",c-2*l.margin).attr("width",d-2*l.margin),l.comunasGroup.selectAll("text.comunas-item-text").transition().attr("x",15).attr("y",25),g(l.comunasGroup.selectAll("g.comunas-item").transition().style("opacity",1),d,c)}function f(){var b=d3.range(1,5);if(l.etapasGroup||(l.etapasGroup=l.svg.select("#etapas-group"),l.etapasGroup.selectAll("g.etapas-item").data(b).enter().append("g").classed("child",!0).classed("etapas-item",!0).attr("id",function(a){return"etapas-item-"+a}).each(function(a){var b=d3.select(this);b.append("rect").classed("etapas-item-frame",!0).attr("fill","#ccc"),b.append("text").classed("etapas-item-text",!0).attr("fill","#000").text(function(a){return"Etapa "+a})})),a.isSmallDevice){var c=l.w,d=l.w;l.svg.attr("height",b.length*l.w),l.mainGroup.select("rect").attr("height",b.length*l.w)}else var c=l.h/2,d=l.w/2;l.etapasGroup.selectAll("rect.etapas-item-frame").transition().attr("x",l.margin).attr("y",l.margin).attr("height",c-2*l.margin).attr("width",d-2*l.margin),l.etapasGroup.selectAll("text.etapas-item-text").transition().attr("x",15).attr("y",25),g(l.etapasGroup.selectAll("g.etapas-item").transition().style("opacity",1),d,c)}function g(a,b,c){var d=Math.floor(l.w/b),e=0,f=0;a.transition().duration(1e3).attr("transform",function(g,h){var i=e*b,j=f*c;return e<d-1?e++:a[0].length!==h+1&&(e=0,f++),"translate("+i+","+j+")"})}function h(){m.clusters=new Array(15),m.nodes=a.obras.map(function(a){var b=a.sector,c=10,a={cluster:b,radius:c,data:a};return(!m.clusters[b]||c>m.clusters[b].radius)&&(m.clusters[b]=a),a}),m.colors=d3.scale.category20(),m.force=d3.layout.force().nodes(m.nodes).size([l.w,l.h]).gravity(0).charge(1).on("tick",i).start(),m.circles=m.group.selectAll("circle.obra").data(m.nodes),m.circles.enter().append("circle").classed("obra",!0),m.circles.attr("id",function(a){return"e"+a.data.id}).attr("r",function(a){return a.radius}).style("fill",function(a){return m.colors(a.data.id)}).call(m.force.drag)}function i(a){m.circles.each(j(10*a.alpha*a.alpha)).each(k(.5)).attr("cx",function(a){return a.x}).attr("cy",function(a){return a.y})}function j(a){return function(b){var c=m.clusters[b.cluster],d=1;if(c){c===b&&(c={x:l.w/2,y:l.h/3,radius:-b.radius},d=.1*Math.sqrt(b.radius));var e=b.x-c.x,f=b.y-c.y,g=Math.sqrt(e*e+f*f),h=b.radius+c.radius;g!=h&&(g=(g-h)/g*a*d,b.x-=e*=g,b.y-=f*=g,c.x+=e,c.y+=f)}}}function k(a){var b=d3.geom.quadtree(m.nodes);return function(c){var d=c.radius+10,e=c.x-d,f=c.x+d,g=c.y-d,h=c.y+d;b.visit(function(b,d,i,j,k){if(b.point&&b.point!==c){var l=c.x-b.point.x,m=c.y-b.point.y,n=Math.sqrt(l*l+m*m),o=c.radius+b.point.radius+5;n<o&&(n=(n-o)/n*a,c.x-=l*=n,c.y-=m*=n,b.point.x+=l,b.point.y+=m)}return d>f||j<e||i>h||k<g})}}a.pymChild=new pym.Child({polling:1e3}),a.pymChild.sendHeight(),a.timeoutId;var l={},m={};a.isSmallDevice,a.selectedGroup="comunas",b.getAll().then(function(b){console.log(b),a.obras=b,c(),$(window).resize(function(){clearTimeout(a.timeoutId),a.timeoutId=setTimeout(c,1e3)})});var n={comunas:e,etapas:f,map:d};a.showGroup=function(b){a.selectedGroup!=b&&(l.svg.selectAll(".child").style("opacity",0),a.selectedGroup=b),n[b]()}}]),angular.module("obrasMduytApp").controller("ObraCtrl",["$scope","DataService","$routeParams",function(a,b,c){a.pymChild=new pym.Child({polling:1e3}),a.pymChild.sendHeight(),a.obraId=c.id,b.getById(c.id).then(function(b){console.log(b),a.obra=b}),angular.extend(a,{center:{lat:51.505,lng:-.09,zoom:8}})}]),angular.module("obrasMduytApp").controller("EntornoCtrl",["$scope","DataService","$routeParams",function(a,b,c){a.pymChild=new pym.Child({polling:1e3}),a.pymChild.sendHeight(),b.getByEntorno(c.entorno).then(function(b){a.entorno=c.entorno,console.log(b),a.obras=b})}]),angular.module("obrasMduytApp").run(["$templateCache",function(a){a.put("views/entorno.html",'<div class="row"> <div class="col-md-12"> <h1>Entorno: {{entorno}}</h1> <p>Obras: {{obras.length}}</p> <p ng-repeat="obra in obras"> Obra: {{$index+1}} -> {{obra}} </p> </div> </div> <div class="row"> <div class="col-md-12"> <h4>[Galería]</h4> </div> </div> <div class="row"> <div class="col-md-12"> <h4>[Datos]</h4> </div> </div> <div class="row"> <div class="col-md-12"> <leaflet></leaflet> <h4>[Mapa]</h4> </div> </div>'),a.put("views/home.html",'<div class="row"> <div class="col-md-12"> <h1>HOME</h1> <p>Cargadas: {{obras.length}} obras</p> </div> </div> <div class="row"> <div class="col-sm-10"> <div id="home-chart-container"></div> </div> <div class="col-sm-2"> <a class="btn btn-default btn-block" ng-click="showGroup(\'map\')">Mapa</a> <a class="btn btn-default btn-block" ng-click="showGroup(\'comunas\')">Comunas</a> <a class="btn btn-default btn-block" ng-click="showGroup(\'etapas\')">Etapas</a> </div> </div> <div class="row"> <div class="col-md-12"> <leaflet></leaflet> <h4>[Mapa tentativo]</h4> </div> </div> <div class="row"> <div class="col-md-12"> <h4>[Sankey]</h4> </div> </div>'),a.put("views/obra.html",'<div class="row obra"> <div class="col-md-12"> <h1>Obra {{obra.id}}: {{obra.nombre}}</h1> <div class="row"> <div class="col-md-8"> <slick class=".slider-for" asnavfor=".slider-nav" infinite="true" slides-to-show="1" slides-to-scroll="1"> <div><img src="http://www.eldiariodebuenosaires.com/files/2016/01/Calle.jpg"></div> <div><img src="http://www.eldiariodebuenosaires.com/files/2016/01/Calle.jpg"></div> <div><img src="http://www.eldiariodebuenosaires.com/files/2016/01/Calle.jpg"></div> </slick> <slick class="slider-nav" asnavfor=".slider-nav" infinite="true" dots="true" centermode="true" focusonselect="true" slides-to-show="3" slides-to-scroll="1"> <div><img ng-src="http://www.eldiariodebuenosaires.com/files/2016/01/Calle.jpg"></div> <div><img src="http://www.eldiariodebuenosaires.com/files/2016/01/Calle.jpg"></div> <div><img src="http://www.eldiariodebuenosaires.com/files/2016/01/Calle.jpg"></div> <div><img src="http://www.eldiariodebuenosaires.com/files/2016/01/Calle.jpg"></div> </slick> <p> {{obra.descripcion}} </p> </div> <div class="col-md-4 ficha-tecnica"> <h4> Ficha técnica de Licitación </h4> <div class="etapa"> <p> Tipo de Obra: <strong ng-repeat="tipo in obra.tipo">{{tipo}}</strong> </p> </div> <p> Area Responsable: <strong> {{obra.area_responsable}}</strong></p> <p> Empresas <ul> <li ng-repeat="empresa in obra.licitacion_oferta_empresas"> <strong>{{empresa}} <i class="detalle-frame-icon glyphicon glyphicon-info-sign" data-container="body" title="{{nota}}" data-toggle="popover" data-placement="bottom" data-content="Fuente: {{fuente}}"></i> </strong> </li> </ul> </p> <p> Etapa: <strong>{{obra.etapa}} </strong> </p> <p> Estado </p> <div class="progress"> <div class="progress-bar bg-color-{{obra.slug}}" role="progressbar" ng-style="{ \'width\': obra.porcentaje_avance + \'%\' }"> <div class="progressbar-w" ng-show="!obra.porcentaje_avance"><p></p> </div> <span class="progressbar-w" ng-hide="obra.porcentaje_avance<22 || !obra.porcentaje_avance"> </span> </div> <div class="progress-w" ng-show="obra.porcentaje_avance<22" ng-style="{ \'width\': (100 - obra.porcentaje_avance) + \'%\' }"></div> </div> <p> Plazo total: <strong> {{obra.plazo_meses}} meses </strong> </p> <p> Inicio : {{obra.fecha_inicio}} // Fin : {{obra.fecha_fin_inicial}} </p> <p> Cantidad de Beneficiaros: <strong> {{obra.benficiarios}}</strong> </p> <p> Mano de Obra <strong> {{obra.mano_obra}} </strong> </p> <p> Monto Contrato: <strong> {{obra.monto_contrato | currency}} </strong> </p> <p> Monto Actualizado: <strong> {{obra.licitacion_presupuesto_oficial | currency}} </strong> </p> <p> <a href=""><i class="detalle-frame-icon glyphicon glyphicon glyphicon-download-alt"> </i> Descargar Informe </a> </p> </div> </div> </div> </div> <div class="row"> <div class="col-md-12"> <leaflet></leaflet> <h4> {{obra.direccion}} </h4> </div> </div>')}]);