"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var QuadraticPath_1 = require("./Draw/QuadraticPath");
var ActiveLinkRenderer = /** @class */ (function () {
    function ActiveLinkRenderer(context, theme) {
        var _this = this;
        this.context = context;
        this.theme = theme;
        this.render = function (_a) {
            var from = _a.from, to = _a.to;
            QuadraticPath_1.QuadraticPath(_this.context, from.x, from.y, to.x, to.y, _this.theme.link.cornerRadius, _this.theme.link.strokeWidth, _this.theme.colors.link.main, _this.theme.link.defaultCenterPoint);
        };
    }
    return ActiveLinkRenderer;
}());
exports.ActiveLinkRenderer = ActiveLinkRenderer;
