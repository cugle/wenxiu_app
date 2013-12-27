 var vdata;//用于页面间参数传递
 var movearea;
 var m_curpage;// 当前页数
 var m_pagepointer = 0//用于判断是上翻页还是下翻页
 var m_infoes;
 var m_vfirst=true;
 var m_titlecount = 0;//保存当前是第几页的第几条
 var data;//保持缓存中的数据
 var m_id = "";//用来存储当前翻到第几个详情，返回给列表定位到那个位置
 var m_cacheFileName;//缓存文件名
  
 function loadDataFromSession(){	
	uexWindow.toast("1","5","加载中...","");
	m_cacheFileName = vdata.fileName;
	console.log("m_cacheFileName:"+m_cacheFileName);
	m_titlecount = vdata.index - (vdata.index % COM.CONST.COUNT_PER_PAGE);
	COM.UTILS.log("m_titlecount is " +m_titlecount);
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
	COM.UTILS.log("m_titlecount is " + m_titlecount);
	getCacheFile((curpage-1) * COM.CONST.COUNT_PER_PAGE);
}
function getCacheFile(startpage){
		COM.FILECACHE.getFileContent(m_cacheFileName, function(data2){
		if (data2.msg == "ok" && data2.data) {
			data = JSON.parse(data2.data);
			parseDetailInfo(startpage);
		}else {
			alert(1);
		}
	}, function(data){
		alert("error!");
	});
}
function parseDetailInfo(startpage){
	COM.DIALOG.closewaiting();
	console.log("in parseDetailInfo");
		if(data&&0==data.ret_code){		
			var a=[];	
			var b=[];
			var m_info;
			var ilen=0;
			var chgpage = 0;
			m_infoes=data.bank_discounts;		
			var startindex = startpage - (startpage % COM.CONST.COUNT_PER_PAGE);
			COM.UTILS.log("startindex = " + startindex);
			ilen=m_infoes.length;
			var endindex = (startindex + COM.CONST.COUNT_PER_PAGE) > ilen ? ilen:(startindex + COM.CONST.COUNT_PER_PAGE);
			if(0<ilen && ilen >= startindex){
				for(var i = startindex,ilen=m_infoes.length;i<endindex;i++){
					m_info = m_infoes[i];
					a.push('<section class="font_common detsection">');
					a.push('<div class="clearfloat">');
					a.push('	<div class="dis dis_content">');
					a.push('		<div class="mall_card">持卡优惠：</div>');
					a.push('		<div class="dashedline"></div>');
					a.push('		<div class="mall_info">');
					a.push('			<span >'+m_info.intro+'</span>');		
					a.push('			<div class="font_gray">有效期限至:' +  m_info.end_time + '</div>');
					a.push('		</div>');
					a.push('		<div class="dashedline"></div>');
					a.push('		<div class="mall_tel" style="">');
					a.push('			<span class="mall_tel_left"></span><span class="mall_tel_r"'); 
					var tel=m_info.tel?m_info.tel:"";
					if(tel){
						a.push('onclick="phonedial(\''+tel+'\')"');
					}
					a.push('			>服务电话：<span>'+tel+'</span></span>');
					a.push('		</div>');
					a.push('		<div class="solidline"></div>');
					a.push('		<div class="dis_feedback">');
					a.push('			<div class="box_l" onclick="toTuijian(\''+m_info.id+'\')">');
					a.push('				<span class="icon_new icon_tuijian"></span>');
					a.push('				推&nbsp;荐<br /> <span class="font_gray "><span class="tuicount">'+m_info.recom_count+'</span>人</span>');
					a.push('			</div>');
					a.push('			<div class="box_m"></div>');
					a.push('			<div class="box_r" onclick="toJubao(\''+m_info.id+'\')">');
					a.push('				<span class="icon_new icon_jubao"></span>举&nbsp;报<br />折&nbsp;扣');
					a.push('			</div>');
					a.push('		</div>');
					a.push('	</div>');
					if(m_info.lon){
						var mapevent = COM.UTILS.getListBindEventString('{\'lon\':'+ m_info.lon +',\'lat\':' + m_info.lat +'},cbOpenMap');
						a.push('	<div class="dis dis_address" ' + mapevent + '>');
						a.push('		<span class="dis_address_icon"></span> <span class="dis_address_where halmw  shenglh">'+m_info.address+'</span>');
						a.push('	</div>');
					}else{
						a.push('	<div class="dis dis_address_no">');
						a.push('		<span class="dis_address_icon_no"></span> <span class="dis_address_where halmw  shenglh">'+m_info.address+'</span>');
						a.push('	</div>');
					}
					a.push('</div>');
					a.push('</section>');
					b.push('<li id="chgpage'+chgpage+'" onclick="gopage('+chgpage+')" class="unc">'+chgpage+'</li>');
					chgpage ++;
				}
				$("#a2").html(a.join(''));
				$("#curpage").html(b.join(''));
				loadPointer();
				uexWindow.closeToast();
			}else{
				console.log("in parseDetailInfo to clear,ilen="+ilen);
				$("#page_0").html('<div class="nulldiv"><span class="nullpic"></span></div>');
				uexWindow.closeToast();
			}
	}else{
		uexWindow.closeToast();
		$("#a2").html('<div class="nulldiv"><span class="nullpic"></span></div>');
	}
}

