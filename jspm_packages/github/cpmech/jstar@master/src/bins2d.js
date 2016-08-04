// Copyright 2016 Dorival Pedroso. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import {toInt}            from './auxiliary.js';
import {penSolidGreyBold} from './canvas.pen.js';
import {drawLine}         from './canvas.commands.js';

export default class Bins2D {

    constructor(x0, y0, w, h, binLength) {
        this.reset(x0, y0, w, h, binLength);
    }

    reset(x0, y0, w, h, binLength) {
        this.x0   = x0;
        this.y0   = y0;
        this.w    = w;
        this.h    = h;
        this.xf   = x0 + w;
        this.yf   = y0 + h;
        this.nx   = toInt(this.w / binLength);
        this.ny   = toInt(this.h / binLength);
        this.lx   = this.w / this.nx;
        this.ly   = this.h / this.ny;
        this.bins = [];
        this.h2p  = {}; // hash => point
        for (let i=0; i<this.nx * this.ny; i++) {
            this.bins[i] = [];
        }
    }

    hashPt(x, y) {
        return toInt(x + y*10001);
    }

    calcn(x, y) {
        let i = toInt((x - this.x0) / this.lx);
        let j = toInt((y - this.y0) / this.ly);
        if (i == this.nx) {
            i = this.nx - 1;
        }
        if (j == this.ny) {
            j = this.ny - 1;
        }
        return i + j * this.nx;
    }

    push(x, y, data) {
        if (x < this.x0 || x > this.xf || y < this.y0 || y > this.yf) {
            return; // out of range
        }
        let h = this.hashPt(x, y);
        let n = this.calcn(x, y);
        if (n < 0 || n > this.bins.length-1) { return; }
        let k = this.bins[n].indexOf(h);
        if (k < 0) { // not found
            this.bins[n].push(h);
            this.h2p[h] = {x:x, y:y, data:data};
        }
    }

    find(x, y) {
        if ((x<this.x0) || (x>this.xf) || (y<this.y0) || (y>this.yf)) {
            return null;
        }
        let n = this.calcn(x, y);
        if (n < 0 || n > this.bins.length-1) { return null; }
        let dclosest = this.w * this.h * 2;
        let hclosest = -1;
        for (let i=0; i<this.bins[n].length; i++) {
            let h  = this.bins[n][i];
            let xp = this.h2p[h].x;
            let yp = this.h2p[h].y;
            let d  = Math.sqrt((x-xp)*(x-xp) + (y-yp)*(y-yp));
            if (d < dclosest) {
                dclosest = d;
                hclosest = h;
            }
        }
        if (hclosest < 0) {
            return null;
        }
        let res = this.h2p[hclosest];
        res.dclosest = dclosest;
        return res;
    }

    draw(ctx) {
        penSolidGreyBold.activate(ctx);
        for (let i=0; i<this.ny+1; i++) {
            let yi = this.y0 + i * this.ly;
            drawLine(ctx, this.x0, yi, this.x0 + this.w, yi);
        }
        for (let i=0; i<this.nx+1; i++) {
            let xi = this.x0 + i * this.lx;
            drawLine(ctx, xi, this.y0, xi, this.y0 + this.h);
        }
        ctx.restore();
    }
}
