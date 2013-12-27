 var m_curpage = [1,1,1];//用于存放不同目录下的子页面的页码
 var array = [];//用于判断是否已经加载过改子页面
 var m_scrollArray=[null,null,null];//用于存放不同页面下的iscroll
 var ori_page = 0;
 var totalCnt = [0,0,0];
 var m_data;//用于接受参数
 var m_scrollid = "";//记录详情页面返回来的的条目id
 var m_isscroll = false;//用于判断是否滚动到相应条目
 var m_hasSub;//用于记录当前品牌订阅信息
 var m_subOpt = false;

 // 添加缓存相关
var m_count = [0,0,0];//用于存放记录条数目(即对每条记录进行计数才不会出现翻页后m_curpage改变的情况)
var m_cacheFileName = ["","brandinfo_detail_1_","brandinfo_detail_2_"];//缓存文件名,后加品牌ID
var m_preflag=[false,false,false];//是否是预加载
var m_isFirst=[true,true,true];//是否是第一次进入
var m_localName = ["","tmp_brandinfo_detail_1","tmp_brandinfo_detail_2"];
window.localStorage.removeItem(m_localName[1]);
window.localStorage.removeItem(m_localName[2]);

function loadData(){
	m_cacheFileName[1] += m_data.brandid;
	m_cacheFileName[2] += m_data.brandid;
	
//	COM.UTILS.navClickEvent("order_" + m_data.flag);
	COM.UTILS.setTitle("title1",m_data.name);
	window.localStorage.removeItem("SESSION_BRAND_LIST2");//清除以前缓存数据
//	openSublingWindow(m_data.flag);
	loadDataFromServer("");
	var a = new zyFlipEx("orderList");
}
/**
 * 从服务器获取数据
 * **/
function loadDataFromServer(pos,cb){
	if (!m_preflag[ori_page]) {
		uexWindow.toast('1', '5', '加载中...', "");
	}
	var page = ori_page;
	var params;
	if(page == 0){
		params = {"cmd":"2011","id":m_data.brandid};
	}else if(page == 1){
		params = {"cmd":"2012","brand_id":m_data.brandid};
		if(pos !="")
			$.extend(params,{"lon":pos.lon,"lat":pos.lat,"radius":10*1000});
	}else if(page == 2){
		params = {"cmd":"2708","brand_id":m_data.brandid};
	}
	$.extend(params,{"city_id":COM.SESSION.getCityInfo().cityID,"uid":COM.SESSION.getUID(),"page_no":m_curpage[page],"page_count":COM.CONST.COUNT_PER_PAGE});
	if(0 != page && m_preflag[page] ){
		params.page_no = 1;
	}
	
	COM.UTILS.post_mpzkApi(params,function(json){
		if(page == 0){
			parseStory(page,json);
		}else{
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
							var tmpse = null;
							var tmpjs = null;
							
							if(1 == page){
								tmpse = JSON.stringify(session.brand_stores);
								tmpjs = JSON.stringify(json.brand_stores);
							}else{
								tmpse = JSON.stringify(session.discounts);
								tmpjs = JSON.stringify(json.discounts);
							}
							
							var str = tmpse.substring(0,tmpse.length - 1) + "," + tmpjs.substring(1,tmpjs.length - 1) +"]";
							if(1 == page){
								session.brand_stores = eval(str);
							}else{
								session.discounts = eval(str);
							}
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
		}
	},function(json){
		if (m_preflag[ori_page]) {
			m_preflag[ori_page] = false;
		}else {
			$("#brand_list"+page).html('<div class="nulldiv"><span class="nullpic"></span></div>');
			uexWindow.closeToast();
		}
	});
}
/***
 * 解析品牌故事
 * @param {} json
 */
function parseStory(page,json){
	COM.UTILS.log("in parseStory");
	m_hasSub = json.brand.has_sub;
	if(m_hasSub == 1){
		COM.UTILS.setTitle("hasSub","取消订阅");
	}else{
		COM.UTILS.setTitle("hasSub","添加订阅");
	}
	uexWindow.evaluateScript('', '1', '$("#hasSub").attr("ontouchstart","uexWindow.evaluateScript(\'\', \'0\', \'brand_opt()\');");');
	var intro = json.brand.intro == "undefined" ? "" : json.brand.intro;
	$("#brand_story").html(intro);
	$("#brand_img_large").attr("x-picId",json.brand.pic_3);
	$("#brand_img").attr("x-picId",json.brand.pic_1);
	$("#brand_news").attr("ontouchstart",'openNews_list()');
	COM.UTILS.loadedIscrollNoMore(m_scrollArray,"page_","scroll_",page);
	COM.IMGLOAD.LoadingImg();
	array.push("page_" + page);
	uexWindow.closeToast();
}
function openNews_list(){
	console.log(1);
	uexWindow.evaluateScript("main", "0",'uexWindow.closePopover("news-list");openPopover(\'news-list\',\'news-list\',\'news/news-list.html?brandid='+ m_data.brandid + '&name=' + COM.UTILS.encodeURIComponent(m_data.name)+'\')');
	setTimeout(function(){
		COM.UTILS.openWindow('main','../main.html',0);
		uexWindow.close();
	},100);
}
/***
 * 
 * @param {} id
 * @param {} code
 */
