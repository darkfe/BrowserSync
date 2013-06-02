/*
	Config the constants hear.
*/
var docum;

/*
**	Get the browser type
*/
function getOs()  
{   
   try{
	   if(navigator.userAgent.toLowerCase().indexOf("se 2.x")>-1) {  
			return "SouGou";  
	   }
	   if(navigator.userAgent.toLowerCase().indexOf("360se")>-1) {  
			return "360";  
	   }
	   if(navigator.userAgent.toLowerCase().indexOf("taobrowser/")>-1) {  
			return "TaoBrowser";  
	   }
	   if(navigator.userAgent.toLowerCase().indexOf("msie 9")>-1) {  
			return "IE9";  
	   }
	   if(navigator.userAgent.toLowerCase().indexOf("msie 8")>-1) {  
			return "IE8";  
	   }
	   if(navigator.userAgent.toLowerCase().indexOf("msie 7")>-1) {  
			return "IE7";  
	   }
	   if(navigator.userAgent.toLowerCase().indexOf("msie 6")>-1) {  
			return "IE6";  
	   }	   
	   if(navigator.userAgent.toLowerCase().indexOf("firefox")>-1){  
			return "Firefox";  
	   }
	   if(navigator.userAgent.toLowerCase().indexOf("chrome")>-1){  
			return "Chrome";  
	   }   
	   if(navigator.userAgent.toLowerCase().indexOf("safari")>-1) {  
			return "Safari";  
	   }   
	   if(navigator.userAgent.toLowerCase().indexOf("camino")>-1){  
			return "Camino";  
	   }  
	   if(navigator.userAgent.toLowerCase().indexOf("gecko/")>-1){  
			return "Gecko";  
	   }
	   if(navigator.userAgent.toLowerCase().indexOf("opera/")>-1){  
			return "Opera";  
	   }
   } catch(e){
		return "WScriptShell";
   }
   return "undefined";
}  

var os = getOs();
var hasActiveX = false; 
if (os.indexOf("IE") > -1 || os == "WScriptShell") {
  hasActiveX = true;
}

/*
**	Load the xml doc
*/
function loadXml(xmlUrl) {
  var xmldoc = null;

  // create the xml doc object
  try {
    xmldoc = document.implementation.createDocument("", "", null);   //Firefox, Mozilla, Opera, etc.
  }
  catch (e) {
    try {
      xmldoc = new ActiveXObject("Microsoft.XMLDOM");   // IE/WScriptShell
    } catch (e) {
      alert(e.message);
    }
  }

  // load the content to xml doc object from xmlurl
  try {
    // make load synchronized
    xmldoc.async = false;
    xmldoc.load(xmlUrl);
    return xmldoc;
  } catch(e){
      if(e.message.indexOf("Object #<Document> has no method 'load'") > -1) {
          try //Google Chrome
          {
              var xmlhttp = new window.XMLHttpRequest();
              xmlhttp.open("GET",xmlUrl,false);
              xmlhttp.send(null);
              return xmlhttp.responseXML.documentElement;
          } catch (e) {
              alert(e.message + "\n" + "Please check the file:" + xmlUrl + " is correct.");
          }
      } else if(e.message.indexOf('Access to restricted URI denied') != -1) {
          if(os.toLowerCase()=="firefox") {
              alert(e.message + "\n" + "1. navigate to about:config\n2. (double click)set security.fileuri.strict_origin_policy = false");
          } else {
              alert(e.message + "\n" + "Do not support the " + os + ", you can retry in firefox.");
          }
      } else {
          alert(e.message + "\n" + "Please check the file:" + xmlUrl + " is correct.");
      }
  }
  return null;
}

/*
**	Create the DOM structure for the xml doc
*/
function createXml(xmlText) {
  if (xmlText) {
    try {
      var xmldom = new ActiveXObject("Microsoft.XMLDOM");
      xmldom.loadXML(xmlText);
      return xmldom;
    }
    catch (e) {
      try {
        return new DOMParser().parseFromString(xmlText, "text/xml");
      }
      catch (e) {
        return null;
      }
    }
  }
  return null;
}

/*
**	Get the node and it's sub node text
*/
function getXmlText(oNode) {
  if (oNode.text) { //IE
    return oNode.tex;
  }
  var sText = "";
  for (var i = 0; i < oNode.childNodes.length; i++) { 
    if (oNode.childNodes[i].hasChildNodes()) { 
      sText += getXmlText(oNode.childNodes[i]);
    } else {
      sText += oNode[i].childNodes.nodeValue;
    }
  }
  return sText;
}

/*
**	Get the serialized string for the node
*/
function getXml(oNode) {
  if (oNode.xml) { //IE
    return oNode.xml;
  }
  var serializer = new XMLSerializer();
  return serializer.serializeToString(oNode);
}

/*
**	Get the text of the node
*/
function getxmlnodeText(oNode) {
  if (hasActiveX) {
    return oNode.text;
  } else {
    if (oNode.nodeType == 1) return oNode.textContent;
  }
  return "";
}

