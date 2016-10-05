'use strict';
$.urlParam = function(url,name){
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(url);
    if (results===null){
       return null;
    }
    else{
       return results[1] || 0;
    }
};

/**
 * @ngdoc overview
 * @name obrasMduytApp
 * @description
 * # obrasMduytApp
 *
 * Main module of the application.
 */
angular
  .module('obrasMduytApp', [
    'ngRoute',
    'ngSanitize'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/home', {templateUrl: 'views/home.html',controller: 'HomeCtrl',controllerAs: 'home'})
      .when('/obra/:id', {templateUrl: 'views/obra.html',controller: 'ObraCtrl',controllerAs: 'obra'})
      .when('/entorno/:entorno', {templateUrl: 'views/entorno.html',controller: 'EntornoCtrl',controllerAs: 'entorno'})
      .otherwise({
        redirectTo: '/home'
      });
  })
  .service('DataService', function ($http, $q) {
 
    var data = undefined;

    var cleanData = function(reg){
      reg.cumplimiento = parseInt(reg.cumplimiento);
      reg.numero = parseInt(reg.numero);
      return reg;
    };

    var getUrl = function(){
      if(!window.MDUYT_CONFIG){
        console.error('Archivo de configuración inexistente, utilizando configuración default de desarrollo.');
        window.MDUYT_CONFIG = {
          BASE_URL: 'http://api.topranking.link/',
          HOME_CSV: 'https://goo.gl/w0wnOj'
        };

      }
      return window.MDUYT_CONFIG.BASE_URL + '?source_format=csv&source='+window.MDUYT_CONFIG.HOME_CSV + '&callback=JSON_CALLBACK';
    };

    this.getById = function(id) {
      var result = undefined;
      var deferred = $q.defer();
      this.retrieveAll()
        .then(function(all){
          result = all.filter(function(a){
            return a.numero==parseInt(id);
          });
          result = result.map(cleanData);
          deferred.resolve(result[0]);
        });
      result = deferred.promise;
      return $q.when(result);
    };

    this.getByEntorno = function(entorno) {
      var result = undefined;
      var deferred = $q.defer();
      this.retrieveAll()
        .then(function(all){
          result = all.filter(function(a){
            return a.cumplimiento==parseInt(entorno);
          });
          result = result.map(cleanData);
          deferred.resolve(result);
        });
      result = deferred.promise;
      return $q.when(result);
    };

    this.getAll = function(entorno) {
      var result = undefined;
      var deferred = $q.defer();
      this.retrieveAll()
        .then(function(all){
          result = all.map(cleanData);
          deferred.resolve(result);
        });
      result = deferred.promise;
      return $q.when(result);
    };

    this.retrieveAll = function() {

      if (!data) {

        var deferred = $q.defer();
        $http.jsonp(getUrl())
        .then(function(result) {
          data = result.data;
          deferred.resolve(data);
        }, function(error) {
          data = error;
          deferred.reject(error);
        });

        data = deferred.promise;
      }

      return $q.when(data);
    };
 
  })
  .service('UrlService', function () {
      if(!window.MDUYT_CONFIG){
        console.error('Archivo de configuración inexistente, utilizando configuración default de desarrollo.');
        window.MDUYT_CONFIG = {
          BASE_URL: 'http://api.topranking.link/',
          HOME_CSV: 'https://goo.gl/w0wnOj'
        };

      }
      this.baseUrl = window.MDUYT_CONFIG.BASE_URL;
      this.urls = {
        'home': this.baseUrl + '?source_format=csv&source='+window.MDUYT_CONFIG.HOME_CSV
      };
      this.getUrlByPage = function(page) {
          return this.urls[page] + '&callback=JSON_CALLBACK';
      };
      this.getUrlByCsv = function(csv) {
          return this.baseUrl + '?source_format=csv&source='+csv+ '&callback=JSON_CALLBACK';
      };
  })
  .run(function($rootScope,$interval) {

  });
