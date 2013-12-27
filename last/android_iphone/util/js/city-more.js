var data;//用于页面间参数传递	
var vcitykeyword = null;
var cen_lon = null;
var cen_lat = null;

$(function(){
	bindAutoComplete();
});
function setCityInfo(code, name,center_lon,center_lat) {
	 console.log("in setCityInfo,code="+code+", name="+name+",center_lon:"+center_lon+",center_lat:"+center_lat);
	// 保存新选择的城市
	var oldCity=COM.SESSION.getCityInfo();
	if(oldCity.cityID!=code){
		COM.SESSION.setCityInfo(code, name,center_lon,center_lat);
		
		if(data.from == "mall-list"){
			uexWindow.evaluatePopoverScript("main","mall-list",'loadDataForChgCIty();');
		}else if(data.from == "cardfav-list"){
			uexWindow.evaluateScript(data.from, '0', 'loadDataForChgCIty()');
		}else if(data.from == "article-list"){
			uexWindow.evaluateScript(data.from, '0', 'loadDataForChgCIty()');
		}else if(data.from == "article-list"){
			uexWindow.evaluateScript(data.from, '0', 'loadDataForChgCIty()');
		}else if(data.from == "scanner-list"){
			uexWindow.evaluateScript(data.from, '0', 'loadDataForChgCIty()');
		}else if(data.from == "home"){
			uexWindow.evaluatePopoverScript("main","home",'loadDataForChgCIty();');
		}else if(data.from == "teacher-list"){
			
			uexWindow.evaluateScript(data.from,'0','loadDataForChgCIty();');
		}
		if(data.from != "home")
			uexWindow.evaluatePopoverScript("main","home",'loadDataForChgCIty();');
	}
	setTimeout(function() {
				COM.UTILS.closeWindow();
			}, 500);
}

function getCityValue() {
	console.log("in getCityValue");
	if(vcitykeyword){
		setCityInfo(vcitykeyword, $("#citykey").val(),cen_lon,cen_lat);
		vcitykeyword=null;
		cen_lon = null;
		cen_lat = null;
	}else{
		COM.DIALOG.alert("请选择一个城市");
	}
}
function setGPSInfo() {
	console.log("in setGPSInfo");
	if(window.localStorage.getItem("SESSION_CONST_CITY_INFO_GPS")){
		var cityinfo =JSON.parse( window.localStorage.getItem("SESSION_CONST_CITY_INFO_GPS"));
		$("#gpscode").attr("code", cityinfo.cityID);
		$("#gpscity").text(cityinfo.cityName);
	}else{
		$("#gpscode").attr("code", 0);
		$("#gpscity").text("无法获得定位信息");
	}
	
}
function bindAutoComplete() {
	console.log("in bindAutoComplete");
	$("#citykey").autocomplete(COM.CONST.MPZKAPI_URL + "?jsonp=?", {
				extraParams : {
					"x_userID" : 44,
					"x_TID" : 55,
					"v" : 256,
					"cmd" : '0004',
					"show_center":"1"
				},
				minChars : 1,
				autoFill : false,
				filterResults : false,
				useDelimiter : false,
				selectFirst : false,
				remoteDataType : 'jsonp',
				processData : function(data) {
					console.log(JSON.stringify(data));
					var i, processed = [];
					for (i = 0, ilen = data.cities.length; i < ilen; i++) {
						processed.push([data.cities[i].name, data.cities[i]]);
					}
					return processed;
				},
				onItemSelect : function(vdata) {
					console.log(vdata.data[0].code);
					vcitykeyword = vdata.data[0].code;
					cen_lon = vdata.data[0].center_lon;
					cen_lat = vdata.data[0].center_lat;
				}
			});
}
function loadDataFromServer(){
	var a=[];
	var tmp=scqx.areas;
	for(var i=0,ilen=tmp.length;i<ilen;i++){				
		a.push('<li code="'+tmp[i].code +'" onclick="parseCityListData('+tmp[i].code+')"><span class="city_li_icon"></span> <span class="city_li__info">'+tmp[i].full_name+'</span></li>');
	}					
	$plist.html(a.join(''));
	$plist.fadeIn("slow");
}
		
function parseCityListData(index){
	var a=[];
	index--;
	var tmp=scqx.areas[index].areas;
	a.push('<li code="'+0+'" onclick="showProvince()"><span class="city_li_icon"></span> <span class="city_li__info">'+'返回上一级'+'</span></li>');
	for(var i=0,ilen=tmp.length;i<ilen;i++)	{		
		a.push('<li code="'+tmp[i].code +'" onclick="setCityInfo(\''+tmp[i].code+'\',\''+tmp[i].full_name+'\',\''+tmp[i].center_lon+'\',\''+tmp[i].center_lat+'\')"><span class="city_li_icon"></span> <span class="city_li__info">'+tmp[i].full_name+'</span></li>');
	}
	$clist.html(a.join(''));
	$plist.fadeOut("slow");
	$clist.fadeIn("slow");
}