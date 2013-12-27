 var ori_page = 0;//子页面切换的默认初始化pageid
 var m_curpage = [1,1,1];//用于存放不同目录下的子页面的页码
 var m_scrollArray=[null,null,null];//用于存放不同页面下的iscroll
 var array = [];//用于判断是否已经加载过改子页面
 var data;//用于页面间参数传递
 var totalCnt = [0,0,0]//用于返回条数的记录（给详情页面使用）
 var m_tabPos = [0,0,0];//用于存放滚动条的位置
 var m_scrollid = "";//记录详情页面返回来的的条目id
 var m_isscroll = false;//用于判断是否滚动到相应条目
 var m_status = true;//用于详情页面中判断数据如果在加载中，即使多次滑动也不请求多次数据 
 var p_extend;
 
  // 添加缓存相关
var m_count = [0,0,0];//用于存放记录条数目(即对每条记录进行计数才不会出现翻页后m_curpage改变的情况)
var m_cacheFileName = ["carfav-list_0_","carfav-list_1_","carfav-list_2_"];//缓存文件名,后加品牌ID
var m_preflag=[false,false,false];//是否是预加载
var m_isFirst=[true,true,true];//是否是第一次进入
var m_localName = ["tmp_carfav-list_0","tmp_carfav-list_1","tmp_carfav-list_2"];
window.localStorage.removeItem(m_localName[0]);
window.localStorage.removeItem(m_localName[1]);
window.localStorage.removeItem(m_localName[2]);
 
$(function(){
});

function loadData(){
	m_cacheFileName[0] += data.id;
	m_cacheFileName[1] += data.id;
	m_cacheFileName[2] += data.id;
	toLoadData();
}
function toLoadData(){
	COM.UTILS.setTitle("title1",COM.SESSION.getCityInfo().cityName);
	COM.UTILS.setTitle("title2", data.alias + "特惠");
	if(m_preflag[ori_page]){
		loadDataFromServer();
	}else{
		loadDataFromCache();
	}
	var a = new zyFlipEx("orderList");
}
function clearListData(){
	$("#pullDown_0").parent().hide();
	$("#pullDown_1").parent().hide();
	$("#pullDown_2").parent().hide();
	$("#pullUp_0").parent().hide();
	$("#pullUp_1").parent().hide();
	$("#pullUp_2").parent().hide();
	$("#favlist0").empty();
	$("#favlist1").empty();
	$("#favlist2").empty();
	array = [];
	totalCnt = [null,null,null];
	m_count = [0,0,0];
	m_curpage = [1,1,1];
	m_preflag=[false,false,false];
	m_isFirst=[true,true,true];	
}
function loadDataForChgCIty(){
	$("#favlist"+ori_page).empty();
	$("#pullUp_"+ori_page).parent().hide();
	clearListData();
//	if(m_scrollArray[ori_page] != null)
//		m_scrollArray[ori_page].refresh();
		
	
	toLoadData();
}
/**从session读取数据
 * **/
function loadDataFromSession(id){
	var result;
	m_count[ori_page] = 0;
	m_scrollid = "#" + id;
	m_isscroll = true;
	COM.UTILS.log("in loadDataFromSession");
	uexWindow.toast('1','5','加载中...',"");
	$("#favlist"+ori_page).empty();
	COM.FILECACHE.getFileContent(m_cacheFileName[ori_page], function(pdata){
		if (pdata.msg == "ok" && pdata.data) {
			console.log("缓存文件数据不为空");
			result = pdata.data;
			parseCardResult(ori_page,JSON.parse(result));
		}else {
			console.log("缓存文件数据为空");
			result = null;
			$("#favlist"+ori_page).html('<div class="nulldiv"><span class="nullpic"></span></div>');
		}
	}, function(pdata){
			console.log("获取缓存文件失败");
			result = null;
			$("#favlist"+ori_page).html('<div class="nulldiv"><span class="nullpic"></span></div>');
			uexWindow.closeToast();
	});
}
/**
 * 从服务器获取数据
 * **/
