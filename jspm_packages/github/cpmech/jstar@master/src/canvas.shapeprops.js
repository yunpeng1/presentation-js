// Copyright 2016 Dorival Pedroso. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import {SolidBlackLine} from './canvas.lineprops.js';

export default class ShapeProps {
    constructor(color=0x0000cc, edge=SolidBlackLine, closed=true) {
        this.color = color;
        this.edge = edge;
        this.closed = closed;
    }
}
