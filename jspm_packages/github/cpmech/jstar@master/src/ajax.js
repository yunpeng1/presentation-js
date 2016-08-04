// Copyright 2016 Dorival Pedroso. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

const successcodes = [200, 201];

export function makeAjaxCall(method, url, data, handler, debug=false) {

    // new request
    var xhr = new XMLHttpRequest();
    var url = url;
    if (method == 'GET') {
        url += '?' + encodeURIComponent(JSON.stringify(data));
    }

    // XHR has 'withCredentials' property only if it supports CORS
    if ("withCredentials" in xhr) {
        xhr.open(method, url, true); 

    // if IE, use XDR
    } else if (typeof XDomainRequest != "undefined") {
        xhr = new XDomainRequest();
        xhr.open(method, url);
        if (debug) {
            console.log('jstar: ajax.js: makeAjaxCall: using XDomainRequest');
        }
    } else {
        throw new Error('jstar: ajax.js: makeAjaxCall: xhr allocation failed (null)');
    }

    // xhr created
    if (xhr) {
        xhr.setRequestHeader('Content-Type', 'text/json');
        xhr.onreadystatechange = function(e) {
            if (xhr.readyState == 4) {
                if (successcodes.indexOf(xhr.status) != -1) {
                    if (debug) {
                        console.log('jstar: ajax.js: xhr.response = ' + xhr.response);
                    }
                    if (xhr.response !== undefined) {
                      if (xhr.response != '') {
                        var response = JSON.parse(xhr.response);
                        if (debug) {
                            console.log('jstar: ajax.js: response = ' + response);
                        }
                        handler(response);
                      }
                    }
                } else {
                    throw new Error('jstar: ajax.js: makeAjaxCall: xhr.onreadystatechange failed with status = ' + xhr.status);
                }
            } else {
                // other states => OK
            }
        };
        xhr.send(JSON.stringify(data));
    }
}
