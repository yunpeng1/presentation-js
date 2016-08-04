// Copyright 2016 Dorival Pedroso. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

export default class CanvasFull {

    constructor(canvasId, redraw=null) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        window.addEventListener('resize', this.resizeCanvas.bind(this), false);
        document.body.style.margin = 0;
        document.body.style.overflow = "hidden";
        this.redraw = redraw;
        this.resizeCanvas();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        if (this.redraw !== null) {
            this.redraw(this.ctx, this.canvas.width, this.canvas.height);
        }
    }
}
