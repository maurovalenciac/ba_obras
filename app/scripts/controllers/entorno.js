'use strict';

angular.module('obrasMduytApp')
  .controller('EntornoCtrl', function ($scope,DataService,$routeParams) {

  	$scope.pymChild = new window.pym.Child({ polling: 1000 });
    $scope.pymChild.sendHeight();





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






    DataService.getByEntorno($routeParams.entorno)
    .then(function(data){
      $scope.entorno = $routeParams.entorno;
      console.log(data);
      $scope.obras = data;

      var markers = {};
      for (var i = 0; i < data.length; i++) {
        var obra = data[i];
        markers['m'+i] =  {
          lat: parseFloat(obra.lat),
          lng:   parseFloat(obra.lng),
          focus:true,
          message: obra.nombre
        };
      };

      angular.extend($scope, {
                    markers : markers
                });
    });



  });
