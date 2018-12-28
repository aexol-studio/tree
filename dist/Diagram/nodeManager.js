"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var NodeManager = /** @class */ (function () {
    function NodeManager(eventBus, state) {
        this.eventBus = eventBus;
        this.state = state;
        this.eventBus.subscribe('xyz_io_event', this.onSomeIOEventHappened);
    }
    NodeManager.prototype.onSomeIOEventHappened = function () {
        // ... something happened, e.g. node was moved
    };
    return NodeManager;
}());
exports.NodeManager = NodeManager;
