var data;
var offset;		// 偏移量
var m_curpage;
var brandid;
var movearea;
var m_pagepointer = 0//用于判断是上翻页还是下翻页
var total = 0;
var jsoncache = null;
var after = true;		// 第一次默认显示后面的部分
var ori_page;		// 初始传入计算所得的页面
var first = true;
var stype={"sina":false,"qq":false};

function initPara(){
	data = zy_parse();
	offset = data.index%COM.CONST.COUNT_PER_PAGE;		// 偏移量
	m_curpage = parseInt(data.index/COM.CONST.COUNT_PER_PAGE,10)+1;
	if(0==offset){		// 页面的最后一条时
		offset=10;
		--m_curpage;
	}
	brandid = (data.brandid==undefined)?"":data.brandid;
	if(offset==1)after = false;
	ori_page = m_curpage;		// 初始传入计算所得的页面
	console.log("索引号："+data.index+",初始页码："+m_curpage+",偏移量："+offset);
}

function loadData(){
	COM.DIALOG.waiting("正在加载中...");
	var params = {"cmd":"2C04","page_no":m_curpage,"page_count":COM.CONST.COUNT_PER_PAGE,"sort_type":1};
	if("" != brandid){
		params.brand_id = brandid;
	}
	COM.UTILS.post_mpzkApi(params,function(json){
		parseResult(json);
		COM.DIALOG.closewaiting();
	});
}

function parseResult(json){
	total = json.total_count;
	var a = [];
	var b = [];
	if(first){
		jsoncache = json;
		first = false;
	}

	var start = 0;
	var end = json.brand_newses.length;
	if(0 == m_pagepointer && offset!=1){		
		start = offset-1;
	}else if(1 == m_pagepointer && offset!=1){
		end = offset-1;
	}
	var nowpage = 0;
	console.log("start:"+start+",end:"+end+",offset:"+offset+",m_pagepointer:"+m_pagepointer);
	for(var i=start;i<end;++i){
		var news = json.brand_newses[i];
		a.push('<section class="font_common detsection tc">');		
		a.push('	<div class="clearfloat">');	
		a.push('		<div class="dis dis_content mb15">');	
		a.push('			<div class="news_title">');	
		var gsevent = COM.UTILS.getListBindEventString('{\'brandid\':\''+ news.brand_id + '\',\'name\':\''+news.brand_name+'\'},cbGs');
		a.push('				<div class="brand" '+gsevent+'>');	
		a.push('					<img x-picId="'+news.brand_pic_1+'" src="../css/images1/mr0.png" class="x-lazyImg" x-picWidth="48" x-picHeight="48"/>');	
		a.push('					<div class="brandname fl">'+news.brand_name+'</div>');	
		a.push('					<span class="btn btn_rightpoint btn_rightpoint_loc btn_rightpoint_top"></span>');	
		a.push('				</div>');	
		var time = news.create_at.split(" ");
		a.push('				<div class="date font_gray">'+time[0]+'</div>');	
		a.push('			</div>');	
		a.push('			<div class="news_html">');	
		var newinfo = news.news_info;
		newinfo = newinfo.substring(9,newinfo.length);
		newinfo = newinfo.substring(0,newinfo.length-3);
		a.push(newinfo);
		a.push('			</div>');
		a.push('			<div class="clear"></div>');
		a.push('			<div class="solidline"></div>');	
		a.push('			<div class="dis_feedback">');	
		a.push('				<div class="box_l">');	
		a.push('					<span class="icon icon_sina"></span>');	
		a.push('					<span class="icon_label font_common">分享到<br/>新浪微博</span>');	
		a.push('				</div>');	
		a.push('				<div class="box_m"></div>');	
		a.push('				<div class="box_r">');	
		a.push('					<span class="icon icon_tx"></span>');	
		a.push('					<span class="icon_label font_common">分享到<br>腾讯微博 </span>');	
		a.push('				</div>');	
		a.push('			</div>');	
		a.push('		</div>');	
		a.push('	</div>');	
		a.push('</section>');
		b.push('<li id="chgpage'+nowpage+'" onclick="gopage('+nowpage+')" class="unc">'+nowpage+'</li>');
		nowpage++;
	}
	
	$("#a2").html(a.join(''));
	$("#curpage").html(b.join(''));
	loadPointer();
	$("#a2 input[type='image']").each(function(){
		var src = $(this).attr("src");
		if(src[0]=='/'){
			src = COM.CONST.DOMAIN + src;
			$(this).attr("src",src);
		}
	});
	
	$(".news_html").each(function(){
		var obj = $(this).siblings(".dis_feedback");
		var newinfo = $(this).text();
		newinfo = newinfo.replace(/\r/g,"");
		newinfo = newinfo.replace(/\n/g,"");
		
		obj.children(".box_l").attr("ontouchmove","COM.UTILS.touchMoveEvent();");
		obj.children(".box_l").attr("ontouchend","COM.UTILS.touchendEvent('"+newinfo+"',sinaClick);");
		obj.children(".box_r").attr("ontouchmove","COM.UTILS.touchMoveEvent();");
		obj.children(".box_r").attr("ontouchend","COM.UTILS.touchendEvent('"+newinfo+"',qqClick);");
	});
	COM.IMGLOAD.lazyLoadImg($("#page_0"));
}

