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
var DiagramReact = /** @class */ (function (_super) {
    __extends(DiagramReact, _super);
    function DiagramReact() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.saveRef = function (ref) {
            _this.containerRef = ref;
        };
        return _this;
    }
    DiagramReact.prototype.componentDidMount = function () {
        this.diagram = new Diagram_1.Diagram(this.containerRef);
        this.diagram.setCategories(this.props.categories);
    };
    DiagramReact.prototype.componentDidUpdate = function (prevProps) {
        if (prevProps.categories !== this.props.categories) {
            this.diagram.setCategories(this.props.categories);
        }
    };
    DiagramReact.prototype.render = function () {
        return (<div ref={this.saveRef}></div>);
    };
    return DiagramReact;
}(React.Component));
exports.DiagramReact = DiagramReact;
