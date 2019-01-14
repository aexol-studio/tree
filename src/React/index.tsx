import * as React from "react";
import { Diagram } from "../Diagram";
import { Category } from "../Models";

interface DiagramReactProps {
  categories: Category[];
  width?: string;
  height?: string;
}

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
export class DiagramReact extends React.Component<DiagramReactProps> {
  private containerRef = React.createRef<HTMLDivElement>();
  diagram?: Diagram = undefined;
  setupSizes() {
    if (this.props.width) {
      this.containerRef.current!.style.width = this.props.width;
    } else {
      this.containerRef.current!.style.width = "100%";
    }

    if (this.props.height) {
      this.containerRef.current!.style.height = this.props.height;
    } else {
      this.containerRef.current!.style.height = "100%";
    }
  }
  componentDidMount() {
    if (!this.containerRef.current) {
      return;
    }

    this.setupSizes();

    this.diagram = new Diagram(this.containerRef.current);
    this.diagram.setCategories(this.props.categories);
  }
  componentDidUpdate(prevProps: DiagramReactProps) {
    if (prevProps.categories !== this.props.categories && this.diagram) {
      this.diagram.setCategories(this.props.categories);
    }
  }
  render() {
    return <div ref={this.containerRef} />;
  }
}
