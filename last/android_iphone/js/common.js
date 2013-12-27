var Namespace = new Object(); 
Namespace.register = function(fullNS)
{
    var nsArray = fullNS.split('.');
    var sEval = "";
    var sNS = "";
    for (var i = 0; i < nsArray.length; i++)
    {
        if (i != 0) sNS += ".";
        sNS += nsArray[i];
        sEval += "if (typeof(" + sNS + ") == 'undefined') " + sNS + " = new Object();";
    }
    if (sEval != "") eval(sEval);
};

/*-----------常量-----------*/
Namespace.register("COM.CONST"); 
//内网
//COM.CONST.MPZKAPI_URL = "http://172.16.30.126:8080/dazhe/mobile/mpzkApi.do";
//COM.CONST.PIC_DOWN_URL = "http://172.16.30.189:7780/";
//COM.CONST.DOMAIN = "http://172.16.30.162:80/";		// 网站域名，用于编辑器上传的图片路径的修改

//测试网
//COM.CONST.MPZKAPI_URL = "http://test.8000.cn:8082/dazhe/mobile/mpzkApi.do";
//COM.CONST.PIC_DOWN_URL = "http://218.207.140.194:7780/";
//COM.CONST.DOMAIN = "http://218.207.140.194:8082/";

//运营网
COM.CONST.MPZKAPI_URL = "http://www.8000.cn/mobile/mpzkApi.do";
COM.CONST.PIC_DOWN_URL = "http://img.8000.cn:8080/";
COM.CONST.DOMAIN = "www.8000.cn/";

COM.CONST.COUNT_VERSION = "01.00.0601";// 版本号
COM.CONST.COUNT_PER_PAGE = 10;// 列表中每页显示个数
COM.CONST.COUNT_LOGO_PER_PAGE = 53;// 小图标列表中次加载个数
COM.CONST.ISMOVE = false;//判断是否触发了ontouchmove事件
COM.CONST.MAXPAGE = 10;//设定最大翻页数目
COM.CONST.POSITION_TIMEOUT = 1000*60*5;//经纬度位置失效时间，单位：毫秒。即一定时间后需要重新获取位置信息
COM.CONST.LOC_CB = "";//由于该平台回调函数比较纠结，所以暂时添加一个这个回调的变量供调用
COM.CONST.CHECKCITY_FLAG = true;//由于iphone下回出现多次定位返回结果的情况，所以在弹出切换城市窗口时要对这个参数进行判断
COM.CONST.LOCATION_FLAG = true;//我们需要多次获取gps接口以取得更精确数据，但是页面只能加载一次数据，用这个参数控制执行回调函数的次数。

$(function(){
	var platform = window.localStorage.getItem("SESSION_CONST_PLAYFORM");
	var url = window.location.href;
	//iphone要引入特殊样式文件
	if ((platform == 0) && (url.indexOf("index.html") == -1) && (url.indexOf("head.html") == -1)){
		$("head").append('<link type="text/css" rel="stylesheet" charset="utf-8" href="../css/iphone.css" >');
	}
});

/***************************************************************************
 *-----------基础应用-----------*
***************************************************************************/
Namespace.register("COM.UTILS"); 
/**
 * 请求名品折扣API
 * 
 * @param {json}
 *            params 请求的参数键值对
 * @param {Object}
 *            cb_success 成功时的回调函数,参数为JSON应答数据
 * @param {Object}
 *            cb_fail 错误时的回调函数，参数为JSON应答数据：
 *  {
	 “ret_code”: 81,
	 “error_info”: “积分不够”
}

 */

