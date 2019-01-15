"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Renamer = /** @class */ (function () {
    function Renamer(initialValue) {
        if (initialValue === void 0) { initialValue = ""; }
        var textHandler = document.createElement("input");
        textHandler.value = initialValue;
        textHandler.id = "inputss";
        textHandler.autofocus = true;
        textHandler.style.visibility = "visible";
        textHandler.style.position = "fixed";
        textHandler.style.top = "0px";
        textHandler.style.pointerEvents = "none";
        textHandler.style.opacity = "0.0";
        document.body.appendChild(textHandler);
        this.textHandler = textHandler;
    }
    Renamer.prototype.rename = function (initialValue, onChange) {
        var _this = this;
        if (initialValue === void 0) { initialValue = ""; }
        this.textHandler.value = initialValue;
        this.textHandler.oninput = function (e) {
            onChange(e.target.value);
        };
        setTimeout(function () { return _this.textHandler.focus(); }, 10);
    };
    return Renamer;
}());
exports.Renamer = Renamer;
