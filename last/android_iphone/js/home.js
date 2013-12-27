 var movearea;
 var m_curpage = 1;//当前页数
 var totalCnt = 0//用于存放当前记录条数
 var isorderback = false;//判断是否从order-list回来，是true否false
$(function(){
	$('#menu').path({ 
		duration: 300//动画时间 
	});
	//toShowDebugMsg(); //显示图片下载的日志
});

function toLoadData(){
	saveInfo2File();
	loadData();
	setTimeout(function(){
		var firstload = window.localStorage.getItem("SESSION_CONST_FIRSTLOAD");
		var firstuse = window.localStorage.getItem("first");
		if(firstload == 1){
			COM.UTILS.getLocation(refreshInfo);
			window.localStorage.setItem("SESSION_CONST_FIRSTLOAD",0);
		}
		if(firstuse == "yes"){
			window.localStorage.setItem("first","no");			
			$("#menu_main").touchstart();//要求添加第一次登录导航按钮处于打开状态
//			showProfitCode();//显示提示信息 //TOD:
		}
	},500);
}
function showProfitCode(){
	if (window.localStorage.getItem("SESSION_CONST_PROFITCODE")) {
		//弹出什么内容
		COM.DIALOG.alert("您已获得兑奖资格，兑奖码是："+window.localStorage.getItem("SESSION_CONST_PROFITCODE")+"。兑奖码可在更多页面查看");
	}
}


function loadData(){
	setHomeTitle();
	//loadDataFromServer();
}
function loadDataForChgCIty(){
	loadData();
}
function setHomeTitle(){
//	COM.UTILS.setTitle("cityName", COM.SESSION.getCityInfo().cityName);
	$("#cityName").html('纹绣一点通|'+COM.SESSION.getCityInfo().cityName);
	$("#cityName_point").show();
}
function reloadData(){
	$("#a2").empty();
	$("#curpage").empty();
	isorderback = true;
	loadDataFromServer();
}
/**
 * 从服务器获取数据
 * **/
function loadDataFromServer(){
		//uexWindow.toast('1','5','加载中...',"");
		//uexWindow.toast('1','5','\u52a0\u8f7d\u4e2d\x2e\x2e\x2e',"");
		var params = {"cmd":2009,"city_id":COM.SESSION.getCityInfo().cityID,"uid":COM.SESSION.getUID(),"page_no":m_curpage,"page_count":COM.CONST.COUNT_LOGO_PER_PAGE};
		
		COM.UTILS.post_mpzkApi(params,function(json){									 
			parseOrderResult(json);
		},function(){
			$("#a2").html('<div class="nulldiv"><span class="nullpic"></span></div>');
			//uexWindow.closeToast();
		});
}

/**
 * 解析数据
 * **/
