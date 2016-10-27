'use strict';

angular.module('obrasMduytApp')
  .controller('BuscadorCtrl', function ($scope,DataService,$routeParams,NgTableParams) {

  	$scope.pymChild = new window.pym.Child({ polling: 1000 });
    $scope.pymChild.sendHeight();

    DataService.getAll()
      .then(function(data){
        console.log(data);
        //$scope.obras = data;

        var selects = {
          comunas: d3.keys(
                    d3.nest()
                      .key(function(d){return d.comuna[0];})
                      .map(data)
                  ).map(function(c){
                    return {id:c,title:'Comuna '+c};
                  }),
          etapas: d3.keys(
                    d3.nest()
                      .key(function(d){return d.etapa;})
                      .map(data)
                  ).map(function(e){
                    return {id:e,title:e};
                  })
        };

        $scope.cols = [
          { field: "comuna", title: "Comuna", filter: { comuna: "select" }, filterData: selects.comunas, show: true, sortable: "comuna" },
          { field: "nombre", title: "Nombre", filter: { nombre: "text" }, show: true, sortable: "nombre" },
          { field: "etapa", title: "Etapa", filter:{ etapa: "select"}, filterData: selects.etapas, show: true, sortable: "etapa" },
          { field: "monto_contrato", title: "Monto Contrato", filter: { monto_contrato: "number" }, show: true, sortable: "monto_contrato" }
        ];

        $scope.tableParams = new NgTableParams({
          sorting: { comuna: "asc" },
          page:1,
          count:10
        }, {
          dataset: data,
           counts:[10,25,50]
        });

    });

  });
