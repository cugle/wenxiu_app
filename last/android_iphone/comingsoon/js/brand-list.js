var ori_page = 0;//子页面切换的默认初始化pageid
var m_curpage = [1,1,1,1];//用于存放不同目录下的子页面的页码
var array = [];//用于判断是否已经加载过改子页面
var m_scrollArray=[null,null,null,null];//用于存放不同页面下的iscroll
var data;//用于页面间参数传递
var m_count = [0,0,0,0];//用于存放记录条数目(即对每条记录进行计数才不会出现翻页后m_curpage改变的情况)
var totalCnt = [0,0,0,0];//记录总条数
var m_scrollid = "";//记录详情页面返回来的的条目id
var m_isscroll = false;//用于判断是否滚动到相应条目
var p_extend;
var m_cacheFileName;//缓存文件名
var m_preflag=[false,false,false,false];//是否是预加载
var m_isFirst=[true,true,true,true];//是否是第一次进入
var m_localName = ["tmp_brand_0_","tmp_brand_1_","tmp_brand_2_","tmp_brand_3_"];
var m_isCat=false;
window.localStorage.removeItem(m_localName[0]);
window.localStorage.removeItem(m_localName[1]);
window.localStorage.removeItem(m_localName[2]);
window.localStorage.removeItem(m_localName[3]);
var cacheinfo=[null,null,null,null];		// 缓存的数据，用于与预加载数据进行比对
var blupdate =[false,false,false,false];

$(function(){
});
function loadData(){
	uexWindow.toast('1','5','加载中...',"");
	console.log("in loadData of brand-list, type="+data.type);
	if(data.type == "search"){//从搜索跳转
		if(data.catname&&$.trim(data.catname).length>0){
			uexWindow.evaluateScript("", "1",'$("#catname").html("'+data.catname+'");');
		}
		uexWindow.evaluateScript("", "1",'$("#title2").show();');
		p_extend = {"cmd":"270B","cat_id":data.catid,"keyword":data.keyword};
	}else if(data.type == "mall"){//商城
		uexWindow.evaluateScript("", "1",'$("#title3").show();');
		p_extend = {"cmd":"2708","emporium_id":data.mallid};
	}else{//首页品牌
		console.log("data.name:"+data.name+",data.id:"+data.id);
		COM.UTILS.setTitle("title1",data.name);
		uexWindow.evaluateScript("", "1",'$("#title1").show();');
		p_extend = {"cmd":"2708","brand_id":data.id};
	}
	if(m_preflag[ori_page]){
		loadDataFromServer();
	}else{
		loadDataFromCache();
		var a = new zyFlipEx("orderList");
	}
}

function loadDataFromCache(pos){
	console.log("in loadDataFromCache,data.type="+data.type);
	if (data.type == "search") {
		if(ori_page == 3 && pos !=""){
			loadDataFromServer(pos);
		}else{
			loadDataFromServer();
		}
	}else {
		if ((data.type == "mall")) {
			m_cacheFileName = "brand-list_" + ori_page + "_" + data.mallid;
		}else{
			m_cacheFileName = "brand-list_" + ori_page + "_" + data.id;
		}
		COM.FILECACHE.getFileContent(m_cacheFileName, function(pdata){
			if (pdata.msg == "ok" && pdata.data) {
				cacheinfo[ori_page] = JSON.parse(pdata.data);
				parseBrandResult(ori_page, JSON.parse(pdata.data));
			}else {
				m_isFirst[ori_page]=false;
				console.log("in loadDataFromCache,read data fail");
				if(ori_page == 3 && pos !=""){
					loadDataFromServer(pos);
				}else{
					loadDataFromServer();
				}
			}
		}, function(pdata){
			m_isFirst[ori_page]=false;
			if(ori_page == 3 && pos !=""){
				loadDataFromServer(pos);
			}else{
				loadDataFromServer();
			}
		});
	}
}
function clearAndReloadTmpCatData(){
	m_localName = ["tmp_cat_0_","tmp_cat_1_","tmp_cat_2_","tmp_cat_3_"];
	COM.FILECACHE.saveFileContent(m_localName[0],"",function(pdata){
		console.log("in clearAndReloadTmpCatData...");
		COM.FILECACHE.saveFileContent(m_localName[1],"",function(pdata){
			console.log("in clearAndReloadTmpCatData...");
			COM.FILECACHE.saveFileContent(m_localName[2],"",function(pdata){
				console.log("in clearAndReloadTmpCatData...");
				COM.FILECACHE.saveFileContent(m_localName[3],"",function(pdata){
					console.log("in clearAndReloadTmpCatData...");
					if(ori_page == 3){
						COM.UTILS.getLocation(loadDataFromServer);
					}else{
						loadDataFromServer();
					}
				},function(){
					
				});
			},function(){
				
			});
		
		},function(){
			
		});
	},function(){
		
	});
}
function loadDataForCat(catid,name){
	COM.UTILS.log("catid is "+catid +"catname is "+name);
	COM.UTILS.setTitle("mall_catename",name);
	$.extend(p_extend,{"cat_id":catid});
	clearListData();
	m_isCat=true;
	m_preflag=[false,false,false,false];
	m_isFirst=[false,false,false,false];
	clearAndReloadTmpCatData();
}