COM.UTILS.post_mpzkApi = function (params, cb_success, cb_fail) {
	var pos = COM.SESSION.getPos();
	var lon = pos == null ? "" : pos.lon;
	var lat = pos == null ? "" : pos.lat;
	var cityid = window.localStorage.getItem("SESSION_CONST_CITY_INFO") == null ? "" : COM.SESSION.getCityInfo().cityID;
	params = $.extend({}, {"x_accessid":COM.SESSION.getAccessID(),"x_userID":COM.SESSION.getUID(),"x_TID": 55,"log_info":"uid-"+COM.SESSION.getUID()+",city_id-"+cityid+",lon-"+lon+",lat-"+lat}, params || {});
	COM.UTILS.log(JSON.stringify(params));
	var cmd = params.cmd;
	$.ajax({
   		type: "POST",
   		url: COM.CONST.MPZKAPI_URL + "?jsonp=?",
   		data: params,
   		dataType:"jsonp",
		timeout:10000,
   		success: function(data){
//   			alert("传入参数："+ JSON.stringify(params));
//   			alert("应答回来-" + cmd);
//   			alert("应答数据：- " + JSON.stringify(data));
			COM.UTILS.log("params-" + cmd);
   			COM.UTILS.log("应答回来-" + cmd);
   			COM.UTILS.log("应答数据(cugle)：- " + JSON.stringify(data));
   			var retCode = data.ret_code;
			if (parseInt(retCode) == 0) {
				if (cb_success) {
					cb_success(data);
				}
			}else{
				if (cb_fail) {
					cb_fail(data);
				}
			}
		},
   		error: function(msg,text){
   			COM.UTILS.log("超时无应答-" + cmd + "-" + text);
   			if (cb_fail) {
					cb_fail({"ret_code":81,"error_info":"超时无应答"});
				}
			return false;
   		}
	});
}

/**
 * 请求名品折扣API
 * 
 * @param {json}
 *            params 请求的参数键值对
 * @param {Object}
 *            cb_success 成功时的回调函数,参数为JSON应答数据
 * @param {Object}
 *            cb_fail 错误时的回调函数，参数为JSON应答数据：
 *  {
	 “ret_code”: 81,
	 “error_info”: “积分不够”
}

 */

COM.UTILS.post_mpzkApi_51wxs = function (params, cb_success, cb_fail) {
	var homelistdata='{ret_code:0,total_count:6,brands:[{id:"2816718949507399712",name:"纹绣名师网",pic:"236126537_3105979_0_18.jpg",discount_count:4,brand_type:0},{id:"2800729708329697664",name:"纹绣学院",pic:"230206501_3095685_0_11.jpg",discount_count:0,brand_type:0},{id:"2800764812196315264",name:"找纹绣师,pic:"230203695_3095488_0_11.jpg",discount_count:0,brand_type:0}]}';
	cb_success(homelistdata);
}
/**
 * 打开一个新的窗口，windowname窗口名称，url窗口的url；
 * 由于是如果windowname存在就不会重新加载，所以要传名称。
 * pagetype换页方式的参数，具体如下不传默认为2
 * 0	无
 * 1	从左往右
 * 2	从右往左
 * 3	从上到下
 * 4	从下到上
 * 5	淡入淡出
 * 6	向左飞溅
 * 7	向右飞溅
 * */
COM.UTILS.openWindow = function(windowName,url,pagetype){
	if(typeof(pagetype) == "undefined"){
		pagetype = 10;
	}
	//如果html文件进行了加密，最后一个参数值为0x2，否则为0x0
	uexWindow.open(windowName,'0',url,pagetype,'','',0x0);
}
/*用于一级页面的返回键拦截，让其弹出退出程序的提示
 * 
 * **/
COM.UTILS.ReturnKeySet = function(cb){
	uexWindow.onKeyPressed = function(keyCode) {
		if (keyCode == '0') {
			if(cb)
				cb();
//			COM.UTILS.exit();
		}
	}
	uexWindow.setReportKey('0', '1');
}
COM.UTILS.exit = function(){
	var params = {"cmd":"2A02","access_id":COM.SESSION.getAccessID(),"uid":COM.SESSION.getUID()};
	COM.UTILS.post_mpzkApi(params,function(json){
		COM.UTILS.log("exit success");
	},function(json){
		COM.UTILS.log("exit error"+json.error_code);
	});
	setTimeout(function(){
		uexWidgetOne.exit();
	},100);
}
/**用于子菜单栏改变样式的js，传入当前对象
 * */
COM.UTILS.navClickEvent = function(obj){
	//如果此事件是通过左右滑动页面时触发的，必须用此调用方法，因为左右滑动事件是绑定在main.html页面中的，如果不用此调用方法，
	//执行代码都没有问题，但是样式无法起作用
	var temp = obj.id == undefined ? obj : obj.id;
	uexWindow.evaluateScript("", "1","COM.UTILS._navClickEvent('"+ temp + "');");
}
COM.UTILS._navClickEvent = function(id){
	COM.UTILS.log("id is " +id);
	obj = document.getElementById(id);
	if($(obj).children().hasClass("checked")) return;
	$(obj).siblings().children().removeClass("checked").addClass("unchecked");
	$(obj).children().addClass("checked").removeClass("unchecked");
}
/**
 * 实现排序类页面的左右滑动效果
 * @param {} labelID
 * @param {} dir
 */
