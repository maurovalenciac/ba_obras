'use strict';

angular.module('obrasMduytApp')
  .controller('MapasCtrl', function ($scope,DataService,$routeParams,leafletData,$timeout) {

  	$scope.pymChild = new window.pym.Child({ polling: 1000 });
    $scope.pymChild.sendHeight();

  });
