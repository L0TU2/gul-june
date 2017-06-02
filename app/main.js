'use strict';
import 'angular';
import './ors-debug/ors-debug.js';
import './ors-perf/ors-perf.js';
import './ors-route/ors-route.js';

const app = angular.module('main', ['ors-debug', 'ors-perf', 'ors-route']);
app.run(function($rootScope) {
	'ngInject';
	$rootScope.name = 'AngularJS';
	$rootScope.start = ()=>{
		$rootScope.$emit('toto');
	};
	$rootScope.$on('toto', ()=>{
		console.log('titi');
	});
});