COM.UTILS.orderListPageTouchmoveH = function(labelID,dir){
	uexWindow.evaluateScript("", "1","COM.UTILS._orderListPageTouchmoveH('"+ labelID + "'," + dir + ");");
}
COM.UTILS._orderListPageTouchmoveH = function (labelID,dir){
	var ul = $("#"+labelID);
    var cur = ul.find(".checked");
	if(dir == 1){//向左滑
   		var next = cur.parent().next("li");
   		if(next.length > 0){
   			next.triggerHandler("touchstart");
   		}else{
   			ul.children(":first").triggerHandler("touchstart");
   		}
   }else{//向右滑
   		var prev = cur.parent().prev("li");
   		if(prev.length > 0){
   			prev.triggerHandler("touchstart");
   		}else{
   			ul.children(":last").triggerHandler("touchstart");
   		}
   }
	
}
/**用于订阅打钩的动画样式js，传入当前对象
 * */
COM.UTILS.orderCheckEvent = function(id){
	if($("#"+id).children().children().hasClass("logo_order_check")){
		$("#"+id).children().children(".flag_check").removeClass("logo_order_check").addClass("logo_order_uncheck");
	}else {
		$("#"+id).children().children(".flag_check").removeClass("logo_order_uncheck").addClass("logo_order_check");
	}
}
COM.UTILS.changeMenu = function(nowid){
	$("#shangcheng").removeClass("footer_shangcheng_select");
	$("#sousuo").removeClass("footer_sousuo_select");
	$("#pinpaiguan").removeClass("footer_pinpaiguan_select");
	$("#dongtai").removeClass("footer_dongtai_select");
	$("#gengduo").removeClass("footer_gengduo_select");
	$("#"+nowid).addClass("footer_"+nowid+"_select");
	
}
/**用于搜索框的focus和退出focus状态时改变搜索按钮的样式，放在启动函数zy_fix()或者$(function(){})里面
 * */
COM.UTILS.searchBtn = function(){
	$(".search_text").focusin(function(){
		$(".btn_search").addClass("btn_search_focus");
	});
	$(".search_text").focusout(function(){
		$(".btn_search").removeClass("btn_search_focus");
	});
}

/**关闭一个窗口的方法（常用于返回方法）,type为关闭窗口的参数
 * -1   -1时代表Open时指定动画的方向动画
 * 0	无
 * 1	从左往右
 * 2	从右往左
 * 3	从上到下
 * 4	从下到上
 * 5	淡入淡出
 * 6	向左飞溅
 * 7	向右飞溅
 * */
COM.UTILS.closeWindow = function(type){
	type = typeof(type) == "number"? type : 14;
	if(typeof(pageUnload) == "function"){
		pageUnload();
	}
	uexWindow.close(type);
}
/**
 * 用于设置标题头的函数，传入对应title id和内容content
 * */
COM.UTILS.setTitle = function(id,content){
	uexWindow.evaluateScript("", "1",'COM.UTILS._setTitle(\''+ id +'\',\'' + content +'\');');
}
COM.UTILS._setTitle = function(id,content){
	$("#"+id).text(content);
}
/**
 * 判断move状态的函数
 * */
COM.UTILS.touchMoveEvent = function(){
	COM.CONST.ISMOVE = true;
}
/**
 * 判断end状态的函数,和回调，para json格式的参数{"index":1;"type:"2},
 * cbTouchendEvent回调函数，在各子页面定义并传入
 * */
COM.UTILS.touchendEvent = function(para,cbTouchendEvent){
		if(COM.CONST.ISMOVE){
			COM.CONST.ISMOVE=false;
		}else{
			if("" != para){
				cbTouchendEvent(para);
			}else{
				cbTouchendEvent();
			}
		}
	}
/**
 * 用于列表的判断ontouch状态的字符串
 * */
COM.UTILS.getListBindEventString = function(str){
	return 'ontouchmove="COM.UTILS.touchMoveEvent();" ontouchend="COM.UTILS.touchendEvent(' + str + ');"';
//	return 'ontouchmove="COM.UTILS.touchMoveEvent();" onclick="COM.UTILS.touchendEvent(' + str + ');"';
}
/**
 * 获取经纬度信息,cb 回调函数
 * **/