function brand_opt(){
	var id = m_data.brandid;
	COM.UTILS.log("in brand_opt");
	var msg = m_hasSub == 0 ? "订阅中...":"取消订阅...";
	uexWindow.toast('1','5',msg,"");
	var params1 = {"cmd":2005,"city_id":COM.SESSION.getCityInfo().cityID,"uid":COM.SESSION.getUID(),"action":m_hasSub,"brand_id":id};
	checkSub();
	COM.UTILS.post_mpzkApi(params1,function(json){
		uexWindow.closeToast();
		m_hasSub = m_hasSub == 0 ? 1:0;
		if(m_hasSub == 1){
			COM.UTILS.setTitle("hasSub","取消订阅");
		}else{
			COM.UTILS.setTitle("hasSub","添加订阅");
		}
		},function(json){
			uexWindow.closeToast();
			COM.DIALOG.alert(json.error_info);
		});
}
function checkSub(){
	if(!m_subOpt) m_subOpt = true;
}
/***
 * 解析专卖店信息
 * @param {} json
 */
function parseStoreInfo(page,json,total){
		if(undefined != total){
			totalCnt[page] = total;
		}else{
			totalCnt[page] = parseInt(json.total_count);
		}
		COM.UTILS.log("in parseStoreInfo,totalCnt[page]:"+totalCnt[page]);
		
		if(totalCnt[page] > 0){
		var a = [];
		var b = [];
		var distance = "";
		for(var i = 0; i<json.brand_stores.length; i++){
			var list = json.brand_stores[i];
			var distance = typeof(list.distance) == "undefined" ? "-" : list.distance;
			if(typeof(list.distance) != "undefined"){
				distance = COM.STRINGUTIL.formatDistance(list.distance);
			}else{
				distance = "- 公里";
			}
			var event = COM.UTILS.getListBindEventString('{\'lon\':'+ list.lon +',\'lat\':' + list.lat +'},cbOntouchend2');
			a.push('<li class="brand_around" '+ event +'>');
			a.push('	<div class="middlearea_nopic">');
			a.push('		<div class="middle_text">');
			a.push('			<div>'+ list.name +'</div>');
			a.push('			<div class="brand_mall">' + list.address + '</div>');
			a.push('		</div>');
			a.push('	</div>');
			a.push('	<div class="lc_distance">'+ distance +'</div>');
			a.push('	<div class="list_point"></div>');
			a.push('	<div class="clear"></div>');
			a.push('</li>');
			m_count[page]++;
		}
		$("#brand_list1").append(a.join(''));
		m_curpage[page] = Math.ceil(m_count[page]/COM.CONST.COUNT_PER_PAGE);
		if(m_curpage[ori_page] < Math.ceil(totalCnt[page]/COM.CONST.COUNT_PER_PAGE) && m_curpage[ori_page] < COM.CONST.MAXPAGE){
			$("#pullUp_"+page+" > span").html("向上拉动加载更多...");
			$("#pullUp_"+page).parent().show();
		}else{
			$("#pullUp_"+page).parent().hide();
		}
		array.push("page_" + page);
		COM.UTILS.loadedIscrollWithRefreshAndMore(m_scrollArray,"page_","scroll_",page,COM.IMGLOAD.lazyLoadImg,"pullDown_",refreshPage,"pullUp_",nextPage);
	}else{
		$("#brand_list1").html('<div class="nulldiv"><span class="nullpic"></span></div>');
		array.push("page_" + page);
		COM.UTILS.loadedIscrollWithRefreshAndMore(m_scrollArray,"page_","scroll_",page,COM.IMGLOAD.lazyLoadImg,"pullDown_",refreshPage,"pullUp_",nextPage);
	}
	uexWindow.closeToast();
	preloadServerData();//预加载服务器数据
}
function cbOntouchend2(para){
	uexWindow.toast("1","5","地图加载中，请稍候...","");
	uexWindow.evaluateScript('', '0', "COM.UTILS.openWindow('baidumap','../util/baidumap.html?lon=" + para.lon + '&lat=' + para.lat + "')");
	setTimeout(COM.DIALOG.closewaiting,2000);
}	
/**
 * 解析品牌折扣数据
 * **/
