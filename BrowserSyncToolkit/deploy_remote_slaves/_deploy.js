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
		WScript.echo('--�ڲ�ִ�������ʼ--');
		WScript.echo(stdMsg);
		WScript.echo('--�ڲ�ִ���������--');
		if(errMsg != "") {
			WScript.echo('!!ע�⣬����ִ���д���!!');
			WScript.echo("Error:" + errMsg);
		} else {
			WScript.echo('�Ѿ���ɲ��������' + ip);
		}
		WScript.echo('*************************************************************');
		*/
	}
}