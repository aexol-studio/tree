"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var cursorRenderer_1 = require("./cursorRenderer");
var minimapRenderer_1 = require("./minimapRenderer");
var zoomPan_1 = require("./zoomPan");
var menuRenderer_1 = require("./menuRenderer");
/**
 * Renderer.
 *
 * Main renderer service. Responsibilities:
 * - store context for canvas drawing
 * - set up the render loop
 * - render nodes, links and particular subcomponents (cursor, menu, minimap etc.)
 *
 * - IMPORTANT -
 * - Currently, render loop is handled by requestAnimationFrame.
 * - It might be worth considering invoking rerendering
 * - e.g. only when application state has changed.
 */
var Renderer = /** @class */ (function () {
    /**
     * @param eventBus event bus instance to be used
     * @param context context from the canvas
     * @param stateManager state manager instance to fetch data from
     */
    function Renderer(eventBus, context, stateManager) {
        this.cursorRenderer = new cursorRenderer_1.CursorRenderer();
        this.minimapRenderer = new minimapRenderer_1.MinimapRenderer();
        this.zoomPan = new zoomPan_1.ZoomPan();
        this.menuRenderer = new menuRenderer_1.MenuRenderer();
        // ...
        // initialization
        this.eventBus = eventBus;
        this.context = context;
        this.stateManager = stateManager;
        // possibility to re-render on particular
        this.eventBus.subscribe('fooBarXyzAbc', this.render);
        this.render = this.render.bind(this);
    }
    /**
     * Example method!
     * @param nodes
     */
    Renderer.prototype.renderNodes = function (nodes) {
        var _this = this;
        var state = this.stateManager.getState();
        this.context.fillStyle = '#aaa';
        state.nodes.forEach(function (node) {
            _this.context.fillRect(node.x, node.y, 60, 20);
        });
    };
    /**
    * Example method!
    * @param links
    */
    Renderer.prototype.renderLinks = function (links) {
        // ...
    };
    /**
    * Example method!
    * @param something
    */
    Renderer.prototype.renderSomething = function (something) {
        // ...
    };
    /**
    * Example method!
    */
    Renderer.prototype.renderBackground = function () {
        var _a = this.context.canvas, width = _a.width, height = _a.height;
        this.context.fillStyle = '#555';
        this.context.fillRect(0, 0, width, height);
    };
    Renderer.prototype.renderStart = function () {
        window.requestAnimationFrame(this.render);
    };
    Renderer.prototype.render = function () {
        // (...) render loop
        var transform = this.zoomPan.calculateTransform();
        this.cursorRenderer.render(this.context);
        this.minimapRenderer.render(this.context);
        this.menuRenderer.render(this.context);
        this.renderBackground();
        this.renderNodes([]);
        this.renderLinks([]);
        window.requestAnimationFrame(this.render);
    };
    return Renderer;
}());
exports.Renderer = Renderer;
