// Typescript Translation of PRNG by Pranav Sathyanarayanan
// Original credit goes to: Johannes BaagÃ¸e <baagoe@baagoe.com>, 2010

module EDEN {
  export class Alea {
    seed: string;
    rn: number;

    s0: number;
    s1: number;
    s2: number;
    c: number;

    random: () => number;
    random_uint32: () => number;
    random_fract53: () => number;

    constructor(seed: string) {
      this.seed = seed;

      this.computeRand();

      this.random = () => {
        var t = 2091639 * this.s0 + this.c * 2.3283064365386963e-10; // 2^-32
        this.s0 = this.s1;
        this.s1 = this.s2;
        return this.s2 = t - (this.c = t | 0);
      }

      this.random_uint32 = () => {
        return this.random() * 0x100000000; // 2^32
      }

      this.random_fract53 = () => {
        return this.random() +
          (this.random() * 0x200000 | 0) * 1.1102230246251565e-16; // 2^-53
      }
    }

    computeRand() {
      this.s0 = this.mash(' ');
      this.s1 = this.mash(' ');
      this.s2 = this.mash(' ');
      this.c = 1;

      if(this.seed.length == 0) this.seed = '0';

      for(var i = 0; i < this.seed.length; i++) {
        this.s0 -= this.mash(this.seed[i]);
        if (this.s0 < 0) {
          this.s0 += 1;
        }
        this.s1 -= this.mash(this.seed[i]);
        if (this.s1 < 0) {
          this.s1 += 1;
        }
        this.s2 -= this.mash(this.seed[i]);
        if (this.s2 < 0) {
          this.s2 += 1;
        }
      }
    }

    mash(data: string) {
      var n: number = 0xefc8249d;

      for(var i = 0; i < data.length; i++) {
        n += data.charCodeAt(i);
        var h: number = 0.02519603282416938 * n;
        n = h >>> 0;
        h -= n;
        h *= n;
        n = h >>> 0;
        h -= n;
        n += h * 0x100000000; // 2^32
      }

      return (n >>> 0) * 2.3283064365386963e-10;
    }
  }
}
