class M3 {
  matrix!: Float32Array;
  static readonly M00 = 0;
  static readonly M01 = 1;
  static readonly M02 = 2;
  static readonly M10 = 3;
  static readonly M11 = 4;
  static readonly M12 = 5;
  static readonly M20 = 6;
  static readonly M21 = 7;
  static readonly M22 = 8;

  constructor() {
    this.matrix = new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);
  }

  multiply(other: M3) {
    let output = new M3();
    output.matrix = new Float32Array([
      this.matrix[M3.M00] * other.matrix[M3.M00] +
        this.matrix[M3.M10] * other.matrix[M3.M01] +
        this.matrix[M3.M20] * other.matrix[M3.M02],
      this.matrix[M3.M01] * other.matrix[M3.M00] +
        this.matrix[M3.M11] * other.matrix[M3.M01] +
        this.matrix[M3.M21] * other.matrix[M3.M02],
      this.matrix[M3.M02] * other.matrix[M3.M00] +
        this.matrix[M3.M12] * other.matrix[M3.M01] +
        this.matrix[M3.M22] * other.matrix[M3.M02],
      this.matrix[M3.M00] * other.matrix[M3.M10] +
        this.matrix[M3.M10] * other.matrix[M3.M11] +
        this.matrix[M3.M20] * other.matrix[M3.M12],
      this.matrix[M3.M01] * other.matrix[M3.M10] +
        this.matrix[M3.M11] * other.matrix[M3.M11] +
        this.matrix[M3.M21] * other.matrix[M3.M12],
      this.matrix[M3.M02] * other.matrix[M3.M10] +
        this.matrix[M3.M12] * other.matrix[M3.M11] +
        this.matrix[M3.M22] * other.matrix[M3.M12],
      this.matrix[M3.M00] * other.matrix[M3.M20] +
        this.matrix[M3.M10] * other.matrix[M3.M21] +
        this.matrix[M3.M20] * other.matrix[M3.M22],
      this.matrix[M3.M01] * other.matrix[M3.M20] +
        this.matrix[M3.M11] * other.matrix[M3.M21] +
        this.matrix[M3.M21] * other.matrix[M3.M22],
      this.matrix[M3.M02] * other.matrix[M3.M20] +
        this.matrix[M3.M12] * other.matrix[M3.M21] +
        this.matrix[M3.M22] * other.matrix[M3.M22],
    ]);
    return output;
  }

  translate(v: V2): M3 {
    let output = new M3();
    output.matrix = new Float32Array(this.matrix);
    output.matrix[M3.M20] += v.x;
    output.matrix[M3.M21] += v.y;
    return output;
  }

  scale(v: V2): M3 {
    let m = new M3();
    m.matrix[M3.M00] = v.x;
    m.matrix[M3.M11] = v.y;
    return this.multiply(m);
  }
}

class V2 {
  x: number;
  y: number;

  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }
}

export { M3, V2 };
