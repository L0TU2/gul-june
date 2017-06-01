'use strict';
import 'angular';
const app = angular.module('ors-debug', []);
app.config(['$provide', function($provide) {
	$provide.decorator('$rootScope', function($delegate) {
		var emit = $delegate.$emit;

		$delegate.$emit = function() {
			console.log(...arguments);
			emit.apply(this, arguments);
		};

		return $delegate;
	});
}]);
