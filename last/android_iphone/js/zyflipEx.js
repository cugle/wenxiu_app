/**
 * 用于排序类的页面左右滑动时，排序tab页签的切换
 * @author 谢燕玲 
 */
	var $support = {
		transform3d: ('WebKitCSSMatrix' in window),
		touch: ('ontouchstart' in window)
	};

	var $E = {
		start: $support.touch ? 'touchstart' : 'mousedown',
		move: $support.touch ? 'touchmove' : 'mousemove',
		end: $support.touch ? 'touchend' : 'mouseup'
	};
	function getTranslateX(x) {
		return $support.transform3d ? 'translate3d('+x+'px, 0, 0)' : 'translate('+x+'px, 0)';
	}
	function getTranslateY(y) {
		return $support.transform3d ? 'translate3d(0,'+y+'px, 0)' : 'translate(0,'+y+'px)';
	}
	function getPage (event, page) {
		return $support.touch ? event.changedTouches[0][page] : event[page];
	}
	
	var zyFlipEx = function(selector){
		var self = this;
		if (selector.nodeType && selector.nodeType == 1) {
			self.element = selector;
		} else if (typeof selector == 'string') {
			self.id=selector;
			self.element = document.getElementById(selector) || document.querySelector(selector);
		}
		
		self.conf = {};
		self.touchEnabled = true;
		document.addEventListener($E.start, self, false);
		document.addEventListener($E.move, self, false);
		document.addEventListener($E.end, self, false);

		return self;
	}

	zyFlipEx.prototype = {
		handleEvent: function(event) {
			var self = this;

			switch (event.type) {
				case $E.start:
					self._touchStart(event);
					break;
				case $E.move:
					self._touchMove(event);
					break;
				case $E.end:
					self._touchEnd(event);
					break;
				case 'click':
					self._click(event);
					break;
			}
		},
		
        _touchStart: function(event) {
//        	console.log("_touchStart");
            var self = this;

            if (!self.touchEnabled) {
                return;
            }

            if (!$support.touch) {
                event.preventDefault();
            }

            self.scrolling = true;
            self.moveReady = false;
			self.basePage = getPage(event, 'pageX');
			self.startPageX = getPage(event, 'pageX');
            self.startPageY = getPage(event, 'pageY');
          	self.direction = 0;
            self.startTime = event.timeStamp;
        },
        _touchMove: function(event) {
//        	console.log("_touchMove");
            var self = this;

            if (!self.scrolling) {
                return;
            }

            var pageX = getPage(event, 'pageX'),
                pageY = getPage(event, 'pageY'),
                distXY,
                newXY,
                deltaX,
                deltaY;

            if (self.moveReady) {
//            	console.log("self.moveReady=true");
				distXY = pageX - self.basePage;
                self.direction = distXY > 0 ? -1 : 1;
            }
            else {
//            	console.log("self.moveReady=false");
                deltaX = Math.abs(pageX - self.startPageX);
                deltaY = Math.abs(pageY - self.startPageY);
//                console.log("deltaX=" + deltaX + ",deltaY=" + deltaY + ",pageX=" + pageX + ",self.startPageX=" + self.startPageX);
                if(true){
	                if (deltaX>deltaY && deltaX > 10) {
	                    self.moveReady = true;
	                }
	                else if (deltaY > 5) {
	                    self.scrolling = false;
	                }
                }
            }
			self.basePage = pageX;
        },
        _touchEnd: function(event) {
//        	console.log("_touchEnd");
            var self = this;

            if (!self.scrolling) {
                return;
            }

            self.scrolling = false;

//           console.log("方向=" +　self.direction);
           //main页面无法正确获取head.html中当前选中的排序元素，故用此调用方式
           if(self.direction != 0){
				COM.UTILS.orderListPageTouchmoveH(self.id,self.direction);
           }
        },

        destroy: function() {
            var self = this;
            document.removeEventListener($E.start, self);
            document.removeEventListener($E.move, self);
            document.removeEventListener($E.end, self);
        }
	}

