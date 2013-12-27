Namespace.register("COM.IMGLOAD");

/**
 * 流程： 获取图片ID -> 判断本地是否已存在 ->存在 ->获取本地位置并设置Img的src属性
 * ->不存在->去图片服务器获取并保存到本地->获取本地位置并设置Img的src属性 
 * 使用方法： 
 * 首先页面加载后调用 COM.IMGLOAD.initPage() 函数初始化 需要使用到的回调函数 
 * 需要延迟加载图片时，等待数据加载完成后 执行延迟加载图片 COM.IMGLOAD.lazyLoadImg($("#page_id"))函数
 * 不需要延迟加载图片时，等待数据加载完成后 执行加载图片 COM.IMGLOAD.LoadingImg()函数
 */

/**
 * 图片延时加载,这里同时使用了图片缓存技术，调用须知: 
 * 1 添加“x-lazyImg”的class
 * 2 设置“x-picID”属性或x-picWidth和x-picHeight属性对，如果同时设置“x-picID”属性优先级高 
 * @param $pobj 为jquery对象
 * @param dir 方向滑动加载，下滑时加载（默认），左右滑动时加载
 * @param basyc 图片加载顺序，布尔型，false同步（默认）,true异步
 */
COM.IMGLOAD.lazyLoadImg = function($pobj,dir,basyc) {
	if(dir && (dir==="H" || dir==="h")){
		showDebugMsg("in COM.IMGLOAD.lazyLoadImg,by horizontal");
		COM.IMGLOAD.lazyLoadImgByHor($pobj,basyc?basyc:false);
	}else{
		showDebugMsg("in COM.IMGLOAD.lazyLoadImg,by vertical");
		COM.IMGLOAD.lazyLoadImgByVer($pobj,basyc?basyc:false);
	}
}
//垂直延迟
COM.IMGLOAD.lazyLoadImgByVer = function($pobj,asyc) {
	showDebugMsg("in COM.IMGLOAD.lazyLoadImgByVer,asyc="+asyc);
	var $obj = $pobj;
	var imgLoad = function() {
		var topPos = COM.IMGLOAD.getScrollTop();
		var height = COM.IMGLOAD.getScroll().height;
		var defObj = $obj.find(".x-lazyImg");
		defObj.each(function() {
					if ($(this).offset().top >= topPos
							&& $(this).offset().top <= (topPos + height)) {
						if(asyc){			
							showDebugMsg("asyc is true");
							COM.IMGLOAD.PrepareSetImgSrc($(this));
						}else{
							imagesArray.push($(this));
						}
						$(this).removeClass("x-lazyImg");
					}
				});
		COM.IMGLOAD.setContinueLoadImg();	
	};
	imgLoad();
}
//水平延迟
COM.IMGLOAD.lazyLoadImgByHor = function($pobj,asyc) {
	showDebugMsg("in COM.IMGLOAD.lazyLoadImg,asyc="+asyc);
	var $obj = $pobj;
	var imgLoad = function() {
		var leftPos = COM.IMGLOAD.getScrollLeft();
		var width = COM.IMGLOAD.getScroll().width;
		var defObj = $obj.find(".x-lazyImg");
		defObj.each(function(index) {
					if ($(this).offset().left >= leftPos
							&& $(this).offset().left <= (leftPos + width)) {
								if(asyc){
									showDebugMsg("asyc is true");
									COM.IMGLOAD.PrepareSetImgSrc($(this));
								}else{
									imagesArray.push($(this));
								}
								$(this).removeClass("x-lazyImg");
					}
		});
		COM.IMGLOAD.setContinueLoadImg();	
	};
	imgLoad();
}


/**
 * @description 设置延时加载图片
 * @param $me 需要延时加载图片的对象
 */
COM.IMGLOAD.PrepareSetImgSrc=function($me){
	var timeHandle = null;
	function picDownLoad(){
		if((!bling[2] && cachecount[2] == 0) && (!bling[1] && cachecount[1] == 0)){
			COM.IMGLOAD.initPage();
			if(timeHandle)clearTimeout(timeHandle);
			timeHandle = null;
			bling[0] = true;
			downloadStart($me);
		}else{
			if(timeHandle)clearTimeout(timeHandle);
			timeHandle = setTimeout(picDownLoad,100);
		}
	}
	picDownLoad();
}

function piccountdes(){
	--cachecount[0];
	if(0 == cachecount[0])bling[0] = false;
}

