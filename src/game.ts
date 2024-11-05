import { Sprite } from "./material.js";
import { M3, V2 } from "./math.js";

declare global {
  interface Window {
    game: Game;
  }
}

class Game {
  private canvasElm: HTMLCanvasElement;
  private gl: WebGL2RenderingContext;
  private sprite: Sprite;
  private worldSpaceMatrix: M3;

  constructor() {
    this.canvasElm = document.createElement("canvas");
    this.resize();

    this.worldSpaceMatrix = new M3();

    this.gl = this.canvasElm.getContext("webgl2")!;

    document.body.appendChild(this.canvasElm);

    const vs = `
      attribute vec2 a_position;
      attribute vec2 a_texCoord;

      uniform mat3 u_world;

      varying vec2 v_texCoord;
      void main() {
        gl_Position = vec4(u_world * vec3(a_position, 1), 1);
        v_texCoord = a_texCoord;
      }
    `;
    const fs = `
      precision mediump float;
      uniform sampler2D u_image;
      varying vec2 v_texCoord;

      void main() {
        gl_FragColor = texture2D(u_image, v_texCoord);
      }
    `;

    this.sprite = new Sprite(
      this.gl,
      "assets/robobo.png",
      vs,
      fs,
      this.worldSpaceMatrix
    );

    let m = new M3();
    let n = new M3();
    m.matrix[M3.M01] = 2;
    m.matrix[M3.M11] = 5;

    n.matrix[M3.M00] = 3;
    n.matrix[M3.M20] = 6;
    n.matrix[M3.M11] = 3;
    n.matrix[M3.M21] = 4;

    let c = m.multiply(n);
    console.log(c.matrix);

    window.addEventListener("resize", () => this.resize());
  }

  private resize(): void {
    const targetAspectRatio = 16 / 9;
    const currentAspectRatio = window.innerWidth / window.innerHeight;

    if (currentAspectRatio > targetAspectRatio) {
      // Window is wider than 16:9
      this.canvasElm.height = window.innerHeight;
      this.canvasElm.width = window.innerHeight * targetAspectRatio;
    } else {
      // Window is taller than 16:9
      this.canvasElm.width = window.innerWidth;
      this.canvasElm.height = window.innerWidth / targetAspectRatio;
    }

    this.worldSpaceMatrix = new M3()
      .translate(new V2(-1, 1))
      .scale(new V2(2 / this.canvasElm.width, -2 / this.canvasElm.height));
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
