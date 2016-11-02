'use strict';

angular.module('obrasMduytApp')
  .controller('ObraCtrl', function ($scope,DataService,$routeParams) {

  	$scope.pymChild = new window.pym.Child({ polling: 1000 });
    $scope.pymChild.sendHeight();
    $scope.obraId = $routeParams.id;


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
                    lng: -58.382,
                    zoom: 15
                },
        tiles: tilesUSIG,
        defaults:{
             scrollWheelZoom: false
        }
    });

    $scope.mainCallback = function(callback){
        $scope.drawLineOnObraLoaded = callback;
    }
    DataService.getById($routeParams.id)
    .then(function(data){
      console.log('obra loaded');

      $scope.obra = data;
      $scope.drawLineOnObraLoaded(data);
        //setup slider
      $scope.slides = data.fotos;
      //Setup Map
      angular.extend($scope, {
                  center: {
                                lat: parseFloat(data.lat),
                                lng:   parseFloat(data.lng),
                                zoom: 15
                            },
                    markers: {
                        m1: {
                            lat: parseFloat(data.lat),
                            lng:   parseFloat(data.lng),
                            focus:true,
                            message: data.nombre,
                        }
                    }
                });

      //Setup time line
      var time = {"starting_time": data.fecha_inicio, "ending_time": data.fecha_fin_inicial};




  });

  });
