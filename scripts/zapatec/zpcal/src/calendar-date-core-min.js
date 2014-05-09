Date._MD=[31,28,31,30,31,30,31,31,30,31,30,31];Date.SECOND=1000;Date.MINUTE=60*Date.SECOND;Date.HOUR=60*Date.MINUTE;Date.DAY=24*Date.HOUR;Date.WEEK=7*Date.DAY;Date.prototype.getMonthDays=function(b){var a=this.getFullYear();if(typeof b=="undefined"){b=this.getMonth()}if(((0==(a%4))&&((0!=(a%100))||(0==(a%400))))&&b==1){return 29}else{return Date._MD[b]}};Date.prototype.getDayOfYear=function(){var a=new Date(this.getFullYear(),this.getMonth(),this.getDate(),0,0,0);var c=new Date(this.getFullYear(),0,0,0,0,0);var b=a-c;return Math.round(b/Date.DAY)};Date.prototype.getWeekNumber=function(){var c=new Date(this.getFullYear(),this.getMonth(),this.getDate(),0,0,0);var b=c.getDay();c.setDate(c.getDate()-(b+6)%7+3);var a=c.valueOf();c.setMonth(0);c.setDate(4);return Math.round((a-c.valueOf())/(7*86400000))+1};Date.prototype.equalsTo=function(a){return((this.getFullYear()==a.getFullYear())&&(this.getMonth()==a.getMonth())&&(this.getDate()==a.getDate())&&(this.getHours()==a.getHours())&&(this.getMinutes()==a.getMinutes()))};Date.prototype.dateEqualsTo=function(a){return((this.getFullYear()==a.getFullYear())&&(this.getMonth()==a.getMonth())&&(this.getDate()==a.getDate()))};Date.prototype.setDateOnly=function(a){var b=new Date(a);this.setDate(1);this.setFullYear(b.getFullYear());this.setMonth(b.getMonth());this.setDate(b.getDate())};Date.prototype.print=function(l){var b=this.getMonth();var k=this.getDate();var n=this.getFullYear();var p=this.getWeekNumber();var q=this.getDay();var v={};var r=this.getHours();var c=(r>=12);var h=(c)?(r-12):r;var u=this.getDayOfYear();if(h==0){h=12}var e=this.getMinutes();var j=this.getSeconds();v["%a"]=Zapatec.Calendar.i18n(q,"sdn");v["%A"]=Zapatec.Calendar.i18n(q,"dn");v["%b"]=Zapatec.Calendar.i18n(b,"smn");v["%B"]=Zapatec.Calendar.i18n(b,"mn");v["%C"]=1+Math.floor(n/100);v["%d"]=(k<10)?("0"+k):k;v["%e"]=k;v["%H"]=(r<10)?("0"+r):r;v["%I"]=(h<10)?("0"+h):h;v["%j"]=(u<100)?((u<10)?("00"+u):("0"+u)):u;v["%k"]=r?r:"0";v["%l"]=h;v["%m"]=(b<9)?("0"+(1+b)):(1+b);v["%M"]=(e<10)?("0"+e):e;v["%n"]="\n";v["%p"]=c?"PM":"AM";v["%P"]=c?"pm":"am";v["%s"]=Math.floor(this.getTime()/1000);v["%S"]=(j<10)?("0"+j):j;v["%t"]="\t";v["%U"]=v["%W"]=v["%V"]=(p<10)?("0"+p):p;v["%u"]=(q==0)?7:q;v["%w"]=q?q:"0";v["%y"]=""+n%100;if(v["%y"]<10){v["%y"]="0"+v["%y"]}v["%Y"]=n;v["%%"]="%";var t=/%./g;var o=l.match(t)||[];for(var g=0;g<o.length;g++){var f=v[o[g]];if(f){t=new RegExp(o[g],"g");l=l.replace(t,f)}}return l};Date.parseDate=function(r,v){var b=v,a=0,g=null,i=null,s=null,n=null,y=null,z=new Date(),c={};var o=["%d","%H","%I","%m","%M","%S","%s","%W","%u","%w","%y","%e","%k","%l","%s","%Y","%C"];function d(B){if(Zapatec.Utils.arrIndexOf(o,B)!=-1){return true}return false}function h(){for(var B=n[0];B<n[1];++B){var C=Zapatec.Calendar.i18n(B,y);if(!C){return null}if(C==r.substr(a,C.length)){s=C.length;return B}}return null}function l(){var B=r.substr(a,s);if(B.length!=s||/$\d+^/.test(B)){return null}return parseInt(B,10)}function t(){var B=(r.substr(a,s).toLowerCase()==Zapatec.Calendar.i18n("pm","ampm"))?true:false;return B||((r.substr(a,s).toLowerCase()==Zapatec.Calendar.i18n("am","ampm"))?false:null)}function k(){return""}function j(B){return(c[B]=i())}function p(B){if(typeof B=="undefined"||B===null){return false}return true}function e(){for(var B=0;B<arguments.length;++B){if(arguments[B]!==null&&typeof arguments[B]!="undefined"&&!isNaN(arguments[B])){return arguments[B]}}return null}if(typeof b!="string"||typeof r!="string"||r==""||b==""){return null}while(b){i=l;s=b.indexOf("%");s=(s==-1)?b.length:s;g=b.slice(0,s);if(g!=r.substr(a,s)){return null}a+=s;b=b.slice(s);if(b==""){break}g=b.slice(0,2);s=2;switch(g){case"%A":case"%a":y=(g=="%A")?"dn":"sdn";n=[0,7];i=h;break;case"%B":case"%b":y=(g=="%B")?"mn":"smn";n=[0,12];i=h;break;case"%p":case"%P":i=t;break;case"%Y":s=4;if(d(b.substr(2,2))){return null}while(isNaN(parseInt(r.charAt(a+s-1)))&&s>0){--s}if(s==0){break}break;case"%C":case"%s":s=1;if(d(b.substr(2,2))){return null}while(!isNaN(parseInt(r.charAt(a+s)))){++s}break;case"%k":case"%l":case"%e":s=1;if(d(b.substr(2,2))){return null}if(!isNaN(parseInt(r.charAt(a+1)))){++s}break;case"%j":s=3;break;case"%u":case"%w":s=1;case"%y":case"%m":case"%d":case"%W":case"%H":case"%I":case"%M":case"%S":break}if(j(g)===null){return null}a+=s;b=b.slice(2)}if(p(c["%s"])){z.setTime(c["%s"]*1000)}else{var m=e(c["%Y"],c["%y"]+ --c["%C"]*100,c["%y"]+(z.getFullYear()-z.getFullYear()%100),c["%C"]*100+z.getFullYear()%100);var A=e(c["%m"]-1,c["%b"],c["%B"]);var u=e(c["%d"]||c["%e"]);if(u===null||A===null){var q=e(c["%a"],c["%A"],c["%u"]==7?0:c["%u"],c["%w"])}var f=e(c["%H"],c["%k"]);if(f===null&&(p(c["%p"])||p(c["%P"]))){var x=e(c["%p"],c["%P"]);f=e(c["%I"],c["%l"]);f=x?((f==12)?12:(f+12)):((f==12)?(0):f)}if(m||m===0){z.setFullYear(m)}if(A||A===0){z.setMonth(A)}if(u||u===0){z.setDate(u)}if(p(c["%j"])){z.setMonth(0);z.setDate(1);z.setDate(c["%j"])}if(p(q)){z.setDate(z.getDate()+(q-z.getDay()))}if(p(c["%W"])){var w=z.getWeekNumber();if(w!=c["%W"]){z.setDate(z.getDate()+(c["%W"]-w)*7)}}if(f!==null){z.setHours(f)}if(p(c["%M"])){z.setMinutes(c["%M"])}if(p(c["%S"])){z.setSeconds(c["%S"])}}if(z.print(v)!=r){return null}return z};Date.prototype.__msh_oldSetFullYear=Date.prototype.setFullYear;Date.prototype.setFullYear=function(b){var a=new Date(this);a.__msh_oldSetFullYear(b);if(a.getMonth()!=this.getMonth()){this.setDate(28)}this.__msh_oldSetFullYear(b)};Date.prototype.compareDatesOnly=function(e,d){var c=e.getYear();var b=d.getYear();var a=e.getMonth();var h=d.getMonth();var g=e.getDate();var f=d.getDate();if(c>b){return -1}if(b>c){return 1}if(a>h){return -1}if(h>a){return 1}if(g>f){return -1}if(f>g){return 1}return 0};