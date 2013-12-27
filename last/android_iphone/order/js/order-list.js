 var movearea0;//用于声明监听的变量
 var movearea1;
 var movearea2;
 var m_curpage = [1,1,1];//当前页数
 var m_pagepointer = [0,0,0]//用于判断是上翻页还是下翻页
 var ori_page = 0;//子页面切换的默认初始化pageid
 var array = [];//用于判断是否已经加载过改子页面
 var m_cmd = [2008,2506,2406];//用于存放cmd的数组 
 var m_ordercmd = [2005,2508,2408];//用于订阅存放cmd的数组 
 var m_hasnext = [1,1,1];//判断是否还有下一页，0为没有，1为有
 var m_hassub = false;//判断是否订阅、取消订阅
 var m_status = true;
$(function(){
	COM.UTILS.searchBtn();
});

function loadData(){
	loadDataFromServer();
}
/**
 * 从服务器获取数据
 * **/
function loadDataFromServer(){
		uexWindow.toast('1','5','加载中...',"");
		var params = {"cmd":m_cmd[ori_page],"city_id":COM.SESSION.getCityInfo().cityID,"uid":COM.SESSION.getUID(),"page_no":m_curpage[ori_page],"page_count":COM.CONST.COUNT_LOGO_PER_PAGE};
		COM.UTILS.post_mpzkApi(params,function(json){
			m_status = true;
			parseOrderResult(json);
		},function(json){
			m_status = true;
//			$("#page_"+ori_page).html(json.error_info);
			$("#movearea"+ori_page).html('<div class="nulldiv"><span class="nullpic"></span></div>');
			uexWindow.closeToast();
		});
}

/**
 * 解析数据
 * **/
function parseOrderResult(json){
	var totalCnt = parseInt(json.total_count);
	if(totalCnt > 0){
		var orderlist;
		switch(ori_page){
			case 0:{
				orderlist = json.brands;
				break;
			}
			case 1:{
				orderlist = json.coupon_brands;
				break;
			}
			case 2:{
				orderlist = json.bank_brands;
				break;
			}
		}
		var pageno = 0;
		var a = [];
		var b = [];
		for(var i = 0; i<orderlist.length; i++){
			var ischeck =orderlist[i].has_sub == 1? "logo_order_check" : "logo_order_uncheck";
			var favnum = typeof(orderlist[i].discount_count) == "undefined"? 0 : orderlist[i].discount_count > 100? 99 : orderlist[i].discount_count;
			var event =  COM.UTILS.getListBindEventString('{\'id\':\''+ orderlist[i].id +'\',\'has_sub\':' + orderlist[i].has_sub +'},cbOntouchend');
			if(i % 9 == 0){
				a.push('<section><ul>');
				b.push('<li id="chgpage' + ori_page + "_" + pageno + '" class="unc">' + pageno + '</li>');
				pageno++;
			}
			if(i % 3 == 1){
				a.push('<li class="liM" id="order_' + orderlist[i].id + '"'+ event +'>');
			}else{
				a.push('<li id="order_' + orderlist[i].id + '"'+ event +'>');
			}
			a.push('	<div class="logo_body">');
			if(undefined == orderlist[i].pic){
				a.push('		<img class="logo" src="../css/images1/mr1.png"/>');
			}else{
				a.push('		<img class="logo x-lazyImg" src="../css/images1/mr1.png" x-picWidth="110" x-picHeight="110" x-picId="' + orderlist[i].pic + '"/>');
			}
			a.push('		<span class="logo_num logo_num_loc">'+ favnum +'</span>');
			a.push('		<div class="flag_check  logo_order '+ ischeck +'"></div>');
			a.push('		<div class="bg_text">'+ orderlist[i].name +'</div>');
			a.push('	</div>');
			a.push('</li>');
			if((i+1) % 9 == 0) a.push("</section>");
		}
		if((orderlist.length) % 9 == 0 && ori_page == 0) {//刚好9个就要多添加一次section
			a.push('<section><ul>');
			b.push('<li id="chgpage' + ori_page + "_" + pageno + '" class="unc">' + pageno + '</li>');
			pageno++;
		}
		if(ori_page == 0){
			var event1 = COM.UTILS.getListBindEventString('{\'type\':\'add\'},cbOntouchend1');
			if(orderlist.length % 3 == 1){
				a.push('<li class="liM"'+ event1 +'><img class="logo" src="../css/images1/gdpp.png"/></li>');
			}else{
				a.push('<li '+ event1 +'><img class="logo" src="../css/images1/gdpp.png"/></li>');
			}
		}
		a.push('</ul></section>');
		if(COM.CONST.COUNT_LOGO_PER_PAGE * m_curpage[ori_page] > totalCnt) 
			m_hasnext[ori_page] = 0;
//		document.getElementById("movearea0").innerHTML = a.join('');
		$("#movearea"+ori_page).html(a.join(''));
		$("#curpage"+ori_page).html(b.join(''));
		array.push("page_" + ori_page);
		loadPointer();
	}else{
		$("#movearea"+ori_page).html('<div class="nulldiv"><span class="nullpic"></span></div>');
	}
	uexWindow.closeToast();
}
function cbOntouchend(para){
	COM.UTILS.orderCheckEvent("order_"+para.id);
	brand_opt(para.id, para.has_sub);
}
function cbOntouchend1(para){
	COM.UTILS.openWindow('ordersearch-list','ordersearch-list.html?type='+para.type);
}
/**
 * 声明滑动翻页的函数
 * */
