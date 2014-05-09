/* $Id: calendar-date-core.js 6805 2007-03-30 12:36:39Z slip $ */
/**
 *
 * Copyright (c) 2004-2006 by Zapatec, Inc.
 * http://www.zapatec.com
 * 1700 MLK Way, Berkeley, California,
 * 94709, U.S.A.
 * All rights reserved.
 */

// BEGIN: DATE OBJECT PATCHES

/** \defgroup DateExtras Augmenting the Date object with some utility functions
 * and variables.
 */
//@{

Date._MD = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; /**< Number of days in each month */

Date.SECOND = 1000;		/**< One second has 1000 milliseconds. */
Date.MINUTE = 60 * Date.SECOND;	/**< One minute has 60 seconds. */
Date.HOUR   = 60 * Date.MINUTE;	/**< One hour has 60 minutes. */
Date.DAY    = 24 * Date.HOUR;	/**< One day has 24 hours. */
Date.WEEK   =  7 * Date.DAY;	/**< One week has 7 days. */

/** Returns the number of days in the month.  The \em month parameter is
 * optional; if not passed, the current month of \b this Date object is
 * assumed.
 *
 * @param month [int, optional] the month number, 0 for January.
 */
Date.prototype.getMonthDays = function(month) {
	var year = this.getFullYear();
	if (typeof month == "undefined") {
		month = this.getMonth();
	}
	if (((0 == (year%4)) && ( (0 != (year%100)) || (0 == (year%400)))) && month == 1) {
		return 29;
	} else {
		return Date._MD[month];
	}
};

/** Returns the number of the current day in the current year. */
Date.prototype.getDayOfYear = function() {
	var now = new Date(this.getFullYear(), this.getMonth(), this.getDate(), 0, 0, 0);
	var then = new Date(this.getFullYear(), 0, 0, 0, 0, 0);
	var time = now - then;
	return Math.round(time / Date.DAY);
};

/** Returns the number of the week in year, as defined in ISO 8601. */
Date.prototype.getWeekNumber = function() {
	var d = new Date(this.getFullYear(), this.getMonth(), this.getDate(), 0, 0, 0);
	var DoW = d.getDay();
	d.setDate(d.getDate() - (DoW + 6) % 7 + 3); // Nearest Thu
	var ms = d.valueOf(); // GMT
	d.setMonth(0);
	d.setDate(4); // Thu in Week 1
	return Math.round((ms - d.valueOf()) / (7 * 864e5)) + 1;
};

/** Checks dates equality.  Checks time too. */
Date.prototype.equalsTo = function(date) {
	return ((this.getFullYear() == date.getFullYear()) &&
		(this.getMonth() == date.getMonth()) &&
		(this.getDate() == date.getDate()) &&
		(this.getHours() == date.getHours()) &&
		(this.getMinutes() == date.getMinutes()));
};

/** Checks dates equality.  Ignores time. */
Date.prototype.dateEqualsTo = function(date) {
	return ((this.getFullYear() == date.getFullYear()) &&
		(this.getMonth() == date.getMonth()) &&
		(this.getDate() == date.getDate()));
};

/** Set only the year, month, date parts (keep existing time) */
Date.prototype.setDateOnly = function(date) {
	var tmp = new Date(date);
	this.setDate(1);
	this.setFullYear(tmp.getFullYear());
	this.setMonth(tmp.getMonth());
	this.setDate(tmp.getDate());
};

/** Prints the date in a string according to the given format.
 *
 * The format (\b str) may contain the following specialties:
 *
 * - %%a - Abbreviated weekday name
 * - %%A - Full weekday name
 * - %%b - Abbreviated month name
 * - %%B - Full month name
 * - %%C - Century number
 * - %%d - The day of the month (00 .. 31)
 * - %%e - The day of the month (0 .. 31)
 * - %%H - Hour (00 .. 23)
 * - %%I - Hour (01 .. 12)
 * - %%j - The day of the year (000 .. 366)
 * - %%k - Hour (0 .. 23)
 * - %%l - Hour (1 .. 12)
 * - %%m - Month (01 .. 12)
 * - %%M - Minute (00 .. 59)
 * - %%n - A newline character
 * - %%p - "PM" or "AM"
 * - %%P - "pm" or "am"
 * - %%S - Second (00 .. 59)
 * - %%s - Number of seconds since Epoch
 * - %%t - A tab character
 * - %%W - The week number (as per ISO 8601)
 * - %%u - The day of week (1 .. 7, 1 = Monday)
 * - %%w - The day of week (0 .. 6, 0 = Sunday)
 * - %%y - Year without the century (00 .. 99)
 * - %%Y - Year including the century (ex. 1979)
 * - %%% - A literal %% character
 *
 * They are almost the same as for the POSIX strftime function.
 *
 * @param str [string] the format to print date in.
 */
