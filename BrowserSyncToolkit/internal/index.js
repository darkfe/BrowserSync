console.log(__dirname);
var orig_config_xml = __dirname + '/../_browser_sync_config.xml';
var tmp_config_name =  '_config.tmp.js';
var webserver_path =  __dirname + '/bs_web_server/';
var js_path =  webserver_path  + 'public/javascripts/';
var tmp_config = js_path + tmp_config_name;
// define the name of the config xml variable to be used
var name_var_config_xml = "browser_sync_config_xml";
// define the name of the server ip variable to be used
var name_var_server_ip = "server_ip";
var preprocess_local_config = function (server_ip) {
// solve the problem: 'read local file' in browser via javascript
    var fs = require('fs');
    fs.readFile(orig_config_xml, function (err, data) {
        if (err) throw err;
        var config_xml = data.toString('binary').replace(/\r\n/g, "").replace(/\s+</g, "<").replace(/.+<\?xml/,"<?xml");
        fs.writeFileSync(tmp_config, 'var ' + name_var_config_xml + '=\'' + config_xml + '\';var ' + name_var_server_ip + '=\'' + server_ip + '\';' );
        //console.log("The configuration from " + orig_config_xml + " has been translated to " + tmp_config + ".");
    });
}

process.env.WEBSERVER_HOST = "localhost";
require('dns').lookup(require('os').hostname(), function(err, addr, fam){
    process.env.WEBSERVER_HOST = addr ;
    preprocess_local_config(process.env.WEBSERVER_HOST);
    startservers();
});

var startservers = function(){
    // start the web server for static resource
    var webserver_host = process.env.WEBSERVER_HOST;
    var webserver_port = "8080";
    process.env.WEBSERVER_PORT = webserver_port;
    require(webserver_path + 'server');

    // define the variable for proxy
    var jquery_src = 'http://code.jquery.com/jquery-1.9.1.min.js';
    var static_res_path = "/javascripts/";
    var tmp_config_js_url = 'http://'+webserver_host + ":" + webserver_port + static_res_path + tmp_config_name;
    var loadfile_js_url = 'http://'+webserver_host + ":" + webserver_port + static_res_path + 'loadfile.js';
    var bs_injecter_js_url = 'http://'+webserver_host + ":" + webserver_port + static_res_path + 'browser_sync_injecter.js';
    var report_injecter_js_url = 'http://'+webserver_host + ":" + webserver_port + static_res_path +  'report_injecter.js';

    // setup the inject scripts
    // attention the order
    var inject_scripts_src = [jquery_src, tmp_config_js_url , loadfile_js_url, bs_injecter_js_url, report_injecter_js_url];

    // start the proxy server for injection
    var proxy = require("./bs_proxy_server/proxy");
    var proxy_port = "8081";
    proxy.start(process.env.MY_IP, proxy_port, inject_scripts_src);
};