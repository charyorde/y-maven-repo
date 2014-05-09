/*

SUPERNOTE v1.0beta (c) 2005-2006 Angus Turnbull, http://www.twinhelix.com
Altering this notice or redistributing this file is prohibited.

*/

function SuperNote(myName,config) {
    var defaults = {
        myName: myName,
        allowNesting: false,
        cssProp: 'visibility',
        cssVis: 'inherit',
        cssHid: 'hidden',
        IESelectBoxFix: true,
        showDelay: 0,
        hideDelay: 500,
        animInSpeed: 0.1,
        animOutSpeed: 0.1,
        animations: [],
        mouseX: 0,
        mouseY: 0,
        notes: {},
        rootElm: null,
        onshow: null,
        onhide: null,
        touchscreen: this.touchsupport(),
        forceMouseEvents: false
    };
    $j.extend(this, defaults, config);
    var self = this;
    if (!$j.browser.msie || $j.browser.version >= 8 || self.forceMouseEvents) {
        $j(function() {
            $j('body').mouseover(function(evt) {
                self.mouseTrack(evt);
                self.mouseHandler(evt,1);
            }).mouseout(function(evt) {
                self.mouseHandler(evt,0);
            }).mousemove(function(evt) {
                self.mouseTrack(evt);
            });
        });
    }
 }

 SuperNote.prototype.bTypes={};
 SuperNote.prototype.pTypes={};
 SuperNote.prototype.pTypes.mouseoffset = function(obj,noteID,nextVis,nextAnim) {
     with(obj) {
         var note = notes[noteID];
         if(nextVis&&!note.animating&&!note.visible) {
             note.ref.style.left = checkWinX(mouseX,note)+'px';
             note.ref.style.top = checkWinY(mouseY,note)+'px'
         }
     }
 };
 SuperNote.prototype.pTypes.mousetrack = function(obj,noteID,nextVis,nextAnim) {
     with(obj) {
         var note = notes[noteID];
         if(nextVis&&!note.animating&&!note.visible) {
             function updatePosition() {
                 note.ref.style.left = checkWinX(mouseX, note) +"px";
                 note.ref.style.top = checkWinY(mouseY, note) +"px";
             }
             updatePosition();
             obj.IEFrameFix(noteID,1);
             if (!note.trackTimer) {
                 note.trackTimer = setInterval(updatePosition, 50);
             }
         }
         else if(!nextVis&&!nextAnim) {
             clearInterval(note.trackTimer);
             note.trackTimer = null
         }
     }
 };
 SuperNote.prototype.pTypes.triggeroffset = function(obj,noteID,nextVis,nextAnim) {
     with(obj) {
         var note = notes[noteID];
         if(nextVis&&!note.animating&&!note.visible) {
             var x = 0,y = 0,elm = note.trigRef;
             while(elm) {
                 x+=elm.offsetLeft;
                 y+=elm.offsetTop;
                 elm = elm.offsetParent
             }
             note.ref.style.left = checkWinX(x,note)+'px';
             note.ref.style.top = checkWinY(y,note)+'px'
         }
     }
 };
 SuperNote.prototype.bTypes.pinned = function(obj,noteID,nextVis) {
     with(obj) {
         return(!nextVis)?false:true
     }
 };
 SuperNote.prototype.docBody = function() {
     return document[(document.compatMode&&document.compatMode.indexOf('CSS')>-1)?'documentElement':'body']
     };
     SuperNote.prototype.getWinW = function() {
         return this.docBody().clientWidth||window.innerWidth||0
     };
     SuperNote.prototype.getWinH = function() {
         return this.docBody().clientHeight||window.innerHeight||0
     };
     SuperNote.prototype.getScrX = function() {
         return this.docBody().scrollLeft||window.scrollX||0
     };
     SuperNote.prototype.getScrY = function() {
         return this.docBody().scrollTop||window.scrollY||0
     };
     SuperNote.prototype.checkWinX = function(newX,note) {
         with(this) {
             return Math.max(getScrX(),Math.min(newX,getScrX()+getWinW()-note.ref.offsetWidth-8))
         }
     };
     SuperNote.prototype.checkWinY = function(newY,note) {
         with(this) {
             return Math.max(getScrY(),Math.min(newY,getScrY()+getWinH()-note.ref.offsetHeight-8))
         }
     };
     SuperNote.prototype.mouseTrack = function(evt) {
         this.mouseX = evt.pageX || 0;
         this.mouseY = evt.pageY || 0;
     };
     SuperNote.prototype.mouseHandler = function(evt,show) {
         with(this) {
             if (!document.documentElement) return true;
             var srcElm = evt.target || evt.srcElement,
                 trigRE = new RegExp(myName+'-(hover|click)-([a-z0-9]+)', 'i'),
                 targRE = new RegExp(myName+'-(note)-([a-z0-9]+)', 'i'),
                 trigFind = 1,
                 foundNotes = {};
             if (srcElm && srcElm.nodeType != 1) {
                 srcElm = srcElm.parentNode;
             }
             var elm = srcElm;
             while (elm && elm != rootElm) {
                 if (targRE.test(elm.id) || (trigFind && trigRE.test(elm.className))) {
                     if (!allowNesting) trigFind = 0;
                     var click = RegExp.$1 == 'click' ? 1 : 0,
                         noteID = RegExp.$2,
                         ref = document.getElementById(myName+'-note-' + noteID),
                         trigRef = trigRE.test(elm.className)?elm:null;
                     if(ref) {
                         if(!notes[noteID]) {
                             notes[noteID]= {
                                 click:click,ref:ref,trigRef:null,visible:0,animating:0,timer:null
                             };
                             ref._sn_obj = this;
                             ref._sn_id = noteID
                         }
                         var note = notes[noteID];
                         if(!note.click||(trigRef!=srcElm))foundNotes[noteID]=true;
                         if(!note.click||(show==2)) {
                             if(trigRef)notes[noteID].trigRef = notes[noteID].ref._sn_trig = elm;
                             display(noteID,show);
                             if (note.click && (srcElm == trigRef)) {
                                 evt.preventDefault();
                             }
                         }
                     }
                 }
                 if(elm._sn_trig) {
                     trigFind = 1;
                     elm = elm._sn_trig
                 }
                 else {
                     elm = elm.parentNode
                 }
             }
             if(show==2)for(var n in notes) {
                 if(notes[n].click&&notes[n].visible&&!foundNotes[n])display(n,0)
             }
         }
     };
     SuperNote.prototype.display = function(noteID,show) {
         var self = this;
         with(this) {
             with(notes[noteID]) {
                 clearTimeout(timer);
                 if (!animating || (show ? !visible : visible)) {
                     if (this.touchscreen) {
                         self.setVis(noteID, show, false);
                     } else {
                         var tmt = animating ? 1 : (show ? showDelay || 1 : hideDelay || 1);
                         timer = setTimeout(function() { self.setVis(noteID, show, false); }, tmt);
                     }
                 }
             }
         }
     };
     SuperNote.prototype.checkType = function(noteID,nextVis,nextAnim) {
         with(this) {
             var note = notes[noteID],bType,pType;
             if((/snp-([a-z]+)/).test(note.ref.className))pType = RegExp.$1;
             if((/snb-([a-z]+)/).test(note.ref.className))bType = RegExp.$1;
             if(nextAnim&&bType&&bTypes[bType]&&(bTypes[bType](this,noteID,nextVis)==false))return false;
             if(pType&&pTypes[pType])pTypes[pType](this,noteID,nextVis,nextAnim);
             return true
         }
     };
     SuperNote.prototype.setVis = function(noteID, show, now) {
         with(this) {
             var note = notes[noteID];
             if (note && checkType(noteID, show, 1) || now) {
                 note.visible = show;
                 note.animating = 1;
                 animate(noteID,show,now)
             }
         }
     };
     SuperNote.prototype.animate = function(noteID,show,now) {
         var self = this;
         with(this) {
             var note = notes[noteID];
             if(!note.animTimer)note.animTimer = 0;
             if(!note.animC)note.animC = 0;
             with(note) {
                 clearTimeout(animTimer);
                 var speed=(animations.length&&!now)?(show?animInSpeed:animOutSpeed):1;
                 if(show&&!animC) {
                     if(onshow)this.onshow(noteID);
                     IEFrameFix(noteID,1);
                     ref.style[cssProp]=cssVis
                 }
                 animC = Math.max(0,Math.min(1,animC+speed*(show?1:-1)));
                 if(document.getElementById&&speed<1)for(var a = 0;
                 a<animations.length;
                 a++)animations[a](ref,animC);
                 if(!show&&!animC) {
                     if(onhide)this.onhide(noteID);
                     IEFrameFix(noteID,0);
                     ref.style[cssProp]=cssHid
                 }
                 if(animC!=parseInt(animC)) {
                     animTimer = setTimeout(function() { self.animate(noteID, show); }, 50);
                 }
                 else {
                     checkType(noteID,animC?1:0,0);
                     note.animating = 0
                 }
             }
         }
     };
     SuperNote.prototype.IEFrameFix = function(noteID,show) {
         with(this) {
             if(!window.createPopup||!IESelectBoxFix)return;
             var note = notes[noteID],ifr = note.iframe;
             if(!ifr) {
                 ifr = notes[noteID].iframe = document.createElement('iframe');
                 ifr.setAttribute("src","javascript:false;");
                 ifr.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(opacity=0)';
                 ifr.style.position = 'absolute';
                 ifr.style.borderWidth = '0';
                 note.ref.parentNode.insertBefore(ifr,note.ref.parentNode.firstChild)
             }
             if(show) {
                 ifr.style.left = note.ref.offsetLeft+'px';
                 ifr.style.top = note.ref.offsetTop+'px';
                 ifr.style.width = note.ref.offsetWidth+'px';
                 ifr.style.height = note.ref.offsetHeight+'px';
                 ifr.style.visibility='inherit'
             }
             else {
                 ifr.style.visibility='hidden'
             }
         }
     };

SuperNote.prototype.touchsupport = function() {
    return ('ontouchstart' in window);
};
