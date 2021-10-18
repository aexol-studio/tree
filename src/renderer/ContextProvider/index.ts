export class ContextProvider {
  private _context: CanvasRenderingContext2D;

  constructor(initialContext: CanvasRenderingContext2D) {
    this._context = initialContext;
  }

  switchContext(context: CanvasRenderingContext2D) {
    this._context = context;
  }

  get context() {
    return this._context;
  }
}