// include the loadfile.js
var Fs = new ActiveXObject("Scripting.FileSystemObject");
var Lib = eval(Fs.OpenTextFile('../loadfile.js', 1).ReadAll());

// Load the xml config
Lib.loadXml('../../_browser_sync_config.xml');

function creatXMLHTTPRequests(num){
	var xlmhttps = [num];
	for(var i=0; i< num; i++) {
		xmlhttp = new ActiveXObject("MSXML2.XMLHTTP.6.0");
		xlmhttps[i] = xmlhttp;
	}
	return xlmhttps;
};

function xmlhttps_abort(){
	for(var i=0;i<urls.length;i++){
		xmlhttps[i].abort();
	}
};
		
var result = "Check Result:";
var resultDict = new ActiveXObject("Scripting.Dictionary");//创建对象   
function HandleStateChange(){
	WScript.Echo(xmlhttps[0].readyState);
			//document.getElementById('automanOutputLine_'+0).textContent+='--status:' + xmlhttps[0].status + ';readyState:' + xmlhttps[0].readyState;
};

function ShowCheckResult(){
   var keys=resultDict.Keys().toArray();//将obj对象的键值转换成数组   
   for(var i = 0;i<keys.length;i++){   
       if(resultDict.Exists(keys[i])){//断定对象凑集中是否存在指定键值的项   
		result += "\n" + keys[i] + " is " + resultDict.Item(keys[i]) + "."
       }   
   }    
	WScript.Echo(result);
};
	   
// check the urls is available
var urls = Lib.getUrls();
var xmlhttps = creatXMLHTTPRequests(urls.length);
for(var i=0;i<urls.length;i++){	
	var check_url = urls[i];
	//WScript.Echo("Checking Url:" + check_url + "...");
	xmlhttps[i].open("POST", urls[i], false); // 同步
	var result_value = "";
	try{
	//xmlhttps[i].onreadystatechange = HandleStateChange;
		xmlhttps[i].send('automan@check\nEOF\n');
		//WScript.Echo(xmlhttps[i].getResponseHeader("Server"));
		//WScript.Echo(xmlhttps[i].status);
		//WScript.Echo(xmlhttps[i].responseText);
		if("200" == xmlhttps[i].status && xmlhttps[i].responseText.indexOf("OK") != -1) {
			//result += "\n" + urls[i] + " is ok.\n"
			result_value = "ok"
		}
		//WScript.Echo(xmlhttps[i].responseText); 	
	} catch(e) {
		//WScript.Echo(e);
		result_value = "not available";
		//result += "\n" + urls[i] + " is not available."
	}
	resultDict.Add(urls[i], result_value);
}
// abort all request
xmlhttps_abort();
// show result
ShowCheckResult(); 
