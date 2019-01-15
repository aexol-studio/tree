"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RoundedRectangle_1 = require("./RoundedRectangle");
var Triangle_1 = require("./Triangle");
exports.Bubble = function (context, x, y, width, height, triangleWidth, triangleHeight) {
    RoundedRectangle_1.RoundedRectangle(context, {
        width: width,
        height: height,
        x: x - width / 2.0,
        y: y - height - triangleHeight,
        radius: 5
    });
    Triangle_1.Triangle(context, x - triangleWidth / 2.0, y - triangleHeight, x + triangleWidth / 2.0, y - triangleHeight, x, y);
};
