'use strict';

angular.module('obrasMduytApp')
  .controller('HistoriaCtrl', function ($scope,DataService,$routeParams,leafletData,$timeout) {

  	$scope.pymChild = new window.pym.Child({ polling: 1000 });
    $scope.pymChild.sendHeight();

    $scope.old = 'item-1';

    $('#history-carousel').carousel({
      interval: false
    }).on('slid.bs.carousel', function (e) {
      var newer = $(e.relatedTarget).attr('id');

      hide($scope.old);
      $scope.old = newer;
      show(newer);

    });

    var animations = {
      'item-1':[
          anime({
            targets: '.item-1-targets',
            translateX: '500%',
            scale: [.5, 0.9],
            opacity: [0,1],
            delay: function(el, index) {
              return index * 100;
            },
            autoplay:false,
            loop:false
          }),
        anime({
            targets: '.item-1-img',
            translateY: [-200,0],
            opacity: [0,1],
            delay: function(el, index) {
              return 1000;
            },
            autoplay:false,
            loop:false
          }),
        anime({
            targets: '.item-1-text',
            translateX: [500,0],
            opacity: [0,1],
            delay: function(el, index) {
              return 1500;
            },
            autoplay:false,
            loop:false
          })
      ],
      'item-2':[
          anime({
            targets: '.item-2-targets',
            translateX: '500%',
            scale: [.5, 0.9],
            opacity: [0,1],
            delay: function(el, index) {
              return index * 100;
            },
            autoplay:false,
            loop:false
          }),
        anime({
            targets: '.item-2-img',
            translateX: [-500,0],
            opacity: [0,1],
            delay: function(el, index) {
              return 1000;
            },
            autoplay:false,
            loop:false
          }),
        anime({
            targets: '.item-2-text',
            translateX: [500,0],
            opacity: [0,1],
            delay: function(el, index) {
              return 1500;
            },
            autoplay:false,
            loop:false
          })
      ],
      'item-3':[
          anime({
            targets: '.item-3-targets',
            translateX: '500%',
            scale: [.5, 0.9],
            opacity: [0,1],
            delay: function(el, index) {
              return index * 100;
            },
            autoplay:false,
            loop:false
          }),
        anime({
            targets: '.item-3-img',
            translateX: [-500,0],
            opacity: [0,1],
            delay: function(el, index) {
              return 1000;
            },
            autoplay:false,
            loop:false
          }),
        anime({
            targets: '.item-3-text',
            translateX: [500,0],
            opacity: [0,1],
            delay: function(el, index) {
              return 1500;
            },
            autoplay:false,
            loop:false
          })
      ]
    } 

    var showAnimations = {
      'item-1': function(){
        console.log('hola 1!');
      },
      'item-2': function(){
        console.log('hola 2!');
      },
      'item-3': function(){
        console.log('hola 3!');
      }
    };

    var hideAnimations = {
      'item-1': function(){
        console.log('chau 1!');

      },
      'item-2': function(){
        console.log('chau 2!');
      },
      'item-3': function(){
        console.log('chau 3!');
      }
    };

    function show(slide){
      console.log('show ' + slide);
      if(animations[slide]){
        _.each(animations[slide],function(a){
          a.play();
        });       
      }
      if(showAnimations[slide]){                
        showAnimations[slide]();
      }

    }

    function hide(slide){
      console.log('hide ' + slide);
      if(animations[slide]){
        _.each(animations[slide],function(a){
          a.seek(0);
        });        
      }
      if(hideAnimations[slide]){                
        hideAnimations[slide]();
      }
    }

    _.each(animations,function(e,i){
      hide(i);
      return e;
    });
    show($scope.old);

  });
