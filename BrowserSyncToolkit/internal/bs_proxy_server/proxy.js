var http = require('http');
var https = require('https');
var url = require('url');
var util = require('util');
var zlib = require('zlib');
var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;
// var log = require('./logger').create('proxy');

var request_id_next = 1;

/**
 * Get the firefox profile path
 * @returns {string}
 */
var getFirefoxProfilePath = function (){
    var ff_app_path = process.env.APPDATA + "\\Mozilla\\Firefox\\";
    var ff_profile_ini_path = ff_app_path + "profiles.ini";
    var ff_profile_path = ff_app_path + read_ini(ff_profile_ini_path)['Profile0']['Path'];
    ff_profile_path = path.normalize(ff_profile_path);
    return ff_profile_path;
}

/**
 * Refresh internet settings to make changes taking effect right now.
 */
var refreshInternetSettings = function (){
    var pcm = path.resolve(__dirname, 'ProxyConfigManager.exe');
    var _process = spawn(pcm, ["refresh"])
    _process.stderr.on('data', function (data) {
        console.log(data.toString())
    });
}

var reg = function () {
    // registry for ie\chrome\safari
    var url = path.resolve(__dirname, 'add.reg')
    var _process = spawn("regedit", ["/S", url])
    _process.stderr.on('data', function (data) {
        console.log(data.toString())
    });

    _process.on('close', function (code) {
        if(code == 0){
            console.log("Registry proxy for internet connecting is done.");
        } else {
            console.error("Error: Registry proxy for internet connecting takes some error.")
        }
        refreshInternetSettings();
    });

    // registry for firefox
    var ff_profile_path = getFirefoxProfilePath();
    var url2 =  path.resolve(__dirname, 'user.js');
    var _process2 = spawn("cmd", ['/c',"copy", "/Y", url2, ff_profile_path]);
    _process2.stderr.on('data', function (data) {
        console.log(data.toString())
    });

    _process2.on('close', function (code) {
        if(code == 0){
            console.log("Registry proxy for firefox is done. Restart firefox taking effect.");
        } else {
            console.error("Error: Registry proxy for firefox takes some error.")
        }
    });
}

/**
 * Read ini file
 * @param filename
 * @returns {Array}
 */
var read_ini = function (filename) {
    var r = [],
        q = require("querystring"),
        f = require("fs").readFileSync(filename, "ascii"),
        v = q.parse(f, '[', ']'),
        t;
    for (var i in v) {
        if (i != '' && v[i] != '') {
            r[i] = [];
            t = q.parse(v[i], '\r\n', '=');
            for (var j in t) {
                if (j != '' && t[j] != '')
                    r[i][j] = t[j];
            }
        }
    }
    return r;
};

/**
 * Inject the script to html dom
 * @param src - the html content
 * @param injectScript - the inject script
 * @param request - the request object
 */
var injector = function(src, injectScript, request){
    var new_src = src.toLowerCase();
    var dest = src;
    if(new_src.indexOf('</body>') > -1) {
        dest = src.replace(/<\/body>/i, injectScript + '</body>');
    } else if(new_src.indexOf('</head>') > -1) {
        dest = src.replace(/<\/head>/i, injectScript + '</head>');
    } else {
        //console.warn('The response has no </body> or <head/>, it\'ll not inject.');
        //console.log('Skip inject:' + request.url);
    }
    return dest;
}

