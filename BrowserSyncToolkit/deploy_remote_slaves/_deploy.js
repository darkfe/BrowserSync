// include the loadfile.js
var Fs = new ActiveXObject("Scripting.FileSystemObject");
var Lib = eval(Fs.OpenTextFile("../internal/bs_web_server/public/javascripts/loadfile.js", 1).ReadAll());

// Load the xml config
Lib.loadXml('../_browser_sync_config.xml');
	   
var ips = Lib.getIPs();
for(var i=0;i<ips.length;i++){
	var ip = ips[i];
	var username = Lib.getUsername(ip);
	var password = Lib.getPassword(ip);
	var command = '_deploy.bat ' + ip + " " + username + " " + password;
	var wsh = new ActiveXObject("WScript.Shell");
	if(wsh){
		//WScript.echo("It's deploying to " + ip + "(USERNAME=" + username + ", PASSWORD=" + password + ")");
		var exeRs = wsh.run(command);
		/*
		var exeRs = wsh.Exec(command);
		errMsg = exeRs.StdErr.ReadAll();
		stdMsg = exeRs.StdOut.ReadAll();
		WScript.echo('*************************************************************');
		WScript.echo('--内部执行输出开始--');
		WScript.echo(stdMsg);
		WScript.echo('--内部执行输出结束--');
		if(errMsg != "") {
			WScript.echo('!!注意，发现执行有错误!!');
			WScript.echo("Error:" + errMsg);
		} else {
			WScript.echo('已经完成部署机器：' + ip);
		}
		WScript.echo('*************************************************************');
		*/
	}
}