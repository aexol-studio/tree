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
var Events = require("../Events");
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
    function StateManager(eventBus) {
        var _this = this;
        this.createNode = function (e) {
            _this.state.nodes.push({
                name: 'XYZ',
                x: e.x,
                y: e.y,
            });
        };
        this.state = {
            links: [],
            nodes: [],
            categories: [],
            selectedLinks: [],
            selectedNodes: [],
        };
        this.eventBus = eventBus;
        this.eventBus.subscribe(Events.IOEvents.LeftMouseClick, this.createNode);
        this.eventBus.subscribe(Events.IOEvents.RightMouseClick, this.showNodeContextMenu);
    }
    StateManager.prototype.getState = function () {
        return __assign({}, this.state);
    };
    StateManager.prototype.setCategories = function (categories) {
        this.state.categories = categories;
        // ... update the data
    };
    StateManager.prototype.showNodeContextMenu = function () {
        // ... something happened, e.g. node was moved
    };
    return StateManager;
}());
exports.StateManager = StateManager;