function parseBrandResult(page,json,total){
	if(undefined != total){
		totalCnt[page] = total;
	}else{
		totalCnt[page] = parseInt(json.total_count);
	}
	COM.UTILS.log("in parseBrandResult,totalCnt[page]: "+totalCnt[page]);
	
	if(totalCnt[page] > 0){
		var pageno = 0;
		var a = [];
		var b = [];
		for(var i = 0; i<json.discounts.length; i++){
			var list = json.discounts[i];
			var distance = "";
			var tmpl = COM.STRINGUTIL.parseFavContent(list.tmpl,list.tmpl_params);
			tmpl = tmpl = COM.STRINGUTIL.getSubString(tmpl,66,"...");
			var mallname = undefined == list.emporium_name ? "" : list.emporium_name;
			var intro = typeof(list.intro) == "undefined" ? "" : list.intro;
			intro = COM.STRINGUTIL.getSubString(intro,66,"...");
			var valid_days = '';
			if(list.valid_days < 0){
				valid_days = "<span class='orange'>[差"+(-list.valid_days)+"天开始]</span>";
			}else if(0 == list.valid_days){
				valid_days = "[已过期]";
			}else{
				valid_days = "<span class='orange'>[剩余"+list.valid_days+"天]</span>";
			}
			var event = COM.UTILS.getListBindEventString('{\'index\':'+ m_count[page] +',\'type\':' + page + ',\'fileName\':\'' + m_cacheFileName[ori_page] + '\'},cbOntouchend');
			a.push('<li class="brand_around" id="brand_' + page + '_' + m_count[page] + '" ' + event + '>');
			a.push('	<div class="middlearea_nopic">');
			a.push('		<div class="middle_text">');
			a.push('			<div>' + mallname + tmpl + valid_days + '</div>');
			a.push('			<div class="brand_mall">'+ intro +'</div>');
			a.push('		</div>');
			a.push('	</div>');
			a.push('	<div class="list_point"></div>');
			a.push('	<div class="clear"></div>');
			a.push('</li>');
			m_count[page] ++;
		}
		$("#brand_list2").append(a.join(''));
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
		$("#brand_list"+page).html('<div class="nulldiv"><span class="nullpic"></span></div>');
		$("#nextPage"+page).parent().hide();
		COM.UTILS.loadedIscrollWithRefreshAndMore(m_scrollArray,"page_","scroll_",page,COM.IMGLOAD.lazyLoadImg,"pullDown_",refreshPage,"pullUp_",nextPage);
	}
	array.push("page_" + page);
	uexWindow.closeToast();
	preloadServerData();//预加载服务器数据
}
function cbOntouchend(para){
	COM.UTILS.openWindow('brand-detail','brand-detail.html?index=' + para.index + '&type=' + para.type + "&flag=1"+"&fileName="+para.fileName);
}
function nextPage(){
	if(m_curpage[ori_page] < Math.ceil(totalCnt[ori_page]/COM.CONST.COUNT_PER_PAGE) && m_curpage[ori_page] < COM.CONST.MAXPAGE){
		m_curpage[ori_page] = Math.ceil(m_count[ori_page]/COM.CONST.COUNT_PER_PAGE);
		m_curpage[ori_page]++;
		if(ori_page == 1){
			COM.UTILS.getLocation(loadDataFromServer);
		}else{
			loadDataFromServer("");
		}
	}
}

/***
 * 页签切换的方法
 */
function openSublingWindow(to_page){
	if(to_page == ori_page) return;
	zy_anim_slide("page_" + ori_page,"page_" + to_page,"none",openSublingCheck(to_page));
}

/***
 * 判断当前页签是否已加载过
 */
