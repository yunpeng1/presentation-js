// Copyright 2016 Dorival Pedroso. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import {drawCircle,drawSquare,drawLines} from './canvas.commands.js';

export default class CurveProps {
    constructor(pen, withLin, withMrk, mrkType, mrkSize, mrkEvery) {
        this.pen      = pen;
        this.withLin  = withLin;
        this.withMrk  = withMrk;
        this.mrkType  = mrkType;
        this.mrkSize  = mrkSize;
        this.mrkEvery = mrkEvery;
    }

    // drawLines draws lines
    drawLines(ctx, X, Y) {
        if (X.length > 0 && this.withLin) {
            this.pen.activate(ctx);
            drawLines(ctx, X, Y);
            ctx.restore();
        }
    }

    // drawMarkers draws markers
    drawMarkers(ctx, X, Y) {
        if (X.length < 1 || !this.withMrk) { return; }
        this.pen.activate(ctx);
        let idx_mark = 0;
        switch (this.mrkType) {

        // open square
        case 'S':
            for (let i = 0; i < X.length; i++) {
                if (i >= idx_mark) {
                    drawSquare(ctx, X[i], Y[i], this.mrkSize, false);
                    idx_mark += this.mrkEvery;
                }
            }
            break;

        // filled square
        case 's':
            for (let i = 0; i < X.length; i++) {
                if (i >= idx_mark) {
                    drawSquare(ctx, X[i], Y[i], this.mrkSize, true);
                    idx_mark += this.mrkEvery;
                }
            }
            break;

        // open circle
        case 'O':
            for (let i = 0; i < X.length; i++) {
                if (i >= idx_mark) {
                    drawCircle(ctx, X[i], Y[i], this.mrkSize/2, false);
                    idx_mark += this.mrkEvery;
                }
            }
            break;

        // filled circle
        default:
            for (let i = 0; i < X.length; i++) {
                if (i >= idx_mark) {
                    drawCircle(ctx, X[i], Y[i], this.mrkSize/2, true);
                    idx_mark += this.mrkEvery;
                }
            }
        }
        ctx.restore();
    }
}
