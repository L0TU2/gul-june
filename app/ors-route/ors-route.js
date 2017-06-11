'use strict';
import 'angular';
import 'angular-ui-router';
import '../ors-layout/ors-layout.js';
import { StickyStatesPlugin } from '../ui-router-sticky-states.js';

const app = angular.module('ors-route', ['ors-layout', 'ui.router']);

import orsHeaderUrl from './tmpl/ors-header.html';

var sequenceTab = 0;

app.config(function($qProvider) {
	'ngInject';
	$qProvider.errorOnUnhandledRejections(false);
});


app.config(function($uiRouterProvider) {
  $uiRouterProvider.plugin(StickyStatesPlugin);
});
app.config(['$uiRouterProvider', $uiRouter => {
  $uiRouter.plugin(StickyStatesPlugin);
}]);

app.config(function($stateProvider) {
	'ngInject';

    $stateProvider.decorator('views', function(state, parent) {
		state.onEnter= function($state, $stateRegistry, $rootElement, $compile, $rootScope) {
			'ngInject';

			console.log('Enter on "' + state.name + '"');
			if('tabTemplate' in state && state.tabTemplate){
				// Create a new state for this tab

				const seq = sequenceTab++;
				// var newState = {
				// 	name: state.name + '_' + seq,
				// 	url: state.url + '/' + seq,
				// 	sticky: true,
				// 	template: state.template,
				// 	component: state.component,
				// 	resolve: state.resolve,

				// }
				// $stateRegistry.register(newState);

				// Add visual tab
				const eltHeader = $rootElement.find('ors-tab');
				// const tpl = '<a ui-sref="' + newState.name + '" ui-sref-active="active">Tab ' + seq + '</a>';
				const tpl = '<a ui-sref="' + state.name + '" ui-sref-active="active">Tab ' + seq + '</a>';
				const tplElt = angular.element(tpl);
				eltHeader.append(tplElt);
				$compile(eltHeader)($rootScope);

				// Redirect to new state
				//$state.go(newState.name);
			}
        };
		state.onExit= function( ) {
			console.log('Exit on "' + state.name + '"');
			state.$ctr
        };

		// Allow to keep the normal behaviour (Should be improve)
		var result = {},
        views = parent(state);
		angular.forEach(views, function(config, name) {
			config.resolve = config.resolve || {};
			result[name] = config;
		});
		return result;
	});

  }
);

app.config(function($stateProvider) {
	'ngInject';

	var helloState = {
		name: 'hello',
		url: '/hello',
		template: '<h3>hello world!</h3>',
		tabTemplate: true
	};

	var aboutState = {
		name: 'about',
		url: '/about',
		template: '<h3>Its the UI-Router hello world app!<input ng-model="value">Value</input></h3>',
		tabTemplate: true	
	};

	var hello3State = {
		name: 'hello3',
		url: '/hello/:tmp',
		component: 'helloTab',
		sticky: true,
		resolve: {
    		users: function(UserService) {
      			return UserService.list();
    		},
			id: function($stateParams) {
				'ngInject';
				return $stateParams.tmp;
			}
  		},
		tabTemplate: true	
	};

	var helloTabState = {
		name: 'hello2',
		url: '/hello2',
		component: 'helloTab',
		resolve: {
    		users: function(UserService) {
      			return UserService.list();
    		}
  		},
		tabTemplate: true	
	};
	

	$stateProvider.state(helloState);
	$stateProvider.state(aboutState);
	$stateProvider.state(helloTabState);
	$stateProvider.state(hello3State);

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
            <a ui-sref="about" ui-sref-active="active">About</a></div>
			<a ui-sref="hello2" ui-sref-active="active">Test Tab advanced</a></div>`;
	const tplElt = angular.element(tpl);
	eltHeader.append(tplElt);
	$compile(eltHeader)($rootScope);

	$rootScope.hello = function() {
		console.log('Hello!');
	};

});

app.directive('orsBody', () => {
	return {
		priority: 1000,
		terminal: true,
		controller: function($scope, $element, $compile) {
            'ngInject';
			console.log('orsBodyCtrl');
            $compile($element.contents())($scope);
		}
	};
});

app.directive('orsHeader', () => {
	return {
		priority: 1000,
		terminal: true,
		controller: function($scope, $element, $compile) {
            'ngInject';
			console.log('orsHeaderCtrl');
            $compile($element.contents())($scope);
		}
	};
});

var helloTabComponent = app.component('helloTab', {
  bindings: {
    // one-way input binding, e.g., 
    // <users users="$parentCtrl.userlist"></foo>
    // automatically bound to `users` on the controller
    users: '<',
	id:'<'
  },
transclude: true,
  controller: function() {
    this.clickHandler = function() {
      alert('something');
    };
    
    this.toggleActive = function(userId) {
      var user = this.users.find(user => user.id == userId);
      if (!user) return;
      user.active = !user.active;
    };
  },
  
  // implicit controllerAs: '$ctrl',
  template: `
    <h1>Users</h1>
	<input ng-model-"$ctrl.value">Test</input>
    <button ng-click="$ctrl.clickHandler()">Do something</button>

    <ul>
      <li ng-repeat="user in $ctrl.users" ui-sref-active="userselected">
        <a ui-sref="userlist.detail({ userId: user.id })" 
            ng-disabled="!user.active"
            ng-class="{ deactivated: !user.active }">
          {{ user.name }}
        </a>
        
        <button ng-click="$ctrl.toggleActive(user.id)">
          {{ user.active ? "Deactivate" : "Activate" }}
        </button>
      </li>
    </ul>
  `,
});

app.service('UserService', function($http) { 
  return {
    list: function() {
      return $http.get('./data/users.json', { cache: true }).then(resp => resp.data)
    }
  };
});

// preload resources in case plunker times out
app.run(function($http, $templateRequest) {
  $http.get('data/users.json', { cache: true });
})