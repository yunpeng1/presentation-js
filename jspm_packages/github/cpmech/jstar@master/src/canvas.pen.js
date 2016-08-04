// Copyright 2016 Dorival Pedroso. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

export default class Pen {

    constructor(color='black', style='solid', width=1, alpha=1) {
        this.color = color;
        this.style = style;
        this.width = width;
        this.alpha = alpha;
    }

    activate(ctx) {
        ctx.save();
        ctx.fillStyle   = this.color;
        ctx.strokeStyle = this.color;
        ctx.globalAlpha = this.alpha;
        ctx.lineWidth   = this.width;
    }
}

export const penSolidRed       = new Pen('red'     , 'solid' , 1.0, 1.0);
export const penSolidGreen     = new Pen('green'   , 'solid' , 1.0, 1.0);
export const penSolidBlue      = new Pen('blue'    , 'solid' , 1.0, 1.0);
export const penSolidBlack     = new Pen('black'   , 'solid' , 1.0, 1.0);
export const penSolidBlack06   = new Pen('black'   , 'solid' , 0.6, 1.0);
export const penSolidMagenta   = new Pen('magenta' , 'solid' , 1.0, 1.0);
export const penSolidCyan      = new Pen('cyan'    , 'solid' , 1.0, 1.0);
export const penSolidYellow    = new Pen('yellow'  , 'solid' , 1.0, 1.0);
export const penSolidGold      = new Pen('gold'    , 'solid' , 1.0, 1.0);
export const penSolidOrange    = new Pen('orange'  , 'solid' , 1.0, 1.0);
export const penSolidGrey      = new Pen('#d5d5d5' , 'solid' , 1.0, 1.0);
export const penSolidGreyLight = new Pen('#eaeaea' , 'solid' , 1.0, 1.0);
export const penSolidGreyBold  = new Pen('#d5d5d5' , 'solid' , 4.0, 1.0);

export const penSet01 = [penSolidBlue, penSolidRed, penSolidGreen, penSolidMagenta, penSolidCyan, penSolidOrange];

export function getPen(idx, setNum) {
    if (setNum == 1) {
        let n = penSet01.length;
        return penSet01[idx % n];
    }
    return penSolidBlack; // default
}
