"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Event bus:
 *
 * Publish-subscribe event bus. Responsibilities:
 * - providing possibility of subscribing to particular topics
 * - providing possibility of publishing events to particular topics
 */
var EventBus = /** @class */ (function () {
    function EventBus() {
        this.topics = {};
    }
    EventBus.prototype.subscribe = function (topic, callback) {
        if (!this.topics[topic]) {
            this.topics[topic] = [];
        }
        this.topics[topic].push(callback);
    };
    EventBus.prototype.publish = function (topic) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (!this.topics[topic]) {
            return;
        }
        this.topics[topic].forEach(function (callback) {
            callback.apply(void 0, args);
        });
    };
    return EventBus;
}());
exports.EventBus = EventBus;
