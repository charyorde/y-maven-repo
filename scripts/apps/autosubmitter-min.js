jive.namespace("Autosubmitter",function(){function a(){$j(this).parents("form").trigger("submit")}$j(document).delegate("form.autosubmit:not(.autosubmit-registered) :input:not(:checkbox)","change",a).delegate("form.autosubmit:not(.autosubmit-registered) :checkbox","click",a)});$j(document).ready(function(){var a=new jive.Autosubmitter()});