 var ori_page = 0;//子页面切换的默认初始化pageid
 var m_curpage = 1;//用于存放不同目录下的子页面的页码
 var m_scrollArray=[null];//用于存放不同页面下的iscroll
 var data;//用于页面间参数传递
 var totalCnt = 0;
 var m_hassub = false;
$(function(){
});

function loadData(){
	if(data.type == "search"){//从搜索跳转
		COM.UTILS.setTitle("title","品牌搜索结果");
	}else if(data.type == "add"){//更多品牌
		COM.UTILS.setTitle("title","更多品牌");
	}
	loadDataFromServer();
}
/**从session读取数据
 * **/
function loadDataFromSession(){
	parseBrandResult(JSON.parse(window.localStorage.getItem("SESSION_BRAND_LIST")));
}
/**
 * 从服务器获取数据
 * **/
function loadDataFromServer(){
		uexWindow.toast('1','5','加载中...',"");
		var params = {"cmd":2008,"city_id":COM.SESSION.getCityInfo().cityID,"uid":COM.SESSION.getUID(),"page_no":m_curpage,"page_count":COM.CONST.COUNT_PER_PAGE};
		if(data.type=="search")
			$.extend(params,{"keyword":data.keyword});
		COM.UTILS.post_mpzkApi(params,function(json){
			parseOrderResult(json);
			window.sessionStorage.setItem("SESSION_BRAND_LIST",JSON.stringify(json));
		},function(json){
//			$("#page_"+ori_page).html(json.error_info);
			$("#brand_list"+ori_page).html('<div class="nulldiv"><span class="nullpic"></span></div>');
		});
}

/**
 * 解析数据
 * **/
function parseOrderResult(json){
	totalCnt = parseInt(json.total_count);
	if(totalCnt > 0){
		var a = [];
		var b = [];
		for(var i = 0; i<json.brands.length; i++){
			var list = json.brands[i];
			var favnum = typeof(list.discount_count) == "undefined"? 0 : list.discount_count > 100? 99 : list.discount_count;
			var isorder = list.has_sub == 1? "logo_order_check" : "";
			var event =  COM.UTILS.getListBindEventString('{\'id\':\''+ list.id +'\',\'has_sub\':' + list.has_sub +'},cbOntouchend');
			a.push('<li id="list_' + list.id + '" ' + event + '>');
			a.push('	<div class="lleft">');
			a.push('		<img class="lleft_img x-lazyImg" src="../css/images1/mr0.png" x-picWidth="80" x-picHeight="80" x-picId="'+ list.pic +'"/>');
			a.push('	</div>');
			a.push('	<div class="lc">');
			a.push('		<div class="lc_title lc_title_width">' + list.name + '</div>');
			a.push('		<span class="logo_num search_loc">' + favnum + '</span>');
			a.push('	</div>');
			a.push('	<div class="flag_check hide list_check '+ isorder +'"></div>');
			a.push('</li>');
		}
		$("#brand_list").append(a.join(''));
		if(m_curpage < Math.ceil(totalCnt/COM.CONST.COUNT_PER_PAGE)){
			$("#pullUp_"+ori_page+" > span").html("向上拉动加载更多...");
			$("#pullUp_"+ori_page).parent().show();
		}else{
			$("#pullUp_"+ori_page).parent().hide();
		}
		COM.UTILS.loadedIscroll(m_scrollArray,"page_","scroll_",ori_page,COM.IMGLOAD.lazyLoadImg,"pullUp_",nextPage);
		COM.IMGLOAD.lazyLoadImg($("#scroll_"+ori_page));
		//COM.IMGLOAD.lazyLoadImg($("#brand_list"),"V",true);
	}else{
		$("#brand_list").html('<div class="nulldiv"><span class="nullpic"></span></div>');
	}
	uexWindow.closeToast();
}
function cbOntouchend(para){
	orderCheckEvent("list_" + para.id);
	brand_opt(para.id, para.has_sub);
}
function nextPage(){
	if(m_curpage < Math.ceil(totalCnt/COM.CONST.COUNT_PER_PAGE)){
		m_curpage++;
		$("#nextPage").html("正在获取下"+COM.CONST.COUNT_PER_PAGE+"条数据");
		loadDataFromServer();
	}
//	parseOrderResult();
}
function checkSub(){
	if(!m_hassub) m_hassub = true;
}
/**
 * 用于订阅和取消订阅的方法
 */
function brand_opt(id,code){
	COM.UTILS.log("in brand_opt");
	var msg = code == 0? "订阅中...":"取消订阅...";
	uexWindow.toast('1','5',msg,"");
	var params = {"cmd":2005,"city_id":COM.SESSION.getCityInfo().cityID,"uid":COM.SESSION.getUID(),"action":code,"brand_id":id};
	COM.UTILS.post_mpzkApi(params,function(json){
		checkSub();
		uexWindow.closeToast();
		code = code == 0 ? 1:0;
		$("#list_" + id).attr('ontouchend','COM.UTILS.touchendEvent({\'id\':\''+ id +'\',\'has_sub\':'+ code +'},cbOntouchend);');
		},function(json){
			COM.DIALOG.alert(json.error_info);
			orderCheckEvent("list_"+id);
			uexWindow.closeToast();
		});
}
function closeAndReturn(){
	if(m_hassub)
		uexWindow.evaluatePopoverScript("main","home",'reloadData();');
	COM.UTILS.openWindow('main','../main.html',0);
	setTimeout(function(){
		COM.UTILS.closeWindow(0);
	},1000);
}
function closWindow(){
	if(m_hassub)
		uexWindow.evaluateScript('order-list', '0', 'checkSub();');
	uexWindow.evaluateScript('', '0', 'COM.UTILS.closeWindow()');
}
function orderCheckEvent(id){
	if($("#"+id).children().hasClass("logo_order_check")){
		$("#"+id).children(".flag_check").removeClass("logo_order_check").addClass("logo_order_uncheck");
	}else {
		$("#"+id).children(".flag_check").removeClass("logo_order_uncheck").addClass("logo_order_check");
	}
}