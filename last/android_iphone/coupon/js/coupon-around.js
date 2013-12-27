 var ori_page = 0;//子页面切换的默认初始化pageid
 var m_curpage = 1;//用于存放不同目录下的子页面的页码
 var m_scrollArray=[null];//用于存放不同页面下的iscroll
 var data;//用于页面间参数传递
 var totalCnt = 0
$(function(){
});

function loadData(){
	COM.UTILS.setTitle("title",data.name);
	uexWindow.toast('1','5','加载中...',"");
	COM.UTILS.getLocation(loadDataFromServer);
}
/**
 * 从服务器获取数据
 * **/
function loadDataFromServer(pos){
		var params = {"cmd":2607,"city_id":COM.SESSION.getCityInfo().cityID,"uid":COM.SESSION.getUID(),"brand_id":data.id,"page_no":m_curpage,"lon":pos.lon,"lat":pos.lat,"radius":10*1000,"page_count":COM.CONST.COUNT_PER_PAGE};
		COM.UTILS.post_mpzkApi(params,function(json){
			parseStoreResult(json);
		},function(json){
			uexWindow.closeToast();
//			$("#couponlist").html(json.error_info);
			$("#storelist").html('<div class="nulldiv"><span class="nullpic"></span></div>');
		});
}

/**
 * 解析数据
 * **/
function parseStoreResult(json){
	totalCnt = parseInt(json.total_count);
	if(totalCnt > 0){
		var a = [];
		var b = [];
		var distance = "";
		for(var i = 0; i<json.coupon_stores.length; i++){
			var list = json.coupon_stores[i];
			var distance = typeof(list.distance) == "undefined" ? "-" : list.distance;
			var event = COM.UTILS.getListBindEventString('{\'lon\':'+ list.lon +',\'lat\':' + list.lat +'},cbOntouchend');
			a.push('<li ' + event + ' >');
			a.push('	<div class="lleft">');
			a.push('		<img class="lleft_img x-lazyImg" src="../css/images1/mr0.png" x-picWidth="80" x-picHeight="80" x-picId="'+ json.brand_pic +'"/>');
			a.push('	</div>');
			a.push('	<div class="lc">');
			a.push('		<div class="lc_title">' + list.address + '</div>');
			a.push('	</div>');
			if(typeof(list.distance) != "undefined"){
				distance = COM.STRINGUTIL.formatDistance(list.distance);
			}else{
				distance = "- 公里";
			}
			a.push('	<div  class="lc_distance">' + distance + '</div>');
			a.push('</li>');
		}
		$("#storelist").append(a.join(''));
		if(m_curpage < Math.ceil(totalCnt/COM.CONST.COUNT_PER_PAGE) && m_curpage < COM.CONST.MAXPAGE){
			$("#pullUp_"+ori_page+" > span").html("向上拉动加载更多...");
			$("#pullUp_"+ori_page).parent().show();
		}else{
			$("#pullUp_"+ori_page).parent().hide();
		}
		COM.UTILS.loadedIscroll(m_scrollArray,"page_","scroll_",ori_page,COM.IMGLOAD.lazyLoadImg,"pullUp_",nextPage);
		COM.IMGLOAD.lazyLoadImg($("#scroll_"+ori_page));
//		COM.IMGLOAD.lazyLoadImg($("#storelist"));
	}else{
		$("#storelist").html('<div class="nulldiv"><span class="nullpic"></span></div>');
	}
	uexWindow.closeToast();
}
function cbOntouchend(para){
	uexWindow.toast("1","5","地图加载中，请稍候...","");
	uexWindow.evaluateScript('', '0', "COM.UTILS.openWindow('baidumap','../util/baidumap.html?lon=" + para.lon + '&lat=' + para.lat + "')");
	setTimeout(COM.DIALOG.closewaiting,2000);
}	
function nextPage(){
	if(m_curpage < Math.ceil(totalCnt/COM.CONST.COUNT_PER_PAGE) && m_curpage < COM.CONST.MAXPAGE){
		m_curpage++;
		COM.UTILS.getLocation(loadDataFromServer);
//		$("#nextPage").html("正在加载下" + COM.CONST.COUNT_PER_PAGE + "条数据");
	}
}
function closeWindow(){
	uexWindow.evaluateScript('coupon-detail', '0', 'closeWindow()');
	setTimeout(function(){
		COM.UTILS.closeWindow(-1);
	},1000);
}