Date.prototype.print = function (str) {
	var m = this.getMonth();
	var d = this.getDate();
	var y = this.getFullYear();
	var wn = this.getWeekNumber();
	var w = this.getDay();
	var s = {};
	var hr = this.getHours();
	var pm = (hr >= 12);
	var ir = (pm) ? (hr - 12) : hr;
	var dy = this.getDayOfYear();
	if (ir == 0)
		ir = 12;
	var min = this.getMinutes();
	var sec = this.getSeconds();
	s["%a"] = Zapatec.Calendar.i18n(w, "sdn"); // abbreviated weekday name [FIXME: I18N]
	s["%A"] = Zapatec.Calendar.i18n(w, "dn"); // full weekday name
	s["%b"] = Zapatec.Calendar.i18n(m, "smn"); // abbreviated month name [FIXME: I18N]
	s["%B"] = Zapatec.Calendar.i18n(m, "mn"); // full month name
	// FIXME: %c : preferred date and time representation for the current locale
	s["%C"] = 1 + Math.floor(y / 100); // the century number
	s["%d"] = (d < 10) ? ("0" + d) : d; // the day of the month (range 01 to 31)
	s["%e"] = d; // the day of the month (range 1 to 31)
	// FIXME: %D : american date style: %m/%d/%y
	// FIXME: %E, %F, %G, %g, %h (man strftime)
	s["%H"] = (hr < 10) ? ("0" + hr) : hr; // hour, range 00 to 23 (24h format)
	s["%I"] = (ir < 10) ? ("0" + ir) : ir; // hour, range 01 to 12 (12h format)
	s["%j"] = (dy < 100) ? ((dy < 10) ? ("00" + dy) : ("0" + dy)) : dy; // day of the year (range 001 to 366)
	s["%k"] = hr ? hr :  "0"; // hour, range 0 to 23 (24h format)
	s["%l"] = ir;		// hour, range 1 to 12 (12h format)
	s["%m"] = (m < 9) ? ("0" + (1+m)) : (1+m); // month, range 01 to 12
	s["%M"] = (min < 10) ? ("0" + min) : min; // minute, range 00 to 59
	s["%n"] = "\n";		// a newline character
	s["%p"] = pm ? "PM" : "AM";
	s["%P"] = pm ? "pm" : "am";
	// FIXME: %r : the time in am/pm notation %I:%M:%S %p
	// FIXME: %R : the time in 24-hour notation %H:%M
	s["%s"] = Math.floor(this.getTime() / 1000);
	s["%S"] = (sec < 10) ? ("0" + sec) : sec; // seconds, range 00 to 59
	s["%t"] = "\t";		// a tab character
	// FIXME: %T : the time in 24-hour notation (%H:%M:%S)
	s["%U"] = s["%W"] = s["%V"] = (wn < 10) ? ("0" + wn) : wn;
  s["%u"] = (w == 0) ? 7 : w; // the day of the week (range 1 to 7, 1 = MON)
	s["%w"] = w ? w : "0";		// the day of the week (range 0 to 6, 0 = SUN)
	// FIXME: %x : preferred date representation for the current locale without the time
	// FIXME: %X : preferred time representation for the current locale without the date
	s["%y"] = '' + y % 100; // year without the century (range 00 to 99)
	if (s["%y"] < 10) {
		s["%y"] = "0" + s["%y"];
	}
	s["%Y"] = y;		// year with the century
	s["%%"] = "%";		// a literal '%' character

	var re = /%./g;
	var a = str.match(re) || [];
	for (var i = 0; i < a.length; i++) {
		var tmp = s[a[i]];
		if (tmp) {
			re = new RegExp(a[i], 'g');
			str = str.replace(re, tmp);
		}
	}

	return str;
};

/**
 * Parses a date from a string in the specified format.
 * This function requires strict following of the string to 
 * the format template, and any difference causes failure
 * to be returned. Also function refuses to parse formats
 * which containing number rules that have not fixed length
 * and are not separated from the next number rule by any
 * character string, as this requires complication of algorythm
 * and still sometimes is impossible to parse.
 *
 * @param str [string] the date as a string
 * @param format [string] the format to try to parse the date in
 *
 * @return [Date] a date object containing the parsed date or \b null if for
 * some reason the date couldn't be parsed.
 */
