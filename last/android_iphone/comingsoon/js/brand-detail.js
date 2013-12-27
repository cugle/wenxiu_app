 var vdata;//用于页面间参数传递
 var movearea;
 var m_curpage;// 当前页数
 var m_pagepointer = 0//用于判断是上翻页还是下翻页
 var m_infoes;
 var m_vfirst=true;
 var m_titlecount = 0;//保存当前是第几页的第几条
 var data;//保持缓存中的数据
 var m_id = "";
 var m_cacheFileName;//缓存文件名
function loadDataFromSession(){
	uexWindow.toast("1","5","加载中...","");
	m_cacheFileName = vdata.fileName;
	m_titlecount = vdata.index - (vdata.index % COM.CONST.COUNT_PER_PAGE);
	console.log("in brand-detail, vdata is "+JSON.stringify(vdata));
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
			parseBrandDetailInfo(startpage);
		}else {
			alert(1);
		}
	}, function(data){
		alert("error!");
	});
}
function parseBrandDetailInfo(startpage){
	COM.DIALOG.closewaiting();
		console.log("in parseBrandDetailInfo");
		if(data&&0==data.ret_code){
			COM.UTILS.setTitle("banner_title",data.brand_name?data.brand_name:"");
			m_infoes=data.discounts;			
			var a=[];	
			var b=[];
			var m_info;
			var ilen=0;
			ilen=m_infoes.length;
			var chgpage = 0;
			var startindex = startpage - (startpage % COM.CONST.COUNT_PER_PAGE);
			var endindex = (startindex + COM.CONST.COUNT_PER_PAGE) > ilen ? ilen:(startindex + COM.CONST.COUNT_PER_PAGE);
			if(0<ilen && ilen >= startindex){
				console.log("in parseBrandDetailInfo to show,ilen="+ilen);
				for(var i = startindex;i < endindex;i++){
					m_info = m_infoes[i];
					desc=COM.STRINGUTIL.parseFavContent(m_info.tmpl,m_info.tmpl_params);
					pic=m_info.pic ? m_info.pic : m_info.brand_pic_3;
					a.push('<section class="font_common detsection tc">');				
					a.push('		<div class="clearfloat">');				
					a.push('			<div class="dis dis_content">');
					a.push('				<div class="dis_content_box">');
					a.push('					<img x-picId="'+pic+'"  src="../css/images1/mr2.png" class="dis_banner_icon x-lazyImg" x-picWidth="220" x-picHeight="220"/>');
					var days=parseInt(m_info.valid_days);
					if(days>0){
						a.push('					<div class="dis_desc"><span class="con">'+desc+'</span>，剩余<span class="font_strong">'+days+'</span>天');
					}else if(days == 0){
						a.push('					<div class="dis_desc">'+desc+'，<span class="font_strong">已结束</span>');
					}else{
						a.push('					<div class="dis_desc">'+desc+'，<span class="font_strong">'+days+'</span>天后即将开始');
					}
					a.push('				</div>');
					a.push('			</div>');
					a.push('		<div class="dashedline"></div>');
					
					a.push('			<div class="dis_feedback">');
					a.push('				<div class="box_l" onclick="toTuijian(\''+m_info.id+'\')">'); 
					a.push('						<span class="icon_new icon_tuijian"></span>');
					a.push('						推&nbsp;荐<br /> <span class="font_gray "><span class="tuicount">'+m_info.recom_rating+'</span>人</span>');
					a.push('				</div>');
					a.push('				<div class="box_m"></div>');
					a.push('				<div class="box_r" onclick="toJubao(\''+m_info.id+'\')">');
					a.push('						<span class="icon_new icon_jubao"></span>');
					a.push('						举&nbsp;报<br />折&nbsp;扣');
					a.push('				</div>');
					a.push('			</div>');
					a.push('		</div>');
					
					a.push('		<div class="dis_trend">');
					a.push('			<div class="dis_trend_line">');
					var dtevent = COM.UTILS.getListBindEventString('{\'brandid\':\''+ (m_infoes.brand_id?m_infoes.brand_id:m_info.brand_id) + '\',\'name\':\''+(m_infoes.brand_name?m_infoes.brand_name:m_info.brand_name)+'\'},cbTrend');
					a.push('				<div class="dis_trendbox_lt" '+dtevent+'>');
					a.push('					<span class="icon_new icon_top5 icon_dt"></span>');
					a.push('					<span class="dis_trend_con">品牌动态</span>');
					a.push('				</div>');
					a.push('				<div class="dis_trendbox_m"></div>');
					
					var shareevent = COM.UTILS.getListBindEventString("{'sharetext':'"+m_info.emporium_name+" "+m_info.brand_name+" "+$('<span>'+desc+'</span>').text()+", 来自：http://www.8000.cn'},cbShare");
					a.push('				<div class="dis_trendbox_rt" '+shareevent+'>');
					a.push('					<span class="icon_new icon_top5 icon_fx"></span>');
					a.push('					<span class="dis_trend_con">分享到...</span>');
					a.push('				</div>');
					a.push('			</div>');
					a.push('			<div class="dashedline"></div>');
					a.push('			<div class="dis_trend_line">');
					
					var zmevent = COM.UTILS.getListBindEventString('{\'brandid\':\''+ (m_infoes.brand_id?m_infoes.brand_id:m_info.brand_id) + '\',\'name\':\''+(m_infoes.brand_name?m_infoes.brand_name:m_info.brand_name)+'\'},cbZm');
					a.push('				<div class="dis_trendbox_lb" '+zmevent+'>');
					a.push('					<span class="icon_new icon_top5 icon_zm"></span>');
					a.push('					<span class="dis_trend_con">专卖店</span>');
					a.push('				</div>');
					a.push('				<div class="dis_trendbox_m1"></div>');
					
					var mallevent = COM.UTILS.getListBindEventString('{\'emporiumid\':\''+ m_info.emporium_id + '\',\'emporiumname\':\'' + m_info.emporium_name +'\'},cbEmporium');
					a.push('				<div class="dis_trendbox_rb" '+mallevent+'>');
					a.push('					<img x-picId="'+m_info.emporium_pic+'" class="icon_new icon_top5 x-lazyImg" x-picWidth="50" x-picHeight="50" src="../css/images1/mr0.png"/>'); 
					a.push('					<span class="dis_trend_con">商城折扣</span>');
					a.push('				</div>');
					a.push('			</div>');
					a.push('		</div>');
					
					var tel=m_info.tel?m_info.tel:"";
					a.push('		<div class="dis dis_address hal"');
					if(tel){
						a.push('	onclick="phonedial(\''+tel+'\')"');
					}
					a.push('		>');
					a.push('			<span class="icon_dh"></span><span class="dis_address_where shenglh halw">服务电话：'+tel+'</span>');
					a.push('			<span class="btn btn_rightpoint btn_rightpoint_loc hbtn_rightpoint_loc"></span>');
					a.push('		</div>');
					
					if(m_info.lon){
						var mapevent = COM.UTILS.getListBindEventString('{\'lon\':'+ m_info.lon +',\'lat\':' + m_info.lat +'},cbOpenMap');
						a.push('		<div class="dis dis_address hal" ' + mapevent + '>');
						a.push('			<span class="dis_address_icon"></span><span class="dis_address_where shenglh halw">'+m_info.address+'</span>');
						a.push('			<span class="btn btn_rightpoint btn_rightpoint_loc hbtn_rightpoint_loc"></span>');
						a.push('		</div>');
					}else{
						a.push('		<div class="dis dis_address_no hal">');
						a.push('			<span class="dis_address_icon_no"></span><span class="dis_address_where shenglh hal">'+m_info.address+'</span>');
						a.push('			<span class="btn btn_rightpoint btn_rightpoint_loc hbtn_rightpoint_loc"></span>');
						a.push('		</div>');
					}
					a.push('		</div>');
					
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
				console.log("in parseBrandDetailInfo to clear,ilen="+ilen);
				$("#page_0").html('<div class="nulldiv"><span class="nullpic"></span></div>');
				uexWindow.closeToast();
				
			}
	}else{
		uexWindow.closeToast();
		$("#a2").html('<div class="nulldiv"><span class="nullpic"></span></div>');
	}
}

function cbOpenMap(para){
	COM.UTILS.log("in cbOpenMap");
	uexWindow.toast("1","5","地图加载中，请稍候...","");
	COM.UTILS.openWindow('baidumap','../util/baidumap.html?lon=' + para.lon + '&lat=' + para.lat );
	setTimeout(COM.DIALOG.closewaiting,2000);
}
function cbShare(para){
	COM.UTILS.log("in cbShare");
	toShare(para.sharetext);
}
function cbEmporium(para){
	COM.UTILS.log("in cbMall");
	COM.UTILS.openWindow('brand-list','../brand/brand-list.html?type=mall&mallid=' + para.emporiumid + '&name=' + COM.UTILS.encodeURIComponent(para.emporiumname));
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
 	$("#mall_img").attr("x-picId",m_infoes[m_titlecount + movearea.currentPoint].brand_pic);
 	$("#mall_img").addClass("x-lazyImg");
 	updataToOrder(m_infoes[m_titlecount + movearea.currentPoint].has_sub);
 	console.log("in changePagePoint,mall_img : attr="+$("#mall_img").attr("x-picId")+", class="+$("#mall_img").attr("class"));
 	COM.IMGLOAD.lazyLoadImg($("#page_0"),"H");
 	COM.UTILS.post_mpzkApi({"cmd":"2710","discount_id":m_infoes[m_titlecount + movearea.currentPoint].id},function(json){},function(json){});
 	COM.UTILS.log("go page "+(vdata.index %  COM.CONST.COUNT_PER_PAGE));
 	gopage(vdata.index %  COM.CONST.COUNT_PER_PAGE);
 	m_id = "brand_" + vdata.type + "_" + (parseInt(m_curpage-1)*COM.CONST.COUNT_PER_PAGE + parseInt(movearea.currentPoint));
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
		if(vdata.flag == 1){
		 	uexWindow.evaluateScript("brandinfo-detail", "0",'nextPageForDetail('+ m_curpage +')');
		}else{
			uexWindow.evaluateScript("brand-list", "0",'nextPageForDetail('+ m_curpage +')');
		}
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
 	console.log("in toTuijian,bid="+bid);
		COM.UTILS.post_mpzkApi({"cmd":"2703",
				"uid":COM.SESSION.getUID(),
				"discount_id":bid},
				function(json){
					COM.DIALOG.closewaiting();
					COM.DIALOG.alert("推荐成功\n谢谢您的推荐");
					var $p=$(".tuicount").eq(movearea.currentPoint);
					$p.text(parseInt($p.text())+1);
					console.log("in  toTuijian,data的推荐个数是  "+data.discounts[m_titlecount + movearea.currentPoint].recom_rating+",m_infoes 的推荐个数是  "+m_infoes[m_titlecount + movearea.currentPoint].recom_rating);
					data.discounts[m_titlecount + movearea.currentPoint].recom_rating=json.recom_rating;
					saveFileCache();
					//window.localStorage.setItem("SESSION_BRAND_LIST"+vdata.type,JSON.stringify(data));
//					console.log("in  toTuijian,data is "+window.localStorage.getItem("SESSION_BRAND_LIST"+vdata.type));
				},function(json){
					COM.DIALOG.closewaiting();
					if("undefined"==typeof(json.error_info)){
						COM.DIALOG.alert("推荐失败了\n再点一下试试");
					}else{
						COM.DIALOG.alert(json.error_info);
					}
				});
 }
 
 function toJubao(bid){
 	console.log("in toJubao,bid="+bid);
 	COM.UTILS.openWindow('jubao','../util/jubao.html?from=1&id='+bid);
 }
function closeWindow(){
	uexWindow.evaluateScript('brand-list', '0', 'closeWindow()');
	setTimeout(function(){
		COM.UTILS.closeWindow(0);
	},500);
}
function returnList(){
	if(vdata.flag == 1){
		uexWindow.evaluateScript('brandinfo-detail', '0', 'loadDataFromSession(\''+ m_id +'\')');
	}else{
		uexWindow.evaluateScript('brand-list', '0', 'loadDataFromSession(\''+ m_id +'\')');
	}
	uexWindow.evaluateScript('', '0', 'COM.UTILS.closeWindow()');
	
}

function toShare(msg){
	COM.UTILS.log("in toShare,msg="+msg);
	var cityinfo = JSON.parse(window.localStorage.getItem("SESSION_CONST_CITY_INFO"));
	/*var tmp={"bmsg":"@八千优惠 "+cityinfo.cityName+" "+msg,
		"burl":COM.CONST.PIC_DOWN_URL
						+ "YxDFS/?Method=YxDfs.Http.SimpDownLoad&PicId="+$("#mall_img").attr("x-picId")+"&height="+$("#mall_img").attr("x-picHeight")+"&width="+$("#mall_img").attr("x-picWidth")};*/
	var tmp={"bmsg":"@八千优惠 "+cityinfo.cityName+" "+msg,"bfrom":"brand-detail",
		"burl":$("#mall_img").attr("x-picId")};
	window.localStorage.setItem("sharetext",JSON.stringify(tmp));
	COM.UTILS.log("in toShare,tmp="+JSON.stringify(tmp));
	COM.UTILS.openWindow('share','../util/share.html');
}

function operatorOrder(){
		brand_opt(m_infoes[m_titlecount + movearea.currentPoint].brand_id,m_infoes[m_titlecount + movearea.currentPoint].has_sub);
}

function brand_opt(id,code){
	COM.UTILS.log("in brand_opt,id="+id+",code="+code);
	var msg = code == 1? "取消订阅中...":"订阅中...";
	uexWindow.toast('1','5',msg,"");
	var params = {"cmd":"2005","city_id":COM.SESSION.getCityInfo().cityID,"uid":COM.SESSION.getUID(),"action":code,"brand_id":id}
	COM.UTILS.post_mpzkApi(params,function(json){
		uexWindow.closeToast();
		updataToOrder(code == 1 ? 0:1);
		updateHasSub(m_infoes[m_titlecount + movearea.currentPoint].brand_id,code == 1 ? 0:1);
		COM.UTILS.log("in brand_opt, post_mpzkApi ,has_sub=="+m_infoes[m_titlecount + movearea.currentPoint].has_sub);
		uexWindow.evaluateScript('home', '0', 'reloadData();');
		},function(json){
			uexWindow.closeToast();
			COM.DIALOG.alert(json.error_info);
		});
}

function updataToOrder(has_sub){
	COM.UTILS.setTitle("toorder",has_sub==1?"取消订阅":"添加订阅");
}

function updateHasSub(brandid,has_sub){
	for(var index=0,ilen=data.discounts.length;index<ilen;index++){
		if(data.discounts[index].brand_id==brandid){
			data.discounts[index].has_sub=has_sub;
			m_infoes[index].has_sub=has_sub;
		}
	}
	saveFileCache();
	//window.localStorage.setItem("SESSION_BRAND_LIST"+vdata.type,JSON.stringify(data));
}
function saveFileCache(){
	COM.FILECACHE.saveFileContent(m_cacheFileName,JSON.stringify(data),function(data){
		console.log("cache file ok");
	},function(data){
		console.log("cache file error");
	});
}
function phonedial(num){
　　　uexCall.dial(num);
}
function cbTrend(para){
	console.log("brand:"+para.brandid+","+para.name);
	uexWindow.evaluateScript("main", "0",'uexWindow.closePopover("news-list");openPopover(\'news-list\',\'news-list\',\'news/news-list.html?brandid='+ para.brandid + '&name=' + COM.UTILS.encodeURIComponent(para.name)+'\')');
	setTimeout(function(){
		COM.UTILS.openWindow('main','../main.html',0);
	},100);
//	COM.UTILS.openWindow("news-list","../news/news-list.html?brandid="+ para.brandid + "&name=" + COM.UTILS.encodeURIComponent(para.name));
//	COM.UTILS.openWindow("news-list","../news/news-list.html?brandid="+ para.brandid + "&name=" + COM.UTILS.encodeURIComponent(para.name));
}
function cbZm(para){
	console.log("brand:"+para.brandid+","+para.name);
	COM.UTILS.openWindow('brandinfo-detail','../brandinfo-detail.html?brandid=' + para.brandid + '&name=' + COM.UTILS.encodeURIComponent(para.name) + "&flag=0");
}