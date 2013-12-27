var m_imei = "";
var m_uid = null;
var m_cb = null//用于存放回调函数
//var CHN = ["91","wandoujia","8000"];
$(function(){
	//window.localStorage.setItem("SESSION_CONST_LOCATION",JSON.stringify({"lon":118.141,"lat":24.531,"date":new Date().getTime()}));//测试数据~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
});
/**
 * 检测网络
 * **/
function checkNetWork(){
	COM.UTILS.log("in checkNetWork");
	/*检查网络连接，直接请求www.baidu.com的话，在ipad机子上会出现错误，可能是不支持跨域请求造成的
	 * 所以用此请求来判断网络连接
	 */
	var params = {"cmd":"mobile.checkNetWork"};
	COM.UTILS.post_mpzkApi(params,function(json){
		getPlayForm();
	},function(json){
		COM.DIALOG.confirm('没有网络无法启动应用，请检查网络设置',function(){
   				uexWidget.finishWidget('');
   			},function(){
   				uexWidget.finishWidget('');
   			});
	});
}
function checkData(imei){
	COM.UTILS.log("in checkData");
	m_imei = imei;
//	m_imei = "351602001110715";
	if(m_uid == null){
//		COM.UTILS.getLocation(getCityInfo);
		//COM.UTILS.openWindow('lead', 'more/lead.html?type=first&imei=' + m_imei);
	}else{
		checkFirstUse();
	}
}
function getCityInfo(pos){
	COM.UTILS.log("执行：getCityInfo");
	COM.UTILS.getCityGPSCityInfo(pos,function(){
		checkFirstUse(pos);
	});
}
/***
 * 用于判断用户是否是第一次使用和获取用户的用户id
 * */
function checkFirstUse(){
	console.log("imei:"+ m_imei);
	//var pos = COM.SESSION.getPos();
	var playform = window.localStorage.getItem("SESSION_CONST_PLAYFORM");
	var params = {"cmd":"2A01","imei":m_imei,"city_id":COM.SESSION.getCityInfo().cityID,"source":playform,"app_source":M_CHN,"version_id":COM.CONST.COUNT_VERSION};
//	var params = {"v":257,"cmd":"2A01","imei":m_imei,"city_id":COM.SESSION.getCityInfo().cityID,"source":playform,"app_source":M_CHN,"version_id":COM.CONST.COUNT_VERSION};//TOD:
	//$.extend(params,{"lon":pos.lon,"lat":pos.lat});
	COM.UTILS.post_mpzkApi(params,function(jsonp){
		//console.log("in lead.html, jsonp:"+JSON.stringify(jsonp));
		first_time = jsonp.ftirst_time;
		window.localStorage.setItem("SESSION_CONST_UID",jsonp.uid+"");
		window.localStorage.setItem("SESSION_CONST_ACCESSID",JSON.stringify({"access_id":jsonp.access_id+""}));
		window.localStorage.setItem("SESSION_CONST_FIRSTLOAD",1);//设定启动第一次加载   1为第一次加载，0为不是
//		if(jsonp.profit_code){	//TOD:
//			window.localStorage.setItem("SESSION_CONST_PROFITCODE",jsonp.profit_code);//兑奖码
//		}else{
//			window.localStorage.removeItem("SESSION_CONST_PROFITCODE");//兑奖码
//		}
		COM.UTILS.openWindow('main', 'main.html');
		setTimeout(function(){
				COM.UTILS.closeWindow();
			},1000);
	},function(json){
		COM.DIALOG.confirm("获取用户信息失败，是否重新获取？",function(){
			getIMEI(checkFirstUse);
		},function(){
			uexWidget.finishWidget('');
		});
	});
}
function getPlayForm(){
	COM.UTILS.log("in getPlayForm");
	uexWidgetOne.getPlatform();
}
function checkPlatForm(opCode,dataType,data){
	COM.UTILS.log("in checkPlatForm");
	if(data == 0){
		COM.UTILS.log("iphone平台");
	}else if(data == 1){
		COM.UTILS.log("android平台");
	}
	window.localStorage.setItem("SESSION_CONST_PLAYFORM",data);
	//checkUpgrade(getIMEI);
}
/**
 * 获取imei号
 */
function getIMEI(){
	COM.UTILS.log("getIMEI");
	var imei = window.localStorage.getItem("SESSION_CONST_IMEI");
//	alert(imei);
	if (imei != null) {
		checkData(imei);
	} else {
		COM.UTILS.log("GET PLAYFORM IS " + window.localStorage.getItem("SESSION_CONST_PLAYFORM"));
		if(window.localStorage.getItem("SESSION_CONST_PLAYFORM") == 0){
			var IphoneID = COM.UTILS.getRandomIDForIphone();
//			alert("random data is "+IphoneID);
			window.localStorage.removeItem("SESSION_CONST_IMEI");
			window.localStorage.setItem("SESSION_CONST_IMEI",IphoneID);
//			alert("in session data is"+window.localStorage.getItem("SESSION_CONST_IMEI"));
			checkData(IphoneID);
		}else if(window.localStorage.getItem("SESSION_CONST_PLAYFORM") == 1){
			uexDevice.getInfo('10');
		}
	}
}
function initIMEI(opCode, dataType, data){
	imei = eval('(' + data + ')');
	window.localStorage.setItem("SESSION_CONST_IMEI", imei.imei);
	checkData(imei.imei);
}