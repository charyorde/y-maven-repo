jive.namespace("Wall.Util");jive.Wall.Util.focusHelper=function(){$j("#j-ub-new-wallentry").click();var a=window.setInterval(function(){var b=$j("#jive-quickstatuscreate-form .jive-js-statusinput");if(b.length!=0){b.last().focus();window.clearInterval(a)}},500);return false};