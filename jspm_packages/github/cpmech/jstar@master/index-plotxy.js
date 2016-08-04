// Copyright 2016 Dorival Pedroso. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import Plotxy from 'src/canvas.plotxy.js';

let tracking = true;
let dynResize = false;
let p1 = new Plotxy('canvas-1', 'first plot', 'x', 'y', tracking, dynResize);
let p2 = new Plotxy('canvas-2', 'second plot', 'p', 'q', tracking, dynResize);
p1.addCurve('series1a', [0.1, 0.2, 0.4, 0.8, 1.2], [0.15, 0.3, 0.8, 2.0, 4.0]);
p1.addCurve('series1b', [0.3, 0.4, 0.6, 0.8, 1.0], [1.0, 1.5, 3.0, 2.5, 1.0]);
p2.addCurve('series2a', [10.1, 20.2, 30.4, 31.8, 35.2], [10.15, 20.3, 24.8, 12.0, 24.0]);
p2.addCurve('series2b', [14.0, 18.0, 26.8, 34.2], [12.0, 16.0, 14.0, 12.0]);
p2.addCurve('series2c', [12.1, 16.2, 20.4, 31.8, 35.2], [24.0, 18.3, 14.8, 26.0, 20.0]);
p1.setCurveProps('series1b', '#a40202', 0.5, 'solid', 3, true, true, 's', 8, 1);
p2.ShowLastY = true;
p2.gradientColor1 = 'white';   // first color for background gradient color
p2.gradientColor2 = '#f0f0f9'; // second color for background gradient color
p1.redraw();
p2.redraw();
