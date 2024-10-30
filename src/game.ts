import Sprite from "./material.js";

declare global {
  interface Window {
    game: Game;
  }
}

class Game {
  private canvasElm: HTMLCanvasElement;
  private gl: WebGL2RenderingContext;
  private sprite: Sprite;

  constructor() {
    this.canvasElm = document.createElement("canvas");
    this.canvasElm.width = 800;
    this.canvasElm.height = 600;

    this.gl = this.canvasElm.getContext("webgl2")!;

    document.body.appendChild(this.canvasElm);

    const vs = document.getElementById("vs_01")!.textContent!;
    const fs = document.getElementById("fs_01")!.textContent!;

    this.sprite = new Sprite(this.gl, "assets/robobo.png", vs, fs);
  }

  update(): void {
    this.gl.viewport(0, 0, this.canvasElm.width, this.canvasElm.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

    this.sprite.render();

    this.gl.flush();
  }
}

function loop(): void {
  window.game.update();
  requestAnimationFrame(loop);
}

window.addEventListener("load", function (): void {
  window.game = new Game();
  loop();
});

export {};
