'use strict';

angular.module('obrasMduytApp')
  .controller('HomeCtrl', function ($scope,DataService) {

  	$scope.pymChild = new pym.Child({ polling: 1000 });
    $scope.pymChild.sendHeight();

    DataService.getAll()
    .then(function(data){
    	console.log(data);
    	$scope.data = data;
    });

  });
