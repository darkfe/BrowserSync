/*
It'll send a request to report the error message when the window error occurs.
 */
window.onerror=report_error;

// Load the xml config
// The variable browser_sync_config_xml has been defined in outside
if (browser_sync_config_xml == null || browser_sync_config_xml == '') {
    alert('Please check the config file is correct.');
}
initDocum(browser_sync_config_xml);

var server = server_ip;   // defined in index.js
var browserType = getOs(); // defined in loadfile.js
var report_window_on_error_url = "http://" + server + ":8080/services/report_window_on_error.do";
var sent_msg;
var sent_url;
var sent_line;
function report_error(sMsg,sUrl,sLine){
   // if(sent_msg == sMsg && sent_url == sUrl && sent_line == sLine) {
        // skip the duplicate
   // }else{

        var data = new Object();
        data.useragent = navigator.userAgent;
        data.url = sUrl;
        data.msg = sMsg;
        data.line = sLine;
        data = JSON.stringify(data) ;
        data = encodeURIComponent(data);
        $.ajax({
            type : "get",
            async:false,
            url : report_window_on_error_url,
            data: "report=" + data,
            dataType : "jsonp",
            jsonp: "callbackparam",//传递给请求处理程序或页面的，用以获得jsonp回调函数名的参数名(默认为:callback)
            jsonpCallback:"success_jsonpCallback",//自定义的jsonp回调函数名称，默认为jQuery自动生成的随机函数名
            success : function(json){
                console.log(json);
                sent_msg = sMsg;
                sent_url = sUrl;
                sent_line = sLine;
            },
            error:function(){
                console.error("report fail");
            }
        });
        console.log("It's sent.");
   // }
}