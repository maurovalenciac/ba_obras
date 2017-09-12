'use strict';

angular.module('obrasMduytApp')
.directive('statsHome', function($timeout) {
	return {
	        restrict: 'E',
	        scope: {
	            obras: '='
	        },
	        template: "<div id='stats-home' class='row' ng-show='obras'>"+
		        		  "<div class='col-md-6'>"+
		        		  	"<h5>Total de inversión:</h5>"+
		        		  	"<span>{{total.inversion | currency:$ :0}}</span>"+
		        		  "</div>"+
		        		  "<div class='col-md-3'>"+
		        		 	"<h5>Total de obras:</h5>"+
		        		  	"<span>{{total.obras}}</span>"+
		        		  "</div>"+
		        		  "<div class='col-md-3'>"+
		        		  	"<h5>Finalizadas:</h5>"+
		        		  	"<span>{{total.porcentaje_finalizadas}}%</span>"+
		        		  "</div>"+
	        		  "</div>"
	        		  ,
	        replace: true,        
	        link: function($scope, elm, attrs) {     
	        	$scope.totalTemp = {
	        		inversion:0,
	        		obras:0,
	        		finalizadas:0
	        	}

	        	$scope.total = {
	        		inversion:0,
	        		obras:0,
	        		porcentaje_finalizadas:0
	        	}

	        	var obras;
	        	var chart = {};

	        	$scope.$watch(attrs.obras, function(value) {
	        		if(value){
	        			obras = angular.copy(value);
			      		generateTotal();
	        		}
			    });

			    function generateTotal(){
			    	_.map(obras,function(o){
			    		$scope.totalTemp.obras+=1;
			    		setTotal($scope.totalTemp.obras,"obras");

			    		if(o.monto_contrato){
				    		$scope.totalTemp.inversion+=o.monto_contrato;
				    		setTotal($scope.totalTemp.inversion,"inversion");
			    		}

			    		if(o.porcentaje_avance == 100){
			    			$scope.totalTemp.finalizadas+=1;
			    			setTotal(Math.round(($scope.totalTemp.finalizadas*100)/$scope.totalTemp.obras),"porcentaje_finalizadas");
			    		}


			    	});
			    }

			    function setTotal(number,dimension){
			    	$timeout(function(){
			    		$scope.total[dimension] = number;
			    	},200);
			    }
	        }
	    };
	});