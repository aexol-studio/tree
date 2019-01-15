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
        this.lastClick = Date.now();
        this.leftMouseButtonDown = false;
        this.eventBus = eventBus;
        element.addEventListener("mousemove", function (e) {
            e.preventDefault();
            _this.currentScreenPosition.x = e.clientX * 2;
            _this.currentScreenPosition.y = e.clientY * 2;
            var mpl = _this.createMouseEventPayload();
            _this.eventBus.publish(Events.IOEvents.MouseMove, mpl);
            if (_this.leftMouseButtonDown) {
                _this.eventBus.publish(Events.IOEvents.MouseDrag, mpl);
            }
            else {
                _this.eventBus.publish(Events.IOEvents.MouseOverMove, mpl);
            }
        });
        // ...
        element.addEventListener("mouseup", function (e) {
            e.preventDefault();
            if (e.which === 1) {
                _this.leftMouseButtonDown = false;
                _this.eventBus.publish(Events.IOEvents.LeftMouseUp, _this.createMouseEventPayload());
            }
            else if (e.which === 3) {
                _this.eventBus.publish(Events.IOEvents.RightMouseUp, _this.createMouseEventPayload());
            }
        });
        element.addEventListener("mousedown", function (e) {
            if (e.which === 1) {
                _this.leftMouseButtonDown = true;
                _this.eventBus.publish(Events.IOEvents.LeftMouseClick, _this.createMouseEventPayload({
                    shiftKey: e.shiftKey
                }));
                var clickTime = Date.now();
                var diff = clickTime - _this.lastClick;
                if (diff < 250) {
                    _this.eventBus.publish(Events.IOEvents.DoubleClick, _this.createMouseEventPayload());
                }
                _this.lastClick = clickTime;
            }
            else if (e.which === 3) {
                _this.eventBus.publish(Events.IOEvents.RightMouseClick, _this.createMouseEventPayload());
            }
        });
        element.addEventListener("keydown", function (e) {
            if (e.key === "m") {
                _this.eventBus.publish(Events.IOEvents.MPressed);
            }
            if (e.key === "delete") {
                _this.eventBus.publish(Events.IOEvents.DeletePressed);
            }
        });
    }
    IO.prototype.createMouseEventPayload = function (e) {
        if (e === void 0) { e = {}; }
        return __assign({}, this.currentScreenPosition, e);
    };
    return IO;
}());
exports.IO = IO;
