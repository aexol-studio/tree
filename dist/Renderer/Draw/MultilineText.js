"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultilineText = function (context, _a) {
    var x = _a.x, y = _a.y, radius = _a.radius, color = _a.color, stroke = _a.stroke;
    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI, false);
    if (color) {
        context.fillStyle = color;
        context.fill();
    }
    context.lineWidth = 2;
    context.strokeStyle = stroke;
    context.stroke();
};
