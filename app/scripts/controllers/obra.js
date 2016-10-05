'use strict';

angular.module('obrasMduytApp')
  .controller('ObraCtrl', function ($scope,DataService,$routeParams) {

  	$scope.pymChild = new pym.Child({ polling: 1000 });
    $scope.pymChild.sendHeight();

    DataService.getById($routeParams.id)
    .then(function(data){
    	console.log(data);
    	$scope.data = data;
    });

  });
