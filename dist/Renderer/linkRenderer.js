"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var QuadraticPath_1 = require("./Draw/QuadraticPath");
var LinkRenderer = /** @class */ (function () {
    function LinkRenderer(context, theme) {
        var _this = this;
        this.context = context;
        this.theme = theme;
        this.render = function (l, highlight) {
            var _a = _this.theme.node, width = _a.width, height = _a.height;
            QuadraticPath_1.QuadraticPath(_this.context, l.o.x + width / 2.0, l.o.y + height / 2.0, l.i.x + width / 2.0, l.i.y + height / 2.0, _this.theme.link.cornerRadius, _this.theme.link.strokeWidth, highlight ? _this.theme.colors.link.active : _this.theme.colors.link.main, l.centerPoint || _this.theme.link.defaultCenterPoint);
        };
    }
    return LinkRenderer;
}());
exports.LinkRenderer = LinkRenderer;
