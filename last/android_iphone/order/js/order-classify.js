 var ori_page = 0;//子页面切换的默认初始化pageid
 var m_scrollArray=[null];//用于存放不同页面下的iscroll
 var data = zy_parse();//用于页面间参数传递
$(function(){
});

function loadData(){
	loadDataFromServer();
}
/**
 * 从服务器获取数据
 * **/
function loadDataFromServer(){
		uexWindow.toast('1','5','加载中...',"");
		var params = {"cmd":2306};
		COM.UTILS.post_mpzkApi(params,function(json){
			parseClassifyResult(json);
		},function(json){
//			$("#classifylist").html(json.error_info);
			$("#classifylist").html('<div class="nulldiv"><span class="nullpic"></span></div>');
			uexWindow.closeToast();
		});
}

/**
 * 解析数据
 * **/
function parseClassifyResult(json){
	var totalCnt = parseInt(json.brand_cats.length);
	if(totalCnt > 0){
		var a = [];
		var b = [];
		for(var i = 0; i<json.brand_cats.length; i++){
			var list = json.brand_cats[i];
			a.push('<li onclick="setSessionClassify('+ list.id +',\'' + list.name +'\')">');
			a.push('	<div class="lleft">');
			a.push('		<img class="lleft_img x-lazyImg" src="../css/images1/mr0.png" x-picWidth="80" x-picHeight="80" x-picId="'+ list.pic +'"/>');
			a.push('	</div>');
			a.push('	<div class="lc">');
			a.push('		<div class="lc_title">' + list.name + '</div>');
			a.push('		<div class="lc_address">'+ list.intro +'</div>');
			a.push('	</div>');
			a.push('	<div class="list_point"></div>');
			a.push('</li>');
		}
		$("#classifylist").append(a.join(''));
		COM.UTILS.loadedIscrollNoMore(m_scrollArray,"page_","scroll_",ori_page,COM.IMGLOAD.lazyLoadImg);
		COM.IMGLOAD.lazyLoadImg($("#scroll_"+ori_page));
//		COM.IMGLOAD.lazyLoadImg($("#classifylist"),"V",true);
		uexWindow.closeToast();
	}else{
		$("#classifylist").html('<div class="nulldiv"><span class="nullpic"></span></div>');
	}
}
function setSessionClassify(cid,name){
	console.log("cid"+cid+"name"+name);
	uexWindow.evaluateScript('order-list','0','getSessionClassify(\''+cid+'\',\''+ name +'\')');
	uexWindow.evaluateScript('','0','COM.UTILS.closeWindow(-1)');
}