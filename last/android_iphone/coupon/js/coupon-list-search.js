 var ori_page = 0;//子页面切换的默认初始化pageid
 var m_curpage = 1;//用于存放不同目录下的子页面的页码
 var m_scrollArray=[null];//用于存放不同页面下的iscroll
 var data;//用于页面间参数传递
 var totalCnt = 0;//用于返回条数的记录（给详情页面使用）
 var m_count = 0;//用于存放记录条数目(即对每条记录进行计数才不会出现翻页后m_curpage改变的情况)
 var m_scrollid = "";//记录详情页面返回来的的条目id
 var m_isscroll = false;//用于判断是否滚动到相应条目
 var m_cacheFileName = "tmp_coupon_0_c";
var m_isFirst=true;//是否是第一次进入
$(function(){
//	parseCouponResult();
});
function loadData(){
	uexWindow.toast('1','5','加载中...',"");
	COM.UTILS.setTitle("title1",data.keyword+"搜索结果");
	loadDataFromServer();
}
/**从session读取数据
 * **/
function loadDataFromSession(id){
	COM.UTILS.log("loadDataFromSession id is " +id);
	m_scrollid = "#" + id;
	m_isscroll = true;
	m_count = 0;
	COM.UTILS.log("in loadDataFromSession");
	uexWindow.toast('1','5','加载中...',"");
	$("#couponlist").html("");
	var result;
	COM.FILECACHE.getFileContent(m_cacheFileName, function(pdata){
		if (pdata.msg == "ok" && pdata.data) {
			console.log("缓存文件数据不为空");
			result = pdata.data;
			parseCouponResult(JSON.parse(result));
		}else {
			console.log("缓存文件数据为空");
			result = null;
			$("#couponlist").html('<div class="nulldiv"><span class="nullpic"></span></div>');
		}
	}, function(pdata){
			console.log("获取缓存文件失败");
			result = null;
			$("#couponlist").html('<div class="nulldiv"><span class="nullpic"></span></div>');
	});
}
/**
 * 从服务器获取数据
 * **/
function loadDataFromServer(cb){
		var params = {"cmd":2608,"city_id":COM.SESSION.getCityInfo().cityID,"uid":COM.SESSION.getUID(),"keyword":data.keyword,"page_no":m_curpage,"page_count":COM.CONST.COUNT_PER_PAGE};
		uexWindow.toast('1', '5', '加载中...', "");
		COM.UTILS.post_mpzkApi(params,function(json){
			var session;
				COM.UTILS.log("m_cacheFileName is" +m_cacheFileName);
				COM.FILECACHE.getFileContent(m_cacheFileName, function(pdata){
					if (pdata.msg == "ok" && pdata.data) {
						COM.UTILS.log("文件存在且不为空,是否是第一次加载:"+m_isFirst);
						if (m_isFirst) {
							m_isFirst=false;
							saveToParse(m_cacheFileName,json,json,cb);
							COM.UTILS.log("直接写文件内容...");
						}else{
							var session = JSON.parse(pdata.data);
							var tmpse = JSON.stringify(session.coupons);
							var	tmpjs = JSON.stringify(json.coupons);
							var str = tmpse.substring(0,tmpse.length - 1) + "," + tmpjs.substring(1,tmpjs.length - 1) +"]";
							session.coupons = eval(str);
							saveToParse(m_cacheFileName,session,json,cb,totalCnt);
							COM.UTILS.log("追加文件内容...");
						}
					}else {
						COM.UTILS.log("文件存在但是为空");
						saveToParse(m_cacheFileName,json,json,cb);
					}
				}, function(pdata){
					COM.UTILS.log("文件不存在");
					saveToParse(m_cacheFileName,json,json,cb);
				});

		},function(json){
				$("#couponlist").html('<div class="nulldiv"><span class="nullpic"></span></div>');
				uexWindow.closeToast();
		});
}

/**
 * 解析数据
 * **/
