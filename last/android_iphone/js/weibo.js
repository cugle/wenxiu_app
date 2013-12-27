/**
 * 使用指南：
 * 发送不带图片的sina微博 uploadSinaInfo(msg) 
 * 发送带图片的sina微博 uploadSinaInfoWithImg(msg,imgsrc)[暂时不支持]
 * 发送不带图片的QQ微博 uploadQqInfo(msg)
 * 发送直接使用图片url的QQ微博， uploadQqInfoWithImg(msg,imgsrc) 
 * 打开sina微博授权页面 openSinaLoginWindow()
 * 打开QQ微博授权页面 openQqLoginWindow() 
 * 注意：
 * I.setToPage(page)函数来指定在需要账号登录时登录成功后跳转到page页面，默认为null即当前页面
 * 如果是跳转到当前页面，则需要设置setFromWin(winname)用来表示当前页面的窗口名称，并定义reLoadData()函数用于刷新数据
 * II.微博内容长度限制，最多140
 */
function getWeiboMsg(msg){
	if(msg.length<=140){
		return msg;
	}else{
		return msg.substr(0,140)+"...";
	}
}
 
 /**
 * @des 发送不带图片的sina微博
 * @param msg 微博内容
 */
function uploadSinaInfo(msg) {
	if(isLogged('SINA')){
		uexWindow.toast("0", "5", "微博发送中...", 1000);
		var a = getWeiboInfo();
		param={"access_token":a.stoken,"open_id":a.suid,"content":getWeiboMsg(msg),"type":1,"flag":"sina"};
//		console.log("...getWeiboInfo:"+JSON.stringify(a));
//		console.log("...param:"+JSON.stringify(param));
		uploadMsgByServer(param);
		
	}else{
		openSinaLoginWindowFromBrand();
	}

}
 /**
 * @des 发送带图片的sina微博，暂时不可用，直接使用图片url需要高级权限
 * @param msg 微博内容
 * @param imgsrc 图片地址
 */
function uploadSinaInfoWithImg(msg,imgsrc) {
	if(isLogged('SINA')){
		uexWindow.toast("0", "5", "微博发送中...", 1000);
		var a = getWeiboInfo();
		param={"access_token":a.stoken,"open_id":a.suid,"content":getWeiboMsg(msg),"pic_url":imgsrc,"type":1,"flag":"sina"};
//		console.log("...getWeiboInfo:"+JSON.stringify(a));
//		console.log("...param:"+JSON.stringify(param));
		uploadMsgByServer(param);
	}else{
		openSinaLoginWindowFromBrand();
	}

}
 /**
 * @des 发送带图片的QQ微博，直接使用图片url
 * @param msg 微博内容
 * @param imgsrc 图片地址
 */
function uploadQqInfoWithImg(msg,imgsrc) {
	if(isLogged('QQ')){
		uexWindow.toast("0", "5", "微博发送中...", 1000);
		var a = getWeiboInfo();
		param={"access_token":a.qtoken,"open_id":a.quid,"content":getWeiboMsg(msg),
		"pic_url":imgsrc,"type":2,"flag":"qq"};
//		console.log("...getWeiboInfo:"+JSON.stringify(a));
//		console.log("...param:"+JSON.stringify(param));
		uploadMsgByServer(param);
	}else{
		openQqLoginWindowFromBrand();
	}

}
 /**
 * @des 发送不带图片的QQ微博
 * @param msg 微博内容
 */
function uploadQqInfo(msg) {
	if(isLogged('QQ')){
		uexWindow.toast("0", "5", "微博发送中...", 1000);
		var a = getWeiboInfo();
		param={"access_token":a.qtoken,"open_id":a.quid,"content":getWeiboMsg(msg),"type":2,"flag":"qq"};
//		console.log("...getWeiboInfo:"+JSON.stringify(a));
//		console.log("...param:"+JSON.stringify(param));
		uploadMsgByServer(param);
	}else{
		openQqLoginWindowFromBrand();
	}

}
/**
 * 判断当前是否已经登录
 * @param wtype 微博类型  SINA or QQ
 */
