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
    'ngSanitize',
    'slugifier'
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
  .service('DataService', function ($http, $q, Slug) {
 
    var data = undefined;

    var cleanData = function(reg){
      //slug
      reg.entorno_slug = (reg.entorno)?Slug.slugify(reg.entorno):null;

      //arrays
      reg.tipo = (reg.tipo)?reg.tipo.split('|'):[];
      reg.comuna = (reg.comuna)?reg.comuna.split('|'):[];
      reg.barrio = (reg.barrio)?reg.barrio.split('|'):[];
      reg.licitacion_oferta_empresas = (reg.licitacion_oferta_empresas)?reg.licitacion_oferta_empresas.split('|'):[];

      //numbers
      reg.id = parseInt(reg.id);
      reg.licitacion_anio = (reg.licitacion_anio)?parseInt(reg.licitacion_anio):null;
      reg.monto_contrato = (reg.monto_contrato)?parseFloat(reg.monto_contrato):null;
      reg.licitacion_presupuesto_oficial = (reg.licitacion_presupuesto_oficial)?parseFloat(reg.licitacion_presupuesto_oficial):null;
      reg.plazo_meses = (reg.plazo_meses)?parseInt(reg.plazo_meses):null;
      reg.porcentaje_avance = (reg.porcentaje_avance)?parseFloat(reg.porcentaje_avance):null;

      return reg;
    };

    var getUrl = function(){
      if(!window.MDUYT_CONFIG){
        console.error('Archivo de configuración inexistente, utilizando configuración default de desarrollo.');
        window.MDUYT_CONFIG = {
          BASE_URL: 'http://api.topranking.link/',
          HOME_CSV: 'https://goo.gl/vcb6oX'
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
            return a.id==parseInt(id);
          });
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
            return a.entorno_slug==entorno;
          });
          deferred.resolve(result);
        });
      result = deferred.promise;
      return $q.when(result);
    };

    this.getAll = function() {
      var result = undefined;
      var deferred = $q.defer();
      this.retrieveAll()
        .then(function(all){
          deferred.resolve(all);
        });
      result = deferred.promise;
      return $q.when(result);
    };

    this.retrieveAll = function() {

      if (!data) {

        var deferred = $q.defer();
        $http.jsonp(getUrl())
        .then(function(result) {
          data = result.data.map(cleanData);
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
  .run(function($rootScope,$interval) {

  });