Date.parseDate = function (str, format) {
	var fmt = format, strPointer = 0, token = null, parseFunc = null, valueLength = null, 
	valueRange = null, valueType = null, date = new Date(), values = {};
	//need to have a way to determine whether rule is number
	var numberRules = ["%d", "%H", "%I", "%m", "%M", "%S", "%s", "%W", "%u", 
	                       "%w", "%y", "%e", "%k", "%l", "%s", "%Y", "%C"];
	function isNumberRule(rule) {
		if (Zapatec.Utils.arrIndexOf(numberRules, rule) != -1) {
			return true;
		}
		return false;
	}
	//parses string value from translation table
	function parseString() {
		for(var iString = valueRange[0]; iString < valueRange[1]; ++iString) {
			//checking if there is translation
			var value = Zapatec.Calendar.i18n(iString, valueType);
			if (!value) {
				return null;
			}
			//comparing with our part of the string
			if (value == str.substr(strPointer, value.length)) {
				//increasing string pointer
				valueLength = value.length;
				return iString;
			}
		}
		return null;
	}
	//parses the number from beginning of string
	function parseNumber() {
		var val = str.substr(strPointer, valueLength);
		if (val.length != valueLength || /$\d+^/.test(val)) {
			return null;
		}
		return parseInt(val, 10);
	}
	//parses AM PM rule
	function parseAMPM() {
		var result = (str.substr(strPointer, valueLength).toLowerCase() == Zapatec.Calendar.i18n("pm", "ampm")) ? true : false;
		return result || ((str.substr(strPointer, valueLength).toLowerCase() == Zapatec.Calendar.i18n("am", "ampm")) ? false : null);
	}
	//parses formating character
	function parseCharacter() {
		return "";
	}
	//parses the rule to the array
	function parseRule(rule) {
		return (values[rule] = parseFunc());
	}
	//function determines if rule value was parsed
	function wasParsed(rule) {
		if (typeof rule == "undefined" || rule === null) {
			return false;
		}
		return true;
	}
	//gets first defined value or null if no
	function getValue() {
		for(var i = 0; i < arguments.length; ++i) {
			if (arguments[i] !== null && typeof arguments[i] != "undefined" && !isNaN(arguments[i])) {
				return arguments[i];
			}
		}
		return null;
	}
	if (typeof fmt != "string" || typeof str != "string" || str == "" || fmt == "") {
		return null;
	}
	//cycle breaks format into tokens and checks or parses them
	while(fmt) {
		//this is the default value type
		parseFunc = parseNumber;
		//taking char token(that doesn't hold any information)
		valueLength = fmt.indexOf("%");
		valueLength = (valueLength == -1) ? fmt.length : valueLength;
		token = fmt.slice(0, valueLength);
		//checking if we have same token in parsed string
		if (token != str.substr(strPointer, valueLength)) {
			return null;
		}
		//skiping it
		strPointer += valueLength;
		fmt = fmt.slice(valueLength);
		if (fmt == "") {
			break;
		}
		//taking formating rule
		token = fmt.slice(0, 2);
		//this is the default length of value, as it is very often one for rules
		valueLength = 2;
		switch (token) {
			case "%A" :
			case "%a" : {
				valueType = (token == "%A") ? "dn" : "sdn";
				valueRange = [0, 7];
				parseFunc = parseString;
				break;
			}
			case "%B" :
			case "%b" : {
				valueType = (token == "%B") ? "mn" : "smn";
				valueRange = [0, 12];
				parseFunc = parseString;
				break;
			}
			case "%p" : 
			case "%P" : {
				parseFunc = parseAMPM;
				break;
			}
			case "%Y" : {
				valueLength = 4;
				if (isNumberRule(fmt.substr(2, 2))) {
					return null;
				}
				while(isNaN(parseInt(str.charAt(strPointer + valueLength - 1))) && valueLength > 0) {
					--valueLength;
				}
				if (valueLength == 0) {break;}
				break;
			}
			case "%C" : 
			case "%s" : {
				valueLength = 1;
				if (isNumberRule(fmt.substr(2, 2))) {
					return null;
				}
				while(!isNaN(parseInt(str.charAt(strPointer + valueLength)))) {
					++valueLength;
				}
				break;
			}
			case "%k" :
			case "%l" :
			case "%e" : {
				valueLength = 1;
				if (isNumberRule(fmt.substr(2, 2))) {
					return null;
				}
				if (!isNaN(parseInt(str.charAt(strPointer + 1)))) {
					++valueLength;
				}
				break;
			}
			case "%j" : valueLength = 3; break;
			case "%u" : 
			case "%w" : valueLength = 1;
			case "%y" :
			case "%m" :
			case "%d" :
			case "%W" :
			case "%H" :
			case "%I" : 
			case "%M" :
			case "%S" : {
				break;
			}
		}
		if (parseRule(token) === null) {
			return null;
		}
		//increasing pointer
		strPointer += valueLength;
		//skipint it
		fmt = fmt.slice(2);
	}
	if (wasParsed(values["%s"])) {
		date.setTime(values["%s"] * 1000);
	} else {
		var year = getValue(values["%Y"], values["%y"] + --values["%C"] * 100, 
		                    values["%y"] + (date.getFullYear() - date.getFullYear() % 100),
		                    values["%C"] * 100 + date.getFullYear() % 100);
		var month = getValue(values["%m"] - 1, values["%b"], values["%B"]);
		var day = getValue(values["%d"] || values["%e"]);
		if (day === null || month === null) {
			var dayOfWeek = getValue(values["%a"], values["%A"], values["%u"] == 7 ? 0 : values["%u"], values["%w"]);
		}
		var hour = getValue(values["%H"], values["%k"]);
		if (hour === null && (wasParsed(values["%p"]) || wasParsed(values["%P"]))) {
			var pm = getValue(values["%p"], values["%P"]);
			hour = getValue(values["%I"], values["%l"]);
			hour = pm ? ((hour == 12) ? 12 : (hour + 12)) : ((hour == 12) ? (0) : hour);
		}
		if (year || year === 0) {
			date.setFullYear(year);
		}
		if (month || month === 0) {
			date.setMonth(month);
		}
		if (day || day === 0) {
			date.setDate(day);
		}
		if (wasParsed(values["%j"])) {
			date.setMonth(0);
			date.setDate(1);
			date.setDate(values["%j"]);
		}
		if (wasParsed(dayOfWeek)) {
			date.setDate(date.getDate() + (dayOfWeek - date.getDay()));
		}
		if (wasParsed(values["%W"])) {
			var weekNumber = date.getWeekNumber();
			if (weekNumber != values["%W"]) {
				date.setDate(date.getDate() + (values["%W"] - weekNumber) * 7);
			}
		}
		if (hour !== null) {
			date.setHours(hour);
		}
		if (wasParsed(values["%M"])) {
			date.setMinutes(values["%M"]);
		}
		if (wasParsed(values["%S"])) {
			date.setSeconds(values["%S"]);
		}
	}
	//printing date in the same format and checking if we'll get the same string
	if (date.print(format) != str) {
		//if not returning error
		return null;
	}
	//or returning parsed date
	return date;
};

