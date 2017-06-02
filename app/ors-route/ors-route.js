'use strict';
import 'angular';
import 'angular-ui-router';
import '../ors-layout/ors-layout.js';

const app = angular.module('ors-route', ['ors-layout', 'ui.router']);

import orsHeaderUrl from './tmpl/ors-header.html';

app.config(function($stateProvider) {
	'ngInject';

	var helloState = {
		name: 'hello',
		url: '/hello',
		template: '<h3>hello world!</h3>'
	};

	var aboutState = {
		name: 'about',
		url: '/about',
		template: '<h3>Its the UI-Router hello world app!</h3>'
	};

	$stateProvider.state(helloState);
	$stateProvider.state(aboutState);
});

// Just to look how much time take a digest cycle.
app.run(function($compile, $rootElement, $rootScope, $templateCache) {
	'ngInject';
	console.log('orsRoute run...');
	const elt = $rootElement.find('ors-body');
	console.log('elt', elt);
	elt.html('<ui-view></ui-view>');

	const eltHeader = $rootElement.find('ors-header');
	// eltHeader.html();
	const tpl = `<div>TOTO <button ng-click="hello()" >start</button>
    		<a ui-sref="hello" ui-sref-active="active">Hello</a>
            <a ui-sref="about" ui-sref-active="active">About</a></div>`;
	const tplElt = angular.element(tpl);
	eltHeader.append(tplElt);
	$compile(eltHeader)($rootScope);

	$rootScope.hello = function() {
		console.log('Hello!');
	};

});

// app.directive('orsBody', () => {
// 	return {
// 		priority: 1000,
// 		terminal: true,
// 		controller: function() {
// 			console.log('orsBodyCtrl');
// 		}
// 	};
// });

// app.directive('orsHeader', () => {
// 	return {
// 		priority: 1000,
// 		terminal: true,
// 		controller: function() {
// 			console.log('orsHeaderCtrl');
// 		}
// 	};
// });
