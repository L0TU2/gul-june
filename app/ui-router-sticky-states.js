/**
 * UI-Router Sticky States: Keep states and their components alive while a different state is activated
 * @version v1.4.0
 * @link https://ui-router.github.io
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@uirouter/core')) :
	typeof define === 'function' && define.amd ? define(['exports', '@uirouter/core'], factory) :
	(factory((global['@uirouter/sticky-states'] = global['@uirouter/sticky-states'] || {}),global['@uirouter/core']));
}(this, (function (exports,_uirouter_core) { 'use strict';

var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var notInArray = function (arr) { return function (item) { return !_uirouter_core.inArray(arr, item); }; };
var isChildOf = function (parent) {
    return function (node) {
        return node.state.parent === parent.state;
    };
};
var isChildOfAny = function (_parents) {
    return function (node) {
        return _parents.map(function (parent) { return isChildOf(parent)(node); }).reduce(_uirouter_core.anyTrueR, false);
    };
};
var ancestorPath = function (state) {
    return state.parent ? ancestorPath(state.parent).concat(state) : [state];
};
var isDescendantOf = function (_ancestor) {
    var ancestor = _ancestor.state;
    return function (node) {
        return ancestorPath(node.state).indexOf(ancestor) !== -1;
    };
};
var isDescendantOfAny = function (ancestors) {
    return function (node) {
        return ancestors.map(function (ancestor) { return isDescendantOf(ancestor)(node); })
            .reduce(_uirouter_core.anyTrueR, false);
    };
};
/**
 * Sorts fn that sorts by:
 * 1) node depth (how deep a state is nested)
 * 2) the order in which the state was inactivated (later in wins)
 */
