var m_imgIndex=0;//当前正在下载的图片索引号
var m_imgLoadedCnt=0;//已下载完的图片数量
var m_arImg=[];//图片信息数组

;(function($){
   var 
   //参数
   setting=$.setting={
      column_width:204,//列宽
      column_className:'waterfall_column',//列的类名
      column_space:5,//列间距
      cell_selector:'.cell',//要排列的砖块的选择器，context为整个外部容器
      img_selector:'img',//要加载的图片的选择器
      auto_imgHeight:true,//是否需要自动计算图片的高度
      fadein:true,//是否渐显载入 iphone 不渐变，应为会出现闪屏
      fadein_speed:600,//渐显速率，单位毫秒
      insert_type:1, //单元格插入方式，1为插入最短那列，2为按序轮流插入
      getResource:function(index){ }  //获取动态资源函数,必须返回一个砖块元素集合,传入参数为加载的次数
   },
   //
   waterfall=$.waterfall={},//对外信息对象
   $container=null;//容器
   waterfall.load_index=0, //加载次数
   
   $.fn.extend({
       waterfall:function(opt){
          opt=opt||{};  
          setting=$.extend(setting,opt);
          $container=waterfall.$container=$(this);
          waterfall.$columns=creatColumn();
          render($(this).find(setting.cell_selector).detach(),false); //重排已存在元素时强制不渐显
          waterfall._scrollTimer2=null;
          $(window).bind('scroll',function(){
             clearTimeout(waterfall._scrollTimer2);
             waterfall._scrollTimer2=setTimeout(onScroll,50);
          });
          onScroll();
       }
   });
   function creatColumn(){//创建列
      waterfall.column_num=calculateColumns();//列数
      //循环创建列
      var html='';
      for(var i=0;i<waterfall.column_num;i++){
         html+='<div class="'+setting.column_className+'" style="width:'+setting.column_width+'px; display:inline-block; *display:inline;zoom:1; margin-left:'+setting.column_space/2+'px;margin-right:'+setting.column_space/2+'px; vertical-align:top; overflow:hidden"></div>';
      }
      $container.prepend(html);//插入列
      return $('.'+setting.column_className,$container);//列集合
   }
   function calculateColumns(){//计算需要的列数
      var num=Math.floor(($container.innerWidth())/(setting.column_width+setting.column_space));
      if(num<1){ num=1; } //保证至少有一列
      return num;
   }
   function render(elements,fadein){//渲染元素
      if(!$(elements).length) return;//没有元素
      var $columns = waterfall.$columns;
      $(elements).each(function(i){                                     
          if(!setting.auto_imgHeight||setting.insert_type==2){//如果给出了图片高度，或者是按顺序插入，则不必等图片加载完就能计算列的高度了
             if(setting.insert_type==1){ 
                insert($(elements).eq(i),setting.fadein&&fadein);//插入元素
             }else if(setting.insert_type==2){
                insert2($(elements).eq(i),i,setting.fadein&&fadein);//插入元素   
             }
             return true;//continue
          }                     
          if($(this)[0].nodeName.toLowerCase()=='img'||$(this).find(setting.img_selector).length>0){//本身是图片或含有图片
              	var me = $(this);
              	var img = $(this).find(setting.img_selector);
              	var picID = img.attr("x-picId"), picProp = img.attr("x-picProp");
   				m_arImg[m_imgIndex]={
   					picLocPath: "wgt://data/waterfall/" + picID + "_" + picProp,
   					//picSrvUrl: COM.CONST.PIC_DOWN_URL + "YxDFS/?Method=YxDfs.Http.DownLoad&PicId=" + picID + "&PicProp=" + picProp,
   					picSrvUrl: COM.CONST.PIC_DOWN_URL + "YxDFS/?Method=YxDfs.Http.SimpDownLoad&PicId=" + picID + "&height=65535&width=" + setting.column_width,
					picLocName: picID + "_" + picProp,
   					obj: me
   				};
   				uexFileMgr.openFile(m_imgIndex, m_arImg[m_imgIndex].picLocPath, 1);
   				m_imgIndex++;
	/* 
              var image=new Image;
              var src=$(this)[0].nodeName.toLowerCase()=='img'?$(this).attr('src'):$(this).find(setting.img_selector).attr('src');
              image.onload=function(){//图片加载后才能自动计算出尺寸
              		console.log("image.onload");
                  image.onreadystatechange=null;
                  if(setting.insert_type==1){ 
                     insert(me,setting.fadein&&fadein);//插入元素
                  }
                  image=null;
              }
              image.src=src;
              */
             
          }else{//不用考虑图片加载
              if(setting.insert_type==1){ 
                 insert($(elements).eq(i),setting.fadein&&fadein);//插入元素
              }else if(setting.insert_type==2){
                 insert2($(elements).eq(i),i,setting.fadein&&fadein);//插入元素  
              }
          }                     
      });
//      COM.UTILS.loadedIscroll(m_scrollArray,"page_","scroll_",0,function(){},"pullUp_",onScroll);
//      $("#pullUp_0  > span").html("向上拉动加载更多...");
   }
   function public_render(elems){//ajax得到元素的渲染接口
      render(elems,true);   
   }
   function insert($element,fadein){//把元素插入最短列
      if(fadein){//渐显
         $element.css('opacity',0).appendTo(waterfall.$columns.eq(calculateLowest())).fadeTo(setting.fadein_speed,1);
      }else{//不渐显
         $element.appendTo(waterfall.$columns.eq(calculateLowest()));
      }
   }
   waterfall.insert = insert;
   function insert2($element,i,fadein){//按序轮流插入元素
      if(fadein){//渐显
         $element.css('opacity',0).appendTo(waterfall.$columns.eq(i%waterfall.column_num)).fadeTo(setting.fadein_speed,1);
      }else{//不渐显
         $element.appendTo(waterfall.$columns.eq(i%waterfall.column_num));
      }
   }
   function calculateLowest(){//计算最短的那列的索引
      var min=waterfall.$columns.eq(0).outerHeight(),min_key=0;
      waterfall.$columns.each(function(i){                         
         if($(this).outerHeight()<min){
            min=$(this).outerHeight();
            min_key=i;
         }                             
      });
      return min_key;
   }
   function getElements(){//获取资源
      $.waterfall.load_index++;
      return setting.getResource($.waterfall.load_index,public_render);
   }
   waterfall._scrollTimer=null;//延迟滚动加载计时器
   function onScroll(){//滚动加载
      clearTimeout(waterfall._scrollTimer);
      waterfall._scrollTimer=setTimeout(function(){
          //var $lowest_column=waterfall.$columns.eq(calculateLowest());//最短列
          //var bottom=$lowest_column.offset().top+$lowest_column.outerHeight();//最短列底部距离浏览器窗口顶部的距离
          //var scrollTop=document.documentElement.scrollTop||document.body.scrollTop||0;//滚动条距离
         // var windowHeight=document.documentElement.clientHeight||document.body.clientHeight||0;//窗口高度
          //if(scrollTop>=bottom-windowHeight){
             render(getElements(),true);
         // }
      },100);
   waterfall.onScroll = onScroll;
   }
})(jQuery);

