goog.provide("soydata");goog.provide("soydata.SanitizedHtml");goog.provide("soydata.SanitizedHtmlAttribute");goog.provide("soydata.SanitizedJsStrChars");goog.provide("soydata.SanitizedUri");soydata.SanitizedContentKind={HTML:0,JS_STR_CHARS:1,URI:2,HTML_ATTRIBUTE:3};soydata.SanitizedContent=function(){};soydata.SanitizedContent.prototype.content;soydata.SanitizedContent.prototype.contentKind;soydata.SanitizedContent.prototype.toString=function(){return this.content};soydata.SanitizedHtml=function(a){this.content=a};soydata.SanitizedHtml.prototype=new soydata.SanitizedContent();soydata.SanitizedHtml.prototype.contentKind=soydata.SanitizedContentKind.HTML;soydata.SanitizedJsStrChars=function(a){this.content=a};soydata.SanitizedJsStrChars.prototype=new soydata.SanitizedContent();soydata.SanitizedJsStrChars.prototype.contentKind=soydata.SanitizedContentKind.JS_STR_CHARS;soydata.SanitizedUri=function(a){this.content=a};soydata.SanitizedUri.prototype=new soydata.SanitizedContent();soydata.SanitizedUri.prototype.contentKind=soydata.SanitizedContentKind.URI;soydata.SanitizedHtmlAttribute=function(a){this.content=a};soydata.SanitizedHtmlAttribute.prototype=new soydata.SanitizedContent();soydata.SanitizedHtmlAttribute.prototype.contentKind=soydata.SanitizedContentKind.HTML_ATTRIBUTE;