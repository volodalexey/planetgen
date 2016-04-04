/*
 * A speed-improved simplex noise algorithm for 2D, 3D and 4D in JavaScript.
 *
 * Based on example code by Stefan Gustavson (stegu@itn.liu.se).
 * Optimisations by Peter Eastman (peastman@drizzle.stanford.edu).
 * Better rank ordering method by Stefan Gustavson in 2012.
 *
 * This code is taken from: https://github.com/joshforisha/fast-simplex-noise-js
 * Translated to Typescript by Pranav Sathyanarayanan
 */

// Data ------------------------------------------------------------------------

module EDEN {
  var G4 = (5.0 - Math.sqrt(5.0)) / 20.0;

  var GRAD4 = [
    [ 0, 1, 1, 1], [ 0, 1, 1,-1], [ 0, 1,-1, 1], [ 0, 1,-1,-1],
    [ 0,-1, 1, 1], [ 0,-1, 1,-1], [ 0,-1,-1, 1], [ 0,-1,-1,-1],
    [ 1, 0, 1, 1], [ 1, 0, 1,-1], [ 1, 0,-1, 1], [ 1, 0,-1,-1],
    [-1, 0, 1, 1], [-1, 0, 1,-1], [-1, 0,-1, 1], [-1, 0,-1,-1],
    [ 1, 1, 0, 1], [ 1, 1, 0,-1], [ 1,-1, 0, 1], [ 1,-1, 0,-1],
    [-1, 1, 0, 1], [-1, 1, 0,-1], [-1,-1, 0, 1], [-1,-1, 0,-1],
    [ 1, 1, 1, 0], [ 1, 1,-1, 0], [ 1,-1, 1, 0], [ 1,-1,-1, 0],
    [-1, 1, 1, 0], [-1, 1,-1, 0], [-1,-1, 1, 0], [-1,-1,-1, 0]
  ];

  interface NoiseOptions {
    amplitude?: number;
    frequency?: number;
    octaves?: number;
    persistence?: number;
    random?: () => number;

    min: number;
    max: number;
  }

  export class Noise {
    options: NoiseOptions;
    scale: (value: number) => number;

    perm: Uint8Array;
    permMod12: Uint8Array;

    constructor(options: NoiseOptions) {
      this.options = options;
      this.options.amplitude = options.amplitude || 1.0;
      this.options.frequency = options.frequency || 1.0;
      this.options.octaves = options.octaves || 1;
      this.options.persistence = options.persistence || 0.5;
      this.options.random = options.random || Math.random;

      if(this.options.min >= this.options.max) {
        console.log("options.min must be less than options.max");
      }

      this.scale = (value: number) => {
        return this.options.min + ((value + 1) / 2) *
               (this.options.max - this.options.min)
      }

      var i;
      var p = new Uint8Array(256);
      for(i = 0; i < 256; i++) {
        p[i] = i;
      }

      var n, q;
      for(i = 255; i > 0; i--) {
        n = Math.floor((i + 1) * this.options.random());
        q = p[i];
        p[i] = p[n];
        p[n] = q;
      }

      // To remove the need for index wrapping, double the permutation table length
      this.perm = new Uint8Array(512);
      this.permMod12 = new Uint8Array(512);
      for(i = 0; i < 512; i++) {
        this.perm[i] = p[i & 255];
        this.permMod12[i] = this.perm[i] % 12;
      }
    }

    in4D(x: number, y: number, z: number, w: number) {
      var amplitude = this.options.amplitude;
      var frequency = this.options.frequency;
      var maxAmplitude = 0;
      var noise = 0;
      var persistence = this.options.persistence;

      for (var i = 0; i < this.options.octaves; i++) {
        noise += this.raw4D(x * frequency, y * frequency, z * frequency, w * frequency) * amplitude;
        maxAmplitude += amplitude;
        amplitude *= persistence;
        frequency *= 2;
      }

      var value = noise / maxAmplitude;
      return this.scale ? this.scale(value) : value;
    }

