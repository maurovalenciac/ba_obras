'use strict';

angular.module('obrasMduytApp')
  .controller('ObraCtrl', function ($scope,DataService,$routeParams) {

  	$scope.pymChild = new pym.Child({ polling: 1000 });
    $scope.pymChild.sendHeight();
    $scope.obraId = $routeParams.id;

    DataService.getById($routeParams.id)
    .then(function(data){
    	console.log(data);
    	$scope.obra = data;
    });
    angular.extend($scope, {
      center: {
          lat: 51.505,
          lng: -0.09,
          zoom: 8
          }
    });

  });
