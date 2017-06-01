'use strict';
import 'angular';
const app = angular.module('main', []);
app.run(function($rootScope) {
	'ngInject';
	$rootScope.name = 'angularJS';
});