function loadDataFromServer(pos,cb){
		var page = ori_page;
		var params = {"cmd":"280B","city_id":COM.SESSION.getCityInfo().cityID,"uid":COM.SESSION.getUID(),"brand_id":data.id,"page_no":m_curpage[ori_page],"page_count":COM.CONST.COUNT_PER_PAGE,"sort_type":ori_page};
		if(ori_page == 2 && "" != pos)
			$.extend(params,{"lon":pos.lon,"lat":pos.lat});
		if (!m_preflag[page]) {
			uexWindow.toast('1', '5', '加载中...', "");
		}else{
			params.page_no = 1;
		}
		COM.UTILS.post_mpzkApi(params,function(json){
			m_status = true;
			if(m_preflag[page]){
				window.localStorage.setItem(m_localName[page],JSON.stringify(json));
				if(totalCnt[ori_page] != parseInt(json.total_count)){
					$("#pullDown_"+page).parent().show();
					COM.UTILS.loadedIscrollWithRefreshAndMore(m_scrollArray,"page_","scroll_",page,COM.IMGLOAD.lazyLoadImg,"pullDown_",refreshPage,"pullUp_",nextPage);
				}
				m_preflag[page]=false;
			}else{
				COM.UTILS.log("m_cacheFileName is" +m_cacheFileName[page]);
				COM.FILECACHE.getFileContent(m_cacheFileName[page], function(pdata){
					if (pdata.msg == "ok" && pdata.data) {
						COM.UTILS.log("文件存在且不为空");
						COM.UTILS.log("是否是第一次加载:"+m_isFirst[page]);
						if (m_isFirst[page]) {
							m_isFirst[page]=false;
							saveToParse(m_cacheFileName[page],json,json,cb);
							COM.UTILS.log("直接写文件内容...");
						}else{
							var session = JSON.parse(pdata.data);
							var tmpse = JSON.stringify(session.bank_discounts);
							var	tmpjs = JSON.stringify(json.bank_discounts);
							
							var str = tmpse.substring(0,tmpse.length - 1) + "," + tmpjs.substring(1,tmpjs.length - 1) +"]";
							session.bank_discounts = eval(str);
							saveToParse(m_cacheFileName[page],session,json,cb,totalCnt[page]);
							COM.UTILS.log("追加文件内容...");
						}
					}else {
						COM.UTILS.log("文件存在但是为空");
						saveToParse(m_cacheFileName[page],json,json,cb);
					}
				}, function(pdata){
					COM.UTILS.log("文件不存在");
					saveToParse(m_cacheFileName[page],json,json,cb);
				});
			}
		},function(json){
			m_status = true;
			if (m_preflag[ori_page]) {
				m_preflag[ori_page] = false;
			}else {
				$("#favlist"+ori_page).html('<div class="nulldiv"><span class="nullpic"></span></div>');
				uexWindow.closeToast();
			}
		});
}

/**
 * 解析数据
 * **/
