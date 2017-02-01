'use strict';

angular.module('obrasMduytApp')
.directive('progressLine', function() {
    return {
        restrict: 'E',
        replace: true,
        scope: {
          callback: '=callback',
          class: '=class'
        },
        controller: function($scope, $timeout, $http) {

            $scope.loading = true;

            var renderLine = function(){

              var obra = $scope.obra;
              var inicio = moment(obra.fecha_inicio);
              var fin = moment(obra.fecha_fin_inicial);
              var now = moment();

              var percentageToTime = d3.scale.linear()
                                  .domain([0,100])
                                  .range([inicio.valueOf(), fin.valueOf()]);

              var value = now.valueOf();
                            var progreso = parseFloat(obra.porcentaje_avance);
                            if (progreso < 100){
                              value = percentageToTime(progreso);
                            }



               var data = [ {label:"Category 1", value:value}];



    var axisMargin = 0,
            margin = 0,
            valueMargin = 0,
            width =document.querySelectorAll(".chart")[0].clientWidth,
            height = 55,
            barHeight = 5,
            barPadding = 0,
            data, bar, svg, scale, xAxis, labelWidth = 0;

var timeToWidth = d3.scale.linear()
                      .domain([inicio.valueOf(), fin.valueOf()])
                      .range([0, width]);



   var max =  fin.valueOf();

   d3.select(".chart").html("");
    var svg = d3.select('.chart')
            .append("svg")
            .attr("width", width)
            .attr("height", height);


    bar = svg.selectAll("g")
            .data(data)
            .enter()
            .append("g");

    bar.attr("class", "bar")
            .attr("cx",0)
            .attr("transform", function(d, i) {
                return "translate(" + margin + "," + (i * (barHeight + barPadding) + barPadding) + ")";
            });



    scale = timeToWidth;

    xAxis = d3.svg.axis()
            .scale(scale)
            .tickSize(2)
            .orient("bottom");

    bar.append("rect")
            .attr("transform", "translate(0, 15)")
            .attr("height", 1)
            .attr("width", function(d){
                return scale(percentageToTime(100));
            });

    /*bar.append("text")
            .attr("class", "value")
            .attr("y", 30)
            .attr("dx", 0) //margin right
            .attr("dy", "0") //vertical align middle
            .attr("text-anchor", "end")
            .text(function(d){
                return ("↓");
            })
            .attr("x", function(d){
                var width = this.getBBox().width;
                return Math.max(width + valueMargin, scale(d.value));
            });

    bar.append("text")
            .attr("class", "value")
            .attr("y", 18)
            .attr("dx", 5) //margin right
            .attr("dy", "0") //vertical align middle
            .attr("text-anchor", "end")
            .text(function(d){
                return ("Hoy");
            })
            .attr("x", function(d){
                var width = this.getBBox().width;
                return Math.max(width + valueMargin, scale(d.value));
            });*/

    svg.append('g').append("text")
            .attr("class", "value")
            .attr("y", 30)
            .attr("x", 0)
            .attr("dx", 0) //margin right
            .attr("dy", "0") //vertical align middle
            .attr("text-anchor", "start")
            .text("Inicio");

    svg.append('g').append("text")
            .attr("class", "value")
            .attr("y", 45)
            .attr("x", 0)
            .attr("dx", 0) //margin right
            .attr("dy", "0") //vertical align middle
            .attr("text-anchor", "start")
            .text(inicio.format('MM-YYYY'));

    svg.append('g').append("text")
            .attr("class", "value")
            .attr("y", 30)
            .attr("x", width)
            .attr("dx", 0) //margin right
            .attr("dy", "0") //vertical align middle
            .attr("text-anchor", "end")
            .text("Fin");

    svg.append('g').append("text")
            .attr("class", "value")
            .attr("y", 45)
            .attr("x", width)
            .attr("dx", 0) //margin right
            .attr("dy", "0") //vertical align middle
            .attr("text-anchor", "end")
            .text(fin.format('MM-YYYY'));

          }


            var drawLineCb = function(o){


                $scope.obra = o;

                setTimeout(renderLine,100);

            }
            $scope.resizeFunction= renderLine;
            $scope.callback(drawLineCb);

            var id;
            $(window).resize(function() {
                clearTimeout(id);
                id = setTimeout(function(){
                  if($scope.resizeFunction){
                    $scope.resizeFunction();
                  }
                }, 500);
            });


        },
        template: '<div class="chart"></div>'
    };

});
