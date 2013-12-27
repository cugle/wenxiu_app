var m_curpage = 1;//用于存放不同目录下的子页面的页码
var m_scrollArray=[null];//用于存放不同页面下的iscroll
var totalCnt = 0;
var vkeyword={"flag":false};

// 添加缓存相关
var m_count = 0;//用于存放记录条数目(即对每条记录进行计数才不会出现翻页后m_curpage改变的情况)
var m_cacheFileName = "brandinfo";	//缓存文件名
var m_preflag=false;	//是否是预加载
var m_isFirst=true;		//是否是第一次进入
var m_localName = "tmp_brandinfo";
window.localStorage.removeItem(m_localName);
var cacheinfo = null;
var blupdate = false;

function loadData(){
	if(m_preflag){
		loadDataFromServer();
	}else{
		loadDataFromCache();
	}
}
/**
 * 从服务器获取数据
 * **/
function loadDataFromServer(){
		if (!m_preflag) {
			uexWindow.toast('1', '5', '加载中...', "");
		}
		var params=null;
		params = {"cmd":2013,"city_id":COM.SESSION.getCityInfo().cityID,"sort_type":"1","uid":COM.SESSION.getUID(),"page_no":m_curpage,"page_count":COM.CONST.COUNT_PER_PAGE};
		if(vkeyword.flag){//从搜索跳转
			params.keyword = vkeyword.keyword;
		}else{
			if(m_preflag){
				params.page_no = 1;
			}
		}
		COM.UTILS.post_mpzkApi(params,function(json){
			if(vkeyword.flag){ 		//从搜索跳转
				parseBrandInfoResult(json);
			}else{
				if(m_preflag){
					window.localStorage.setItem(m_localName,JSON.stringify(json));
					if(totalCnt != parseInt(json.total_count)){
						$("#pullDown_0").parent().fadeIn();
						blupdate = true;
						COM.UTILS.loadedIscrollWithRefreshAndMore(m_scrollArray,"page_","scroll_",0,COM.IMGLOAD.lazyLoadImg,"pullDown_",refreshPage,"pullUp_",nextPage);
					}else{		// 是否需要更新
						if(cacheinfo.brands.length < json.brands.length ){
							blupdate = true;
						}else{
							for(var i = 0; i < json.brands.length; i++) {
								if(json.brands[i].id != cacheinfo.brands[i].id || 
								   json.brands[i].name != cacheinfo.brands[i].name ||
								   json.brands[i].pic_1 != cacheinfo.brands[i].pic_1){
									blupdate = true;
									break;
								}
							}
						}
						if(blupdate){
							$("#pullDown_0").parent().fadeIn();
							COM.UTILS.loadedIscrollWithRefreshAndMore(m_scrollArray,"page_","scroll_",0,COM.IMGLOAD.lazyLoadImg,"pullDown_",refreshPage,"pullUp_",nextPage);
						}
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
								var tmpse = JSON.stringify(session.brands);
								var tmpjs = JSON.stringify(json.brands);
								var str = tmpse.substring(0,tmpse.length - 1) + "," + tmpjs.substring(1,tmpjs.length - 1) +"]";
								session.brands = eval(str);
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
			}
		},function(json){
			if (m_preflag) {
				m_preflag = false;
			}else {
				$("#brand_list0").html('<div class="nulldiv"><span class="nullpic"></span></div>');
				uexWindow.closeToast();
			}
		});
}

function saveToParse(cFileName,saveDate,parseDate,total){
	COM.FILECACHE.saveFileContent(cFileName,JSON.stringify(saveDate),function(pdata){
		console.log("cache file ok");
		parseBrandInfoResult(parseDate,total);
	},function(pdata){
		console.log("cache file error");
		parseBrandInfoResult(parseDate,total);
	});
}

function loadDataFromCache(){
		COM.FILECACHE.getFileContent(m_cacheFileName, function(pdata){
			if (pdata.msg == "ok" && pdata.data) {
				cacheinfo = JSON.parse(pdata.data);
				parseBrandInfoResult(JSON.parse(pdata.data));
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
function parseBrandInfoResult(json,total){
	if(undefined != total){
		totalCnt = total;
	}else{
		totalCnt = parseInt(json.total_count);
	}
	if(totalCnt > 0){
		var a = [];
		for(var i = 0; i<json.brands.length; i++){
			var list = json.brands[i];
			var event = COM.UTILS.getListBindEventString('{\'brandid\':\''+ list.id + '\',\'name\':\'' + list.name +  '\'},cbOntouchend');
			a.push('<li ' + event + '>');
			a.push('	<div class="lleft">');
			a.push('		<img x-picId="'+list.pic_1+'"src="../css/images1/mr0.png"  class="lleft_img x-lazyImg" x-picWidth="80" x-picHeight="80" />');
			a.push('	</div>');
			a.push('	<div class="lc">');
			a.push('		<div class="lc_title">');
			a.push('			<span>'+list.name+'</span>');
			a.push('		</div>');
			a.push('		<div class="lc_address">(品牌故事、专卖店、品牌折扣)</div>');
			a.push('	</div>');
			a.push('	<div class="list_point"></div></li>');
			m_count++;
		}
		$("#brand_list0").append(a.join(''));
		m_curpage = Math.ceil(m_count/COM.CONST.COUNT_PER_PAGE);
		if(m_curpage < Math.ceil(totalCnt/COM.CONST.COUNT_PER_PAGE) && m_curpage < COM.CONST.MAXPAGE){
			$("#pullUp_0 > span").html("向上拉动加载更多...");
			$("#pullUp_0").parent().show();
		}else{
			$("#pullUp_0").parent().hide();
		}
		COM.UTILS.loadedIscrollWithRefreshAndMore(m_scrollArray,"page_","scroll_",0,COM.IMGLOAD.lazyLoadImg,"pullDown_",refreshPage,"pullUp_",nextPage);
		COM.IMGLOAD.lazyLoadImg($("#scroll_0"));
	}else{
		$("#brand_list0").html('<div class="nulldiv"><span class="nullpic"></span></div>');
		COM.UTILS.loadedIscrollWithRefreshAndMore(m_scrollArray,"page_","scroll_",0,COM.IMGLOAD.lazyLoadImg,"pullDown_",refreshPage,"pullUp_",nextPage);
	}
	uexWindow.closeToast();
	preloadServerData();//预加载服务器数据
}
function cbOntouchend(para){
	uexWindow.evaluateScript("", "0","COM.UTILS.openWindow('brandinfo-detail','brand/brandinfo-detail.html?brandid=" + para.brandid + "&name=" + COM.UTILS.encodeURIComponent(para.name) + "&flag=0" +"\')");
	
}
function refreshPage(){
	COM.UTILS.log("in refreshPage");
	$("#pullDown_0").parent().fadeOut();
	//读取本地localStorage缓存数据进行保存并解析
	if(window.localStorage.getItem(m_localName)){
		var refreshData=JSON.parse(window.localStorage.getItem(m_localName));
//		if(totalCnt != parseInt(refreshData.total_count)){
		if(blupdate){
			cacheinfo = refreshData;
			blupdate = false;
			COM.UTILS.log("in refreshPage,data was changed...");
			$("#pullUp_0").parent().hide();
			$("#brand_list0").empty();
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
	}
}

function bindAutoComplete() {
	console.log("in bindAutoComplete");
	$("#key").autocomplete(COM.CONST.MPZKAPI_URL + "?jsonp=?", {
				extraParams : {
					"x_userID" : 44,
					"x_TID" : 55,
					"v" : 256,
					"cmd" : '200E',
					"count":10
				},
				queryParamName:"keyword",
				minChars : 1,
				autoFill : false,
				filterResults : false,
				useDelimiter : false,
				selectFirst : false,
				remoteDataType : 'jsonp',
				processData : function(data) {
					console.log(JSON.stringify(data));
					var i, processed = [];
					for (i = 0, ilen = data.brands.length; i < ilen; i++) {
						processed.push([data.brands[i].alias, data.brands[i]]);
					}
					return processed;
				},
				onItemSelect : function(vdata) {
					console.log(vdata.data[0].value);
				}
			});
}

function searchBrand(){
	vkeyword.flag=true;
	vkeyword.keyword=$("#key").val();
	$("#brand_list0").empty();
	$("#pullUp_0").parent().hide();
	m_curpage = 1;
	loadDataFromServer();
}