function nodeDepthThenInactivateOrder(inactives) {
    return function (l, r) {
        var depthDelta = (l.state.path.length - r.state.path.length);
        return depthDelta !== 0 ? depthDelta : inactives.indexOf(r) - inactives.indexOf(l);
    };
}
var StickyStatesPlugin = (function (_super) {
    __extends(StickyStatesPlugin, _super);
    function StickyStatesPlugin(router) {
        var _this = _super.call(this) || this;
        _this.router = router;
        _this.name = "sticky-states";
        _this._inactives = [];
        _this._getInactive = function (node) {
            return node && _uirouter_core.find(_this._inactives, function (n) { return n.state === node.state; });
        };
        _this.pluginAPI = router.transitionService._pluginapi;
        _this._defineStickyPaths();
        _this._defineStickyEvents();
        _this._addCreateHook();
        _this._addStateCallbacks();
        _this._addDefaultTransitionOption();
        return _this;
    }
    StickyStatesPlugin.prototype.inactives = function () {
        return this._inactives.map(function (node) { return node.state.self; });
    };
    StickyStatesPlugin.prototype._addCreateHook = function () {
        var _this = this;
        this.router.transitionService.onCreate({}, function (trans) {
            trans['_treeChanges'] = _this._calculateStickyTreeChanges(trans);
        }, { priority: 100 });
    };
    StickyStatesPlugin.prototype._defineStickyPaths = function () {
        // let paths = this.pluginAPI._getPathTypes();
        this.pluginAPI._definePathType("inactivating", _uirouter_core.TransitionHookScope.STATE);
        this.pluginAPI._definePathType("reactivating", _uirouter_core.TransitionHookScope.STATE);
    };
    StickyStatesPlugin.prototype._defineStickyEvents = function () {
        var paths = this.pluginAPI._getPathTypes();
        this.pluginAPI._defineEvent("onInactivate", _uirouter_core.TransitionHookPhase.RUN, 5, paths.inactivating, true);
        this.pluginAPI._defineEvent("onReactivate", _uirouter_core.TransitionHookPhase.RUN, 35, paths.reactivating);
    };
    // Process state.onInactivate or state.onReactivate callbacks
    StickyStatesPlugin.prototype._addStateCallbacks = function () {
        var inactivateCriteria = { inactivating: function (state) { return !!state.onInactivate; } };
        this.router.transitionService.onInactivate(inactivateCriteria, function (trans, state) {
            return state.onInactivate(trans, state);
        });
        var reactivateCriteria = { reactivating: function (state) { return !!state.onReactivate; } };
        this.router.transitionService.onReactivate(reactivateCriteria, function (trans, state) {
            return state.onReactivate(trans, state);
        });
    };
    StickyStatesPlugin.prototype._calculateExitSticky = function (tc, trans) {
        // Process the inactive states that are going to exit due to $stickyState.reset()
        var exitSticky = trans.options().exitSticky || [];
        if (!_uirouter_core.isArray(exitSticky))
            exitSticky = [exitSticky];
        var $state = trans.router.stateService;
        var states = exitSticky
            .map(_uirouter_core.assertMap(function (stateOrName) { return $state.get(stateOrName); }, function (state) { return "State not found: " + state; }))
            .map(function (state) { return state.$$state(); });
        var potentialExitingStickies = this._inactives.concat(tc.inactivating).reduce(_uirouter_core.uniqR, []);
        var findInactive = function (state) { return potentialExitingStickies.find(function (node) { return node.state === state; }); };
        var notInactiveMsg = function (state) { return "State not inactive: " + state; };
        var exitingInactives = states.map(_uirouter_core.assertMap(findInactive, notInactiveMsg));
        var exiting = potentialExitingStickies.filter(isDescendantOfAny(exitingInactives));
        var inToPathMsg = function (node) { return "Can not exit a sticky state that is currently active/activating: " + node.state.name; };
        exiting.map(_uirouter_core.assertMap(function (node) { return !_uirouter_core.inArray(tc.to, node); }, inToPathMsg));
        return exiting;
    };
    StickyStatesPlugin.prototype._calculateStickyTreeChanges = function (trans) {
        var _this = this;
        var tc = trans.treeChanges();
        tc.inactivating = [];
        tc.reactivating = [];
        /****************
         * Process states that are about to be inactivated
         ****************/
        if (tc.entering.length && tc.exiting[0] && tc.exiting[0].state.sticky) {
            tc.inactivating = tc.exiting;
            tc.exiting = [];
        }
        /****************
         * Determine which states are about to be reactivated
         ****************/
        // Simulate a transition where the fromPath is a clone of the toPath, but use the inactivated nodes
        // This will calculate which inactive nodes that need to be exited/entered due to param changes
        var inactiveFromPath = tc.retained.concat(tc.entering.map(function (node) { return _this._getInactive(node) || null; })).filter(_uirouter_core.identity);
        var simulatedTC = _uirouter_core.PathUtils.treeChanges(inactiveFromPath, tc.to, trans.options().reloadState);
        var shouldRewritePaths = ['retained', 'entering', 'exiting'].some(function (path) { return !!simulatedTC[path].length; });
        if (shouldRewritePaths) {
            // The 'retained' nodes from the simulated transition's TreeChanges are the ones that will be reactivated.
            // (excluding the nodes that are in the original retained path)
            tc.reactivating = simulatedTC.retained.slice(tc.retained.length);
            // Entering nodes are the same as the simulated transition's entering
            tc.entering = simulatedTC.entering;
            // The simulatedTC 'exiting' nodes are inactives that are being exited because:
            // - The inactive state's params changed
            // - The inactive state is being reloaded
            // - The inactive state is a child of the to state
            tc.exiting = tc.exiting.concat(simulatedTC.exiting);
            // Rewrite the to path
            tc.to = tc.retained.concat(tc.reactivating).concat(tc.entering);
        }
        /****************
         * Determine which additional inactive states should be exited
         ****************/
        var inactives = this._inactives;
        // Any inactive state whose parent state is exactly activated will be exited
        var childrenOfToState = inactives.filter(isChildOf(_uirouter_core.tail(tc.to)));
        // Any inactive non-sticky state whose parent state is activated (and is itself not activated) will be exited
        var childrenOfToPath = inactives.filter(isChildOfAny(tc.to))
            .filter(notInArray(tc.to))
            .filter(function (node) { return !node.state.sticky; });
        var exitingChildren = childrenOfToState.concat(childrenOfToPath).filter(notInArray(tc.exiting));
        var exitingRoots = tc.exiting.concat(exitingChildren);
        // Any inactive descendant of an exiting state will be exited
        var orphans = inactives.filter(isDescendantOfAny(exitingRoots))
            .filter(notInArray(exitingRoots))
            .concat(exitingChildren)
            .reduce(_uirouter_core.uniqR, [])
            .sort(nodeDepthThenInactivateOrder(inactives));
        tc.exiting = orphans.concat(tc.exiting);
        // commit all changes to inactives after transition is successful
        trans.onSuccess({}, function () {
            tc.exiting.forEach(_uirouter_core.removeFrom(_this._inactives));
            tc.entering.forEach(_uirouter_core.removeFrom(_this._inactives));
            tc.reactivating.forEach(_uirouter_core.removeFrom(_this._inactives));
            tc.inactivating.forEach(_uirouter_core.pushTo(_this._inactives));
        });
        // console.log('inactives will be:', inactives.map(x => x.state.name));
        // let tcCopy: any = Object.assign({}, tc);
        // Object.keys(tcCopy).forEach(key => tcCopy[key] = tcCopy[key].map(x => x.state.name));
        // console.table(tcCopy);
        // Process the inactive sticky states that should be exited
        var exitSticky = this._calculateExitSticky(tc, trans);
        exitSticky.filter(notInArray(tc.exiting)).forEach(_uirouter_core.pushTo(tc.exiting));
        // Also process the active sticky states that are about to be inactivated, but should be exited
        exitSticky.filter(_uirouter_core.inArray(tc.inactivating)).forEach(_uirouter_core.removeFrom(tc.inactivating));
        return tc;
    };
    StickyStatesPlugin.prototype._addDefaultTransitionOption = function () {
        _uirouter_core.defaultTransOpts.exitSticky = [];
    };
    StickyStatesPlugin.prototype.exitSticky = function (states) {
        var $state = this.router.stateService;
        if (states === undefined)
            states = this._inactives.map(function (node) { return node.state.name; });
        if (_uirouter_core.isString(states))
            states = [states];
        return $state.go($state.current, {}, {
            inherit: true,
            exitSticky: states
        });
    };
    return StickyStatesPlugin;
}(_uirouter_core.UIRouterPluginBase));

exports.StickyStatesPlugin = StickyStatesPlugin;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=ui-router-sticky-states.js.map
