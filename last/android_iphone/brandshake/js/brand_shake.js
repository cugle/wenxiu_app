var M_isload = true;//判断当前数据如果没有返回，就不能执行下一次的操作
var M_url = "wgt://1.wav";
var M_sounded = 0;
var M_Xdirection = 0;
var M_Ydirection = 0;
var M_Zdirection = 0;
var M_shakeCount = 1;//活动中可以摇动的次数
var M_json = "";
/***
 * 用于捕获摇动事件的函数。xyz表示xyz轴的加速度
 * @param {Object} x
 * @param {Object} y
 * @param {Object} z
 */
function orientation(x, y, z){
	if(((M_Xdirection > 5 && x < -5) || (M_Ydirection > 4 && y < -4)) || ((M_Xdirection < -5 && x > 5) || (M_Ydirection < -4 && y > 4))){
		if(!$("#shake_area").children().hasClass("shake_bottompic") && M_isload){
			M_isload = false;
			$("#shake_area").append('<div class="shake_bottompic"></div>');
			loadDataFromServer();
			uexDevice.vibrate(500);//震动500ms
//			uexAudio.open(M_url);
//			uexAudio.play();
		}
	}
	M_Xdirection = x;
	M_Ydirection = y;
	M_Zdirection = z;
}
/***
 * 用于生产一个随机数的函数，min和max表示生成的最小值和最大值。
 * @param {Object} min
 * @param {Object} max
 */
function getRandPoint(min,max){
	var Range = max - min;   
	var Rand = Math.random();
	var result = min + Math.round(Rand * Range);
	return result;
}
/***
 * 用于适配不同分辨率下产生不同个数和不同位置的随机数据源。
 */
function checkScreen(number){
	var height = $("html").height();
	var width = $("body").width();
	var total = 0;//显示的品牌的个数
	var baseTop = 0;
	var baseLeft = 0;
	var lineNumTop = 0;
	var lineNumLeft = 0;
	if(width < 700 && width >0){
		lineNumTop = 3;
		lineNumLeft = 3;
		total = 9;
	}else{
		lineNumTop = 4;
		lineNumLeft = 4;
		total = 16;
		
	}
	if(number != 0){
		lineNumTop = 3;//竖直个数
		lineNumLeft = Math.ceil(number/3);//水平个数
		if(width > 700){
			lineNumTop = 4;//竖直个数
			lineNumLeft = Math.ceil(number/4);//水平个数
		}
		console.log("linNumTop is " + lineNumTop);
		console.log("linNumLeft is " + lineNumLeft);
		total = number;
	}
	baseTop = parseInt((height-parseInt($("#header").height()))/lineNumTop);
	baseLeft = parseInt((width-20)/lineNumLeft);
	return total + "," + baseTop + "," + baseLeft;
}
/***
 * 用于处理产生随机数后生成随机的（top和left和旋转角度）div数据源。
 */
function getPointList(number){
	var PointList = [];
	var baseInfo = checkScreen(number).split(",");
	var lineNumber = $("body").width > 700 ? 4 : 3;
	for(var i = 0 ; i < baseInfo[0] ; i ++){
		var direction = getRandPoint(1,8);
		var x = i % lineNumber;
		var y = Math.floor(i / lineNumber) ;
		var top = parseInt(baseInfo[1]) * x + getRandPoint(0,parseInt(baseInfo[1] / 2));
		var left = parseInt(baseInfo[2])*y + getRandPoint(0,parseInt(baseInfo[2] / 2));
		PointList.push(top + "," + left + "," + direction);
	}
	return PointList;
}
function loadDataFromServer(){
		if(M_shakeCount == 0){//次数为0就是没有摇奖次数了
			COM.DIALOG.alert("对不起，您今天已经没有摇奖次数，请明天继续参与~");
			return;
		} 
		uexWindow.toast('1','5',"请稍后~","");
		var width = $("body").width();
		var number = width < 700 && width > 0 ? 9 : 16;
		var pos =  window.localStorage.getItem("SESSION_CONST_LOCATION")
		if(pos != null){
			$.extend(params,{"lon":pos.lon,"lat":pos.lat});
		}
		var params = {"cmd":"2014","city_id":COM.SESSION.getCityInfo().cityID,"uid":COM.SESSION.getUID(),"page_count":number};
		COM.UTILS.post_mpzkApi(params,function(json){
			uexSensor.close(1)
			uexWindow.closeToast();
			M_json = json;
			if (json.act_flag == 1) {//七夕特别活动
				parseQixiActivityResult(json);
			}else if(json.act_flag != 0 && json.act_flag != 1) {//判断是不是活动中~
				parseActivityResult(json);
			}else {//非活动状态
				parseBrandResult(json);
				}
		},function(json){
			uexSensor.close(1)
			uexWindow.closeToast();
			json = {"ret_code": 0,"count": 7,"act_flag":1,"result_pic":"156412581_41878_0_42.jpg","lottery_id":254,"act_count":5,"desp":"“情迷七夕，八千优惠摇礼相送”，恭喜您摇中一等奖-电影票2张，请填好联系方式，我们工作人员将与您联系！（每人限领奖一次，以您最后确认的奖品为准）","level":0,"blog_share":1,"blog_share_rule":"当天分享微博可增加且只增加一次摇一摇机会","brands": [{"id": "2800760486100996352","name": "耐克","pic_2": "237313368_3112137_0_13.jpg","is_valid": 1,"discount_count": 23},{"id": "2800760486100996352","name": "耐克","pic_2": "237313368_3112137_0_13.jpg","is_valid": 1,"discount_count": 23},{"id": "2800760486100996352","name": "耐克","pic_2": "237313368_3112137_0_13.jpg","is_valid": 1,"discount_count": 23},{"id": "2795711885408731169","name": "耐克","pic_2": "156412581_41878_0_42.jpg","is_valid": 1,"discount_count": 23},{"id": "2795711885408731169","name": "耐克","pic_2": "156412581_41878_0_42.jpg","is_valid": 1,"discount_count": 23},{"id": "2795711885408731169","name": "耐克","pic_2": "156412581_41878_0_42.jpg","is_valid": 1,"discount_count": 23},{"id": "2795711885408731169","name": "耐克","pic_2": "156412581_41878_0_42.jpg","is_valid": 1,"discount_count": 23}]};
			M_json = json;
			//parseQixiActivityResult(json);
			COM.DIALOG.alert(json.error_info);
		});
}
/***
 * 七夕特别活动
 * @param {Object} json
 */
