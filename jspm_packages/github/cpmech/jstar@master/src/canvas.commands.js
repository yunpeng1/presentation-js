// Copyright 2016 Dorival Pedroso. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import {toInt} from './auxiliary.js';

export function drawLine(ctx, x0, y0, xf, yf) {
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(xf, yf);
    ctx.stroke();
}

export function drawLines(ctx, X, Y) {
    ctx.beginPath();
    ctx.moveTo(X[0], Y[0]);
    for (let i=1; i<X.length; i++) {
        ctx.lineTo(X[i], Y[i]);
    }
    ctx.stroke();
}

export function drawLinesC(ctx, X, Y, obj, converter) {
    ctx.beginPath();
    let p = converter(obj, X[0], Y[0]);
    ctx.moveTo(p.x, p.y);
    for (let i=1; i<X.length; i++) {
        p = converter(obj, X[i], Y[i]);
        ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
}

export function drawCircle(ctx, xc, yc, r, filled) {
    ctx.beginPath();
    ctx.arc(xc, yc, r, 0.0, 2.0*Math.PI);
    if (filled) {
        ctx.fill();
    } else {
        ctx.stroke();
    }
}

export function drawEllipse(ctx, xc, yc, rx, ry, alpMin, alpMax, antiClockwise, closed) {
    ctx.beginPath();
    ctx.ellipse(xc, yc, rx, ry, 0, Math.PI, antiClockwise);
    if (closed) {
        ctx.closePath();
    }
    ctx.stroke();
}

export function drawSquare(ctx, x, y, l, filled) {
    if (filled) {
        ctx.fillRect(x-l/2, y-l/2, l, l);
    } else {
        ctx.strokeRect(x-l/2, y-l/2, l, l);
    }
}

export function drawRect(ctx, x0, y0, wid, hei, filled) {
    if (filled) {
        ctx.fillRect(x0, y0, wid, hei);
    } else {
        ctx.strokeRect(x0, y0, wid, hei);
    }
}

export function textWidthPx(ctx, txt, fsz, ftype='Arial') {
    ctx.font = fsz + 'px ' + ftype;
    return ctx.measureText(txt).width;
}

export function drawText(ctx, txt, x, y, ha, fsz, ftype='Arial') {
    ctx.font      = fsz + 'px ' + ftype;
    ctx.textAlign = ha;
    ctx.fillText(txt, x, y);
}

export function getMousePos(canvas, event, zoom=1.0) {
    if (zoom < 1) { zoom = 1; }
    let rect = canvas.getBoundingClientRect();
    let eventX = event.clientX - rect.left * zoom;
    let eventY = event.clientY - rect.top * zoom;
    let x = Math.floor(eventX / zoom * (canvas.width / rect.width));
    let y = Math.floor(eventY / zoom * (canvas.height / rect.height));
    return {x:x, y:y};
}

export function drawHline(ctx, y) {
    ctx.beginPath();
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(ctx.canvas.width, y + 0.5);
    ctx.stroke();
}

export function drawVline(ctx, x) {
    ctx.beginPath();
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, ctx.canvas.height);
    ctx.stroke();
}

export function drawCross(ctx, x, y) {
    drawHline(ctx, y);
    drawVline(ctx, x);
}

export function drawGrid(ctx, rmin, rmax, smin, smax, ndiv) {
    let lr = rmax - rmin;
    let ls = smax - smin;
    let dr = lr / ndiv;
    let ds = ls / ndiv;
    let nr = toInt(lr / dr) + 1;
    let ns = toInt(ls / ds) + 1;
    for (let i = 0; i < nr; i++) {
        let r = rmin + i*dr;
        drawLine(ctx, r, smin, r, smax);
    }
    for (let i = 0; i < ns; i++) {
        let s = smin + i*ds;
        drawLine(ctx, rmin, s, rmax, s);
    }
}
