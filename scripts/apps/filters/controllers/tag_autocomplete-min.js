jive.namespace("Filters");jive.Filters.TagAutocomplete=jive.oo.Class.extend(function(a){var d=jQuery,c=jive.Filters,e=/[\s,]+/,b=/[^\s,]+$/;jive.conc.observable(this);a.init=function(h,g){var f=this;var i={max:10,containerType:typeof(g.containerType)!="undefined"?g.containerType:(typeof(containerType)!="undefined"?containerType:"-1"),containerID:typeof(g.containerID)!="undefined"?g.containerID:(typeof(containerID)!="undefined"?containerID:"-1")};if(g.objectTypes&&g.objectTypes.length>0){i.taggableTypes=g.objectTypes}this.suggestions=new c.TagSuggestions();this.tagService=new c.TagService(i);this.tagService.suppressGenericErrorMessages();this.element=h;this.typeahead=new jive.TypeaheadInput(h,{minLength:2});this.cachedCompletions=[];this.focused=false;this.userID=_jive_current_user?_jive_current_user.ID:"-1";this.typeahead.addListener("change",this.handleChange.bind(this)).addListener("clear",function(){f.handleChange("")});this.suggestionsView=new c.TagSuggestionsView(h).addListener("selection",function(j,l){var k=f.typeahead.val();f.element.blur();if(k.match(b)){f.typeahead.val(k.replace(b,j)+" ")}else{f.typeahead.val(k+j+" ")}f.element.focus();f.handleChange(f.typeahead.val());l.emitSuccess()}).addListener("close",function(){f.hideCompletions()});this.tagCloud=new c.TagCloud(h).addListener("cloud",function(){var j=f.getSelectedTags(),l={max:200},k;k=f.tagService.findAll(l);f.tagCloud.show(k,j,200).addCallback(function(m){if(j.join(" ")!=m.join(" ")){f.setSelectedTags(m)}})});this.element.focus(function(){f.focused=true;f.emit("focus");f.handleChange(d(this).val())}).blur(function(){f.focused=false;if(!f.suggestionsOpen()){f.emit("blur")}}).click(function(j){j.stopPropagation()});this.suggestionsView.addListener("focus",function(){f.focused=true;f.emit("focus")}).addListener("blur",function(){f.focused=false;f.emit("blur")});this.tagService.findAll();this.tagService.findAll({filterUserID:this.userID})};a.handleChange=function(h){var g=d.trim(h).split(e).filter(function(i){return !!i}),f=(h.match(b)||[])[0];if(f&&f!=this.lastPartialTag){this.showCompletions(f)}else{if(!f){this.hideCompletions()}}this.lastPartialTag=f;this.emit("change",g)};a.showPopularTags=function(){var j=new jive.conc.Promise(),g=new jive.conc.Promise(),i=new jive.conc.Promise(),h=this.getSelectedTags(),f=this;this.tagService.findAll().addCallback(this.tagPreparer(j));if(this.userID&&this.userID>0){this.tagService.findAll({filterUserID:this.userID}).addCallback(this.tagPreparer(g))}else{g.emitSuccess([])}if(h.length>0){this.tagService.findAll({tags:h}).addCallback(this.tagPreparer(i)).addErrback(function(){i.emitSuccess([])});f.suggestionsView.showRelatedTags(j,g,i)}else{f.suggestionsView.showRelatedTags(j,g)}};a.tagPreparer=function(f){return function(g){var h=g.map(function(i){return i.renderedTag});f.emitSuccess(h)}};a.showCompletions=function(f){var h=new jive.conc.Promise(),i=new jive.conc.Promise(),g=this;this.suggestionsView.showCompletions(h);h.emitSuccess({tags:[f].concat(g.cachedCompletions).unique()});this.suggestions.get(f).addCallback(function(j){g.cachedCompletions=j.tagSearchResult.map(function(k){return k.name});i.emitSuccess({tags:[f].concat(g.cachedCompletions).unique()})});this.suggestionsView.showCompletions(i)};a.hideCompletions=function(){var f=this;if(this.focused){jive.conc.nextTick(function(){f.showPopularTags()})}else{this.suggestionsView.hide();this.emit("blur")}this.cachedCompletions=[]};a.suggestionsOpen=function(){return this.suggestionsView.isVisible()};a.getSelectedTags=function(){var f=this.typeahead.val();return d.trim(f.replace(b,"")).split(e).filter(function(g){return !!g})};a.setSelectedTags=function(f){if(this.focused){this.element.blur()}this.typeahead.val(f.join(" ")+" ");if(this.focused){this.element.focus()}this.handleChange(this.typeahead.val())}});