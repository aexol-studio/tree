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
 * IO:
 *
 * Service that handles user input. Responsibilities:
 * - attach mouse and keyboard listeners
 * - broadcast IO events by putting them on the bus
 */
var IO = /** @class */ (function () {
    /**
     * @param eventBus event bus to be used
     * @param element HTML <canvas> elements to put listeners on
     */
    function IO(eventBus, element) {
        var _this = this;
        this.currentScreenPosition = { x: 0, y: 0 };
        this.eventBus = eventBus;
        element.addEventListener('mousemove', function (e) {
            _this.currentScreenPosition.x = e.clientX * 2;
            _this.currentScreenPosition.y = e.clientY * 2;
        });
        // ...
        element.addEventListener('mousedown', function (e) {
            if (e.which === 1) {
                _this.eventBus.publish(Events.IOEvents.LeftMouseClick, _this.createMouseEventPayload());
            }
            else if (e.which === 3) {
                _this.eventBus.publish(Events.IOEvents.RightMouseClick, _this.createMouseEventPayload());
            }
        });
        element.addEventListener('keypress', function (e) {
            if (e.key === " ") {
                _this.eventBus.publish(Events.IOEvents.SpacebarPressed, _this.createMouseEventPayload());
            }
            if (e.key === "m") {
                _this.eventBus.publish(Events.IOEvents.MPressed);
            }
        });
    }
    IO.prototype.createMouseEventPayload = function () {
        return __assign({}, this.currentScreenPosition);
    };
    return IO;
}());
exports.IO = IO;