function parseOrderResult(json){
	
	totalCnt = parseInt(json.total_count);
		
	if(totalCnt > 0){
		var orderlist = json.brands;
		var pageno = 0;
		var a = [];
		var b = [];
		for(var i = 0; i<orderlist.length; i++){
			var link;
			var event;
			var addevent = COM.UTILS.getListBindEventString('{},cbOntouchend3');
			var favnum = orderlist[i].discount_count > 100? 99 : orderlist[i].discount_count;
			if( orderlist[i].brand_type == 0){
				event = COM.UTILS.getListBindEventString('{\'type\':\'brand\',\'id\':\''+ orderlist[i].id +'\',\'name\':\'' + orderlist[i].name+'\'},cbOntouchend0');
			}else if(orderlist[i].brand_type == 1){
				event = COM.UTILS.getListBindEventString('{\'id\':\''+ orderlist[i].id  +'\',\'name\':\'' + orderlist[i].name+'\'},cbOntouchend1');
			}else if(orderlist[i].brand_type == 2){
				event = COM.UTILS.getListBindEventString('{\'id\':\''+ orderlist[i].id  +'\',\'name\':\'' + orderlist[i].name+'\',\'alias\':\''+ orderlist[i].alias +'\'},cbOntouchend2');
			}
			if(i % 9 == 0){
				a.push('<section><ul>');
				b.push('<li id="chgpage' + pageno + '" class="unc">' + pageno + '</li>');
				pageno++;
			}
			if(i % 3 == 1){
				a.push('<li class="liM"' + event + '>');
			}else{
				a.push('<li ' + event + '>');
			}
			a.push('	<div class="logo_body">');
			a.push('		<img class="logo x-lazyImg" src="css/images1/mr1.png" x-picWidth="110" x-picHeight="110" x-picId="' + orderlist[i].pic + '"/>');
			a.push('		<span class="logo_num logo_num_loc">'+ favnum +'</span>');
			a.push('		<div class="bg_text">'+ orderlist[i].name +'</div>');
			a.push('	</div>');
			a.push('</li>');
			if((i+1) % 9 == 0) a.push("</section>");
		}
		if(orderlist.length % 9 == 0) {//刚好9个就要多添加一次section
			a.push('<section><ul>');
			b.push('<li id="chgpage' + pageno + '" class="unc">' + pageno + '</li>');
			pageno++;
		}
		if(orderlist.length % 3 == 1){
			a.push('<li class="liM"' + addevent + '><img class="logo" src="css/images1/addlogo.png"/></li>');
		}else{
			a.push('<li ' + addevent + '><img class="logo" src="css/images1/addlogo.png"/></li>');
		}
		a.push('</ul></section>');
		$("#a2").html(a.join(''));
		$("#curpage").html(b.join(''));
		loadPointer();
	}else{
		var addevent = COM.UTILS.getListBindEventString('{},cbOntouchend3');
		$("#a2").html('<ul><li ' + addevent + '><img class="logo" src="css/images1/addlogo.png"/></li></ul>');
	}
	uexWindow.closeToast();
}
function cbOntouchend0(para){
	uexWindow.evaluateScript('', '0', "COM.UTILS.openWindow(\'brand-list\',\'brand/brand-list.html?type=" + para.type +"&id=" + para.id + "&name=" + COM.UTILS.encodeURIComponent(para.name)+ "');closeMenu();");
}	
function cbOntouchend1(para){
	uexWindow.evaluateScript('', '0', "COM.UTILS.openWindow(\'coupon-list\',\'coupon/coupon-list.html?id=" + para.id + "&name=" + COM.UTILS.encodeURIComponent(para.name) + "');closeMenu();");
}	
function cbOntouchend2(para){
	uexWindow.evaluateScript('', '0', "COM.UTILS.openWindow(\'cardfav-list\',\'creditcard/cardfav-list.html?id=" + para.id + "&name=" + COM.UTILS.encodeURIComponent(para.name) + "&alias=" + COM.UTILS.encodeURIComponent(para.alias) + "');closeMenu();");
}	
function cbOntouchend3(para){
	uexWindow.evaluateScript('', '0', "COM.UTILS.openWindow(\'order-list\',\'order/order-list.html\');closeMenu();");
}	
/**
 * 声明滑动翻页的函数
 * */
function loadPointer() {
	if(typeof(movearea) != "undefined"){
		movearea.destroy();
	}
	movearea = new zyFlip("a2", "H","","","",changePagePoint);
}

/**
 * 改变翻页圆点样式
 * */
function changePagePoint(){
	if(isorderback){
		movearea.currentPoint = Math.ceil(totalCnt/9)-1;
		movearea.toIndex(movearea.currentPoint);
		isorderback = false;
	}
	$("#chgpage"+movearea.currentPoint).siblings(".cur").removeClass("cur");
 	$("#chgpage"+movearea.currentPoint).addClass("cur");
 	setTimeout(function(){COM.IMGLOAD.lazyLoadImg($("#a2"),"H",true);},100);
 	
}
function refreshInfo(pos){
	COM.UTILS.log("refresh City and Gps Info");
	COM.UTILS.getCityGPSCityInfo(pos,function(){
	},function(){
		var timeHandle = null;
		//uexWindow.toast('1','5','\u52a0\u8f7d\u4e2d\x2e\x2e\x2e',"");
		function funLoad(){
			if((!bling[0] && cachecount[0] == 0)){
				clearTimeout(timeHandle);
				loadData();
			}else{
				clearTimeout(timeHandle);
				console.log("waiting...");
				timeHandle = setTimeout(funLoad,1000);
			}
		}
		funLoad();
	});
}
function closeMenu(){
	//if ($("#menu").children(':first').css('display') != 'none') {
	//	setTimeout(function(){
	//		if($("#menu").children(':first').css('display') != 'none'){
	//			$('#menu_main').touchstart();
	//		}
	//	},1500);
	//}
	if ($("#menu").children(':first').attr('flag') != '0') {
		setTimeout(function(){
			if($("#menu").children(':first').attr('flag') != '0'){
				$('#menu_main').touchstart();
			}
		},1500);
	}
}
