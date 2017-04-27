'use strict';

angular.module('obrasMduytApp')
    .filter('ByCategoryFilter', function() {
        return function( items, cats ) {
          var filtered = [];
          if(items && cats){
              angular.forEach(cats.filter(function(c){return c.active;}), function(c) {
                filtered = filtered.concat(items.filter(function(i){return i.categoria == c.name;}))
              });
          }
          return filtered;
        };
    })
  .controller('MapasCtrl', function ($scope,DataService,$http,leafletData,$sce,$window) {

  	$scope.pymChild = new window.pym.Child({ polling: 1000 });
    $scope.pymChild.sendHeight();

    $scope.loading = true;
    $scope.loadingMap = false;

    var baseTiles = {
                url: 'http://tiles1.usig.buenosaires.gob.ar/mapcache/tms/1.0.0/amba_con_transporte_3857@GoogleMapsCompatible/{z}/{x}/{y}.png',
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

    angular.extend($scope, {
        markers: {},
        tiles: baseTiles,
        center: {
                    lat: -34.604,
                    lng: -58.430,
                    zoom: 12
                },
        defaults:{
             scrollWheelZoom: false
        }
    });

    $scope.data = {};

    DataService.getMapas()
	.then(function(data){
        console.log(data);
        $scope.rawdata = data;
        $scope.maps = data;
		$scope.nested = d3.nest()
			.key(function(d){return d.categoria;})
			.map(data);

		$scope.cats = _.keys($scope.nested).map(function(c){
            return {name:c,active:true};
        });

		$scope.loading = false;

	});

	$scope.toggleFilter = function(c){
        c.active = !c.active;
	};

    $scope.selectMap = function(m){
        baseTiles.url = m.tiles;
        $scope.tiles = baseTiles;
        $scope.currentMap = m;
        console.log($scope.tiles);
    };

    $scope.unselectMap = function(m){
        $scope.currentMap = false;
    };

  });
