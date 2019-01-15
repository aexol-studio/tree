"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * IOEvents:
 *
 * Set of IO-specific events, e.g. mouse button or key was pressed
 * Used by IO service to put events on a bus
 */
var IOEvents = /** @class */ (function () {
    function IOEvents() {
    }
    IOEvents.MouseMove = "MouseMove";
    IOEvents.MouseDrag = "MouseDrag";
    IOEvents.MouseOverMove = "MouseOverMove";
    IOEvents.LeftMouseUp = "LeftMouseUp";
    IOEvents.RightMouseUp = "RightMouseUp";
    IOEvents.LeftMouseClick = "LeftMouseClick";
    IOEvents.DoubleClick = "DoubleClick";
    IOEvents.RightMouseClick = "RightMouseClick";
    IOEvents.MPressed = "MPressed";
    IOEvents.DeletePressed = "Delete";
    IOEvents.RenamerChanged = "RenamerChanged";
    return IOEvents;
}());
exports.IOEvents = IOEvents;
