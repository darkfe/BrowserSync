// ע�����ļ��Ĵ��ڣ���Ҫ������js����ȡxml�����ļ��ȽϷ���
// 1. ��ȡ����
// 2. ����_Startup_Remote_Slaves.bat�ű�
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
		WScript.echo('�Ѿ��������' + ip + '��������BrowserSync WebDriver Server������\n������������У�' + browsers.join(' ') + ' \n�Ժ����ͨ�������������ϵ�Check��ť����֤Server�Ƿ������');
		WScript.echo('������δ�ɹ�������ȷ��' + ip + '��KeludeDeploy.exe�Ѿ����У�����');
		WScript.echo('���⣬ȷ�����Ѿ�ͨ����deploy_���ҽ��в���Slave����.bat�����в��𣡣���');
		WScript.echo('*************************************************************');
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
			WScript.echo('�����ȷ��Զ�˵�KeludeDeploy.exe�Ѿ����У�����');
			WScript.echo("Error:" + errMsg);
		} else {
			WScript.echo('�Ѿ��������' + ip + '��������BrowserSync Server������\n������������У�' + browsers.join(' ') + ' \n�Ժ����ͨ�������������ϵ�Check��ť����֤Server�Ƿ������');
		}
		WScript.echo('*************************************************************');
		*/
	}
}