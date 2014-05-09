/*jslint browser:true */
/*extern jive $j */

function closeMyLightbox(ele) {
    $j(ele).closest('.jive-modal').trigger('close');
}



if (!jive) {
    var jive = {};
}

if (!jive.gui) {
    jive.gui = {};
}

jive.gui.idIncrement = 1;

jive.gui.smallWindowPanel = function(message, content_panel, size) {
	
	var width;
	var classSize;

    var id = jive.gui.idIncrement++;
    var back_button = {};
    back_button.action = null;

    this.setBackAction = function(action) {
        back_button.action = action;
    };


    this.goBack = function() {
        if (back_button.action != null) {
            back_button.action();
        }
    };

    var $modal = $j("<div class='jive-modal jive-modal-medium'>" +
                        "<header><h2>" + message + "</h2></header>" +
                        "<a class='j-modal-close-top' href='#'>Close <span class='j-close-icon j-ui-elem'></span></a>" +
                        "<section class='jive-modal-content'>" +
                        "</section>"+
                    "</div>");

    $modal.find('.jive-modal-content').append($j(content_panel).show());
    this.show = function(){
        $modal.lightbox_me({onLoad: function() {  $modal.find(':text:first').focus(); }, centered: true});
    };
    this.close = function() {
        closeMyLightbox($modal);
    }
};





jive.gui.WindowPanel = function(title_str, content_panel, windowOptions) {
    var id = jive.gui.idIncrement++;
    var back_button = {};
    back_button.action = null;

    this.setBackAction = function(action) {
        back_button.action = action;
    };

    var div = document.createElement('DIV');
    div.style.position = "absolute";
    div.style.top = "0px";
    div.style.left = "0px";
    div.style.width = "100%";
    div.style.height = xDocHeight() + "px";
    div.style.opacity = ".5";
    div.style.filter = "alpha(opacity = 50)";
    div.style.background = "black";
    div.style.zIndex = 28;

    this.goBack = function() {
        if (back_button.action != null) {
            back_button.action();
        }
    };

    var title = document.createElement('DIV');
    title.setAttribute("class", "settings_main_title");
    title.className = "settings_main_title";
    title.appendChild(document.createTextNode(title_str));

    var panel = document.createElement('DIV');
    panel.setAttribute("class", "settings_main");
    panel.setAttribute("id", "settings_main_" + id);
    panel.className = "settings_main";

    var close_button = document.createElement('DIV');
    close_button.setAttribute("class", "settings_main_outer_close");
    close_button.className = "settings_main_outer_close";
    //
    // add click listener to close_button
    // make it call that.goBack()
    //

    var wrap = document.createElement('DIV');
    wrap.setAttribute("class", "settings_main_wrap");
    wrap.setAttribute("id", "settings_main_wrap_" + id);
    wrap.className = "settings_main_wrap";

    var right = document.createElement('DIV');
    right.setAttribute("class", "settings_main_outer_r");
    right.className = "settings_main_outer_r";
    wrap.appendChild(right);

    var left = document.createElement('DIV');
    left.setAttribute("class", "settings_main_outer_l");
    left.className = "settings_main_outer_l";
    right.appendChild(left);

    var top = document.createElement('DIV');
    top.setAttribute("class", "settings_main_outer_top");
    top.className = "settings_main_outer_top";
    left.appendChild(top);

    var bottom = document.createElement('DIV');
    bottom.setAttribute("class", "settings_main_outer_bottom");
    bottom.className = "settings_main_outer_bottom";
    top.appendChild(bottom);

    var tr = document.createElement('DIV');
    tr.setAttribute("class", "settings_main_outer_tr");
    tr.className = "settings_main_outer_tr";
    bottom.appendChild(tr);

    var tl = document.createElement('DIV');
    tl.setAttribute("class", "settings_main_outer_tl");
    tl.className = "settings_main_outer_tl";
    tr.appendChild(tl);

    var br = document.createElement('DIV');
    br.setAttribute("class", "settings_main_outer_br");
    br.className = "settings_main_outer_br";
    tl.appendChild(br);

    var bl = document.createElement('DIV');
    bl.setAttribute("class", "settings_main_outer_bl");
    bl.className = "settings_main_outer_bl";
    br.appendChild(bl);

    var content_holder = document.createElement('DIV');
    content_holder.setAttribute("class", "settings_main_content_holder");
    content_holder.className = "settings_main_content_holder";

    var content = document.createElement('DIV');
    content.setAttribute("class", "settings_main_content");
    content.className = "settings_main_content";
    content_holder.appendChild(content);
    bl.appendChild(content_holder);

    content.appendChild(content_panel);

    /**
     * backgrounds
     */
    panel.appendChild(wrap);
    wrap.appendChild(close_button);
    wrap.appendChild(title);

    this.getDOM = function() {
        return panel;
    };

    this.show = function(){
        xLeft(panel, xClientWidth()/2 - windowOptions.width / 2);
        wrap.style.width = windowOptions.width + "px";
        content.style.height = windowOptions.height + "px";

        panel.style.top = (xScrollTop() + xClientHeight() / 2 - windowOptions.height / 2) + "px";
        panel.style.display = "block";

        content_panel.style.display = "block";
        document.body.appendChild(div);
        $j(close_button).click(this.goBack);
    };

    this.close = function() {
        $j(close_button).unbind('click', this.goBack);
        document.body.removeChild(this.getDOM());
        content_panel.style.display = "none";
        document.body.appendChild(content_panel);
        document.body.removeChild(div);
        back_button.action = function() {};
    };

    document.body.appendChild(this.getDOM());
};

