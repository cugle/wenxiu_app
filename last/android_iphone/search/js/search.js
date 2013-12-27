var ori_page = 0;//子页面切换的默认初始化pageid
var array = [];//用于判断是否已经加载过改子页面
var m_scrollArray=[null,null,null];//用于存放不同页面下的iscroll
var dparam;

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

function loadDataFromServer(){	
	uexWindow.toast('1','5','加载中...',"");
	if(ori_page==0){
		COM.UTILS.post_mpzkApi({"cmd":"2306"},function(json){
				console.log("in COM.UTILS.post_mpzkApi,data was "+JSON.stringify(json));
				parseTypeListData(json);
				uexWindow.closeToast();
			},function(json){
				$("#typelist").html('<div class="nulldiv"><span class="nullpic"></span></div>');
				uexWindow.closeToast();
			});
	}else if(ori_page==2){
		COM.UTILS.post_mpzkApi({"cmd":"280E"},function(json){
				console.log("in COM.UTILS.post_mpzkApi,data was "+JSON.stringify(json));
				parseBankTypeListData(json);
				uexWindow.closeToast();
			},function(json){
				$("#typelist2").html('<div class="nulldiv"><span class="nullpic"></span></div>');
				uexWindow.closeToast();
			});
		
	}
	
}

function parseBankTypeListData(data){
	console.log("in parseBankTypeListData,data was "+JSON.stringify(data));
	var a=[];
	for(var i=0,ilen=data.bank_store_cats.length;i<ilen;i++){
		var tmp=data.bank_store_cats[i];		
		var event = COM.UTILS.getListBindEventString("{'id':"+ tmp.id + ",'name':'"+tmp.name+"'},cbOntouchendBank");
		a.push('<li ' + event + '>');
		a.push('	<div class="lleft">');
		a.push('		<img x-picId="'+tmp.pic+'"src="../css/images1/mr0.png"  class="lleft_img x-lazyImg" x-picWidth="220" x-picHeight="220" />');
		a.push('	</div>');
		a.push('	<div class="lc">');
		a.push('		<div class="lc_title">');
		a.push('			<span>'+tmp.name+'</span>');
		a.push('		</div>');
		a.push('		<div class="lc_address">'+tmp.intro+'</div>');
		a.push('	</div>');
		a.push('	<div class="list_point"></div></li>');
	}
	$("#typelist2").html(a.join(''));
	array.push("page_s" + ori_page);
	COM.UTILS.loadedIscrollNoMore(m_scrollArray,"page_","scroll_",ori_page,COM.IMGLOAD.lazyLoadImg);
	COM.IMGLOAD.lazyLoadImg($("#scroll_"+ori_page),"V",true);
}
function cbOntouchendBank(para){
	COM.UTILS.openWindow('cardfav-list-search','../creditcard/cardfav-list-search.html?type=search&id='+para.id
	+"&keyword="+COM.UTILS.encodeURIComponent($.trim($("#key").val()))
	+"&name=" + COM.UTILS.encodeURIComponent(para.name) 
	+"&alias=" + COM.UTILS.encodeURIComponent(para.name));
}
function toSearchResultGoThsj(){//特惠商户的搜索按钮
	var strKey=$.trim($("#key2").val());
	if(strKey.length<1){
		COM.DIALOG.alert("请输入关键字");
		return;
	}
	COM.UTILS.openWindow('cardfav-list-search',"../creditcard/cardfav-list-search.html?type=search&keyword="+ COM.UTILS.encodeURIComponent(strKey) );
}

function toSearchResultGoYhq(i){//电子优惠券的搜索按钮
	var strKey=$.trim($("#key1").val());
	if(i){
		if(strKey.length<1){
			COM.DIALOG.alert("请输入关键字");
			return;
		}
	}
	COM.UTILS.openWindow('coupon-list-search','../coupon/coupon-list-search.html?type=search&keyword='+COM.UTILS.encodeURIComponent(strKey));
}
function parseTypeListData(data){
	console.log("in parseTypeListData,data was "+JSON.stringify(data));
	var a=[];
	for(var i=0,ilen=data.brand_cats.length;i<ilen;i++){
		var tmp=data.brand_cats[i];		
		var event = COM.UTILS.getListBindEventString("{'id':"+ tmp.id + ",'name':'"+tmp.name+"'},cbOntouchend");
		a.push('<li ' + event + '>');
		a.push('	<div class="lleft">');
		a.push('		<img x-picId="'+tmp.pic+'"src="../css/images1/mr0.png"  class="lleft_img x-lazyImg" x-picWidth="220" x-picHeight="220" />');
		a.push('	</div>');
		a.push('	<div class="lc">');
		a.push('		<div class="lc_title">');
		a.push('			<span>'+tmp.name+'</span>');
		a.push('		</div>');
		a.push('		<div class="lc_address">'+tmp.intro+'</div>');
		a.push('	</div>');
		a.push('	<div class="list_point"></div></li>');
	}
	$("#typelist").html(a.join(''));
	array.push("page_s" + ori_page);
	COM.IMGLOAD.lazyLoadImg($("#scroll_"+ori_page),"V",true);
	COM.UTILS.loadedIscrollNoMore(m_scrollArray,"page_","scroll_",ori_page,COM.IMGLOAD.lazyLoadImg);
}


function cbOntouchend(para){
	COM.UTILS.openWindow('brand-list','../brand/brand-list.html?type=search&catid='+para.id
	+"&keyword="+COM.UTILS.encodeURIComponent($.trim($("#key").val()))+"&catname="+COM.UTILS.encodeURIComponent(para.name));
}

function toSearchResultGo(){//折扣的搜索按钮
	var strKey=$.trim($("#key").val());
	if(strKey.length<1){
		COM.DIALOG.alert("请输入关键字");
		return;
	}
	COM.UTILS.openWindow('brand-list','../brand/brand-list.html?type=search&keyword='+COM.UTILS.encodeURIComponent(strKey));
}

/***
 * 子页面切换方法
 */
function openSublingWindow(to_page){
	console.log("to_page="+to_page+",ori_page="+ori_page);
	if(to_page == ori_page) return;
	zy_anim_slide("page_s" + ori_page,"page_s" + to_page,"none",openSublingCheck(to_page));
//	$("#page_"+ori_page).hide();
//	$("#page_"+to_page).show();
//	openSublingCheck(to_page);
	setTimeout(function(){
		if(0 == to_page){
			$("#page_s0").css({"-webkit-transform":"none"});
		}
	},200);
}
/***
 * 判断当前页签是否已加载过
 */
function openSublingCheck(to_page){
	ori_page = to_page;
	uexWindow.closeToast();
	if(array.indexOf("page_s"+ori_page) != -1) return;
	if(to_page == 0||to_page==2){
		loadDataFromServer();
	}
}
