"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Utils
 *
 * Various utils.
 */
var Utils = /** @class */ (function () {
    function Utils() {
    }
    Utils.generateId = function () {
        return new Array(crypto.getRandomValues(new Uint8Array(4))).join("-");
    };
    Utils.between = function (a, b) { return function (c) { return c >= a && c <= b; }; };
    Utils.dedupe = function (a) { return a.filter(function (b, i) { return a.indexOf(b) === i; }); };
    Utils.snap = function (e, snappingGridSize) { return (__assign({}, e, { x: Math.floor(e.x / snappingGridSize) * snappingGridSize, y: Math.floor(e.y / snappingGridSize) * snappingGridSize })); };
    Utils.graphFromNode = function (n, together) {
        if (together === void 0) { together = []; }
        var graphNodes = [n].concat(together);
        var notInNodes = function (nodes) { return function (n) {
            return !nodes.find(function (nd) { return nd.id === n.id; });
        }; };
        var connectedNodes = [];
        if (n.inputs) {
            connectedNodes = connectedNodes.concat(n.inputs);
        }
        if (n.outputs) {
            connectedNodes = connectedNodes.concat(n.outputs);
        }
        connectedNodes = connectedNodes.filter(notInNodes(graphNodes));
        for (var _i = 0, connectedNodes_1 = connectedNodes; _i < connectedNodes_1.length; _i++) {
            var i = connectedNodes_1[_i];
            graphNodes = Utils.graphFromNode(i, graphNodes).nodes.slice();
        }
        // dedupe on circular references
        graphNodes = Utils.dedupe(graphNodes);
        return {
            nodes: graphNodes
        };
    };
    Utils.graphsFromNodes = function (nodes) {
        var usedNodes = [];
        var graphs = [];
        var _loop_1 = function (node) {
            if (usedNodes.find(function (un) { return un === node; })) {
                return "continue";
            }
            var graph = Utils.graphFromNode(node, usedNodes);
            usedNodes.concat(graph.nodes);
            graphs.push(graph);
        };
        for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
            var node = nodes_1[_i];
            _loop_1(node);
        }
        return graphs;
    };
    return Utils;
}());
exports.Utils = Utils;
