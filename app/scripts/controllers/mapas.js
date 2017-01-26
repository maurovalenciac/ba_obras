'use strict';

angular.module('obrasMduytApp')
  .controller('MapasCtrl', function ($scope,DataService,$http,leafletData,$sce,$window) {

  	$scope.pymChild = new window.pym.Child({ polling: 1000 });
    $scope.pymChild.sendHeight();

    $scope.loading = true;
    $scope.loadingMap = false;

    var tilesUSIG = {
                url: '//tiles1.usig.buenosaires.gob.ar/mapcache/tms/1.0.0/amba_con_transporte_3857@GoogleMapsCompatible/{z}/{x}/{y}.png',
                format: 'tms',
                builder: 'tms',
                baseLayer: true,
                options: {
                    maxZoom: 18,
                    minZoom: 9,
                    attribution:'USIG (<a href="http://www.buenosaires.gob.ar" target="_blank">GCBA</a>), © <a href="http://www.openstreetmap.org/copyright/en" target="_blank">OpenStreetMap</a> (ODbL)',
                    tms: true
                }
              };

    $scope.titles = tilesUSIG;
    angular.extend($scope, {
        markers: {},
        center: {
                    lat: -34.604,
                    lng: -58.430,
                    zoom: 12
                },
        tiles: tilesUSIG,
        defaults:{
             scrollWheelZoom: false
        },
        geojson: {
            onEachFeature: function (feature, layer) {
//                console.log(feature);
//                console.log(layer);
                layer.bindPopup(feature.properties.Nombre);
//                debugger;
                //console.log(layers);
            },
/*	                style: {
                fillColor: "green",
                weight: 2,
                opacity: 1,
                color: 'white',
                dashArray: '3',
                fillOpacity: 0.7
            }*/
        }
    });

    $scope.resetGeojson = function(){
    	$scope.geojson.data = {
    		type: 'FeatureCollection',
    		features:[]
    	}
    };

    $scope.data = {};

    $scope.resetGeojson();

    DataService.getMapas()
	.then(function(data){
		$scope.nested = d3.nest()
			.key(function(d){return d.categoria;})
			.map(data);
		$scope.cats = _.keys($scope.nested);

		$scope.filterMaps($scope.cats[0]);

		$scope.loading = false;

	});

	$scope.filterMaps = function(c){
		$scope.currentCat = c;
		$scope.maps = $scope.nested[c];
		$scope.renderMap($scope.maps[0]);
	};

	$scope.renderMap = function(m){
		$scope.currentMap = m;
		$scope.loadingMap = true;
		var url = $sce.trustAsResourceUrl(m.mapa);

		/*$http.jsonp(url,{jsonpCallback: 'callbackMap'})
		.then(function(data, status) {
	        angular.extend($scope, {
	            geojson: {
	                data: data,
	                style: {
	                    fillColor: "green",
	                    weight: 2,
	                    opacity: 1,
	                    color: 'white',
	                    dashArray: '3',
	                    fillOpacity: 0.7
	                }
	            }
	        });
	    });*/
	    $scope.resetGeojson();
	    $.getJSON( m.mapa+'&callback=?', function( data ) {
	    	console.log(data);
	    	$scope.geojson.data = data;
	    	//http://ws.usig.buenosaires.gob.ar/rest/convertir_coordenadas?x=100000&y=100000&output=lonlat
	    	
	        $scope.loadingMap = false;
	        $scope.$apply()
		});
	};

  });
