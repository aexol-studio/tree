"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Bubble_1 = require("./Draw/Bubble");
var DescriptionRenderer = /** @class */ (function () {
    function DescriptionRenderer(context, theme) {
        var _this = this;
        this.context = context;
        this.theme = theme;
        this.render = function (_a) {
            var node = _a.node;
            if (node.description) {
                _this.context.fillStyle = _this.theme.colors.description.background;
                Bubble_1.Bubble(_this.context, node.x + _this.theme.node.width / 2.0, node.y, _this.theme.description.width, _this.theme.description.height, _this.theme.description.triangleWidth, _this.theme.description.triangleHeight);
                _this.context.fillStyle = _this.theme.colors.description.text;
                _this.context.textAlign = "center";
                _this.context.textBaseline = "middle";
                _this.context.fillText(node.description, node.x + _this.theme.node.width / 2.0, node.y -
                    _this.theme.description.triangleHeight -
                    _this.theme.description.height / 2.0, _this.theme.description.width);
            }
        };
    }
    DescriptionRenderer.prototype.getNodeFont = function (size, weight) {
        if (weight === void 0) { weight = "normal"; }
        return weight + " " + size + "px " + this.context.font.split(" ")[this.context.font.split(" ").length - 1];
    };
    return DescriptionRenderer;
}());
exports.DescriptionRenderer = DescriptionRenderer;
