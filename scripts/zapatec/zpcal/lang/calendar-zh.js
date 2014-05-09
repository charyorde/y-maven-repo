// $Id: calendar-en.js 6573 2007-03-09 08:36:16Z slip $
// ** I18N

// Calendar EN language
// Contac: <support@zapatec.com>
// Encoding: any
// Copyright Zapatec 2004-2008

// For translators: please use UTF-8 if possible.  

// full day names
Zapatec.Calendar._DN = new Array
("星期日",
 "星期一",
 "星期二",
 "星期三",
 "星期四",
 "星期五",
 "星期六",
 "星期日");

// Please note that the following array of short day names (and the same goes
// for short month names, _SMN) isn't absolutely necessary.  We give it here
// for exemplification on how one can customize the short day names, but if
// they are simply the first N letters of the full name you can simply say:
//
//   Zapatec.Calendar._SDN_len = N; // short day name length
//   Zapatec.Calendar._SMN_len = N; // short month name length
//
// If N = 3 then this is not needed either since we assume a value of 3 if not
// present, to be compatible with translation files that were written before
// this feature.

// short day names
Zapatec.Calendar._SDN = new Array
("週日",
 "週一",
 "週二",
 "週三",
 "週四",
 "週五",
 "週六",
 "週日");

// First day of the week. "0" means display Sunday first, "1" means display
// Monday first, etc.
Zapatec.Calendar._FD = 0;

// full month names
Zapatec.Calendar._MN = new Array
("一月",
 "二月",
 "三月",
 "四月",
 "五月",
 "六月",
 "七月",
 "八月",
 "九月",
 "十月",
 "十一月",
 "十二月");

// short month names
Zapatec.Calendar._SMN = new Array
("一月",
 "二月",
 "三月",
 "四月",
 "五月",
 "六月",
 "七月",
 "八月",
 "九月",
 "十月",
 "十一月",
 "十二月");

// tooltips
Zapatec.Calendar._TT_en = Zapatec.Calendar._TT = {};
Zapatec.Calendar._TT["INFO"] = "關於日曆";

Zapatec.Calendar._TT["ABOUT"] =
"DHTML Date/Time Selector\n" +
"(c) zapatec.com 2002-2007\n" + // don't translate this this ;-)
"如需最新版本，請訪問: http://www.zapatec.com/\n" +
"\n\n" +
"日期選擇:\n" +
"- 使用 \xab, \xbb 按鈕選擇年份\n" +
"- 使用 " + String.fromCharCode(0x2039) + ", " + String.fromCharCode(0x203a) + " 按鈕選擇月份\n" +
"- 在以上任何按鈕上按住滑鼠按鈕以加快選擇速度。";
Zapatec.Calendar._TT["ABOUT_TIME"] = "\n\n" +
"時間選擇: \n" +
"- 點按任何時間部分以升高它\n" +
"- 或Shift-點按以降低它\n" +
"- 或點按並拖動以加快選擇速度。";

Zapatec.Calendar._TT["PREV_YEAR"] = "上一個年份 (按住以顯示功能表)";
Zapatec.Calendar._TT["PREV_MONTH"] = "上一個月份 (按住以顯示功能表)";
Zapatec.Calendar._TT["GO_TODAY"] = "前往今天 (按住以顯示歷史)";
Zapatec.Calendar._TT["NEXT_MONTH"] = "下一個月份 (按住以顯示功能表)";
Zapatec.Calendar._TT["NEXT_YEAR"] = "下一個年份 (按住以顯示功能表)";
Zapatec.Calendar._TT["SEL_DATE"] = "選擇日期";
Zapatec.Calendar._TT["DRAG_TO_MOVE"] = "拖動";
Zapatec.Calendar._TT["PART_TODAY"] = " (今天)";

// the following is to inform that "%s" is to be the first day of week
// %s will be replaced with the day name.
Zapatec.Calendar._TT["DAY_FIRST"] = "首先顯示 %s ";

// This may be locale-dependent.  It specifies the week-end days, as an array
// of comma-separated numbers.  The numbers are from 0 to 6: 0 means Sunday, 1
// means Monday, etc.
Zapatec.Calendar._TT["WEEKEND"] = "0,6";

Zapatec.Calendar._TT["CLOSE"] = "關閉";
Zapatec.Calendar._TT["TODAY"] = "今天";
Zapatec.Calendar._TT["TIME_PART"] = "(Shift-)點按或拖動以改變數值";

// date formats
Zapatec.Calendar._TT["DEF_DATE_FORMAT"] = "%Y-%m-%d";
Zapatec.Calendar._TT["TT_DATE_FORMAT"] = "%a, %e %b";

Zapatec.Calendar._TT["WK"] = "wk";
Zapatec.Calendar._TT["TIME"] = "時間:";

Zapatec.Calendar._TT["E_RANGE"] = "超出範圍";
	
Zapatec.Calendar._TT._AMPM = {am : "上午", pm : "下午"};

/* Preserve data */
	if(Zapatec.Calendar._DN) Zapatec.Calendar._TT._DN = Zapatec.Calendar._DN;
	if(Zapatec.Calendar._SDN) Zapatec.Calendar._TT._SDN = Zapatec.Calendar._SDN;
	if(Zapatec.Calendar._SDN_len) Zapatec.Calendar._TT._SDN_len = Zapatec.Calendar._SDN_len;
	if(Zapatec.Calendar._MN) Zapatec.Calendar._TT._MN = Zapatec.Calendar._MN;
	if(Zapatec.Calendar._SMN) Zapatec.Calendar._TT._SMN = Zapatec.Calendar._SMN;
	if(Zapatec.Calendar._SMN_len) Zapatec.Calendar._TT._SMN_len = Zapatec.Calendar._SMN_len;
	Zapatec.Calendar._DN = Zapatec.Calendar._SDN = Zapatec.Calendar._SDN_len = Zapatec.Calendar._MN = Zapatec.Calendar._SMN = Zapatec.Calendar._SMN_len = null;
