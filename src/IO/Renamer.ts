export class Renamer {
  private textHandler: HTMLInputElement;
  constructor(initialValue: string = "") {
    const textHandler = document.createElement("input");
    textHandler.value = initialValue;
    textHandler.id = `inputss`;
    textHandler.autofocus = true;
    textHandler.style.visibility = "visible";
    textHandler.style.position = "fixed";
    textHandler.style.top = "0px";
    textHandler.style.pointerEvents = "none";
    textHandler.style.opacity = "0.0";
    document.body.appendChild(textHandler);
    this.textHandler = textHandler;
  }
  rename(initialValue: string = "", onChange: (e: string) => void) {
    this.textHandler.value = initialValue;
    this.textHandler.oninput = e => {
      onChange((e.target! as HTMLInputElement).value);
    };
    setTimeout(() => this.textHandler.focus(), 10);
  }
}