function parseCardResult(page,json,total){
//	if(undefined != total){
	if(total){
		totalCnt[page] = total;
	}else{
		totalCnt[page] = parseInt(json.total_count);
	}
	COM.UTILS.log("in parseCardResult,totalCnt[page]: "+totalCnt[page]);
	if(totalCnt[ori_page] > 0){
		var pageno = 0;
		var a = [];
		var b = [];
		for(var i = 0; i<json.bank_discounts.length; i++){
			var list = json.bank_discounts[i];
			var distance = "";
			var event = COM.UTILS.getListBindEventString('{\'index\':'+ m_count[page] + ',\'type\':' + page + ',\'fileName\':\'' + m_cacheFileName[page] + '\'},cbOntouchend');
			a.push('<li id="fav_' + page + '_' + m_count[page] + '"' + event + '>');
			a.push('	<div class="lleft">');
			a.push('		<img class="lcardimg x-lazyImg" src="../css/images1/tpz.png" x-picWidth="140" x-picHeight="90" x-picId="'+ list.pic +'"/>');
			a.push('	</div>');
			a.push('	<div class="lcardcontent">');
			a.push('		<div class="lcctitle">' + list.store_name + '</div>');
			a.push('		<div class="lcexplain">'+ list.address +'</div>');
			a.push('		<div class="lcexplain">有效期限至:' +  list.end_time + '</div>');
			if(page == 2 && typeof(list.distance) != "undefined"){
				distance = COM.STRINGUTIL.formatDistance(list.distance);
			}else if(page == 2 && typeof(list.distance) == "undefined"){
				distance = "- 公里";
			}
			a.push('	</div>');
			a.push('	<div class="list_distance">' + distance + '</div>');
			a.push('	<div class="list_point"></div>');
			a.push('</li>');
			m_count[page]++;
		}
		$("#favlist"+page).append(a.join(''));
		m_curpage[page] = Math.ceil(m_count[page]/COM.CONST.COUNT_PER_PAGE);
		if(m_curpage[page] < Math.ceil(totalCnt[page]/COM.CONST.COUNT_PER_PAGE) && m_curpage[page] < COM.CONST.MAXPAGE){
			$("#pullUp_"+page+" > span").html("向上拉动加载更多...");
			$("#pullUp_"+page).parent().show();
		}else{
			$("#pullUp_"+page).parent().hide();
		}
		COM.UTILS.loadedIscrollWithRefreshAndMore(m_scrollArray,"page_","scroll_",page,COM.IMGLOAD.lazyLoadImg,"pullDown_",refreshPage,"pullUp_",nextPage);
		COM.IMGLOAD.lazyLoadImg($("#scroll_"+page));
		scrollTo();
	}else{
		uexWindow.closeToast();
		$("#favlist"+page).html('<div class="nulldiv"><span class="nullpic"></span></div>');
//		if(m_scrollArray[ori_page] != null)
//			m_scrollArray[ori_page].refresh();
		COM.UTILS.loadedIscrollWithRefreshAndMore(m_scrollArray,"page_","scroll_",ori_page,COM.IMGLOAD.lazyLoadImg,"pullDown_",refreshPage,"pullUp_",nextPage);
	}
	array.push("page_" + page);
	uexWindow.closeToast();
	preloadServerData();//预加载服务器数据
}
function cbOntouchend(para){
	COM.UTILS.openWindow('cardfav-detail','cardfav-detail.html?from=cardfav-list&index=' + para.index + '&type=' + para.type +"&fileName="+para.fileName);
}	
/***
 * 距离热度时间页签切换的方法
 */
function openSublingWindow(to_page){
	if(to_page == ori_page) return;
	m_tabPos[ori_page] = $(window).scrollTop();
	zy_anim_slide("page_" + ori_page,"page_" + to_page,"none",openSublingCheck(to_page));
}

/***
 * 判断当前页签是否已加载过
 */
function openSublingCheck(to_page){
	ori_page = to_page;
	uexWindow.closeToast();
	window.scrollTo(0,m_tabPos[to_page]);
	if(array.indexOf("page_"+ori_page) != -1) return;
	
	if(m_preflag[ori_page]){
		if(to_page == 2){
			uexWindow.toast('1','5','加载中...',"");
			COM.UTILS.getLocation(loadDataFromServer);
		}else{
			loadDataFromServer();
		}
	}else{
		loadDataFromCache();
	}
}
function nextPage(){
	if(m_curpage[ori_page] < Math.ceil(totalCnt[ori_page]/COM.CONST.COUNT_PER_PAGE) && m_curpage[ori_page] < COM.CONST.MAXPAGE){
		m_curpage[ori_page] = Math.ceil(m_count[ori_page]/COM.CONST.COUNT_PER_PAGE);
		m_curpage[ori_page]++;
		if(ori_page == 2){
			COM.UTILS.getLocation(loadDataFromServer);
		}else{
			loadDataFromServer();
		}
	}
}
/**
 * 用于给详情页面提供加载下一页数据的函数
 * */
