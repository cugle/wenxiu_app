/**
 * @author lovejjhao
 */
 /**
  * 480*800/320*480分辨率下，二级菜单分别为3、4、5个时的个参数值
  * left、bottom——一级菜单的绝对位置
  * radius——半径
  * radian——弧度
  * @type 
  */
 var m_para = {
 	p480: {left:"50%",marginLeft:"-35px",bottom:"95px",other:[{radius:125,radian:120},{radius:125,radian:180},{radius:145,radian:180}]},
 	p320: {left:"50%",marginLeft:"-25px", bottom:"58px",other:[{radius:75,radian:120},{radius:75,radian:180},{radius:90,radian:180}]}
 	
 };
(function($) {
    $.fn.path = function(options) {
		var options = $.extend({}, $.fn.path.defaults, options);
        if($("body").width()<470){
       	 	options = $.extend({}, options, m_para.p320);
        }else{
       	 	options = $.extend({}, options, m_para.p480);
        }

        this.each(function() {
			
			var easing = new Array();
			for (var key in $.easing) {
				easing.push(key);
			};
			var rad = Math.PI / 180,
			randomNun = 30, //随机数30 28
//			randomNun = Math.floor(Math.random() * easing.length), //随机数
			$content = $(this),
			$showmenu = $content.children(':last'),
			$showmenus = $showmenu.siblings();
			console.log("pre,width:"+$showmenu.css("width")+",height:"+$showmenu.css("height"));
			var index = $showmenus.length -3;//子菜单个数的索引号
			radius = options.other[index].radius,
			radian = options.other[index].radian,
			
            //$showmenus.css({ 'position': 'absolute', 'display': 'none' });
            $showmenus.css({ 'position': 'absolute'}).attr("flag","0");
            $content.css('position', 'absolute').css("bottom",options.bottom).css("left",options.left).css("margin-left",options.marginLeft).children(':last').css('position', 'absolute').bind("touchstart",function() {

                var duration = options.duration;

                if ($showmenu.siblings(':animated').size() == 0) {
                	var fromangle = 0;
                	var toangle = 45;
                	//if ($showmenus.css('display') == 'none') {
                	if ($showmenus.attr('flag') == '0') {
						fromangle = 0;
						toangle = 45;
					} else {
						fromangle = 45;
						toangle = 0;
					}
                	 $showmenu.rotate({
                            angle: fromangle,
                            animateTo: toangle,
                            duration: duration
                        });
                    var starAng = (180-radian)/2;
                    $showmenus.each(function(index) {
                        var $menu = $(this);
                        var angle = (index * radian / (radian == 360 ? $showmenus.size() : $showmenus.size() - 1) +  starAng)* rad;
		        		x = radius * Math.cos(angle),
						y = radius * Math.sin(angle);
                        duration += index * 10; //动画延时
                        $menu.rotate({
                            angle: 0,
                            animateTo: 360,
                            duration: duration,
                            easing: function(x, t, b, c, d) {        // t: current time, b: begInnIng value, c: change In value, d: duration
                                return c * (t / d) + b;
                            }
                        });
                        //if ($menu.css('display') == 'none') {
                        if ($menu.attr('flag') == '0') {
                            $menu.show().animate({ top: [-(y-4), easing[randomNun]], left: [x+4, easing[randomNun]] }, duration);
                       		$menu.attr('flag',"1");
					    } else {
                            $menu.animate({ top: [-y + 10, easing[randomNun]], left: [x + 10, easing[randomNun]] }).animate({ top: [0, easing[randomNun]], left: [0, easing[randomNun]] }, duration, function() {
                                //$menu.hide();
                               $menu.attr('flag',"0");
                            });
                        }
                    });
                }
            });
        });
    };
    //默认参数
    $.fn.path.defaults = {
        radian: 120, //弧度
        duration: 200//动画时间
    };
    //easing擦除效果
    $.extend($.easing,
    {
        easeInQuad: function(x, t, b, c, d) {
            return c * (t /= d) * t + b;
        },
        easeOutQuad: function(x, t, b, c, d) {
            return -c * (t /= d) * (t - 2) + b;
        },
        easeInOutQuad: function(x, t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t + b;
            return -c / 2 * ((--t) * (t - 2) - 1) + b;
        },
        easeInCubic: function(x, t, b, c, d) {
            return c * (t /= d) * t * t + b;
        },
        easeOutCubic: function(x, t, b, c, d) {
            return c * ((t = t / d - 1) * t * t + 1) + b;
        },
        easeInOutCubic: function(x, t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
            return c / 2 * ((t -= 2) * t * t + 2) + b;
        },
        easeInQuart: function(x, t, b, c, d) {
            return c * (t /= d) * t * t * t + b;
        },
        easeOutQuart: function(x, t, b, c, d) {
            return -c * ((t = t / d - 1) * t * t * t - 1) + b;
        },
        easeInOutQuart: function(x, t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
            return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
        },
        easeInQuint: function(x, t, b, c, d) {
            return c * (t /= d) * t * t * t * t + b;
        },
        easeOutQuint: function(x, t, b, c, d) {
            return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
        },
        easeInOutQuint: function(x, t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
            return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
        },
        easeInSine: function(x, t, b, c, d) {
            return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
        },
        easeOutSine: function(x, t, b, c, d) {
            return c * Math.sin(t / d * (Math.PI / 2)) + b;
        },
        easeInOutSine: function(x, t, b, c, d) {
            return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
        },
        easeInExpo: function(x, t, b, c, d) {
            return (t == 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
        },
        easeOutExpo: function(x, t, b, c, d) {
            return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
        },
        easeInOutExpo: function(x, t, b, c, d) {
            if (t == 0) return b;
            if (t == d) return b + c;
            if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
            return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
        },
        easeInCirc: function(x, t, b, c, d) {
            return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
        },
        easeOutCirc: function(x, t, b, c, d) {
            return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
        },
        easeInOutCirc: function(x, t, b, c, d) {
            if ((t /= d / 2) < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
            return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
        },
        easeInElastic: function(x, t, b, c, d) {
            var s = 1.70158; var p = 0; var a = c;
            if (t == 0) return b; if ((t /= d) == 1) return b + c; if (!p) p = d * .3;
            if (a < Math.abs(c)) { a = c; var s = p / 4; }
            else var s = p / (2 * Math.PI) * Math.asin(c / a);
            return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
        },
        easeOutElastic: function(x, t, b, c, d) {
            var s = 1.70158; var p = 0; var a = c;
            if (t == 0) return b; if ((t /= d) == 1) return b + c; if (!p) p = d * .3;
            if (a < Math.abs(c)) { a = c; var s = p / 4; }
            else var s = p / (2 * Math.PI) * Math.asin(c / a);
            return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
        },
        easeInOutElastic: function(x, t, b, c, d) {
            var s = 1.70158; var p = 0; var a = c;
            if (t == 0) return b; if ((t /= d / 2) == 2) return b + c; if (!p) p = d * (.3 * 1.5);
            if (a < Math.abs(c)) { a = c; var s = p / 4; }
            else var s = p / (2 * Math.PI) * Math.asin(c / a);
            if (t < 1) return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
            return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b;
        },
        easeInBack: function(x, t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            return c * (t /= d) * t * ((s + 1) * t - s) + b;
        },
        easeOutBack: function(x, t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
        },
        easeInOutBack: function(x, t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
            return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
        },
        easeInBounce: function(x, t, b, c, d) {
            return c - $.easing.easeOutBounce(x, d - t, 0, c, d) + b;
        },
        easeOutBounce: function(x, t, b, c, d) {
            if ((t /= d) < (1 / 2.75)) {
                return c * (7.5625 * t * t) + b;
            } else if (t < (2 / 2.75)) {
                return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
            } else if (t < (2.5 / 2.75)) {
                return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
            } else {
                return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
            }
        },
        easeInOutBounce: function(x, t, b, c, d) {
            if (t < d / 2) return $.easing.easeInBounce(x, t * 2, 0, c, d) * .5 + b;
            return $.easing.easeOutBounce(x, t * 2 - d, 0, c, d) * .5 + c * .5 + b;
        }
    });
})(jQuery);