var setupProxyServer = function (ip, port, inject_scripts_src) {
    var server = http.createServer(function (request, response) {
        var self = this;
        var errState = false;
        var injectScript = '';
        for (i in inject_scripts_src) {
            injectScript = injectScript + '<script src="' + inject_scripts_src[i] + '" ></script>';
        }
        //
        // #### function proxyError (err)
        // #### @err {Error} Error contacting the proxy target
        // Short-circuits `res` in the event of any error when
        // contacting the proxy target at `host` / `port`.
        //
        function proxyError(err) {
            //  console.log(err)
            errState = true;

            //
            // Emit an `error` event, allowing the application to use custom
            // error handling. The error handler should end the response.
            //
            if (self.emit('proxyError', err, request, response)) {
                return;
            }

            response.writeHead(500, { 'Content-Type': 'text/plain' });

            if (request.method !== 'HEAD') {
                //
                // This NODE_ENV=production behavior is mimics Express and
                // Connect.
                //
                if (process.env.NODE_ENV === 'production') {
                    // response.write('Internal Server Error');
                }
                else {
                    //console.error('An error has occurred at proxyError(): ' + JSON.stringify(err))
                   // response.write('An error has occurred at proxyError(): ' + JSON.stringify(err));
                }
            }

            try {
                response.end()
            }
            catch (ex) {
                //  console.error("res.end error: %s", ex.message)
            }
        }

        //  report to webserver
        function report_error(err){
            var report_formated_data = "report=" + encodeURIComponent(err);
            var options = {
                hostname: process.env.WEBSERVER_HOST,
                port: process.env.WEBSERVER_PORT,
                path: '/services/report_response_error.do?' + report_formated_data,
                method: 'GET'
            };

            var req = http.request(options, function(res) {
                //console.log('STATUS: ' + res.statusCode);
                //console.log('HEADERS: ' + JSON.stringify(res.headers));
                res.setEncoding('utf8');
                res.on('data', function (chunk) {
                    //console.log('BODY: ' + chunk);
                });
            });

            req.on('error', function(e) {
                console.log('problem with request: ' + e.message);
            });

            // write data to request body

            //req.write('data\n');
            req.end();   // this must call
        }

        var request_url = url.parse(request.url);
        //console.log("Reach request with url:" + request.url);
        var proxy_options = {};
        proxy_options.headers = request.headers;
        proxy_options.path = request_url.path;
        proxy_options.method = request.method;
        proxy_options.host = request_url.host;
        //  proxy_options.agent = request_url.agent;
        proxy_options.hostname = request_url.hostname;
        proxy_options.port = request_url.port || 80;

        //  proxy_options.headers["accept-encoding"] = '*;q=1,gzip=0'

        var proxy_request = http.request(proxy_options, function (proxy_response) {
            //console.info("ProxyRequestReach:\n\tURL:" + request.url);
            //console.info("\tUserAgent:" + request.headers['user-agent']);
            //
            // Process the `reverseProxy` `response` when it's received.
            //
            if (proxy_response.headers.connection) {
                if (request.headers.connection) {
                    proxy_response.headers.connection = request.headers.connection
                }
                else {
                    proxy_response.headers.connection = 'close'
                }
            }

            // Remove `Transfer-Encoding` header if client's protocol is HTTP/1.0
            if (request.httpVersion === '1.0') {
                delete proxy_response.headers['transfer-encoding'];
            }

            var content_type = proxy_response.headers['content-type'] || "";
            var is_text = content_type.match('text\/html') || 0;

            if (request.url.match(/\.(ico|xml|css|js|jpg|gif|png|bat|swf)/i)) {
                is_text = 0;
            }
            if (request.url.match(/(owa|facebook|gravatar|vimeo|stumbleupon)/)) {
                is_text = 0;
            }

            if (is_text) {
                //       console.log(request.method, request.url)
            }

            var contentEncoding = proxy_response.headers['content-encoding'] || ""

            if (!is_text) {
                response.writeHead(proxy_response.statusCode, proxy_response.headers);
            }

            var buffers = [];
            var ended = false;

            function ondata(chunk) {
                if (response.writable) {
                    if (false === response.write(chunk) && response.pause) {
                        response.pause();
                    }
                }
            }

            proxy_response.on('data', function (chunk) {
                if (is_text) {
                    buffers.push(chunk);
                } else {
                    ondata(chunk)
                }
            });

            proxy_response.on('close', function () {
                if (!ended) {
                    response.emit('end')
                }
            });
            proxy_response.on('end', function () {
                if (is_text) {
                    var buffers_all = Buffer.concat(buffers);
                    if (contentEncoding) {
                            zlib.gunzip(buffers_all, function (err, bufferrs) {
                                if (!err) {
                                    var mybuffer = bufferrs.toString("binary");

                                    // inject the script
                                    mybuffer = injector(mybuffer, injectScript, request);
                                    bufferrs = new Buffer(mybuffer, "binary");
                                        zlib.gzip(bufferrs, function (er, newBuffer) {
                                            if (!er) {
                                                proxy_response.headers['content-length'] = newBuffer.length;
                                                response.writeHead(proxy_response.statusCode, proxy_response.headers);
                                                //response.write(newBuffer);
                                                ondata(newBuffer)
                                                ended = true;
                                                if (!errState) {
                                                    try {
                                                        response.end()
                                                    }
                                                    catch (ex) {
                                                        console.error("res.end error: %s", ex.message)
                                                    }

                                                    // Emit the `end` event now that we have completed proxying
                                                    self.emit('end', request, response);
                                                }
                                            }
                                        })
                                   // }
                                }
                            })
                    }
                    else {
                        var mybuffer = buffers_all.toString("binary");
                        // inject the script
                        mybuffer = injector(mybuffer, injectScript, request);
                        proxy_response.headers['content-length'] = mybuffer.length;
                        response.writeHead(proxy_response.statusCode, proxy_response.headers);
                        bufferrs = new Buffer(mybuffer, "binary");
                        // response.write(mybuffer, "binary");
                        ondata(bufferrs);
                        ended = true;
                        if (!errState) {
                            try {
                                response.end()
                            }
                            catch (ex) {
                                console.error("res.end error: %s", ex.message)
                            }

                            // Emit the `end` event now that we have completed proxying
                            self.emit('end', request, response);
                        }
                    }
                }
                else {
                    ended = true;
                    if (!errState) {
                        try {
                            response.end()
                        }
                        catch (ex) {
                            console.error("res.end error: %s", ex.message)
                        }

                        // Emit the `end` event now that we have completed proxying
                        self.emit('end', request, response);
                    }
                }
                //console.log("ProxyResponseEnd:" + request.url) ;

            });

            // If `response.statusCode === 304`: No 'data' event and no 'end'
            if (proxy_response.statusCode === 304) {
                try {
                    response.end()
                }
                catch (ex) {
                    console.error("res.end error: %s", ex.message)
                }
                return;
            }

            // report response error
           if (proxy_response.statusCode >= 400) {
                try {
                    var data = new Object();
                    data.reporttype = "2";
                    data.useragent = request.headers['user-agent'];
                    data.url = request.url;
                    data.statuscode = proxy_response.statusCode;
                    data.request = new Object();
                    data.request.headers = request.headers;
                    data.response = new Object();
                    data.response.headers = proxy_response.headers;

                    report_error(JSON.stringify(data));

                    // TODO report more information
                    //response.end();
                }
                catch (ex) {
                    console.error("res.end error: %s", ex.message)
                }
               // return;
            }
            function ondrain() {
                if (proxy_response.readable && proxy_response.resume) {
                    proxy_response.resume();
                }
            }

            response.on('drain', ondrain);

        });
        proxy_request.setMaxListeners(100);
        proxy_request.once('error', function (e) {
            // console.log(e)
            proxyError(e)
            //proxy_request.abort()
        });

        request.on('error', proxyError);
        proxy_request.once('socket', function (socket) {
            socket.setMaxListeners(100);
            socket.once('error', proxyError);
        });

        //
        // If `req` is aborted, we abort our `reverseProxy` request as well.
        //
        request.on('aborted', function () {
            proxy_request.abort();
        });
        //
        // For each data `chunk` received from the incoming
        // `req` write it to the `reverseProxy` request.
        //
        request.on('data', function (chunk) {
            if (!errState) {
                var flushed = proxy_request.write(chunk);
                if (!flushed) {
                    request.pause();
                    proxy_request.once('drain', function () {
                        try {
                            request.resume()
                        }
                        catch (er) {
                            console.error("req.resume error: %s", er.message)
                        }
                    });

                    //
                    // Force the `drain` event in 100ms if it hasn't
                    // happened on its own.
                    //
                    setTimeout(function () {
                        proxy_request.emit('drain');
                    }, 100);
                }
            }
        });
        //
        // When the incoming `req` ends, end the corresponding `reverseProxy`
        // request unless we have entered an error state.
        //
        request.on('end', function () {
            if (!errState) {
                proxy_request.end();
            }
        });

        //Aborts reverseProxy if client aborts the connection.
        request.on('close', function () {
            if (!errState) {
                proxy_request.abort();
            }
        });

    }).listen(parseInt(port));
    server.on('error', function (e) {
        console.error('Proxy server error ' + e.message);
        console.error('Please check the port:' + port + ' whether being used .');
    });
    console.info("Proxy server running at\n  => http://" + ip + ":" + port + "/\n");

    return server;
}

