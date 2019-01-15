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
var Events = require("../../../Events");
var Utils_1 = require("../../../Utils");
var Renamer_1 = require("../../../IO/Renamer");
/**
 * NodeManager:
 *
 * Main nodes operation class
 */
var NodeManager = /** @class */ (function () {
    function NodeManager(state, eventBus, theme) {
        var _this = this;
        this.state = state;
        this.eventBus = eventBus;
        this.theme = theme;
        this.renamer = new Renamer_1.Renamer();
        this.moveNodes = function (e) {
            var selectedNodes = _this.state.selectedNodes;
            if (selectedNodes.length > 0) {
                for (var _i = 0, selectedNodes_1 = selectedNodes; _i < selectedNodes_1.length; _i++) {
                    var n = selectedNodes_1[_i];
                    n.x += e.x - _this.state.lastPosition.x;
                    n.y += e.y - _this.state.lastPosition.y;
                }
                _this.state.lastPosition = __assign({}, e);
                _this.eventBus.publish(Events.DiagramEvents.NodeMoved);
                _this.eventBus.publish(Events.DiagramEvents.RenderRequested);
            }
        };
        this.openNodeMenu = function (e) {
            if (_this.state.draw) {
                return;
            }
            var node = _this.state.hover.node;
            if (node) {
                _this.state.categories = [
                    {
                        name: "delete",
                        action: function () {
                            _this.deleteNodes([node]);
                        }
                    },
                    {
                        name: "rename",
                        action: function () {
                            _this.renamer.rename(node.name, function (e) {
                                node.name = e;
                                var nodeDefinition = _this.state.nodeDefinitions.find(function (nd) { return nd.node.type === node.type; });
                                console.log(_this.state.nodeDefinitions);
                                if (nodeDefinition && nodeDefinition.object) {
                                    nodeDefinition.node.name = e;
                                }
                                _this.eventBus.publish(Events.DiagramEvents.RenderRequested);
                            });
                        }
                    }
                ];
                _this.state.menu = {
                    position: __assign({}, e)
                };
                _this.eventBus.publish(Events.DiagramEvents.RenderRequested);
            }
        };
        this.graphSelect = function (e) {
            var _a = _this.state.hover, node = _a.node, io = _a.io;
            if (node && !io) {
                var nodeGraph = Utils_1.Utils.graphFromNode(node);
                console.log(nodeGraph.nodes);
                _this.state.selectedNodes = nodeGraph.nodes;
                _this.eventBus.publish(Events.DiagramEvents.RenderRequested);
            }
        };
        this.selectNode = function (e) {
            var _a = _this.state.hover, node = _a.node, io = _a.io;
            if (node && !io) {
                if (e.shiftKey) {
                    var hasIndex = _this.state.selectedNodes.indexOf(node);
                    if (hasIndex !== -1) {
                        _this.state.selectedNodes.splice(hasIndex);
                        return;
                    }
                    _this.state.selectedNodes.push(node);
                }
                else {
                    _this.state.selectedNodes = [node];
                }
            }
            else {
                _this.state.selectedNodes = [];
            }
            _this.eventBus.publish(Events.DiagramEvents.NodeSelected);
            _this.eventBus.publish(Events.DiagramEvents.RenderRequested);
        };
        this.placeConnectedNode = function (node, io) {
            var x = node.x, y = node.y - _this.theme.node.height * 2;
            var xAdd = _this.theme.node.width + _this.theme.port.width + _this.theme.node.spacing.x;
            if (io === "i") {
                for (var _i = 0, _a = node.inputs; _i < _a.length; _i++) {
                    var input = _a[_i];
                    y = input.y > y ? input.y : y;
                }
                x -= xAdd;
            }
            if (io === "o") {
                for (var _b = 0, _c = node.outputs; _b < _c.length; _b++) {
                    var output = _c[_b];
                    y = output.y > y ? output.y : y;
                }
                x += _this.theme.node.width + xAdd;
            }
            y += _this.theme.node.height + _this.theme.node.spacing.y;
            var tooClose = _this.state.nodes.filter(function (n) {
                return Math.abs(n.y - y) < _this.theme.node.height &&
                    Math.abs(n.x - x) < _this.theme.node.width;
            });
            if (tooClose.length) {
                y = Math.max.apply(Math, tooClose.map(function (tc) { return tc.y; }));
                y += _this.theme.node.height + _this.theme.node.spacing.y;
            }
            return { x: x, y: y };
        };
        this.deleteNodes = function (n) {
            _this.state.selectedNodes = _this.state.selectedNodes.filter(function (node) { return !n.find(function (nn) { return nn === node; }); });
            _this.state.nodes = _this.state.nodes.filter(function (node) { return !n.find(function (nn) { return nn === node; }); });
            _this.state.links = _this.state.links.filter(function (link) { return !n.find(function (nn) { return nn === link.i || nn === link.o; }); });
            _this.eventBus.publish(Events.DiagramEvents.RenderRequested);
        };
        this.createNode = function (e, n) {
            var createdNode = __assign({ name: "Person", id: Utils_1.Utils.generateId(), type: "type", description: "Enter your description", x: e.x - _this.theme.node.width / 2.0, y: e.y - _this.theme.node.height / 2.0, inputs: [], outputs: [] }, n);
            _this.renamer.rename(createdNode.name, function (e) { });
            if (n && n.type) {
                var nodeDefinition_1 = _this.state.nodeDefinitions.find(function (nd) { return nd.node.type === n.type; });
                if (nodeDefinition_1 && nodeDefinition_1.object) {
                    var ObjectInstanceDefinition = _this.state.nodeDefinitions.find(function (nd) { return nd.node.type === n.name; });
                    if (!ObjectInstanceDefinition) {
                        _this.state.nodeDefinitions.push(__assign({}, nodeDefinition_1, { object: undefined, main: undefined, parent: _this.state.nodeDefinitions.find(function (nd) { return nd.node.type === n.type; }), node: __assign({}, nodeDefinition_1.node, { inputs: [], outputs: [], type: n.name }) }));
                        _this.state.nodeDefinitions = _this.state.nodeDefinitions.map(function (nd) {
                            var acceptsInputs = nd.acceptsInputs;
                            if (acceptsInputs &&
                                acceptsInputs.find(function (ai) { return ai.type === nodeDefinition_1.node.type; })) {
                                acceptsInputs = acceptsInputs.concat([
                                    {
                                        type: n.name
                                    }
                                ]);
                            }
                            return __assign({}, nd, { acceptsInputs: acceptsInputs });
                        });
                    }
                }
            }
            _this.state.nodes.push(createdNode);
            _this.eventBus.publish(Events.DiagramEvents.NodeCreated);
            _this.eventBus.publish(Events.DiagramEvents.RenderRequested);
            return createdNode;
        };
        this.eventBus.subscribe(Events.IOEvents.LeftMouseClick, this.selectNode);
        this.eventBus.subscribe(Events.IOEvents.DoubleClick, this.graphSelect);
        this.eventBus.subscribe(Events.IOEvents.RightMouseUp, this.openNodeMenu);
        this.eventBus.subscribe(Events.IOEvents.MouseDrag, this.moveNodes);
    }
    return NodeManager;
}());
exports.NodeManager = NodeManager;
