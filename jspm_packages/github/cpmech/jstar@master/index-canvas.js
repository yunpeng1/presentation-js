// Copyright 2016 Dorival Pedroso. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import Pen        from 'src/canvas.pen.js';
import CanvasFull from 'src/canvas.full.js';

import {drawGrid, fitToContainer} from 'src/canvas.commands.js';

import Bins2D from 'src/bins2d';

let pen = new Pen(0x000000, 'solid', 1.0, 0.5);
let c = new CanvasFull('canvas-1', function(ctx, w, h) {

    // draw grid
    pen.activate(ctx);
    drawGrid(ctx, 0, w, 0, h, 10);

    // bins
    let bins = new Bins2D(0, 0, w, h, w/10);
    console.log(bins)
});