COM.UTILS.getLocation = function(cb){
	COM.UTILS.log("开始获取经纬度");
//	window.localStorage.setItem("SESSION_CONST_LOCATION",JSON.stringify({"lon":118.141,"lat":24.531,"date":new Date().getTime()}));
	var pos = window.localStorage.getItem("SESSION_CONST_LOCATION");
	if(pos != null){
		COM.UTILS.log("历史记录不为空，获取历史记录");
		pos = JSON.parse(pos);
		var diff = new Date().getTime() - pos.date;
		if(diff > COM.CONST.POSITION_TIMEOUT){
			COM.UTILS.log("位置信息过期，重新定位");
			if(cb){
				COM.CONST.LOC_CB = cb;
				COM.UTILS.openLocation();
			}
		}else{
			COM.UTILS.log("定位时间未过期，使用session数据");
			if(cb){
				COM.UTILS.log("有回调函数");
				cb(pos);
			}else{
				return JSON.parse(pos);
			}
		}
	}else{
		COM.UTILS.log("历史记录为空，开始定位");
		if(cb){
			COM.CONST.LOC_CB = cb;
			COM.UTILS.openLocation();
		}
	}
}
COM.UTILS.openLocation = function(){
	uexLocation.openLocation();
}
COM.UTILS.initLocation = function(){
	uexLocation.onChange = COM.UTILS.locationCallBack;
}
COM.UTILS.locationCallBack = function(lat,lon){
	var pos;
	if(lon == 0 && lat == 0){//定位失败，默认到厦门
		COM.UTILS.log("定位失败，将其默认到厦门");
		COM.DIALOG.alert("\u5bf9\u4e0d\u8d77\uff0c\u5b9a\u4f4d\u5931\u8d25\uff0c\u5c06\u5b9a\u4f4d\u5730\u70b9\u8bbe\u7f6e\u4e3a\u53a6\u95e8");
//		COM.DIALOG.alert("对不起，定位失败，将定位地点设置为厦门");
		lon = 118.141;
		lat = 24.531;
	}else{
		COM.UTILS.log("定位成功:lon:" + lon + " lat："+lat);
		setTimeout(function(){//关闭定位后把加载回调的判断COM.CONST.LOCATION_FLAG置为true下次启动调用定位继续启用回调
			COM.UTILS.log("关闭定位，停止接受push信息");
			uexLocation.closeLocation();
			COM.CONST.LOCATION_FLAG = true;
		},1000*10);
	}
		COM.UTILS.changeGPSInfo(lon,lat);
}
/***
 * gps经纬度形变的方法
 * @param {} lon
 * @param {} lat
 */
COM.UTILS.changeGPSInfo = function(lon,lat){
	COM.UTILS.log("进行GPS形变，形变前经纬度:lon:" + lon + " lat："+lat);
	var params = {"cmd":"yaxon.bss.gpschange","lnglat":lon+"_"+lat,"changetype":1}
	COM.UTILS.post_mpzkApi(params,function(json){
		COM.UTILS.log("形变成功:lon:" + json.lng + " lat："+json.lat);
		COM.UTILS.saveGPSAndCallBack(json.lng,json.lat);
	},function(json){
		COM.UTILS.log("形变失败使用原始经纬度，lon:" + lon + " lat："+lat);
		COM.UTILS.saveGPSAndCallBack(lon,lat);
	});
}
/***
 * 保存形变经纬度并执行回调函数的方法
 * @param {} lon
 * @param {} lat
 */
COM.UTILS.saveGPSAndCallBack = function(lon,lat){
	COM.UTILS.log("保存形变结果并执行回调，lon:" + lon + " lat："+lat);
	pos = {"lon":lon,"lat":lat,"date":new Date().getTime()};
	window.localStorage.setItem("SESSION_CONST_LOCATION",JSON.stringify(pos));
	//saveInfo2File();
	if(COM.CONST.LOC_CB != ""){
		if(COM.CONST.LOCATION_FLAG){//一个页面只加载一次回调数据
			COM.UTILS.log("执行回调函数");
			COM.CONST.LOCATION_FLAG = false;
			COM.CONST.LOC_CB(pos);
		}
//		COM.CONST.LOC_CB = "";//清空回调函数
	}else{
		COM.UTILS.getLocation();
	}
}
/**
 * 根据经纬度获取城市信息
 * @param {} pos:位置信息
 * @param {} cb：回调函数，回调参数为json格式，{cityID:2355,cityName:厦门}
 * @param {} chgcb：回调函数2，用于如果需要切换城市时，执行城市切换后要执行的函数
 */
