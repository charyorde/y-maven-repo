// $Id: calendar-cs-win.js 6573 2007-03-09 08:36:16Z slip $
/* 
	calendar-cs-win.js
	language: Czech
	encoding: windows-1250
	author: Lubos Jerabek (xnet@seznam.cz)
	        Jan Uhlir (espinosa@centrum.cz)
*/

// ** I18N
Zapatec.Calendar._DN  = new Array('Nedìle','Pondìlí','Úterý','Støeda','Ètvrtek','Pátek','Sobota','Nedìle');
Zapatec.Calendar._SDN = new Array('Ne','Po','Út','St','Èt','Pá','So','Ne');
Zapatec.Calendar._MN  = new Array('Leden','Únor','Bøezen','Duben','Kvìten','Èerven','Èervenec','Srpen','Záøí','Øíjen','Listopad','Prosinec');
Zapatec.Calendar._SMN = new Array('Led','Úno','Bøe','Dub','Kvì','Èrv','Èvc','Srp','Záø','Øíj','Lis','Pro');

// tooltips
Zapatec.Calendar._TT_cs = Zapatec.Calendar._TT = {};
Zapatec.Calendar._TT["INFO"] = "O komponentì kalendáø";
Zapatec.Calendar._TT["TOGGLE"] = "Zmìna prvního dne v týdnu";
Zapatec.Calendar._TT["PREV_YEAR"] = "Pøedchozí rok (pøidrž pro menu)";
Zapatec.Calendar._TT["PREV_MONTH"] = "Pøedchozí mìsíc (pøidrž pro menu)";
Zapatec.Calendar._TT["GO_TODAY"] = "Dnešní datum";
Zapatec.Calendar._TT["NEXT_MONTH"] = "Další mìsíc (pøidrž pro menu)";
Zapatec.Calendar._TT["NEXT_YEAR"] = "Další rok (pøidrž pro menu)";
Zapatec.Calendar._TT["SEL_DATE"] = "Vyber datum";
Zapatec.Calendar._TT["DRAG_TO_MOVE"] = "Chy? a táhni, pro pøesun";
Zapatec.Calendar._TT["PART_TODAY"] = " (dnes)";
Zapatec.Calendar._TT["MON_FIRST"] = "Ukaž jako první Pondìlí";
//Zapatec.Calendar._TT["SUN_FIRST"] = "Ukaž jako první Nedìli";

Zapatec.Calendar._TT["ABOUT"] =
"DHTML Date/Time Selector\n" +
"(c) zapatec.com 2002-2007\n" + // don't translate this this ;-)
"For latest version visit: http://www.zapatec.com/\n" +
"This translation distributed under GNU LGPL.  See http://gnu.org/licenses/lgpl.html for details." +
"\n\n" +
"Výbìr datumu:\n" +
"- Use the \xab, \xbb buttons to select year\n" +
"- Použijte tlaèítka " + String.fromCharCode(0x2039) + ", " + String.fromCharCode(0x203a) + " k výbìru mìsíce\n" +
"- Podržte tlaèítko myši na jakémkoliv z tìch tlaèítek pro rychlejší výbìr.";

Zapatec.Calendar._TT["ABOUT_TIME"] = "\n\n" +
"Výbìr èasu:\n" +
"- Kliknìte na jakoukoliv z èástí výbìru èasu pro zvýšení.\n" +
"- nebo Shift-click pro snížení\n" +
"- nebo kliknìte a táhnìte pro rychlejší výbìr.";

// the following is to inform that "%s" is to be the first day of week
// %s will be replaced with the day name.
Zapatec.Calendar._TT["DAY_FIRST"] = "Zobraz %s první";

// This may be locale-dependent.  It specifies the week-end days, as an array
// of comma-separated numbers.  The numbers are from 0 to 6: 0 means Sunday, 1
// means Monday, etc.
Zapatec.Calendar._TT["WEEKEND"] = "0,6";

Zapatec.Calendar._TT["CLOSE"] = "Zavøít";
Zapatec.Calendar._TT["TODAY"] = "Dnes";
Zapatec.Calendar._TT["TIME_PART"] = "(Shift-)Klikni nebo táhni pro zmìnu hodnoty";

// date formats
Zapatec.Calendar._TT["DEF_DATE_FORMAT"] = "%d.%m.%Y";
Zapatec.Calendar._TT["TT_DATE_FORMAT"] = "%a, %b %e";

Zapatec.Calendar._TT["WK"] = "wk";
Zapatec.Calendar._TT["TIME"] = "Èas:";

/* Preserve data */
	if(Zapatec.Calendar._DN) Zapatec.Calendar._TT._DN = Zapatec.Calendar._DN;
	if(Zapatec.Calendar._SDN) Zapatec.Calendar._TT._SDN = Zapatec.Calendar._SDN;
	if(Zapatec.Calendar._SDN_len) Zapatec.Calendar._TT._SDN_len = Zapatec.Calendar._SDN_len;
	if(Zapatec.Calendar._MN) Zapatec.Calendar._TT._MN = Zapatec.Calendar._MN;
	if(Zapatec.Calendar._SMN) Zapatec.Calendar._TT._SMN = Zapatec.Calendar._SMN;
	if(Zapatec.Calendar._SMN_len) Zapatec.Calendar._TT._SMN_len = Zapatec.Calendar._SMN_len;
	Zapatec.Calendar._DN = Zapatec.Calendar._SDN = Zapatec.Calendar._SDN_len = Zapatec.Calendar._MN = Zapatec.Calendar._SMN = Zapatec.Calendar._SMN_len = null;
