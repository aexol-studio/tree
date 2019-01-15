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
    DiagramEvents.NodeMoved = "NodeMoved";
    DiagramEvents.NodeSelected = "NodeSelected";
    DiagramEvents.NodeHover = "NodeHover";
    DiagramEvents.NodeCreated = "NodeCreated";
    DiagramEvents.LinkCreated = "LinkCreated";
    DiagramEvents.DrawingLink = "DrawingLink";
    DiagramEvents.RenderRequested = "RenderRequested";
    return DiagramEvents;
}());
exports.DiagramEvents = DiagramEvents;
