/* global angular */

'use strict';

var contentCompleteness = angular.module('contentCompleteness');

//Controller for settings page
contentCompleteness.controller('contentCompletnessController',
        function($rootScope, $scope,
                $translate,
                orderByFilter,
                CustomPeriodService,
                MetaDataFactory,
                DataEntryUtils,
                DataValueService) {
    $scope.periodOffset = 0;
    $scope.maxOptionSize = 30;
    $scope.dataValues = {expected: {}, actual: {}, rate: {}, ontime: {}, timely: {}};
    $scope.model = {
        dataSets: [],
        reportColumn: 'PERIOD',
        categoryCombos: [],
        filterGroups: [],
        categoryOptionGroupSets: {},
        showDiseaseGroup: false,
        periods: [],
        selectedPeriods: [],
        includeChildren: true,
        periodTypes: [],
        columns: [],
        reportReady: false,
        reportStarted: false,
        showReportFilters: true,
        showDiseaseFilters: true,
        filterCompleteness: false,
        selectedPeriodType: null,
        metaDataLoaded: false,
        valueExists: false,
        headers: [],
        sortHeader: null,
        contentCoverage: 0
    };

    $rootScope.DHIS2URL = env.dhisConfig.apiRoot;
    downloadMetaData( env.dhisConfig.apiRoot ).then(function(){

        console.log( 'Finished loading meta-data' );

        MetaDataFactory.getAll('organisationUnitGroupSets').then(function( ougs ){

            $scope.model.orgUnitGroupSets = ougs;

            MetaDataFactory.getAll('dataSets').then(function(ds){
                $scope.model.dataSets = ds;

                MetaDataFactory.getAll('periodTypes').then(function(pts){
                    pts = orderByFilter(pts, '-frequencyOrder').reverse();
                    $scope.model.periodTypes = pts;
                    selectionTreeSelection.setMultipleSelectionAllowed( true );
                    selectionTree.clearSelectedOrganisationUnitsAndBuildTree();

                    $scope.model.metaDataLoaded = true;                    
                });
            });
        });
    });

    //watch for selection of org unit from tree
    $scope.$watch('selectedOrgUnits', function() {
        $scope.model.includeChildren = true;
        if( angular.isObject($scope.selectedOrgUnits) ) {
        }
    });

    $scope.$watch('model.selectedDataSet', function(){
        $scope.model.reportReady = false;
        $scope.model.reportStarted = false;
        $scope.model.periods = [];
        $scope.model.selectedPeriods = [];
        $scope.model.indicators = [];
        $scope.model.columns = [];
        $scope.model.filterCompleteness = false;
        $scope.dataValues = {expected: {}, actual: {}, rate: {}, timely: {}};
        if( angular.isObject( $scope.model.selectedDataSet ) ) {
            $scope.model.selectedAttributeCategoryCombo = null;
            if( $scope.model.selectedDataSet &&
                $scope.model.selectedDataSet.categoryCombo &&
                $scope.model.selectedDataSet.categoryCombo.id ){

                $scope.model.selectedAttributeCategoryCombo = $scope.model.categoryCombos[$scope.model.selectedDataSet.categoryCombo.id];
            }
            
            $scope.model.selectedPeriodType = $scope.model.selectedDataSet.periodType;
            
            $scope.model.periods = [];
            $scope.model.selectedPeriods = [];
            
            var opts = {
                periodType: $scope.model.selectedPeriodType,
                periodOffset: $scope.periodOffset,
                futurePeriods: 1
            };
            $scope.model.periods = CustomPeriodService.getReportPeriods( opts );
        }
    });

    $scope.getPeriods = function(mode){
        if( $scope.model.selectedPeriodType ){
            var opts = {
                periodType: $scope.model.selectedPeriodType,
                periodOffset: mode === 'NXT' ? ++$scope.periodOffset: --$scope.periodOffset,
                futurePeriods: 1
            };
            $scope.model.periods = CustomPeriodService.getReportPeriods( opts );
        }
    };

    $scope.generateReport = function(){

        if( !$scope.selectedOrgUnits || $scope.selectedOrgUnits.length < 1 ){
            DataEntryUtils.notify('error', 'please_select_orgunit');
            return;
        }

        if( !$scope.model.selectedPeriods || $scope.model.selectedPeriods.length < 1 ){
            DataEntryUtils.notify('error', 'please_select_period');
            return;
        }

        if( !$scope.model.selectedDataSet || !$scope.model.selectedDataSet.id ){
            DataEntryUtils.notify('error', 'please_select_dataset');
            return;
        }
        
        if( !$scope.model.selectedDataSet.organisationUnits || $scope.model.selectedDataSet.organisationUnits.length === 0 ){
            DataEntryUtils.notify('error', 'dataset_has_no_orgunit');
            return;
        }
        
        $scope.model.headers = [
            {id: 'name', name: $translate.instant('org_unit')}
        ];

        angular.forEach($scope.model.selectedPeriods, function(pe){
            $scope.model.headers.push({id: pe.id, name: pe.name});
        });
        
        $scope.model.expectedData = $scope.model.selectedDataSet.dataElements.length;            
        var greyFields = 0;
        if ( $scope.model.selectedDataSet.sections ){
            angular.forEach($scope.model.selectedDataSet.sections, function(section){
                if ( section.greyedFields && section.greyedFields.length ){
                    greyFields += section.greyedFields.length;
                }
            });
        }

        $scope.model.expectedData -= greyFields;

        var dataValuesByParent = {};
        var ouParent = {};
        $scope.model.dataValues = [];
        //var collectingUnits = 0;
        if ( $scope.model.includeChildren ){
            angular.forEach($scope.model.selectedDataSet.organisationUnits, function(dsOu){
                angular.forEach($scope.selectedOrgUnits, function(ou){
                    if ( dsOu.path.indexOf(ou.id) !== -1 ){
                        angular.forEach($scope.model.selectedPeriods, function(p){
                            if(!dataValuesByParent[ou.id]){
                                dataValuesByParent[ou.id] = {name: ou.name, children: [] };
                                dataValuesByParent[ou.id][p.id] = {data: 0, percent: 0};
                            }
                            if (!dataValuesByParent[ou.id][p.id]){
                                dataValuesByParent[ou.id][p.id] = {data: 0, percent: 0};
                            }                            
                            //dataValuesByParent[ou.id][p.id].children.push( dsOu.id );
                        });
                        dataValuesByParent[ou.id].children.push( dsOu.id );
                        ouParent[dsOu.id] = ou.id;
                    }
                    else{
                        //DataEntryUtils.notify('error', ou.name);
                        //console.log('not assigned:  ', ou.name);
                    }
                });
            });
        }

        var contentUrl = "dataSet=" + $scope.model.selectedDataSet.id;
        contentUrl += "&children=" + $scope.model.includeChildren;        
        contentUrl += "&orgUnit=" + $.map($scope.selectedOrgUnits, function(ou){return ou.id;}).join(','); 
        contentUrl += "&period=" + $.map($scope.model.selectedPeriods, function(pe){return pe.id;}).join(',');
       
        
        $scope.model.reportStarted = true;
        $scope.model.reportReady = false;
        $scope.model.showReportFilters = false;
        var checkedKeys = [];
        DataValueService.getDataValueSet( contentUrl ).then(function( data ){
            if ( data && data.dataValues && data.dataValues.length ){
                $scope.model.sortHeader = {
                    id: 'name',
                    reverse: false
                };
                angular.forEach(data.dataValues, function(dv){
                    if ( checkedKeys.indexOf(dv.orgUnit + '.' + dv.period + '.' + dv.dataElement) === -1 ){
                        checkedKeys.push(dv.orgUnit + '.' + dv.period + '.' + dv.dataElement);
                        var parent = ouParent[dv.orgUnit];
                        if ( parent ){
                            ++dataValuesByParent[parent][dv.period].data;
                        }
                    }
                });                
            }
            
            $scope.model.dataValues = [];
            angular.forEach($scope.selectedOrgUnits, function(ou){
                var cc = {name: ou.name};
                var den = dataValuesByParent[ou.id];
                angular.forEach($scope.model.selectedPeriods, function(p){
                    if ( dataValuesByParent[ou.id] && dataValuesByParent[ou.id][p.id] && den && den.children && den.children.length ){
                        var num = dataValuesByParent[ou.id][p.id].data || 0;
                        var percent = DataEntryUtils.getPercent( num, den.children.length*$scope.model.expectedData, true);
                        cc[p.id] = percent;
                    }
                    else{
                        cc[p.id] = $translate.instant('not_assigned');
                    }
                });
                $scope.model.dataValues.push( cc );
            });
            
            $scope.model.reportStarted = false;
            $scope.model.reportReady = true;
        });
    };

    $scope.setSortHeader = function( header ){
        if ( header.id === $scope.model.sortHeader.id ){
            $scope.model.sortHeader.reverse = !$scope.model.sortHeader.reverse;
        }
        else{
            $scope.model.sortHeader = {
                id: header.id,
                reverse: false
            };
        }
    };
    
    $scope.exportData = function () {
        var blob = new Blob([document.getElementById('exportTable').innerHTML], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
        });
        saveAs(blob, $scope.model.reportName + '.xls' );
    };
});