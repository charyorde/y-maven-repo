// $Id: calendar-tr.js 6573 2007-03-09 08:36:16Z slip $
// ** I18N

// Calendar TR language (TURKISH)
// Author: Hacı Murat Arpat, <hma30@yahoo.com>
// Encoding: utf-8
// Distributed under the same terms as the calendar itself.

// For translators: please use UTF-8 if possible.  We strongly believe that
// Unicode is the answer to a real internationalized world.  Also please
// include your contact information in the header, as can be seen above.

// full day names
Zapatec.Calendar._DN = new Array
("Pazar",
 "Pazartesi",
 "Salı",
 "Çarşamba",
 "Perşembe",
 "Cuma",
 "Cumartesi",
 "Pazar");

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
("Paz",
 "Pzt",
 "Sal",
 "Çrş",
 "Prş",
 "Cum",
 "Cmt",
 "Paz");

// First day of the week. "0" means display Sunday first, "1" means display
// Monday first, etc.
Zapatec.Calendar._FD = 1;

// full month names
Zapatec.Calendar._MN = new Array
("Ocak",
 "Şubat",
 "Mart",
 "Nisan",
 "Mayıs",
 "Haziran",
 "Temmuz",
 "Ağustos",
 "Eylül",
 "Ekim",
 "Kasım",
 "Aralık");

// short month names
Zapatec.Calendar._SMN = new Array
("Oca",
 "Şub",
 "Mar",
 "Nis",
 "May",
 "Haz",
 "Tem",
 "Ağu",
 "Eyl",
 "Eki",
 "Kas",
 "Ara");

// tooltips
Zapatec.Calendar._TT_tr = Zapatec.Calendar._TT = {};
Zapatec.Calendar._TT["INFO"] = "Takvim Hakkında";

Zapatec.Calendar._TT["ABOUT"] =
"DHTML Tarih/Saat Seçici\n" +
"(c) zapatec.com 2002-2007\n" + // don't translate this this ;-)
"En son sürüm için ziyaret edin: http://www.zapatec.com/\n" +
"\n\n" +
"Tarih seçimi:\n" +
"- Yılı seçmek için \xab , \xbb tuşlarını kullanın\n" +
"- Ay'ı seçmek için " + String.fromCharCode(0x2039) + " , " + String.fromCharCode(0x203a) + " tuşlarını kullanın\n" +
"- Hızlı seçim için bu tuşlar üzerinde fareyi basılı tutun.";
Zapatec.Calendar._TT["ABOUT_TIME"] = "\n\n" +
"Saat seçimi:\n" +
"- Herhangi bir zaman bölümünü arttırmak için üzerine tıklayın\n" +
"- veya azaltmak için Shift ile beraber tıklayın\n" +
"- veya hızlı seçim için tıklayıp sağa-sola sürükleyin.";

Zapatec.Calendar._TT["PREV_YEAR"] = "Önceki yıl (menü için basılı tutunuz)";
Zapatec.Calendar._TT["PREV_MONTH"] = "Önceki ay (menü için basılı tutunuz)";
Zapatec.Calendar._TT["GO_TODAY"] = "Bugün'e git (geçmiş için basılı tutunuz)";
Zapatec.Calendar._TT["NEXT_MONTH"] = "Sonraki ay (menü için basılı tutunuz)";
Zapatec.Calendar._TT["NEXT_YEAR"] = "Sonraki yıl (menü için basılı tutunuz)";
Zapatec.Calendar._TT["SEL_DATE"] = "Tarih seçiniz";
Zapatec.Calendar._TT["DRAG_TO_MOVE"] = "Taşımak için sürükleyiniz";
Zapatec.Calendar._TT["PART_TODAY"] = " (bugün)";

// the following is to inform that "%s" is to be the first day of week
// %s will be replaced with the day name.
Zapatec.Calendar._TT["DAY_FIRST"] = "İlk gün %s olsun";

// This may be locale-dependent.  It specifies the week-end days, as an array
// of comma-separated numbers.  The numbers are from 0 to 6: 0 means Sunday, 1
// means Monday, etc.
Zapatec.Calendar._TT["WEEKEND"] = "0,6";

Zapatec.Calendar._TT["CLOSE"] = "Kapat";
Zapatec.Calendar._TT["TODAY"] = "Bugün";
Zapatec.Calendar._TT["TIME_PART"] = "Arttırmak için tıklayın,<br>azaltmak için (Shift-)'le tıklayın.<br>Ayrıca tıklayıp sağa-sola da sürükleyebilirsiniz";

// date formats
Zapatec.Calendar._TT["DEF_DATE_FORMAT"] = "%d.%m.%Y";
Zapatec.Calendar._TT["TT_DATE_FORMAT"] = "%d %B %Y %A";

Zapatec.Calendar._TT["WK"] = "Hafta";
Zapatec.Calendar._TT["TIME"] = "Saat:";

Zapatec.Calendar._TT["E_RANGE"] = "Dizi dışı";

/* Preserve data */
	if(Zapatec.Calendar._DN) Zapatec.Calendar._TT._DN = Zapatec.Calendar._DN;
	if(Zapatec.Calendar._SDN) Zapatec.Calendar._TT._SDN = Zapatec.Calendar._SDN;
	if(Zapatec.Calendar._SDN_len) Zapatec.Calendar._TT._SDN_len = Zapatec.Calendar._SDN_len;
	if(Zapatec.Calendar._MN) Zapatec.Calendar._TT._MN = Zapatec.Calendar._MN;
	if(Zapatec.Calendar._SMN) Zapatec.Calendar._TT._SMN = Zapatec.Calendar._SMN;
	if(Zapatec.Calendar._SMN_len) Zapatec.Calendar._TT._SMN_len = Zapatec.Calendar._SMN_len;
	Zapatec.Calendar._DN = Zapatec.Calendar._SDN = Zapatec.Calendar._SDN_len = Zapatec.Calendar._MN = Zapatec.Calendar._SMN = Zapatec.Calendar._SMN_len = null;