Date.prototype.__msh_oldSetFullYear = Date.prototype.setFullYear; /**< save a reference to the original setFullYear function */

/**
 * This function replaces the original Date.setFullYear() with a "safer"
 * function which makes sure that the month or date aren't modified (unless in
 * the exceptional case where the date is February 29 but the new year doesn't
 * contain it).
 *
 * @param y [int] the new year to move this date to
 */
Date.prototype.setFullYear = function(y) {
	var d = new Date(this);
	d.__msh_oldSetFullYear(y);
	if (d.getMonth() != this.getMonth())
		this.setDate(28);
	this.__msh_oldSetFullYear(y);
};

/**
 * This function compares only years, months and days of two date objects.
 *
 * @return [int] -1 if date1>date2, 1 if date2>date1 or 0 if they are equal
 *
 * @param date1 [Date] first date to compare
 * @param date1 [Date] second date to compare
 */
Date.prototype.compareDatesOnly = function (date1,date2) { 
	var year1 = date1.getYear();
	var year2 = date2.getYear(); 
	var month1 = date1.getMonth(); 
	var month2 = date2.getMonth(); 
	var day1 = date1.getDate(); 
	var day2 = date2.getDate(); 
	if (year1 > year2) { return -1;	} 
	if (year2 > year1) { return 1; } //years are equal 
	if (month1 > month2) { return -1; } 
	if (month2 > month1) { return 1; } //years and months are equal 
	if (day1 > day2) { return -1; } 
	if (day2 > day1) { return 1; } //days are equal 
	return 0; 
}

//@}

// END: DATE OBJECT PATCHES
