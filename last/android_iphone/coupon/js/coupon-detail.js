var vdata;//用于页面间参数传递
var movearea;
var m_curpage;// 当前页数
var m_pagepointer = 0// 用于判断是上翻页还是下翻页
var m_vfirst=true;
 var m_titlecount = 0;//保存当前是第几页的第几条
var m_infoes;
var m_id = "";
var data;//保持缓存中的数据
 var m_cacheFileName;//缓存文件名
function loadDataFromSession(){
	uexWindow.toast("1","5","加载中...","");
	m_cacheFileName = vdata.fileName;
	console.log("m_cacheFileName:"+m_cacheFileName);
	m_titlecount = vdata.index - (vdata.index % COM.CONST.COUNT_PER_PAGE);
	getCacheFile(vdata.index);
	m_curpage = Math.ceil((parseInt(vdata.index) + 1) / COM.CONST.COUNT_PER_PAGE);
}
/***
 * 处理上下翻页后当前读第几页的函数
 * @param {} curpage
 */
function parsePageResult(curpage){
	COM.UTILS.log("in parsePageResult curpage is "+curpage);
	m_titlecount = (curpage-1) * COM.CONST.COUNT_PER_PAGE;
	getCacheFile((curpage-1) * COM.CONST.COUNT_PER_PAGE);
}
function getCacheFile(startpage){
		COM.FILECACHE.getFileContent(m_cacheFileName, function(data2){
		if (data2.msg == "ok" && data2.data) {
			data = JSON.parse(data2.data);
			parseCouponDetailInfo(startpage);
		}else {
			alert(1);
		}
	}, function(data){
		alert("error!");
	});
}
function parseCouponDetailInfo(startpage) {
	COM.DIALOG.closewaiting();
	if (data&&0 == data.ret_code) {
		m_infoes = data.coupons;
		var startindex = startpage - (startpage % COM.CONST.COUNT_PER_PAGE);
		COM.UTILS.log("startindex = " + startindex);
		var a = [];
		var b = [];
		var m_info;
		var ilen=0;
		ilen=m_infoes.length;
		console.log("DATA length is "+ilen);
		var chgpage = 0;
		var endindex = (startindex + COM.CONST.COUNT_PER_PAGE) > ilen ? ilen:(startindex + COM.CONST.COUNT_PER_PAGE);
		if(0<ilen && ilen >= startindex){
			for (var i = startindex; i < endindex; i++) {
				m_info = m_infoes[i];
				a.push('<section class="font_common detsection tc">');
				a.push('	<div class="clearfloat">');				
				a.push('		<div class="dis dis_content">');
				a.push('			<img x-picId="'+m_info.pic+'" class="coupon_img x-lazyImg" x-picWidth="390" x-picHeight="295" src="../css/images1/tpd.png"/>');
				a.push('		</div>');
				var brandid = data.brand_id?data.brand_id:m_info.brand_id;
				var brandname = data.brand_name?data.brand_name:m_info.brand_name;
				a.push('		<div onclick="COM.UTILS.openWindow(\'coupon-around\',\'coupon-around.html?id=' + brandid +"&name=" + COM.UTILS.encodeURIComponent(brandname) + '\',0);" class="dis dis_address">');
				a.push('			<span class="dis_address_icon"></span> ');
				a.push('			<span class="dis_address_where">单击查看周边</span>');
				a.push('		</div>');
				a.push('	</div>');
				a.push('</section>');
				b.push('<li id="chgpage' + chgpage + '" onclick="gopage(' + chgpage + ')" class="unc">' + chgpage + '</li>');
				chgpage ++;
			}
			$("#a2").html(a.join(''));
			$("#curpage").html(b.join(''));
			setTimeout(function(){
				loadPointer();
			},100);
			uexWindow.closeToast();
			
		}else{
			console.log("in parseCouponDetailInfo to clear,ilen="+ilen);
			$("#page_0").html('<div class="nulldiv"><span class="nullpic"></span></div>');
			uexWindow.closeToast();
			}
	}else{
		uexWindow.closeToast();
		$("#a2").html('<div class="nulldiv"><span class="nullpic"></span></div>');
	}
}

/**
 * 声明滑动翻页的函数
 */
function loadPointer() {
	if (typeof(movearea) != "undefined") {
		movearea.destroy();
	}
	if (m_pagepointer == 1) {
		movearea = new zyFlip("a2", "H", "pre", prefun, nextfun,changePagePoint);
		m_pagepointer = 0;
	} else {
		movearea = new zyFlip("a2", "H", "", prefun, nextfun, changePagePoint);
	}
}

/**
 * 改变翻页圆点样式
 */
function changePagePoint() {
	$("#chgpage" + movearea.currentPoint).siblings(".cur").removeClass("cur");
	$("#chgpage" + movearea.currentPoint).addClass("cur");
	$("#coupon_img").attr("x-picId",data.brand_pic?data.brand_pic:m_infoes[m_titlecount + movearea.currentPoint].brand_pic);
	$("#coupon_title").html(data.brand_name?data.brand_name:m_infoes[m_titlecount + movearea.currentPoint].brand_name);
	COM.IMGLOAD.lazyLoadImg($("#page_0"),"H");
	gopage(vdata.index %  COM.CONST.COUNT_PER_PAGE);
	m_id = "coupon_" + (parseInt(m_curpage-1)*COM.CONST.COUNT_PER_PAGE + parseInt(movearea.currentPoint));
}

/**
 * 上翻页的函数
 */
function prefun() {
	console.log("in prefun and m_curpage is "+m_curpage);
	if(m_curpage == 1)return;
	COM.DIALOG.waiting("正在加载中...");
	m_curpage--;
	m_pagepointer = 1;
	setTimeout(function(){
		parsePageResult(m_curpage);
	},100);
}

/**
 * 下翻页的函数
 * */
function nextfun() {
	console.log("in nextfun,m_curpage==>"+m_curpage+", pages==>"+Math.ceil(data.total_count/COM.CONST.COUNT_PER_PAGE));
	if(m_curpage < Math.ceil(data.total_count/COM.CONST.COUNT_PER_PAGE) && m_curpage < COM.CONST.MAXPAGE){
		COM.DIALOG.waiting("正在加载中...");
		m_curpage++;
		console.log("from:"+vdata.from);
		uexWindow.evaluateScript(vdata.from, "0",'nextPageForDetail('+ m_curpage +')');
	}else{
		uexWindow.closeToast();
		return;
	}
}
function gopage(pagenum){
	if(m_vfirst&&pagenum>0){
		console.log("in gopage("+pagenum+")");
		movearea.currentPoint=pagenum;
		 movearea.toIndex(movearea.currentPoint);
		 m_vfirst=false;
	}
 } 
function closeWindow(){
	uexWindow.evaluateScript(vdata.from, '0', 'closeWindow();');
	uexWindow.evaluateScript('', '0', 'COM.UTILS.closeWindow(0)');
}
function returnList(){
	uexWindow.evaluateScript(vdata.from, '0', 'loadDataFromSession(\''+ m_id +'\');');
	uexWindow.evaluateScript('', '0', 'COM.UTILS.closeWindow()');
} 