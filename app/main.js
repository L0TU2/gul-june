'use strict';
import 'angular';
import './ors-debug/ors-debug.js';

const app = angular.module('main', []);
app.run(function($rootScope) {
	'ngInject';
	$rootScope.name = 'angularJS';
	$rootScope.start = ()=>{
		$rootScope.$emit('toto');
	};
	$rootScope.$on('toto', ()=>{
		console.log('titi');
	});
});