function loadDataFromServerByFlush(catid,name){
	COM.UTILS.setTitle("catname",name);
	loadDataForCat(catid,name);
	uexWindow.evaluateScript('search-type', '0', "closeWindow();");
}
function clearListData(){
	$("#pullDown_0").parent().hide();
	$("#pullDown_1").parent().hide();
	$("#pullDown_2").parent().hide();
	$("#pullDown_3").parent().hide();
	$("#pullUp_0").parent().hide();
	$("#pullUp_1").parent().hide();
	$("#pullUp_2").parent().hide();
	$("#pullUp_3").parent().hide();
	$("#brand_list0").empty();
	$("#brand_list1").empty();
	$("#brand_list2").empty();
	$("#brand_list3").empty();
	array = [];
	m_count = [0,0,0,0];
	totalCnt = [null,null,null,null];
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
	COM.FILECACHE.getFileContent(m_cacheFileName, function(pdata){
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
/**
 * 从服务器获取数据
 * **/
function loadDataFromServer(pos,cb){
		var page = ori_page;
		var params = {"city_id":COM.SESSION.getCityInfo().cityID,"uid":COM.SESSION.getUID(),"page_no":m_curpage[ori_page],"page_count":COM.CONST.COUNT_PER_PAGE,"sort_type":ori_page};
		if (!m_preflag[ori_page]) {
			uexWindow.toast('1', '5', '加载中...', "");
		}else{
			params.page_no=1;
		}
		$.extend(params,p_extend);
		if(ori_page == 3 && "" != pos){
			$.extend(params,{"lon":pos.lon,"lat":pos.lat});
		}
		if(data.type == "mall"){
			m_cacheFileName = "brand-list_" + ori_page+"_" + data.mallid;
		}else if(data.type == "search"){
			m_cacheFileName ="brand-list_search_tmp_"+ ori_page;
		}else{
			m_cacheFileName = "brand-list_" + ori_page+"_" + data.id;
		}
		COM.UTILS.post_mpzkApi(params,function(json){//处理缓存数据
			if(m_preflag[ori_page]){
				window.localStorage.setItem(m_localName[page],JSON.stringify(json));
				if(totalCnt[ori_page] != parseInt(json.total_count)){
					blupdate[ori_page] = true;
//					$("#pullDown_"+ori_page).parent().fadeIn();
//					COM.UTILS.loadedIscrollRefresh(m_scrollArray,ori_page);
				}else{
					if(cacheinfo[ori_page].discounts.length < json.discounts.length ){
						blupdate[ori_page] = true;
					}else{
						for(var i = 0; i < json.discounts.length; i++) {
							if(json.discounts[i].id != cacheinfo[ori_page].discounts[i].id || 
							   json.discounts[i].valid_days != cacheinfo[ori_page].discounts[i].valid_days){
								blupdate[ori_page] = true;
								break;
							}
						}
					}
				}
				if(blupdate[ori_page]){
					$("#pullDown_0").parent().fadeIn();
					COM.UTILS.loadedIscrollWithRefreshAndMore(m_scrollArray,"page_","scroll_",0,COM.IMGLOAD.lazyLoadImg,"pullDown_",refreshPage,"pullUp_",nextPage);
				}
				m_preflag[ori_page]=false;
			}else{
				COM.UTILS.log("m_cacheFileName is" +m_cacheFileName);
				COM.FILECACHE.getFileContent(m_cacheFileName, function(pdata){
					if (pdata.msg == "ok" && pdata.data) {
						COM.UTILS.log("文件存在且不为空");
						COM.UTILS.log("数据类型是"+data.type+", 是否是第一次加载:"+m_isFirst[ori_page]);
						if (data.type == "search"&& m_isFirst[ori_page]) {
							m_isFirst[ori_page]=false;
							saveToParse(m_cacheFileName,json,json,cb);
							COM.UTILS.log("直接写文件内容...");
						}else{
							session = JSON.parse(pdata.data);
							var tmpse = JSON.stringify(session.discounts);
							var tmpjs = JSON.stringify(json.discounts);
							var str = tmpse.substring(0,tmpse.length - 1) + "," + tmpjs.substring(1,tmpjs.length - 1) +"]";
							session.discounts = eval(str);
							saveToParse(m_cacheFileName,session,json,cb,totalCnt[ori_page]);
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
			}
		},function(json){
			if (m_preflag[ori_page]) {
				m_preflag[ori_page] = false;
			}else {
				$("#page_" + ori_page).html('<div class="nulldiv"><span class="nullpic"></span></div>');
				uexWindow.closeToast();
			}
		});
}

/**
 * 解析数据
 * **/
function parseBrandResult(page,json,total){
	if(total){
		COM.UTILS.log("in parseBrandResult...1");
		totalCnt[ori_page] = total;
	}else{
		COM.UTILS.log("in parseBrandResult...2");
		totalCnt[ori_page] = parseInt(json.total_count);
	}
	COM.UTILS.log("in parseBrandResult,totalCnt[ori_page] ="+totalCnt[ori_page] +", json is "+JSON.stringify(json));
	if(totalCnt[ori_page] > 0){
		var pageno = 0;
		var a = [];
		var b = [];
		for(var i = 0; i<json.discounts.length; i++){
			var list = json.discounts[i];
			var distance = "";
			var tmpl = COM.STRINGUTIL.parseFavContent(list.tmpl,list.tmpl_params);
			tmpl = COM.STRINGUTIL.getSubString(tmpl,82,"...");
			var event = COM.UTILS.getListBindEventString('{\'index\':'+ m_count[page] +',\'type\':' + page + ',\'fileName\':\'' + m_cacheFileName + '\'},cbOntouchend');
			a.push('<li id="brand_' + page + '_' + m_count[page] + '"' + event + '>');
			a.push('	<div class="lleft">');
			a.push('		<img class="lleft_img  x-lazyImg" src="../css/images1/mr0.png" x-picWidth="80" x-picHeight="80" x-picId="' + list.brand_pic + '"/>');
			a.push('	</div>');
			a.push('	<div class="lc">');
			a.push('		<div class="lc_title">' + tmpl + '</div>');
			var mall_storename = "";		// 商场-商户名称
			if(undefined != list.emporium_name){
				mall_storename += list.emporium_name + "-";
			}
			mall_storename += list.store_name;
			a.push('		<div class="lc_address">'+ mall_storename +'</div>');
			a.push('	</div>');
			a.push('	<div class="list_point"></div>');
			m_count[page]++;
			
			if(list.valid_days < 0){
				distance = "<span class='orange'>差"+(-list.valid_days)+"天开始</span>";
			}else if(0 == list.valid_days){
				distance = "已过期";
			}else{
				distance = "<span class='orange'>过"+list.valid_days+"天结束</span>";
			}
			
			if(page == 3 && typeof(list.distance) != "undefined"){
				distance += " " + COM.STRINGUTIL.formatDistance(list.distance);
			}else if(page == 3 && typeof(list.distance) == "undefined"){
				distance += " " + "- 公里"
			}
			a.push('	<div class="list_distance">' + distance + '</div>');
			a.push('</li>');
		}
		$("#brand_list"+page).append(a.join(''));
		m_curpage[ori_page] = Math.ceil(m_count[ori_page]/COM.CONST.COUNT_PER_PAGE);
		if(m_curpage[page] < Math.ceil(totalCnt[ori_page]/COM.CONST.COUNT_PER_PAGE) && m_curpage[page] < COM.CONST.MAXPAGE){
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
		if(m_scrollArray[ori_page] != null)
			m_scrollArray[ori_page].refresh();
		uexWindow.closeToast();
		COM.UTILS.loadedIscrollWithRefreshAndMore(m_scrollArray,"page_","scroll_",ori_page,COM.IMGLOAD.lazyLoadImg,"pullDown_",refreshPage,"pullUp_",nextPage);
	}
	array.push("page_" + page);
	uexWindow.closeToast();
	preloadServerData();//预加载服务器数据
}

function refreshPage(){
	COM.UTILS.log("in refreshPage");
	$("#pullDown_"+ori_page).parent().hide();
	//读取本地localStorage缓存数据进行保存并解析
	if(window.localStorage.getItem(m_localName[ori_page])){
		var refreshData=JSON.parse(window.localStorage.getItem(m_localName[ori_page]));
//		if(totalCnt[ori_page] != parseInt(refreshData.total_count)){
		if(blupdate[ori_page]){
			cacheinfo[ori_page] = refreshData;
			blupdate[ori_page] = false;
			COM.UTILS.log("in refreshPage,data was changed...");
			$("#pullUp_"+ori_page).parent().hide();
			$("#brand_list"+ori_page).empty();
			m_curpage[ori_page]=1;
			m_count[ori_page]=0;
			saveToParse(m_cacheFileName,refreshData,refreshData,null);
		}else{
			COM.UTILS.log("in refreshPage,data was no changed...");
		}
	}else{
		COM.UTILS.log("in refreshPage,localStorage do not has the item of tmp_brand...");		
	}
}
function preloadServerData(){
	if((data.type != "search")&&m_isFirst[ori_page]){
		m_isFirst[ori_page]=false;
		m_preflag[ori_page]=true;
		if(ori_page == 3){
			COM.UTILS.getLocation(loadDataFromServer);
		}else{
			loadDataFromServer();
		}
	}
}

function cbOntouchend(para){
	uexWindow.evaluateScript('', '0', "COM.UTILS.openWindow('brand-detail','brand-detail.html?index=" + para.index + '&type=' + para.type + '&fileName=' + para.fileName + "')");
}	
/***
 * 距离热度时间页签切换的方法
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
	if(to_page == 3){
		uexWindow.toast('1','5','加载中...',"");
		if(m_isCat){
			COM.UTILS.getLocation(loadDataFromServer);
		}else{
			COM.UTILS.getLocation(loadDataFromCache);
		}
	}else{
		if(m_isCat){
			loadDataFromServer();
		}else{
			loadDataFromCache();
		}
	}
}
function nextPage(){
	if(m_curpage[ori_page] < Math.ceil(totalCnt[ori_page]/COM.CONST.COUNT_PER_PAGE) && m_curpage[ori_page] < COM.CONST.MAXPAGE){
		m_curpage[ori_page]++;
		if(ori_page == 3){
			COM.UTILS.getLocation(loadDataFromServer);
		}else{
			loadDataFromServer();
		}
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
		if(ori_page == 3){
			COM.UTILS.getLocation(loadDataForDetail);
		}else{
			loadDataForDetail();
		}
	}
}
function loadDataForDetail(pos){
	m_isFirst[ori_page]=false;
	var cb = function(page){
		console.log("in loadDataForDetail now page is "+ page);
		uexWindow.evaluateScript("brand-detail", "0",'parsePageResult('+ parseInt(page) +')');
	};
	if(pos){
		loadDataFromServer(pos,cb);
	}else{
		loadDataFromServer("",cb);
	}
}


function closeWindow(){
	uexWindow.evaluateScript("main", "0",'openPopover(\'home\',\'home\',\'home.html\')');
	COM.UTILS.openWindow('main','../main.html',0);
	if(data.type == "brand"){
		setTimeout(function(){
			COM.UTILS.closeWindow(0);
		},500);
	}else if(data.type == "mall"){
		setTimeout(function(){
			uexWindow.evaluateScript('mall-list', '0', 'COM.UTILS.closeWindow(0)');
			uexWindow.evaluateScript('mall-classify', '0', 'COM.UTILS.closeWindow(0)');
			COM.UTILS.closeWindow(0);
		},100);
	}else if(data.type == "search"){
		setTimeout(function(){
			uexWindow.evaluateScript('search-type', '0', 'COM.UTILS.closeWindow(0)');
			COM.UTILS.closeWindow(0);
		},100);
	}
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

function saveToParse(cFileName,saveDate,parseDate,cbCall,total){
	COM.FILECACHE.saveFileContent(cFileName,JSON.stringify(saveDate),function(pdata){
		console.log("cache file ok");
		if(cbCall){
			cbCall(m_curpage[ori_page]);
		}else{
			parseBrandResult(ori_page,parseDate,total);
		}
	},function(pdata){
		console.log("cache file error");
		if(cbCall){
			cbCall(m_curpage[ori_page]);
		}else{
			parseBrandResult(ori_page,parseDate,total);
		}
	});
}