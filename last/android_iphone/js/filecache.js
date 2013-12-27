/**
 * 使用说明：
 */
Namespace.register("COM.FILECACHE"); //[{"pageNo":pageContent}],index of array is oriPage
var cache_tmp=[];//缓存文件内容,必须为数组[],格式[{"页码":"当页的内容"}],数组的索引号为ori_page
/**
 * 获取文件内容
 * @param {String} cFile 文件名称
 * @param {Object} cbSuccess 成功回调 参数{"data":data,"msg":"ok"}
 * @param {Object} cbFail 失败回调 参数{"msg":"error","code":inErrorCode,"desc":inErrorDes}
 */
COM.FILECACHE.getFileContent=function(cFile,cbSuccess,cbFail,bCommon){
	if(cFile){
		var timeHandle = null;
		function openFile(){
			if((!bling[0] && cachecount[0] == 0) && (!bling[2] && cachecount[2] == 0)){
				if(timeHandle)clearTimeout(timeHandle);
				timeHandle = null;
				bling[1] = true;
				fileOpen(cFile,cbSuccess,cbFail,bCommon);
			}else{
				if(timeHandle)clearTimeout(timeHandle);
				timeHandle = setTimeout(openFile,200);
			}
		} 
		openFile();
	}else{
		if(cbSuccess){
			cbSuccess({"data":null,"msg":"ok"});
		}
	}
}

function fileOpen(cFile,cbSuccess,cbFail,bCommon){
			++cachecount[1];
			uexWidgetOne.cbError= function(inOpId,inErrorCode,inErrorDes){
				countdes();
				if(cbFail){
					cbFail({"msg":"error","code":inErrorCode,"desc":inErrorDes});
				}
		　　	};
			uexFileMgr.cbIsFileExistByPath =function(opId,dataType,data){
		　　　　		if(data==1){//文件存在，则打开文件读取内容
		　　　　　　		uexFileMgr.cbOpenFile =function(opId,dataType,data){
		　　　　				if(dataType==2 && data==0){//打开成功,读取内容
		　　　　　　				uexFileMgr.cbReadFile = function(opId,dataType, data){
									uexFileMgr.closeFile(opId);
									countdes();
							　　　	if(dataType==0){//返回内容
										if(cbSuccess){
											cbSuccess({"data":data,"msg":"ok"});
										}
							　　　	}
						　		};
								uexFileMgr.readFile(opId,-1);
		　　　　				}else{
								if(cbFail){
									cbFail({"data":null,"msg":"ok"});
								}
								countdes();
							}
		　　				};
						uexFileMgr.openFile(opId,path,1);
					}
		　　　　		if(data==0){//文件不存在，则返回null
		　　　　　　		if(cbFail){
							cbFail({"data":null,"msg":"ok"});
						}
						countdes();
					}
			};
			if(bCommon){
				var path="wgt://data/"+cFile;
				uexFileMgr.isFileExistByPath(path);
			}else{
				var city=COM.SESSION.getCityInfo();
				var path="wgt://data/city_"+city.cityID+"/"+cFile;
				uexFileMgr.isFileExistByPath(path);
			}
}

function countdes(){
	--cachecount[1];
	if(0 == cachecount[1])bling[1] = false;
}

/**
 * 保存内容到文件
 * @param {String} cFile 文件名
 * @param {String} content 内容
 * @param {Object} cbSuccess 成功回调 参数 {"msg":"ok"} 
 * @param {Object} cbFail 失败回调 参数{"msg":"error","code":inErrorCode,"desc":inErrorDes}
 */
COM.FILECACHE.saveFileContent=function(cFile,content,cbSuccess,cbFail,bCommon){
	if(cFile){
		var timeHandle = null;
		function saveFile(){
			if((!bling[0] && cachecount[0] == 0) && (!bling[1] && cachecount[1] == 0)){
				clearTimeout(timeHandle);
				timeHandle = null;
				bling[2] = true;
				fileSave(cFile,content,cbSuccess,cbFail,bCommon);
			}else{
				console.log("延迟saveFileContent...");
				clearTimeout(timeHandle);
				timeHandle = setTimeout(saveFile,200);
			}
		}
		saveFile();
	}else{
		if(cbSuccess){
			cbSuccess({"msg":"ok"});
		}
	}
}

function savecountdes(){
	--cachecount[2];
	if(0 == cachecount[2])bling[2] = false;
}

