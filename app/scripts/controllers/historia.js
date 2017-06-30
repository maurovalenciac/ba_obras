'use strict';

angular.module('obrasMduytApp')
  .controller('HistoriaCtrl', function ($scope,DataService,$routeParams,leafletData,$timeout,$sce) {

  	$scope.pymChild = new window.pym.Child({ polling: 1000 });
    $scope.pymChild.sendHeight();

    $scope.SLIDES_DATA = window.SLIDES_DATA

    $scope.historyIndex = -1;
    $scope.slideIndex = 0;

    $scope.mouseoverVariation = function(ix){
      $scope.history.pic = ix;
    }

    $scope.mouseoutVariation = function(){
      $scope.history.pic = 'main';
    }

    $scope.nextHistory = function(){
      $scope.historyIndex = ($scope.SLIDES_DATA[$scope.historyIndex+1])?$scope.historyIndex+1:0;
      $scope.renderHistory();
    }

    $scope.prevHistory = function(){
      $scope.historyIndex = ($scope.historyIndex==0)?$scope.SLIDES_DATA.length-1:$scope.historyIndex-1;
      $scope.renderHistory();
    }

    $scope.renderHistory = function(){
      $scope.history = $scope.SLIDES_DATA[$scope.historyIndex];
      $scope.history.pic = 'main';
      $scope.slideIndex = 0;
      $scope.evaluateMap($scope.slideIndex);
      $('#history-carousel').carousel({
        interval: false
      })
      .off('slid.bs.carousel')
      .on('slid.bs.carousel', function (args) {
        var id = $(args.relatedTarget).attr('id').split('-')[1];
        $scope.slideIndex = parseInt(id);
        $scope.evaluateMap($scope.slideIndex);
        $scope.$apply();
      });
    }

    $scope.evaluateMap = function(slideIndex){
      if($scope.SLIDES_DATA[$scope.historyIndex].slides[slideIndex].type=='map'){
        $scope.url = $sce.trustAsResourceUrl($scope.SLIDES_DATA[$scope.historyIndex].slides[slideIndex].url);
      } else {
        $scope.url = false;
      }
    }

    $scope.selectCategory = function(cat){
      var id = _.findIndex($scope.SLIDES_DATA, function(o) { return o.category == cat; }); 
      if(id>0){
        $scope.historyIndex = id;
        $scope.renderHistory();
      }
    }

    $scope.nextHistory();

  });