function loadPointer() {
	switch(ori_page){
		case 0:{
			if(typeof(movearea0) != "undefined"){
				movearea0.destroy();
			}
			if(m_pagepointer[ori_page] == 1){
				movearea0 = new zyFlip("movearea"+ori_page, "H","pre",prefun,nextfun,changePagePoint,true);
				m_pagepointer[ori_page] = 0;
			}else{
				movearea0 = new zyFlip("movearea"+ori_page, "H","",prefun,nextfun,changePagePoint,true);
			}
			break;
		}
		case 1:{
			if(typeof(movearea1) != "undefined"){
				movearea1.destroy();
			}
			if(m_pagepointer[ori_page] == 1){
				movearea1 = new zyFlip("movearea"+ori_page, "H","pre",prefun,nextfun,changePagePoint,true);
				m_pagepointer[ori_page] = 0;
			}else{
				movearea1 = new zyFlip("movearea"+ori_page, "H","",prefun,nextfun,changePagePoint,true);
			}
			break;
		}
		case 2:{
			if(typeof(movearea2) != "undefined"){
				movearea2.destroy();
			}
			if(m_pagepointer[ori_page] == 1){
				movearea2 = new zyFlip("movearea"+ori_page, "H","pre",prefun,nextfun,changePagePoint,true);
				m_pagepointer[ori_page] = 0;
			}else{
				movearea2 = new zyFlip("movearea"+ori_page, "H","",prefun,nextfun,changePagePoint,true);
			}
			break;
		}
		case 3:{
			break;
		}
		
	}

}

/**
 * 改变翻页圆点样式
 * */
function changePagePoint(){
	switch(ori_page){
		case 0:{
			$("#chgpage" + ori_page + "_" + movearea0.currentPoint).siblings(".cur").removeClass("cur");
		 	$("#chgpage" + ori_page + "_" + movearea0.currentPoint).addClass("cur");
		 	break;
		}
		case 1:{
			$("#chgpage" + ori_page + "_"+movearea1.currentPoint).siblings(".cur").removeClass("cur");
		 	$("#chgpage" + ori_page + "_"+movearea1.currentPoint).addClass("cur");
		 	break;
		}
		case 2:{
			$("#chgpage" + ori_page + "_" + movearea2.currentPoint).siblings(".cur").removeClass("cur");
		 	$("#chgpage" + ori_page + "_" + movearea2.currentPoint).addClass("cur");
		 	break;
		}
		case 3:{
			break;
		}
	}
	setTimeout(function(){COM.IMGLOAD.lazyLoadImg($("#movearea"+ori_page),"H",true);},100);
}


