"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var minimapRenderer_1 = require("./minimapRenderer");
// import { ZoomPan } from './zoomPan';
var menuRenderer_1 = require("./menuRenderer");
var Events_1 = require("../Events");
var Colors_1 = require("../Theme/Colors");
var nodeRenderer_1 = require("./nodeRenderer");
var activeLinkRenderer_1 = require("./activeLinkRenderer");
var linkRenderer_1 = require("./linkRenderer");
var descriptionRenderer_1 = require("./descriptionRenderer");
/**
 * Renderer.
 *
 * Main renderer service. Responsibilities:
 * - store context for canvas drawing
 * - set up the render loop
 * - render nodes, links and particular subcomponents (cursor, menu, minimap etc.)
 *
 */
var Renderer = /** @class */ (function () {
    /**
     * @param eventBus event bus instance to be used
     * @param context context from the canvas
     * @param stateManager state manager instance to fetch data from
     * @param theme Color and positional options of diagram
     */
    function Renderer(eventBus, context, stateManager, theme) {
        var _this = this;
        this.eventBus = eventBus;
        this.context = context;
        this.stateManager = stateManager;
        this.theme = theme;
        this.minimapRenderer = new minimapRenderer_1.MinimapRenderer();
        this.renderUpdate = function () {
            window.requestAnimationFrame(_this.render);
        };
        this.render = function () {
            // (...) render loop
            // const transform = this.zoomPan.calculateTransform();
            _this.minimapRenderer.render(_this.context);
            _this.renderCursor();
            _this.renderBackground();
            _this.renderLinks();
            _this.renderNodes();
            _this.renderDescriptions();
            _this.renderMenu();
            _this.renderActiveLink();
        };
        this.nodeRenderer = new nodeRenderer_1.NodeRenderer(this.context, this.theme);
        this.nodeRenderer = new nodeRenderer_1.NodeRenderer(this.context, this.theme);
        this.descriptionRenderer = new descriptionRenderer_1.DescriptionRenderer(this.context, this.theme);
        this.menuRenderer = new menuRenderer_1.MenuRenderer(this.context, this.theme);
        this.activeLinkRenderer = new activeLinkRenderer_1.ActiveLinkRenderer(this.context, this.theme);
        this.linkRenderer = new linkRenderer_1.LinkRenderer(this.context, this.theme);
        this.eventBus.subscribe(Events_1.DiagramEvents.RenderRequested, this.render);
    }
    Renderer.prototype.setCursor = function (cursor) {
        this.context.canvas.style.cursor = cursor;
    };
    /**
     * Render cursor.
     */
    Renderer.prototype.renderCursor = function () {
        var state = this.stateManager.getState();
        if (state.drawedConnection) {
            this.setCursor("grabbing");
            return;
        }
        if (state.hover.node) {
            this.setCursor("move");
            if (state.hover.io) {
                this.setCursor("crosshair");
                return;
            }
            return;
        }
        if (state.hover.description) {
            this.setCursor("text");
            return;
        }
        if (state.hover.menu) {
            this.setCursor("pointer");
            return;
        }
        this.setCursor("auto");
    };
    /**
     * Render nodes.
     */
    Renderer.prototype.renderNodes = function () {
        var _this = this;
        var state = this.stateManager.getState();
        state.nodes.forEach(function (node) {
            return _this.nodeRenderer.render({
                node: node,
                isHovered: state.hover.node === node,
                isSelected: state.selectedNodes.indexOf(node) !== -1,
                inputActive: state.hover.node === node && state.hover.io == "i",
                outputActive: state.hover.node === node && state.hover.io == "o"
            });
        });
    };
    /**
     * Render descriptions.
     */
    Renderer.prototype.renderDescriptions = function () {
        var node = this.stateManager.getState().hover.node;
        node && this.descriptionRenderer.render({ node: node });
    };
    /**
     * Render active link connection.
     */
    Renderer.prototype.renderActiveLink = function () {
        var state = this.stateManager.getState();
        if (state.drawedConnection && state.lastPosition) {
            this.activeLinkRenderer.render({
                from: state.lastPosition,
                to: state.drawedConnection
            });
        }
    };
    /**
     * Render links
     */
    Renderer.prototype.renderLinks = function () {
        var _this = this;
        var state = this.stateManager.getState();
        state.links.forEach(function (l) { return _this.linkRenderer.render(l, false); });
        state.links
            .filter(function (l) { return state.selectedNodes.indexOf(l.i) !== -1; })
            .forEach(function (l) { return _this.linkRenderer.render(l, true); });
        state.links
            .filter(function (l) { return state.selectedNodes.indexOf(l.o) !== -1; })
            .forEach(function (l) { return _this.linkRenderer.render(l, true); });
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
        this.context.fillStyle = Colors_1.Colors.grey[6];
        this.context.fillRect(0, 0, width, height);
    };
    Renderer.prototype.renderMenu = function () {
        var state = this.stateManager.getState();
        var index = state.hover.menu ? state.hover.menu.index : undefined;
        if (state.menu) {
            this.menuRenderer.render(state.menu.position, state.categories, index);
        }
    };
    Renderer.prototype.renderStart = function () {
        window.requestAnimationFrame(this.render);
    };
    return Renderer;
}());
exports.Renderer = Renderer;
