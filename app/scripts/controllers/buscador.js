'use strict';

angular.module('obrasMduytApp')
  .controller('BuscadorCtrl', function ($scope,DataService,$routeParams,NgTableParams,$filter,$sce) {

  	$scope.pymChild = new window.pym.Child({ polling: 1000 });
    $scope.pymChild.sendHeight();

    DataService.getAll()
      .then(function(data){
        console.log(data);
        //$scope.obras = data;

        var selects = {
          comunas: d3.keys(
                    d3.nest()
                      .key(function(d){return d.comuna;})
                      .map(data.filter(function(d){
                        return (d.comuna!==null);
                      }))
                  )
                  .map(function(c){
                    return {id:c.trim(),title:'Comuna '+c};
                  }),
          etapas: d3.keys(
                    d3.nest()
                      .key(function(d){return d.etapa;})
                      .map(data)
                  ).map(function(e){
                    return {id:e,title:e};
                  })
        };

        selects.comunas.unshift({id:'',title:'TODAS'});
        selects.etapas.unshift({id:'',title:'TODAS'});

        function renderNormalValue($scope, row) {
          return row[this.field];
        }

        function renderMoneyValue($scope, row) {
          var value = '-';
          if(row[this.field]) {
            var value = $filter('currency')(row[this.field], '$', 0).replace(/\,/g,'.');
          }
          return $sce.trustAsHtml('<p class="text-right">'+value+'</p>');
        }

        function renderLinkValue($scope, row) {
          var value = row[this.field];
          var html = '';
          if(value && value != ''){
            html = "<a href='"+value+"' class='btn btn-default btn-xs btn-block' target='_blank'>Más información</a>";
          }
          return $sce.trustAsHtml(html);
        }

        $scope.cols = [
          { 
            field: "comuna", 
            title: "Comuna", 
            filter: { comuna: "select" }, 
            filterData: selects.comunas, 
            show: true, 
            sortable: "comuna",
            getValue: renderNormalValue
          },
          { 
            field: "nombre",
            title: "Nombre", 
            filter: { nombre: "text" }, 
            show: true, 
            sortable: "nombre",
            getValue: renderNormalValue
          },
          { 
            field: "area_responsable",
            title: "Área", 
            filter: { area_responsable: "text" }, 
            show: true, 
            sortable: "area_responsable",
            getValue: renderNormalValue
          },
          { 
            field: "licitacion_empresa",
            title: "Empresa", 
            filter: { licitacion_empresa: "text" }, 
            show: true, 
            sortable: "licitacion_empresa",
            getValue: renderNormalValue
          },
          { 
            field: "etapa", 
            title: "Etapa", 
            filter:{ etapa: "select"}, 
            filterData: selects.etapas, 
            show: true, 
            sortable: "etapa",
            getValue: renderNormalValue
          },
          { 
            field: "monto_contrato", 
            title: "Monto Contrato", 
            filter: { monto_contrato: "number" }, 
            show: true, 
            sortable: "monto_contrato",
            getValue: renderMoneyValue
          },
          { 
            field: "link_interno", 
            title: "", 
            filter: false, 
            show: true, 
            sortable: false,
            getValue: renderLinkValue
          }
        ];

        $scope.tableParams = new NgTableParams({
          sorting: { comuna: "asc" },
          filter: { comuna: "", etapa: "" },
          page:1,
          count:10
        }, {
          dataset: data,
           counts:[10,25,50]
        });


        var showCols = {
          lg:["comuna","nombre","area_responsable","licitacion_empresa","etapa","monto_contrato","link_interno"],
          md:["comuna","nombre","licitacion_empresa","etapa","monto_contrato","link_interno"],
          sm:["comuna","nombre","etapa","monto_contrato","link_interno"],
          xs:["nombre","etapa","monto_contrato","link_interno"]
        }

        function toggleColums(size){
          $scope.cols.forEach(function(c){
            if(showCols[size].indexOf(c.field)>-1){
              c.show = true;
            } else {
              c.show = false;
            }
          });
          $scope.$apply();
        }

        function checkColumns(){
          var w = d3.select('#buscador-table').node().getBoundingClientRect().width

            if(w>700){
              toggleColums('lg');
            } else if(w<=700 && w>650){
              toggleColums('md');
            } else if(w<=650 && w>600){
              toggleColums('sm');
            } else if(w<=600){
              toggleColums('xs');
            }
        }

        //hide columns on resize
        $scope.timeoutId;
        window.$(window).resize(function() {
          clearTimeout($scope.timeoutId);
          $scope.timeoutId = setTimeout(function(){

              checkColumns()

          }, 1000);
        });

    });

  });