COM.UTILS.getCityGPSCityInfo = function(pos,cb,chgcb){
	var params = {"cmd":"0003","show_center":"1","lon":pos.lon,"lat":pos.lat};
	COM.UTILS.post_mpzkApi(params,function(json){
		COM.UTILS.log("area area code:"+json.area.area.code);
		COM.UTILS.log("area code:"+json.area.code);
		var cityinfo = COM.SESSION.getCityInfo();
		if(cityinfo != null){
			if(cityinfo.cityID != json.area.area.code && cityinfo.cityID != json.area.code && COM.CONST.CHECKCITY_FLAG){
					COM.CONST.CHECKCITY_FLAG = false;
					var GPSCityName =typeof json.area.area.name == "undefined" ?  json.area.name : json.area.area.name;
//					COM.DIALOG.confirm("\u5f53\u524d\u5b9a\u4f4d\u57ce\u5e02\u4e0e\u60a8\u4e0a\u6b21\u9009\u4e2d\u7684\u4e0d\u540c\uff0c\u662f\u5426\u5207\u6362\u5230\u5b9a\u4f4d\u57ce\u5e02\uff1f",function(){
//					COM.DIALOG.confirm("当前定位城市("+ GPSCityName +")与您上次选中的城市(" + cityinfo.cityName + ")不同，是否切换到" + GPSCityName + "？",function(){
					COM.DIALOG.confirm("\u5f53\u524d\u5b9a\u4f4d\u57ce\u5e02\x28"+ GPSCityName +"\x29\u4e0e\u60a8\u4e0a\u6b21\u9009\u4e2d\u7684\u57ce\u5e02\x28" + cityinfo.cityName + "\x29\u4e0d\u540c\uff0c\u662f\u5426\u5207\u6362\u5230" + GPSCityName + "\uff1f",function(){
					COM.UTILS.saveCityInfo(json,1,chgcb);
//					COM.CONST.CHECKCITY_FLAG = true;
				},function(){
//					COM.CONST.CHECKCITY_FLAG = true;
					COM.UTILS.saveCityInfo(json,0);
				});
			}else{
				COM.UTILS.saveCityInfo(json,0);
			}
		}else{
			COM.UTILS.saveCityInfo(json,1);
		}
		if(cb) cb(json);
	},function(json){
		COM.DIALOG.alert(json.error_info);
	});
}

/**
 * 用于判断定位城市切换时是否切换到当前城市，type=1就改变，0不改变,chgcb城市切换后要执行的函数
 * **/
COM.UTILS.saveCityInfo = function(json,type,chgcb){
		if(typeof(json.area.area.code) != "undefined"){
			if(type == 1){
				COM.SESSION.setCityInfo(json.area.area.code,json.area.area.name,json.area.area.center_lon,json.area.area.center_lat);
			}
			window.localStorage.setItem("SESSION_CONST_CITY_INFO_GPS",JSON.stringify({"cityID":json.area.area.code,"cityName":json.area.area.name}));
		}else{
			if(type == 1){
				COM.SESSION.setCityInfo(json.area.code,json.area.name,json.area.center_lon,json.area.center_lat);
			}
			window.localStorage.setItem("SESSION_CONST_CITY_INFO_GPS",JSON.stringify({"cityID":json.area.code,"cityName":json.area.name}));
		}
		if(chgcb){
			chgcb();
		}
}
/***
 * 对字符进行编码
 * @param {} str
 * @return {}
 */
COM.UTILS.encodeURIComponent = function(str){
	return encodeURIComponent(str);
}
/***
 * 对字符进行解码
 * @param {} str
 * @return {}
 */
COM.UTILS.decodeURIComponent = function(str){
	return decodeURIComponent(str);
}
/***
 * 用于自动加载页面数据（自动翻页）
 * @param {} cb 要执行的函数执行函数
 */
