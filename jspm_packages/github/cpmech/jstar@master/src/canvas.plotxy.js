// Copyright 2016 Dorival Pedroso. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import Bins       from './bins2d.js';
import Pen        from './canvas.pen.js';
import CurveProps from './canvas.curveprops.js';

import {penSolidBlack06}            from './canvas.pen.js';
import {toInt}                      from './auxiliary.js';
import {getPen,penSolidRed}         from './canvas.pen.js';
import {setCursorByDomId,prettyNum} from './auxiliary.js';

import {drawRect,drawLine,drawText,textWidthPx,getMousePos,drawCircle} from './canvas.commands.js';

export default class Plotxy {

    constructor(canvasId, title, xlbl, ylbl, tracking=true, dynResize=false, extraFcn=[], extraDat=[]) {

        // input data
        this.canvasId   = canvasId;  // dom id
        this.title      = title;     // plot title
        this.xlbl       = xlbl;      // x-axis label
        this.ylbl       = ylbl;      // y-axis label
        this.tracking   = tracking;  // tracking points
        this.dynResize  = dynResize; // dynamic resizing
        this.extraFcn   = extraFcn;  // special drawing callback
        this.extraDat   = extraDat;  // special drawing data
        this.winZoomFcn = undefined; // get zoom factor applied to dom id

        // configuration variables
        this.equalScale          = false;     // equal scale factors ?
        this.withGrid            = true;      // with primary grid ?
        this.bottomRulerNumTicks = 10;        // bottom ruler number of ticks
        this.leftRulerNumTicks   = 10;        // left ruler number of ticks
        this.tickFontSize        = 10;        // ticks font size
        this.labelFontSize       = 12;        // labels font size
        this.titleFontSize       = 14;        // title font size
        this.selectionFontSize   = 12;        // selection font size
        this.legendAtBottom      = true;      // legend at bottom ?
        this.compactBottomRuler  = true;      // compact bottom ruler ?
        this.bgGradient          = true;      // use gradient for background
        this.gradientColor1      = '#ffefd8'; // first color for background gradient color
        this.gradientColor2      = 'white';   // second color for background gradient color
        this.showLastY           = false;     // show text with the last y value ?
        this.showBins            = false;     // draw bins
        this.statusNumChars      = 10;        // x,y status width

        // dimensions
        this.leftRulerSize   = 40; // left ruler thickness (screen coordinates)
        this.rightRulerSize  = 5;  // right ruler thickness (screen coordinates)
        this.bottomRulerSize = 20; // bottom ruler thickness (screen coordinates)
        this.topRulerSize    = 18; // top ruler thickness (screen coordinates)
        this.deltaHborder    = 6;  // increment for horizontal borders (to the inside) (screen coordinates)
        this.deltaVborder    = 6;  // increment for vertical borders (to the inside) (screen coordinates)
        this.tickLength      = 8;  // length of tick line
        this.legLinDx        = 20; // spacing between legend items
        this.legHeight       = 30; // bottom legend height
        this.legWidth        = 0;  // right legend width
        this.legLineLength   = 40; // line length in legend
        this.legNumRows      = 1;  // number of legend rows
        this.binSize         = 60; // pixels
        this.snapRadius      = 10; // snap radius
        this.snapShift       = 12; // shift text

        // constants
        this.DBL_EPS = 2.220446049250313e-16;
        this.DBL_MIN = 2.225073858507201e-308;
        this.DBL_MAX = 1.797693134862316e+308;

        // pens
        this.penPlotArea    = new Pen('white',   'solid', 1.0, 1.0);
        this.penLegend      = new Pen('#f8f8ff', 'solid', 1.0, 1.0);
        this.penBottomRuler = new Pen('#f8f8ff', 'solid', 1.0, 1.0);
        this.penTopRuler    = new Pen('#f8f8ff', 'solid', 1.0, 1.0);
        this.penLeftRuler   = new Pen('#f8f8ff', 'solid', 1.0, 1.0);
        this.penRightRuler  = new Pen('#f8f8ff', 'solid', 1.0, 1.0);
        this.penGrid        = new Pen('#1e90ff', 'solid', 1.0, 0.4);
        this.penSelection   = new Pen('#ff9c00', 'solid', 2.0, 1.0);

        // essential data
        this.sfx     = 1.0;   // x scale factor
        this.sfy     = 1.0;   // y scale factor
        this.xmin    = 0.0;   // minimum x value (real coordinates)
        this.ymin    = 0.0;   // minimum y value (real coordinates)
        this.xmax    = 1.0;   // maximum x value (real coordinates)
        this.ymax    = 1.0;   // maximum y value (real coordinates)
        this.xminFix = 0.0;   // fixed minimum x value (real coordinates)
        this.yminFix = 0.0;   // fixed minimum y value (real coordinates)
        this.xmaxFix = 0.0;   // fixed maximum x value (real coordinates)
        this.ymaxFix = 0.0;   // fixed maximum y value (real coordinates)
        this.xfixMin = false; // is x fixed with xmin?
        this.xfixMax = false; // is x fixed with xmax?
        this.yfixMin = false; // is y fixed with ymin?
        this.yfixMax = false; // is y fixed with ymax?
        this.X       = [];    // curves x-data
        this.Y       = [];    // curves y-data
        this.cnames  = [];    // curves names
        this.cprops  = [];    // curves properties
        this.blbl    = '';    // bottom ruler label
        this.llbl    = '';    // Left ruler label

        // canvas
        this.canvas = document.getElementById(canvasId); // the canvas
        this.ctx = this.canvas.getContext('2d');         // drawing context
        setCursorByDomId(canvasId, 'crosshair');         // change cursor

        // calculate additional constants
        this.calcCtes();

        // handle events
        this.canvas.addEventListener('click', this.handleMouseClick.bind(this), false);
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this), false);
        if (this.dynResize) {
            window.addEventListener('resize', this.handleResize.bind(this), false);
        }
    }

    // addCurve adds curve
    addCurve(name, X, Y, pointSize=8, markEvery=1) {
        if (X.length != Y.length) {
            throw Error('Plotxy.addCurve: X and Y must have the same size');
        }
        let idx = this.cnames.length;
        this.X.push(X);
        this.Y.push(Y);
        this.cnames.push(name);
        this.cprops.push(new CurveProps(getPen(idx, 1), true, true, 'o', pointSize, markEvery));
        this.binsOk = false;
    }

    // changeCurve changes curve
    changeCurve(name, X, Y) {
        let idx = this.cnames.indexOf(name);
        if (idx < 0) {
            throw Error('Plotxy.changeCurve: cannot find curve named ' + name);
        }
        this.X[idx] = X;
        this.Y[idx] = Y;
        this.binsOk = false;
    }

    // getCurveProps returns curve properties
    getCurveProps(name) {
        let idx = this.cnames.indexOf(name);
        if (idx < 0) {
            throw Error('Plotxy.getCurveProps: cannot find curve named ' + name);
        }
        return this.cprops[idx];
    }

    // setCurveProps sets curve properties
    setCurveProps(name, color, alpha, ls, lw, withLin, withMrk, mrkType, mrkSize, mrkEvery) {
        let idx = this.cnames.indexOf(name);
        if (idx < 0) {
            throw Error('Plotxy.setCurveProps: cannot find curve named ', name);
        }
        this.cprops[idx].pen.color = color;
        this.cprops[idx].pen.alpha = alpha;
        this.cprops[idx].pen.style = ls;
        this.cprops[idx].pen.width = lw;
        this.cprops[idx].withLin   = withLin;
        this.cprops[idx].withMrk   = withMrk;
        this.cprops[idx].mrkType   = mrkType;
        this.cprops[idx].mrkSize   = mrkSize;
        this.cprops[idx].mrkEvery  = mrkEvery;
    }

    // addExtra adds extra drawing commands
    addExtra(callback, data) {
        this.extraFcn.push(callback);
        this.extraDat.push(data);
    }

    // fixAxes sets fixed axes values (use 'undefined' to unfix)
    fixAxis(vals) {
        if (vals.xmin != undefined) {
            this.xminFix = vals.xmin;
            this.xfixMin = vals.fix;
        }
        if (vals.xmax != undefined) {
            this.xmaxFix = vals.xmax;
            this.xfixMax = vals.fix;
        }
        if (vals.ymin != undefined) {
            this.yminFix = vals.ymin;
            this.yfixMin = vals.fix;
        }
        if (vals.ymax != undefined) {
            this.ymaxFix = vals.ymax;
            this.yfixMax = vals.fix;
        }
        this.binsOk = false;
    }

    // calcCtes computes dependent constants
    calcCtes() {
        this.bhpad  = this.leftRulerSize + this.rightRulerSize + (this.legendAtBottom ? 0 : this.legWidth);
        this.bvpad  = this.bottomRulerSize + this.topRulerSize + (this.legendAtBottom ? this.legHeight : 0);
        this.pahpad = this.bhpad + 2 + 2 * this.deltaHborder;
        this.pavpad = this.bvpad + 2 + 2 * this.deltaVborder;
        this.binsOk = false;
    }

    // position functions
    x0() { return 0; }
    y0() { return 0; }
    w () { return this.canvas.width; }
    h () { return this.canvas.height; }

    // plot area coordinates
    ax0() { return this.x0() + this.leftRulerSize; }
    axf() { return this.x0() + this.w() - this.rightRulerSize; }
    ay0() { return this.y0() + this.topRulerSize; }
    ayf() { return this.y0() + this.h() - this.bottomRulerSize - this.legHeight; }
    aw () { return this.w()  - this.bhpad; } // width of plot area
    ah () { return this.h()  - this.bvpad; } // height of plot area

    // convert to screen coordinates
    xScr (x) { return toInt((this.x0() + 1 + this.leftRulerSize + this.deltaHborder) + this.sfx * (x - this.xmin)); }
    yScr (y) { return toInt((this.y0() + 1 + this.topRulerSize + this.deltaVborder) + (this.h() - this.pavpad) - this.sfy * (y - this.ymin)); }
    lScr (l) { return toInt((this.sfx > this.sfy ? this.sfy : this.sfx) * this.l); }

    // convert to real coordinates
    xReal(xscr) { return this.xmin + (xscr - this.x0() - this.leftRulerSize - this.deltaHborder - 1) / this.sfx; }
    yReal(yscr) { return this.ymin + ((this.y0() + 1 + this.topRulerSize + this.deltaVborder) + (this.h() - this.pavpad) - yscr) / this.sfy; }

    // calcSF calculates scaling factor
    calcSF() {

        // find min/max
        this.xmin = 0.0;
        this.ymin = 0.0;
        this.xmax = 1.0;
        this.ymax = 1.0;
        let found = false;
        for (let k=0; k<this.X.length; k++) {
            if (this.X[k].length < 2) {
                continue;
            }
            if (!found) {
                this.xmin = this.X[k][0];
                this.ymin = this.Y[k][0];
                this.xmax = this.X[k][1];
                this.ymax = this.Y[k][1];
                found = true;
            }
            for (let i=0; i<this.X[k].length; ++i) {
                if (this.X[k][i] < this.xmin) this.xmin = this.X[k][i];
                if (this.Y[k][i] < this.ymin) this.ymin = this.Y[k][i];
                if (this.X[k][i] > this.xmax) this.xmax = this.X[k][i];
                if (this.Y[k][i] > this.ymax) this.ymax = this.Y[k][i];
            }
        }

        let bnumtck = this.bottomRulerNumTicks;
        let lnumtck = this.leftRulerNumTicks;

        // pretty values
        if (Math.abs(this.xmax - this.xmin) <= this.DBL_EPS) {
            //
            let lim = this.pretty(this.xmin, this.xmax, 3);
            this.xmin = lim[0];
            this.xmax = lim[lim.length-1];
           
            this.xmin = this.xmin - 1;
            this.xmax = this.xmax + 1;
            bnumtck = 3;
        }
        if (Math.abs(this.ymax - this.ymin) <= this.DBL_EPS) {
            //
            let lim = this.pretty(this.ymin, this.ymax, 3);
            this.ymin = lim[0];
            this.ymax = lim[lim.length-1];
           
            this.ymin = this.ymin - 1;
            this.ymax = this.ymax + 1;
            lnumtck = 3;
        }

        // fixed values
        if (this.xfixMin) { this.xmin = this.xminFix; }
        if (this.xfixMax) { this.xmax = this.xmaxFix; }
        if (this.yfixMin) { this.ymin = this.yminFix; }
        if (this.yfixMax) { this.ymax = this.ymaxFix; }

        // scaling factors
        this.sfx = (this.w() - this.pahpad) / (this.xmax - this.xmin);
        this.sfy = (this.h() - this.pavpad) / (this.ymax - this.ymin);
        if (this.equalScale) {
            let sf = (this.sfx > this.sfy ? this.sfy : this.sfx);
            this.sfx = sf;
            this.sfy = sf;
        }

        // ticks
        this.BTicks = this.pretty(this.xmin, this.xmax, bnumtck);
        this.LTicks = this.pretty(this.ymin, this.ymax, lnumtck);
    }

    // redraw redraws component
    redraw() {

        // set dimensions
        if (this.dynResize) {
            let info = this.canvas.parentElement.getBoundingClientRect();
            this.canvas.width = info.width;
            this.canvas.height = info.height;
            this.canvas.style.width = info.width;
            this.canvas.style.height = info.height;
        }

        // essential parts
        this.calcSF();
        this.drawRulers();
        this.drawLegend();
        this.drawCurves();

        // draw inner border
        penSolidBlack06.activate(this.ctx);
        drawRect(this.ctx, this.ax0(), this.ay0(), this.aw(), this.ah(), false);

        // draw outer border
        drawRect(this.ctx, this.x0(), this.y0(), this.w()-1, this.h()-1, false);
        this.ctx.restore();

        // buttons
        let htw = Math.max(textWidthPx(this.ctx, this.xlbl, this.labelFontSize)+10, this.leftRulerSize);
        let vtw = Math.max(textWidthPx(this.ctx, this.ylbl, this.labelFontSize)+10, this.leftRulerSize);
        let xa = this.x0() + this.w() - htw - 1;
        let ya = this.y0() + this.h() - this.topRulerSize;
        let xb = xa + htw;
        let yb = ya + this.topRulerSize;
        let xc = this.x0() + 1;
        let yc = this.y0() + 1;
        let xd = xc + vtw;
        let yd = yc + this.topRulerSize;
        if (false) {
            penSolidRed.activate(this.ctx);
            drawRect(this.ctx, xa, ya, xb, yb, true);
            drawRect(this.ctx, xc, yc, xd, yd, true);
            this.ctx.restore();
        }

        // labels
        penSolidBlack06.activate(this.ctx);
        drawText(this.ctx, this.xlbl, (xa+xb)/2, yb-5, 'center', 'bold ' + this.labelFontSize);
        drawText(this.ctx, this.ylbl, (xc+xd)/2, yd-5, 'center', 'bold ' + this.labelFontSize);
        this.ctx.restore();

        // bins
        if (this.tracking && !this.binsOk) {
            if (this.bins === undefined) {
                this.bins = new Bins(this.ax0(), this.ay0(), this.aw(), this.ah(), this.binSize);
            } else {
                this.bins.reset(this.ax0(), this.ay0(), this.aw(), this.ah(), this.binSize);
            }
            for (let k=0; k<this.X.length; k++) {
                for (let i=0; i<this.X[k].length; i++) {
                    this.bins.push(this.xScr(this.X[k][i]), this.yScr(this.Y[k][i]), {xreal:this.X[k][i], yreal:this.Y[k][i]});
                }
            }
            this.binsOk = true;
        }
        if (this.showBins) {
            this.bins.draw(this.ctx);
        }

        // extra commands
        for (let i=0; i<this.extraFcn.length; i++) {
            this.extraFcn[i](this, this.extraDat[i]);
        }
    }

    // drawCurves clears background and draws grid and curves
    drawCurves() {

        // clear background
        this.ctx.save();

        // gradient
        if (this.bgGradient) {
            let grd = this.ctx.createLinearGradient(0, this.y0(), 0, this.h());
            grd.addColorStop(0, this.gradientColor1);
            grd.addColorStop(1, this.gradientColor2);
            this.ctx.fillStyle = grd;
        } else {
            this.penPlotArea.activate(this.ctx);
            this.ctx.clearRect(this.ax0(), this.ay0(), this.axf(), this.ayf());
        }
        drawRect(this.ctx, this.ax0(), this.ay0(), this.aw(), this.ah(), true);
        this.ctx.restore();

        // draw grid
        if (this.withGrid) {
            this.penGrid.activate(this.ctx);

            // vertical
            for (let i=0; i<this.BTicks.length; ++i) {
                let xi = this.xScr(this.BTicks[i]);
                if (xi >= this.ax0() && xi <= this.axf()) {
                    drawLine(this.ctx, xi, this.ay0(), xi, this.ayf());
                }
            }

            // horizontal
            for (let i=0; i<this.LTicks.length; ++i) {
                let yi = this.yScr(this.LTicks[i]);
                if (yi >= this.ay0() && yi <= this.ayf()) {
                    drawLine(this.ctx, this.ax0(), yi, this.axf(), yi);
                }
            }
            this.ctx.restore();
        }

        // draw curves
        let fsz = this.tickFontSize;
        for (let k=0; k<this.X.length; ++k) {

            // convert coordinates
            let Xscr = this.X[k].map((x) => this.xScr(x));
            let Yscr = this.Y[k].map((y) => this.yScr(y));

            // draw lines and markers
            this.cprops[k].drawLines(this.ctx, Xscr, Yscr);
            this.cprops[k].drawMarkers(this.ctx, Xscr, Yscr);

            // draw text @ end of curve
            if (this.X[k].length > 1 && this.showLastY) {
                let n   = this.X[k].length;
                let txt = '' + this.Y[k][n-1];
                penSolidBlack06.activate(this.ctx);
                drawText(this.ctx, txt, Xscr[n-1], Yscr[n-1], 'right', fsz);
            }
        }
    }

    // drawRulers draws rulers
    drawRulers() {

        // bottom ruler
        let fsz = this.tickFontSize;
        if (this.bottomRulerSize > 0) {

            // background
            this.penBottomRuler.activate(this.ctx);
            drawRect(this.ctx, this.x0(), this.ayf(), this.w()-1, this.bottomRulerSize, true);
            this.ctx.restore();

            // ticks
            penSolidBlack06.activate(this.ctx);
            for (let i=0; i<this.BTicks.length; ++i) {
                let xi = this.xScr(this.BTicks[i]);
                if ((xi >= this.ax0()) && (xi <= this.ax0()+this.aw())) {
                    let txt = '' + this.BTicks[i];
                    if (txt.length > 10) {
                        txt = '' + this.BTicks[i].toFixed(3);
                    }
                    drawLine(this.ctx, xi, this.ayf(), xi, this.ayf()+this.tickLength);
                    drawText(this.ctx, txt, xi, this.ayf()+this.tickLength+fsz/2+3, 'center', fsz);
                }
            }

            // label
            if (!this.compactBottomRuler) {
                drawText(this.ctx, this.blbl, this.ax0()+this.aw()/2, this.ayf()+this.tickLength+3*fsz/2+1, 'center', fsz);
            }
            this.ctx.restore();
        }

        // left ruler
        if (this.leftRulerSize > 0) {

            // background
            this.penLeftRuler.activate(this.ctx);
            drawRect(this.ctx, this.x0(), this.ay0(), this.leftRulerSize, this.ah(), true);
            this.ctx.restore();

            // ticks
            penSolidBlack06.activate(this.ctx);
            for (let i=0; i<this.LTicks.length; ++i) {
                let xi = this.ax0()-this.tickLength;
                let yi = this.yScr(this.LTicks[i]);
                if (yi>=this.ay0() && yi<=this.ay0()+this.ah()) {
                    let txt = prettyNum(this.LTicks[i]);
                    drawLine(this.ctx, xi, yi, xi+this.tickLength, yi);
                    drawText(this.ctx, txt, this.ax0()-this.tickLength-2, yi+(fsz-2)/2, 'right', fsz);
                }
            }
            this.ctx.restore();
        }

        // top ruler
        if (this.topRulerSize > 0) {

            // background
            this.penTopRuler.activate(this.ctx);
            drawRect(this.ctx, this.x0(), this.y0(), this.w(), this.topRulerSize, true);
            this.ctx.restore();

            // draw left label
            penSolidBlack06.activate(this.ctx);
            drawText(this.ctx, this.llbl, this.x0()+2, this.ay0()-6, 'left', fsz);

            // left ruler label and title
            drawText(this.ctx, this.title, this.x0()+this.w()/2, this.ay0()-this.titleFontSize/2+2, 'center', this.titleFontSize);
            this.ctx.restore();
        }

        // right ruler
        if (this.rightRulerSize > 0) {
            this.penRightRuler.activate(this.ctx);
            drawRect(this.ctx, this.x0()+this.w()-this.rightRulerSize-this.legWidth, this.ay0(), this.rightRulerSize, this.h()-this.topRulerSize-this.bottomRulerSize-this.legHeight, true);
            this.ctx.restore();
        }
    }

    // drawLegend draws legend
    drawLegend() {

        // variables
        let hicon = this.legHeight / 2;
        let xi    = this.x0() + 5;
        let xf    = xi + 30;
        let xm    = (xi + xf) / 2.0;
        let yi    = this.y0() + this.h() - hicon * this.legNumRows;
        let ilen  = 5 + this.legLineLength + 2; // icon length
       
        if (this.legendAtBottom) {

            // clear background
            this.penLegend.activate(this.ctx);
            drawRect(this.ctx, this.x0(), this.y0()+this.h()-this.legHeight, this.w(), this.legHeight, true);
            this.ctx.restore();

            // draw legend
            let legcol = 0;
            for (let k=0; k<this.X.length; k++) {

                // draw points
                this.cprops[k].drawLines(this.ctx, [xi, xf], [yi, yi]);
                this.cprops[k].drawMarkers(this.ctx, [xm], [yi]);

                // draw names
                let txt = this.cnames[k];
                penSolidBlack06.activate(this.ctx);
                drawText(this.ctx, txt, xf+2, yi+(this.labelFontSize-2)/2, 'left', this.labelFontSize);
                this.ctx.restore();

                // Next curve
                xi += textWidthPx(this.ctx, txt, this.labelFontSize);
                xi  = xi+ilen+this.legLinDx;
                xf  = xi+this.legLineLength;
                xm  = (xi + xf) / 2.0;

                // legend row position
                if (this.nlegicon > 0) {
                    if (legcol == this.nlegicon-1) {
                        legcol = -1;
                        xi     = x()+5;
                        xf     = xi+this.legLineLength;
                        yi    += this.hlegicon;
                    }
                    legcol++;
                }
            }

            // compact layout
            if (this.compactBottomRuler) {
                this.penLegend.activate(this.ctx);
                drawText(this.ctx, this.blbl, this.x0()+this.w()-3, this.y0()+this.h()-this.hlegicon*this.nlegrows, 'right', this.labelFontSize);
                this.ctx.restore();
            }
        } else {
            // TODO
        }
    }

    // pretty converts range into a set of 'pretty' numbers
    pretty(Lo, Hi, nDiv) {

        // constants
        let rounding_eps   = Math.sqrt(this.DBL_EPS);
        let eps_correction = 0.0;
        let shrink_sml     = 0.75;
        let h              = 1.5;
        let h5             = 0.5+1.5*h;

        // local variables
        let min_n = toInt(toInt(nDiv) / toInt(3));
        let lo    = Lo;
        let hi    = Hi;
        let dx    = hi-lo;
        let cell  = 1;    // cell := "scale" here
        let ub    = 0;    // upper bound on cell/unit
        let isml  = true; // is small ?

        // check range
        if (!(dx==0 && hi==0)) { // hi=lo=0
            cell = (Math.abs(lo) > Math.abs(hi) ? Math.abs(lo) : Math.abs(hi));
            ub   = (1+(h5>=1.5*h+.5) ? 1/(1+h) : 1.5/(1+h5));
            isml = (dx<cell*ub*(nDiv>1 ? nDiv : 1)*this.DBL_EPS*3); // added times 3, as several calculations here
        }

        // set cell
        if (isml) {
            if (cell>10) cell = 9 + cell/10;
            cell *= shrink_sml;
            if (min_n>1) cell /= min_n;
        } else {
            cell = dx;
            if (nDiv>1) cell /= nDiv;
        }
        if      (cell<20*this.DBL_MIN) cell =  20*this.DBL_MIN; // very small range.. corrected
        else if (cell*10>this.DBL_MAX) cell = 0.1*this.DBL_MAX; // very large range.. corrected

        // find base and unit
        let base = Math.pow(10.0, Math.floor(Math.log10(cell))); // base <= cell < 10*base
        let unit = base;
        if ((ub = 2*base)-cell <  h*(cell-unit)) { unit = ub;
        if ((ub = 5*base)-cell < h5*(cell-unit)) { unit = ub;
        if ((ub =10*base)-cell <  h*(cell-unit))   unit = ub; }}

        // find number of
        let ns = Math.floor(lo/unit+rounding_eps);
        let nu = Math.ceil (hi/unit-rounding_eps);
        if (eps_correction && (eps_correction>1 || !isml)) {
            if (lo) lo *= (1-this.DBL_EPS); else lo = -this.DBL_MIN;
            if (hi) hi *= (1+this.DBL_EPS); else hi = +this.DBL_MIN;
        }
        while (ns*unit>lo+rounding_eps*unit) ns--;
        while (nu*unit<hi-rounding_eps*unit) nu++;

        // find number of divisions
        let ndiv = toInt(0.5+nu-ns);
        if (ndiv<min_n) {
            let k = min_n-ndiv;
            if (ns>=0.0) {
                nu += k/2;
                ns -= k/2 + k%2;
            } else {
                ns -= k/2;
                nu += k/2 + k%2;
            }
            ndiv = min_n;
        }
        ndiv++;

        // ensure that result covers original range
        if (ns*unit<lo) lo = ns * unit;
        if (nu*unit>hi) hi = nu * unit;

        // fill array
        let MINZERO = rounding_eps; // minimum value to be replaced to 0.0 in _pretty method
        let Vals = [lo];
        for (let i=1; i<ndiv; ++i) {
            Vals[i] = Vals[i-1]+unit;
            if (Math.abs(Vals[i]) < MINZERO) Vals[i] = 0.0;
        }
        return Vals;
    }

    // mouse2coords converts event screen coordinates to real coordinates
    mouse2coords(event) {
        let zoom = 1.0;
        if (this.winZoomFcn !== undefined) {
            zoom = this.winZoomFcn();
        }
        let p = getMousePos(this.canvas, event, zoom);
        let x = this.xReal(p.x);
        let y = this.yReal(p.y);
        return {
            screen: {x:p.x, y:p.y},
            real:   {x:x, y:y},
        };
    }

    // coords2point locates data point closest to given coords (using bins)
    coords2point(coords) {

        // handle coords outside plot area
        if ((coords.screen.x < this.ax0()) || (coords.screen.x > this.axf()) ||
            (coords.screen.y < this.ay0()) || (coords.screen.y > this.ayf())) {
            return null;
        }

        // find point using bins
        if (this.tracking && this.binsOk) {
            let res = this.bins.find(coords.screen.x, coords.screen.y);
            if (res !== null) {
                if (res.dclosest < this.snapRadius) {
                    return res.data;
                }
            }
        }
        return null;
    }

    // drawSelected draws icon and text for selected point
    drawSelected(coords, data) {

        // skip if null
        if (coords === null || data === null) { return; }

        // snap screen coords
        let xscr = this.xScr(data.xreal);
        let yscr = this.yScr(data.yreal);

        // compute dimensions
        let yshift = 0;
        let ha     = 'center';
        if (yscr < this.ay0() + 2 * this.selectionFontSize) {
            yshift = 3 * this.selectionFontSize;
        }
        if (xscr < this.ax0() + this.selectionFontSize) {
            ha = 'left';
        }
        if (xscr > this.axf() - this.selectionFontSize) {
            ha = 'right';
        }

        // clear previous
        this.redraw();

        // draw circle
        this.penSelection.activate(this.ctx);
        drawCircle(this.ctx, xscr, yscr, 7, false);
        this.ctx.restore();

        // draw text
        let txt = prettyNum(data.xreal) + ', ' + prettyNum(data.yreal);
        penSolidBlack06.activate(this.ctx);
        drawText(this.ctx, txt, xscr, yscr - this.snapShift + yshift, ha, this.selectionFontSize);
        this.ctx.restore();
    }

    // handleMouseClick handles mouse click
    handleMouseClick(event) {
        let coords = this.mouse2coords(event);
        let data = this.coords2point(coords);
        console.log(coords, data);
    }

    // handleMouseMove handles mouse move
    handleMouseMove(event) {
        if (!this.tracking) { return; }

        // get coordinates and find point
        let coords = this.mouse2coords(event);
        let data = this.coords2point(coords);
        this.drawSelected(coords, data);

        // display coordinates @ top right corner
        let txt = prettyNum(coords.real.x, this.statusNumChars) + ', ' + prettyNum(coords.real.y, this.statusNumChars);
        //let txt = prettyNum(coords.screen.x, this.statusNumChars) + ', ' + prettyNum(coords.screen.y, this.statusNumChars);
        let tw  = textWidthPx(this.ctx, txt, this.selectionFontSize);
        if (this.twmax === undefined) {
            this.twmax = tw;
        } else {
            this.twmax = Math.max(this.twmax, tw);
        }
        let xa  = this.x0() + this.w() - this.twmax;
        let xb  = this.x0() + this.w();
        this.penTopRuler.activate(this.ctx);
        drawRect(this.ctx, xa, this.y0()+1, this.twmax-1, this.topRulerSize-2, true);
        this.ctx.restore();
        penSolidBlack06.activate(this.ctx);
        drawText(this.ctx, txt, (xa+xb)/2, this.y0()+(this.selectionFontSize-2)/2+10, 'center', this.selectionFontSize);
        this.ctx.restore();
    }

    // handleResize handles resize events
    handleResize(event) {
        this.binsOk = false;
        this.redraw();
    }
}