    raw4D(x: number, y: number, z: number, w: number) {
      var perm = this.perm;
      var permMod12 = this.permMod12;

      var n0, n1, n2, n3, n4; // Noise contributions from the five corners

      // Skew the (x,y,z,w) space to determine which cell of 24 simplices we're in
      var s = (x + y + z + w) * (Math.sqrt(5.0) - 1.0) / 4.0; // Factor for 4D skewing
      var i = Math.floor(x + s);
      var j = Math.floor(y + s);
      var k = Math.floor(z + s);
      var l = Math.floor(w + s);
      var t = (i + j + k + l) * G4; // Factor for 4D unskewing
      var X0 = i - t; // Unskew the cell origin back to (x,y,z,w) space
      var Y0 = j - t;
      var Z0 = k - t;
      var W0 = l - t;
      var x0 = x - X0;  // The x,y,z,w distances from the cell origin
      var y0 = y - Y0;
      var z0 = z - Z0;
      var w0 = w - W0;

      // For the 4D case, the simplex is a 4D shape I won't even try to describe.
      // To find out which of the 24 possible simplices we're in, we need to
      // determine the magnitude ordering of x0, y0, z0 and w0.
      // Six pair-wise comparisons are performed between each possible pair
      // of the four coordinates, and the results are used to rank the numbers.
      var rankx = 0;
      var ranky = 0;
      var rankz = 0;
      var rankw = 0;
      if (x0 > y0) {
        rankx++;
      } else {
        ranky++;
      }
      if (x0 > z0) {
        rankx++;
      } else {
        rankz++;
      }
      if (x0 > w0) {
        rankx++;
      } else {
        rankw++;
      }
      if (y0 > z0) {
        ranky++;
      } else {
        rankz++;
      }
      if (y0 > w0) {
        ranky++;
      } else {
        rankw++;
      }
      if (z0 > w0) {
        rankz++;
      } else {
        rankw++;
      }
      var i1, j1, k1, l1; // The integer offsets for the second simplex corner
      var i2, j2, k2, l2; // The integer offsets for the third simplex corner
      var i3, j3, k3, l3; // The integer offsets for the fourth simplex corner

      // simplex[c] is a 4-vector with the numbers 0, 1, 2 and 3 in some order.
      // Many values of c will never occur, since e.g. x>y>z>w makes x<z, y<w and x<w
      // impossible. Only the 24 indices which have non-zero entries make any sense.
      // We use a thresholding to set the coordinates in turn from the largest magnitude.
      // Rank 3 denotes the largest coordinate.
      i1 = rankx >= 3 ? 1 : 0;
      j1 = ranky >= 3 ? 1 : 0;
      k1 = rankz >= 3 ? 1 : 0;
      l1 = rankw >= 3 ? 1 : 0;
      // Rank 2 denotes the second largest coordinate.
      i2 = rankx >= 2 ? 1 : 0;
      j2 = ranky >= 2 ? 1 : 0;
      k2 = rankz >= 2 ? 1 : 0;
      l2 = rankw >= 2 ? 1 : 0;
      // Rank 1 denotes the second smallest coordinate.
      i3 = rankx >= 1 ? 1 : 0;
      j3 = ranky >= 1 ? 1 : 0;
      k3 = rankz >= 1 ? 1 : 0;
      l3 = rankw >= 1 ? 1 : 0;

      // The fifth corner has all coordinate offsets = 1, so no need to compute that.
      var x1 = x0 - i1 + G4; // Offsets for second corner in (x,y,z,w) coords
      var y1 = y0 - j1 + G4;
      var z1 = z0 - k1 + G4;
      var w1 = w0 - l1 + G4;
      var x2 = x0 - i2 + 2.0 * G4; // Offsets for third corner in (x,y,z,w) coords
      var y2 = y0 - j2 + 2.0 * G4;
      var z2 = z0 - k2 + 2.0 * G4;
      var w2 = w0 - l2 + 2.0 * G4;
      var x3 = x0 - i3 + 3.0 * G4; // Offsets for fourth corner in (x,y,z,w) coords
      var y3 = y0 - j3 + 3.0 * G4;
      var z3 = z0 - k3 + 3.0 * G4;
      var w3 = w0 - l3 + 3.0 * G4;
      var x4 = x0 - 1.0 + 4.0 * G4; // Offsets for last corner in (x,y,z,w) coords
      var y4 = y0 - 1.0 + 4.0 * G4;
      var z4 = z0 - 1.0 + 4.0 * G4;
      var w4 = w0 - 1.0 + 4.0 * G4;

      // Work out the hashed gradient indices of the five simplex corners
      var ii = i & 255;
      var jj = j & 255;
      var kk = k & 255;
      var ll = l & 255;
      var gi0 = perm[ii + perm[jj + perm[kk + perm[ll]]]] % 32;
      var gi1 = perm[ii + i1 + perm[jj + j1 + perm[kk + k1 + perm[ll + l1]]]] % 32;
      var gi2 = perm[ii + i2 + perm[jj + j2 + perm[kk + k2 + perm[ll + l2]]]] % 32;
      var gi3 = perm[ii + i3 + perm[jj + j3 + perm[kk + k3 + perm[ll + l3]]]] % 32;
      var gi4 = perm[ii + 1 + perm[jj + 1 + perm[kk + 1 + perm[ll + 1]]]] % 32;

      // Calculate the contribution from the five corners
      var t0 = 0.5 - x0 * x0 - y0 * y0 - z0 * z0 - w0 * w0;
      if (t0 < 0) {
        n0 = 0.0;
      } else {
        t0 *= t0;
        n0 = t0 * t0 * this.dot4D(GRAD4[gi0], x0, y0, z0, w0);
      }
      var t1 = 0.5 - x1 * x1 - y1 * y1 - z1 * z1 - w1 * w1;
      if (t1 < 0) {
        n1 = 0.0;
      } else {
        t1 *= t1;
        n1 = t1 * t1 * this.dot4D(GRAD4[gi1], x1, y1, z1, w1);
      }
      var t2 = 0.5 - x2 * x2 - y2 * y2 - z2 * z2 - w2 * w2;
      if (t2 < 0) {
        n2 = 0.0;
      } else {
        t2 *= t2;
        n2 = t2 * t2 * this.dot4D(GRAD4[gi2], x2, y2, z2, w2);
      }
      var t3 = 0.5 - x3 * x3 - y3 * y3 - z3 * z3 - w3 * w3;
      if (t3 < 0) {
        n3 = 0.0;
      } else {
        t3 *= t3;
        n3 = t3 * t3 * this.dot4D(GRAD4[gi3], x3, y3, z3, w3);
      }
      var t4 = 0.5 - x4 * x4 - y4 * y4 - z4 * z4 - w4 * w4;
      if (t4 < 0) {
        n4 = 0.0;
      } else {
        t4 *= t4;
        n4 = t4 * t4 * this.dot4D(GRAD4[gi4], x4, y4, z4, w4);
      }

      // Sum up and scale the result to cover the range [-1,1]
      return 72.37857097679466 * (n0 + n1 + n2 + n3 + n4);
    }

    dot4D(g: Array<number>, x: number, y: number, z: number, w: number) {
      return g[0] * x + g[1] * y + g[2] * z + g[3] * w;
    }
  }
}
