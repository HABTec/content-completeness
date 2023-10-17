//Controller for column show/hide
var contentCompleteness = angular.module('contentCompleteness');
contentCompleteness.controller('DisplayModeController',
        function($scope, $modalInstance) {
    
    $scope.close = function () {
      $modalInstance.close($scope.gridColumns);
    };
});