function parseQixiActivityResult(json){
	M_shakeCount = json.act_count;
	$("#shake_area").html('<div class="qixi_activity"><img src="../css/images1/tpz.png" style="max-width:80%;" class="x-lazyImg" x-picWidth="320" x-picHeight="110" x-picId="' + json.result_pic + '" /></div>');
	COM.IMGLOAD.lazyLoadImg($("#shake_area"),"H",true);
	setTimeout(function(){
		zhongjiang(json);
	},700);
}
/***
 * 其他特别活动
 * @param {Object} json
 */
function parseActivityResult(json){
	if(json.count == 0){
		$("#shake_area").html('<div class="nulldiv"><span class="nullpic"></span></div>');
		return;
	}
	M_shakeCount = json.act_count;
	var div = getPointList(json.count);
	var html = "";
	var a = [];
	for (var i = 0; i < div.length; i++){
		var top = div[i].split(",")[0];
		var left = div[i].split(",")[1];
		var direction = div[i].split(",")[2];
		a.push("<div id='aa_" + i + "' class='display display_" + direction + "' style='top:" + top + "px;left:" + left + "px;' >"); 
		a.push("	<img src='../css/images1/mr1.png' class='logo x-lazyImg' x-picWidth='110' x-picHeight='110' x-picId='" + json.brands[i].pic_2 + "' />");
		a.push("</div>");
	}
	$("#shake_area").html(a.join(''));
	COM.IMGLOAD.lazyLoadImg($("#shake_area"));
	setTimeout(function(){
		zhongjiang(json);
	},1000);
}
/***
 * 不是活动情况下的操作。
 * @param {Object} json
 */
function parseBrandResult(json){
	if(json.count == 0){
		$("#shake_area").html('<div class="nulldiv"><span class="nullpic"></span></div>');
		return;
	}
	var div = getPointList(json.count);
	var html = "";
	var a = [];
	for (var i = 0; i < div.length; i++) {
		var top = div[i].split(",")[0];
		var left = div[i].split(",")[1];
		var direction = div[i].split(",")[2];
		var event = "";
		if(json.brands[i].is_valid == 1){
			event = COM.UTILS.getListBindEventString('{\'type\':\'brand\',\'id\':\''+ json.brands[i].id +'\',\'name\':\'' + json.brands[i].name+'\'},cbOntouchend0');
		}
		a.push("<div  id='aa_" + i + "' " + event + "class='display display_" + direction + "' style='top:" + top + "px;left:" + left + "px;' >"); 
		a.push("	<img src='../css/images1/mr2.png' class='logo x-lazyImg' x-picWidth='110' x-picHeight='110' x-picId='" + json.brands[i].pic_2 + "' />");
		a.push("</div>");
	}
	$("#shake_area").html(a.join(''));
	COM.IMGLOAD.lazyLoadImg($("#shake_area"));
	setTimeout(function(){
		M_isload = true;
		uexSensor.open(1,3);
	},1000);
}
function cbOntouchend0(para){
	uexWindow.evaluateScript('', '0', "COM.UTILS.openWindow(\'brand-list\',\'../brand/brand-list.html?type=" + para.type +"&id=" + para.id + "&name=" + COM.UTILS.encodeURIComponent(para.name)+ "');");
}
/***
 * 活动中接下来要进行的操作
 * @param {Object} json
 */
