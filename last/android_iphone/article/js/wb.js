var WB = function(data){
	var self = this;
	if(!data)
		return null;
	self.data = data;
	self.ip = data.clientip||"127.0.0.1";
	self.cb = new Object;
	self.opid = 100;
	return self;
}
var qqcustomercb=null;
function qqloginCallback(d){
	
	if(qqcustomercb)
		qqcustomercb(d);
}
WB.prototype={
	login : function(cb){
		var self = this;	
		qqcustomercb=cb;
		uexWidget.startWidget("10039864",0,"qqloginCallback",JSON.stringify(self.data));
	},
	logout : function(){
		if(localStorage.qqacctoken){
			localStorage.removeItem("qqacctoken");
			localStorage.removeItem("qqtokenexp");
			localStorage.removeItem("qqopenid");
		}
	},
	checkLogin : function(){
		if(!localStorage.qqacctoken){
			return false;
		}
		var cut =  parseInt((new Date().getTime())/1000);
		var lt = parseInt(localStorage.qqtokenexp)+parseInt(localStorage.qqcurrentime) - cut;
		if(lt<50){
			return false;
		}
		else
			return true;
	},
	request : function(url,cbfun,params,method){
		var self = this;
		if(!localStorage.qqacctoken){
			self.login();
			return;
		}
		var cut =  parseInt((new Date().getTime())/1000);
		var lt = parseInt(localStorage.qqtokenexp)+parseInt(localStorage.qqcurrentime) - cut;
		if(lt<50){
			self.login();
			return;
		}
		self.opid++;
		self.cb[self.opid] = cbfun;
		var rurl = "https://open.t.qq.com/api/"+url;
		rurl +="?scope=all";
		rurl +="&clientip="+self.ip;
		rurl +="&oauth_version=2.a";
		rurl +="&openid="+localStorage.qqopenid;
		rurl +="&oauth_consumer_key="+self.data.key;
		rurl +="&access_token="+localStorage.qqacctoken;
		for(var i in params){
			rurl +="&"+i+"="+params[i];
		}		
		self.xmlHttp(self.opid,method,rurl);
	},
	
	onDataFun : function(opId,status,data){
		var self = uexWindow.obj;

		if(status==1){
			self.cb[opId](data);
			delete self.cb[opId];
		}
		if(status==-1){
			self.cb[opId]("-1");
			delete self.cb[opId];
		}
	},
	xmlHttp : function(inXmlHttpID,inMethods,inUrl){
    	var self = this;
    	uexWindow.obj = self;
		uexXmlHttpMgr.onData = self.onDataFun;
		inMethods = inMethods.toLowerCase();
		if(inMethods=="post"){
	  		var pars = self.urlParse(inUrl);
	  		var urls = inUrl.split("?");
	  		uexXmlHttpMgr.open(inXmlHttpID,inMethods,urls[0],"60000");
	  		for(var i in pars.keys){
	  			if(pars.keys[i]=='pic')
	  				uexXmlHttpMgr.setPostData(inXmlHttpID,'1',pars.keys[i],pars[pars.keys[i]]);
	  			else
	  				uexXmlHttpMgr.setPostData(inXmlHttpID,'0',pars.keys[i],pars[pars.keys[i]]);
	  		}
	  	}
	  	else
	  		uexXmlHttpMgr.open(inXmlHttpID,inMethods,inUrl,"6000");
	  	uexXmlHttpMgr.send(inXmlHttpID);
    },
    urlParse : function(url){
		var params = {};
		var loc = String(url);
		var pieces = loc.substr(loc.indexOf('?') + 1).split('&');
		params.keys = [];
		for (var i = 0; i < pieces.length; i += 1) {
			var keyVal = pieces[i].split('=');
			params[keyVal[0]] = decodeURIComponent(keyVal[1]);
			params.keys.push(keyVal[0]);
		}
		return params;
	}
}