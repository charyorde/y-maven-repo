/**
 * checks if Date d1 is <= Date d2
 * by checking day of the month/year
 * only, (hours/min/sec/mil are ignored)
 *
 * ex
 * var d1 = new Date(); d1.setFullYear(2004);
 * var d2 = new Date(); d1.setFullYear(2005);
 * date(LTEQ(d1, d2)); // true
 * date(LTEQ(d2, d1)); // false
 */
jive.model.dateLTEQ = function(d1, d2){
	return (d1.getFullYear() < d2.getFullYear() || d1.getFullYear() == d2.getFullYear() && (
	        d1.getMonth() < d2.getMonth()  || d1.getMonth() == d2.getMonth() && (
	        d1.getDate() <= d2.getDate())));
};
jive.model.dateLT = function(d1, d2){
	return (d1.getFullYear() < d2.getFullYear() || d1.getFullYear() == d2.getFullYear() && (
	        d1.getMonth() < d2.getMonth()  || d1.getMonth() == d2.getMonth() && (
	        d1.getDate() < d2.getDate())));
};


jive.model.dateGT = function(d1, d2){
	return jive.model.dateLT(d2, d1);
};
jive.model.dateGTEQ = function(d1, d2){
	return jive.model.dateLTEQ(d2, d1);
};
/*
 * compares if two dates have equal month and year
 */
jive.model.monthYearEQ = function(d1, d2){
	return d1.getMonth() == d2.getMonth() &&
	        d1.getFullYear() == d2.getFullYear();
};
jive.model.dateEQ = function(d1, d2){
	return (d1.getDate() == d2.getDate() &&
	        d1.getMonth() == d2.getMonth() &&
	        d1.getFullYear() == d2.getFullYear());
};
/**
 * this subtracts one month from a date
 *
 * THIS FIXES A SAFARI BUG (OR 'FEATURE' :)
 *
 * this also fixes subtracting a month if the date >= 29
 * ie, if it's march 29th - 1 month = feb 29th = march 1st :(
 * instead, it'll subtract a month, and if the month is still the same
 * it'll subtract 1 day until it's different
 */
jive.model.dateMinusMonth = function(d){
	var m = d.getMonth();
	if(d.getMonth() == 0){
		d.setFullYear(d.getFullYear() - 1);
		d.setMonth(11);
	}else{
		d.setMonth(d.getMonth()-1);
	}
	while(d.getMonth() == m){
		d.setDate(d.getDate() - 1);
	}
};
/**
 * this subtracts one day from a date
 *
 * THIS FIXES A SAFARI BUG (OR 'FEATURE' :)
 */
jive.model.dateMinusDay = function(d){
	if(d.getDate() == 0 && d.getDate() == 1){
		d.setFullYear(d.getFullYear() - 1);
		d.setMonth(11);
		d.setDate(31);
	}else{
		d.setDate(d.getDate()-1);
	}
};