function initUex(){
	/**
	 * @desc 所有出错时的回调函数
	 */
	uexWidgetOne.cbError = function(opCode, errorCode, errorInfo) {
		showDebugMsg("in uexWidgetOne.cbError, opCode= " + opCode + ", errorCode="+errorCode+", errorInfo="+errorInfo);
		if ("1090302" == errorCode) {//文件不存在
			showDebugMsg("in uexWidgetOne.cbError,opCode= " + opCode + ", errorCode="+errorCode+", errorInfo=文件不存在");
			uexDownloaderMgr.createDownloader(opCode);
		}
	}
	uexFileMgr.cbOpenFile = function(opCode, dataType, data) {
		showDebugMsg("in uexFileMgr.cbOpenFile, opCode= " + opCode + ", dataType="+dataType+", data="+data);
		if(data == 0){//文件存在
			//uexFileMgr.getFilePath(opCode);
			uexFileMgr.getFileSize(opCode);
		}else{
			uexFileMgr.closeFile(opCode);
			uexDownloaderMgr.createDownloader(opCode);
		}
	}
	/**
	 * @desc:获取文件大小时的回调函数
	 */
	uexFileMgr.cbGetFileSize= function(opCode,dataType,data){
		if(data > 0){
			uexFileMgr.getFilePath(opCode);
		}else{
			uexDownloaderMgr.createDownloader(opCode);
		}
	}
	uexFileMgr.cbGetFilePath = function(opCode, dataType, data) {
		showDebugMsg("in uexDownloaderMgr.cbGetFilePath, opCode= " + opCode + ", dataType="+dataType+", data="+data);
		var platForm = parseInt(window.localStorage.getItem("SESSION_CONST_PLAYFORM"));
		if (platForm==0) {//IOS
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
				toSetImgSrc(opCode, root+ "/Documents"+data); 
			}else{
				toSetImgSrc(opCode, "file://"+data); 
			}
		}else{//Android
			toSetImgSrc(opCode,"file://"+data);
		}
		uexFileMgr.closeFile(opCode);
	}
	uexDownloaderMgr.cbCreateDownloader = function(opCode, dataType, data) {
		showDebugMsg("in uexDownloaderMgr.cbCreateDownloader, opCode= " + opCode + ", dataType="+dataType+", data="+data);
		if (data == 0) {
			showDebugMsg("in uexDownloaderMgr.cbCreateDownloader,imgUrl="+m_arImg[opCode].picSrvUrl);
			uexDownloaderMgr.download(opCode, m_arImg[opCode].picSrvUrl, m_arImg[opCode].picLocPath,'0');
		} else {
		}
	}
	uexDownloaderMgr.onStatus = function(opCode, fileSize, percent, status) {
		showDebugMsg("uexDownloaderMgr.onStatus");
		switch (status) {
			case 0 ://下载中...
				break;
			case 1 ://下载完成...
				uexDownloaderMgr.closeDownloader(opCode);
				showDebugMsg("in uexDownloaderMgr.onStatus, opCode= " + opCode + ", fileSize="+fileSize+", status="+status);
				if(fileSize>0){
					showDebugMsg("in uexDownloaderMgr.onStatus, fizeSize>0");
					uexFileMgr.openFile(opCode, m_arImg[opCode].picLocPath, 1);
				}else{
					showDebugMsg("in uexDownloaderMgr.onStatus, fizeSize=0");
					uexFileMgr.deleteFileByPath(m_arImg[opCode].picLocPath);
				}
				break;
			case 2 ://下载失败
				uexDownloaderMgr.closeDownloader(opCode);
				showDebugMsg("in uexDownloaderMgr.onStatus, opCode= " + opCode + ", fileSize="+fileSize+", status="+status);
				uexFileMgr.deleteFileByPath(m_arImg[opCode].picLocPath);
				break;
		}
	}
	/**
	 * @desc 删除指定路径文件时的回调函数
	 */
	uexFileMgr.cbDeleteFileByPath=function(opCode,dataType,data){
		showDebugMsg("in uexDownloaderMgr.cbDeleteFileByPath, opCode= " + opCode + ", dataType="+dataType+", data="+data);
		if(dataType==3 && data==0){
　　　　　　showDebugMsg("in uexDownloaderMgr.cbDeleteFileByPath,删除文件成功");
　　　　}
	}
}
function toSetImgSrc(opCode, src) {
	try{
		showDebugMsg("toSetImgSrc,opCode=" + opCode + " src=" + src);
		m_arImg[opCode].obj.find($.setting.img_selector).attr("src",src);
		var image=new Image;
		image.onload=function(){//图片加载后才能自动计算出尺寸
          	showDebugMsg("image.onload");
          	image.onreadystatechange=null;
          	showDebugMsg("before insert");
            $.waterfall.insert(m_arImg[opCode].obj,$.setting.fadein);//插入元素
          	showDebugMsg("after insert,html=" + m_arImg[opCode].obj.html());
          	image=null;
          	COM.UTILS.loadedIscroll(m_scrollArray,"page_","scroll_",0,function(){},"pullUp_",$.waterfall.onScroll);
          }
       	image.src=src;
       	m_imgLoadedCnt++;
       	console.log(m_imgLoadedCnt);
       	if(m_imgLoadedCnt == COM.CONST.COUNT_PER_PAGE){
			$("#pullUp_0").parent().show();
       	}
	}catch(e){
		alert("toSetImgSrc error!");
	}
}
function showDebugMsg(msg){
		//console.log(msg);
}
