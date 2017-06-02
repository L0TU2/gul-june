'use strict';
import 'angular';
const app = angular.module('ors-perf', []);

let timer = 0;

app.config(['$provide', function($provide) {
	$provide.decorator('$browser', function($delegate) {
		var $$checkUrlChange = $delegate.$$checkUrlChange;
		console.log('$delegate', $delegate);


		$delegate.$$checkUrlChange = function() {
			if (0 == timer) {
				timer = performance.now();
				console.log.call(console, 'digest start');
			}
			$$checkUrlChange.apply($delegate, arguments);
		};

		return $delegate;
	});
}]);

// Just to look how much time take a digest cycle.
app.run(function($rootScope, $timeout) {
	'ngInject';

	var postDigest = function(callback) {
		var unregister = $rootScope.$watch(function() {
			unregister();
			$timeout(function() {
				callback();
				postDigest(callback);
			}, 0, false);
		});
	};

	postDigest(function() {
		var diff = performance.now() - timer;
		timer = 0;
		console.log('end of digest', diff);
	});
});
