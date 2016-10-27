'use strict';
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
    'slugifier',
    'angular-flexslider',
    'leaflet-directive',
    'ngTable'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/home', {templateUrl: 'views/home.html',controller: 'HomeCtrl',controllerAs: 'home'})
      .when('/buscador', {templateUrl: 'views/buscador.html',controller: 'BuscadorCtrl',controllerAs: 'buscador'})
      .when('/obra/:id', {templateUrl: 'views/obra.html',controller: 'ObraCtrl',controllerAs: 'obra'})
      .when('/entorno/:entorno', {templateUrl: 'views/entorno.html',controller: 'EntornoCtrl',controllerAs: 'entorno'})
      .otherwise({
        redirectTo: '/home'
      });
  })
  .service('DataService', function ($http, $q, Slug) {

    var data;

    var cleanData = function(reg){
      //slug
      reg.entorno_slug = (reg.entorno)?Slug.slugify(reg.entorno):null;
      
      reg.etapa_slug = (reg.etapa)?Slug.slugify(reg.etapa):null;
      
      reg.tipo_slug = (reg.tipo)?Slug.slugify(reg.tipo):null;

      //arrays
      //reg.tipo = (reg.tipo)?reg.tipo.split('|'):[];
      reg.comuna = (reg.comuna)?reg.comuna.split('|'):[];
      reg.barrio = (reg.barrio)?reg.barrio.split('|'):[];
      reg.licitacion_oferta_empresas = (reg.licitacion_oferta_empresas)?reg.licitacion_oferta_empresas.split('|'):[];

      //numbers
      reg.id = parseInt(reg.id);
      reg.licitacion_anio = (reg.licitacion_anio)?parseInt(reg.licitacion_anio.trim()):null;
      reg.monto_contrato = (reg.monto_contrato)?parseFloat(reg.monto_contrato.trim()):null;
      reg.licitacion_presupuesto_oficial = (reg.licitacion_presupuesto_oficial)?parseFloat(reg.licitacion_presupuesto_oficial.trim()):null;
      reg.plazo_meses = (reg.plazo_meses)?parseInt(reg.plazo_meses.trim()):null;
      reg.porcentaje_avance = (reg.porcentaje_avance)?parseFloat(reg.porcentaje_avance.trim()):null;

      reg.fotos = [];
      for (var i = 1; i <= 4; i++) {
        var key = 'imagen_'+i;
        if (reg[key]){
          reg.fotos.push(reg[key]);
        }
      }

      return reg;
    };

    var etapas_validas = ['en-proyecto','en-licitacion','en-ejecucion','finalizada'];

    var filterData = function(reg){
      var cond1 = (etapas_validas.indexOf(reg.etapa_slug)>-1);
      return cond1;
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
      var result;
      var deferred = $q.defer();
      this.retrieveAll()
        .then(function(all){
          result = all.filter(function(a){
            return a.id===parseInt(id);
          });
          deferred.resolve(result[0]);
        });
      result = deferred.promise;
      return $q.when(result);
    };

    this.getByEntorno = function(entorno) {
      var result;
      var deferred = $q.defer();
      this.retrieveAll()
        .then(function(all){
          result = all.filter(function(a){
            return a.entorno_slug===entorno;
          });
          deferred.resolve(result);
        });
      result = deferred.promise;
      return $q.when(result);
    };

    this.getAll = function() {
      var result;
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
          data = result.data
            .map(cleanData)
            .filter(filterData);
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
  .run(function() {

  });
