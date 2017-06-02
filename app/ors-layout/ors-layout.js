'use strict';
import 'angular';
const app = angular.module('ors-layout', []);

// Just to look how much time take a digest cycle.
app.run(function($rootElement, $rootScope, $compile) {
	'ngInject';

	const elt = angular.element(`
    <ors-header></ors-header>
    <ors-body></ors-body>
    <ors-footer></ors-footer>`);
	$rootElement.prepend(elt);
});

import orsHearderUrl from './tmpl/ors-header.html';
app.directive('orsHeader', () => {
    return {
        templateUrl: orsHearderUrl
    };
});

app.directive('orsBody', () => {
    return {
        templateUrl: './ors-layout/tmpl/ors-body.html'
    };
});

app.directive('orsFooter', () => {
    return {
        templateUrl: './ors-layout/tmpl/ors-footer.html'
    };
});
