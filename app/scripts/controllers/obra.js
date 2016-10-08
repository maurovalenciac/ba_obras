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

  });
