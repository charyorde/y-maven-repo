/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */


JsMockito.Integration.QUnit();
JsHamcrest.Integration.QUnit();


function makeTestDoc(){
    ed.setContent("<p>some paragraph text</p>"
            + "<ul><li>a list item</li><li>another list item</li></ul>"
            + "<pre>some text in a pre tag</pre>"
            + "<table><tbody><tr><td>a table cell</td><td>a table cell</td></tr><tr><td>a table cell</td><td>a table cell</td></tr></tbody></table>"
            + "<p>Some text. <img src='slickspeed/logo.png' /> Some more text.</p>");
    this.pElem = ed.getBody().firstChild;
    this.ulElem = ed.getBody().childNodes[1];
    this.preElem = ed.getBody().childNodes[2];
    this.tableElem = ed.getBody().childNodes[3];

    this.imgElem = ed.getBody().childNodes[4].childNodes[1];

    this.firstLi = this.ulElem.firstChild;
    this.firstCell = this.tableElem.firstChild.firstChild.firstChild;

    this.contextPlugin = ed.plugins.jivecontextmenu;

    $j.fx.off = true; //all jQuery animations complete instantly
}


module("MenuItem", {
    setup: makeTestDoc,
    teardown: function(){
        this.contextPlugin.hideMenu();
        this.contextPlugin.lastPosition = null;
        $j.fx.off = false;
    }
});

test("Wiring, regexp, string and object literal callbacks", function(){
    var fcn = /ul/i;

    var render = "slickspeed/logo.png";

    var actionFn = mockFunction("actionFn");
    var getDims = {width: 20, height: 20};

    var mouseEnter = mockFunction("mouseEnter");
    var mouseLeave = mockFunction("mouseLeave");
    var onDisplay = mockFunction("onDisplay");

    var mi = new this.contextPlugin.MenuItem("testId", fcn, "test title", render, actionFn, getDims, mouseEnter, mouseLeave, onDisplay);

    equal(mi.id, "testId");

    var rng = ed.dom.createRng();
    rng.setStart(this.firstLi, 0);
    rng.collapse(true);
    equal(mi.distance(rng), 2);
    equal(mi.findContextNode(rng), this.ulElem);

    equal(mi.title, "test title");

    ok(0 <= mi.render().firstChild.src.indexOf("/resources/scripts/tiny_mce3/tests/slickspeed/logo.png"));

    mi.action();
    verify(actionFn).call(mi);

    deepEqual(mi.getDims(), {width: 20, height: 20});

    mi.mouseenter();
    verify(mouseEnter).call(mi);

    mi.mouseleave();
    verify(mouseLeave).call(mi);

    mi.displayCallback();
    verify(onDisplay).call(mi);
});

test("Wiring, minimal callbacks, object renderer", function(){
    var fcn = /ul/i;

    var render = {
        url: "http://url/",
        xOffset: 10,
        yOffset: 20,
        width: 30,
        height: 40
    };

    var actionFn = mockFunction("actionFn");

    var mi = new this.contextPlugin.MenuItem("testId", fcn, "test title", render, actionFn);

    var item = mi.render();
    equal(/url\("?(.*?)"?\)/.exec(item.firstChild.style.backgroundImage)[1], 'http://url/');  //Gecko and WebKit disagree about the quotes here.
    equal(item.firstChild.style.backgroundPosition, "-10px -20px");
    equal(item.firstChild.style.width, "30px");
    equal(item.firstChild.style.height, "40px");
    deepEqual(mi.getDims(), {width: 30, height: 40});

});

test("Wiring, function callbacks everywhere", function(){
    var fcn = mockFunction("fcn");

    var render = mockFunction("render");

    var actionFn = mockFunction("actionFn");
    var getDims = mockFunction("getDims");
    when(getDims)().thenReturn({width: 20, height: 20});

    var mouseEnter = mockFunction("mouseEnter");
    var mouseLeave = mockFunction("mouseLeave");
    var onDisplay = mockFunction("onDisplay");

    var mi = new this.contextPlugin.MenuItem("testId", fcn, "test title", render, actionFn, getDims, mouseEnter, mouseLeave, onDisplay);

    equal(mi.id, "testId");

    equal(mi.distance(this.pElem), -1, "distance is -1");
    verify(fcn)(sameAs(this.pElem));
    equal(mi.findContextNode(this.ulElem), null, "findContextNode on UL is null");
    verify(fcn)(sameAs(this.ulElem));

    equal(mi.title, "test title");

    mi.render();
    verify(render)();

    mi.action();
    verify(actionFn).call(mi);

    deepEqual(mi.getDims(), {width: 20, height: 20});
    verify(getDims)();

    mi.mouseenter();
    verify(mouseEnter).call(mi);

    mi.mouseleave();
    verify(mouseLeave).call(mi);

    mi.displayCallback();
    verify(onDisplay).call(mi);
});

module("Menu", {
    setup: makeTestDoc,
    teardown: function(){
        this.contextPlugin.hideMenu();
        this.contextPlugin.lastPosition = null;
        $j.fx.off = false;
    }
});