function downloadStart($me){
	++cachecount[0];
	if("undefined"==typeof($me.attr("x-picProp"))||$.trim($me.attr("x-picProp")).length<1){
		showDebugMsg("in COM.IMGLOAD.PrepareSetImgSrc, no x-picProp");		
		COM.IMGLOAD.toStartImgSrcByWidthAndHeight($me.attr("x-picId"), 
			$me.attr("x-picWidth"),
			$me.attr("x-picHeight"),
			COM.IMGLOAD.picIndex++,
			$me);
	}else{
		showDebugMsg("in COM.IMGLOAD.PrepareSetImgSrc, has x-picProp");
		COM.IMGLOAD.toStartImgSrcByProc($me.attr("x-picId"), 			
			$me.attr("x-picProp"),
			COM.IMGLOAD.picIndex++, 
			$me);
	}
}

COM.IMGLOAD.picPathes = [];// 索引号以及其对应的{"picId":picId,"picProp":picProp,"picPath":picPath,"obj":$obj}对象
COM.IMGLOAD.picIndex = 0;// 索引号
COM.IMGLOAD.formplat = parseInt(window.localStorage.getItem("SESSION_CONST_PLAYFORM"));// 系统平台信息，0为IOS，1为android

COM.IMGLOAD.getScrollTop = function() {
	return document.body
			? document.body.scrollTop
			: document.documentElement.scrollTop;
}
COM.IMGLOAD.getScrollLeft = function() {
	return document.body
			? document.body.scrollLeft
			: document.documentElement.scrollLeft;
}
COM.IMGLOAD.getScroll = function() {
	return {
		"width" : document.documentElement.clientWidth,
		"height" : document.documentElement.clientHeight
	};
}

/**调用须知: 
 * 1 添加“x-lazyImg”的class
 * 2 设置“x-picID”属性或x-picWidth和x-picHeight属性对，如果同时设置“x-picID”属性优先级高 
 * @desc 正在加载图片
 * @param basyc 是否异步加载图片，默认false异步，true同步
 */
COM.IMGLOAD.LoadingImg = function(basyc) {
	//COM.IMGLOAD.initPage();
	//COM.IMGLOAD.toGetPlatform();//先去获取系统平台信息,因在其他地方已经获取，暂时先屏蔽
	showDebugMsg("in COM.IMGLOAD.LoadingImg, len of x-lazyImg is "+$(".x-lazyImg").length);
	var asyc=false;
	if(basyc&&(basyc===true)){
		asyc=true;
	}
	$(".x-lazyImg").each(function() {
		if(asyc){			
			showDebugMsg("asyc is true");
			COM.IMGLOAD.PrepareSetImgSrc($(this));
		}else{
			imagesArray.push($(this));
		}
		
		$(this).removeClass("x-lazyImg");
	});
	COM.IMGLOAD.setContinueLoadImg();	
}

/**
 * @desc 开始设置图片
 * @param picId 图片id
 * @param picProp 图片级别
 * @param icount 当前索引号
 * @param $obj 设置对象
 */
COM.IMGLOAD.toStartImgSrcByProc = function(picId, picProp, icount, $obj) {
	if(undefined == picId)return;
	var picPath = "wgt://data/images/" + picId + "_" + picProp;
	showDebugMsg("in COM.IMGLOAD.toStartImgSrcByProc, path="+picPath );
	COM.IMGLOAD.picPathes[icount] = {
		"flag": 0,
		"picId" : picId,
		"picProp" : picProp,
		"picPath" : picPath,
		"obj" : $obj,
		"type":1
	};	
	COM.IMGLOAD.toOpenFile(COM.IMGLOAD.picPathes[icount].picPath, icount);
}

/**
 * @desc 开始设置图片
 * @param picId 图片id
 * @param picWidth 图片宽度
 * @param picHeight 图片高度
 * @param icount 当前索引号
 * @param $obj 设置对象
 */
COM.IMGLOAD.toStartImgSrcByWidthAndHeight = function(picId, picWidth,picHeight, icount, $obj) {
	if(undefined == picId)return;
	var picPath = "wgt://data/images/" + picId + "_" + picWidth+ "_" + picHeight;
	showDebugMsg("in COM.IMGLOAD.toStartImgSrcByWidthAndHeight, path="+picPath );
	COM.IMGLOAD.picPathes[icount] = {
		"flag": 0,
		"picId" : picId,
		"picWidth" : picWidth,
		"picHeight" : picHeight,
		"picPath" : picPath,
		"obj" : $obj,
		"type":2
	};	
	COM.IMGLOAD.toOpenFile(COM.IMGLOAD.picPathes[icount].picPath, icount);
}
/**
 * @desc 打开文件
 * @param path 文件路径
 * @param opId 操作码
 */
