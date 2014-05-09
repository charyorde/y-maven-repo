/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
/**
 * @depends path=/resources/scripts/jquery/jquery.view.js
 */
define(
    "jive.component.list",
    ['jquery'],
    function($)
    {
        /* jive.component.list package. Contains all constructors for every list related object type
                * @type {Object}
                */
        var list = {};

        list.ListView = jive.oo.Class.extend(

            function(protect)
            {
                this.init = function (element) {
                    this.$element = $(element);
                };
                this.toString = function(){return "[object ListView]";};
                this.allowWrap = function(){
                    return this.$element.data("wrap") == true;
                };
                this.getListItemElements = function(){
                    return this.$element.find("[data-component='listitem']:visible").get();
                };
                this.getListItems = function(){
                    var items = [];
                    $(this.getListItemElements()).each(
                      function(index, item){
                          items.push($(item).view(list.ListItemView));
                      }
                    );
                    return items;
                };
                this.getSelectedElement = function(){
                    //console.debug("getting selected Element");
                    return $(this.getListItemElements()).filter(".j-selected").get(0);
                    //return $(this.getListItemElements()).filter("[data-selected]").get(0);
                };
                this.getSelectedIndex = function(){
                    var selectedItem = this.getSelectedElement();
                    if(selectedItem){
                        return $(this.getListItemElements()).index(selectedItem);
                    } else {
                        return -1;
                    }
                };
                this.select = function(item){
                    var items = this.getListItemElements();
                    if($.isNumeric(item)){
                        //handle wrap
                        if(this.allowWrap()){
                            item = this.wrapIndex(item);
                        } //else check for index out of bound
                        item = items[item];
                    }
                    $(items).filter(".j-selected").removeClass("j-selected");//unselect all other items
                    $(item).addClass("j-selected");//Select the selected item
                };
                this.incriment = function(amount){
                    //console.debug("incriment by " + amount);
                    if(amount == 0){return;}
                    var index = this.getSelectedIndex();
                    //console.debug("current index " + index);
                    //this returns a negative 1 for the index if no index is set.
                    //so we need to incirment the amount if index is -1
                    if(amount < 0 && index == -1){
                        amount++;
                    }
                    amount = index + amount;
                    //console.debug("select index " + amount);
                    this.select(amount);
                };
                protect.wrapIndex = function(index){
                    var items = this.getListItemElements().length;
                    index = index % items;//effective index without wrapping around
                    index = index < 0 ? items + index : index ;//if negative then start from end and move backward
                    return index;
                };
            }
        );
        list.ListView.toString = function(){return "[wrapper ListView]";};
        list.ListView.getBindName = function() {return "ListView";};

        list.ListItemView = jive.oo.Class.extend(
            function(protect)
            {
                this.init = function(element){
                    this.$element = $(element);
                };
                this.toString = function() {return "[object ListItemView]";};
                this.getListElement = function(){
                    return this.$element.closest("[data-component='list']").get();
                };
                this.getList = function(){
                    return $(this.getListElement()).view(item.ListView);
                };
                this.select = function(){
                    this.getList().select(this.$element.get());
                };
            }
        );
        list.ListItemView.toString = function() {return "[wrapper ListItemView]";};
        list.ListItemView.getBindName = function() {return "ListItemView"};

        return list;
    }
);