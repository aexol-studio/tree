interface Position {
  x: number,
  y: number,
};

export class ZoomPanManager {
  private containerElement: HTMLDivElement;
  private position: Position = { x: 0, y: 0 };
  private scale = 1.0;

  constructor() {
    this.registerContainerElement = this.registerContainerElement.bind(this);
    this.panBy = this.panBy.bind(this);
    this.zoomChanged = this.zoomChanged.bind(this);
    this.applyTransformationMatrix = this.applyTransformationMatrix.bind(this);
  }

  registerContainerElement(elementRef: HTMLDivElement) {
    this.containerElement = elementRef;
  }

  private applyTransformationMatrix() {
    window.requestAnimationFrame(() => {
      if (this.containerElement) {
        const m = [this.scale, 0, 0, this.scale, this.position.x, this.position.y];
        this.containerElement.style.transform = `matrix(${m.join(',')})`;
      }
    });
  }

  private setPosition(x: number, y: number) {
    this.position.x = x;
    this.position.y = y;
    this.applyTransformationMatrix();
  }

  private setPositionAndScale(x: number, y: number, newScale: number) {
    this.position.x = x;
    this.position.y = y;
    this.scale = newScale;
    this.applyTransformationMatrix();
  }

  public zoomChanged(delta: number, x: number, y: number) {

    const scaleChange = delta / -800.0;

    let newScale = this.scale + scaleChange;

    if (newScale < 0.2) {
      newScale = 0.2;
    }

    if (newScale > 1.0) {
      newScale = 1.0;
    }

    const change = (this.scale - newScale);

    this.setPositionAndScale(
      this.position.x + (((x / this.scale) - (this.position.x / this.scale)) * change),
      this.position.y + (((y / this.scale) - (this.position.y / this.scale)) * change),
      newScale
    );

    return newScale;
  }
  public panBy(dx: number, dy: number) {
    this.setPosition(
      this.position.x + dx,
      this.position.y + dy,
    );
  }
  public panTo(x: number, y: number) {
    this.setPosition(
      x,
      y,
    );
  }
  public getPosition(): Position {
    return this.position;
  }
  public getScale(): number {
    return this.scale;
  }
}
