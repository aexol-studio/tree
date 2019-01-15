"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Renderer_1 = require("../Renderer");
var EventBus_1 = require("../EventBus");
var stateManager_1 = require("./stateManager");
var IO_1 = require("../IO");
var DefaultDiagramTheme_1 = require("../Theme/DefaultDiagramTheme");
/**
 * Diagram:
 *
 * Main class. Responsibilities:
 * - instantiating the diagram in the DOM element given by constructor
 * - initializing all of the subcomponents: renderer, IO, state manager etc.
 */
var Diagram = /** @class */ (function () {
    function Diagram(domElement, theme, connectionFunction) {
        if (theme === void 0) { theme = DefaultDiagramTheme_1.DefaultDiagramTheme; }
        if (connectionFunction === void 0) { connectionFunction = function (input, output) { return true; }; }
        if (typeof document === "undefined") {
            throw new Error("Diagram can work only in DOM-enabled environment (e.g. browser)!");
        }
        var canvasElement = document.createElement("canvas");
        var canvasContext = canvasElement.getContext("2d");
        canvasContext.font = "10px Helvetica";
        var hostSize = this.calculateElementSize(domElement);
        canvasElement.oncontextmenu = function () { return false; };
        canvasElement.width = hostSize.width * 2;
        canvasElement.height = hostSize.height * 2;
        canvasElement.style.width = hostSize.width + "px";
        canvasElement.style.height = hostSize.height + "px";
        while (domElement.firstChild) {
            domElement.removeChild(domElement.firstChild);
        }
        domElement.appendChild(canvasElement);
        if (!canvasContext) {
            throw new Error("Can't create canvas context!");
        }
        // create a main event bus
        this.eventBus = new EventBus_1.EventBus();
        // initialize IO: mouse/keyboard logic will be there
        new IO_1.IO(this.eventBus, canvasElement);
        // initialize state manager
        this.stateManager = new stateManager_1.StateManager(this.eventBus, theme, connectionFunction);
        // initialize renderer
        this.renderer = new Renderer_1.Renderer(this.eventBus, canvasContext, this.stateManager, theme);
        // ...start the rendering loop
        this.renderer.renderStart();
    }
    Diagram.prototype.setCategories = function (categories) {
        this.stateManager.setCategories(categories);
    };
    Diagram.prototype.setDefinitions = function (nodeDefinitions) {
        this.stateManager.setDefinitions(nodeDefinitions);
    };
    Diagram.prototype.calculateElementSize = function (domElement) {
        return { width: domElement.clientWidth, height: domElement.clientHeight };
    };
    return Diagram;
}());
exports.Diagram = Diagram;
