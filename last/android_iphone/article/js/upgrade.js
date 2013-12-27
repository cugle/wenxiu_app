var m_updateurl = '';
var m_filepath = "/sdcard/LBS_DaZhe.apk";
var m_platform;
var m_cb = null;
/**
 * 
 * @param {} cb 无需升级时的回调函数
 */
function checkUpgrade(cb) {
	COM.UTILS.log("in check update");
	m_cb = cb;
	uexDownloaderMgr.cbCreateDownloader = function(opId, dataType, data) {
		if (data == 0) {
			uexDownloaderMgr.download('14', m_updateurl, m_filepath, '0');
		}
	};
	uexDownloaderMgr.onStatus = function(opId, fileSize, percent, status) {
		if (status == 0) {// 下载中...
			uexWindow.toast('1', '5', '\u4e0b\u8f7d\u8fdb\u5ea6' + percent + '\x25', '');
//			uexWindow.toast('1', '5', '下载进度：' + percent + '%', '');
		} else if (status == 1) {//下载完成
			uexWindow.closeToast();
			uexDownloaderMgr.closeDownloader('14');
			uexWidget.installApp(m_filepath);// 安装下载apk文件
		} 
	};
	uexWindow.cbConfirm = function(opId,dataType,data) {
		if (data == 0) {
			if(m_cb){
				m_cb();
			}
		}else{
			m_platform = window.localStorage.getItem("SESSION_CONST_PLAYFORM")
			if (m_platform == 0) {//iphone
				uexWidget.loadApp("", "",m_updateurl);//通过浏览器加载appstore路径
			} else if (m_platform == 1) {
				uexDownloaderMgr.createDownloader("14");
			} 
  	 	}
	};
	uexWidget.cbCheckUpdate = function (opCode,dataType,jsonData) {
		var obj = eval('(' + jsonData + ')');
		if (obj.result == 0) {
			//tips = "更新地址是：" + obj.url + "<br>文件名：" + obj.name + "<br>文件大小：" + obj.size + "<br>版本号：" + obj.version;m_updateurl = obj.url;
			m_updateurl = obj.url;
			var value = "\u7a0d\u540e\x3b\u66f4\u65b0";
//			var value = "稍后;更新";
			var mycars = value.split(";");
			uexWindow.confirm('', '\u5f53\u524d\u6709\u65b0\u7248\u672c\uff0c\u662f\u5426\u66f4\u65b0\x3f', mycars);
//			uexWindow.confirm('', '当前有新版本，是否更新?', mycars);
		} else{//obj.result=1- 当前版本是最新的,2-未知错误,3-参数错误
			if(m_cb){
				m_cb();
			}
		}
	};
	uexWidget.checkUpdate();
}