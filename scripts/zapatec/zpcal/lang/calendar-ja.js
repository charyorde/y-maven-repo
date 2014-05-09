// $Id: calendar-jp.js 4434 2006-09-14 08:01:19Z shacka $
// ** I18N
Zapatec.Calendar._DN = new Array
("\u65E5",
 "\u6708",
 "\u706B",
 "\u6C34",
 "\u6728",
 "\u91D1",
 "\u571F",
 "\u65E5");
Zapatec.Calendar._MN = new Array
("1 \u6708",
 "2 \u6708",
 "3 \u6708",
 "4 \u6708",
 "5 \u6708",
 "6 \u6708",
 "7 \u6708",
 "8 \u6708",
 "9 \u6708",
 "10 \u6708",
 "11 \u6708",
 "12 \u6708");

// tooltips
Zapatec.Calendar._TT_jp = Zapatec.Calendar._TT = {};
Zapatec.Calendar._TT["TOGGLE"] = "\u9031\u306e\u6700\u521d\u306e\u26332\u66dc\u3092\u5207\u308a\u66ff\u3048";
Zapatec.Calendar._TT["PREV_YEAR"] = "\u524d\u5e74";
Zapatec.Calendar._TT["PREV_MONTH"] = "\u524d\u6708";
Zapatec.Calendar._TT["GO_TODAY"] = "\u4eca\u66dc";
Zapatec.Calendar._TT["NEXT_MONTH"] = "\u7fcc\u6708";
Zapatec.Calendar._TT["NEXT_YEAR"] = "\u7fcc\u5e74";
Zapatec.Calendar._TT["SEL_DATE"] = "\u66dc\u4ed8\u9078\u629e";
Zapatec.Calendar._TT["DRAG_TO_MOVE"] = "\u30a6\u30a3\u30f3\u30c9\u30a6\u306e\u79fb\u52d5";
Zapatec.Calendar._TT["PART_TODAY"] = " (\u4eca\u66dc)";
Zapatec.Calendar._TT["MON_FIRST"] = "\u6708\u66dc\u66dc\u3092\u5148\u982d\u306b";
Zapatec.Calendar._TT["SUN_FIRST"] = "\u66dc\u66dc\u66dc\u3092\u5148\u982d\u306b";
Zapatec.Calendar._TT["CLOSE"] = "\u38281\u12376\u12427";
Zapatec.Calendar._TT["TODAY"] = "\u4eca\u66dc";

// date formats
Zapatec.Calendar._TT["DEF_DATE_FORMAT"] = "%Y-%m-%d";
Zapatec.Calendar._TT["TT_DATE_FORMAT"] = "%m\u6708 %d\u66dc (%a)";

Zapatec.Calendar._TT["WK"] = "\u9031";

/* Preserve data */
	if(Zapatec.Calendar._DN) Zapatec.Calendar._TT._DN = Zapatec.Calendar._DN;
	if(Zapatec.Calendar._SDN) Zapatec.Calendar._TT._SDN = Zapatec.Calendar._SDN;
	if(Zapatec.Calendar._SDN_len) Zapatec.Calendar._TT._SDN_len = Zapatec.Calendar._SDN_len;
	if(Zapatec.Calendar._MN) Zapatec.Calendar._TT._MN = Zapatec.Calendar._MN;
	if(Zapatec.Calendar._SMN) Zapatec.Calendar._TT._SMN = Zapatec.Calendar._SMN;
	if(Zapatec.Calendar._SMN_len) Zapatec.Calendar._TT._SMN_len = Zapatec.Calendar._SMN_len;
	Zapatec.Calendar._DN = Zapatec.Calendar._SDN = Zapatec.Calendar._SDN_len = Zapatec.Calendar._MN = Zapatec.Calendar._SMN = Zapatec.Calendar._SMN_len = null;