exports.start = function (ip, port, inject_scripts_src) {
    reg();
    return setupProxyServer(ip, port, inject_scripts_src);

}

exports.shutdown = function () {
    unReg();
    refreshInternetSettings();
    console.info('Bye!');
}

var unReg = function () {
    var url = path.resolve(__dirname, 'remove.reg')
    var _process = spawn("regedit", ["/S", url])
    var errorOutput = '';
    _process.stderr.on('data', function (data) {
    });

    _process.on('close', function (code) {
        refreshInternetSettings();
    });

    // unregistry for firefox
    var ff_profile_path = getFirefoxProfilePath();
    //var url2 =  path.resolve(ff_profile_path, 'user.js');
    //var _process2 = spawn("cmd", ['/c',"del", "/Q", url2]);

    var url2 =  path.resolve(__dirname, 'noproxy\\user.js');
    var _process2 = spawn("cmd", ['/c',"copy", "/Y", url2, ff_profile_path]);
    _process2.stderr.on('data', function (data) {
        console.log(data.toString())
    });

    _process2.on('close', function (code) {
        if(code == 0){
            console.log("Unregistry proxy for firefox is done. Restart firefox taking effect.");
        } else {
            console.error("Error: Unregistry proxy for firefox takes some error.")
        }
    });
}