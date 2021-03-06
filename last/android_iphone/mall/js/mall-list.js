 var ori_page = 0;//子页面切换的默认初始化pageid
 var m_curpage = 1;//用于存放不同目录下的子页面的页码
 var m_scrollArray=[null];//用于存放不同页面下的iscroll
 var totalCnt = 0;
 
 // 添加缓存相关
var m_count = 0;//用于存放记录条数目(即对每条记录进行计数才不会出现翻页后m_curpage改变的情况)
var m_cacheFileName = "mall-list";	//缓存文件名
var m_preflag=false;	//是否是预加载
var m_isFirst=true;		//是否是第一次进入
var m_localName = "tmp_mall_list";
window.localStorage.removeItem(m_localName);
var cacheinfo = null;
var blupdate = false; 

$(function(){
});

function loadData(){
	setMallTitle();
	if(m_preflag){
		loadDataFromServer();
	}else{
		loadDataFromCache();
	}
}
function setMallTitle(){
	$("#title1").html(COM.SESSION.getCityInfo().cityName);
	//COM.UTILS.setTitle("title1",COM.SESSION.getCityInfo().cityName);
}
function loadDataForChgCIty(){
	$("#malllist").empty();
	$("#pullUp_"+ori_page).parent().hide();
	if(m_scrollArray[ori_page] != null)
		m_scrollArray[ori_page].refresh();
		
	m_preflag=false;
	m_isFirst=true;	
	m_curpage = 1;
	m_count = 0;
	totalCnt = 0;
	loadData();
}
/**
 * 从服务器获取数据
 * **/
function loadDataFromServer(){
		var params = {"cmd":2107,"city_id":COM.SESSION.getCityInfo().cityID,"uid":COM.SESSION.getUID(),"page_no":m_curpage,"page_count":COM.CONST.COUNT_PER_PAGE};
		if (!m_preflag) {
			uexWindow.toast('1', '5', '加载中...', "");
		}else{
			params.page_no = 1;
		}
		
		COM.UTILS.post_mpzkApi(params,function(json){
				if(m_preflag){
					window.localStorage.setItem(m_localName,JSON.stringify(json));
					if(totalCnt != parseInt(json.total_count)){
						blupdate = true;
//						$("#pullDown_"+ori_page).parent().fadeIn();
//						COM.UTILS.loadedIscrollWithRefreshAndMore(m_scrollArray,"page_","scroll_",ori_page,COM.IMGLOAD.lazyLoadImg,"pullDown_",refreshPage,"pullUp_",nextPage);
					}else{		// 是否需要更新
						if(cacheinfo.emporiums.length < json.emporiums.length ){
							blupdate = true;
						}else{
							for(var i = 0; i < json.emporiums.length; i++) {
								if(json.emporiums[i].id != cacheinfo.emporiums[i].id || 
								   json.emporiums[i].name != cacheinfo.emporiums[i].name ||
								   json.emporiums[i].pic != cacheinfo.emporiums[i].pic ||
								   json.emporiums[i].min_discount != cacheinfo.emporiums[i].min_discount ||
								   json.emporiums[i].discount_count != cacheinfo.emporiums[i].discount_count){
									blupdate = true;
									break;
								}
							}
						}
					}
					if(blupdate){
						$("#pullDown_"+ori_page).parent().fadeIn();
						COM.UTILS.loadedIscrollWithRefreshAndMore(m_scrollArray,"page_","scroll_",ori_page,COM.IMGLOAD.lazyLoadImg,"pullDown_",refreshPage,"pullUp_",nextPage);
					}
					m_preflag=false;
				}else{
					COM.UTILS.log("m_cacheFileName is" +m_cacheFileName);
					COM.FILECACHE.getFileContent(m_cacheFileName, function(pdata){
						if (pdata.msg == "ok" && pdata.data) {
							COM.UTILS.log("文件存在且不为空");
							COM.UTILS.log("是否是第一次加载:"+m_isFirst);
							if (m_isFirst) {
								m_isFirst=false;
								saveToParse(m_cacheFileName,json,json);
								COM.UTILS.log("直接写文件内容...");
							}else{
								var session = JSON.parse(pdata.data);
								var tmpse = JSON.stringify(session.emporiums);
								var tmpjs = JSON.stringify(json.emporiums);
								var str = tmpse.substring(0,tmpse.length - 1) + "," + tmpjs.substring(1,tmpjs.length - 1) +"]";
								session.emporiums = eval(str);
								saveToParse(m_cacheFileName,session,json,totalCnt);
								COM.UTILS.log("追加文件内容...");
							}
						}else {
							COM.UTILS.log("文件存在但是为空");
							saveToParse(m_cacheFileName,json,json);
						}
					}, function(pdata){
						COM.UTILS.log("文件不存在");
						saveToParse(m_cacheFileName,json,json);
					});
				}
		},function(json){
			if (m_preflag) {
				m_preflag = false;
			}else {
				$("#malllist").html('<div class="nulldiv"><span class="nullpic"></span></div>');
				uexWindow.closeToast();
			}
		});
}

function saveToParse(cFileName,saveDate,parseDate,total){
	COM.FILECACHE.saveFileContent(cFileName,JSON.stringify(saveDate),function(pdata){
		console.log("cache file ok");
		parseMallResult(parseDate,total);
	},function(pdata){
		console.log("cache file error");
		parseMallResult(parseDate,total);
	});
}