COM.IMGLOAD.toOpenFile = function(path, opId) {
	showDebugMsg("in toOpenFile,path="+path);
	uexFileMgr.openFile(opId, path, 1);
}
/**
 * @desc 准备下载文件
 * @param opId 操作码
 */
COM.IMGLOAD.toLoadDownload = function(opId) {
	uexDownloaderMgr.createDownloader(opId);
}
/*
 * http://IP:Port/YxDFS/?Method=YxDfs.Http.SimpDownLoad&PicId=218954410_2018_0_8.jpg&width=300&height=400
 * http://IP:Port/YxDFS/?Method= YxDfs.Http.DownLoad&PicId=182760806_1_0_45.jpg&PicProp=0

 * */
/**
 * @desc 开始下载文件
 * @param opId 操作码
 */
COM.IMGLOAD.toStartDownload = function(opId) {
	if(1==COM.IMGLOAD.picPathes[opId].type){
		showDebugMsg("in toStartDownload,imgUrl="+COM.CONST.PIC_DOWN_URL
					+ "YxDFS/?Method=YxDfs.Http.DownLoad&PicId="
					+ COM.IMGLOAD.picPathes[opId].picId + "&PicProp="
					+ COM.IMGLOAD.picPathes[opId].picProp);
		uexDownloaderMgr.download(opId, COM.CONST.PIC_DOWN_URL
					+ "YxDFS/?Method=YxDfs.Http.DownLoad&PicId="
					+ COM.IMGLOAD.picPathes[opId].picId + "&PicProp="
					+ COM.IMGLOAD.picPathes[opId].picProp,
			COM.IMGLOAD.picPathes[opId].picPath, '0');
	}else{
		showDebugMsg("in toStartDownload,imgUrl="+COM.CONST.PIC_DOWN_URL
						+ "YxDFS/?Method=YxDfs.Http.SimpDownLoad&PicId="
						+ COM.IMGLOAD.picPathes[opId].picId + "&width="
						+ COM.IMGLOAD.picPathes[opId].picWidth+ "&height="
						+ COM.IMGLOAD.picPathes[opId].picHeight);
		uexDownloaderMgr.download(opId, COM.CONST.PIC_DOWN_URL
						+ "YxDFS/?Method=YxDfs.Http.SimpDownLoad&PicId="
						+ COM.IMGLOAD.picPathes[opId].picId + "&width="
						+ COM.IMGLOAD.picPathes[opId].picWidth+ "&height="
						+ COM.IMGLOAD.picPathes[opId].picHeight,
				COM.IMGLOAD.picPathes[opId].picPath, '0');
	}
}
/**
 * @desc 获取文件大小
 * @param opId 操作码
 */
COM.IMGLOAD.toGetFileSize = function(opId) {
	uexFileMgr.getFileSize(opId);
}
/**
 * @desc 获取文件绝对路径
 * @param opId 操作码
 */
COM.IMGLOAD.toGetFilePath = function(opId) {
	uexFileMgr.getFilePath(opId);
}
/**
 * @desc 设置图片
 * @param opId 操作码
 * @param data 图片的绝对路径
 */
COM.IMGLOAD.toSetImgSrc = function(opId, data) {
	try{
		COM.IMGLOAD.picPathes[opId].obj.attr("src", data);
		showDebugMsg("opId " + opId + " in toSetImgSrc, src=" + COM.IMGLOAD.picPathes[opId].obj.attr("src"));
	}catch(e){
		alert("toSetImgSrc error!");
	}
	COM.IMGLOAD.setContinueLoadImg();	
}
/**
 * @desc 删除指定路径的文件
 * @param opId 操作码
 * @param data 文件路径
 */
COM.IMGLOAD.toDeleteFileByPath=function(opId,path){
	showDebugMsg("opId " + opId + " in COM.IMGLOAD.toDeleteFileByPath, path="
			+ path);
	uexFileMgr.deleteFileByPath(COM.IMGLOAD.picPathes[opId].picPath);
}
/**
 * 获取系统平台信息
 */