function mockMenuItem(id, title){
    if(!id){
        id = "testId";
    }
    if(!title){
        title = id + "_title";
    }

    var fcn = mockFunction("fcn");
    var render = mockFunction("render");
    var actionFn = mockFunction("actionFn");
    var getDims = mockFunction("getDims");

    var mouseEnter = mockFunction("mouseEnter");
    var mouseLeave = mockFunction("mouseLeave");
    var displayCallback = mockFunction("displayCallback");

    var firstItem = new ed.plugins.jivecontextmenu.MenuItem(id, fcn, title, render, actionFn, getDims, mouseEnter, mouseLeave, displayCallback);

    //we don't want fields mocked as methods.
    delete firstItem.id;
    delete firstItem.title;
    var ret = mock(firstItem);
    ret.id = id;
    ret.title = title;
    when(ret).render(anything()).thenReturn(ed.dom.create("span", {id: id}));
    when(ret).getDims().thenReturn({width: 20, height: 20});

    return ret;
}

test("trivialities", function(){
    var itemMock = mockMenuItem();
    var items = [itemMock];

    var menu = new this.contextPlugin.Menu(items, false, false);

    deepEqual(menu.items, items);
    equal(menu.isVisible(), false);
    equal(menu.getDOM().get(0).className, "menuItems");
});

test("wiring", function(){
    var firstItem = mockMenuItem("a");
    var secondItem = mockMenuItem("b");
    var thirdItem = mockMenuItem("c");

    when(firstItem).findContextNode(anything()).thenReturn(this.pElem);
    when(firstItem).distance(anything()).thenReturn(1);
    when(secondItem).distance(anything()).thenReturn(2);
    when(thirdItem).distance(anything()).thenReturn(3);

    var items = [secondItem, firstItem, thirdItem];

    var mouseEnter = mockFunction("menuMouseEnter");
    var mouseLeave = mockFunction("menuMouseLeave");

    var rng = ed.dom.createRng();
    rng.setStart(this.pElem, 0);
    rng.collapse(true);

    var menu = new this.contextPlugin.Menu(items, false, false, "menu title", mouseEnter, mouseLeave);

    menu.show(ed, rng, {x: 10, y: 10});

    //make sure items are displayed in distance order
    var idStr = "";
    menu.getDOM().children().each(function(){
        idStr += this.id;
    });
    equal(idStr, "abc");

    //verify that the item callbacks get called by Menu
    verify(firstItem, times(3)).findContextNode(anything());
    verify(firstItem).distance(sameAs(rng));
    verify(firstItem).render(sameAs(firstItem), sameAs(ed), sameAs(this.contextPlugin.$menu));
    verify(firstItem).displayCallback(anything());

    //test that the mouseenter/leave handlers are wired to $menu
    this.contextPlugin.$menuPopover.mouseenter();
    verify(mouseEnter, once())(anything());

    this.contextPlugin.$menuPopover.mouseleave();
    verify(mouseLeave, once())(anything());

    //verify that action gets called on click
    menu.getDOM().find("#a").click();
    verify(firstItem).action(anything());

    menu.hide();

    this.contextPlugin.$menuPopover.mouseenter(); //should be unbound by hide
    this.contextPlugin.$menuPopover.mouseleave();
    verifyNoMoreInteractions(mouseEnter, mouseLeave);
});

module("Jive Context Menu Plugin", {
    setup: makeTestDoc,
    teardown: function(){
        this.contextPlugin.hideMenu();
        this.contextPlugin.lastPosition = null;
        $j.fx.off = false;
    }
});

asyncTest("nothing in p-tag", 1, function(){
    var that = this;
    click(this.pElem, function(){
        ok(!that.contextPlugin.rootMenu.isVisible(), "root menu shouldn't show");
        start();
    });
});

asyncTest("menu shows in list item", 1, function(){
    var that = this;
    click(this.firstLi, function(){
        ok(that.contextPlugin.rootMenu.isVisible(), "root menu should show");
        start();
    });
});

asyncTest("menu shows in pre tag", 1, function(){
    var that = this;
    click(this.preElem, function(){
        ok(that.contextPlugin.rootMenu.isVisible(), "root menu should show");
        start();
    });
});

asyncTest("menu shows in table", 1, function(){
    var that = this;
    click(this.firstCell, function(){
        ok(that.contextPlugin.rootMenu.isVisible(), "root menu should show");
        start();
    });
});

asyncTest("menu shows in img", function(){
    var that = this;
    click(this.imgElem, function(){
        ok(that.contextPlugin.$menuPopover.is(":visible"), "$menu is visible");
        ok(that.contextPlugin.rootMenu.isVisible(), "root menu should show");
        start();
    });
});

asyncTest("menu transition and rendering in list item", function(){
    var that = this;
    click(this.firstLi, function(){
        ok(that.contextPlugin.rootMenu.isVisible(), "root menu should show");
        click(that.contextPlugin.$menuPopover.find(".menuItems:visible :first").get(0), function(){
            equal(that.contextPlugin.$menuPopover.find(".menuItems:visible").children().length, 4, "4 list style items visible");
            equal(that.contextPlugin.$menuPopover.find(".menuItems:visible .menuItem_defaultListStyle").length, 1, "default list style item is visible");
            equal(that.contextPlugin.$menuPopover.find(".menuItems:visible .menuItem_diListStyle").length, 1, "disc list style item is visible");
            equal(that.contextPlugin.$menuPopover.find(".menuItems:visible .menuItem_cListStyle").length, 1, "circle list style item is visible");
            equal(that.contextPlugin.$menuPopover.find(".menuItems:visible .menuItem_sListStyle").length, 1, "square list style item is visible");
            start();
        });
    });
});