function loadDataFromCache(){
		COM.FILECACHE.getFileContent(m_cacheFileName, function(pdata){
			if (pdata.msg == "ok" && pdata.data) {
				cacheinfo = JSON.parse(pdata.data);
				parseMallResult(JSON.parse(pdata.data));
			}else {
				m_isFirst=false;
				console.log("in loadDataFromCache,read data fail");
				loadDataFromServer();
			}
		}, function(pdata){
			m_isFirst=false;
			loadDataFromServer();
		});
}

function preloadServerData(){
	if(m_isFirst){
		m_isFirst=false;
		m_preflag=true;
		loadDataFromServer();
	}
}


/**
 * 解析数据
 * **/
function parseMallResult(json,total){
	if(undefined != total){
		totalCnt = total;
	}else{
		totalCnt = parseInt(json.total_count);
	}
	console.log("totalCnt:"+totalCnt);
	if(totalCnt > 0){
		var a = [];
		var b = [];
		for(var i = 0; i<json.emporiums.length; i++){
			var list = json.emporiums[i];
			var min_discount = typeof(list.min_discount) == "undefined"? "-" : list.min_discount;
			var event = COM.UTILS.getListBindEventString('{\'mallid\':\''+ list.id + '\',\'name\':\'' + list.name +'\'},cbOntouchend');
			a.push('<li ' + event + '>');
			a.push('	<div class="lleft">');
			a.push('		<img class="lleft_img x-lazyImg" src="../css/images1/mr0.png" x-picWidth="80" x-picHeight="80" x-picId="'+ list.pic +'"/>');
			a.push('	</div>');
			a.push('	<div class="lc">');
			a.push('		<div class="lcmtitle">' + list.name + '</div>');
			a.push('		<div class="lcexplain">今日:<span class="lcmred">' + list.discount_count + '</span>个折扣信息</div>');
			a.push('		<div class="lcexplain">最低<span class="lcmred">' + min_discount + '</span>折起</div>');
			a.push('	</div>');
			a.push('	<div class="list_point"></div>');
			a.push('</li>');
			m_count++;
		}
		$("#malllist").append(a.join(''));
		m_curpage = Math.ceil(m_count/COM.CONST.COUNT_PER_PAGE);
		if(m_curpage < Math.ceil(totalCnt/COM.CONST.COUNT_PER_PAGE) && m_curpage < COM.CONST.MAXPAGE){
			$("#pullUp_"+ori_page+" > span").html("向上拉动加载更多...");
			$("#pullUp_"+ori_page).parent().show();
		}else{
			$("#pullUp_"+ori_page).parent().hide();
		}
		COM.UTILS.loadedIscrollWithRefreshAndMore(m_scrollArray,"page_","scroll_",ori_page,COM.IMGLOAD.lazyLoadImg,"pullDown_",refreshPage,"pullUp_",nextPage);
		COM.IMGLOAD.lazyLoadImg($("#scroll_"+ori_page));
	}else{
		$("#malllist").html('<div class="nulldiv"><span class="nullpic"></span></div>');
		COM.UTILS.loadedIscrollWithRefreshAndMore(m_scrollArray,"page_","scroll_",ori_page,COM.IMGLOAD.lazyLoadImg,"pullDown_",refreshPage,"pullUp_",nextPage);
	}
	uexWindow.closeToast();
	endTime();
	preloadServerData();//预加载服务器数据
}
function cbOntouchend(para){
	uexWindow.evaluateScript('', '0', "COM.UTILS.openWindow('brand-list','brand/brand-list.html?type=mall&mallid=" + para.mallid + '&name=' + COM.UTILS.encodeURIComponent(para.name) + "')");
}

function refreshPage(){
	COM.UTILS.log("in refreshPage");
	$("#pullDown_"+ori_page).parent().fadeOut();
	//读取本地localStorage缓存数据进行保存并解析
	if(window.localStorage.getItem(m_localName)){
		var refreshData=JSON.parse(window.localStorage.getItem(m_localName));
//		if(totalCnt != parseInt(refreshData.total_count)){
		if(blupdate){
			cacheinfo = refreshData;
			blupdate = false;
			COM.UTILS.log("in refreshPage,data was changed...");
			$("#pullUp_"+ori_page).parent().hide();
			$("#malllist").empty();
			m_count = 0;
			m_curpage=1;
			saveToParse(m_cacheFileName,refreshData,refreshData);
		}else{
			COM.UTILS.log("in refreshPage,data was no changed...");
		}
	}else{
		COM.UTILS.log("in refreshPage,localStorage do not has the item of "+m_localName+"...");		
	}
}

function nextPage(){
	if(m_curpage < Math.ceil(totalCnt/COM.CONST.COUNT_PER_PAGE) && m_curpage < COM.CONST.MAXPAGE){
		m_curpage = Math.ceil(m_count/COM.CONST.COUNT_PER_PAGE);
		m_curpage++;
		loadDataFromServer();
//		$("#nextPage").html("正在加载下" + COM.CONST.COUNT_PER_PAGE + "条数据");
	}
}

function startTime(){
	start_t=new Date();
	start_t=start_t.getTime();
}

function endTime(){
	end_t=new Date();
	end_t=end_t.getTime();
	console.log("time is "+(end_t-start_t)/1000);
}