/*
**	Get the attribute of the node
*/
function getxmlnodeattribute(oNode, attrName) {
  if(oNode == undefined) return oNode;
  if (hasActiveX) {
    return oNode.getAttribute(attrName);
  } else {
    if (oNode.nodeType == 1 || oNode.nodeType == "1") return oNode.attributes[attrName].value;
    return "undefined";
  }
}

/*
**	Get the root node of the loaded doc
*/
function _getDocRoot(){
	var root = docum.documentElement;
	return root;
}

/*
**	Get the machine nodes
*/
function _getSlaves(){
	var root = _getDocRoot();
	var nodeList = root.getElementsByTagName("machine");
	return nodeList;
}

/*
**	Get the machine node for the ip
*/
function _getMachine(ip){
	var nodeList = _getSlaves();
	for(var i=0;i<nodeList.length;i++) {
		var machine = nodeList[i];
		var attr = getxmlnodeattribute(machine, "ip");
		if(attr != "undefined" && attr.toLowerCase() == ip.toLowerCase())
		{
			return machine;
		}
	}
	return null;
}

/*
** Get the global sync port
 */
function getSyncPort(){
    var root = _getDocRoot();
    return getxmlnodeattribute(root, "sync_port") || '9998';
}

/*
**	Get all ips of the configured machines
*/
function getIPs() {
	var ips = [];
	var nodeList = _getSlaves();
	for(var i=0;i<nodeList.length;i++) {
		var machine = nodeList[i];
		var attr = getxmlnodeattribute(machine, "ip");
		if(attr != "undefined")
		{
			ips[i] = attr;
		}
	}
	return ips;
}

/*
**	Get all browsers of the machine
*/
function getSlaveBrowsers(ip) {
	var ip_browsers = [];
	var machine = _getMachine(ip);
	if(machine != null)
	{
		var browsers = machine.getElementsByTagName("browser"); 
		for(var k=0;k<browsers.length;k++){
			ip_browsers[k] = getxmlnodeText(browsers[k]);
		}
		return ip_browsers;
	}
	return "";
}

/*
**	Get the username of the machine
*/
function getUsername(ip) {
	var machine = _getMachine(ip);
	if(machine != null)
	{
		var ip_username = getxmlnodeattribute(machine, "username");
		return ip_username;
	}
	return "";
}

/*
**	Get the password of the machine
*/
function getPassword(ip) {
	var machine = _getMachine(ip);
	if(machine != null)
	{
		var ip_password = getxmlnodeattribute(machine, "password");
		return ip_password;
	}
	return "";
}

/*
**	Get all urls of the configured machines
*/
function getUrls(){
	var urls = [];
	var ips = getIPs();
	for(var i=0; i<ips.length;i++){
		urls[i] = 'http://' + ips[i] + ":" + getSyncPort();
	}
	return urls;
}

/*
 **	Get all main browser of the configured machines
 */
function getMainBrowser(){
    var ip_browser;
    var machine = _getMachine('localhost');
    if (machine == null) {
        machine = _getMachine('127.0.0.1');
    }
    if(machine != null)
    {
        var browsers = machine.getElementsByTagName("main_browser");
        for(var k=0;k<browsers.length;k++){
            ip_browser = getxmlnodeText(browsers[k]);
            break; // get the first
        }
        return ip_browser;
    }
    return "";
}

/**
 * Check the browser is main browser or not
 */
function isMainBrowser(){
    if(getOs().toLowerCase().indexOf(getMainBrowser().toLowerCase()) > -1 ||  // support the configuration define the IE Version, as IE6\IE7\IE8\IE9
		(getOs().toLowerCase() == "firefox" && getMainBrowser().toLowerCase() == "ff"))  {     // when the main browser setting equals ff
        return true;
    }
    return false;
}

/*
**	Initiate the xml document
*   1. if the xml parameter is xml content string, it'll create xml object with content
*   2. otherwise it'll load xml from the provided xml url (file:/// or http://)
*/
function initDocum(xml){
	if(xml.indexOf('?xml') > -1){
		docum = createXml(xml);
	} else {
		docum = loadXml(xml);
	}
}

/*
**	The api with this file
*/
(function () {
    var L = { /*library interface*/ };
    L.loadXml = function (xmlUrl) {initDocum(xmlUrl);};
    L.getSyncPort = function () {return getSyncPort();};
	L.getIPs = function () {return getIPs();};
	L.getSlaveBrowsers = function (ip) {return getSlaveBrowsers(ip);};
	L.getUsername = function (ip) {return getUsername(ip);};
	L.getPassword = function (ip) {return getPassword(ip);};
	L.getUrls = function () {return getUrls();};
	L.getMainBrowser = function () {return getMainBrowser();};
    L.isMainBrowser = function () {return isMainBrowser();};
    L.getOs = function () {return getOs();};
    return L;
}).call();