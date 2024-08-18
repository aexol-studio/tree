export class EyeImage {
  image: HTMLImageElement;
  hidden: boolean;
  constructor(hidden: boolean) {
    this.image = new Image();
    this.hidden = true;
    this.image.src = hidden
      ? require("@/common/assets/images/eye-opened.png").default
      : require("@/common/assets/images/eye-closed.png").default;
  }

  isHidden() {
    return this.hidden;
  }
}