function openSublingCheck(to_page){
	ori_page = to_page;
	uexWindow.closeToast();
	if(array.indexOf("page_"+ori_page) != -1) return;
	
	if(m_preflag[ori_page]){
		if(to_page == 1){
			COM.UTILS.log("in openSublingCheck to_page is "+ to_page);
			uexWindow.toast('1','5','加载中...',"");
			COM.UTILS.getLocation(loadDataFromServer);
		}else{
			loadDataFromServer("");
		}
	}else{
		loadDataFromCache();
	}
}
function nextPageForDetail(page){
	console.log("in nextPageFroDetail, m_curpage[ori_page]="+m_curpage[ori_page]);
	if(m_curpage[ori_page] > Math.ceil(totalCnt[ori_page]/COM.CONST.COUNT_PER_PAGE)  || m_curpage[ori_page] > COM.CONST.MAXPAGE) return;
	if(page<= m_curpage[ori_page]){
		COM.UTILS.log("page < m_curpage loadData From LocalStorage");
		uexWindow.evaluateScript("brand-detail", "0",'parsePageResult('+ parseInt(page) +')');
	}else{
		m_curpage[ori_page]++;
		if(ori_page == 1){
			COM.UTILS.getLocation(loadDataForDetail);
		}else{
			loadDataForDetail();
		}
	}
}
function loadDataForDetail(pos){
	console.log("in loadDataForDetail");
	var cb = function(page){
		uexWindow.evaluateScript("brand-detail", "0",'parsePageResult('+ page +')');
	};
	loadDataFromServer("",cb);
}
function scrollTo(){
		COM.UTILS.log("in scrollto function m_scrollid is " + m_scrollid);
	if(m_isscroll){
		setTimeout(function(){
			m_scrollArray[ori_page].scrollToElement(m_scrollid,0);
		},100);
		m_isscroll = false;
	}
}
/**从session读取数据
 * **/
function loadDataFromSession(id){
	COM.UTILS.log("loadDataFromSession id is " +id);
	var result;
	m_count[ori_page] = 0;
	m_scrollid = "#" + id;
	m_isscroll = true;
	COM.UTILS.log("in loadDataFromSession");
	uexWindow.toast('1','5','加载中...',"");
	$("#brand_list"+ori_page).empty();
	COM.FILECACHE.getFileContent(m_cacheFileName[ori_page], function(pdata){
		if (pdata.msg == "ok" && pdata.data) {
			console.log("缓存文件数据不为空");
			result = pdata.data;
			parseBrandResult(ori_page,JSON.parse(result));
		}else {
			console.log("缓存文件数据为空");
			result = null;
			$("#brand_list"+ori_page).html('<div class="nulldiv"><span class="nullpic"></span></div>');
		}
	}, function(pdata){
			console.log("获取缓存文件失败");
			result = null;
			$("#brand_list"+ori_page).html('<div class="nulldiv"><span class="nullpic"></span></div>');
	});
}
function closeWindow(){
	if(m_subOpt)
		uexWindow.evaluateScript('home', '0', 'reloadData();');
	setTimeout(function(){
		COM.UTILS.openWindow('home','../home.html',0);
	},50);
}
function returnList(){
	if(m_subOpt)
		uexWindow.evaluateScript('home', '0', 'reloadData();');
	setTimeout(function(){
		COM.UTILS.closeWindow(-1);
	},10);
}


function saveToParse(cFileName,saveDate,parseDate,cbCall,total){
	COM.FILECACHE.saveFileContent(cFileName,JSON.stringify(saveDate),function(pdata){
		console.log("cache file ok");
		if(1 == ori_page){
			parseStoreInfo(ori_page,parseDate,total);
		}else{		// 只有折扣列表才会有回调函数
			if(cbCall){
				cbCall(m_curpage[ori_page]);
			}else{
				parseBrandResult(ori_page,parseDate,total);
			}
		}
	},function(pdata){
		console.log("cache file error");
		if(1 == ori_page){
			parseStoreInfo(ori_page,parseDate,total);
		}else{		// 只有折扣列表才会有回调函数
			if(cbCall){
				cbCall(m_curpage[ori_page]);
			}else{
				parseBrandResult(ori_page,parseDate,total);
			}
			
		}
	});
}

function loadDataFromCache(){
		COM.FILECACHE.getFileContent(m_cacheFileName[ori_page], function(pdata){
			if (pdata.msg == "ok" && pdata.data) {
				if(1 == ori_page){
					parseStoreInfo(ori_page,JSON.parse(pdata.data));
				}else{
					parseBrandResult(ori_page,JSON.parse(pdata.data));
				}
			}else {
				m_isFirst=false;
				console.log("in loadDataFromCache,read data fail");
				if(1 == ori_page){
					COM.UTILS.getLocation(loadDataFromServer);
				}else{
					loadDataFromServer("");
				}
			}
		}, function(pdata){
			m_isFirst=false;
			if(1 == ori_page){
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
		if(1 == ori_page){
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
			$("#brand_list"+ori_page).empty();
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