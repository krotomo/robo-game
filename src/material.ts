declare global {
  interface HTMLImageElement {
    sprite: Sprite;
  }
}

class Material {
  constructor(
    private gl: WebGLRenderingContext,
    private vs: string,
    private fs: string,
    public program: WebGLProgram | null = null
  ) {
    this.gl = gl;
    let vsShader = this.getShader(vs, this.gl.VERTEX_SHADER);
    let fsShader = this.getShader(fs, this.gl.FRAGMENT_SHADER);

    if (vsShader && fsShader) {
      this.program = this.gl.createProgram()!;
      this.gl.attachShader(this.program, vsShader);
      this.gl.attachShader(this.program, fsShader);
      this.gl.linkProgram(this.program);

      if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
        console.error(this.gl.getProgramInfoLog(this.program));
        this.gl.deleteProgram(this.program);
      }

      this.gl.detachShader(this.program, vsShader);
      this.gl.detachShader(this.program, fsShader);
    }
  }

  getShader(script: string, type: number) {
    let output = this.gl.createShader(type)!;
    this.gl.shaderSource(output, script);
    this.gl.compileShader(output);

    if (!this.gl.getShaderParameter(output, this.gl.COMPILE_STATUS)) {
      console.error(this.gl.getShaderInfoLog(output));
      this.gl.deleteShader(output);
      return null;
    }

    return output;
  }
}

class Sprite {
  private gl: WebGLRenderingContext;
  private isLoaded: boolean;
  private material: Material;
  private image: HTMLImageElement;
  private geo_buff: WebGLBuffer | null = null;

  constructor(
    gl: WebGLRenderingContext,
    img_url: string,
    vs: string,
    fs: string,
    private gl_tex: WebGLTexture | null = null,
    private tex_buff: WebGLBuffer | null = null,
    private aPositionLoc: number | null = null,
    private aTexCoordLoc: number | null = null,
    private iImageLoc: WebGLUniformLocation | null = null
  ) {
    this.gl = gl;
    this.isLoaded = false;
    this.material = new Material(this.gl, vs, fs);
    this.image = new Image();
    this.image.src = img_url;
    this.image.sprite = this;
    this.image.onload = () => {
      this.setup();
    };
  }

  static createRectArray(x = 0, y = 0, w = 1, h = 1) {
    return new Float32Array([
      x,
      y,
      x + w,
      y,
      x,
      y + h,
      x,
      y + h,
      x + w,
      y,
      x + w,
      y + h,
    ]);
  }

  setup() {
    let gl = this.gl;
    gl.useProgram(this.material.program);
    this.gl_tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.gl_tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      this.image
    );
    gl.bindTexture(gl.TEXTURE_2D, null);

    this.tex_buff = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.tex_buff);
    gl.bufferData(gl.ARRAY_BUFFER, Sprite.createRectArray(), gl.STATIC_DRAW);

    this.geo_buff = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.geo_buff);
    gl.bufferData(gl.ARRAY_BUFFER, Sprite.createRectArray(), gl.STATIC_DRAW);

    this.aPositionLoc = gl.getAttribLocation(
      this.material.program!,
      "a_position"
    );
    this.aTexCoordLoc = gl.getAttribLocation(
      this.material.program!,
      "a_texCoord"
    );
    this.iImageLoc = gl.getUniformLocation(this.material.program!, "u_image");

    gl.useProgram(null);
    this.isLoaded = true;
  }

  render() {
    if (!this.isLoaded) return;
    let gl = this.gl;
    gl.useProgram(this.material.program!);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.gl_tex);
    gl.uniform1i(this.iImageLoc!, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.tex_buff);
    gl.enableVertexAttribArray(this.aTexCoordLoc!);
    gl.vertexAttribPointer(this.aTexCoordLoc!, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.geo_buff);
    gl.enableVertexAttribArray(this.aPositionLoc!);
    gl.vertexAttribPointer(this.aPositionLoc!, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 6);
  }
}

export default Sprite;
