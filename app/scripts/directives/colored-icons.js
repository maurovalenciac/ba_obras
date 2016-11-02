'use strict';

angular.module('obrasMduytApp')
.directive('coloredIcons', function() {
    return {
        restrict: 'E',
        replace: true,
        scope: {
          callback: '=callback',
          class: '=class'
        },
        controller: function($scope, $timeout, $http) {

            $scope.loading = true;
            var drawLine = function(obra){

              console.log('this is obra:',obra);

              $scope.id = 'content-' + Math.floor((Math.random()*10000));


              setTimeout(function() {


              }, 100);


            }
            $scope.callback(drawLine);


        },
        template: '<div class="colored"></div>'
    };

});