COM.IMGLOAD.toGetPlatform=function(){
	uexWidgetOne.getPlatform();
}
/**
 * @desc 初始化页面，初始化需要使用到的回调函数，必须在需要使用本js的页面中调用一次
 */
COM.IMGLOAD.initPage = function() {
	showDebugMsg("in COM.IMGLOAD.initPage...");
	/**
	 * @desc 所有出错时的回调函数
	 */
	uexWidgetOne.cbError = function(opCode, errorCode, errorInfo) {
		showDebugMsg("in uexWidgetOne.cbError, opCode= " + opCode + ", errorCode="+errorCode+", errorInfo="+errorInfo);
		if ("1090302" == errorCode) {//文件不存在
			showDebugMsg("in uexWidgetOne.cbError,opCode= " + opCode + ", errorCode="+errorCode+", errorInfo=文件不存在");
			COM.IMGLOAD.toLoadDownload(opCode);
		}else{
			showDebugMsg("in cbError,opCode= " + opCode + ", errorCode="+errorCode+", errorInfo="+errorInfo);
			console.log("...cbError");
			COM.IMGLOAD.toDeleteFileByPath(opCode,COM.IMGLOAD.picPathes[opCode].picPath);
			piccountdes();
		}
	}
	/**
	 * @desc 打开文件成功时的回调函数 如果打开文件失败，会触发uexWidgetOne.cbError()
	 */
	uexFileMgr.cbOpenFile = function(opCode, dataType, data) {
		showDebugMsg("in uexFileMgr.cbOpenFile, opCode= " + opCode + ", dataType="+dataType+", data="+data);
		if(data == 0){
			uexFileMgr.getFileSize(opCode);
		}else{
			uexFileMgr.closeFile(opCode);
			COM.IMGLOAD.toLoadDownload(opCode);
		}
	}
	/**
	 * @desc 下载文件时的回调函数
	 */
	uexDownloaderMgr.onStatus = function(opCode, fileSize, percent, status) {
		switch (status) {
			case 0 ://下载中...
				break;
			case 1 ://下载完成...
				uexDownloaderMgr.closeDownloader(opCode);
				showDebugMsg("in uexDownloaderMgr.onStatus, opCode= " + opCode + ", fileSize="+fileSize+", status="+status);
				if(fileSize>0){
					showDebugMsg("in uexDownloaderMgr.onStatus, fizeSize>0,COM.IMGLOAD.picPathes[opCode].flag:"+COM.IMGLOAD.picPathes[opCode].flag);
					if(0 == COM.IMGLOAD.picPathes[opCode].flag){
						COM.IMGLOAD.toOpenFile(COM.IMGLOAD.picPathes[opCode].picPath,
						opCode);
					}else{
						COM.IMGLOAD.toDeleteFileByPath(opCode,COM.IMGLOAD.picPathes[opCode].picPath);
					}
				}else{
					console.log("in uexDownloaderMgr.onStatus, fizeSize=0，picid:"+COM.IMGLOAD.picPathes[opCode].picId);
					COM.IMGLOAD.toDeleteFileByPath(opCode,COM.IMGLOAD.picPathes[opCode].picPath);
					COM.IMGLOAD.setContinueLoadImg();
					piccountdes();	
				}
				break;
			case 2 ://下载失败
				uexDownloaderMgr.closeDownloader(opCode);
				showDebugMsg("in uexDownloaderMgr.onStatus, opCode= " + opCode + ", fileSize="+fileSize+", status="+status);
				COM.IMGLOAD.toDeleteFileByPath(opCode,COM.IMGLOAD.picPathes[opCode].picPath);
				COM.IMGLOAD.setContinueLoadImg();	
				piccountdes();
				break;
		}
	}
	/**
	 * @desc 删除指定路径文件时的回调函数
	 */
	uexFileMgr.cbDeleteFileByPath=function(opCode,dataType,data){
		showDebugMsg("in uexDownloaderMgr.cbDeleteFileByPath, opCode= " + opCode + ", dataType="+dataType+", data="+data);
		if(data==0){
　　　　　　 showDebugMsg("in uexDownloaderMgr.cbDeleteFileByPath,删除文件成功");
　　　　}
	}
	/**
	 * @desc 准备下载器时的回调函数
	 */
	uexDownloaderMgr.cbCreateDownloader = function(opCode, dataType, data) {
		showDebugMsg("in uexDownloaderMgr.cbCreateDownloader, opCode= " + opCode + ", dataType="+dataType+", data="+data);
		if (data == 0) {
			COM.IMGLOAD.toStartDownload(opCode);
		} else {
			piccountdes();
		}
	}
	/**
	 * @desc 获取文件绝对路径时的回调函数
	 */
	uexFileMgr.cbGetFilePath = function(opCode, dataType, data) {
		uexFileMgr.closeFile(opCode);
		COM.IMGLOAD.picPathes[opCode].flag = 1;
		piccountdes();
		showDebugMsg("in uexDownloaderMgr.cbGetFilePath, opCode= " + opCode + ", dataType="+dataType+", data="+data);
		console.log("cbGetFilePath...opCode:"+opCode);
		if (dataType == 0 && COM.IMGLOAD.formplat==0) {//IOS
			//注意,使用沙箱无法获取正确的路径，所以要做以下特殊处理
			var root = window.location.href;
			showDebugMsg("root= " + root);
			/**
			 * 注意：
			 * IDE下打包的版本，root = file:///var/mobile/Applications/机子ID号/Documents/AppCan10048207.app/widget/home.html
			 * 在线打包的版本， root = file:///var/mobile/Applications/机子ID号/Documents/appcan10048207.app/widget/home.html
			 */
			var i = root.indexOf("/AppCan");
			if(i == -1) {
				i = root.indexOf("/appcan");
			}
			if(i != -1){
				root = root.substring(0,i);
				COM.IMGLOAD.toSetImgSrc(opCode, root+ "/Documents"+data); 
			}else{
				COM.IMGLOAD.toSetImgSrc(opCode, "file://"+data); 
			}
		}else{//Android
			COM.IMGLOAD.toSetImgSrc(opCode,"file://"+data);//"file://"+
		}
	}
	/**
	 * @desc:获取系统平台信息的回调函数
	 */
	uexWidgetOne.cbGetPlatform=function(opCode,dataType,data){
		showDebugMsg("in uexDownloaderMgr.cbGetPlatform, opCode= " + opCode + ", dataType="+dataType+", data="+data);
//		alert("in uexDownloaderMgr.cbGetPlatform, opCode= " + opCode + ", dataType="+dataType+", data="+data);
		switch (data) {
			case 1 :// android
				COM.IMGLOAD.formplat = 1;
				break;
			case 2 :// chrome
				COM.IMGLOAD.formplat = 1;
				break;
			case 3 :// symbian
				COM.IMGLOAD.formplat = 1;
				break;
			default :// ios
				COM.IMGLOAD.formplat = 0;

		}
		
	}
	/**
	 * @desc:获取文件大小时的回调函数
	 */
	uexFileMgr.cbGetFileSize= function(opCode,dataType,data){
		showDebugMsg("in uexDownloaderMgr.cbGetFileSize, opCode= " + opCode + ", dataType="+dataType+", data="+data);
		if(data > 0){
　　　　　　 showDebugMsg("in uexDownloaderMgr.cbGetFileSize,获取文件大小成功");
			COM.IMGLOAD.toGetFilePath(opCode);
		}else{
			COM.IMGLOAD.toLoadDownload(opCode);
		}
	}
}
/**
 * @desc 调试信息的输出
 * @param {} msg 要输出的信息
 */
var bflag=false;
function showDebugMsg(msg){
	if(bflag){
//		alert(msg);
		console.log(msg);
	}
}
/**
 * @desc 用于控制单个页面中图片加载调试信息的显示
 */
function toShowDebugMsg(){
	bflag=true;
}

var imagesArray=[];
var curImgIndex=0;
/**
 * @desc 用于控制图片的顺序加载，暂时先这样，后期调整
 */
COM.IMGLOAD.setContinueLoadImg=function(){
	showDebugMsg("in COM.IMGLOAD.setContinueLoadImg,curImgIndex="+curImgIndex+", imagesArray.length="+imagesArray.length);
	if(curImgIndex<imagesArray.length){
		COM.IMGLOAD.PrepareSetImgSrc(imagesArray[curImgIndex++]);	
	}
}

pageUnload = function(){
	for(var i=0;i<COM.IMGLOAD.picPathes.length;++i){
		var tmp = COM.IMGLOAD.picPathes[i];
		if(0 == tmp.flag){
			tmp.flag = 2;
			COM.IMGLOAD.toDeleteFileByPath(i,tmp.picPath);
		}
	}
}