//公共js方法
		var myurl = "http://appws.tx100.com/100/889/10090584/index.php?jsoncallback=?&m=widget&a=";
                
                
		var params = {};
		function parseParam(){
		    var loc = String(document.location);
		    var pieces = loc.substr(loc.indexOf('?') + 1).split('&');
		    params.keys = [];
		    for (var i = 0; i < pieces.length; i += 1) {
		        var keyVal = pieces[i].split('=');
		        params[keyVal[0]] = decodeURIComponent(keyVal[1]);
		        params.keys.push(keyVal[0]);
		    }
		}
		
		
		
		// 加入id和class选择器
		var $id = function(id){
		    return document.getElementById(id);
		}
		
		var $class = function(em){
		    var cls = (em).match(/\.\S*/);
		    var chd = (em).match(/\s\S[\S]*/ig);
		    var len = chd ? chd.length : 0;
		    var clsEm = null;
		    if (cls.length > 0) {
		        clsEm = document.querySelectorAll(cls[0]);
		    }
		    if (clsEm && clsEm.length > 0) {
		        if (chd && chd.length > 0) {
		            return clsEm[0].getElementsByTagName(chd[0].replace(/^\s+/, "").replace(/\s+$/, ""));
		        }
		        else {
		            return clsEm;
		        }
		        
		    }
		}

		// search rssName
                function search_rssname(rssId)
                {
                        var get_rssName_url  = myurl + "search_rss_name&rssId="+rssId;
                        
                        $.getJSON(get_rssName_url,function(data){
                                if(data!=""){
                                		
                                        $("#my_header_p").html(data.inf_title);
                                }
                        });
                }


              // 打开多窗口
                function openNewWin(wname,html,aid){
                	//alert(html);
                	uexWindow.open(wname, '0', html, aid, '', '', 0x0);
                }

                // 关闭窗口
                function close(){
                	uexWindow.close(-1);
                }
