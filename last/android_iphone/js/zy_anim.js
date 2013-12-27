    function reset(a,b)
    {
            if(a)
            {    
                a.style.webkitTransitionProperty="-webkit-transform";
                a.style.webkitTransitionDuration = '500ms';
            }
            
            if(b)
            {
                b.style.webkitTransitionProperty="-webkit-transform";
                b.style.webkitTransitionDuration = '500ms';
            }
                
    }
    function zy_anim_slide(p1,p2,t,cb)
    {
        var a=document.getElementById(p1);
        var b=document.getElementById(p2);
        if(window.navigator.platform=="NXP")
        {
            b.style.left="0px";
            b.style.top="0px";
            a.style.display="none";
            b.style.display="block";
            return;
        }
        function anim_over()
        {
            if(b)
                b.style.display="block";
            if(a)
                a.style.display="none";
            if(cb)
            	cb();
        }
        function anim_move()
        {    
            reset(a,b);
            if(a)
            {
                if(t!="slide_down")
                    a.style.display="none";
            }
            switch(t)
            {
                case "slide_left":
                if(b) b.style.webkitTransform = "translate(0%,0px)";
                break;
                case "slide_right":
                if(b) b.style.webkitTransform = "translate(0%,0px)";
                break;
                case "slide_up":
                if(b) b.style.webkitTransform = "translate(0px,0%)";
                break;
                case "slide_down":
                if(a) a.style.webkitTransform = "translate(0px,100%)";
                break;
            }
            setTimeout(anim_over,300);
        }
        if(b)
        {
            switch(t)
            {
                case "slide_left":
                    b.style.webkitTransform="translate(100%,0px)";
                    break;
                case "slide_right":
                    b.style.webkitTransform="translate(-100%,0px)";
                    break;
                case "slide_up":
                    b.style.zindex=3;
                    b.style.webkitTransform="translate(0px,100%)";
                    break;
                case "slide_down":
                    b.style.zindex=0;
                    break;
                case "none":
                    b.style.webkitTransform="translate(0px,0px)";
                    a.style.display="none";
                    b.style.display="block";
                    a.style.webkitTransitionDuration=0;
                    b.style.webkitTransitionDuration=0;
                    return;
            }
            if(t!="slide_down")
                b.style.display="block";
        }
        setTimeout(anim_move,1);
    }