function zhongjiang(json){
	if(json.level == 0){
		if(json.blog_share == 1){
			$("#info").removeClass("show").addClass("hide");
			$(".share_blog").removeClass("hide").addClass("show");
			$(".duijiang").removeClass("hide").addClass("show");
			$("#description").html(json.desp);
		}else{
			COM.DIALOG.confirm(json.desp,function(){M_isload = true;uexSensor.open(1,3);},function(){M_isload = true;uexSensor.open(1,3);});
		}
	}else{
		$("#description").html(json.desp);
		$(".duijiang").removeClass("hide").addClass("show");
		$(".share_blog").removeClass("show").addClass("hide");
		$("#info").removeClass("hide").addClass("show");
	}
}

/***
 * 用于生成随机div
 */
function randomDiv(){
	var div = getPointList(1);
	var html = "";
	for (var i = 0; i < div.length; i++) {
		var top = div[i].split(",")[0];
		var left = div[i].split(",")[1];
		var direction = div[i].split(",")[2];
		html += "<div id='aa_" + i + "' class='display display_" + direction + "' style='top:" + top + "px;left:" + left + "px;' ><img class='logo' src='css/images2/" + getRandPoint(1, 9) + ".png'/></div>"
	}
	$("#shake_area").html(html);
	
//	setTimeout(function(){
//		M_isload = true;
//	}, 800);
}
	function openSoundCb(opId,dataType,data){
		if(dataType==2)
			M_sounded = data;
	}

	/***
	 * 发送中奖者信息
	 */
	function submitResult(){
		if($.trim($("#name").val()) == "" || $("#name").val() == null){
			COM.DIALOG.alert("请填写姓名以便我们联系您~");
			return;
		}
		if(!isMobile($.trim($("#phone").val())) && !isTel($.trim($("#phone").val()))){
			COM.DIALOG.alert("请填正确写手机(座机)号以便我们联系您~");
			return;
		}
		uexWindow.toast('1','5',"正在发送您的信息，请稍后~","");
		var params = {"cmd":"2A15","tel":$.trim($("#phone").val()),"id":M_json.lottery_id,"uid":COM.SESSION.getUID(),"action":1,"name":$.trim($("#name").val())};
		COM.UTILS.post_mpzkApi(params,function(json){
			if(json.ret_code == 0){
				uexWindow.closeToast();
				COM.DIALOG.alert("信息记录成功，我们将尽快与您联系");
				if(M_json.blog_share == 1){
					$("#description").html(M_json.blog_share_rule);
					$("#info").removeClass("show").addClass("hide");
					$(".share_blog").removeClass("hide").addClass("show");
				}else{
					$(".duijiang").removeClass("show").addClass("hide");
					M_isload = true;
					uexSensor.open(1,3);
				}
			}
		},function(json){
			uexWindow.closeToast();
			COM.DIALOG.alert(json.error_info);
		});
	}
	/***
	 * 取消奖品
	 */
	function cancelResult(){
		COM.DIALOG.confirm("放弃提交我们将无法联系到您，礼物您将无法收到，确定退出吗？",function(){
			reStore();
			$(".duijiang").removeClass("show").addClass("hide");
			var params = {"cmd":"2A15","action":0,"uid":COM.SESSION.getUID(),"id":M_json.lottery_id};	
			COM.UTILS.post_mpzkApi(params,function(json){
			},function(json){
			});
			uexSensor.open(1,3);
			M_isload = true;
		},function(){
		});
	}
	/***
	 * 取消分享微博
	 */
	function cancelShare(){
		$(".duijiang").removeClass("show").addClass("hide");
		$(".share_blog").removeClass("show").addClass("hide");
		M_isload = true;
		uexSensor.open(1,3);
		reStore();
	}
	function reStore(){
		$("#shake_area").html('<div class="shake_toppic"></div><div class="shake_middpic"></div>');
	}
	/***
	 * 打开分享微博窗口
	 */
	function openShare(){
		uexWindow.toast('1','5',"加载中","1000");
		$(".duijiang").removeClass("show").addClass("hide");
		reStore();
		var tmp={"bmsg":M_json.blog_share_content,"burl":M_json.blog_share_pic,"act_flag":1,"bfrom":"brand-detail"};
		window.localStorage.setItem("sharetext",JSON.stringify(tmp));
		COM.UTILS.openWindow('share','../util/share.html');
		M_isload = true;
		uexSensor.open(1,3);
	}
	/*验证是否是手机号码*/
	function   isMobile(s)  
	{  
		var   patrn=/^1[3458][0-9]{9}$/;
	    return   patrn.test(s);  
	}
	
	/* 验证是否是联系电话，一定要带区号
	 * 匹配3-4位区号，7-8位直播号码，'-'一定要有
	 * */
	function   isTel(s)  
	{  
		var   patrn=/^(\d{3,4}-)\d{7,8}$/;
	    return   patrn.test(s);  
	}
function clickfunction(){
	console.log("111");
	uexWindow.didShowKeyboard = 1;
}
