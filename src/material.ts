import { M3, V2 } from "./math";

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
    public program: WebGLProgram | null = null,
    public parameters: Record<
      string,
      { location: number; uniform: boolean; type: number }
    > = {}
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
    this.gatherParams();
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

  gatherParams() {
    let gl = this.gl;
    let isUniform = 0;
    this.parameters = {};
    while (isUniform < 2) {
      let paramType = isUniform ? gl.ACTIVE_UNIFORMS : gl.ACTIVE_ATTRIBUTES;
      let count = gl.getProgramParameter(this.program!, paramType);
      for (let i = 0; i < count; i++) {
        let details;
        let location;
        if (isUniform) {
          details = gl.getActiveUniform(this.program!, i);
          location = gl.getUniformLocation(this.program!, details!.name);
        } else {
          details = gl.getActiveAttrib(this.program!, i);
          location = gl.getAttribLocation(this.program!, details!.name);
        }
        this.parameters[details!.name] = {
          location: location as number,
          uniform: !!isUniform,
          type: details!.type,
        };
      }
      isUniform++;
    }
  }

  set(
    name: string,
    a: number | Float32Array,
    b?: number | boolean,
    c?: number,
    d?: number,
    e?: number
  ) {
    let gl = this.gl;
    let param = this.parameters[name];
    if (!param) return;
    let loc = param.location;
    if (param.uniform) {
      switch (param.type) {
        case gl.FLOAT:
          gl.uniform1f(loc, a as number);
          break;
        case gl.FLOAT_VEC2:
          gl.uniform2f(loc, a as number, b as number);
          break;
        case gl.FLOAT_VEC3:
          gl.uniform3f(loc, a as number, b as number, c!);
          break;
        case gl.FLOAT_VEC4:
          gl.uniform4f(loc, a as number, b as number, c!, d!);
          break;
        case gl.FLOAT_MAT3:
          gl.uniformMatrix3fv(loc, false, a as Float32Array);
          break;
        case gl.FLOAT_MAT4:
          gl.uniformMatrix4fv(loc, false, a as Float32Array);
          break;
        case gl.SAMPLER_2D:
          gl.uniform1i(loc, a as number);
          break;
      }
    } else {
      gl.enableVertexAttribArray(loc);
      if (a == undefined) a = gl.FLOAT;
      let normalized = typeof b === "boolean" ? b : false;
      if (c == undefined) c = 0;
      if (d == undefined) d = 0;
      switch (param.type) {
        case gl.FLOAT:
          gl.vertexAttribPointer(loc, 1, gl.FLOAT, normalized, c, d);
          break;
        case gl.FLOAT_VEC2:
          gl.vertexAttribPointer(loc, 2, gl.FLOAT, normalized, c, d);
          break;
        case gl.FLOAT_VEC3:
          gl.vertexAttribPointer(loc, 3, gl.FLOAT, normalized, c, d);
          break;
        case gl.FLOAT_VEC4:
          gl.vertexAttribPointer(loc, 4, gl.FLOAT, normalized, c, d);
          break;
      }
    }
  }
}

class Sprite {
  private isLoaded: boolean;
  private material: Material;
  private image: HTMLImageElement;
  private geo_buff: WebGLBuffer | null = null;
  private gl_tex: WebGLTexture | null = null;
  private tex_buff: WebGLBuffer | null = null;
  private uv_x: number = 0;
  private uv_y: number = 0;
  size: V2;
  position: V2;

  constructor(
    private gl: WebGLRenderingContext,
    img_url: string,
    vs: string,
    fs: string,
    opts: { size: V2; position: V2 } = {
      size: new V2(32, 32),
      position: new V2(0, 0),
    }
  ) {
    this.isLoaded = false;
    this.material = new Material(this.gl, vs, fs);

    this.size = opts.size;
    this.position = opts.position;

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

    this.uv_x = this.size.x / this.image.width;
    this.uv_y = this.size.y / this.image.height;

    this.tex_buff = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.tex_buff);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      Sprite.createRectArray(0, 0, this.uv_x, this.uv_y),
      gl.STATIC_DRAW
    );

    this.geo_buff = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.geo_buff);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      Sprite.createRectArray(0, 0, this.size.x, this.size.y),
      gl.STATIC_DRAW
    );

    gl.useProgram(null);
    this.isLoaded = true;
  }

  render(frames: V2) {
    if (!this.isLoaded) return;
    let gl = this.gl;
    gl.useProgram(this.material.program!);

    let frame_x = Math.floor(frames.x) * this.uv_x;
    let frame_y = Math.floor(frames.y) * this.uv_y;

    let objectMatrix = new M3().translate(this.position);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.gl_tex);
    this.material.set("u_image", 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.tex_buff);
    this.material.set("a_texCoord", gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.geo_buff);
    this.material.set("a_position", gl.FLOAT, false, 0, 0);

    this.material.set("u_frame", frame_x, frame_y);
    this.material.set("u_world", window.game.worldSpaceMatrix?.getFloatArray());
    this.material.set("u_object", objectMatrix.getFloatArray()!);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    gl.useProgram(null);
  }
}

export { Material, Sprite };
