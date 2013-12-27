 var ori_page = 0;//子页面切换的默认初始化pageid
 var m_scrollArray=[null];//用于存放不同页面下的iscroll
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
			var event = COM.UTILS.getListBindEventString('{\'catid\':\'' + list.id +'\',\'name\':\''+list.name + '\'},cbOntouchend');
			a.push('<li ' + event + '>');
			a.push('	<div class="lleft">');
			a.push('		<img class="lleft_img x-lazyImg" src="../css/images1/mr0.png" x-picWidth="80" x-picHeight="80" x-picId="'+ list.pic +'"/>');
			a.push('	</div>');
			a.push('	<div class="lc">');
			a.push('		<div class="lc_title">' + list.name + '</div>');
			a.push('		<div class="lc_address">' + list.intro + '</div>');//描述暂无
			a.push('	</div>');
			a.push('	<div class="list_point"></div>');
			a.push('</li>');
		}
		$("#classifylist").append(a.join(''));
		COM.UTILS.loadedIscrollNoMore(m_scrollArray,"page_","scroll_",ori_page,COM.IMGLOAD.lazyLoadImg);
		COM.IMGLOAD.lazyLoadImg($("#scroll_"+ori_page),"V",true);
		//COM.IMGLOAD.lazyLoadImg($("#classifylist"),"V",true);
	}else{
		$("#classifylist").html('<div class="nulldiv"><span class="nullpic"></span></div>');
	}
	uexWindow.closeToast();
}
function cbOntouchend(para){
	COM.UTILS.log("name is "+para.name);
	uexWindow.evaluateScript('brand-list','0','loadDataForCat('+ para.catid +',\''+ para.name + '\');');
	uexWindow.evaluateScript('','0', "COM.UTILS.closeWindow(-1);");
}