
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , services = require("./routes/services");

var app = express();

// all environments
app.set('port', process.env.WEBSERVER_PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);
app.get('/services/report_response_error.do', services.report_error);
app.get('/services/report_window_on_error.do', services.report_error);


http.createServer(app).listen(app.get('port'), function(){
  var ip = process.env.WEBSERVER_HOST;
  console.log("Web server running at\n  => http://" + ip + ":" + app.get('port') + "/");
  console.log("\tStatic file server running at\n\t\t=> http://" + ip + ":" + app.get('port') + "/");
  console.log("\tAPI server running at\n\t\t=> http://" + ip + ":" + app.get('port') + "/services/\n");
});
