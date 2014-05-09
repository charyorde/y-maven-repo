/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.model.SettingsManager = function(control){
    /**
     * returns the current GMT time
     */
    var preferredMode = "rawhtml";
    var last_gmt = null;
    var last_gmt_stamp = (new Date()).getTime();
    var start_on = 0;

    this.getGMT = function(){
        var d = new Date();
        if(last_gmt != null && d.getTime() < last_gmt_stamp + 500){
            return last_gmt;
        }
        var d = new Date();
        var now = new Date();
        // get the current GMT time
        // but chop off the "GMT" at the end of the toString
        now.setTime(Date.parse(d.toUTCString().substring(0, d.toUTCString().length - 3)));

        last_gmt = now;
        return now;
    }

    this.getNOW = function(){
        return new Date();
    }

    this.getStartWeekOn = function(){
        return 1;
    }

    this.getSmartShading = function(){
        return true;
    }

    /**
     * return the URL to the weather icon for the input date
     * @param dt
     */
    this.getWeatherImage = function(dt){
        return "";
    }

    this.getDateFormat = function(){
        return "4/30";
    }

    this.getWeekDayToStartOn = function() {
        return start_on;
    }

    this.setWeekDayToStartOn = function(d) {
        start_on = (parseInt(d) == NaN ? 0 : parseInt(d));
    }

}