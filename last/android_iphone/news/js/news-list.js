var m_scrollArray=[null];
var m_curpage = 1;
var m_data;//接受传递的参数
var hasnext = true;
function init(){
	if(typeof m_data.name != "undefined"){
		$("#title").html(m_data.name + "动态");
//		COM.UTILS.setTitle("title",m_data.name + "动态");
	}else{
		$("#title").html("品牌动态");
//		COM.UTILS.setTitle("title","品牌动态");
	}
	var w = $("body").width()-15;
	console.log("页面宽度："+w);
	uexWindow.toast('1','5','加载中...',"");
	var opt={
			  getResource:function(index,render){
				if(!hasnext) return;
				var brandid = m_data.brandid;
//				var params = {"cmd":"2C04","city_id":7174,"uid":12345,"page_no":m_curpage,"page_count":COM.CONST.COUNT_PER_PAGE};
				var params = {"cmd":"2C04","city_id":COM.SESSION.getCityInfo().cityID,"uid":COM.SESSION.getUID(),"page_no":m_curpage,"page_count":COM.CONST.COUNT_PER_PAGE,"sort_type":1};
				if(typeof brandid != "undefined")
					$.extend(params,{"brand_id":brandid});
				COM.UTILS.post_mpzkApi(params,function(json){
					var totalCnt = json.total_count;
					var html="";
					if(totalCnt > 0){
						for(var i = 0;i<json.brand_newses.length;i++){
							var list = json.brand_newses[i];
							var event;
							var brandindex = COM.CONST.COUNT_PER_PAGE * (m_curpage-1) + (i+1);
							if(typeof brandid !="undefined"){
								event = COM.UTILS.getListBindEventString('{\'index\':' + brandindex  +',\'brandid\':\'' + brandid + '\'},cbOntouchend');
							}else{
								event = COM.UTILS.getListBindEventString('{\'index\':'+ brandindex + '},cbOntouchend');
							}
							html += '<div class="cell" '+ event +'><img x-picId="'+list.pic+'" x-picProp=0 />';
							if(typeof brandid =="undefined")
//								html +='<div class="brand_div"><span>' + list.brand_name + '</span></div>';
								html +='<div class="brand_div"></div><div class="brand_div_name">' + list.brand_name + '</div>';
							html+='</div>';
						}
						if(m_curpage < Math.ceil(totalCnt/COM.CONST.COUNT_PER_PAGE)){
							$("#pullUp_0  > span").html("向上拉动加载更多...");
							 hasnext = true;
							m_curpage++;
						}else{
							hasnext = false;
							$("#pullUp_0").parent().hide();
						}
					}else{
						$("#page_0").html('<div class="nulldiv"><span class="nullpic"></span></div>');
					}
			      	render($(html));
			      	uexWindow.closeToast();
				},function(json){
					uexWindow.closeToast();
					$("#page_0").html('<div class="nulldiv"><span class="nullpic"></span></div>');
				});
			  },
			  column_width:parseInt(w*0.33),
			  auto_imgHeight:true,
			  insert_type:1
			}
			 console.log("hasnext"+hasnext.toString());
			$('#wfContainer').waterfall(opt);
}
function cbOntouchend(para){
	if(typeof para.brandid !="undefined")
		uexWindow.evaluateScript("", "0", "COM.UTILS.openWindow('news-detail','news/news-detail.html?index=" + para.index + "&brandid=" + para.brandid+"\')");
		//COM.UTILS.openWindow('news-detail','news/news-detail.html?index=' + para.index + '&brandid=' + para.brandid);
	else
		uexWindow.evaluateScript("", "0","COM.UTILS.openWindow('news-detail','news/news-detail.html?index=" + para.index+"\')");
		//COM.UTILS.openWindow('news-detail','news/news-detail.html?index=' + para.index);
		//COM.UTILS.openWindow('news-detail','news/news-detail.html?index=' + para.index);
	
}
function closeWindow(){
		if(m_data.brandid != "undefined"){
			uexWindow.evaluateScript('brandinfo-detail', '0', 'closeWindow()');
		}else{
			COM.UTILS.openWindow("home","../home.html",0);
		}
	setTimeout(function(){
		COM.UTILS.closeWindow(0);
		COM.UTILS.log("in news-list close window");
	},1000);
}