/***
 * 子页面切换方法
 */
function openSublingWindow(to_page){
	if(to_page == ori_page) return;
	zy_anim_slide("page_" + ori_page,"page_" + to_page,"none",openSublingCheck(to_page));
	setTimeout(function(){
		if(0 == to_page){
			$("#page_0").css({"-webkit-transform":"none"});
		}
	},200);
}
/***
 * 判断当前页签是否已加载过
 */
function openSublingCheck(to_page){
	ori_page = to_page;
	uexWindow.closeToast();
	if(array.indexOf("page_"+ori_page) != -1) return;
	if(to_page != 3){
		loadDataFromServer();
	}
}

/**
 * 上翻页的函数
 * */
function prefun(){
	if(m_curpage[ori_page] == 1)return;
	if(m_status){
		m_status = false;
		m_curpage[ori_page]--;
		m_pagepointer[ori_page] = 1;
		m_hasnext[ori_page] = 1;
		loadDataFromServer();
	}
}

/**
 * 下翻页的函数
 * */
function nextfun(){
	if(!m_hasnext[ori_page]) return;
	if(m_status){
		m_status = false;
		m_curpage[ori_page]++;
		loadDataFromServer();
	}
}
function checkSub(){
	if(!m_hassub) m_hassub = true;
}
/**
 * 用于订阅和取消订阅的方法
 */
function brand_opt(id,code){
	COM.UTILS.log("in brand_opt");
	var msg = code == 0? "订阅中...":"取消订阅...";
	uexWindow.toast('1','5',msg,"");
	var params = {"cmd":m_ordercmd[ori_page],"city_id":COM.SESSION.getCityInfo().cityID,"uid":COM.SESSION.getUID(),"action":code,"brand_id":id}
	checkSub();
	COM.UTILS.post_mpzkApi(params,function(json){
		uexWindow.closeToast();
		code = code == 0 ? 1:0;
		$("#order_" + id).attr('ontouchend','COM.UTILS.touchendEvent({\'id\':\''+ id +'\',\'has_sub\':'+ code +'},cbOntouchend);');;
		},function(json){
			uexWindow.closeToast();
			COM.DIALOG.alert(json.error_info);
			COM.UTILS.orderCheckEvent("order_"+id);
		});
}
/**
 * 跳转到搜索页面
 * **/
function searchBrand(){
	COM.UTILS.openWindow("ordersearch-list","ordersearch-list.html?type=search&keyword=" + COM.UTILS.encodeURIComponent($("#keyword").val())) ;
}
function submitOther(){
	var descript = $("#order_desc").val() == "请输入对分类的描述信息" ? "" : $("#order_desc").val();
	var classify =  $("#c_id").html();
	if(classify == "") {
		COM.DIALOG.alert("请选择您需要的分类");
		return;
	}
	if(descript == ""){
		COM.DIALOG.alert("请输入对分类的描述信息");
		return;
	}
	uexWindow.toast('1','5','正在提交您的请求，请稍后...',"");
	var params = {"cmd":"200A","city_id":COM.SESSION.getCityInfo().cityID,"uid":COM.SESSION.getUID(),"cat_id":classify,"content":descript};
	COM.UTILS.post_mpzkApi(params,function(json){
			COM.DIALOG.alert("提交成功，我们将尽快处理！");
			uexWindow.evaluateScript('','1','$("#index0").touchstart();');
			uexWindow.closeToast();
		},function(json){
			COM.DIALOG.alert("提交失败了，再试一次吧！");
			uexWindow.closeToast();
		});
}
function getSessionClassify(id,name){
	console.log("in getSessionClassify");
	$("#ordertext").val(name == null? "单击选择您需要的分类":name);
	$("#c_id").html(id);
}
function returnHome(){
	if(m_hassub)
		uexWindow.evaluatePopoverScript("main","home",'reloadData();');
		COM.UTILS.closeWindow(0);
}

function bindAutoComplete() {
	console.log("in bindAutoComplete");
	$("#keyword").autocomplete(COM.CONST.MPZKAPI_URL + "?jsonp=?", {
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