/*-----------基础应用-----------*/
Namespace.register("COM.UTILS"); 

document.addEventListener('touchmove', function(e) {
	e.preventDefault();
}, false);
/*有更多时使用的滚动条*/
COM.UTILS.loadedIscroll= function(aScroll,pPre,sPre,num,cbScroll,mPre,cbMore){
	setTimeout(function () {
		var aMoreElement=$("#"+mPre+num).get(0);
		if(aScroll[num]==null){
			var height = COM.UTILS.isWidth320() ? 40 : 80;
			aScroll[num] = new iScroll(pPre+num, {
				useTransform: true,
				onBeforeScrollStart: function (e) {
					var target = e.target;
					while (target.nodeType != 1) target = target.parentNode;
					if (target.tagName != 'SELECT' && target.tagName != 'INPUT' && target.tagName != 'TEXTAREA')
					e.preventDefault();
				},
				onRefresh: function () {
					if (aMoreElement.className.match('loading')) {
						aMoreElement.className = '';
					}
					
				},
				onScrollMove: function () {
					if (this.y < (this.maxScrollY - height) && !aMoreElement.className.match('flip')) {
						aMoreElement.className = 'flip';
						aMoreElement.querySelector('.nextPage').innerHTML = '松开进行加载更多...';
						this.maxScrollY = this.maxScrollY;
					} else if (this.y > (this.maxScrollY + height) && aMoreElement.className.match('flip')) {
						aMoreElement.className = '';
						aMoreElement.querySelector('.nextPage').innerHTML = '向上拉动加载更多...';
						this.maxScrollY = aMoreElement.offsetHeight;
					}
				},
				onScrollEnd: function () {
					if (aMoreElement.className.match('flip')) {
						aMoreElement.className = 'loading';
						aMoreElement.querySelector('.nextPage').innerHTML = '数据加载中...';				
						if(cbMore){
							cbMore();
						}
					}
					$("#"+sPre+num).trigger("touchmove");
					if(cbScroll){
						cbScroll($("#"+sPre+num));
					}
				}
			}); 
		}
		aScroll[num].refresh();
	}, 100);
}
/*没有更多时使用的滚动条*/
COM.UTILS.loadedIscrollNoMore= function(aScroll,pPre,sPre,num,cbScroll){
	setTimeout(function () {
		if(aScroll[num]==null){
			aScroll[num] = new iScroll(pPre+num, {
				useTransform: true,
				onBeforeScrollStart: function (e) {
					var target = e.target;
					while (target.nodeType != 1) target = target.parentNode;
					if (target.tagName != 'SELECT' && target.tagName != 'INPUT' && target.tagName != 'TEXTAREA')
					e.preventDefault();
				},
				onScrollEnd: function () {
					this.refresh();
					$("#"+sPre+num).trigger("touchmove");
					if(cbScroll){
						cbScroll($("#"+sPre+num));
					}
				}
			}); 
		}
		aScroll[num].refresh();
	}, 100);
}

/*有更多和刷新时使用的滚动条*/
COM.UTILS.loadedIscrollWithRefreshAndMore= function(aScroll,pPre,sPre,num,cbScroll,rPre,cbRefresh,mPre,cbMore){
	setTimeout(function () {
		var aMoreElement=$("#"+mPre+num).get(0);
		var aRefreshElement=$("#"+rPre+num).get(0);
		if(aScroll[num]==null){
			var height = COM.UTILS.isWidth320() ? 40 : 80;
			aScroll[num] = new iScroll(pPre+num, {
				useTransform: true,
				onBeforeScrollStart: function (e) {
					var target = e.target;
					while (target.nodeType != 1) target = target.parentNode;
					if (target.tagName != 'SELECT' && target.tagName != 'INPUT' && target.tagName != 'TEXTAREA')
					e.preventDefault();
				},
				onRefresh: function () {
					if (aMoreElement.className.match('loading')) {
						aMoreElement.className = '';
					}else if (aRefreshElement.className.match('loading')) {
						aRefreshElement.className = '';
					}
					
				},
				onScrollMove: function () {
					if(this.y > height && !aRefreshElement.className.match('flip')){
						aRefreshElement.className = 'flip';
						aRefreshElement.querySelector('.nextPage').innerHTML = '松开进行刷新...';
						this.minScrollY = 0;
					}else if(this.y < height && aRefreshElement.className.match('flip')){
						aRefreshElement.className = '';
						aRefreshElement.querySelector('.nextPage').innerHTML = '数据有更新，点击下拉更新...';
						this.minScrollY = -aRefreshElement.offsetHeight;
					}else if (this.y < (this.maxScrollY - height) && !aMoreElement.className.match('flip')) {
						aMoreElement.className = 'flip';
						aMoreElement.querySelector('.nextPage').innerHTML = '松开进行加载更多...';
						this.maxScrollY = this.maxScrollY;
					} else if (this.y > (this.maxScrollY + height) && aMoreElement.className.match('flip')) {
						aMoreElement.className = '';
						aMoreElement.querySelector('.nextPage').innerHTML = '向上拉动加载更多...';
						this.maxScrollY = aMoreElement.offsetHeight;
					}
				},
				onScrollEnd: function () {
					if (aRefreshElement.className.match('flip')) {
						aRefreshElement.className = 'loading';
						aRefreshElement.querySelector('.nextPage').innerHTML = '数据加载中...';				
						if(cbRefresh){
							cbRefresh();
						}
					}else if (aMoreElement.className.match('flip')) {
						aMoreElement.className = 'loading';
						aMoreElement.querySelector('.nextPage').innerHTML = '数据加载中...';				
						if(cbMore){
							cbMore();
						}
					}
					$("#"+sPre+num).trigger("touchmove");
					if(cbScroll){
						cbScroll($("#"+sPre+num));
					}
				}
			}); 
		}
		aScroll[num].refresh();
	}, 100);
}

COM.UTILS.loadedIscrollRefresh= function(aScroll,num){
	if(aScroll[num]){
		console.log("aScroll[num] was refreshed....");
		aScroll[num].refresh();
	}
}
