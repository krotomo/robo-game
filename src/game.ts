declare global {
  interface Window {
    game: Game;
  }
}

class Game {
  private canvasElm: HTMLCanvasElement;
  private gl: WebGL2RenderingContext;

  constructor() {
    this.canvasElm = document.createElement("canvas");
    this.canvasElm.width = 800;
    this.canvasElm.height = 600;

    this.gl = this.canvasElm.getContext("webgl2")!;

    document.body.appendChild(this.canvasElm);
  }

  update(): void {
    this.gl.viewport(0, 0, this.canvasElm.width, this.canvasElm.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.gl.enable(this.gl.BLEND);
  }
}

function loop(): void {
  window.game.update();
  requestAnimationFrame(loop);
}

window.addEventListener("load", function (): void {
  window.game = new Game();
});

export {};