function sinaClick(para){
	COM.UTILS.log("in sinaClick,para = "+para);
	stype.sina=true;
	stype.bmsg="@八千优惠  #品牌故事# "+para;
	stype.bfrom="news-detail";
	window.localStorage.setItem("sharetext",JSON.stringify(stype));
	COM.UTILS.openWindow('shareBlog','../util/shareBlog.html?to=sina',0);
}

function qqClick(para){
	COM.UTILS.log("in qqClick,para = "+para);
	stype.qq=true;
	stype.bmsg="@八千优惠  #品牌故事# "+para;
	stype.bfrom="news-detail";
	window.localStorage.setItem("sharetext",JSON.stringify(stype));
	COM.UTILS.openWindow('shareBlog','../util/shareBlog.html?to=qq',0);
}
/**
 * 声明滑动翻页的函数
 * */
function loadPointer() {
	if(typeof(movearea) != "undefined"){
		movearea.destroy();
	}
	if(m_pagepointer == 1){
		movearea = new zyFlip("a2", "H","pre",prefun,nextfun,changePage);
		m_pagepointer = 0;
	}else{
		movearea = new zyFlip("a2", "H","",prefun,nextfun,changePage);
	}
}

function changePage(){
	$("#chgpage"+movearea.currentPoint).siblings(".cur").removeClass("cur");
 	$("#chgpage"+movearea.currentPoint).addClass("cur");
}

/**
 * 上翻页的函数
 * */
function prefun(){
	console.log("in prefun and m_curpage is "+m_curpage);
	if(m_curpage == 1 && offset==1)return;
	if(1 != ori_page && ori_page == m_curpage && !after)offset = 1;
	m_pagepointer = 1;
	if(1 == ori_page && ori_page == m_curpage && !after)m_pagepointer = 0;
	if(offset==1 || (ori_page == m_curpage && !after) ){
		if(1 == m_curpage)return;
		m_curpage--;
		setTimeout(function(){
			loadData();
		},100);
	}else{
		after = false;
		setTimeout(function(){
			parseResult(jsoncache);
		},100);
	}
}

/**
 * 下翻页的函数
 * */
function nextfun(){
	console.log("in nextfun and m_curpage is "+m_curpage);
	if(m_curpage < Math.ceil(total/COM.CONST.COUNT_PER_PAGE) && m_curpage < COM.CONST.MAXPAGE){
		if(ori_page == m_curpage && after)offset=1;
		if((1==offset) || (ori_page == m_curpage && after)){		
			m_curpage++;
			loadData();
		}else{
			after = true;
			setTimeout(function(){
				parseResult(jsoncache);
			},100);
		}
	}else{
		return;
	}
}

function returnList(){
	uexWindow.evaluateScript('', '0', 'COM.UTILS.closeWindow()');
}
function closeWindow(){
	uexWindow.evaluateScript('news-list', '0', 'closeWindow()');
	setTimeout(function(){
		COM.UTILS.closeWindow(0);
		COM.UTILS.log("in news-detail close window");
	},1000);
}
function reLoadData(){
	oauthWeiboOk();
}
function cbGs(para){
	console.log("brand:"+para.brandid+","+para.name);
	COM.UTILS.openWindow('brandinfo-detail','../brand/brandinfo-detail.html?brandid=' + para.brandid + '&name=' + COM.UTILS.encodeURIComponent(para.name) + "&flag=0");
}