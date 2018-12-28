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
    IOEvents.LeftMouseClick = 'LeftMouseClick';
    IOEvents.RightMouseClick = 'RightMouseClick';
    IOEvents.SpacebarPressed = 'SpacebarPressed';
    IOEvents.MPressed = 'MPressed';
    return IOEvents;
}());
exports.IOEvents = IOEvents;
;
