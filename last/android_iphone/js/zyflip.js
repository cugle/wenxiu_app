	var $support = {
		transform3d: ('WebKitCSSMatrix' in window),
		touch: ('ontouchstart' in window)
	};

	var $E = {
		start: $support.touch ? 'touchstart' : 'mousedown',
		move: $support.touch ? 'touchmove' : 'mousemove',
		end: $support.touch ? 'touchend' : 'mouseup',
		transEnd:'webkitTransitionEnd'
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
	/****
	 * 用于滑动屏幕的函数
	 * @param {Object} selector 滑块区域的id
	 * @param {Object} dir 横竖方向滑动
	 * @param {Object} pointer 判断是前翻页或者后翻页（因为加载的动画不一样，所以需要判断）
	 * @param {Object} preFun 向前翻页的回调函数（用于向前加载前N条数据时，使用的函数）
	 * @param {Object} nextFun 向后翻页的回调函数（用于向后加载前N条数据时，使用的函数）
	 * @param {Object} endFun 滑动翻页后加载的函数 
	 * @param {Object} screen 判断是监听全屏幕的滑动还是只监听滑块区域 true是滑块区域，不填或者false是全屏幕
	 */
	var zyFlip = function(selector,dir,direction,preFun,nextFun,endFun,screen){
		var self = this;
		self.pointer  = direction;
//		self.endFun = endFun || {};
		self.screen = (typeof screen == "undefined" ? false :  screen == "" ? false: true);
		self.transEnd = endFun || {};
		if("" != preFun)
			self.preFun = preFun || {};
		if("" != nextFun)
			self.nextFun = nextFun || {};
		self.nodes = [];
		//V:vertical竖直
        //H:horizontal水平的
		self.dir = dir||"H";
		if (selector.nodeType && selector.nodeType == 1) {
			self.element = selector;
		} else if (typeof selector == 'string') {
			self.id=selector;
			self.element = document.getElementById(selector) || document.querySelector(selector);
		}
        
        //self.element.style.display = '-webkit-box';
		self.element.style.webkitTransitionProperty = '-webkit-transform';
		self.element.style.webkitTransitionTimingFunction = 'cubic-bezier(0,0,0.25,1)';
		self.element.style.webkitTransitionDuration = '0';
		
		if(self.dir=="H")
			if(self.pointer == "pre"){
				self.element.style.webkitTransform = getTranslateX(-self.element.scrollWidth);
			}else{
				self.element.style.webkitTransform = getTranslateX(self.element.scrollWidth);
			}
		else
			self.element.style.webkitTransform = getTranslateY(0);
		
		self.conf = {};
		self.touchEnabled = true;
		self.currentPoint =0;
		self.currentXY = 0;
		self.refresh();
		if(self.screen){
			self.element.addEventListener($E.start, self, false);
			self.element.addEventListener($E.move, self, false);
			self.element.addEventListener($E.transEnd, self, false);
		}else{
			document.addEventListener($E.start, self, false);
			document.addEventListener($E.move, self, false);
			document.addEventListener($E.transEnd, self, false);
		}
		document.addEventListener($E.end, self, false);

		return self;
	}

	zyFlip.prototype = {
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
				case $E.transEnd:
					if(self.transEnd)
						self.transEnd(event);
					break;
			}
		},
		addSection : function(){
			var self = this;
			var secEl = document.createElement("section");
			self.element.appendChild(secEl);
			self.refresh();
			return secEl;
		},
		getSection : function(i){
			var self = this;
			var obj = self.nodes[i];
			if(obj.childNodes[1] && obj.childNodes[1].childNodes[1])
				return obj.childNodes[1].childNodes[1].childNodes[1];
			else
				return obj;
		},
		refresh: function() {
			var self = this;

			var conf = self.conf;

			// setting max point
			self.maxPoint = conf.point || (function() {
				var childNodes = self.element.childNodes,
					itemLength = 0,
					i = 0,
					len = childNodes.length,
					node;
				for(; i < len; i++) {
					node = childNodes[i];
					if (node.nodeType === 1) {
						self.nodes[itemLength]=node;
						itemLength++;
					}
				}
				if (itemLength > 0) {
					itemLength--;
				}
	
				return itemLength;
			})();
			
			// setting distance
			if(self.dir=="H")
				self.distance = conf.distance || self.element.scrollWidth / (self.maxPoint + 1);
			else
				self.distance = conf.distance || self.element.scrollHeight / (self.maxPoint + 1);
			// setting maxX maxY
			self.maxXY = conf.maxXY ? - conf.maxXY : - self.distance * self.maxPoint;
			if(self.pointer == "pre") self.currentPoint = self.maxPoint;
			self.moveToPoint(self.currentPoint);
		},
		hasNext: function() {
			var self = this;
	
			return self.currentPoint < self.maxPoint;
		},
		hasPrev: function() {
			var self = this;
	
			return self.currentPoint > 0;
		},
		toIndex: function(i) {	
			console.log("in toIdex,i is "+i);
			var self = this;
			if(i<0||i>self.maxPoint){
				i=0;
			}
			//self.currentPoint=i;
//			self.currentPoint = i;
//			self.moveToPoint(self.currentPoint);
			self.moveToPoint(i);
		},
		toNext: function() {
			var self = this;
			if (!self.hasNext()) {
				return;
			}
			self.moveToPoint(self.currentPoint + 1);
		},
		toPrev: function() {
			var self = this;
			if (!self.hasPrev()) {
				return;
			}

			self.moveToPoint(self.currentPoint - 1);
		},
        moveToPoint: function(point) {
            var self = this;
            if(point<0){
            	if(self.preFun)
            		self.preFun();
            }else if(point > self.maxPoint){
            	if(self.nextFun)
            		self.nextFun();
            }
            self.currentPoint = 
                (point < 0) ? 0 :
                (point > self.maxPoint) ? self.maxPoint :
                parseInt(point);
            self.element.style.webkitTransitionDuration = '300ms';
            self._setXY(-self.currentPoint * self.distance);
            

            var ev = document.createEvent('Event');
            ev.initEvent('css3flip.moveend', true, false);
            self.element.dispatchEvent(ev);
//            setTimeout(self.endFun, 300);
        },
        _setXY: function(xy) {
            var self = this;

            self.currentXY = xy;
            if(self.dir=="H")
            	self.element.style.webkitTransform = getTranslateX(xy);
            else
            	self.element.style.webkitTransform = getTranslateY(xy);
        },
        _touchStart: function(event) {
            var self = this;

            if (!self.touchEnabled) {
                return;
            }

            if (!$support.touch) {
                event.preventDefault();
            }

            self.element.style.webkitTransitionDuration = '0';
            self.scrolling = true;
            self.moveReady = false;
            self.startPageX = getPage(event, 'pageX');
            self.startPageY = getPage(event, 'pageY');
            if(self.dir=="H")
            	self.basePage = self.startPageX;
            else
            	self.basePage = self.startPageY
            self.direction = 0;
            self.startTime = event.timeStamp;
        },
        _touchMove: function(event) {
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
           // event.preventDefault();
            if (self.moveReady) {
                event.preventDefault();
                //event.stopPropagation();
				if(self.dir=="H")
					distXY = pageX - self.basePage;
				else
                	distXY = pageY - self.basePage;
                newXY = self.currentXY + distXY;
                if (newXY >= 0 || newXY < self.maxXY) {
                    newXY = Math.round(self.currentXY + distXY / 3);
                }
                self._setXY(newXY);

                self.direction = distXY > 0 ? -1 : 1;
            }
            else {
                deltaX = Math.abs(pageX - self.startPageX);
                deltaY = Math.abs(pageY - self.startPageY);
                if(self.dir=="H"){
	                if (deltaX>deltaY && deltaX > 5) {
	                    event.preventDefault();
	                    //event.stopPropagation();
	                    self.moveReady = true;
	                    self.element.addEventListener('click', self, true);
	                }
	                else if (deltaY > 5) {
	                	console.log("deltaY > 5");
	                    self.scrolling = false;
	                }
                }else{
                	if (deltaY>deltaX && deltaY> 5) {
	                    //event.preventDefault();
	                    //event.stopPropagation();
	                    self.moveReady = true;
	                    self.element.addEventListener('click', self, true);
	                }
	                else if (deltaX > 5) {
	                    self.scrolling = false;
	                }
                }
            }
			if(self.dir=="H")	
            	self.basePage = pageX;
            else
            	self.basePage = pageY;
        },
        _touchEnd: function(event) {
            var self = this;

            if (!self.scrolling) {
                return;
            }

            self.scrolling = false;

            var newPoint = -self.currentXY / self.distance;
            newPoint =
                (self.direction > 0) ? Math.ceil(newPoint) :
                (self.direction < 0) ? Math.floor(newPoint) :
                Math.round(newPoint);

            self.moveToPoint(newPoint);

            setTimeout(function() {
                self.element.removeEventListener('click', self, true);
            }, 200);
            //setTimeout(self.endFun, 500);
        },
        _click: function(event) {
            var self = this;

            event.stopPropagation();
            event.preventDefault();
        },
        destroy: function() {
            var self = this;
			if(self.screen){
	            self.element.removeEventListener($E.start, self);
	            self.element.removeEventListener($E.move, self);
				self.element.removeEventListener($E.transEnd, self);
			}else{
	            document.removeEventListener($E.start, self);
	            document.removeEventListener($E.move, self);
				document.removeEventListener($E.transEnd, self);
			}
            document.removeEventListener($E.end, self);
        }
	}
