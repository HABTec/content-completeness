//Controller for column show/hide
var contentCompleteness = angular.module('contentCompleteness');

contentCompleteness.controller('LeftBarMenuController',
        function($scope,
                $location) {
    $scope.showHome = function(){
        selection.load();
        $location.path('/').search();
    }; 
    
    $scope.showReportTypes = function(){
        $location.path('/report-types').search();
    };
});