function cbOpenMap(para){
	uexWindow.toast("1","5","地图加载中，请稍候...","");
	COM.UTILS.openWindow('baidumap','../util/baidumap.html?lon=' + para.lon + '&lat=' + para.lat );
	setTimeout(COM.DIALOG.closewaiting,2000);
}

	
	/**
 * 声明滑动翻页的函数
 * */
function loadPointer() {
	if(typeof(movearea) != "undefined"){
		movearea.destroy();
	}
	if(m_pagepointer == 1){
		movearea = new zyFlip("a2", "H","pre",prefun,nextfun,changePagePoint);
		m_pagepointer = 0;
	}else{
		movearea = new zyFlip("a2", "H","",prefun,nextfun,changePagePoint);
	}
}

/**
 * 改变翻页圆点样式
 * */
function changePagePoint(){
	$("#chgpage"+movearea.currentPoint).siblings(".cur").removeClass("cur");
 	$("#chgpage"+movearea.currentPoint).addClass("cur");
 	$("#mall_name").text(m_infoes[m_titlecount + movearea.currentPoint].store_name);
 	$("#mall_img").attr("x-picId",m_infoes[m_titlecount + movearea.currentPoint].pic);
 	$("#mall_img").addClass("x-lazyImg");
	COM.IMGLOAD.lazyLoadImg($("#page_0"),"H");
	COM.UTILS.post_mpzkApi({"cmd":"2811","discount_id":m_infoes[m_titlecount + movearea.currentPoint].id},function(json){},function(json){});
 	gopage(vdata.index %  COM.CONST.COUNT_PER_PAGE);
 	m_id = "fav_" + vdata.type + "_" + (parseInt(m_curpage-1)*COM.CONST.COUNT_PER_PAGE + parseInt(movearea.currentPoint));
}

/**
 * 上翻页的函数
 * */
function prefun(){
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
function nextfun(){
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

 
  function toTuijian(bid){
  		COM.DIALOG.waiting("正在提交中...");
		COM.UTILS.post_mpzkApi({"cmd":"280C",
			"uid":COM.SESSION.getUID(),
			"discount_id":bid
		},function(json){
			COM.DIALOG.closewaiting();
			COM.DIALOG.alert("推荐成功\n谢谢您的推荐",1);
			var $p=$(".tuicount").eq(movearea.currentPoint);
			$p.text(parseInt($p.text())+1);
			console.log("in  toTuijian,data的推荐个数是  "+data.bank_discounts[m_titlecount + movearea.currentPoint].recom_count+",m_infoes 的推荐个数是  "+m_infoes[m_titlecount + movearea.currentPoint].recom_count);
			data.bank_discounts[m_titlecount + movearea.currentPoint].recom_count=m_infoes[m_titlecount + movearea.currentPoint].recom_count+1;
			saveFileCache();
		},function(json){
			COM.DIALOG.closewaiting();
			if("undefined"==typeof(json.error_info)){
				COM.DIALOG.alert("哦哦，推荐失败了\n再点一下试试");
			}else{
				COM.DIALOG.alert(json.error_info);
			}
		});
 }
 
 function toJubao(bid){
 	COM.UTILS.openWindow('jubao','../util/jubao.html?from=2&id='+bid);
 }

function closeWindow(){
	uexWindow.evaluateScript(vdata.from, '0', 'closeWindow();');
	uexWindow.evaluateScript('', '0', 'COM.UTILS.closeWindow(0)');
}
function returnList(){
	uexWindow.evaluateScript(vdata.from, '0', 'loadDataFromSession(\''+ m_id +'\');');
	uexWindow.evaluateScript('', '0', 'COM.UTILS.closeWindow()');
} 
function saveFileCache(){
	COM.FILECACHE.saveFileContent(m_cacheFileName,JSON.stringify(data),function(data){
		console.log("cache file ok");
	},function(data){
		console.log("cache file error");
	});
}