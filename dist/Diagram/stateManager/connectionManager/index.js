"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Events = require("../../../Events");
/**
 * ConnectionManager:
 *
 * Connection Manager is for connections:
 */
var ConnectionManager = /** @class */ (function () {
    function ConnectionManager(eventBus, state, connectionFunction) {
        var _this = this;
        this.eventBus = eventBus;
        this.state = state;
        this.connectionFunction = connectionFunction;
        this.startDrawingConnector = function (e) {
            var _a = _this.state.hover, io = _a.io, node = _a.node;
            if (io && node) {
                _this.state.draw = {
                    node: node,
                    io: io
                };
                return;
            }
            _this.state.draw = undefined;
        };
        this.drawConnector = function (e) {
            if (!_this.state.draw) {
                return;
            }
            var _a = _this.state.draw, io = _a.io, node = _a.node;
            if (!io || !node) {
                return;
            }
            _this.state.drawedConnection = e;
            _this.eventBus.publish(Events.DiagramEvents.RenderRequested);
        };
        this.makeConnection = function (i, o) {
            var inputNodeDefinition = _this.state.nodeDefinitions.find(function (nd) { return nd.node.type === i.type; });
            if (!_this.connectionFunction(i, o) ||
                _this.state.links.find(function (l) { return l.i === i && l.o === o; }) ||
                (inputNodeDefinition.acceptsInputs &&
                    !inputNodeDefinition.acceptsInputs.find(function (ai) { return ai.type === o.type; }))) {
                _this.state.drawedConnection = undefined;
                _this.eventBus.publish(Events.DiagramEvents.RenderRequested);
                return;
            }
            console.log("connection between input " + i.type + " - output " + o.type);
            var newLink = {
                o: o,
                i: i
            };
            _this.state.links.push(newLink);
            i.inputs.push(o);
            o.outputs.push(i);
            return newLink;
        };
        this.endDrawingConnector = function (e) {
            if (!_this.state.draw) {
                return;
            }
            if (_this.state.hover.io && _this.state.hover.io !== _this.state.draw.io) {
                var input = _this.state.hover.io === "i"
                    ? _this.state.hover.node
                    : _this.state.draw.node;
                var output = _this.state.hover.io === "o"
                    ? _this.state.hover.node
                    : _this.state.draw.node;
                _this.makeConnection(input, output);
            }
            _this.state.drawedConnection = undefined;
            _this.eventBus.publish(Events.DiagramEvents.RenderRequested);
        };
        this.eventBus.subscribe(Events.IOEvents.LeftMouseClick, this.startDrawingConnector);
        this.eventBus.subscribe(Events.IOEvents.LeftMouseUp, this.endDrawingConnector);
        this.eventBus.subscribe(Events.IOEvents.MouseDrag, this.drawConnector);
    }
    return ConnectionManager;
}());
exports.ConnectionManager = ConnectionManager;
