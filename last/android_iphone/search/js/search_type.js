var ori_page = 0;//子页面切换的默认初始化pageid
var m_scrollArray=[null];//用于存放不同页面下的iscroll
var dparam;

function loadDataFromServer(){	
	uexWindow.toast('1','5','加载中...',"");
	if(dparam.from=="brand-list"){
		COM.UTILS.post_mpzkApi({"cmd":"2306"},function(json){
				console.log("in COM.UTILS.post_mpzkApi,data was "+JSON.stringify(json));
				parseTypeListData(json);
				uexWindow.closeToast();
			},function(json){
				$("#typelist").html('<div class="nulldiv"><span class="nullpic"></span></div>');
				uexWindow.closeToast();
			});
	}else if(dparam.from=="cardfav-list-search"){
		COM.UTILS.post_mpzkApi({"cmd":"280E"},function(json){
				console.log("in COM.UTILS.post_mpzkApi,data was "+JSON.stringify(json));
				parseBankTypeListData(json);
				uexWindow.closeToast();
			},function(json){
				$("#typelist").html('<div class="nulldiv"><span class="nullpic"></span></div>');
				uexWindow.closeToast();
			});
	}
}
function parseBankTypeListData(data){
	console.log("in parseBankTypeListData,data was "+JSON.stringify(data));
	var a=[];
	for(var i=0,ilen=data.bank_store_cats.length;i<ilen;i++){
		console.log("length of bank_store_cats is "+ilen);
		console.log("cur is "+JSON.stringify(data.bank_store_cats[i]));
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
	$("#typelist").html(a.join(''));
	COM.UTILS.loadedIscrollNoMore(m_scrollArray,"page_","scroll_",ori_page,COM.IMGLOAD.lazyLoadImg);
	COM.IMGLOAD.lazyLoadImg($("#scroll_"+ori_page),"V",true);
}
//function parseBankTypeListData(data){
//	console.log("in parseBankTypeListData,data was "+JSON.stringify(data));
//	var a=[];
//	for(var i=0,ilen=data.brand_store_cats.length;i<ilen;i++){
//		var tmp=data.brand_store_cats[i];		
//		var event = COM.UTILS.getListBindEventString("{'id':"+ tmp.id + ",'name':'"+tmp.name+"'},cbOntouchendBank");
//		a.push('<li ' + event + '>');
//		a.push('	<div class="lleft">');
//		a.push('		<img x-picId="'+tmp.pic+'"src="../css/images1/mr0.png"  class="lleft_img x-lazyImg" x-picWidth="220" x-picHeight="220" />');
//		a.push('	</div>');
//		a.push('	<div class="lc">');
//		a.push('		<div class="lc_title">');
//		a.push('			<span>'+tmp.name+'</span>');
//		a.push('		</div>');
//		a.push('		<div class="lc_address">'+tmp.intro?tmp.intro:""+'</div>');
//		a.push('	</div>');
//		a.push('	<div class="list_point"></div></li>');
//	}
//	$("#typelist").html(a.join(''));
//	COM.IMGLOAD.lazyLoadImg($("#scroll_"+ori_page),"V",true);
//	COM.UTILS.loadedIscrollNoMore(m_scrollArray,"page_","scroll_",ori_page,COM.IMGLOAD.lazyLoadImg);
//}
function cbOntouchendBank(para){
	uexWindow.evaluateScript(dparam.from, '0', 'loadDataFromServerByFlush('+para.id+',"'+para.name+'");');
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
	COM.IMGLOAD.lazyLoadImg($("#scroll_"+ori_page),"V",true);
	COM.UTILS.loadedIscrollNoMore(m_scrollArray,"page_","scroll_",ori_page,COM.IMGLOAD.lazyLoadImg);
}

function cbOntouchend(para){
	uexWindow.evaluateScript(dparam.from, '0', 'loadDataFromServerByFlush('+para.id+',"'+para.name+'");');
}
