"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var Diagram_1 = require("../Diagram");
/**
 * Wrapper react component that creates Diagram instance and attaches it
 * to the <div>.
 *
 * Props:
 * - categories with node types
 * - width in pixels (100% if not set)
 * - height in pixels (100% if not set)
 * - ...
 */
var DiagramReact = /** @class */ (function (_super) {
    __extends(DiagramReact, _super);
    function DiagramReact() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.containerRef = React.createRef();
        _this.diagram = undefined;
        return _this;
    }
    DiagramReact.prototype.setupSizes = function () {
        if (this.props.width) {
            this.containerRef.current.style.width = this.props.width;
        }
        else {
            this.containerRef.current.style.width = '100%';
        }
        if (this.props.height) {
            this.containerRef.current.style.height = this.props.height;
        }
        else {
            this.containerRef.current.style.height = '100%';
        }
    };
    DiagramReact.prototype.componentDidMount = function () {
        if (!this.containerRef.current) {
            return;
        }
        this.setupSizes();
        this.diagram = new Diagram_1.Diagram(this.containerRef.current);
        this.diagram.setCategories(this.props.categories);
    };
    DiagramReact.prototype.componentDidUpdate = function (prevProps) {
        if (prevProps.categories !== this.props.categories && this.diagram) {
            this.diagram.setCategories(this.props.categories);
        }
    };
    DiagramReact.prototype.render = function () {
        return (React.createElement("div", { ref: this.containerRef }));
    };
    return DiagramReact;
}(React.Component));
exports.DiagramReact = DiagramReact;
