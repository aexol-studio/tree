"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * DiagramEvents:
 *
 * Set of diagram-specific events, e.g. node was moved or link was created
 * Used possibly to indicate that diagram state have changed
 */
var DiagramEvents = /** @class */ (function () {
    function DiagramEvents() {
    }
    DiagramEvents.NodeMoved = 'NodeMoved';
    DiagramEvents.LinkCreated = 'LinkCreated';
    DiagramEvents.FooBar = 'FooBar';
    return DiagramEvents;
}());
exports.DiagramEvents = DiagramEvents;
;
