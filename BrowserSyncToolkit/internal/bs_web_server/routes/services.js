
/*
 * Common services
 */
var url = require("url");

exports.report_error = function(req, res){
    var body = '';
    req.on('data', function(data){
        body += data;
    });
    req.on('end', function(){
        //console.log(req.url + ":" + body);
        var report = "";
        if(req.method == 'POST'){     // TODO  not support
            // report = qs.parse(body).toString();
            res.writeHead(400, {"Content-Type": "text/plain"});
            res.write("Do not support!");
            res.end();
        }
        if(req.method == 'GET'){
            var query = url.parse(req.url, true).query;
            report_presentation(query.report);
            var callbackFunName = query.callbackparam;

           //res.writeHead(200, {"Content-Type": "text/plain"});
            if(callbackFunName !=null && callbackFunName != undefined && callbackFunName != ""){
                res.send(callbackFunName + "([" + report + "])");       // if the request fired via ajax jsonp, here should write like this
                //res.write(callbackFunName + "([" + report + "])");
            }
          //res.end();
        }
    });

};

var report_presentation = function(report_json){
    console.log("**Report**\n" + report_json);
};