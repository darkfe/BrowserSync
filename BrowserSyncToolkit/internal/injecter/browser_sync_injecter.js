$(document).ready(function () { // make the injection tack action on document is ready
    // Load the xml config
    // The variable browser_sync_config_xml has been defined in outside
    if (browser_sync_config_xml == null || browser_sync_config_xml == '') {
        alert('Please check the config file is correct.');
    }

    initDocum(browser_sync_config_xml);
	
	if(!isMainBrowser()){ // 如果当前浏览器不是主浏览器，直接跳过
		return;
	}
	
	// 兼容IE等没有console的浏览器
	if(typeof console === "undefined"){
        console={};
        console.log = function(){return;}
        console.debug = function(){return;}
        console.error = function(){return;}
    }

    console.log('Injecting...');

    // set the port for syncing, setting in loadfile.js
    var port = getSyncPort();
    console.log('The sync port is ' + port);
    // 设置请求超时时间，单位为毫秒
    var timeout = 2000;
    // update the urls for syncing
    var urls = getUrls(); // the method defined in loadfile.js

    // 最外层的控制台面板
    var consolePanel = document.createElement('div');
    consolePanel.setAttribute("id", "consolePanel");
    consolePanel.setAttribute("style", "z-index:100000000; width:500px; border:solid 1px #ccc; position: absolute; top:5px; left:5px; word-wrap: break-word;border: 2px dotted #AAAAAA;border-radius: 5px 5px 5px 5px;");
    consolePanel.innerHTML = "<p id='consoleToolbar' style='margin:0;padding:0 0 0 30px;cursor: move;background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAVUlEQVQ4jWNgwA/+QzFOwEhAM0G1uAzAZSs+C3EahNcLTKSaiM8AvDahAbhaJnQBUg1hJFMzHFAcBjCAK7QJisNcQHL8EquH9umA4qRMcWYiBAiGAQA8HxcBTzyTEgAAAABJRU5ErkJggg==) no-repeat 6px center'> <input type='button' id='consoleZoom'  onclick=if(this.value=='最小化'){document.getElementById('automanConsoleID').style.display='none';this.value='显示';}else{document.getElementById('automanConsoleID').style.display='block';this.value='最小化';} value='最小化' /> <input type='button' id='consoleClose' onclick=document.getElementById('consolePanel').style.display='none'; value='关闭' /><label style='background-color: #ddd; margin: 5px 0 5px 0; font-weight:bold; font-size:20px; border-radius: 3px; text-indent:5px;text-align:left;'>浏览器同步工具控制台</label></p>";

    var consoleInfo = document.createElement('div');
    consoleInfo.setAttribute('id', 'automanConsoleID');
    consoleInfo.setAttribute('style', 'z-index: 100000000; top:5px; left:5px; word-wrap: break-word;border-radius: 5px 5px 5px 5px;background-color:#fff;text-align: left; padding:0 5px;');

    // append the consoleInfo to consolePanel
    consolePanel.appendChild(consoleInfo);
    // append the consolePanel to html body
    document.body.appendChild(consolePanel);

    // 处理是否显示控制台信息窗体
    if (window.top != window) {
        document.getElementById('automanConsoleID').style.display = 'none';
        document.getElementById('consoleZoom').value = '显示';
    }

    var automanSync = document.createElement('input');
    automanSync.type = 'hidden';
    automanSync.id = 'automanSync';
    document.getElementById('automanConsoleID').appendChild(automanSync);
    var automanTitle = document.createElement('p');
    automanTitle.setAttribute('style', 'font-size:20px;color:#FF0000');
    automanTitle.id = 'automanDrag';
    automanTitle.setAttribute('style', 'background-color: #ddd; margin: 5px 0 5px 0; font-weight:bold; font-size:20px; border-radius: 3px; text-indent:5px;text-align:left;');
    automanTitle.textContent = "BrowserSync";
    document.getElementById('automanConsoleID').appendChild(automanTitle);
    var automanTips = document.createElement('p');
    automanTips.id = 'automanTips';
    automanTips.textContent = "欢迎使用Browser Sync工具";
    automanTips.setAttribute('style', 'font-size:15px;color:#FF0000');
    document.getElementById('automanDrag').appendChild(automanTips);
    var automanUrl = document.createElement('input');
    automanUrl.type = 'text';
    automanUrl.id = 'automanUrl';
    automanUrl.placeholder = '请输入同步的URL,按回车键进行同步。';
    automanUrl.maxLength = '150';
    automanUrl.setAttribute('style', 'width:340px;height:20px;border: inset 2px #AAAAAA;padding:0');
    document.getElementById('automanConsoleID').appendChild(automanUrl);
    var automanRefresh = document.createElement('button');
    automanRefresh.id = 'automanRefresh';
    automanRefresh.onmouseover = showButtonTip;
    automanRefresh.textContent = 'Refresh';
    automanRefresh.setAttribute('style', 'width:80px;height:25px;');
    document.getElementById('automanConsoleID').appendChild(automanRefresh);
    var automanGoto = document.createElement('button');
    automanGoto.id = 'automanGoto';
    automanGoto.textContent = 'Sync Page';
    automanGoto.onmouseover = showButtonTip;
    automanGoto.setAttribute('style', 'width:88px;height:25px;');
    document.getElementById('automanConsoleID').appendChild(automanGoto);
    var automanCheck = document.createElement('button');
    automanCheck.id = 'automanCheck';
    automanCheck.textContent = 'Check';
    automanCheck.setAttribute('style', 'width:80px;height:25px;');
    automanCheck.onclick = checkUrlsAvailable;
    automanCheck.onmouseover = showButtonTip;
    document.getElementById('automanConsoleID').appendChild(automanCheck);
    var automanOutput = document.createElement('div');
    automanOutput.id = 'automanOutput';
    automanOutput.textContent = 'Output：';
    document.getElementById('automanConsoleID').appendChild(automanOutput);

    document.getElementById('automanSync').value = (port);

    function creatXMLHTTPRequests(num) {
        var xlmhttps = [num];

        if (window.ActiveXObject) {         // ...otherwise, use the ActiveX control for IE5.x and IE6
            for (var i = 0; i < num; i++) {
                xmlhttp = new ActiveXObject('MSXML2.XMLHTTP.3.0');
                xmlhttp.onreadystatechange = HandleStateChange;
                //xmlhttp.timeout = timeout;
                // TODO add the ontimeout process
                //xmlhttp.isTimeout = false;
                //xmlhttp.isChecking = false;
                //xmlhttp.index = i;
                xlmhttps[i] = xmlhttp;
            }
        } else if (window.XMLHttpRequest) {        // if IE7, Mozilla, Safari, and so on: Use native object.
            for (var i = 0; i < num; i++) {
                xmlhttp = new XMLHttpRequest();
                xmlhttp.onreadystatechange = HandleStateChange;
                xmlhttp.timeout = timeout;
                xmlhttp.ontimeout = function () {
                    try {
                        this.isTimeout = true;
                        document.getElementById('automanOutputLine_' + this.index).setAttribute('style', 'width:50px;height:25px;color:#FF0000');
                        document.getElementById('automanOutputLine_' + this.index).textContent = 'Timeout for ' + urls[this.index] + ', please check it.';
                    } catch (e) {
                        //alert(e);
                    }
                };
                xmlhttp.isTimeout = false;
                xmlhttp.isChecking = false;
                xmlhttp.index = i;
                xlmhttps[i] = xmlhttp;
            }
        }
        return xlmhttps;
    };

    function masterGoAhead() {
        if (input_sync_url != "") { // 如果input_sync_url已被赋值
            window.location.href = input_sync_url;
            //input_sync_url = ""; // 还原成初始值
        } else if (isRefresh) {
            document.location.reload();
        }
    };

    function showOutput() {
        var action = "同步";
        if (input_sync_url != "") {
            action = "跳转";
        } else if (isRefresh) {
            action = "刷新";
        }
        if (window.isChecking) {
            document.getElementById('automanOutputTopLine').textContent = "正在校验机器是否连接成功。 请求超时时间为：" + timeout + "毫秒";
        } else {
            document.getElementById('automanOutputTopLine').textContent = "等待所有的浏览器接收到同步请求后，本页面将进行【" + action + "】。 请求超时时间为：" + timeout + "毫秒";
        }
    }

    var xmlhttps = creatXMLHTTPRequests(urls.length);

    function createAutomanOutputLine() {
        var automanOutputTopLine = document.createElement('label');
        automanOutputTopLine.id = 'automanOutputTopLine';
        automanOutputTopLine.textContent = '亲，这里显示公共的输出信息';
        automanOutputTopLine.setAttribute('style', 'width:50px;height:25px;color:#FF0000');
        document.getElementById('automanOutput').appendChild(automanOutputTopLine);
        for (var i = 0; i < urls.length; i++) {
            if (document.getElementById('automanOutputLine_' + i) == null) {
                var newline = document.createElement('br');
                document.getElementById('automanOutput').appendChild(newline);

                var automanRestart = document.createElement('button');
                automanRestart.textContent = "Restart";
                automanRestart.id = 'automanRestart_' + i;
                automanRestart.setAttribute('style', 'width:80px;height:25px;');
                automanRestart.onmouseover = showButtonTip;
                var automanVNCButton = document.createElement('button');
                automanVNCButton.textContent = "View";
                automanVNCButton.id = 'automanVNCButton_' + i;
                automanVNCButton.setAttribute('style', 'width:80px;height:25px;');
                automanVNCButton.onmouseover = showButtonTip;
                var automanSyncBrowsers = document.createElement('label');
                automanSyncBrowsers.textContent = "SyncBrowsers.";
                automanSyncBrowsers.id = 'automanSyncBrowsers_' + i;
                automanSyncBrowsers.setAttribute('style', 'height:25px;font-weight:bold;');
                var url = urls[i];
                var host = url.substring(url.indexOf('/') + 2, url.lastIndexOf(':'));
                automanVNCButton.host = host;
                automanVNCButton.onclick = function () {
                    window.open('https://' + this.host + ':8081')
                };
                document.getElementById('automanOutput').appendChild(automanRestart);
                document.getElementById('automanOutput').appendChild(automanVNCButton);
                document.getElementById('automanOutput').appendChild(automanSyncBrowsers);
                var automanOutputLine = document.createElement('label');
                automanOutputLine.id = 'automanOutputLine_' + i;
                automanOutputLine.setAttribute('style', 'width:50px;height:25px;color:#01A9DB');
                document.getElementById('automanOutput').appendChild(automanOutputLine);

            }
            document.getElementById('automanOutputLine_' + i).textContent = 'Ready to sync for ' + urls[i];
            // set the sync browsers
            document.getElementById('automanSyncBrowsers_' + i).textContent = '[' + getSlaveBrowsers(host) + ']';
        }
    };
    createAutomanOutputLine();

    function showButtonTip() {
        if (this.id == "automanCheck") {
            document.getElementById('automanTips').textContent = "Check按钮：校验机器是否连接成功。";
        } else if (this.id == "automanRefresh") {
            document.getElementById('automanTips').textContent = "Refresh按钮：刷新同步页面，本页面也会被刷新。";
        } else if (this.id == "automanGoto") {
            document.getElementById('automanTips').textContent = "Sync Page按钮：同步当前页面。";
        } else if (this.id.indexOf("automanVNCButton") > -1) {
            document.getElementById('automanTips').textContent = "View按钮：打开新的TAB页，通过web vnc显示远端机器。";
        } else if (this.id.indexOf("automanRestart") > -1) {
            document.getElementById('automanTips').textContent = "(敬请期待)Restart按钮：重新启动远端浏览器。";
        }
    }

    var input_sync_url = "";
    var isRefresh = false;
    window.isChecking = false;
    window.complete_flag = 0;
    function HandleStateChange() {
        if (xmlhttps[this.index].readyState == 1) {
            if (xmlhttps[this.index].isChecking == false) {
                document.getElementById('automanOutputLine_' + this.index).setAttribute('style', 'width:50px;height:25px;color:#0000CD');
                document.getElementById('automanOutputLine_' + this.index).textContent = 'Syncing to ' + urls[this.index];
            } else {
                document.getElementById('automanOutputLine_' + this.index).setAttribute('style', 'width:50px;height:25px;color:#0000CD');
                document.getElementById('automanOutputLine_' + this.index).textContent = 'Checking for ' + urls[this.index];
            }
        }
        if (xmlhttps[this.index].readyState == 2) {
            if (xmlhttps[this.index].isChecking == true) {
                document.getElementById('automanOutputLine_' + this.index).setAttribute('style', 'width:50px;height:25px;color:#01A9DB');
                document.getElementById('automanOutputLine_' + this.index).textContent = urls[this.index] + " is available.";
            }
        }
        if (xmlhttps[this.index].readyState == 4) {
            showOutput();
            window.complete_flag = window.complete_flag + 1; // 注意， 需要在有请求发起的地方window.complete_flag = 0;   checkUrlsAvailable 和 xmlhttp_start
            //console.log(complete_flag);
            if (window.complete_flag == urls.length) { // 最后一个请求readyState为2, 即服务器已经收到请求，并且已向客户端传回了被请求的原始数据
                masterGoAhead();
                if (window.isChecking) {
                    document.getElementById('automanOutputTopLine').textContent = "校验连接的机器是否可用。 请求超时时间为：" + timeout + "毫秒";
                    window.isChecking = false;
                } else {
                    document.getElementById('automanOutputTopLine').textContent = "同步操作完毕。 请求超时时间为：" + timeout + "毫秒";
                }
            }

            if (xmlhttps[this.index].isTimeout == false) {
                if (xmlhttps[this.index].isChecking == false) {
                    document.getElementById('automanOutputLine_' + this.index).setAttribute('style', 'width:50px;height:25px;color:#32CD32');
                    document.getElementById('automanOutputLine_' + this.index).textContent = 'Sync to ' + urls[this.index] + ' is done.';
                }
            } else {

            }
            xmlhttps[this.index].abort();
            //console.debug("request id:" + this.index + " readyState is 4.");
            //console.debug(xmlhttps[this.index].getResponseHeader("Server") + ";" + xmlhttps[this.index].responseText);
        }
        //console.log('request id:' + this.index + " readyState:" + xmlhttps[this.index].readyState);
    };

    /*
     校验机器是否连接成功
     */
    function checkUrlsAvailable() {
        window.isChecking = true;
        window.complete_flag = 0;
        for (var i = 0; i < urls.length; i++) {
            try {
                xmlhttps[i].isChecking = true;
                xmlhttps[i].open('POST', urls[i], true);
                xmlhttps[i].send('automan@check\nEOF\n');
            } catch (e) {
                alert(urls[i] + " is not available.\n" + e);
            }
        }
    };

    /*
     同步时调用，启动http请求
     */
    function xmlhttp_start(i) {
        xmlhttps[i].abort();
        xmlhttps[i].isTimeout = false; // 设置超时标记为false
        xmlhttps[i].isChecking = false; // 设置校验标记为false
        window.complete_flag = 0;
        xmlhttps[i].open('POST', urls[i], true);
    };

    var focusOnElement = null;

    function a_down(e) {
        var e_target = e.target;
        var c = e_target.tagName.toLowerCase();
        if ((c == 'input' && e_target.type == 'text') || (c == 'input' && e_target.type == 'password') || (c == 'textarea')) {
            focusOnElement = e_target;
            console.log(focusOnElement.value);
        }
        else {
            for (var i = 0; i < urls.length; i++) {
                if (getElementXPath(e_target) == 'button#automanRefresh') {
                    debugger;
                    console.log("==" + getElementXPath(e_target));
                    xmlhttp_start(i);
                    xmlhttps[i].send(getElementXPath(e_target) + '@refresh' + '\nEOF\n');
                    isRefresh = true;
                } else if (getElementXPath(e_target) == 'button#automanGoto') {
                    xmlhttp_start(i);
                    xmlhttps[i].send(getElementXPath(e_target) + '@' + document.location.href + '@gotoo' + '\nEOF\n');
                } else if ((getElementXPath(e_target).indexOf('#automan') == -1) && (getElementXPath(e_target).indexOf('#console') == -1)) { // ignore some control in the console
                    xmlhttp_start(i);
                    xmlhttps[i].send(getElementXPath(e_target) + '@click' + '\nEOF\n');
                } else {
                    return;   // return directly, avoid suspending request when click the console again
                }
            }
        }
    };
    function key_up(e) {
        var keyCode = e.keyCode;
        //console.log("keyCode:" + keyCode + "|event_target_xpath:" + getElementXPath(e.target) + "|event_target_value:" + e.target.value);
        if (focusOnElement != null && (getElementXPath(focusOnElement) == 'input#automanUrl') && keyCode != 13) {
            return; // 直接返回
        }

        var e_target = e.target;
        var c = e_target.tagName.toLowerCase();
        // 当keycode 不为TAB, 并且是在文本或密码框中进行了操作，记录原始event target对象
        if ((keyCode != 9 && c == 'input' && (e_target.type == 'text' || e_target.type == 'password')) || (keyCode != 9 && c == 'textarea')) {
            focusOnElement = e_target;
            console.log("focusOnElement value:" + focusOnElement.value);
        }

        for (var i = 0; i < urls.length; i++) {
            xmlhttp_start(i);
            if (keyCode == 13) { // 回车处理
                if (getElementXPath(e.target) == 'input#automanUrl') {
                    var goto_url = e.target.value;
                    if (goto_url.indexOf('http') != 0) {
                        input_sync_url = 'http://' + goto_url;
                    }

                    xmlhttps[i].send(getElementXPath(e.target) + '@' + goto_url + '@gotourl' + '\nEOF\n');
                }
                else {
                    // 当事件源的value为空时，取光标定位的控件value
                    if (encodeURI(e.target.value) != "undefined") {
                        xmlhttps[i].send(getElementXPath(e.target) + '@' + encodeURI(e.target.value) + '@enter' + '\nEOF\n');
                    } else if (focusOnElement != null) {
                        xmlhttps[i].send(getElementXPath(focusOnElement) + '@' + encodeURI(focusOnElement.value) + '@enter' + '\nEOF\n');
                    } else {
                        console.error('enter could not sync');
                    }
                }
            }
            else if (keyCode == 27 || keyCode == 120) {
                xmlhttps[i].send('F9' + '@' + e.keyCode + '\nEOF\n');
            }
            else if (keyCode == 36) { // Home(起始)按钮
                xmlhttps[i].send('up' + '@scroll' + '\nEOF\n');
            }
            else if (keyCode == 35) { // End(结束)按钮
                xmlhttps[i].send('down' + '@scroll' + '\nEOF\n');
            }
            else if (keyCode == 9) { // TAB按钮,触发文本框同步
                if (focusOnElement != null && encodeURI(focusOnElement) != "undefined") {
                    xmlhttps[i].send(getElementXPath(focusOnElement) + '@' + encodeURI(focusOnElement.value) + '@edit' + '\nEOF\n');
                } else {
                    console.error('tab could not sync');
                }
            }
            else { // 其它输入, 不进行处理

            }
        }
    };

    function getElementXPath(elt) {
        var path = '';
        for (; elt && elt.nodeType == 1; elt = elt.parentNode) {
            if (elt.id != '') {
                if (getElementdiffId(elt) > 1) {
                    idx = getElementIdx(elt);
                    path = elt.tagName.toLowerCase() + '#' + elt.id.replace(':', '\\:') + ':eq(' + idx + ')' + path;
                    path = '>' + path;
                }
                else {
                    path = elt.tagName.toLowerCase() + '#' + elt.id.replace(':', '\\:') + path;
                    break;
                }
            }
            else {
                idx = getElementIdx(elt);
                name = elt.tagName.toLowerCase();
                xname = name + ':eq(' + idx + ')';
                path = xname + path;
                if (name == 'body') {
                    break;
                }
                else {
                    path = '>' + path;
                }
            }
        }
        path = encodeURI(path);
        return path;
    };
    function getElementIdx(elt) {
        var count = 0;
        for (var sib = elt.previousSibling; sib; sib = sib.previousSibling) {
            if (sib.nodeType == 1 && sib.tagName == elt.tagName)        count++;
        }
        return count;
    };
    function getElementdiffId(elt) {
        var count = 0;
        var p = elt.parentNode;
        var len = p.children.length;
        for (var i = 0; i < len; i = i + 1) {
            if (p.children[i].id == elt.id) count++;
        }
        return count;
    };
    window.addEventListener('mousedown', a_down, false);
    window.addEventListener('keyup', key_up, true);
    //处理淘宝登录的用户名输入框同步
    if (document.getElementById('TPL_username_1')) {
        document.getElementById('TPL_username_1').addEventListener('blur', function (e) {
            if (e.keyCode = 9) {
                for (var i = 0; i < urls.length; i++) {
                    xmlhttp_start(i);
                    xmlhttps[i].send(getElementXPath(this) + '@' + encodeURI(this.value) + '@edit' + '\nEOF\n');
                }
            }
        }, false);
    }
    /*
     Grag control
     */
    Control = {
        Drag: {
            o: null,
            z: 0,
            allControl: "",
            init: function (o, minX, maxX, minY, maxY) {
                o.onmousedown = this.start;
                o.onmouseover = this.over;
                o.onmouseout = this.out;
                o.minX = typeof minX != 'undefined' ? minX : null;
                o.maxX = typeof maxX != 'undefined' ? maxX : null;
                o.minY = typeof minY != 'undefined' ? minY : null;
                o.maxY = typeof maxY != 'undefined' ? maxY : null;
            },
            over: function (e) {
                //$(this).children(".set").show();
            },
            out: function (e) {
                //$(this).children(".set").hide();
            },
            start: function (e) {
                var o;
                e = Control.Drag.fixEvent(e);
                //Control.Drag.o = o = this;
                Control.Drag.o = o = this.parentNode;
                o.x = e.clientX - Control.Drag.o.offsetLeft;
                o.y = e.clientY - Control.Drag.o.offsetTop;
                document.onmousemove = Control.Drag.move;
                document.onmouseup = Control.Drag.end;
                //var z = $(o).css("z-index");
                //Control.Drag.z = z > Control.Drag.z ? z : Control.Drag.z;
                //$(o).css({ "opacity": 0.7, "z-index": Control.Drag.z++ });
                return false;
            },
            move: function (e) {
                e = Control.Drag.fixEvent(e);
                var oLeft, oTop, ex, ey, o = Control.Drag.o;
                ex = e.clientX - o.x;
                ey = e.clientY - o.y;
                if (o.minX != null) ex = Math.max(ex, o.minX);
                if (o.maxX != null) ex = Math.min(ex, o.maxX - o.offsetWidth);
                if (o.minY != null) ey = Math.max(ey, o.minY);
                if (o.maxY != null) ey = Math.min(ey, o.maxY - o.offsetHeight);
                o.style.left = ex + 'px';
                o.style.top = ey + 'px';

                //$(o).children(".content").text("Div { left: " + ex + "px, top: " + ey + "px } ");
                return false;
            },
            end: function (e) {
                e = Control.Drag.fixEvent(e);
                //$(Control.Drag.o).css({ "opacity": 1 });
                Control.Drag.o = document.onmousemove = document.onmouseup = null;
            },
            fixEvent: function (e) {
                if (!e) {
                    e = window.event;
                    e.target = e.srcElement;
                    e.layerX = e.offsetX;
                    e.layerY = e.offsetY;
                }
                return e;
            }
        }
    }
    Control.Drag.init(document.getElementById("consoleToolbar"));
});