function nextPageForDetail(page){
	console.log("in nextPageFroDetail, m_curpage[ori_page]="+m_curpage[ori_page]);
	if(m_curpage[ori_page] > Math.ceil(totalCnt[ori_page]/COM.CONST.COUNT_PER_PAGE) || m_curpage[ori_page] > COM.CONST.MAXPAGE) return;
	if(page<= m_curpage[ori_page]){
		COM.UTILS.log("page < m_curpage loadData From LocalStorage");
		uexWindow.evaluateScript("cardfav-detail", "0",'parsePageResult('+ parseInt(page) +')');
	}else{
		m_curpage[ori_page]++;
		if(ori_page == 2){
			COM.UTILS.getLocation(loadDataForDetail);
		}else{
			loadDataForDetail();
		}
	}
}

/**
 * 用于给详情页面提供加载数据的函数，当需要距离的时候，就要给出经纬度pos
 * */
function loadDataForDetail(pos){
	if(m_status){
		m_status = false;
		var cb = function(page){
			uexWindow.evaluateScript("cardfav-detail", "0",'parsePageResult(' + page + ')');
		};
		if(pos){
			loadDataFromServer(pos,cb);
		}else{
			loadDataFromServer("",cb);
		}
	}
}
function closeWindow(){
		COM.UTILS.closeWindow(0);
}
function scrollTo(){
	if(m_isscroll){
		COM.UTILS.log("in scrollto function m_scrollid is " + m_scrollid);
		setTimeout(function(){
			m_scrollArray[ori_page].scrollToElement(m_scrollid,0);
		},100);
		m_isscroll = false;
	}
}


function saveToParse(cFileName,saveDate,parseDate,cbCall,total){
	COM.FILECACHE.saveFileContent(cFileName,JSON.stringify(saveDate),function(pdata){
		console.log("cache file ok");
		if(cbCall){
			cbCall(m_curpage[ori_page]);
		}else{
			parseCardResult(ori_page,parseDate,total);
		}
	},function(pdata){
		console.log("cache file error");
		if(cbCall){
			cbCall(m_curpage[ori_page]);
		}else{
			parseCardResult(ori_page,parseDate,total);
		}
	});
}

function loadDataFromCache(){
		COM.FILECACHE.getFileContent(m_cacheFileName[ori_page], function(pdata){
			if (pdata.msg == "ok" && pdata.data) {
				parseCardResult(ori_page,JSON.parse(pdata.data));
			}else {
				m_isFirst[ori_page]=false;
				console.log("in loadDataFromCache,read data fail");
				if(2 == ori_page){
					COM.UTILS.getLocation(loadDataFromServer);
				}else{
					loadDataFromServer("");
				}
			}
		}, function(pdata){
			m_isFirst[ori_page]=false;
			if(2 == ori_page){
				COM.UTILS.getLocation(loadDataFromServer);
			}else{
				loadDataFromServer("");
			}
		});
}

function preloadServerData(){
	if(m_isFirst[ori_page]){
		m_isFirst[ori_page]=false;
		m_preflag[ori_page]=true;
		if(2 == ori_page){
			COM.UTILS.getLocation(loadDataFromServer);
		}else{
			loadDataFromServer("");
		}
	}
}

function refreshPage(){
	COM.UTILS.log("in refreshPage");
	$("#pullDown_"+ori_page).parent().fadeOut();
	//读取本地localStorage缓存数据进行保存并解析
	if(window.localStorage.getItem(m_localName[ori_page])){
		var refreshData=JSON.parse(window.localStorage.getItem(m_localName[ori_page]));
		if(totalCnt[ori_page] != parseInt(refreshData.total_count)){
			COM.UTILS.log("in refreshPage,data was changed...");
			$("#pullUp_"+ori_page).parent().hide();
			$("#favlist"+ori_page).empty();
			m_count[ori_page] = 0;
			m_curpage[ori_page]=1;
			saveToParse(m_cacheFileName[ori_page],refreshData,refreshData,null);
		}else{
			COM.UTILS.log("in refreshPage,data was no changed...");
		}
	}else{
		COM.UTILS.log("in refreshPage,localStorage do not has the item of "+m_localName+"...");		
	}
}