function fileSave(cFile,content,cbSuccess,cbFail,bCommon){
		++cachecount[2];
		function cbOpenFile(opId,dataType,data){
	　　　　	if(dataType==2 && data==0){//打开成功,写内容
					uexFileMgr.writeFile(opId,0,content);
					if(cbSuccess){
						cbSuccess({"msg":"ok"});
					}
	　　　　	}else{
				if(cbFail){
					cbFail({"msg":"error","desc":"打开文件失败"});
				}
			}
			uexFileMgr.closeFile(opId);
			savecountdes();
		}
		uexWidgetOne.cbError= function(inOpId,inErrorCode,inErrorDes){
			if(cbFail){
				cbFail({"msg":"error","code":inErrorCode,"desc":inErrorDes});
			}
			savecountdes();
	　　	}
		uexFileMgr.cbIsFileExistByPath =function(opId,dataType,data){
				uexFileMgr.cbOpenFile =cbOpenFile;
	　　　　		if(data==1){//文件存在，则打开文件写内容
					uexFileMgr.openFile(opId,path,1);
				}
	　　　　		if(data==0){//文件不存在，则新建文件来写内容
					uexFileMgr.openFile(opId,path,4);
				}
		};
		if(bCommon){
			var path="wgt://data/"+cFile;
			uexFileMgr.isFileExistByPath(path);
		}else{
			var city=COM.SESSION.getCityInfo();
			var path="wgt://data/city_"+city.cityID+"/"+cFile;
			uexFileMgr.isFileExistByPath(path);
		}
}


/**
 * 读取缓存内容
 * @param {Object} cacheFile 缓存文件名
 * @param {Object} pageIndex 当前页码
 * @param {Object} oriPage 当前标签码
 * @param {Object} cbParseData 读取缓存成功的回调 参数 json对象
 * @param {Object} cbFromServer 读取缓存失败的回调函数 参数 无
 */
COM.FILECACHE.loadDataFromCacheWithCb=function(cacheFile,pageIndex,oriPage,cbParseData,cbFromServer){
	if(cacheFile){
		console.log("in loadDataFromCacheWithCb...,cacheFile="+cacheFile+", pageIndex="+pageIndex+", oriPage="+oriPage);
		if(cache_tmp[oriPage]&&cache_tmp[oriPage][pageIndex]){
			console.log("in loadDataFromCacheWithCb,cache_tmp[oriPage] is not null....");
			if(cbParseData){
				cbParseData(cache_tmp[oriPage][pageIndex]);//从缓存获取数据
			}
		}else{
			console.log("in loadDataFromCacheWithCb,cache_tmp[oriPage] is null....");
			COM.FILECACHE.getFileContent(cacheFile,function(data){
				console.log("in loadDataFromCacheWithCb,data is "+JSON.stringify(data));
				if(data.msg=="ok" && data.data){
					cache_tmp=JSON.parse(data.data);
					if(cache_tmp[oriPage]&&cache_tmp[oriPage][pageIndex]){
						console.log("in loadDataFromCacheWithCb,read data ok");
						if(cbParseData){
							cbParseData(cache_tmp[oriPage][pageIndex]);//从缓存获取数据
						}
					}else{
						console.log("in loadDataFromCacheWithCb,read data null");
						if(cbFromServer){
							cbFromServer();//从服务器获取数据
						}
					}
				}else{
					console.log("in loadDataFromCache,read data fail");
					if(cbFromServer){
						cbFromServer();//从服务器获取数据
					}
				}
			},function(data){
				console.log("in loadDataFromCacheWithCb,data is "+JSON.stringify(data));
				if(cbFromServer){
					cbFromServer();//从服务器获取数据
				}
			});
		}
	}else{
		if(cbFromServer){
			cbFromServer();//从服务器获取数据
		}
	}
	
}
/**
 * 保存内容到缓存文件
 * @param {Object} cacheFile 缓存文件名
 * @param {Object} jsonData 缓存数据 json对象
 * @param {Object} pageIndex 当前页码
 * @param {Object} oriPage 当前标签码
 * @param {Object} cbSuccess 成功回调 参数 json对象
 * @param {Object} cbFail 失败回调 参数 json对象
 */
COM.FILECACHE.saveContentToFileWithParamsCb=function(cacheFile,jsonData,pageIndex,oriPage,cbSuccess,cbFail){
	console.log("in saveContentToFileWithParams");
	if(cacheFile){//保存到文件
		if(!cache_tmp[oriPage]){
//			console.log("in saveContentToFileWithParams,init cache_tmp[oriPage]");
			cache_tmp[oriPage]={};
		}
		cache_tmp[oriPage][pageIndex]=jsonData;
		COM.FILECACHE.saveFileContent(cacheFile,JSON.stringify(cache_tmp),function(data){
//			console.log("in saveContentToFileWithParams,cache file ok");
			if(cbSuccess){
				cbSuccess(jsonData);
			}
		},function(data){
//			console.log("in saveContentToFileWithParams,cache file error");
			if(cbFail){
				cbFail(data);
			}
		});
	}else{//不保存到文件
		if(cbSuccess){
			cbSuccess(jsonData);
		}
	}
	
}
COM.FILECACHE.clearOripageContent=function(oriPage){
	cache_tmp[oriPage]={};//清空缓存
}

var start_t,end_t;
function startTime(){
	start_t=new Date();
	start_t=start_t.getTime();
	console.log("start time is "+ start_t);
}

function endTime(){
	end_t=new Date();
	end_t=end_t.getTime();
//	console.log("end time is "+ end_t);
//	console.log("time is "+(end_t-start_t)/1000);
}


