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
var Events = require("../../Events");
var Utils_1 = require("../../Utils");
var nodeManager_1 = require("./nodeManager");
var connectionManager_1 = require("./connectionManager");
var between = Utils_1.Utils.between;
/**
 * StateManager:
 *
 * Main data store. Responsibilities:
 * - storing main arrays of nodes, links, etc.
 * - storing current state of diagram: selected nodes, selected links etc.
 * - methods for serializing and deserializing data
 * - listening for IO events on event bus and responding accordingly
 */
var StateManager = /** @class */ (function () {
    function StateManager(eventBus, theme, connectionFunction) {
        var _this = this;
        this.eventBus = eventBus;
        this.theme = theme;
        this.connectionFunction = connectionFunction;
        this.pureState = function () { return _this.state; };
        this.LMBPressed = function (e) {
            _this.state.lastPosition = __assign({}, e);
        };
        this.clickMenuItem = function () {
            if (_this.state.menu && _this.state.hover.menu) {
                var category = _this.state.categories[_this.state.hover.menu.index];
                if (category.action) {
                    category.action();
                    _this.state.menu = undefined;
                    _this.state.hover.menu = undefined;
                }
                else if (category.children) {
                    _this.state.categories = category.children;
                    _this.state.hover.menu = undefined;
                }
                _this.eventBus.publish(Events.DiagramEvents.RenderRequested);
            }
        };
        this.closeMenu = function (e) {
            if (_this.state.menu && !_this.state.hover.menu) {
                _this.state.menu = undefined;
                _this.eventBus.publish(Events.DiagramEvents.RenderRequested);
            }
        };
        this.openMenu = function (e) {
            if (_this.state.draw) {
                return;
            }
            var node = _this.state.hover.node;
            if (!node) {
                _this.state.categories = _this.state.nodeDefinitions
                    .filter(function (n) { return n.object; })
                    .map(function (n) {
                    return ({
                        name: n.node.type,
                        action: function () {
                            return _this.nodeManager.createNode(e, __assign({}, n.node, { x: e.x + _this.theme.menu.width / 2.0, y: e.y - _this.theme.node.height - 20 }));
                        }
                    });
                });
                _this.state.menu = {
                    position: __assign({}, e)
                };
                _this.eventBus.publish(Events.DiagramEvents.RenderRequested);
            }
        };
        this.openPortMenu = function (e) {
            if (!_this.state.draw) {
                return;
            }
            var _a = _this.state.hover, io = _a.io, node = _a.node;
            var _b = _this.state.draw, ioD = _b.io, nodeD = _b.node;
            if (nodeD === node && io === ioD && !_this.state.menu) {
                _this.state.menu = {
                    position: {
                        x: io === "i"
                            ? node.x -
                                _this.theme.menu.width -
                                _this.theme.port.width -
                                _this.theme.menu.spacing.x
                            : node.x +
                                _this.theme.node.width +
                                _this.theme.port.width +
                                _this.theme.menu.spacing.x,
                        y: node.y
                    }
                };
                var nodeDefinition_1 = _this.state.nodeDefinitions.find(function (n) { return n.node.type === node.type; });
                if (!nodeDefinition_1) {
                    var parentNode_1 = _this.state.nodes.find(function (n) { return n.type === node.name; });
                    nodeDefinition_1 = _this.state.nodeDefinitions.find(function (n) { return n.node.type === parentNode_1.type; });
                }
                _this.state.categories = _this.state.nodeDefinitions
                    .filter(function (n) { return !n.object; })
                    .filter(function (n) {
                    return io === "i"
                        ? nodeDefinition_1.acceptsInputs.find(function (ai) { return ai.type === n.node.type; })
                        : n.acceptsInputs &&
                            n.acceptsInputs.find(function (ai) { return ai.type === node.type; });
                })
                    .map(function (n) {
                    return ({
                        name: n.node.type,
                        action: function () {
                            var createdNode = _this.nodeManager.createNode(_this.nodeManager.placeConnectedNode(node, io), n.node);
                            _this.connectionManager.makeConnection(io === "i" ? node : createdNode, io === "o" ? node : createdNode);
                        }
                    });
                });
                _this.eventBus.publish(Events.DiagramEvents.RenderRequested);
            }
        };
        this.hoverMenu = function (e) {
            if (_this.state.menu) {
                var distance = {
                    x: e.x - _this.state.menu.position.x,
                    y: e.y - _this.state.menu.position.y
                };
                if (distance.x > 0 && distance.y > 0) {
                    if (distance.x < _this.theme.menu.width &&
                        distance.y <
                            _this.theme.menu.category.height * _this.state.categories.length) {
                        var menuItem = Math.floor(distance.y / _this.theme.menu.category.height);
                        if (!_this.state.hover.menu) {
                            _this.state.hover.menu = {
                                index: menuItem
                            };
                            _this.eventBus.publish(Events.DiagramEvents.RenderRequested);
                        }
                        else if (_this.state.hover.menu.index !== menuItem) {
                            _this.state.hover.menu.index = menuItem;
                            _this.eventBus.publish(Events.DiagramEvents.RenderRequested);
                        }
                        return;
                    }
                }
            }
            if (_this.state.hover.menu) {
                _this.state.hover.menu = undefined;
                _this.eventBus.publish(Events.DiagramEvents.RenderRequested);
            }
        };
        this.somethingHovered = function () {
            for (var _i = 0, _a = Object.keys(_this.state.hover); _i < _a.length; _i++) {
                var k = _a[_i];
                if (!!_this.state.hover.valueOf()[k])
                    return true;
            }
        };
        this.hover = function (e) {
            for (var _i = 0, _a = _this.state.nodes; _i < _a.length; _i++) {
                var n = _a[_i];
                var distance = {
                    x: e.x - n.x,
                    y: e.y - n.y
                };
                var xBetween = between(-_this.theme.port.width, _this.theme.node.width + _this.theme.port.width);
                var yBetween = between(0, _this.theme.node.height);
                if (xBetween(distance.x) && yBetween(distance.y)) {
                    var node = n;
                    var io = distance.x > _this.theme.node.width && node.outputs
                        ? "o"
                        : distance.x < 0 && node.inputs
                            ? "i"
                            : undefined;
                    if (_this.state.hover.io !== io || _this.state.hover.node !== node) {
                        _this.state.hover = { node: node, io: io };
                        _this.eventBus.publish(Events.DiagramEvents.RenderRequested);
                    }
                    return;
                }
            }
            if (_this.state.hover.io || _this.state.hover.node) {
                _this.state.hover = {};
                _this.eventBus.publish(Events.DiagramEvents.RenderRequested);
            }
        };
        this.state = {
            links: [],
            nodes: [],
            nodeDefinitions: [],
            categories: [],
            selectedLinks: [],
            selectedNodes: [],
            hover: {},
            lastPosition: {
                x: 0,
                y: 0
            }
        };
        this.nodeManager = new nodeManager_1.NodeManager(this.state, this.eventBus, this.theme);
        this.connectionManager = new connectionManager_1.ConnectionManager(this.eventBus, this.state, this.connectionFunction);
        this.eventBus.subscribe(Events.IOEvents.MouseMove, this.hover);
        this.eventBus.subscribe(Events.IOEvents.MouseOverMove, this.hoverMenu);
        this.eventBus.subscribe(Events.IOEvents.LeftMouseClick, this.LMBPressed);
        this.eventBus.subscribe(Events.IOEvents.LeftMouseClick, this.closeMenu);
        this.eventBus.subscribe(Events.IOEvents.LeftMouseClick, this.clickMenuItem);
        this.eventBus.subscribe(Events.IOEvents.LeftMouseUp, this.openPortMenu);
        this.eventBus.subscribe(Events.IOEvents.RightMouseUp, this.openMenu);
    }
    StateManager.prototype.getState = function () {
        return __assign({}, this.state);
    };
    StateManager.prototype.setCategories = function (categories) {
        this.state.categories = categories;
    };
    StateManager.prototype.setDefinitions = function (nodeDefinitions) {
        this.state.nodeDefinitions = nodeDefinitions;
    };
    return StateManager;
}());
exports.StateManager = StateManager;
