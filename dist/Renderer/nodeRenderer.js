"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RoundedRectangle_1 = require("./Draw/RoundedRectangle");
var NodeRenderer = /** @class */ (function () {
    function NodeRenderer(context, theme) {
        var _this = this;
        this.context = context;
        this.theme = theme;
        this.render = function (_a) {
            var node = _a.node, isHovered = _a.isHovered, isSelected = _a.isSelected, inputActive = _a.inputActive, outputActive = _a.outputActive;
            var _b = _this.theme, colors = _b.colors, _c = _b.node, width = _c.width, height = _c.height, nameSize = _c.nameSize, typeSize = _c.typeSize, port = _b.port;
            _this.context.fillStyle = colors.node.background;
            if (isSelected || isHovered) {
                _this.context.fillStyle = colors.node.selected;
            }
            var leftRadius = node.inputs ? 0 : 5;
            var rightRadius = node.outputs ? 0 : 5;
            RoundedRectangle_1.RoundedRectangle(_this.context, {
                width: width,
                height: height,
                x: node.x,
                y: node.y,
                radius: 0,
                radiusBottomLeft: leftRadius,
                radiusTopLeft: leftRadius,
                radiusBottomRight: rightRadius,
                radiusTopRight: rightRadius
            });
            if (node.name) {
                _this.context.fillStyle = colors.node.name;
                _this.context.font = _this.getNodeFont(nameSize, "normal");
                _this.context.textAlign = "center";
                _this.context.textBaseline = "middle";
                _this.context.fillText(node.name, node.x + width / 2.0, node.y + height / 2.0);
            }
            if (node.type) {
                _this.context.fillStyle = colors.node.types[node.type] || colors.node.name;
                _this.context.font = _this.getNodeFont(typeSize, "normal");
                _this.context.textBaseline = "bottom";
                _this.context.textAlign = "end";
                _this.context.fillText(node.type, node.x + width, node.y);
            }
            _this.context.font = _this.getNodeFont(nameSize, "normal");
            _this.context.textAlign = "center";
            _this.context.textBaseline = "middle";
            if (node.inputs) {
                _this.context.fillStyle = inputActive
                    ? colors.port.backgroundActive
                    : colors.port.background;
                RoundedRectangle_1.RoundedRectangle(_this.context, {
                    height: height,
                    width: port.width,
                    x: node.x - port.width,
                    y: node.y,
                    radiusTopLeft: 5,
                    radiusBottomLeft: 5
                });
                _this.context.fillStyle = colors.port.button;
                _this.context.fillText("-", node.x - port.width / 2.0, node.y + height / 2.0);
            }
            if (node.outputs) {
                _this.context.fillStyle = outputActive
                    ? colors.port.backgroundActive
                    : colors.port.background;
                RoundedRectangle_1.RoundedRectangle(_this.context, {
                    height: height,
                    width: port.width,
                    x: node.x + width,
                    y: node.y,
                    radiusTopRight: 5,
                    radiusBottomRight: 5
                });
                _this.context.fillStyle = colors.port.button;
                _this.context.fillText("+", node.x + width + port.width / 2.0, node.y + height / 2.0);
            }
        };
    }
    NodeRenderer.prototype.getNodeFont = function (size, weight) {
        if (weight === void 0) { weight = "normal"; }
        return weight + " " + size + "px " + this.context.font.split(" ")[this.context.font.split(" ").length - 1];
    };
    return NodeRenderer;
}());
exports.NodeRenderer = NodeRenderer;