function parseCouponResult(json,total){
	if(undefined != total){
		totalCnt = total;
	}else{
		totalCnt = parseInt(json.total_count);
	}
	if(totalCnt > 0){
		var a = [];
		var b = [];
		for(var i = 0; i<json.coupons.length; i++){
			var list = json.coupons[i];
			var event = COM.UTILS.getListBindEventString('{\'index\':'+ m_count +',\'fileName\':\'' + m_cacheFileName +  '\'},cbOntouchend');
			a.push('<li class="minhcards"  id="coupon_' + m_count + '" ' + event +'>');
			a.push('	<div class="lleft">');
			a.push('		<div><img class="llcimg x-lazyImg" src="../css/images1/tpc.png" x-picWidth="140" x-picHeight="105" x-picId="'+ list.pic +'"/></div>');
			a.push('		<div class="lcardalias">'+list.brand_name+'</div>');
			a.push('	</div>');
			a.push('	<div class="lccontent">');
			a.push('		<div class="lcctitle">' + list.title + '</div> ');
			a.push('		<div class="lcexplain">时段:' + list.start_interval + " ~ " + list.end_interval + '</div>');
			a.push('		<div class="lcexplain">有效期限至:' +  list.end_time + '</div>');
			a.push('	</div>');
			a.push('	<div class="list_point"></div>');
			a.push('</li>');
			m_count++;
		}
		$("#couponlist").append(a.join(''));
		m_curpage = Math.ceil(m_count/COM.CONST.COUNT_PER_PAGE);
		if(m_curpage < Math.ceil(totalCnt/COM.CONST.COUNT_PER_PAGE) && m_curpage < COM.CONST.MAXPAGE){
			$("#pullUp_"+ori_page+" > span").html("向上拉动加载更多...");
			$("#pullUp_"+ori_page).parent().show();
		}else{
			$("#pullUp_"+ori_page).parent().hide();
		}
		COM.UTILS.loadedIscroll(m_scrollArray,"page_","scroll_",ori_page,COM.IMGLOAD.lazyLoadImg,"pullUp_",nextPage);
		COM.IMGLOAD.lazyLoadImg($("#scroll_"+ori_page));
		scrollTo();
	}else{
		$("#couponlist").html('<div class="nulldiv"><span class="nullpic"></span></div>');
		COM.UTILS.loadedIscroll(m_scrollArray,"page_","scroll_",ori_page,COM.IMGLOAD.lazyLoadImg,"pullUp_",nextPage);
	}
	uexWindow.closeToast();
}
function cbOntouchend(para){
	uexWindow.evaluateScript('', '0', "COM.UTILS.openWindow('coupon-detail','coupon-detail.html?from=coupon-list-search&index=" + para.index + '&fileName=' + para.fileName + "')");
}
function scrollTo(){
	console.log("m_isscroll:"+m_isscroll);
	if(m_isscroll){
		COM.UTILS.log("in scrollto function m_scrollid is " + m_scrollid);
		setTimeout(function(){
			m_scrollArray[0].scrollToElement(m_scrollid,0);
		},100);
		m_isscroll = false;
	}
}
function nextPage(){
	if(m_curpage < Math.ceil(totalCnt/COM.CONST.COUNT_PER_PAGE) && m_curpage < COM.CONST.MAXPAGE){
		m_curpage = Math.ceil(m_count/COM.CONST.COUNT_PER_PAGE);
		m_curpage++;
		loadDataFromServer();
	}
}
function nextPageForDetail(page){
	console.log("in nextPageFroDetail, m_curpage="+m_curpage);
	if(m_curpage > Math.ceil(totalCnt/COM.CONST.COUNT_PER_PAGE) || m_curpage > COM.CONST.MAXPAGE) return;
	if(page<= m_curpage){
		COM.UTILS.log("page < m_curpage loadData From LocalStorage");
		uexWindow.evaluateScript("coupon-detail", "0",'parsePageResult('+ parseInt(page) +')');
	}else{
		m_curpage++;
		loadDataForDetail();
	}
}

function loadDataForDetail(){
	COM.UTILS.log("in loadDataForDetail");
	m_isFirst=false;
	var cb = function(page){
		COM.UTILS.log("in loadDataForDetail callBack");
		uexWindow.evaluateScript("coupon-detail", "0",'parsePageResult('+ parseInt(page) +')');
	};
	loadDataFromServer(cb);
}
function closeWindow(){
	uexWindow.evaluateScript("main", "0",'openPopover(\'home\',\'home\',\'home.html\')');
	COM.UTILS.openWindow('main','../main.html',0);
	setTimeout(function(){
		uexWindow.evaluateScript('search', '0', 'COM.UTILS.closeWindow(-1)');
		COM.UTILS.closeWindow(-1);
	},1000);
}

function saveToParse(cFileName,saveDate,parseDate,cbCall,total){
	COM.FILECACHE.saveFileContent(cFileName,JSON.stringify(saveDate),function(pdata){
		console.log("cache file ok");
		if(cbCall){
			cbCall(m_curpage);
		}else{
			parseCouponResult(parseDate,total);
		}
	},function(pdata){
		console.log("cache file error");
		if(cbCall){
			cbCall(m_curpage);
		}else{
			parseCouponResult(parseDate,total);
		}
	});
}