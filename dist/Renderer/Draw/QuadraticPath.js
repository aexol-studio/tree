"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuadraticPath = function (context, x1, y1, x2, y2, cornerRadius, strokeWidth, color, centerPoint) {
    if (centerPoint === void 0) { centerPoint = 0.5; }
    var centerX = (x1 + x2) / Math.pow(centerPoint, -1);
    var ydiff = Math.abs(y2 - y1);
    var cr = ydiff > cornerRadius * 2 ? cornerRadius : Math.floor(ydiff / 2.0);
    var crx = x2 > x1 ? cr : -cr;
    var cry = y2 > y1 ? cr : -cr;
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(centerX - crx, y1);
    context.arcTo(centerX, y1, centerX, y1 + cry, cr);
    context.lineTo(centerX, y2 - cry);
    context.arcTo(centerX, y2, centerX + crx, y2, cr);
    context.lineTo(x2, y2);
    context.lineWidth = strokeWidth;
    context.strokeStyle = color;
    context.stroke();
};