function isLogged(wtype){
	var a = getWeiboInfo();
	if ("SINA" === wtype) {
		return (a&&a.stoken)?true:false;		
	}else if ("QQ" === wtype) {
		return (a&&a.qtoken)?true:false;		
	} 
	return false;
}
/**
 * oauth2登录的回调函数
 * @param {} winNam 窗口名称
 * @param {} url 返回的url
 */
function onOAuth(winNam, url) {
	console.log("winNam="+winNam+", url="+url);
	if (winNam == "sinaLoginWin") {
		Log("in onOAuth of sinaLoginWin... url => " + url);
		if (url.indexOf("http://223.4.26.242/app/redirect_uri/index.html") == 0) {
			var key = url
					.match(/http:\/\/223.4.26.242\/app\/redirect_uri\/index.html#access_token=(.*)&remind_in=(.*)&expires_in=(.*)&uid=(.*)/);
			if(key){
				Log("in onOAuth of sinaLoginWin... key ");
				saveWeiboInfo("SINA", key[1], key[3], key[4]);
				if(getToPage()){
					Log("in setTimeout,toPage is "+getToPage());
					uexWindow.open(getToPage(),"0",getToPage()+".html","2","0","0","0");
					setTimeout(function(){
						uexWindow.evaluateScript("sinaLoginWin","0","uexWindow.close('-1');");
						Log("in uexWindow.close");
					},1000);
				}else{
					Log("in setTimeout,fromWin is "+getFromWin());
					if(getFromWin()=="more"){
						uexWindow.evaluatePopoverScript("main","more",'reLoadData();');
					}else{
						uexWindow.evaluateScript(getFromWin(),"0","reLoadData()");
					}
					uexWindow.evaluateScript("sinaLoginWin","0","uexWindow.close('-1');");
					Log("in uexWindow.close");
				}
			}else{
				Log("in onOAuth of sinaLoginWin... key else");
				uexWindow.evaluateScript("sinaLoginWin","0","uexWindow.close('-1');");
			}
		}
	} else if (winNam == "qqLoginWin") {
		Log("in onOAuth of qqLoginWin... url => " + url);
		if (url.indexOf("http://223.4.26.242/app/redirect_uri/index.html") == 0) {
			var key = url
					.match(/http:\/\/223.4.26.242\/app\/redirect_uri\/index.html#access_token=(.*)&expires_in=(.*)&openid=(.*)&openkey=(.*)/);
			if(key){
				Log("in onOAuth of sinaLoginWin... key");
				saveWeiboInfo("QQ", key[1], key[2], key[3]);
				if(getToPage()){
					Log("in setTimeout,toPage is "+getToPage());
					uexWindow.open(getToPage(),"0",getToPage()+".html","2","0","0","0");	
					setTimeout(function(){
						uexWindow.evaluateScript("qqLoginWin","0","uexWindow.close('-1');");
						Log("in uexWindow.close");
					},1000);
				}else{
					Log("in setTimeout,fromWin is "+getFromWin());
//					uexWindow.evaluateScript(getFromWin(),"0","reLoadData()");
					if(getFromWin()=="more"){
						uexWindow.evaluatePopoverScript("main","more",'reLoadData();');
					}else{
						uexWindow.evaluateScript(getFromWin(),"0","reLoadData()");
					}
					uexWindow.evaluateScript("qqLoginWin","0","uexWindow.close('-1');");
					Log("in uexWindow.close");
				}
			}else{
				Log("in onOAuth of qqLoginWin... key else");
				uexWindow.evaluateScript("qqLoginWin","0","uexWindow.close('-1');");
			}
		}else{
			if(-1!=url.indexOf("checkType=error")){
				Log("in onOAuth of qqLoginWin... if else");
				uexWindow.evaluateScript("qqLoginWin","0","uexWindow.close('-1');");
			}
		}

	}
}
/**
 * 日志输出函数
 * @param {} s
 */
function Log(s) {
	console.log(s);
	uexLog.sendLog(s);
}
/**
 * 获取账号授权信息
 * @return {}
 */
function getWeiboInfo() {
	//Log("in getWeiboInfo");
	if (window.localStorage.getItem("weibo")) {
		//Log("in getWeiboInfo,weibo info ==>"+window.localStorage.getItem("weibo"));
		return JSON.parse(window.localStorage.getItem("weibo"));
	}
	return null;
}
/**
 * 保持微博授权信息
 * @param {} wflag 微博类型  SINA or QQ
 * @param {} wtoken 微博token
 * @param {} wexp 微博过期时间
 * @param {} wuid 微博uid
 */
function saveWeiboInfo(wflag, wtoken, wexp, wuid) {
	//Log("in saveWeiboInfo");
	var a = getWeiboInfo();
	if (!a) {
		a = {};
	}
	if ("SINA" === wflag) {
		a.stoken = wtoken;
		a.sexp = wexp;
		a.suid = wuid;
		a.supdate=1;
		a.sok=1;
		window.localStorage.setItem("weibo", JSON.stringify(a));
		uploadToServer(wtoken,wuid,"SINA");
	} else if ("QQ" === wflag) {
		a.qtoken = wtoken;
		a.qexp = wexp;
		a.quid = wuid;
		a.qupdate=1;
		a.qok=1;
		window.localStorage.setItem("weibo", JSON.stringify(a));
		uploadToServer(wtoken,wuid,"QQ");
	}
	//Log("in saveWeiboInfo,weibo info ==>"+window.localStorage.getItem("weibo"));
}
function uploadToServer(wtoken,wuid,wflag){
	var params = {"cmd":"2A0D","uid":COM.SESSION.getUID()};
	if ("SINA" === wflag) {
		$.extend(params,{"access_token":wtoken,"user_id":wuid});
	}else{
		$.extend(params,{"open_id":wuid,"open_key":wtoken});
	}
	COM.UTILS.post_mpzkApi(params,function(json){
		Log("in uploadToServer,upload ok ");
	},function(json){
		Log("in uploadToServer,upload error... ");		
	});
}
/**
 * 授权成功后的提示，常放在其他页面的reLoadData()或新开窗口的zy_fix()中
 */
function oauthWeiboOk(){
	//Log("in oauthWeiboOk");
	var a = getWeiboInfo();
	if (!a) {
		a = {};
	}
	if (a.sok==1) {
		a.sok=0;
		uexWindow.toast("0","5","sina微博授权成功!",3000);
	} else if (a.qok==1) {
		a.qok=0;
		uexWindow.toast("0","5","QQ微博授权成功!",3000);
	}
	window.localStorage.setItem("weibo", JSON.stringify(a));
	//Log("in oauthWeiboOk,weibo info ==>"+window.localStorage.getItem("weibo"));
}
/**
 * 打开sina微博授权页面
 */
function openSinaLoginWindow() {
	//Log("in openSinaLoginWindow");
	uexWindow.onOAuthInfo = onOAuth;
	COM.DIALOG.waiting("正在加载新浪微博登陆窗口!",1000);
	
	uexWindow.open("sinaLoginWin","0",
					"wb/wblogin.html?tourl=sina",
					"2", "0", "0", "1");
}
function openSinaLoginWindowFromBrand() {
	//Log("in openSinaLoginWindow");
	uexWindow.onOAuthInfo = onOAuth;
	COM.DIALOG.waiting("正在加载新浪微博登陆窗口!",1000);
	uexWindow.open("sinaLoginWin","0",
					"../wb/wblogin.html?tourl=sina",
					"2", "0", "0", "1");
}
/**
 * 打开QQ微博授权页面
 */
function openQqLoginWindow() {
	//Log("in openQqLoginWindow");
	uexWindow.onOAuthInfo = onOAuth;
	uexWindow.toast("0", "5", "正在加载QQ微博登陆窗口!", 1000);
	uexWindow.open("qqLoginWin","0",
					"wb/wblogin.html?tourl=qq",
					"2", "0", "0", "1");
}
function openQqLoginWindowFromBrand() {
	//Log("in openQqLoginWindow");
	uexWindow.onOAuthInfo = onOAuth;
	uexWindow.toast("0", "5", "正在加载QQ微博登陆窗口!", 1000);
	uexWindow.open("qqLoginWin","0",
					"../wb/wblogin.html?tourl=qq",
					"2", "0", "0", "1");
}
/**
 * 判断Sina操作是否成功
 * @param {} data 返回的操作结果
 * @param {} opname 操作名称
 */
function isSinaOk(data,opname){
	var obj=JSON.parse(data);
	if(obj.error_code){
		if("21315"==obj.error_code){//token过期，重新授权
			openQqLoginWindow();
		}else{
			//Log(opname+"失败=>"+data);
			uexWindow.toast("0", "5", opname+"操作失败!", 3000);
		}
	}else{
		//Log(opname+"成功");
		uexWindow.toast("0", "5", opname+"操作成功!", 3000);
		closeWindow();
	}
}
/**
 * 判断QQ操作是否成功
 * @param {} data 返回的操作结果
 * @param {} opname 操作名称
 */
function isQqOk(data,opname){
	var obj=JSON.parse(data);
	if(obj.errcode){
		if("37"==obj.errcode){//token过期，重新授权
			openSinaLoginWindow();
		}else{
			//Log(opname+"失败=>"+data);
			uexWindow.toast("0", "5", opname+"操作失败!", 3000);
		}
	}else{
		//Log(opname+"成功");
		uexWindow.toast("0", "5", opname+"操作成功!", 3000);
		closeWindow();
	}
}
/**
 * 发送微博的回调函数
 * @param {} opId 操作序号
 * @param {} status 窗口名称
 * @param {} data 返回的url
 */
function j2vHome(opId, status, data) {
	Log("in j2vHome,opId==>"+opId+", status==>" + status + ", [ddd]==>" + data);
	uexXmlHttpMgr.close(opId);
	if (opId == "940" && status == "1") {
		isSinaOk(data,"发送Sina微博");
	} else if (opId == "940" && status == "-1") {
		uexWindow.toast("0", "5", "微博已发，请勿重复!", 3000);
	}else if (opId == "942" && status == "1") {
		isQqOk(data,"发送QQ微博");
	}
}
/**
 * 操作失败的回调函数
 * @param {} opId 操作序号
 * @param {} errCode 错误码
 * @param {} errDes 错误描述
 */
function cbError(opid, errCode, errDes) {
	//Log("in cbError, opid " + opid + " errorcode " + errCode + " errDes " + errDes);
	uexXmlHttpMgr.close(opid);
	if (opid == "940") {
		uexWindow.toast("0", "5", "操作失败!", 3000);
	} else if (opid == "942") {
		uexWindow.toast("0", "5", "操作失败!", 3000);
	}
}
/** 
 * 设置授权成功后要打开的新页面，一般窗口名称对应窗口名称.html文件 
 */
var toPage=null;
function setToPage(page){
	toPage=page;
}
function getToPage(){
	return toPage;
}
/**
 * 设置从哪个窗口调用微博授权页面，一般窗口名称对应窗口名称.html文件
 * @type 
 */
var fromWin=null;
function setFromWin(winname){
	window.localStorage.setItem("fromWin",winname);
}
function getFromWin(){
	return window.localStorage.getItem("fromWin");;
}

/**
 * 获取sina微博用户信息
 */
function loadSinaUserInfo(){
	//Log("in loadSinaUserInfo");
	var infourl="https://api.weibo.com/2/users/show.json";
	uexWidgetOne.cbError=cbError;
  	uexXmlHttpMgr.onData=j2vUserInfo;
	var a=getWeiboInfo();
	var url=infourl+"?access_token="+a.stoken+"&uid="+a.suid;
	//Log("url="+url);
	uexXmlHttpMgr.open("941","GET",url,"60000");
	uexXmlHttpMgr.send("941");
}
/**
 * 获取QQ微博用户信息
 */
function loadQqUserInfo(){
	//Log("in loadQqUserInfo");
	var a=getWeiboInfo();
	var url="https://open.t.qq.com/api/user/info?oauth_consumer_key=801160289&access_token="+a.qtoken;
	url+="&openid="+a.quid+"&clientip=202.118.226.217&oauth_version=2.a&scope=all&format=json";
	uexWidgetOne.cbError=cbError;
  	uexXmlHttpMgr.onData=j2vUserInfo;
  	//Log("in loadQqInfo,url="+url);
	uexXmlHttpMgr.open("943","GET",url,"60000");
	uexXmlHttpMgr.send("943");
}
/**
 * 获取微博用户信息的回调函数
 */
function j2vUserInfo(opId, status, data) {
	//是不是要对data进行判读呢。。。
	//Log("in j2vUserInfo, status=" + status + "[ddd]" + data);
	uexXmlHttpMgr.close(opId);
	if (opId == "941" && status == "1") {
		//下一步操作。。。
		var obj=JSON.parse(data);
		//Log(data);
		var a=getWeiboInfo();
		a.sname=obj.screen_name;
		a.supdate=0;
		window.localStorage.setItem("weibo", JSON.stringify(a));
//		uexWindow.evaluateScript("more","0","reLoadData()");
		uexWindow.evaluatePopoverScript("main","more",'reLoadData();');
	}else if (opId == "943" && status == "1") {
		var obj=JSON.parse(data);
		if(obj.errcode==0){
			var a=getWeiboInfo();
			//Log(" obj.data.nick ="+obj.data.nick);
			a.qname=obj.data.nick;
			a.qupdate=0;
			window.localStorage.setItem("weibo", JSON.stringify(a));
//			uexWindow.evaluateScript("more","0","reLoadData()");
			uexWindow.evaluatePopoverScript("main","more",'reLoadData();');
		}else{
			//Log(data);
		}
	}
}

function uploadMsgByServer(params){
	var objflag=JSON.parse(window.localStorage.getItem("sharetext"));
	if(objflag.act_flag){
		$.extend(params,{"cmd":"2A14","uid":COM.SESSION.getUID(),"act_flag":objflag.act_flag});
	}else{
		$.extend(params,{"cmd":"2A14","uid":COM.SESSION.getUID()});
	}
	Log("in  uploadMsgByServer,params ="+JSON.stringify(params));
	COM.UTILS.post_mpzkApi(params,function(json){
		Log("in uploadMsgByServer,upload ok ");
		uexWindow.toast("0", "5", "微博分享成功", 3000);
		uexWindow.evaluateScript('shareBlog', '0', 'closeWindow()');
	},function(json){
		Log("in uploadMsgByServer,upload error...,json= "+JSON.stringify(json));
		if(params.flag=="sina"){
			if ("21315" == json.ret_code) {//token过期，重新授权
				openSinaLoginWindow();
			}else if ("20019" == json.ret_code) {//token过期，重新授权
				uexWindow.toast("0", "5", "该内容已分享过，请勿重复!", 3000);
			}else{
				uexWindow.toast("0", "5", "微博分享失败", 3000);
			}
		}else if(params.flag=="qq"){
			if("37"==json.ret_code){//token过期，重新授权
				openQqLoginWindow();
			}else{
				uexWindow.toast("0", "5", "微博分享失败", 3000);
			}
		}		
	});
}