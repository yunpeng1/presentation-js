// Copyright 2016 Dorival Pedroso. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

// toInt converts float to integer
export function toInt(value) {
    return value | 0;
}

// prettyNum returns a text representation of FP numbers in a nice format
export function prettyNum(x, width, numDecIfTooLong=3) {
    let txt = '' + x;
    if (txt.length > width) {
        txt = '' + x.toFixed(numDecIfTooLong);
    }
    return txt;
}

// setCursorByDomId sets cursor point style of dom entity
export function setCursorByDomId(id, cursorStyle) {
    let elem;
    if (document.getElementById && (elem=document.getElementById(id))) {
        if (elem.style) {
            elem.style.cursor = cursorStyle;
        }
    }
}
