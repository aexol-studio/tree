"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RoundedRectangle_1 = require("./Draw/RoundedRectangle");
var MenuRenderer = /** @class */ (function () {
    function MenuRenderer(context, theme) {
        this.context = context;
        this.theme = theme;
    }
    MenuRenderer.prototype.getNodeFont = function (size, weight) {
        if (weight === void 0) { weight = "normal"; }
        return weight + " " + size + "px " + this.context.font.split(" ")[this.context.font.split(" ").length - 1];
    };
    MenuRenderer.prototype.render = function (e, categories, item) {
        var _this = this;
        // Render Background
        this.context.fillStyle = this.theme.colors.menu.background;
        RoundedRectangle_1.RoundedRectangle(this.context, {
            height: categories.length * this.theme.menu.category.height,
            width: this.theme.menu.width,
            x: e.x,
            y: e.y,
            radius: 5
        });
        categories.forEach(function (category, index) {
            _this.context.font = _this.getNodeFont(_this.theme.menu.category.textSize, "normal");
            _this.context.textAlign = "center";
            _this.context.textBaseline = "middle";
            _this.context.fillStyle = _this.theme.colors.menu.text;
            if (item === index) {
                _this.context.fillStyle = _this.theme.colors.menu.hover;
            }
            var categoryY = e.y + _this.theme.menu.category.height * index;
            _this.context.fillText(category.name, e.x + _this.theme.menu.width / 2.0, categoryY + _this.theme.menu.category.height / 2.0);
            if (index !== categories.length - 1) {
                _this.context.beginPath();
                _this.context.moveTo(e.x, categoryY + _this.theme.menu.category.height);
                _this.context.lineTo(e.x + _this.theme.menu.width, categoryY + _this.theme.menu.category.height);
                _this.context.stroke();
            }
        });
    };
    return MenuRenderer;
}());
exports.MenuRenderer = MenuRenderer;