function xDef(theItem) {
   return (typeof(theItem)!='undefined'); } function xStr(s) {
   return typeof(s)=='string';
}
function xNum(n) {
   return typeof(n)=='number';
}

function xLeft(e,iX) {
   var css=xDef(e.style);
   if (css && xStr(e.style.left)) {
     if(xNum(iX)) { e.style.left=iX+'px'; }
     else {
       iX=parseInt(e.style.left, 10);
       if(isNaN(iX)) { iX=0; }
     }
   }
   else if(css && xDef(e.style.pixelLeft)) {
     if(xNum(iX)) { e.style.pixelLeft=iX; }
     else { iX=e.style.pixelLeft; }
   }
   return iX;
}

xClientWidth = function() {
    var w=0;
    if(document.documentElement &&
        document.documentElement.clientWidth) { // v3.12
        w=document.documentElement.clientWidth;
    } else if(document.body && document.body.clientWidth) {
        w=document.body.clientWidth;
    } else if(xDef(window.innerWidth,window.innerHeight,document.height)) {
        w=window.innerWidth;
        if(document.height>window.innerHeight) { w-=16; }
    }
    return w;
};

function xClientHeight() {
    var h=0;
    if(document.documentElement && document.documentElement.clientHeight) { // v3.12
        h=document.documentElement.clientHeight;
    } else if(document.body && document.body.clientHeight) {
        h=document.body.clientHeight;
    } else if(xDef(window.innerWidth,window.innerHeight,document.width)) {
        h=window.innerHeight;
        if(document.width>window.innerWidth) { h-=16; }
  }
  return h;
}

function xScrollTop() {
  var offset=0;
    if(document.documentElement && document.documentElement.scrollTop) { offset=document.documentElement.scrollTop; }
    else if(document.body && xDef(document.body.scrollTop)) { offset=document.body.scrollTop; }
  return offset;
}

function xDocHeight() {
      var b=document.body, e=document.documentElement;
      var esh=0, eoh=0, bsh=0, boh=0;
      if (e) {
        esh = e.scrollHeight;
        eoh = e.offsetHeight;
      }
      if (b) {
        bsh = b.scrollHeight;
        boh = b.offsetHeight;
      }
      return Math.max(esh,eoh,bsh,boh);
}
