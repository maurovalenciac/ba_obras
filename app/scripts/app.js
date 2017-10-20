"use strict";

angular
  .module("obrasMduytApp", [
    "ngRoute",
    "ngSanitize",
    "slugifier",
    "angular-flexslider",
    "leaflet-directive",
    "ngTable"
  ])
  .config(function(
    $routeProvider,
    $logProvider,
    $httpProvider,
    $locationProvider,
    $provide
  ) {
    $routeProvider
      .when("/home", {
        templateUrl: "views/home.html",
        controller: "HomeCtrl",
        controllerAs: "home"
      })
      .when("/buscador", {
        templateUrl: "views/buscador.html",
        controller: "BuscadorCtrl",
        controllerAs: "buscador"
      })
      .when("/obra/:id", {
        templateUrl: "views/obra.html",
        controller: "ObraCtrl",
        controllerAs: "obra"
      })
      .when("/entorno/:entorno", {
        templateUrl: "views/entorno.html",
        controller: "EntornoCtrl",
        controllerAs: "entorno"
      })
      .when("/historia", {
        templateUrl: "views/historia.html",
        controller: "HistoriaCtrl",
        controllerAs: "historia"
      })
      .when("/mapas", {
        templateUrl: "views/mapas.html",
        controller: "MapasCtrl",
        controllerAs: "mapas"
      })
      .otherwise({
        redirectTo: "/home"
      });
    $logProvider.debugEnabled(false);
    $locationProvider.hashPrefix("");

    $provide.decorator("$locale", [
      "$delegate",
      function($delegate) {
        $delegate.NUMBER_FORMATS.DECIMAL_SEP = ",";
        $delegate.NUMBER_FORMATS.GROUP_SEP = ".";
        return $delegate;
      }
    ]);
  })
  .service("DataService", function($http, $q, Slug, $sce) {
    var data, dataMapas;

    var getMontoRange = function(n) {
      var cincuentaM = 50000000;
      /*
        0 a 50 millones
        50 millones a 100 millones
        100 millones a 150 millones
        150 millones para adelante
      */
      var range = "monto_mas_50";
      if (_.inRange(n, 0, cincuentaM)) {
        range = "monto_0_50";
      } else if (_.inRange(n, cincuentaM, cincuentaM * 2)) {
        range = "monto_50_100";
      } else if (_.inRange(n, cincuentaM * 2, cincuentaM * 3)) {
        range = "monto_100_150";
      } else {
        //más de 150 millones
        range = "monto_mas_50";
      }
      return range;
    };

    var cleanData = function(oldReg) {
      var reg = {};
      for (var key in oldReg) {
        if (oldReg.hasOwnProperty(key)) {
          reg[key.toLowerCase()] = oldReg[key];
        }
      }

      reg.compromiso = reg.compromiso == "SI" ? true : false;

      //arrays
      //reg.tipo = (reg.tipo)?reg.tipo.split('|'):[];
      var comunas = reg.comuna ? reg.comuna.split("|") : [null];
      reg.comuna = comunas[0];
      reg.comuna = reg.comuna ? parseInt(reg.comuna.trim()) : reg.comuna;
      reg.barrio = reg.barrio ? reg.barrio.split("|") : [];
      reg.licitacion_oferta_empresa = reg.licitacion_oferta_empresa
        ? reg.licitacion_oferta_empresa
        : null;

      //numbers
      reg.id = parseInt(reg.id);
      reg.licitacion_anio = reg.licitacion_anio
        ? parseInt(reg.licitacion_anio.trim())
        : null;
      reg.monto_contrato = reg.monto_contrato
        ? parseFloat(reg.monto_contrato.trim())
        : null;
      reg.licitacion_presupuesto_oficial = reg.licitacion_presupuesto_oficial
        ? parseFloat(reg.licitacion_presupuesto_oficial.trim())
        : null;
      reg.plazo_meses = reg.plazo_meses
        ? parseInt(reg.plazo_meses.trim())
        : null;
      reg.porcentaje_avance = reg.porcentaje_avance
        ? reg.porcentaje_avance.trim()
        : "";
      reg.porcentaje_avance.trim();
      reg.porcentaje_avance = isNaN(reg.porcentaje_avance)
        ? ""
        : reg.porcentaje_avance;
      reg.porcentaje_avance = reg.porcentaje_avance
        ? parseFloat(reg.porcentaje_avance)
        : null;

      reg.porcentaje_avance =
        reg.etapa === "Finalizada" ? 100 : reg.porcentaje_avance;

      reg.hideDates =
        reg.etapa === "En proyecto" || reg.etapa === "En licitación";

      reg.fotos = [];
      for (var i = 1; i <= 4; i++) {
        var key = "imagen_" + i;
        if (reg[key]) {
          reg.fotos[i - 1] = reg[key];
        }
      }

      //slug
      reg.entorno_slug = reg.entorno ? Slug.slugify(reg.entorno.trim()) : null;

      reg.etapa_slug = reg.etapa ? Slug.slugify(reg.etapa.trim()) : null;

      reg.tipo_slug = reg.tipo ? Slug.slugify(reg.tipo.trim()) : null;

      reg.area_slug = reg.area_responsable
        ? Slug.slugify(reg.area_responsable.trim())
        : null;

      reg.red_slug = reg.red ? Slug.slugify(reg.red.trim()) : null;

      reg.monto_slug = reg.monto_contrato
        ? getMontoRange(reg.monto_contrato)
        : null;

      return reg;
    };

    var etapas_validas = [
      "en-proyecto",
      "en-licitacion",
      "en-ejecucion",
      "finalizada"
    ];

    var filterData = function(reg) {
      var cond1 = etapas_validas.indexOf(reg.etapa_slug) > -1;
      return cond1;
    };

    var verifyConfig = function() {
      if (!window.MDUYT_CONFIG) {
        console.warn(
          "Archivo de configuración inexistente, utilizando configuración default de desarrollo."
        );
        window.MDUYT_CONFIG = {
          BASE_URL: "http://api.topranking.link/",
          HOME_CSV: "https://goo.gl/vcb6oX",
          MAPAS_CSV: "https://goo.gl/YYV2E7"
        };
        if (window.location.href.indexOf("dist") > -1) {
          L.Icon.Default.imagePath = "/dist/images";
        } else {
          L.Icon.Default.imagePath = "images";
        }
      } else {
      }
    };

    var getUrl = function() {
      verifyConfig();
      var url =
        window.MDUYT_CONFIG.BASE_URL +
        "?source_format=csv&source=" +
        window.MDUYT_CONFIG.HOME_CSV;
      return $sce.trustAsResourceUrl(url);
    };

    var getUrlMapas = function() {
      verifyConfig();
      var url = "";
      if (window.MDUYT_CONFIG.MAPAS_CSV) {
        url =
          window.MDUYT_CONFIG.BASE_URL +
          "?source_format=csv&source=" +
          window.MDUYT_CONFIG.MAPAS_CSV;
      }
      return $sce.trustAsResourceUrl(url);
    };

    this.getById = function(id) {
      var result;
      var deferred = $q.defer();
      this.retrieveAll().then(function(all) {
        result = all.filter(function(a) {
          return a.id === parseInt(id);
        });
        deferred.resolve(result[0]);
      });
      result = deferred.promise;
      return $q.when(result);
    };

    this.getByEntorno = function(entorno) {
      var result;
      var deferred = $q.defer();
      this.retrieveAll().then(function(all) {
        result = all.filter(function(a) {
          return a.entorno_slug === entorno;
        });
        deferred.resolve(result);
      });
      result = deferred.promise;
      return $q.when(result);
    };

    this.getAll = function() {
      var result;
      var deferred = $q.defer();
      this.retrieveAll().then(function(all) {
        deferred.resolve(all);
      });
      result = deferred.promise;
      return $q.when(result);
    };

    this.getMapas = function() {
      var result;
      var deferred = $q.defer();
      this.retrieveMapas().then(function(all) {
        deferred.resolve(all);
      });
      result = deferred.promise;
      return $q.when(result);
    };

    this.retrieveMapas = function() {
      var urlMapas = getUrlMapas();

      var deferred = $q.defer();

      if (urlMapas == "") {
        dataMapas = [];
      }

      if (!dataMapas) {
        $http.jsonp(urlMapas).then(
          function(result) {
            dataMapas = result.data;
            deferred.resolve(dataMapas);
          },
          function(error) {
            console.log("error: ", error);
            data = error;
            deferred.reject(error);
          }
        );

        dataMapas = deferred.promise;
      }

      return $q.when(dataMapas);
    };

    this.retrieveAll = function() {
      if (!data) {
        var deferred = $q.defer();
        $http.jsonp(getUrl()).then(
          function(result) {
            data = result.data.map(cleanData).filter(filterData);
            deferred.resolve(data);
          },
          function(error) {
            data = error;
            deferred.reject(error);
          }
        );

        data = deferred.promise;
      }

      return $q.when(data);
    };
  })
  .filter("capitalize", function() {
    return function(input) {
      return !!input
        ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase()
        : "";
    };
  })
  .filter("cleanunderscore", function() {
    return function(input) {
      return input.replace(/_/g, " ");
    };
  })
  .run(function() {});
