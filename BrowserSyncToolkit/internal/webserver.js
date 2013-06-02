var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs")
//port = process.argv[2] || 8080;

var setupWebServer = function(ip, port) {
    var server = http.createServer(function(request, response) {
        var uri = url.parse(request.url).pathname, filename = path.join(process.cwd(), uri);
        var contentTypesByExtension = {
            '.html': "text/html",
            '.css':  "text/css",
            '.js':   "text/javascript"
        };

        // handle service actions
        var sub_uri = '/services/';
        var action_ext = '.do';
        var qs = require('querystring');
        if(uri.indexOf(sub_uri) == 0) {
            var action_part =  uri.replace(sub_uri, '');
            var action = action_part.substring(0,action_part.indexOf(action_ext));
            switch(action) {
                case 'report_response_error':        // case for reporting error when response status code >=400  from the slaves browsers
                case 'report_window_on_error':        // case for reporting error when window error occurred from the slaves browsers
                    var body = '';
                    request.on('data', function(data){
                      body += data;
                    });
                    request.on('end', function(){
                       //console.log(request.url + ":" + body);
                       var report = "";
                        if(request.method == 'POST'){     // TODO  not support
                           // report = qs.parse(body).toString();
                            response.writeHead(400, {"Content-Type": "text/plain"});
                            response.write("Do not support!");
                            response.end();
                        }
                        if(request.method == 'GET'){
                            var query = url.parse(request.url, true).query;
                            report_presentation(action, query.report);
                            var callbackFunName = query.callbackparam;
                            response.writeHead(200, {"Content-Type": "text/plain"});
                            if(callbackFunName !=null && callbackFunName != undefined && callbackFunName != ""){
                                response.write(callbackFunName + "([" + report + "])");     // if the request fired via ajax jsonp, here should write like this
                            }
                            response.end();
                        }
                    });
                    return;
                default:
                    response.writeHead(404, {"Content-Type": "text/plain"});
                    response.write("Sorry, the action:" + action + " does not support.\n");
                    response.end();
                    return;
            }
        }

        // handle static resources or page request
        path.exists(filename, function(exists) {
            if(!exists) {
                response.writeHead(404, {"Content-Type": "text/plain"});
                response.write("404 Not Found\n");
                response.end();
                return;
            }

            if (fs.statSync(filename).isDirectory()) filename += 'index.html';

            fs.readFile(filename, "binary", function(err, file) {
                if(err) {
                    response.writeHead(500, {"Content-Type": "text/plain"});
                    response.write(err + "\n");
                    response.end();
                    return;
                }

                var headers = {};
                var contentType = contentTypesByExtension[path.extname(filename)] || 'text/plain';
                if (contentType) headers["Content-Type"] = contentType;
                response.writeHead(200, headers);
                response.write(file, "binary");
                response.end();
            });
        });
    }).listen(parseInt(port, 10));

    server.on('error', function (e) {
        console.error('Web server error ' + e.message);
        console.error('Please check the port:' + port + ' whether being used .');
    });
    console.log("Web server running at\n  => http://" + ip + ":" + port + "/");
    console.log("\tStatic file server running at\n\t\t=> http://" + ip + ":" + port + "/");
    console.log("\tAPI server running at\n\t\t=> http://" + ip + ":" + port + "/services/\n");
    return server;
}

var report_presentation = function(action, report_json){
    console.log("**Report**\naction:" + action + "\ndata:" + report_json);
};

exports.start = function(ip, port){
    return setupWebServer(ip, port);
}

