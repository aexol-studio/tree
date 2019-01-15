"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Triangle = function (context, x1, y1, x2, y2, x3, y3) {
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.lineTo(x3, y3);
    context.fill();
};
