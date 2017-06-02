'use strict';
import 'angular';
import './ors-debug/ors-debug.js';
import './ors-perf/ors-perf.js';
import './ors-layout/ors-layout.js';


const app = angular.module('main', ['ors-debug', 'ors-perf', 'ors-layout']);
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