jive.model.DateUtil = (function(){
    var iso8601pattern = /(\d\d\d\d)-(\d\d)-(\d\d)T(\d\d):(\d\d):(\d\d)(?:[\.,](\d+))?([Z\+\-])(\d\d)?:?(\d\d)?/;

    return {
        /**
         * Parses a string in ISO 8601 extended date-time format into a number of milliseconds since the Unix Epoch.
         * Returns NaN on error.
         *
         * @param dateStr The ISO 8601 string to parse.
         * @return {Number} The time value (number of milliseconds since the epoch).  Date has a constructor that takes this.
         * NaN on error.
         */
        parseISODateTime: function parseISODateTime(dateStr){
            if(Date.prototype.toISOString){
                //we have a shot at parsing this
                try{
                    var dateInt = Date.parse(dateStr);
                    if(typeof dateInt == 'number' && !isNaN(dateInt)){
                        return dateInt;
                    }
                }catch(ex){
                    //fall back to regex
                }
            }
            //full date-time pattern, with delimiters
            var match = iso8601pattern.exec(dateStr);

            function toInt(s, def){
                var ret = NaN;

                if(s != null && s.length > 0){
                    ret = parseInt(s, 10);
                }

                if(isNaN(ret)){
                    ret = def;
                }
                return ret;
            }

            function localTzOff(d){
                function pad(n){
                    var s = String(n);
                    while(s.length < 2){
                        s = "0" + s;
                    }
                    return s;
                }
                function trunc(n){
                    if(n >= 0){
                        return Math.floor(n);
                    }
                    return Math.ceil(n);
                }
                var offsetMin = -d.getTimezoneOffset();
                return offsetMin * 60000;
            }

            if(match){
                var hour = toInt(match[4], 0),
                    minute = toInt(match[5], 0),
                    second= toInt(match[6], 0),
                    secondFrac = parseFloat("0." + match[7]),
                    tzSign = match[8],
                    tzHour = toInt(match[9], 0),
                    tzMin = toInt(match[10], 0);

                //Deal with the time zone in dateStr
                if(tzSign == 'Z'){
                    tzSign = 0;
                }else if(tzSign == '+'){
                    tzSign = 1;
                }else{
                    tzSign = -1;
                }

                //Figure out milliseconds since midnight
                var tzOff = tzSign*(tzMin + 60*tzHour)*60*1000,
                    dayMillis = ((hour*60 + minute)*60 + second + secondFrac)*1000;

                //Make Date deal with the Gregorian calendar, and all it's BS, then add the offsets for local timezone, the time of day, and the specified timezone
                var date = new Date(toInt(match[1]), toInt(match[2])-1, toInt(match[3]));
                return date.getTime() + localTzOff(date) + dayMillis - tzOff;
            }else{
                return NaN;
            }
        },

        _testParsing: function(){
            var year = 1970;
            var month = 0;
            var day = 1;
            var hour = 0;
            var minute = 0;
            var second = 0;
            var date;

            for(var i = 0; i < 500; ++i){
                date = new Date(year + i, (month + i) % 12, (day + i) % 29 + 1, (hour + i) % 24, (minute + i) % 60, (second + i) % 60, (2*i)%1000);
                var s = this.formatToISODateTime(date);
                var t = this.parseISODateTime(s);
                if(t !== date.getTime()){
                    console.log("fail: ", date);
                }else{
                    console.log("Success: " + t, s);
                }
            }
        },

        /**
         * returns time formatted
         * yyyy-mm-ddThh:ii:ss.sss+0000
         */
        formatToISODateTime: function formatToISODateTime(d){
            if(d.toISOString()){
                return d.toISOString().replace(/Z$/, "+0000"); //Work around a bug in the server-side date parser
            }

            var year = d.getUTCFullYear();
            var month = d.getUTCMonth() + 1;
            if(month < 10) month = "0" + month;
            var day = d.getUTCDate();
            if(day < 10) day = "0" + day;

            var hour = d.getUTCHours();
            if(hour < 10) hour = "0" + hour;
            var minute = d.getUTCMinutes();
            if(minute < 10) minute = "0" + minute;
            var second = d.getUTCSeconds();
            if(second < 10) second = "0" + second;

            var millis = d.getUTCMilliseconds();
            if(millis < 10){
                millis = "00" + millis;
            }else if(millis < 100){
                millis = "0" + millis;
            }

            return year + "-" + month + "-" + day + "T" + hour + ":" + minute + ":" + second + "." + millis + "+0000";
        }
    };
})();

/**
 * helps format common date strings
 */
jive.model.DateHelper = function(control){

	var settings = control.getSettingsManager();
	var that = this;

    /**
	 * returns time formatted
	 * yyyy-mm-dd hh:ii:ss
	 */
	this.formatToDateTime = function(d){
		var year = d.getFullYear();
		var month = d.getMonth() + 1;
		if(month < 10) month = "0" + month;
		var day = d.getDate();
		if(day < 10) day = "0" + day;

		var hour = d.getHours();
		if(hour < 10) hour = "0" + hour;
		var minute = d.getMinutes();
		if(minute < 10) minute = "0" + minute;
		var second = d.getSeconds();
		if(second < 10) second = "0" + second;

		return year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
	};

	/**
	 * returns time formatted
	 * as [h]h:mma
	 */
	this.formatTo12HourTime = function(d){
		var format = settings.getTimeFormat();
		if(format == "3:00p"){
			var hour = d.getHours();
			var minute = d.getMinutes();
			if(minute < 10) minute = "0" + minute;
			var ampm = "a";

			if(hour >= 12){
				ampm = "p";
				hour -= 12;
			}
			if(hour == 0){
				hour = 12;
			}
			return hour + ":" + minute + ampm;
		}else{ // 15:00
			var hour = d.getHours();
			var minute = d.getMinutes();
			if(minute < 10) minute = "0" + minute;
			return hour + ":" + minute;
		}
	};

	/**
	 * returns date formatted
	 * as mm/dd
	 */
	this.formatToShortDate = function(d){
		var month = d.getMonth()+1;
		var day = d.getDate();

		var format = settings.getDateFormat();
		if(format == "4/30"){
			return month + "/" + day;
		}else{ // 30/4
			return day + "/" + month;
		}
	};

};
