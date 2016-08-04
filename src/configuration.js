// Copyright 2016 Dorival Pedroso. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

// import revealJS
import 'reveal/lib/js/head.min.js';
import Reveal from 'reveal/js/reveal.js';

// import plugins
import 'reveal/plugin/math/math.js';
import 'reveal/plugin/zoom-js/zoom.js';
import './highlight.reveal.js';
import './highlight.pack.js';
//import './sweetalert2.min.js';


// YOU MAY CHANGE HERE ---------------------------------------------------------

// configure revealJS
Reveal.initialize({
    history: true,
    transition: 'linear',
    math: {
        config: 'TeX-AMS_HTML-full'
    },
    slideNumber: 'c/t',
    fragments: true,
    mouseWheel: true,
    hideAddressBar: true,
    margin: 0.03,
});

// END OF CHANGES --------------------------------------------------------------


// connect pop-up windows
Reveal.addEventListener('ready', function(event) {

    // find all <a href="" data-modal> elements
    let elements = document.querySelectorAll('a[data-modal]');

    // create an event listener for each element
    for (let i = 0; i < elements.length; i++) {
        elements[i].addEventListener('click', function(event) {
            event.preventDefault();
            let id = this.getAttribute('href').substr(1);
            let ele = document.getElementById(id);
            let title = ele.querySelector('h1');
            let message = ele.querySelector('p');
            swal({
                title: title.innerHTML,
                text: message.innerHTML,
                allowOutsideClick: true,
                type: "info"
            }).done();
            return false;
        }, false);
    };
});

// pretty-print all code
let codes = document.querySelectorAll('pre code');
for (let i = 0; i < codes.length; i++) {
    hljs.highlightBlock(codes[i]);
}