COM.UTILS.autoChangePage = function(cb){
	var appendFlag = true;
	$(document).ready(function () {
		addheight = $("#header").height() - 1;
	    $(document).scroll(function () {
	  		/*判断窗体高度与竖向滚动位移大小相加 是否 超过内容页高度*/
//	        if (($("body").height() > 0) && (($(window).height() + $(window).scrollTop()) > ($("body").height()+addheight))) {
	        if (appendFlag  && ($("body").height() > 0) && (($(window).height() + $(window).scrollTop()) > ($("body").height()+addheight))) {
	        	appendFlag = false;
	        	COM.UTILS.log("in autoChangePage");
	           if(cb) cb();
	           setTimeout(function(){
	        	   appendFlag = true;
	           },1000);
	        }
	    });
	});
}
/**
 * 判断是否打印日志的方法
 * */
COM.UTILS.log = function(str){
	if(true){
		console.log(str);
		uexLog.sendLog(str);
//		alert(str);
	}
}
/**
 * 用于判断屏幕的分辨率的宽度是否是320px
 */
COM.UTILS.isWidth320 = function(){
	var width = $("html").width();
	if(width <450 && width > 0){
		return true;
	}else{
		return false;
	}
}
/**
 * 用于给iphone随机生成一个id的函数
 */
COM.UTILS.getRandomIDForIphone = function(){
	return Math.random().toString().split(".")[1];
}
/*-----------------------------------------------------------------------------------------*/
Namespace.register("COM.SESSION"); 
/**
 * 获取当前城市id
 */
COM.SESSION.getCityInfo = function(){
	var cityinfo = window.localStorage.getItem("SESSION_CONST_CITY_INFO");
	if(cityinfo != null){
		COM.UTILS.log("SESSION_CONST_CITY_INFO 不为空");
		return JSON.parse(cityinfo);
	}else{
		COM.UTILS.log("SESSION_CONST_CITY_INFO 为空");
		COM.UTILS.getLocation(COM.SESSION._getCityInfo);
	}
}
COM.SESSION._getCityInfo = function(pos){
	COM.UTILS.getCityGPSCityInfo(pos,function(){
		COM.SESSION.getCityInfo();
	});
}
/**
 * 存储选择城市的信息
 */
COM.SESSION.setCityInfo = function(cityid,cityname,center_lon,center_lat){
	window.localStorage.setItem("SESSION_CONST_CITY_INFO",JSON.stringify({"cityID":cityid,"cityName":cityname,"center_lon":center_lon,"center_lat":center_lat}));
	saveInfo2File();
}
/**
 * 获取通过session经纬度信息，不判断位置信息是否过期
 */
COM.SESSION.getPos = function(){
	var pos = window.localStorage.getItem("SESSION_CONST_LOCATION");
	if(pos != null){
		return JSON.parse(pos);
	}else{
		pos = null;
		var city = window.localStorage.getItem("SESSION_CONST_CITY_INFO");
		if(null != city){
			city = JSON.parse(city);
			if(city.center_lon){
				pos = {"lon":city.center_lon,"lat":city.center_lat,"date":new Date().getTime()};
			}
		}
		return pos;
	}
}
/**
 * 获取登录用户的id
 */
COM.SESSION.getUID = function(){
	var uid = window.localStorage.getItem("SESSION_CONST_UID");
		if(uid != null){
		COM.UTILS.log("SESSION_CONST_UID 不为空");
		return uid;
	}else{
		return null;
	}
}
/**
 * 获取登录用户的日志id
 */
COM.SESSION.getAccessID = function(){
	var aid = window.localStorage.getItem("SESSION_CONST_ACCESSID");
	if(aid != null){
		aid = JSON.parse(aid);
		COM.UTILS.log("SESSION_CONST_ACCESSID 不为空");
		return aid.access_id;
	}else{
		COM.UTILS.log("SESSION_CONST_ACCESSID 为空");
	}
}

/*-----------------------------------------------------------------------------------------*/
Namespace.register("COM.STRINGUTIL");
/**
 * 解析折扣描述形成html内容，如满X送X
 * @param {} tmpl
 * @param {} tmpl_params
 * @return {}
 */
COM.STRINGUTIL.parseFavContent = function(tmpl,tmpl_params){
	if($.trim(tmpl_params).length<1){
		return tmpl;
	}
	var a_t_p=tmpl_params.split(",");	
	for(var i=0,ilen=a_t_p.length;i<ilen;i++){
		tmpl=tmpl.replace("$p"+(i+1),"<span class='font_strong'>"+a_t_p[i]+"</span>");
	}
	return tmpl;
}
/**
 * 
 * @param {}
 *            str
 * @return {Boolean}
 */
