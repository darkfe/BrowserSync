// 注：该文件的存在，主要是利用js来读取xml配置文件比较方便
// 1. 读取配置
// 2. 调用_Startup_Remote_Slaves.bat脚本
// include the loadfile.js
var Fs = new ActiveXObject("Scripting.FileSystemObject");
var Lib = eval(Fs.OpenTextFile("internal/loadfile.js", 1).ReadAll());

// Load the xml config
Lib.loadXml('_browser_sync_config.xml');
	   
var ips = Lib.getIPs();
for(var i=0;i<ips.length;i++){
	var ip = ips[i];
	var browsers = Lib.getSlaveBrowsers(ip);
	var wsh = new ActiveXObject("WScript.Shell");
	if(wsh){
		var run_dir = wsh.CurrentDirectory.replace(/\\/g,'/');
		var command = run_dir + '/internal/_Startup_Remote_Slaves.bat ' + ip + " " + browsers.join(' ');
		var exeRs = wsh.run(command);
		WScript.echo('*************************************************************');
		WScript.echo('已经向机器：' + ip + '发送启动BrowserSync WebDriver Server的请求，\n启动的浏览器有：' + browsers.join(' ') + ' \n稍后，你可通过点击主浏览器上的Check按钮，验证Server是否就绪。');
		WScript.echo('若启动未成功，首先确保' + ip + '的KeludeDeploy.exe已经运行！！！');
		WScript.echo('另外，确保您已经通过【deploy_点我进行部署Slave机器.bat】进行部署！！！');
		WScript.echo('*************************************************************');
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
			WScript.echo('请务必确保远端的KeludeDeploy.exe已经运行！！！');
			WScript.echo("Error:" + errMsg);
		} else {
			WScript.echo('已经向机器：' + ip + '发送启动BrowserSync Server的请求，\n启动的浏览器有：' + browsers.join(' ') + ' \n稍后，你可通过点击主浏览器上的Check按钮，验证Server是否就绪。');
		}
		WScript.echo('*************************************************************');
		*/
	}
}