COM.STRINGUTIL.isEmpty = function(str) {
	if(typeof(str) === 'undefined' || null === str)
		return true;
	if(typeof(str) === 'string') {
		return str.length === 0;
	}
	return false;
}
/**
 * 保留小数点后几位数字
 * @param {} str
 * @param {} num
 */
COM.STRINGUTIL.formatFloat=function (str,num){
	if(COM.STRINGUTIL.isEmpty(str)) return 0;
	return Math.round(str*Math.pow(10,num))/Math.pow(10,num);
}
/**
 * 格式化距离
 * @param {} d： 距离
 * @return XX米或XX公里
 */
COM.STRINGUTIL.formatDistance=function (d){
	if(d < 1000){
		return COM.STRINGUTIL.formatFloat(d,0) + '\u7c73';
//		return COM.STRINGUTIL.formatFloat(d,0) + '米';
	}else{
		return COM.STRINGUTIL.formatFloat((d/1000),1) + '\u516c\u91cc';
//		return COM.STRINGUTIL.formatFloat((d/1000),1) + '公里';
	}
}
/**
 * 截断字符串，当超过规定长度len时就会在末尾加上suffix字符串
 * @param {} str	源字符串
 * @param {} len	子字符串字节长度
 * @param {} suffix 字符串后缀
 * @return {}
 */
COM.STRINGUTIL.getSubString = function(str,len,suffix){
	var t1 = str.replace(/([\u0391-\uffe5])/ig, '$1a');
	if(t1.length<len){
		return str;
	}
	var t2 = t1.substring(0, len);
	var t3 = t2.replace(/([\u0391-\uffe5])a/ig, '$1');
	if(t1.length>len) t3+=suffix;
	return t3;
}
/*-----------弹出框-----------*/
Namespace.register("COM.DIALOG");
/**msg:alert的内容
 * */
COM.DIALOG.alert = function(msg){
	uexWindow.alert("\u63d0\u793a",msg,"\u786e\u5b9a");
}
/**msg:confirm内容
 * okcb:点击确定执行的方法
 * cancelcb:点击取消执行的方法
 * */
COM.DIALOG.confirm = function(msg,okcb,cancelcb){
	uexWindow.cbConfirm = function(opId,dataType,data) {
		if (data == 0) {
			if(okcb){
				okcb();
			}
		}else{
			if(cancelcb){
			cancelcb();
			}
  	 	}
	};
	var button =  "\u786e\u5b9a\x3b\u53d6\u6d88".split(";");
//	var button =  "确定;取消".split(";");
	uexWindow.confirm('\u63d0\u793a', msg, button);
//	uexWindow.confirm('提示', msg, button);
//	if(confirm(msg)){
//		if(okcb)okcb();
//	}else{
//		if(cancelcb) {
//			cancelcb();
//		}
//	}
}
/**弹出一个等待框
 * msg:wait内容
 * time：持续时间，为空默认不消失(ms)
 * */
COM.DIALOG.waiting = function(msg,time){
	var etime = "";
	if(time) etime = time;
	uexWindow.toast('1','5',msg,etime);
}
/**
 * 关闭等待框
 * */
COM.DIALOG.closewaiting = function(){
	uexWindow.closeToast();
}

function saveInfo2File(){//保存一些信息到文件中
	var pobj;
	if(window.localStorage.getItem("SESSION_CONST_PROFITCODE")){
		pobj={"imei":window.localStorage.getItem("SESSION_CONST_IMEI"),"uid":window.localStorage.getItem("SESSION_CONST_UID"),"city":JSON.stringify(COM.SESSION.getCityInfo()),"pcode":window.localStorage.getItem("SESSION_CONST_PROFITCODE")};
	}else{
		pobj={"imei":window.localStorage.getItem("SESSION_CONST_IMEI"),"uid":window.localStorage.getItem("SESSION_CONST_UID"),"city":JSON.stringify(COM.SESSION.getCityInfo())};
	}
//	console.log("保存的信息:"+JSON.stringify(pobj));
	COM.FILECACHE.saveFileContent("info",JSON.stringify(pobj),function(pdata){},function(pdata){},true);
	//COM.UTILS.log("saveInfo2File in home.html,save data is ok...");
}
var bling = [false,false,false];		// 图片，缓存文件读取，保存缓存文件
var cachecount = [0,0,0];