/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
module("Paste plugin, suite 1", {
	autostart: false
});

test("Paste text macro JIVE-599", function() {
	var rng = ed.dom.createRng();

	ed.setContent('<p>1234</p>');
	rng.setStart(ed.getBody().firstChild.firstChild, 1);
	rng.setEnd(ed.getBody().firstChild.firstChild, 3);
	ed.selection.setRng(rng);

	ed.execCommand('mceInsertClipboardContent', false, {content : '<a ___default_attr="2002" _modifiedtitle="Mr User2" class="jive_macro jive_macro_user active_link" data-mce-href="javascript:;" title="Mr User2">Mr User2</a><br/>'});
	equals(ed.getContent(), '<p>1<a class="jive_macro jive_macro_user" href="javascript:;" title="Mr User2" jivemacro="user" ___default_attr="2002" _modifiedtitle="Mr User2" data-orig-content="Mr User2">Mr User2</a>4</p>');
});

test("Paste content with style tag JIVE-465", function() {
	var rng = ed.dom.createRng();

	ed.setContent('<p>1234</p>');
	rng.setStart(ed.getBody().firstChild.firstChild, 1);
	rng.setEnd(ed.getBody().firstChild.firstChild, 3);
	ed.selection.setRng(rng);

	ed.execCommand('mceInsertClipboardContent', false, {content : '<style>@font-face { font-family: "Courier New"; }@font-face { font-family: "Calibri"; }p.MsoNormal, li.MsoNormal, div.MsoNormal { margin: 0in 0in 10pt; line-height: 115%; font-size: 11pt; font-family: "Times New Roman"; }pre { margin: 0in 0in 0.0001pt; font-size: 10pt; font-family: "Courier New"; }span.HTMLPreformattedChar { font-family: "Courier New"; }div.Section1 { page: Section1; }</style> <p class="MsoNormal"><span style="">Name: User Search</span></p>'});
    equals(ed.getContent().replace(/[\r\n]+/g, ''), '<p>1Name: User Search4</p>');
});


test("Paste simple text content", function() {
	var rng = ed.dom.createRng();

	ed.setContent('<p>1234</p>');
	rng.setStart(ed.getBody().firstChild.firstChild, 1);
	rng.setEnd(ed.getBody().firstChild.firstChild, 3);
	ed.selection.setRng(rng);

	ed.execCommand('mceInsertClipboardContent', false, {content : 'TEST'});
	equals(ed.getContent(), '<p>1TEST4</p>');
});

test("Paste multiline text copied from chrome", function() {
	var rng = ed.dom.createRng();

	ed.setContent('<p>1234</p>');
	rng.setStart(ed.getBody().firstChild.firstChild, 1);
	rng.setEnd(ed.getBody().firstChild.firstChild, 3);
	ed.selection.setRng(rng);

	ed.execCommand('mceInsertClipboardContent', false, {content : '<meta http-equiv="content-type" content="text/html; charset=utf-8"><pre style="word-wrap: break-word; white-space: pre-wrap; ">Line one\nLine two\n\nSkipped a line; no newline at the end of this line</pre><br/>'});
	equals(ed.getContent().replace(/[\r\n]+/g, ''), '<p>1</p><p>Line one</p><p>Line two</p><p></p><p>Skipped a line; no newline at the end of this line</p><p>4</p>');
});

test("Paste multiline text copied from firefox", function() {
	var rng = ed.dom.createRng();

	ed.setContent('<p>1234</p>');
	rng.setStart(ed.getBody().firstChild.firstChild, 1);
	rng.setEnd(ed.getBody().firstChild.firstChild, 3);
	ed.selection.setRng(rng);

	ed.execCommand('mceInsertClipboardContent', false, {content : '<pre>Line one\nLine two\n\nSkipped a line; no newline at the end of this line</pre><br/>'});
	equals(ed.getContent().replace(/[\r\n]+/g, ''), '<p>1</p><p>Line one</p><p>Line two</p><p></p><p>Skipped a line; no newline at the end of this line</p><p>4</p>');
});

test("Paste simple text with trailing <br> content", function() {
	var rng = ed.dom.createRng();

	ed.setContent('<p>1234</p>');
	rng.setStart(ed.getBody().firstChild.firstChild, 1);
	rng.setEnd(ed.getBody().firstChild.firstChild, 3);
	ed.selection.setRng(rng);

	ed.execCommand('mceInsertClipboardContent', false, {content : 'TEST<br />'});
	equals(ed.getContent(), '<p>1TEST4</p>');
});

//
// when pasting plain text into the RTE,
// Safari + Firefox + everyone put a trailing <br/>
// CS-23816
//
test("Paste and repeat simple text content", function() {
	var rng = ed.dom.createRng();

	ed.setContent('<p>1234</p>');
	rng.setStart(ed.getBody().firstChild.firstChild, 1);
	rng.setEnd(ed.getBody().firstChild.firstChild, 3);
	ed.selection.setRng(rng);

	ed.execCommand('mceInsertClipboardContent', false, {content : 'TEST<br/>'});
    ed.execCommand('mceInsertClipboardContent', false, {content : 'TEST<br />'});
    ed.execCommand('mceInsertClipboardContent', false, {content : 'TEST<br>'});
    ed.execCommand('mceInsertClipboardContent', false, {content : 'TEST<br >'});
	equals(ed.getContent(), '<p>1TESTTESTTESTTEST4</p>');
});

test("Paste styled text content", function() {
	var rng = ed.dom.createRng();

	ed.settings.paste_remove_styles_if_webkit = false;
	ed.setContent('<p>1234</p>');
	rng.setStart(ed.getBody().firstChild.firstChild, 1);
	rng.setEnd(ed.getBody().firstChild.firstChild, 3);
	ed.selection.setRng(rng);

	ed.execCommand('mceInsertClipboardContent', false, {content : '<strong><em><span style="color: red;">TEST</span></em></strong>'});
	equals(ed.getContent(), '<p>1<strong><em><span style="color: red;">TEST</span></em></strong>4</p>');
});

test("Paste paragraph in paragraph", function() {
	var rng = ed.dom.createRng();

	ed.setContent('<p>1234</p>');
	rng.setStart(ed.getBody().firstChild.firstChild, 1);
	rng.setEnd(ed.getBody().firstChild.firstChild, 3);
	ed.selection.setRng(rng);

	ed.execCommand('mceInsertClipboardContent', false, {content : '<p>TEST</p>'});
	equals(ed.getContent().replace(/[\r\n]+/g, ''), '<p>1TEST4</p>');
});

test("Paste paragraphs in complex paragraph", function() {
	var rng = ed.dom.createRng();

	ed.setContent('<p><strong><em>1234</em></strong></p>');
	rng.setStart(ed.dom.select('em,i')[0].firstChild, 1);
	rng.setEnd(ed.dom.select('em,i')[0].firstChild, 3);
	ed.selection.setRng(rng);

	ed.execCommand('mceInsertClipboardContent', false, {content : '<p>TEST 1</p><p>TEST 2</p>'});
	equals(ed.getContent().replace(/[\r\n]+/g, ''), '<p><strong><em>1</em></strong></p><p>TEST 1</p><p>TEST 2</p><p><strong><em>4</em></strong></p>');
});

test("Paste Word fake list", function() {
	var rng = ed.dom.createRng();

	ed.setContent('<p>1234</p>');
	rng.setStart(ed.getBody().firstChild.firstChild, 0);
	rng.setEnd(ed.getBody().firstChild.firstChild, 4);
	ed.selection.setRng(rng);

	ed.execCommand('mceInsertClipboardContent', false, {content : '<meta http-equiv="Content-Type" content="text/html; charset=utf-8"><meta name="ProgId" content="Word.Document"><meta name="Generator" content="Microsoft Word 12"><meta name="Originator" content="Microsoft Word 12"><link rel="File-List" href="file:///C:%5CUsers%5Cspocke%5CAppData%5CLocal%5CTemp%5Cmsohtmlclip1%5C01%5Cclip_filelist.xml"><link rel="themeData" href="file:///C:%5CUsers%5Cspocke%5CAppData%5CLocal%5CTemp%5Cmsohtmlclip1%5C01%5Cclip_themedata.thmx"><link rel="colorSchemeMapping" href="file:///C:%5CUsers%5Cspocke%5CAppData%5CLocal%5CTemp%5Cmsohtmlclip1%5C01%5Cclip_colorschememapping.xml"><!--[if gte mso 9]><xml> <w:WordDocument> <w:View>Normal</w:View> <w:Zoom>0</w:Zoom> <w:TrackMoves/> <w:TrackFormatting/> <w:HyphenationZone>21</w:HyphenationZone> <w:PunctuationKerning/> <w:ValidateAgainstSchemas/> <w:SaveIfXMLInvalid>false</w:SaveIfXMLInvalid> <w:IgnoreMixedContent>false</w:IgnoreMixedContent> <w:AlwaysShowPlaceholderText>false</w:AlwaysShowPlaceholderText> <w:DoNotPromoteQF/> <w:LidThemeOther>SV</w:LidThemeOther> <w:LidThemeAsian>X-NONE</w:LidThemeAsian> <w:LidThemeComplexScript>X-NONE</w:LidThemeComplexScript> <w:Compatibility> <w:BreakWrappedTables/> <w:SnapToGridInCell/> <w:WrapTextWithPunct/> <w:UseAsianBreakRules/> <w:DontGrowAutofit/> <w:SplitPgBreakAndParaMark/> <w:DontVertAlignCellWithSp/> <w:DontBreakConstrainedForcedTables/> <w:DontVertAlignInTxbx/> <w:Word11KerningPairs/> <w:CachedColBalance/> </w:Compatibility> <w:BrowserLevel>MicrosoftInternetExplorer4</w:BrowserLevel> <m:mathPr> <m:mathFont m:val="Cambria Math"/> <m:brkBin m:val="before"/> <m:brkBinSub m:val="&#45;-"/> <m:smallFrac m:val="off"/> <m:dispDef/> <m:lMargin m:val="0"/> <m:rMargin m:val="0"/> <m:defJc m:val="centerGroup"/> <m:wrapIndent m:val="1440"/> <m:intLim m:val="subSup"/> <m:naryLim m:val="undOvr"/> </m:mathPr></w:WordDocument> </xml><![endif]--><!--[if gte mso 9]><xml> <w:LatentStyles DefLockedState="false" DefUnhideWhenUsed="true" DefSemiHidden="true" DefQFormat="false" DefPriority="99" LatentStyleCount="267"> <w:LsdException Locked="false" Priority="0" SemiHidden="false" UnhideWhenUsed="false" QFormat="true" Name="Normal"/> <w:LsdException Locked="false" Priority="9" SemiHidden="false" UnhideWhenUsed="false" QFormat="true" Name="heading 1"/> <w:LsdException Locked="false" Priority="9" QFormat="true" Name="heading 2"/> <w:LsdException Locked="false" Priority="9" QFormat="true" Name="heading 3"/> <w:LsdException Locked="false" Priority="9" QFormat="true" Name="heading 4"/> <w:LsdException Locked="false" Priority="9" QFormat="true" Name="heading 5"/> <w:LsdException Locked="false" Priority="9" QFormat="true" Name="heading 6"/> <w:LsdException Locked="false" Priority="9" QFormat="true" Name="heading 7"/> <w:LsdException Locked="false" Priority="9" QFormat="true" Name="heading 8"/> <w:LsdException Locked="false" Priority="9" QFormat="true" Name="heading 9"/> <w:LsdException Locked="false" Priority="39" Name="toc 1"/> <w:LsdException Locked="false" Priority="39" Name="toc 2"/> <w:LsdException Locked="false" Priority="39" Name="toc 3"/> <w:LsdException Locked="false" Priority="39" Name="toc 4"/> <w:LsdException Locked="false" Priority="39" Name="toc 5"/> <w:LsdException Locked="false" Priority="39" Name="toc 6"/> <w:LsdException Locked="false" Priority="39" Name="toc 7"/> <w:LsdException Locked="false" Priority="39" Name="toc 8"/> <w:LsdException Locked="false" Priority="39" Name="toc 9"/> <w:LsdException Locked="false" Priority="35" QFormat="true" Name="caption"/> <w:LsdException Locked="false" Priority="10" SemiHidden="false" UnhideWhenUsed="false" QFormat="true" Name="Title"/> <w:LsdException Locked="false" Priority="1" Name="Default Paragraph Font"/> <w:LsdException Locked="false" Priority="11" SemiHidden="false" UnhideWhenUsed="false" QFormat="true" Name="Subtitle"/> <w:LsdException Locked="false" Priority="22" SemiHidden="false" UnhideWhenUsed="false" QFormat="true" Name="Strong"/>  <w:LsdException Locked="false" Priority="20" SemiHidden="false" UnhideWhenUsed="false" QFormat="true" Name="Emphasis"/>  <w:LsdException Locked="false" Priority="59" SemiHidden="false" UnhideWhenUsed="false" Name="Table Grid"/>  <w:LsdException Locked="false" UnhideWhenUsed="false" Name="Placeholder Text"/>  <w:LsdException Locked="false" Priority="1" SemiHidden="false" UnhideWhenUsed="false" QFormat="true" Name="No Spacing"/>  <w:LsdException Locked="false" Priority="60" SemiHidden="false" UnhideWhenUsed="false" Name="Light Shading"/>  <w:LsdException Locked="false" Priority="61" SemiHidden="false" UnhideWhenUsed="false" Name="Light List"/>  <w:LsdException Locked="false" Priority="62" SemiHidden="false" UnhideWhenUsed="false" Name="Light Grid"/>  <w:LsdException Locked="false" Priority="63" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Shading 1"/>  <w:LsdException Locked="false" Priority="64" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Shading 2"/>  <w:LsdException Locked="false" Priority="65" SemiHidden="false" UnhideWhenUsed="false" Name="Medium List 1"/>  <w:LsdException Locked="false" Priority="66" SemiHidden="false" UnhideWhenUsed="false" Name="Medium List 2"/>  <w:LsdException Locked="false" Priority="67" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 1"/>  <w:LsdException Locked="false" Priority="68" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 2"/>  <w:LsdException Locked="false" Priority="69" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 3"/>  <w:LsdException Locked="false" Priority="70" SemiHidden="false" UnhideWhenUsed="false" Name="Dark List"/>  <w:LsdException Locked="false" Priority="71" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful Shading"/>  <w:LsdException Locked="false" Priority="72" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful List"/>  <w:LsdException Locked="false" Priority="73" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful Grid"/>  <w:LsdException Locked="false" Priority="60" SemiHidden="false" UnhideWhenUsed="false" Name="Light Shading Accent 1"/>  <w:LsdException Locked="false" Priority="61" SemiHidden="false" UnhideWhenUsed="false" Name="Light List Accent 1"/>  <w:LsdException Locked="false" Priority="62" SemiHidden="false" UnhideWhenUsed="false" Name="Light Grid Accent 1"/>  <w:LsdException Locked="false" Priority="63" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Shading 1 Accent 1"/>  <w:LsdException Locked="false" Priority="64" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Shading 2 Accent 1"/>  <w:LsdException Locked="false" Priority="65" SemiHidden="false" UnhideWhenUsed="false" Name="Medium List 1 Accent 1"/>  <w:LsdException Locked="false" UnhideWhenUsed="false" Name="Revision"/>  <w:LsdException Locked="false" Priority="34" SemiHidden="false" UnhideWhenUsed="false" QFormat="true" Name="List Paragraph"/>  <w:LsdException Locked="false" Priority="29" SemiHidden="false" UnhideWhenUsed="false" QFormat="true" Name="Quote"/>  <w:LsdException Locked="false" Priority="30" SemiHidden="false" UnhideWhenUsed="false" QFormat="true" Name="Intense Quote"/>  <w:LsdException Locked="false" Priority="66" SemiHidden="false" UnhideWhenUsed="false" Name="Medium List 2 Accent 1"/>  <w:LsdException Locked="false" Priority="67" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 1 Accent 1"/>  <w:LsdException Locked="false" Priority="68" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 2 Accent 1"/>  <w:LsdException Locked="false" Priority="69" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 3 Accent 1"/>  <w:LsdException Locked="false" Priority="70" SemiHidden="false" UnhideWhenUsed="false" Name="Dark List Accent 1"/>  <w:LsdException Locked="false" Priority="71" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful Shading Accent 1"/>  <w:LsdException Locked="false" Priority="72" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful List Accent 1"/>  <w:LsdException Locked="false" Priority="73" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful Grid Accent 1"/>  <w:LsdException Locked="false" Priority="60" SemiHidden="false" UnhideWhenUsed="false" Name="Light Shading Accent 2"/>  <w:LsdException Locked="false" Priority="61" SemiHidden="false" UnhideWhenUsed="false" Name="Light List Accent 2"/>  <w:LsdException Locked="false" Priority="62" SemiHidden="false" UnhideWhenUsed="false" Name="Light Grid Accent 2"/>  <w:LsdException Locked="false" Priority="63" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Shading 1 Accent 2"/>  <w:LsdException Locked="false" Priority="64" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Shading 2 Accent 2"/>  <w:LsdException Locked="false" Priority="65" SemiHidden="false" UnhideWhenUsed="false" Name="Medium List 1 Accent 2"/>  <w:LsdException Locked="false" Priority="66" SemiHidden="false" UnhideWhenUsed="false" Name="Medium List 2 Accent 2"/>  <w:LsdException Locked="false" Priority="67" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 1 Accent 2"/>  <w:LsdException Locked="false" Priority="68" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 2 Accent 2"/>  <w:LsdException Locked="false" Priority="69" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 3 Accent 2"/>  <w:LsdException Locked="false" Priority="70" SemiHidden="false" UnhideWhenUsed="false" Name="Dark List Accent 2"/>  <w:LsdException Locked="false" Priority="71" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful Shading Accent 2"/>  <w:LsdException Locked="false" Priority="72" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful List Accent 2"/>  <w:LsdException Locked="false" Priority="73" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful Grid Accent 2"/>  <w:LsdException Locked="false" Priority="60" SemiHidden="false" UnhideWhenUsed="false" Name="Light Shading Accent 3"/>  <w:LsdException Locked="false" Priority="61" SemiHidden="false" UnhideWhenUsed="false" Name="Light List Accent 3"/>  <w:LsdException Locked="false" Priority="62" SemiHidden="false" UnhideWhenUsed="false" Name="Light Grid Accent 3"/>  <w:LsdException Locked="false" Priority="63" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Shading 1 Accent 3"/>  <w:LsdException Locked="false" Priority="64" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Shading 2 Accent 3"/>  <w:LsdException Locked="false" Priority="65" SemiHidden="false" UnhideWhenUsed="false" Name="Medium List 1 Accent 3"/>  <w:LsdException Locked="false" Priority="66" SemiHidden="false" UnhideWhenUsed="false" Name="Medium List 2 Accent 3"/>  <w:LsdException Locked="false" Priority="67" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 1 Accent 3"/>  <w:LsdException Locked="false" Priority="68" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 2 Accent 3"/>  <w:LsdException Locked="false" Priority="69" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 3 Accent 3"/>  <w:LsdException Locked="false" Priority="70" SemiHidden="false" UnhideWhenUsed="false" Name="Dark List Accent 3"/>  <w:LsdException Locked="false" Priority="71" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful Shading Accent 3"/>  <w:LsdException Locked="false" Priority="72" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful List Accent 3"/>  <w:LsdException Locked="false" Priority="73" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful Grid Accent 3"/>  <w:LsdException Locked="false" Priority="60" SemiHidden="false" UnhideWhenUsed="false" Name="Light Shading Accent 4"/>  <w:LsdException Locked="false" Priority="61" SemiHidden="false" UnhideWhenUsed="false" Name="Light List Accent 4"/>  <w:LsdException Locked="false" Priority="62" SemiHidden="false" UnhideWhenUsed="false" Name="Light Grid Accent 4"/>  <w:LsdException Locked="false" Priority="63" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Shading 1 Accent 4"/>  <w:LsdException Locked="false" Priority="64" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Shading 2 Accent 4"/>  <w:LsdException Locked="false" Priority="65" SemiHidden="false" UnhideWhenUsed="false" Name="Medium List 1 Accent 4"/>  <w:LsdException Locked="false" Priority="66" SemiHidden="false" UnhideWhenUsed="false" Name="Medium List 2 Accent 4"/>  <w:LsdException Locked="false" Priority="67" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 1 Accent 4"/>  <w:LsdException Locked="false" Priority="68" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 2 Accent 4"/>  <w:LsdException Locked="false" Priority="69" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 3 Accent 4"/>  <w:LsdException Locked="false" Priority="70" SemiHidden="false" UnhideWhenUsed="false" Name="Dark List Accent 4"/>  <w:LsdException Locked="false" Priority="71" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful Shading Accent 4"/>  <w:LsdException Locked="false" Priority="72" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful List Accent 4"/>  <w:LsdException Locked="false" Priority="73" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful Grid Accent 4"/>  <w:LsdException Locked="false" Priority="60" SemiHidden="false" UnhideWhenUsed="false" Name="Light Shading Accent 5"/>  <w:LsdException Locked="false" Priority="61" SemiHidden="false" UnhideWhenUsed="false" Name="Light List Accent 5"/>  <w:LsdException Locked="false" Priority="62" SemiHidden="false" UnhideWhenUsed="false" Name="Light Grid Accent 5"/>  <w:LsdException Locked="false" Priority="63" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Shading 1 Accent 5"/>  <w:LsdException Locked="false" Priority="64" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Shading 2 Accent 5"/>  <w:LsdException Locked="false" Priority="65" SemiHidden="false" UnhideWhenUsed="false" Name="Medium List 1 Accent 5"/>  <w:LsdException Locked="false" Priority="66" SemiHidden="false" UnhideWhenUsed="false" Name="Medium List 2 Accent 5"/>  <w:LsdException Locked="false" Priority="67" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 1 Accent 5"/>  <w:LsdException Locked="false" Priority="68" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 2 Accent 5"/>  <w:LsdException Locked="false" Priority="69" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 3 Accent 5"/>  <w:LsdException Locked="false" Priority="70" SemiHidden="false" UnhideWhenUsed="false" Name="Dark List Accent 5"/>  <w:LsdException Locked="false" Priority="71" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful Shading Accent 5"/>  <w:LsdException Locked="false" Priority="72" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful List Accent 5"/>  <w:LsdException Locked="false" Priority="73" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful Grid Accent 5"/>  <w:LsdException Locked="false" Priority="60" SemiHidden="false" UnhideWhenUsed="false" Name="Light Shading Accent 6"/>  <w:LsdException Locked="false" Priority="61" SemiHidden="false" UnhideWhenUsed="false" Name="Light List Accent 6"/>  <w:LsdException Locked="false" Priority="62" SemiHidden="false" UnhideWhenUsed="false" Name="Light Grid Accent 6"/>  <w:LsdException Locked="false" Priority="63" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Shading 1 Accent 6"/>  <w:LsdException Locked="false" Priority="64" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Shading 2 Accent 6"/>  <w:LsdException Locked="false" Priority="65" SemiHidden="false" UnhideWhenUsed="false" Name="Medium List 1 Accent 6"/>  <w:LsdException Locked="false" Priority="66" SemiHidden="false" UnhideWhenUsed="false" Name="Medium List 2 Accent 6"/>  <w:LsdException Locked="false" Priority="67" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 1 Accent 6"/>  <w:LsdException Locked="false" Priority="68" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 2 Accent 6"/>  <w:LsdException Locked="false" Priority="69" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 3 Accent 6"/>  <w:LsdException Locked="false" Priority="70" SemiHidden="false" UnhideWhenUsed="false" Name="Dark List Accent 6"/>  <w:LsdException Locked="false" Priority="71" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful Shading Accent 6"/>  <w:LsdException Locked="false" Priority="72" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful List Accent 6"/>  <w:LsdException Locked="false" Priority="73" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful Grid Accent 6"/>  <w:LsdException Locked="false" Priority="19" SemiHidden="false" UnhideWhenUsed="false" QFormat="true" Name="Subtle Emphasis"/>  <w:LsdException Locked="false" Priority="21" SemiHidden="false" UnhideWhenUsed="false" QFormat="true" Name="Intense Emphasis"/>  <w:LsdException Locked="false" Priority="31" SemiHidden="false" UnhideWhenUsed="false" QFormat="true" Name="Subtle Reference"/>  <w:LsdException Locked="false" Priority="32" SemiHidden="false" UnhideWhenUsed="false" QFormat="true" Name="Intense Reference"/>  <w:LsdException Locked="false" Priority="33" SemiHidden="false" UnhideWhenUsed="false" QFormat="true" Name="Book Title"/>  <w:LsdException Locked="false" Priority="37" Name="Bibliography"/>  <w:LsdException Locked="false" Priority="39" QFormat="true" Name="TOC Heading"/>  </w:LatentStyles> </xml><![endif]--><style> <!-- /* Font Definitions */ @font-face {font-family:Wingdings; panose-1:5 0 0 0 0 0 0 0 0 0; mso-font-charset:2; mso-generic-font-family:auto; mso-font-pitch:variable; mso-font-signature:0 268435456 0 0 -2147483648 0;} @font-face {font-family:Wingdings; panose-1:5 0 0 0 0 0 0 0 0 0; mso-font-charset:2; mso-generic-font-family:auto; mso-font-pitch:variable; mso-font-signature:0 268435456 0 0 -2147483648 0;} @font-face {font-family:Calibri; panose-1:2 15 5 2 2 2 4 3 2 4; mso-font-charset:0; mso-generic-font-family:swiss; mso-font-pitch:variable; mso-font-signature:-1610611985 1073750139 0 0 159 0;} /* Style Definitions */ p.MsoNormal, li.MsoNormal, div.MsoNormal {mso-style-unhide:no; mso-style-qformat:yes; mso-style-parent:""; margin-top:0cm; margin-right:0cm; margin-bottom:10.0pt; margin-left:0cm; line-height:115%; mso-pagination:widow-orphan; font-size:11.0pt; font-family:"Calibri","sans-serif"; mso-ascii-font-family:Calibri; mso-ascii-theme-font:minor-latin; mso-fareast-font-family:Calibri; mso-fareast-theme-font:minor-latin; mso-hansi-font-family:Calibri; mso-hansi-theme-font:minor-latin; mso-bidi-font-family:"Times New Roman"; mso-bidi-theme-font:minor-bidi; mso-fareast-language:EN-US;} p.MsoListParagraph, li.MsoListParagraph, div.MsoListParagraph {mso-style-priority:34; mso-style-unhide:no; mso-style-qformat:yes; margin-top:0cm; margin-right:0cm; margin-bottom:10.0pt; margin-left:36.0pt; mso-add-space:auto; line-height:115%; mso-pagination:widow-orphan; font-size:11.0pt; font-family:"Calibri","sans-serif"; mso-ascii-font-family:Calibri; mso-ascii-theme-font:minor-latin; mso-fareast-font-family:Calibri; mso-fareast-theme-font:minor-latin; mso-hansi-font-family:Calibri; mso-hansi-theme-font:minor-latin; mso-bidi-font-family:"Times New Roman"; mso-bidi-theme-font:minor-bidi; mso-fareast-language:EN-US;} p.MsoListParagraphCxSpFirst, li.MsoListParagraphCxSpFirst, div.MsoListParagraphCxSpFirst {mso-style-priority:34; mso-style-unhide:no; mso-style-qformat:yes; mso-style-type:export-only; margin-top:0cm; margin-right:0cm; margin-bottom:0cm; margin-left:36.0pt; margin-bottom:.0001pt; mso-add-space:auto; line-height:115%; mso-pagination:widow-orphan; font-size:11.0pt; font-family:"Calibri","sans-serif"; mso-ascii-font-family:Calibri; mso-ascii-theme-font:minor-latin; mso-fareast-font-family:Calibri; mso-fareast-theme-font:minor-latin; mso-hansi-font-family:Calibri; mso-hansi-theme-font:minor-latin; mso-bidi-font-family:"Times New Roman"; mso-bidi-theme-font:minor-bidi; mso-fareast-language:EN-US;} p.MsoListParagraphCxSpMiddle, li.MsoListParagraphCxSpMiddle, div.MsoListParagraphCxSpMiddle {mso-style-priority:34; mso-style-unhide:no; mso-style-qformat:yes; mso-style-type:export-only; margin-top:0cm; margin-right:0cm; margin-bottom:0cm; margin-left:36.0pt; margin-bottom:.0001pt; mso-add-space:auto; line-height:115%; mso-pagination:widow-orphan; font-size:11.0pt; font-family:"Calibri","sans-serif"; mso-ascii-font-family:Calibri; mso-ascii-theme-font:minor-latin; mso-fareast-font-family:Calibri; mso-fareast-theme-font:minor-latin; mso-hansi-font-family:Calibri; mso-hansi-theme-font:minor-latin; mso-bidi-font-family:"Times New Roman"; mso-bidi-theme-font:minor-bidi; mso-fareast-language:EN-US;} p.MsoListParagraphCxSpLast, li.MsoListParagraphCxSpLast, div.MsoListParagraphCxSpLast {mso-style-priority:34; mso-style-unhide:no; mso-style-qformat:yes; mso-style-type:export-only; margin-top:0cm; margin-right:0cm; margin-bottom:10.0pt; margin-left:36.0pt; mso-add-space:auto; line-height:115%; mso-pagination:widow-orphan; font-size:11.0pt; font-family:"Calibri","sans-serif"; mso-ascii-font-family:Calibri; mso-ascii-theme-font:minor-latin; mso-fareast-font-family:Calibri; mso-fareast-theme-font:minor-latin; mso-hansi-font-family:Calibri; mso-hansi-theme-font:minor-latin; mso-bidi-font-family:"Times New Roman"; mso-bidi-theme-font:minor-bidi; mso-fareast-language:EN-US;} .MsoChpDefault {mso-style-type:export-only; mso-default-props:yes; mso-ascii-font-family:Calibri; mso-ascii-theme-font:minor-latin; mso-fareast-font-family:Calibri; mso-fareast-theme-font:minor-latin; mso-hansi-font-family:Calibri; mso-hansi-theme-font:minor-latin; mso-bidi-font-family:"Times New Roman"; mso-bidi-theme-font:minor-bidi; mso-fareast-language:EN-US;} .MsoPapDefault {mso-style-type:export-only; margin-bottom:10.0pt; line-height:115%;} @page Section1 {size:595.3pt 841.9pt; margin:70.85pt 70.85pt 70.85pt 70.85pt; mso-header-margin:35.4pt; mso-footer-margin:35.4pt; mso-paper-source:0;} div.Section1 {page:Section1;} /* List Definitions */ @list l0 {mso-list-id:1742563504; mso-list-type:hybrid; mso-list-template-ids:-524928352 69009409 69009411 69009413 69009409 69009411 69009413 69009409 69009411 69009413;} @list l0:level1 {mso-level-number-format:bullet; mso-level-text:?; mso-level-tab-stop:none; mso-level-number-position:left; text-indent:-18.0pt; font-family:Symbol;} ol {margin-bottom:0cm;} ul {margin-bottom:0cm;} --> </style><!--[if gte mso 10]> <style> /* Style Definitions */ table.MsoNormalTable {mso-style-name:"Table Normal"; mso-tstyle-rowband-size:0; mso-tstyle-colband-size:0; mso-style-noshow:yes; mso-style-priority:99; mso-style-qformat:yes; mso-style-parent:""; mso-padding-alt:0cm 5.4pt 0cm 5.4pt; mso-para-margin-top:0cm; mso-para-margin-right:0cm; mso-para-margin-bottom:10.0pt; mso-para-margin-left:0cm; line-height:115%; mso-pagination:widow-orphan; font-size:11.0pt; font-family:"Calibri","sans-serif"; mso-ascii-font-family:Calibri; mso-ascii-theme-font:minor-latin; mso-hansi-font-family:Calibri; mso-hansi-theme-font:minor-latin; mso-fareast-language:EN-US;} </style> <![endif]--> <p class="MsoListParagraphCxSpFirst" style="text-indent: -18pt;"><!--[if !supportLists]--><span style="font-family: Symbol;"><span style="">&middot;<span style="font-family: &quot;Times New Roman&quot;; font-style: normal; font-variant: normal; font-weight: normal; font-size: 7pt; line-height: normal; font-size-adjust: none; font-stretch: normal; -x-system-font: none;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span><!--[endif]-->Item 1</p> <p class="MsoListParagraphCxSpMiddle" style="text-indent: -18pt;"><!--[if !supportLists]--><span style="font-family: Symbol;"><span style="">&middot;<span style="font-family: &quot;Times New Roman&quot;; font-style: normal; font-variant: normal; font-weight: normal; font-size: 7pt; line-height: normal; font-size-adjust: none; font-stretch: normal; -x-system-font: none;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span><!--[endif]-->Item 2</p> <p class="MsoListParagraphCxSpMiddle" style="text-indent: -18pt;"><!--[if !supportLists]--><span style="font-family: Symbol;"><span style="">&middot;<span style="font-family: &quot;Times New Roman&quot;; font-style: normal; font-variant: normal; font-weight: normal; font-size: 7pt; line-height: normal; font-size-adjust: none; font-stretch: normal; -x-system-font: none;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span><!--[endif]-->Item 3</p> <p class="MsoListParagraphCxSpMiddle" style="text-indent: -18pt;"><!--[if !supportLists]--><span style="font-family: Symbol;"><span style="">&middot;<span style="font-family: &quot;Times New Roman&quot;; font-style: normal; font-variant: normal; font-weight: normal; font-size: 7pt; line-height: normal; font-size-adjust: none; font-stretch: normal; -x-system-font: none;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span><!--[endif]-->Item 4</p> <p class="MsoListParagraphCxSpMiddle" style="text-indent: -18pt;"><!--[if !supportLists]--><span style="font-family: Symbol;"><span style="">&middot;<span style="font-family: &quot;Times New Roman&quot;; font-style: normal; font-variant: normal; font-weight: normal; font-size: 7pt; line-height: normal; font-size-adjust: none; font-stretch: normal; -x-system-font: none;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span><!--[endif]-->Item 5</p> <p class="MsoListParagraphCxSpLast" style="text-indent: -18pt;"><!--[if !supportLists]--><span style="font-family: Symbol;"><span style="">&middot;<span style="font-family: &quot;Times New Roman&quot;; font-style: normal; font-variant: normal; font-weight: normal; font-size: 7pt; line-height: normal; font-size-adjust: none; font-stretch: normal; -x-system-font: none;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span><!--[endif]-->Item 6</p>'});
    var html = ed.getContent().replace(/[\r\n]+/g, '');
    html = html.substr(0, html.indexOf("</ul>")+5);
	equals(html, '<ul style=\"list-style-type: disc;\"><li>Item 1</li><li>Item 2</li><li>Item 3</li><li>Item 4</li><li>Item 5</li><li>Item 6</li></ul>');
});

test("Paste Word real list", function() {
	var rng = ed.dom.createRng();

	ed.setContent('<p>1234</p>');
	rng.setStart(ed.getBody().firstChild.firstChild, 0);
	rng.setEnd(ed.getBody().firstChild.firstChild, 4);
	ed.selection.setRng(rng);

	ed.execCommand('mceInsertClipboardContent', false, {content : '<OL style="MARGIN-TOP: 0in" type=1> <LI style="mso-list: l0 level1 lfo1; tab-stops: list .5in" class=MsoNormal>One</LI> <LI style="mso-list: l0 level1 lfo1; tab-stops: list .5in" class=MsoNormal>Two</LI> <LI style="mso-list: l0 level1 lfo1; tab-stops: list .5in" class=MsoNormal>Three</LI> <LI style="mso-list: l0 level1 lfo1; tab-stops: list .5in" class=MsoNormal>Ha, ha, ha</LI></OL>'});
    checkContent(ed, '<ol><li>One</li><li>Two</li><li>Three</li><li>Ha, ha, ha</li></ol>');
});

test("Paste Word image bullets", function() {
	var rng = ed.dom.createRng();

	ed.setContent('<p>1234</p>');
	rng.setStart(ed.getBody().firstChild.firstChild, 0);
	rng.setEnd(ed.getBody().firstChild.firstChild, 4);
	ed.selection.setRng(rng);

	ed.execCommand('mceInsertClipboardContent', false, {content : '<P style="TEXT-INDENT: -0.25in; MARGIN-LEFT: 0.5in; mso-list: l0 level1 lfo1; tab-stops: list .5in" class=MsoNormal><SPAN style="FONT-FAMILY: Symbol; mso-fareast-font-family: Symbol; mso-bidi-font-family: Symbol"><SPAN style="mso-list: Ignore"><IMG alt=* src="file:///C:/DOCUME~1/jive/LOCALS~1/Temp/msohtml1/01/clip_image001.gif" width=13 height=13><SPAN style="FONT: 7pt \'Times New Roman\'">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </SPAN></SPAN></SPAN>One</P> <P style="TEXT-INDENT: -0.25in; MARGIN-LEFT: 0.5in; mso-list: l0 level1 lfo1; tab-stops: list .5in" class=MsoNormal><SPAN style="FONT-FAMILY: Symbol; mso-fareast-font-family: Symbol; mso-bidi-font-family: Symbol"><SPAN style="mso-list: Ignore"><IMG alt=* src="file:///C:/DOCUME~1/jive/LOCALS~1/Temp/msohtml1/01/clip_image001.gif" width=13 height=13><SPAN style="FONT: 7pt \'Times New Roman\'">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </SPAN></SPAN></SPAN>Two</P> <P style="TEXT-INDENT: -0.25in; MARGIN-LEFT: 0.5in; mso-list: l0 level1 lfo1; tab-stops: list .5in" class=MsoNormal><SPAN style="FONT-FAMILY: Symbol; mso-fareast-font-family: Symbol; mso-bidi-font-family: Symbol"><SPAN style="mso-list: Ignore"><IMG alt=* src="file:///C:/DOCUME~1/jive/LOCALS~1/Temp/msohtml1/01/clip_image001.gif" width=13 height=13><SPAN style="FONT: 7pt \'Times New Roman\'">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </SPAN></SPAN></SPAN>Three</P> <P style="TEXT-INDENT: -0.25in; MARGIN-LEFT: 0.5in; mso-list: l0 level1 lfo1; tab-stops: list .5in" class=MsoNormal><SPAN style="FONT-FAMILY: Symbol; mso-fareast-font-family: Symbol; mso-bidi-font-family: Symbol"><SPAN style="mso-list: Ignore"><IMG alt=* src="file:///C:/DOCUME~1/jive/LOCALS~1/Temp/msohtml1/01/clip_image001.gif" width=13 height=13><SPAN style="FONT: 7pt \'Times New Roman\'">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </SPAN></SPAN></SPAN>Ha, ha, ha</P>'});
    checkContent(ed, '<ul style=\"list-style-type: disc;\"><li>One</li><li>Two</li><li>Three</li><li>Ha, ha, ha</li></ul>');
});

test("Paste Word formatted table", function() {
	var rng = ed.dom.createRng();

	// Test color
	var rng = ed.dom.createRng();

	ed.setContent('<p>1234</p>');
	rng.setStart(ed.getBody().firstChild.firstChild, 0);
	rng.setEnd(ed.getBody().firstChild.firstChild, 4);
	ed.selection.setRng(rng);


	ed.execCommand('mceInsertClipboardContent', false, {content : '&nbsp;' +
'<TABLE class=MsoTableLightListAccent1 style="BORDER-RIGHT: medium none; BORDER-TOP: medium none; BORDER-LEFT: medium none; BORDER-BOTTOM: medium none; BORDER-COLLAPSE: collapse; mso-border-alt: solid #4F81BD 1.0pt; mso-border-themecolor: accent1; mso-yfti-tbllook: 1184; mso-padding-alt: 0in 5.4pt 0in 5.4pt" cellSpacing=0 cellPadding=0 border=1>' +
'<TBODY><TR style="mso-yfti-irow: -1; mso-yfti-firstrow: yes">' +
'<TD style="BORDER-RIGHT: medium none; PADDING-RIGHT: 5.4pt; BORDER-TOP: #4f81bd 1pt solid; PADDING-LEFT: 5.4pt; BACKGROUND: #4f81bd; PADDING-BOTTOM: 0in; BORDER-LEFT: #4f81bd 1pt solid; WIDTH: 159.6pt; PADDING-TOP: 0in; BORDER-BOTTOM: medium none; mso-border-top-themecolor: accent1; mso-border-left-themecolor: accent1; mso-background-themecolor: accent1" vAlign=top width=213>' +
'<P class=MsoNormal style="MARGIN-BOTTOM: 0pt; LINE-HEIGHT: normal; mso-yfti-cnfc: 5"><B><SPAN style="COLOR: white; FONT-FAMILY: \'Times\',\'serif\'; mso-bidi-font-family: Arial; mso-themecolor: background1">Header 1<?xml:namespace prefix = o ns = "urn:schemas-microsoft-com:office:office" /><o:p></o:p></SPAN></B></P></TD>' +
'<TD style="BORDER-RIGHT: medium none; PADDING-RIGHT: 5.4pt; BORDER-TOP: #4f81bd 1pt solid; PADDING-LEFT: 5.4pt; BACKGROUND: #4f81bd; PADDING-BOTTOM: 0in; BORDER-LEFT: medium none; WIDTH: 159.6pt; PADDING-TOP: 0in; BORDER-BOTTOM: medium none; mso-border-top-themecolor: accent1; mso-background-themecolor: accent1" vAlign=top width=213>' +
'<P class=MsoNormal style="MARGIN-BOTTOM: 0pt; LINE-HEIGHT: normal; mso-yfti-cnfc: 1"><B><SPAN style="COLOR: white; FONT-FAMILY: \'Times\',\'serif\'; mso-bidi-font-family: Arial; mso-themecolor: background1">Header 2<o:p></o:p></SPAN></B></P></TD>' +
'<TD style="BORDER-RIGHT: #4f81bd 1pt solid; PADDING-RIGHT: 5.4pt; BORDER-TOP: #4f81bd 1pt solid; PADDING-LEFT: 5.4pt; BACKGROUND: #4f81bd; PADDING-BOTTOM: 0in; BORDER-LEFT: medium none; WIDTH: 159.6pt; PADDING-TOP: 0in; BORDER-BOTTOM: medium none; mso-border-top-themecolor: accent1; mso-background-themecolor: accent1; mso-border-right-themecolor: accent1" vAlign=top width=213>' +
'<P class=MsoNormal style="MARGIN-BOTTOM: 0pt; LINE-HEIGHT: normal; mso-yfti-cnfc: 1"><B><SPAN style="COLOR: white; FONT-FAMILY: \'Times\',\'serif\'; mso-bidi-font-family: Arial; mso-themecolor: background1">Header 3<o:p></o:p></SPAN></B></P></TD></TR>' +
'<TR style="mso-yfti-irow: 0">' +
'<TD style="BORDER-RIGHT: medium none; PADDING-RIGHT: 5.4pt; BORDER-TOP: #4f81bd 1pt solid; PADDING-LEFT: 5.4pt; PADDING-BOTTOM: 0in; BORDER-LEFT: #4f81bd 1pt solid; WIDTH: 159.6pt; PADDING-TOP: 0in; BORDER-BOTTOM: #4f81bd 1pt solid; mso-border-themecolor: accent1" vAlign=top width=213>' +
'<P class=MsoNormal style="MARGIN-BOTTOM: 0pt; LINE-HEIGHT: normal; mso-yfti-cnfc: 68"><B><SPAN style="FONT-FAMILY: \'Times\',\'serif\'; mso-bidi-font-family: Arial">Content 1 1<o:p></o:p></SPAN></B></P></TD>' +
'<TD style="BORDER-RIGHT: medium none; PADDING-RIGHT: 5.4pt; BORDER-TOP: #4f81bd 1pt solid; PADDING-LEFT: 5.4pt; PADDING-BOTTOM: 0in; BORDER-LEFT: medium none; WIDTH: 159.6pt; PADDING-TOP: 0in; BORDER-BOTTOM: #4f81bd 1pt solid; mso-border-top-themecolor: accent1; mso-border-bottom-themecolor: accent1" vAlign=top width=213>' +
'<P class=MsoNormal style="MARGIN-BOTTOM: 0pt; LINE-HEIGHT: normal; mso-yfti-cnfc: 64"><SPAN style="FONT-FAMILY: \'Times\',\'serif\'; mso-bidi-font-family: Arial">Cotnent 2 1<o:p></o:p></SPAN></P></TD>' +
'<TD style="BORDER-RIGHT: #4f81bd 1pt solid; PADDING-RIGHT: 5.4pt; BORDER-TOP: #4f81bd 1pt solid; PADDING-LEFT: 5.4pt; PADDING-BOTTOM: 0in; BORDER-LEFT: medium none; WIDTH: 159.6pt; PADDING-TOP: 0in; BORDER-BOTTOM: #4f81bd 1pt solid; mso-border-themecolor: accent1" vAlign=top width=213>' +
'<P class=MsoNormal style="MARGIN-BOTTOM: 0pt; LINE-HEIGHT: normal; mso-yfti-cnfc: 64"><SPAN style="FONT-FAMILY: \'Times\',\'serif\'; mso-bidi-font-family: Arial">Cotnent 3 1<o:p></o:p></SPAN></P></TD></TR>' +
'<TR style="mso-yfti-irow: 1; mso-yfti-lastrow: yes">' +
'<TD style="BORDER-RIGHT: medium none; PADDING-RIGHT: 5.4pt; BORDER-TOP: medium none; PADDING-LEFT: 5.4pt; PADDING-BOTTOM: 0in; BORDER-LEFT: #4f81bd 1pt solid; WIDTH: 159.6pt; PADDING-TOP: 0in; BORDER-BOTTOM: #4f81bd 1pt solid; mso-border-left-themecolor: accent1; mso-border-bottom-themecolor: accent1" vAlign=top width=213>' +
'<P class=MsoNormal style="MARGIN-BOTTOM: 0pt; LINE-HEIGHT: normal; mso-yfti-cnfc: 4"><B><SPAN style="FONT-FAMILY: \'Times\',\'serif\'; mso-bidi-font-family: Arial">Cotnent 1 2<o:p></o:p></SPAN></B></P></TD>' +
'<TD style="BORDER-RIGHT: medium none; PADDING-RIGHT: 5.4pt; BORDER-TOP: medium none; PADDING-LEFT: 5.4pt; PADDING-BOTTOM: 0in; BORDER-LEFT: medium none; WIDTH: 159.6pt; PADDING-TOP: 0in; BORDER-BOTTOM: #4f81bd 1pt solid; mso-border-bottom-themecolor: accent1" vAlign=top width=213>' +
'<P class=MsoNormal style="MARGIN-BOTTOM: 0pt; LINE-HEIGHT: normal"><SPAN style="FONT-FAMILY: \'Times\',\'serif\'; mso-bidi-font-family: Arial">Cotnent 2 2<o:p></o:p></SPAN></P></TD>' +
'<TD style="BORDER-RIGHT: #4f81bd 1pt solid; PADDING-RIGHT: 5.4pt; BORDER-TOP: medium none; PADDING-LEFT: 5.4pt; PADDING-BOTTOM: 0in; BORDER-LEFT: medium none; WIDTH: 159.6pt; PADDING-TOP: 0in; BORDER-BOTTOM: #4f81bd 1pt solid; mso-border-right-themecolor: accent1; mso-border-bottom-themecolor: accent1" vAlign=top width=213>' +
'<P class=MsoNormal style="MARGIN-BOTTOM: 0pt; LINE-HEIGHT: normal"><SPAN style="FONT-FAMILY: \'Times\',\'serif\'; mso-bidi-font-family: Arial">Cotnent 3 2<o:p></o:p></SPAN></P></TD></TR></TBODY></TABLE>' +
'<P class=MsoNormal><SPAN style="FONT-FAMILY: \'Times\',\'serif\'; mso-bidi-font-family: Arial"><o:p>&nbsp;</o:p></SPAN></P>'});


    var content = $j("<div></div>").append(ed.getContent());

    ok($j(content).children(":nth(0)").is("table"), "first node is an table");
    equals($j(content).find("table tbody").length, 1, "one table body");
    equals($j(content).find("table tbody tr").length, 3, "there are three trs");
    equals($j(content).find("table tbody tr:nth(0) td").length, 3, "three cells in the row");
    equals($j(content).find("table tbody tr:nth(1) td").length, 3, "three cells in the row");
    equals($j(content).find("table tbody tr:nth(2) td").length, 3, "three cells in the row");
    ok(has(content, "table tbody tr:nth(0) td", "style", "background"), "background color information was saved");
    ok(has(content, "table tbody tr:nth(0) td", "style", ["#4F81BD", "rgb(79, 129, 189)"]),
            "color information was saved");

    ok(has(content, "table tbody tr:nth(0) td", "style", "padding-left"), "padding information was saved");
    ok(has(content, "table tbody tr:nth(0) td", "style", "5.4pt"), "padding information was saved");
    equals($j(content).find("table tbody tr:nth(0) td p strong span").length, 3, "three cells in the row");
    ok(has(content, "table tbody tr:nth(0) td p strong span", "style", "color"), "color information was saved");
    ok(has(content, "table tbody tr:nth(0) td p strong span", "style", "white"), "color information was saved");
    ok(has(content, "table tbody tr:nth(0) td p strong span", "style", "font-family"), "font information was saved");
    ok(has(content, "table tbody tr:nth(0) td p strong span", "style", "Times"), "font information was saved");
    ok(has(content, "table tbody tr:nth(0) td p strong span", "style", "serif"), "font information was saved");
    ok(has(content, "table tbody tr:nth(1) td p strong span", "style", "font-family"), "font information was saved");
    ok(has(content, "table tbody tr:nth(1) td p strong span", "style", "Times"), "font information was saved");
    ok(has(content, "table tbody tr:nth(1) td p strong span", "style", "serif"), "font information was saved");
    ok(has(content, "table tbody tr:nth(2) td p strong span", "style", "font-family"), "font information was saved");
    ok(has(content, "table tbody tr:nth(2) td p strong span", "style", "Times"), "font information was saved");
    ok(has(content, "table tbody tr:nth(2) td p strong span", "style", "serif"), "font information was saved");
    equals($j(content).find("table tbody tr:nth(1) td:nth(0) p strong span").length, 1, "one bold cell in the row");
    equals($j(content).find("table tbody tr:nth(2) td:nth(0) p strong span").length, 1, "one bold cell in the row");
    equals($j(content).find("table tbody tr:nth(1) td p strong span").length, 1, "one bold cell in the row");
    equals($j(content).find("table tbody tr:nth(2) td p strong span").length, 1, "one bold cell in the row");

    equals($j(content).find("table tbody tr:nth(0) td:nth(0) p strong span").text(), "Header 1",
            "one bold cell in the row");
    equals($j(content).find("table tbody tr:nth(0) td:nth(1) p strong span").text(), "Header 2",
            "one bold cell in the row");
    equals($j(content).find("table tbody tr:nth(0) td:nth(2) p strong span").text(), "Header 3",
            "one bold cell in the row");

    equals($j(content).find("table tbody tr:nth(1) td:nth(0) p strong span").text(), "Content 1 1", "text is right");
    equals($j(content).find("table tbody tr:nth(1) td:nth(1) p span").text(), "Cotnent 2 1", "text is right");
    equals($j(content).find("table tbody tr:nth(1) td:nth(2) p span").text(), "Cotnent 3 1", "text is right");

    equals($j(content).find("table tbody tr:nth(2) td:nth(0) p strong span").text(), "Cotnent 1 2", "text is right");
    equals($j(content).find("table tbody tr:nth(2) td:nth(1) p span").text(), "Cotnent 2 2", "text is right");
    equals($j(content).find("table tbody tr:nth(2) td:nth(2) p span").text(), "Cotnent 3 2", "text is right");

    //	equals(trimContent(ed.getContent().replace(/[\r\n]+/g, '')), '');
});


/**
 * this test is currently failing in ie / safari, but works in firefox
 * i'll need to spend time on table borders later
 */
test("Paste Word table with border", function() {
	var rng = ed.dom.createRng();

	ed.setContent('<p>1234</p>');
	rng.setStart(ed.getBody().firstChild.firstChild, 0);
	rng.setEnd(ed.getBody().firstChild.firstChild, 4);
	ed.selection.setRng(rng);

	ed.execCommand('mceInsertClipboardContent', false, {content : '<meta http-equiv="Content-Type" content="text/html; charset=utf-8"><meta name="ProgId" content="Word.Document"><meta name="Generator" content="Microsoft Word 12"><meta name="Originator" content="Microsoft Word 12"><link rel="File-List" href="file:///C:%5CUsers%5Cspocke%5CAppData%5CLocal%5CTemp%5Cmsohtmlclip1%5C01%5Cclip_filelist.xml"><link rel="themeData" href="file:///C:%5CUsers%5Cspocke%5CAppData%5CLocal%5CTemp%5Cmsohtmlclip1%5C01%5Cclip_themedata.thmx"><link rel="colorSchemeMapping" href="file:///C:%5CUsers%5Cspocke%5CAppData%5CLocal%5CTemp%5Cmsohtmlclip1%5C01%5Cclip_colorschememapping.xml"><!--[if gte mso 9]><xml> <w:WordDocument> <w:View>Normal</w:View> <w:Zoom>0</w:Zoom> <w:TrackMoves/> <w:TrackFormatting/> <w:HyphenationZone>21</w:HyphenationZone> <w:PunctuationKerning/> <w:ValidateAgainstSchemas/> <w:SaveIfXMLInvalid>false</w:SaveIfXMLInvalid> <w:IgnoreMixedContent>false</w:IgnoreMixedContent> <w:AlwaysShowPlaceholderText>false</w:AlwaysShowPlaceholderText> <w:DoNotPromoteQF/> <w:LidThemeOther>SV</w:LidThemeOther> <w:LidThemeAsian>X-NONE</w:LidThemeAsian> <w:LidThemeComplexScript>X-NONE</w:LidThemeComplexScript> <w:Compatibility> <w:BreakWrappedTables/> <w:SnapToGridInCell/> <w:WrapTextWithPunct/> <w:UseAsianBreakRules/> <w:DontGrowAutofit/> <w:SplitPgBreakAndParaMark/> <w:DontVertAlignCellWithSp/> <w:DontBreakConstrainedForcedTables/> <w:DontVertAlignInTxbx/> <w:Word11KerningPairs/> <w:CachedColBalance/> </w:Compatibility> <w:BrowserLevel>MicrosoftInternetExplorer4</w:BrowserLevel> <m:mathPr> <m:mathFont m:val="Cambria Math"/> <m:brkBin m:val="before"/> <m:brkBinSub m:val="&#45;-"/> <m:smallFrac m:val="off"/> <m:dispDef/> <m:lMargin m:val="0"/> <m:rMargin m:val="0"/> <m:defJc m:val="centerGroup"/> <m:wrapIndent m:val="1440"/> <m:intLim m:val="subSup"/> <m:naryLim m:val="undOvr"/> </m:mathPr></w:WordDocument> </xml><![endif]--><!--[if gte mso 9]><xml> <w:LatentStyles DefLockedState="false" DefUnhideWhenUsed="true" DefSemiHidden="true" DefQFormat="false" DefPriority="99" LatentStyleCount="267"> <w:LsdException Locked="false" Priority="0" SemiHidden="false" UnhideWhenUsed="false" QFormat="true" Name="Normal"/> <w:LsdException Locked="false" Priority="9" SemiHidden="false" UnhideWhenUsed="false" QFormat="true" Name="heading 1"/> <w:LsdException Locked="false" Priority="9" QFormat="true" Name="heading 2"/> <w:LsdException Locked="false" Priority="9" QFormat="true" Name="heading 3"/> <w:LsdException Locked="false" Priority="9" QFormat="true" Name="heading 4"/> <w:LsdException Locked="false" Priority="9" QFormat="true" Name="heading 5"/> <w:LsdException Locked="false" Priority="9" QFormat="true" Name="heading 6"/> <w:LsdException Locked="false" Priority="9" QFormat="true" Name="heading 7"/> <w:LsdException Locked="false" Priority="9" QFormat="true" Name="heading 8"/> <w:LsdException Locked="false" Priority="9" QFormat="true" Name="heading 9"/> <w:LsdException Locked="false" Priority="39" Name="toc 1"/> <w:LsdException Locked="false" Priority="39" Name="toc 2"/> <w:LsdException Locked="false" Priority="39" Name="toc 3"/> <w:LsdException Locked="false" Priority="39" Name="toc 4"/> <w:LsdException Locked="false" Priority="39" Name="toc 5"/> <w:LsdException Locked="false" Priority="39" Name="toc 6"/> <w:LsdException Locked="false" Priority="39" Name="toc 7"/> <w:LsdException Locked="false" Priority="39" Name="toc 8"/> <w:LsdException Locked="false" Priority="39" Name="toc 9"/> <w:LsdException Locked="false" Priority="35" QFormat="true" Name="caption"/> <w:LsdException Locked="false" Priority="10" SemiHidden="false" UnhideWhenUsed="false" QFormat="true" Name="Title"/> <w:LsdException Locked="false" Priority="1" Name="Default Paragraph Font"/> <w:LsdException Locked="false" Priority="11" SemiHidden="false" UnhideWhenUsed="false" QFormat="true" Name="Subtitle"/> <w:LsdException Locked="false" Priority="22" SemiHidden="false" UnhideWhenUsed="false" QFormat="true" Name="Strong"/>  <w:LsdException Locked="false" Priority="20" SemiHidden="false" UnhideWhenUsed="false" QFormat="true" Name="Emphasis"/>  <w:LsdException Locked="false" Priority="59" SemiHidden="false" UnhideWhenUsed="false" Name="Table Grid"/>  <w:LsdException Locked="false" UnhideWhenUsed="false" Name="Placeholder Text"/>  <w:LsdException Locked="false" Priority="1" SemiHidden="false" UnhideWhenUsed="false" QFormat="true" Name="No Spacing"/>  <w:LsdException Locked="false" Priority="60" SemiHidden="false" UnhideWhenUsed="false" Name="Light Shading"/>  <w:LsdException Locked="false" Priority="61" SemiHidden="false" UnhideWhenUsed="false" Name="Light List"/>  <w:LsdException Locked="false" Priority="62" SemiHidden="false" UnhideWhenUsed="false" Name="Light Grid"/>  <w:LsdException Locked="false" Priority="63" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Shading 1"/>  <w:LsdException Locked="false" Priority="64" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Shading 2"/>  <w:LsdException Locked="false" Priority="65" SemiHidden="false" UnhideWhenUsed="false" Name="Medium List 1"/>  <w:LsdException Locked="false" Priority="66" SemiHidden="false" UnhideWhenUsed="false" Name="Medium List 2"/>  <w:LsdException Locked="false" Priority="67" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 1"/>  <w:LsdException Locked="false" Priority="68" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 2"/>  <w:LsdException Locked="false" Priority="69" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 3"/>  <w:LsdException Locked="false" Priority="70" SemiHidden="false" UnhideWhenUsed="false" Name="Dark List"/>  <w:LsdException Locked="false" Priority="71" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful Shading"/>  <w:LsdException Locked="false" Priority="72" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful List"/>  <w:LsdException Locked="false" Priority="73" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful Grid"/>  <w:LsdException Locked="false" Priority="60" SemiHidden="false" UnhideWhenUsed="false" Name="Light Shading Accent 1"/>  <w:LsdException Locked="false" Priority="61" SemiHidden="false" UnhideWhenUsed="false" Name="Light List Accent 1"/>  <w:LsdException Locked="false" Priority="62" SemiHidden="false" UnhideWhenUsed="false" Name="Light Grid Accent 1"/>  <w:LsdException Locked="false" Priority="63" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Shading 1 Accent 1"/>  <w:LsdException Locked="false" Priority="64" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Shading 2 Accent 1"/>  <w:LsdException Locked="false" Priority="65" SemiHidden="false" UnhideWhenUsed="false" Name="Medium List 1 Accent 1"/>  <w:LsdException Locked="false" UnhideWhenUsed="false" Name="Revision"/>  <w:LsdException Locked="false" Priority="34" SemiHidden="false" UnhideWhenUsed="false" QFormat="true" Name="List Paragraph"/>  <w:LsdException Locked="false" Priority="29" SemiHidden="false" UnhideWhenUsed="false" QFormat="true" Name="Quote"/>  <w:LsdException Locked="false" Priority="30" SemiHidden="false" UnhideWhenUsed="false" QFormat="true" Name="Intense Quote"/>  <w:LsdException Locked="false" Priority="66" SemiHidden="false" UnhideWhenUsed="false" Name="Medium List 2 Accent 1"/>  <w:LsdException Locked="false" Priority="67" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 1 Accent 1"/>  <w:LsdException Locked="false" Priority="68" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 2 Accent 1"/>  <w:LsdException Locked="false" Priority="69" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 3 Accent 1"/>  <w:LsdException Locked="false" Priority="70" SemiHidden="false" UnhideWhenUsed="false" Name="Dark List Accent 1"/>  <w:LsdException Locked="false" Priority="71" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful Shading Accent 1"/>  <w:LsdException Locked="false" Priority="72" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful List Accent 1"/>  <w:LsdException Locked="false" Priority="73" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful Grid Accent 1"/>  <w:LsdException Locked="false" Priority="60" SemiHidden="false" UnhideWhenUsed="false" Name="Light Shading Accent 2"/>  <w:LsdException Locked="false" Priority="61" SemiHidden="false" UnhideWhenUsed="false" Name="Light List Accent 2"/>  <w:LsdException Locked="false" Priority="62" SemiHidden="false" UnhideWhenUsed="false" Name="Light Grid Accent 2"/>  <w:LsdException Locked="false" Priority="63" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Shading 1 Accent 2"/>  <w:LsdException Locked="false" Priority="64" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Shading 2 Accent 2"/>  <w:LsdException Locked="false" Priority="65" SemiHidden="false" UnhideWhenUsed="false" Name="Medium List 1 Accent 2"/>  <w:LsdException Locked="false" Priority="66" SemiHidden="false" UnhideWhenUsed="false" Name="Medium List 2 Accent 2"/>  <w:LsdException Locked="false" Priority="67" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 1 Accent 2"/>  <w:LsdException Locked="false" Priority="68" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 2 Accent 2"/>  <w:LsdException Locked="false" Priority="69" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 3 Accent 2"/>  <w:LsdException Locked="false" Priority="70" SemiHidden="false" UnhideWhenUsed="false" Name="Dark List Accent 2"/>  <w:LsdException Locked="false" Priority="71" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful Shading Accent 2"/>  <w:LsdException Locked="false" Priority="72" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful List Accent 2"/>  <w:LsdException Locked="false" Priority="73" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful Grid Accent 2"/>  <w:LsdException Locked="false" Priority="60" SemiHidden="false" UnhideWhenUsed="false" Name="Light Shading Accent 3"/>  <w:LsdException Locked="false" Priority="61" SemiHidden="false" UnhideWhenUsed="false" Name="Light List Accent 3"/>  <w:LsdException Locked="false" Priority="62" SemiHidden="false" UnhideWhenUsed="false" Name="Light Grid Accent 3"/>  <w:LsdException Locked="false" Priority="63" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Shading 1 Accent 3"/>  <w:LsdException Locked="false" Priority="64" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Shading 2 Accent 3"/>  <w:LsdException Locked="false" Priority="65" SemiHidden="false" UnhideWhenUsed="false" Name="Medium List 1 Accent 3"/>  <w:LsdException Locked="false" Priority="66" SemiHidden="false" UnhideWhenUsed="false" Name="Medium List 2 Accent 3"/>  <w:LsdException Locked="false" Priority="67" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 1 Accent 3"/>  <w:LsdException Locked="false" Priority="68" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 2 Accent 3"/>  <w:LsdException Locked="false" Priority="69" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 3 Accent 3"/>  <w:LsdException Locked="false" Priority="70" SemiHidden="false" UnhideWhenUsed="false" Name="Dark List Accent 3"/>  <w:LsdException Locked="false" Priority="71" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful Shading Accent 3"/>  <w:LsdException Locked="false" Priority="72" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful List Accent 3"/>  <w:LsdException Locked="false" Priority="73" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful Grid Accent 3"/>  <w:LsdException Locked="false" Priority="60" SemiHidden="false" UnhideWhenUsed="false" Name="Light Shading Accent 4"/>  <w:LsdException Locked="false" Priority="61" SemiHidden="false" UnhideWhenUsed="false" Name="Light List Accent 4"/>  <w:LsdException Locked="false" Priority="62" SemiHidden="false" UnhideWhenUsed="false" Name="Light Grid Accent 4"/>  <w:LsdException Locked="false" Priority="63" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Shading 1 Accent 4"/>  <w:LsdException Locked="false" Priority="64" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Shading 2 Accent 4"/>  <w:LsdException Locked="false" Priority="65" SemiHidden="false" UnhideWhenUsed="false" Name="Medium List 1 Accent 4"/>  <w:LsdException Locked="false" Priority="66" SemiHidden="false" UnhideWhenUsed="false" Name="Medium List 2 Accent 4"/>  <w:LsdException Locked="false" Priority="67" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 1 Accent 4"/>  <w:LsdException Locked="false" Priority="68" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 2 Accent 4"/>  <w:LsdException Locked="false" Priority="69" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 3 Accent 4"/>  <w:LsdException Locked="false" Priority="70" SemiHidden="false" UnhideWhenUsed="false" Name="Dark List Accent 4"/>  <w:LsdException Locked="false" Priority="71" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful Shading Accent 4"/>  <w:LsdException Locked="false" Priority="72" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful List Accent 4"/>  <w:LsdException Locked="false" Priority="73" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful Grid Accent 4"/>  <w:LsdException Locked="false" Priority="60" SemiHidden="false" UnhideWhenUsed="false" Name="Light Shading Accent 5"/>  <w:LsdException Locked="false" Priority="61" SemiHidden="false" UnhideWhenUsed="false" Name="Light List Accent 5"/>  <w:LsdException Locked="false" Priority="62" SemiHidden="false" UnhideWhenUsed="false" Name="Light Grid Accent 5"/>  <w:LsdException Locked="false" Priority="63" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Shading 1 Accent 5"/>  <w:LsdException Locked="false" Priority="64" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Shading 2 Accent 5"/>  <w:LsdException Locked="false" Priority="65" SemiHidden="false" UnhideWhenUsed="false" Name="Medium List 1 Accent 5"/>  <w:LsdException Locked="false" Priority="66" SemiHidden="false" UnhideWhenUsed="false" Name="Medium List 2 Accent 5"/>  <w:LsdException Locked="false" Priority="67" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 1 Accent 5"/>  <w:LsdException Locked="false" Priority="68" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 2 Accent 5"/>  <w:LsdException Locked="false" Priority="69" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 3 Accent 5"/>  <w:LsdException Locked="false" Priority="70" SemiHidden="false" UnhideWhenUsed="false" Name="Dark List Accent 5"/>  <w:LsdException Locked="false" Priority="71" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful Shading Accent 5"/>  <w:LsdException Locked="false" Priority="72" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful List Accent 5"/>  <w:LsdException Locked="false" Priority="73" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful Grid Accent 5"/>  <w:LsdException Locked="false" Priority="60" SemiHidden="false" UnhideWhenUsed="false" Name="Light Shading Accent 6"/>  <w:LsdException Locked="false" Priority="61" SemiHidden="false" UnhideWhenUsed="false" Name="Light List Accent 6"/>  <w:LsdException Locked="false" Priority="62" SemiHidden="false" UnhideWhenUsed="false" Name="Light Grid Accent 6"/>  <w:LsdException Locked="false" Priority="63" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Shading 1 Accent 6"/>  <w:LsdException Locked="false" Priority="64" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Shading 2 Accent 6"/>  <w:LsdException Locked="false" Priority="65" SemiHidden="false" UnhideWhenUsed="false" Name="Medium List 1 Accent 6"/>  <w:LsdException Locked="false" Priority="66" SemiHidden="false" UnhideWhenUsed="false" Name="Medium List 2 Accent 6"/>  <w:LsdException Locked="false" Priority="67" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 1 Accent 6"/>  <w:LsdException Locked="false" Priority="68" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 2 Accent 6"/>  <w:LsdException Locked="false" Priority="69" SemiHidden="false" UnhideWhenUsed="false" Name="Medium Grid 3 Accent 6"/>  <w:LsdException Locked="false" Priority="70" SemiHidden="false" UnhideWhenUsed="false" Name="Dark List Accent 6"/>  <w:LsdException Locked="false" Priority="71" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful Shading Accent 6"/>  <w:LsdException Locked="false" Priority="72" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful List Accent 6"/>  <w:LsdException Locked="false" Priority="73" SemiHidden="false" UnhideWhenUsed="false" Name="Colorful Grid Accent 6"/>  <w:LsdException Locked="false" Priority="19" SemiHidden="false" UnhideWhenUsed="false" QFormat="true" Name="Subtle Emphasis"/>  <w:LsdException Locked="false" Priority="21" SemiHidden="false" UnhideWhenUsed="false" QFormat="true" Name="Intense Emphasis"/>  <w:LsdException Locked="false" Priority="31" SemiHidden="false" UnhideWhenUsed="false" QFormat="true" Name="Subtle Reference"/>  <w:LsdException Locked="false" Priority="32" SemiHidden="false" UnhideWhenUsed="false" QFormat="true" Name="Intense Reference"/>  <w:LsdException Locked="false" Priority="33" SemiHidden="false" UnhideWhenUsed="false" QFormat="true" Name="Book Title"/>  <w:LsdException Locked="false" Priority="37" Name="Bibliography"/>  <w:LsdException Locked="false" Priority="39" QFormat="true" Name="TOC Heading"/>  </w:LatentStyles> </xml><![endif]--><style> <!-- /* Font Definitions */ @font-face {font-family:Calibri; panose-1:2 15 5 2 2 2 4 3 2 4; mso-font-charset:0; mso-generic-font-family:swiss; mso-font-pitch:variable; mso-font-signature:-1610611985 1073750139 0 0 159 0;} /* Style Definitions */ p.MsoNormal, li.MsoNormal, div.MsoNormal {mso-style-unhide:no; mso-style-qformat:yes; mso-style-parent:""; margin-top:0cm; margin-right:0cm; margin-bottom:10.0pt; margin-left:0cm; line-height:115%; mso-pagination:widow-orphan; font-size:11.0pt; font-family:"Calibri","sans-serif"; mso-ascii-font-family:Calibri; mso-ascii-theme-font:minor-latin; mso-fareast-font-family:Calibri; mso-fareast-theme-font:minor-latin; mso-hansi-font-family:Calibri; mso-hansi-theme-font:minor-latin; mso-bidi-font-family:"Times New Roman"; mso-bidi-theme-font:minor-bidi; mso-fareast-language:EN-US;} p.MsoListParagraph, li.MsoListParagraph, div.MsoListParagraph {mso-style-priority:34; mso-style-unhide:no; mso-style-qformat:yes; margin-top:0cm; margin-right:0cm; margin-bottom:10.0pt; margin-left:36.0pt; mso-add-space:auto; line-height:115%; mso-pagination:widow-orphan; font-size:11.0pt; font-family:"Calibri","sans-serif"; mso-ascii-font-family:Calibri; mso-ascii-theme-font:minor-latin; mso-fareast-font-family:Calibri; mso-fareast-theme-font:minor-latin; mso-hansi-font-family:Calibri; mso-hansi-theme-font:minor-latin; mso-bidi-font-family:"Times New Roman"; mso-bidi-theme-font:minor-bidi; mso-fareast-language:EN-US;} p.MsoListParagraphCxSpFirst, li.MsoListParagraphCxSpFirst, div.MsoListParagraphCxSpFirst {mso-style-priority:34; mso-style-unhide:no; mso-style-qformat:yes; mso-style-type:export-only; margin-top:0cm; margin-right:0cm; margin-bottom:0cm; margin-left:36.0pt; margin-bottom:.0001pt; mso-add-space:auto; line-height:115%; mso-pagination:widow-orphan; font-size:11.0pt; font-family:"Calibri","sans-serif"; mso-ascii-font-family:Calibri; mso-ascii-theme-font:minor-latin; mso-fareast-font-family:Calibri; mso-fareast-theme-font:minor-latin; mso-hansi-font-family:Calibri; mso-hansi-theme-font:minor-latin; mso-bidi-font-family:"Times New Roman"; mso-bidi-theme-font:minor-bidi; mso-fareast-language:EN-US;} p.MsoListParagraphCxSpMiddle, li.MsoListParagraphCxSpMiddle, div.MsoListParagraphCxSpMiddle {mso-style-priority:34; mso-style-unhide:no; mso-style-qformat:yes; mso-style-type:export-only; margin-top:0cm; margin-right:0cm; margin-bottom:0cm; margin-left:36.0pt; margin-bottom:.0001pt; mso-add-space:auto; line-height:115%; mso-pagination:widow-orphan; font-size:11.0pt; font-family:"Calibri","sans-serif"; mso-ascii-font-family:Calibri; mso-ascii-theme-font:minor-latin; mso-fareast-font-family:Calibri; mso-fareast-theme-font:minor-latin; mso-hansi-font-family:Calibri; mso-hansi-theme-font:minor-latin; mso-bidi-font-family:"Times New Roman"; mso-bidi-theme-font:minor-bidi; mso-fareast-language:EN-US;} p.MsoListParagraphCxSpLast, li.MsoListParagraphCxSpLast, div.MsoListParagraphCxSpLast {mso-style-priority:34; mso-style-unhide:no; mso-style-qformat:yes; mso-style-type:export-only; margin-top:0cm; margin-right:0cm; margin-bottom:10.0pt; margin-left:36.0pt; mso-add-space:auto; line-height:115%; mso-pagination:widow-orphan; font-size:11.0pt; font-family:"Calibri","sans-serif"; mso-ascii-font-family:Calibri; mso-ascii-theme-font:minor-latin; mso-fareast-font-family:Calibri; mso-fareast-theme-font:minor-latin; mso-hansi-font-family:Calibri; mso-hansi-theme-font:minor-latin; mso-bidi-font-family:"Times New Roman"; mso-bidi-theme-font:minor-bidi; mso-fareast-language:EN-US;} .MsoChpDefault {mso-style-type:export-only; mso-default-props:yes; mso-ascii-font-family:Calibri; mso-ascii-theme-font:minor-latin; mso-fareast-font-family:Calibri; mso-fareast-theme-font:minor-latin; mso-hansi-font-family:Calibri; mso-hansi-theme-font:minor-latin; mso-bidi-font-family:"Times New Roman"; mso-bidi-theme-font:minor-bidi; mso-fareast-language:EN-US;} .MsoPapDefault {mso-style-type:export-only; margin-bottom:10.0pt; line-height:115%;} @page Section1 {size:595.3pt 841.9pt; margin:70.85pt 70.85pt 70.85pt 70.85pt; mso-header-margin:35.4pt; mso-footer-margin:35.4pt; mso-paper-source:0;} div.Section1 {page:Section1;} --> </style><!--[if gte mso 10]> <style> /* Style Definitions */ table.MsoNormalTable {mso-style-name:"Table Normal"; mso-tstyle-rowband-size:0; mso-tstyle-colband-size:0; mso-style-noshow:yes; mso-style-priority:99; mso-style-qformat:yes; mso-style-parent:""; mso-padding-alt:0cm 5.4pt 0cm 5.4pt; mso-para-margin-top:0cm; mso-para-margin-right:0cm; mso-para-margin-bottom:10.0pt; mso-para-margin-left:0cm; line-height:115%; mso-pagination:widow-orphan; font-size:11.0pt; font-family:"Calibri","sans-serif"; mso-ascii-font-family:Calibri; mso-ascii-theme-font:minor-latin; mso-hansi-font-family:Calibri; mso-hansi-theme-font:minor-latin; mso-fareast-language:EN-US;} table.MsoTableGrid {mso-style-name:"Table Grid"; mso-tstyle-rowband-size:0; mso-tstyle-colband-size:0; mso-style-priority:59; mso-style-unhide:no; border:solid black 1.0pt; mso-border-themecolor:text1; mso-border-alt:solid black .5pt; mso-border-themecolor:text1; mso-padding-alt:0cm 5.4pt 0cm 5.4pt; mso-border-insideh:.5pt solid black; mso-border-insideh-themecolor:text1; mso-border-insidev:.5pt solid black; mso-border-insidev-themecolor:text1; mso-para-margin:0cm; mso-para-margin-bottom:.0001pt; mso-pagination:widow-orphan; font-size:11.0pt; font-family:"Calibri","sans-serif"; mso-ascii-font-family:Calibri; mso-ascii-theme-font:minor-latin; mso-hansi-font-family:Calibri; mso-hansi-theme-font:minor-latin; mso-fareast-language:EN-US;} </style> <![endif]--> <table class="MsoTableGrid" style="border: medium none ; margin-left: 36pt; border-collapse: collapse;" border="1" cellpadding="0" cellspacing="0"> <tbody><tr style=""> <td style="border: 1pt solid black; padding: 0cm 5.4pt; width: 230.3pt;" valign="top" width="307"> <p class="MsoListParagraphCxSpFirst" style="margin: 0cm 0cm 0.0001pt; line-height: normal;">Cell 1</p> </td> <td style="border-style: solid solid solid none; border-color: black black black -moz-use-text-color; border-width: 1pt 1pt 1pt medium; padding: 0cm 5.4pt; width: 230.3pt;" valign="top" width="307"> <p class="MsoListParagraphCxSpLast" style="margin: 0cm 0cm 0.0001pt; line-height: normal;">Cell 2</p> </td> </tr> <tr style=""> <td style="border-style: none solid solid; border-color: -moz-use-text-color black black; border-width: medium 1pt 1pt; padding: 0cm 5.4pt; width: 230.3pt;" valign="top" width="307"> <p class="MsoListParagraphCxSpFirst" style="margin: 0cm 0cm 0.0001pt; line-height: normal;">Cell 3</p> </td> <td style="border-style: none solid solid none; border-color: -moz-use-text-color black black -moz-use-text-color; border-width: medium 1pt 1pt medium; padding: 0cm 5.4pt; width: 230.3pt;" valign="top" width="307"> <p class="MsoListParagraphCxSpLast" style="margin: 0cm 0cm 0.0001pt; line-height: normal;">Cell 4</p> </td> </tr> </tbody></table> <p class="MsoListParagraph"><o:p>&nbsp;</o:p></p>'});

//    var html = ed.getContent().replace(/[\r\n]+/g, '');
//    html = html.substr(0, html.indexOf("</table>")+8);
//    equals(html, '<table border=\"1\" cellpadding=\"0\" cellspacing=\"0\" style=\"margin-left: 36pt; border: medium none;\"><tbody><tr><td style=\"border: 1pt solid black; padding: 0pt 5.4pt;\" valign=\"top\" width=\"307\"><p>Cell 1</p></td><td style=\"border-width: 1pt 1pt 1pt medium; border-style: solid solid solid none; border-color: black black black -moz-use-text-color; padding: 0pt 5.4pt;\" valign=\"top\" width=\"307\"><p>Cell 2</p></td></tr><tr><td style=\"border-width: medium 1pt 1pt; border-style: none solid solid; border-color: -moz-use-text-color black black; padding: 0pt 5.4pt;\" valign=\"top\" width=\"307\"><p>Cell 3</p></td><td style=\"border-width: medium 1pt 1pt medium; border-style: none solid solid none; border-color: -moz-use-text-color black black -moz-use-text-color; padding: 0pt 5.4pt;\" valign=\"top\" width=\"307\"><p>Cell 4</p></td></tr></tbody></table>');

    var content = $j("<div></div>").append(ed.getContent());

    ok($j(content).children(":nth(0)").is("table"), "first node is an table");
    equals($j(content).find("table tbody").length, 1, "one table body");
    equals($j(content).find("table tbody tr").length, 2, "there are three trs");
    equals($j(content).find("table tbody tr:nth(0) td").length, 2, "three cells in the row");
    equals($j(content).find("table tbody tr:nth(1) td").length, 2, "three cells in the row");

    hasStyle(content, "table", "margin", "36pt", "margin information was saved");
    ok(has(content, "table", "border", "1"), "border information was saved");
    hasStyle(content, "table td:nth(0)", "border", "1pt", "border information was saved");
    hasStyle(content, "table td:nth(1)", "border", "1pt", "border information was saved");
    hasStyle(content, "table td:nth(2)", "border", "1pt", "border information was saved");
    hasStyle(content, "table td:nth(3)", "border", "1pt", "border information was saved");
    hasStyle(content, "table td:nth(0)", "border", "solid", "border information was saved");
    hasStyle(content, "table td:nth(1)", "border", "solid", "border information was saved");
    hasStyle(content, "table td:nth(2)", "border", "solid", "border information was saved");
    hasStyle(content, "table td:nth(3)", "border", "solid", "border information was saved")
});

/**
 * this test is currently failing in ie / safari, but works in firefox
 * i'll need to spend time on table borders later
 */
test("Paste Word formatted table retain borders", function() {
	var rng = ed.dom.createRng();

	// Test color
	// Test color
	var rng = ed.dom.createRng();

	ed.setContent('<p>1234</p>');
	rng.setStart(ed.getBody().firstChild.firstChild, 0);
	rng.setEnd(ed.getBody().firstChild.firstChild, 4);
	ed.selection.setRng(rng);


	ed.execCommand('mceInsertClipboardContent', false, {content : '&nbsp;' +
'<TABLE class=MsoTableLightListAccent1 style="BORDER-RIGHT: medium none; BORDER-TOP: medium none; BORDER-LEFT: medium none; BORDER-BOTTOM: medium none; BORDER-COLLAPSE: collapse; mso-border-alt: solid #4F81BD 1.0pt; mso-border-themecolor: accent1; mso-yfti-tbllook: 1184; mso-padding-alt: 0in 5.4pt 0in 5.4pt" cellSpacing=0 cellPadding=0 border=1>' +
'<TBODY><TR style="mso-yfti-irow: -1; mso-yfti-firstrow: yes">' +
'<TD style="BORDER-RIGHT: medium none; PADDING-RIGHT: 5.4pt; BORDER-TOP: #4f81bd 1pt solid; PADDING-LEFT: 5.4pt; BACKGROUND: #4f81bd; PADDING-BOTTOM: 0in; BORDER-LEFT: #4f81bd 1pt solid; WIDTH: 159.6pt; PADDING-TOP: 0in; BORDER-BOTTOM: medium none; mso-border-top-themecolor: accent1; mso-border-left-themecolor: accent1; mso-background-themecolor: accent1" vAlign=top width=213>' +
'<P class=MsoNormal style="MARGIN-BOTTOM: 0pt; LINE-HEIGHT: normal; mso-yfti-cnfc: 5"><B><SPAN style="COLOR: white; FONT-FAMILY: \'Times\',\'serif\'; mso-bidi-font-family: Arial; mso-themecolor: background1">Header 1<?xml:namespace prefix = o ns = "urn:schemas-microsoft-com:office:office" /><o:p></o:p></SPAN></B></P></TD>' +
'<TD style="BORDER-RIGHT: medium none; PADDING-RIGHT: 5.4pt; BORDER-TOP: #4f81bd 1pt solid; PADDING-LEFT: 5.4pt; BACKGROUND: #4f81bd; PADDING-BOTTOM: 0in; BORDER-LEFT: medium none; WIDTH: 159.6pt; PADDING-TOP: 0in; BORDER-BOTTOM: medium none; mso-border-top-themecolor: accent1; mso-background-themecolor: accent1" vAlign=top width=213>' +
'<P class=MsoNormal style="MARGIN-BOTTOM: 0pt; LINE-HEIGHT: normal; mso-yfti-cnfc: 1"><B><SPAN style="COLOR: white; FONT-FAMILY: \'Times\',\'serif\'; mso-bidi-font-family: Arial; mso-themecolor: background1">Header 2<o:p></o:p></SPAN></B></P></TD>' +
'<TD style="BORDER-RIGHT: #4f81bd 1pt solid; PADDING-RIGHT: 5.4pt; BORDER-TOP: #4f81bd 1pt solid; PADDING-LEFT: 5.4pt; BACKGROUND: #4f81bd; PADDING-BOTTOM: 0in; BORDER-LEFT: medium none; WIDTH: 159.6pt; PADDING-TOP: 0in; BORDER-BOTTOM: medium none; mso-border-top-themecolor: accent1; mso-background-themecolor: accent1; mso-border-right-themecolor: accent1" vAlign=top width=213>' +
'<P class=MsoNormal style="MARGIN-BOTTOM: 0pt; LINE-HEIGHT: normal; mso-yfti-cnfc: 1"><B><SPAN style="COLOR: white; FONT-FAMILY: \'Times\',\'serif\'; mso-bidi-font-family: Arial; mso-themecolor: background1">Header 3<o:p></o:p></SPAN></B></P></TD></TR>' +
'<TR style="mso-yfti-irow: 0">' +
'<TD style="BORDER-RIGHT: medium none; PADDING-RIGHT: 5.4pt; BORDER-TOP: #4f81bd 1pt solid; PADDING-LEFT: 5.4pt; PADDING-BOTTOM: 0in; BORDER-LEFT: #4f81bd 1pt solid; WIDTH: 159.6pt; PADDING-TOP: 0in; BORDER-BOTTOM: #4f81bd 1pt solid; mso-border-themecolor: accent1" vAlign=top width=213>' +
'<P class=MsoNormal style="MARGIN-BOTTOM: 0pt; LINE-HEIGHT: normal; mso-yfti-cnfc: 68"><B><SPAN style="FONT-FAMILY: \'Times\',\'serif\'; mso-bidi-font-family: Arial">Content 1 1<o:p></o:p></SPAN></B></P></TD>' +
'<TD style="BORDER-RIGHT: medium none; PADDING-RIGHT: 5.4pt; BORDER-TOP: #4f81bd 1pt solid; PADDING-LEFT: 5.4pt; PADDING-BOTTOM: 0in; BORDER-LEFT: medium none; WIDTH: 159.6pt; PADDING-TOP: 0in; BORDER-BOTTOM: #4f81bd 1pt solid; mso-border-top-themecolor: accent1; mso-border-bottom-themecolor: accent1" vAlign=top width=213>' +
'<P class=MsoNormal style="MARGIN-BOTTOM: 0pt; LINE-HEIGHT: normal; mso-yfti-cnfc: 64"><SPAN style="FONT-FAMILY: \'Times\',\'serif\'; mso-bidi-font-family: Arial">Cotnent 2 1<o:p></o:p></SPAN></P></TD>' +
'<TD style="BORDER-RIGHT: #4f81bd 1pt solid; PADDING-RIGHT: 5.4pt; BORDER-TOP: #4f81bd 1pt solid; PADDING-LEFT: 5.4pt; PADDING-BOTTOM: 0in; BORDER-LEFT: medium none; WIDTH: 159.6pt; PADDING-TOP: 0in; BORDER-BOTTOM: #4f81bd 1pt solid; mso-border-themecolor: accent1" vAlign=top width=213>' +
'<P class=MsoNormal style="MARGIN-BOTTOM: 0pt; LINE-HEIGHT: normal; mso-yfti-cnfc: 64"><SPAN style="FONT-FAMILY: \'Times\',\'serif\'; mso-bidi-font-family: Arial">Cotnent 3 1<o:p></o:p></SPAN></P></TD></TR>' +
'<TR style="mso-yfti-irow: 1; mso-yfti-lastrow: yes">' +
'<TD style="BORDER-RIGHT: medium none; PADDING-RIGHT: 5.4pt; BORDER-TOP: medium none; PADDING-LEFT: 5.4pt; PADDING-BOTTOM: 0in; BORDER-LEFT: #4f81bd 1pt solid; WIDTH: 159.6pt; PADDING-TOP: 0in; BORDER-BOTTOM: #4f81bd 1pt solid; mso-border-left-themecolor: accent1; mso-border-bottom-themecolor: accent1" vAlign=top width=213>' +
'<P class=MsoNormal style="MARGIN-BOTTOM: 0pt; LINE-HEIGHT: normal; mso-yfti-cnfc: 4"><B><SPAN style="FONT-FAMILY: \'Times\',\'serif\'; mso-bidi-font-family: Arial">Cotnent 1 2<o:p></o:p></SPAN></B></P></TD>' +
'<TD style="BORDER-RIGHT: medium none; PADDING-RIGHT: 5.4pt; BORDER-TOP: medium none; PADDING-LEFT: 5.4pt; PADDING-BOTTOM: 0in; BORDER-LEFT: medium none; WIDTH: 159.6pt; PADDING-TOP: 0in; BORDER-BOTTOM: #4f81bd 1pt solid; mso-border-bottom-themecolor: accent1" vAlign=top width=213>' +
'<P class=MsoNormal style="MARGIN-BOTTOM: 0pt; LINE-HEIGHT: normal"><SPAN style="FONT-FAMILY: \'Times\',\'serif\'; mso-bidi-font-family: Arial">Cotnent 2 2<o:p></o:p></SPAN></P></TD>' +
'<TD style="BORDER-RIGHT: #4f81bd 1pt solid; PADDING-RIGHT: 5.4pt; BORDER-TOP: medium none; PADDING-LEFT: 5.4pt; PADDING-BOTTOM: 0in; BORDER-LEFT: medium none; WIDTH: 159.6pt; PADDING-TOP: 0in; BORDER-BOTTOM: #4f81bd 1pt solid; mso-border-right-themecolor: accent1; mso-border-bottom-themecolor: accent1" vAlign=top width=213>' +
'<P class=MsoNormal style="MARGIN-BOTTOM: 0pt; LINE-HEIGHT: normal"><SPAN style="FONT-FAMILY: \'Times\',\'serif\'; mso-bidi-font-family: Arial">Cotnent 3 2<o:p></o:p></SPAN></P></TD></TR></TBODY></TABLE>' +
'<P class=MsoNormal><SPAN style="FONT-FAMILY: \'Times\',\'serif\'; mso-bidi-font-family: Arial"><o:p>&nbsp;</o:p></SPAN></P>'});


    var content = $j("<div></div>").append(ed.getContent());

    ok($j(content).children(":nth(0)").is("table"), "first node is an table");
    equals($j(content).find("table tbody").length, 1, "one table body");
    equals($j(content).find("table tbody tr").length, 3, "there are three trs");
    equals($j(content).find("table tbody tr:nth(0) td").length, 3, "three cells in the row");
    equals($j(content).find("table tbody tr:nth(1) td").length, 3, "three cells in the row");
    equals($j(content).find("table tbody tr:nth(2) td").length, 3, "three cells in the row");

    hasStyle(content, "table tbody tr:nth(0) td", ["border-left","border-color","border-top-color"],
            ["rgb(79, 129, 189)","#4F81BD"], "border information was saved");
    hasStyle(content, "table tbody tr:nth(0) td", ["border-left","border-width"],
            ["1pt", "initial","1pt medium medium 1pt","#4F81BD 1pt solid"], "border information was saved");
    hasStyle(content, "table tbody tr:nth(0) td", ["border-left","border-left","border-style"],
            ["solid","initial","solid none none solid"], "border information was saved");


    //	equals(trimContent(ed.getContent().replace(/[\r\n]+/g, '')), '');

});

test("Paste Word retain color styles 1", function() {
	// Test color
	var rng = ed.dom.createRng();

	ed.setContent('<p>1234</p>');
	rng.setStart(ed.getBody().firstChild.firstChild, 0);
	rng.setEnd(ed.getBody().firstChild.firstChild, 4);
	ed.selection.setRng(rng);


	ed.execCommand('mceInsertClipboardContent', false, {content : '<p class="MsoNormal" style="color: #ff0000">Test</p>'});
	equals(trimContent(ed.getContent().replace(/[\r\n]+/g, '')), '<p style=\"color: #ff0000;\">Test</p>');

});

test("Paste Word retain color styles 2", function() {

	// Test background-color
	var rng = ed.dom.createRng();

	ed.setContent('<p>1234</p>');
	rng.setStart(ed.getBody().firstChild.firstChild, 0);
	rng.setEnd(ed.getBody().firstChild.firstChild, 4);
	ed.selection.setRng(rng);


	ed.execCommand('mceInsertClipboardContent', false, {content : '<p class="MsoNormal" style="background-color: #ff0000">Test</p>'});
	equals(trimContent(ed.getContent().replace(/[\r\n]+/g, '')), '<p style=\"background-color: #ff0000;\">Test</p>');

});

test("Paste list", function() {
	var rng = ed.dom.createRng();

	ed.setContent('<p>1234</p>');
	rng.setStart(ed.getBody().firstChild.firstChild, 0);
	rng.setEnd(ed.getBody().firstChild.firstChild, 4);
	ed.selection.setRng(rng);

	ed.execCommand('mceInsertClipboardContent', false, {content : '<meta charset="utf-8"><p style="margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-width: 0px; border-right-width: 0px; border-bottom-width: 0px; border-left-width: 0px; border-style: initial; border-color: initial; outline-width: 0px; outline-style: initial; outline-color: initial; font-size: 1em; background-image: initial; background-attachment: initial; background-origin: initial; background-clip: initial; background-color: blue; color: rgb(85, 85, 85); background-position: initial initial; background-repeat: initial initial; "><span style="margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-width: 0px; border-right-width: 0px; border-bottom-width: 0px; border-left-width: 0px; border-style: initial; border-color: initial; outline-width: 0px; outline-style: initial; outline-color: initial; font-size: 10pt; background-image: initial; background-attachment: initial; background-origin: initial; background-clip: initial; background-color: transparent; color: rgb(128, 128, 128); font-family: helvetica; background-position: initial initial; background-repeat: initial initial; ">Jive Connects for IBM Sametime enables you to:</span></p><ul style="margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 2.25em; border-top-width: 0px; border-right-width: 0px; border-bottom-width: 0px; border-left-width: 0px; border-style: initial; border-color: initial; outline-width: 0px; outline-style: initial; outline-color: initial; font-size: 12px; background-image: initial; background-attachment: initial; background-origin: initial; background-clip: initial; background-color: transparent; list-style-type: disc; list-style-position: initial; list-style-image: initial; background-position: initial initial; background-repeat: initial initial; "><li style="margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-width: 0px; border-right-width: 0px; border-bottom-width: 0px; border-left-width: 0px; border-style: initial; border-color: initial; outline-width: 0px; outline-style: initial; outline-color: initial; font-size: 1em; background-image: none; background-attachment: initial; background-origin: initial; background-clip: initial; background-color: initial; background-position: 0px 7px; background-repeat: no-repeat no-repeat; "><p style="margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-width: 0px; border-right-width: 0px; border-bottom-width: 0px; border-left-width: 0px; border-style: initial; border-color: initial; outline-width: 0px; outline-style: initial; outline-color: initial; font-size: 1em; background-image: none; background-attachment: initial; background-origin: initial; background-clip: initial; background-color: transparent; color: rgb(85, 85, 85); background-position: initial initial; background-repeat: initial initial; "><span style="margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-width: 0px; border-right-width: 0px; border-bottom-width: 0px; border-left-width: 0px; border-style: initial; border-color: initial; outline-width: 0px; outline-style: initial; outline-color: initial; font-size: 10pt; background-image: initial; background-attachment: initial; background-origin: initial; background-clip: initial; background-color: transparent; color: rgb(128, 128, 128); font-family: helvetica; background-position: initial initial; background-repeat: initial initial; ">Speed up collaboration through seamlessly integrating enterprise IM</span></p></li><li style="margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-width: 0px; border-right-width: 0px; border-bottom-width: 0px; border-left-width: 0px; border-style: initial; border-color: initial; outline-width: 0px; outline-style: initial; outline-color: initial; font-size: 1em; background-image: none; background-attachment: initial; background-origin: initial; background-clip: initial; background-color: initial; background-position: 0px 7px; background-repeat: no-repeat no-repeat; "><p style="margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-width: 0px; border-right-width: 0px; border-bottom-width: 0px; border-left-width: 0px; border-style: initial; border-color: initial; outline-width: 0px; outline-style: initial; outline-color: initial; font-size: 1em; background-image: none; background-attachment: initial; background-origin: initial; background-clip: initial; background-color: transparent; color: rgb(85, 85, 85); background-position: initial initial; background-repeat: initial initial; "><span style="margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-width: 0px; border-right-width: 0px; border-bottom-width: 0px; border-left-width: 0px; border-style: initial; border-color: initial; outline-width: 0px; outline-style: initial; outline-color: initial; font-size: 10pt; background-image: initial; background-attachment: initial; background-origin: initial; background-clip: initial; background-color: transparent; color: rgb(128, 128, 128); font-family: helvetica; background-position: initial initial; background-repeat: initial initial; ">See who\'s online and initiate chat from within Jive SBS</span></p></li><li style="margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-width: 0px; border-right-width: 0px; border-bottom-width: 0px; border-left-width: 0px; border-style: initial; border-color: initial; outline-width: 0px; outline-style: initial; outline-color: initial; font-size: 1em; background-image: none; background-attachment: initial; background-origin: initial; background-clip: initial; background-color: initial; background-position: 0px 7px; background-repeat: no-repeat no-repeat; "><p style="margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-width: 0px; border-right-width: 0px; border-bottom-width: 0px; border-left-width: 0px; border-style: initial; border-color: initial; outline-width: 0px; outline-style: initial; outline-color: initial; font-size: 1em; background-image: none; background-attachment: initial; background-origin: initial; background-clip: initial; background-color: transparent; color: rgb(85, 85, 85); background-position: initial initial; background-repeat: initial initial; "><span style="margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-width: 0px; border-right-width: 0px; border-bottom-width: 0px; border-left-width: 0px; border-style: initial; border-color: initial; outline-width: 0px; outline-style: initial; outline-color: initial; font-size: 10pt; background-image: initial; background-attachment: initial; background-origin: initial; background-clip: initial; background-color: transparent; color: rgb(128, 128, 128); font-family: helvetica; background-position: initial initial; background-repeat: initial initial; ">Extend your enterprise IM investment</span></p><div><span style="margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-width: 0px; border-right-width: 0px; border-bottom-width: 0px; border-left-width: 0px; border-style: initial; border-color: initial; outline-width: 0px; outline-style: initial; outline-color: initial; font-size: 10pt; background-image: initial; background-attachment: initial; background-origin: initial; background-clip: initial; background-color: transparent; color: rgb(128, 128, 128); font-family: helvetica; background-position: initial initial; background-repeat: initial initial; "><br></span></div></li></ul>'});
    equals(ed.getContent().replace(/[\r\n]+/g, ''), '<p style=\"background-color: blue; color: #555555;\"><span style=\"font-size: 10pt; color: #808080; font-family: helvetica;\">Jive Connects for IBM Sametime enables you to:</span></p><ul><li><span style=\"color: #555555;\"><span style=\"font-size: 10pt; color: #808080; font-family: helvetica;\">Speed up collaboration through seamlessly integrating enterprise IM</span></span></li><li><span style=\"color: #555555;\"><span style=\"font-size: 10pt; color: #808080; font-family: helvetica;\">See who\'s online and initiate chat from within Jive SBS</span></span></li><li><span style=\"color: #555555;\"><span style=\"font-size: 10pt; color: #808080; font-family: helvetica;\">Extend your enterprise IM investment</span></span></li></ul>');
});

test("CS-22519 Paste plain text content with class attribute", function() {
	var rng = ed.dom.createRng();

	ed.setContent('<p>1234</p>');
	rng.setStart(ed.getBody().firstChild.firstChild, 0);
	rng.setEnd(ed.getBody().firstChild.firstChild, 4);
	ed.selection.setRng(rng);

	ed.execCommand('mceInsertClipboardContent', false, {content : 'foo class="asdf" asdf'});
    equals(ed.getContent().replace(/[\r\n]+/g, ''), '<p>foo class=\"asdf\" asdf</p>');
});

test("Paste div", function() {
	var rng = ed.dom.createRng();

	ed.setContent('<p>1234</p>');
	rng.setStart(ed.getBody().firstChild.firstChild, 0);
	rng.setEnd(ed.getBody().firstChild.firstChild, 4);
	ed.selection.setRng(rng);

	ed.execCommand('mceInsertClipboardContent', false, {content : '<div>foo\rbar</div><div style="color:blue;">blue text</div>'});
    equals(ed.getContent().replace(/[\r\n]+/g, ''), '<p>foo bar</p><p style=\"color: blue;\">blue text</p>');
});

test("Paste div and p", function() {
	var rng = ed.dom.createRng();

	ed.setContent('<p>1234</p>');
	rng.setStart(ed.getBody().firstChild.firstChild, 0);
	rng.setEnd(ed.getBody().firstChild.firstChild, 4);
	ed.selection.setRng(rng);

	ed.execCommand('mceInsertClipboardContent', false, {content : '<div>foo and <p>bar</p>a <p>bar</p>awhat</div><div style="color:blue;">bluetext</div>'});
    equals(ed.getContent().replace(/[\r\n]+/g, ''), '<p>foo and </p><p>bar</p><p>a </p><p>bar</p><p>awhat</p><p style=\"color: blue;\">bluetext</p>');
});

test("Paste multiline plain text", function() {
	var rng = ed.dom.createRng();

	ed.setContent('<p>1234</p>');
	rng.setStart(ed.getBody().firstChild.firstChild, 0);
	rng.setEnd(ed.getBody().firstChild.firstChild, 4);
	ed.selection.setRng(rng);

	ed.execCommand('mceInsertClipboardContent', false, {content : 'This is a test<br><br><br>what<br>and<br><br>asdfasdf.'});
    equals(ed.getContent().replace(/[\r\n]+/g, ''), '<p>This is a test</p><p></p><p></p><p>what</p><p>and</p><p></p><p>asdfasdf.</p>');
});

test("Paste font-weight normal text 1", function() {
	var rng = ed.dom.createRng();

	ed.setContent('<p>1234</p>');
	rng.setStart(ed.getBody().firstChild.firstChild, 0);
	rng.setEnd(ed.getBody().firstChild.firstChild, 4);
	ed.selection.setRng(rng);

	ed.execCommand('mceInsertClipboardContent', false, {content : '&nbsp;<P class=MsoNormal style="MARGIN: 2.4pt 0in 2.4pt 0.25in; TEXT-INDENT: -0.25in; mso-list: l0 level1 lfo1; tab-stops: list .25in"><SPAN style="FONT-SIZE: 10pt; COLOR: #333333; FONT-FAMILY: \'Arial\',\'sans-serif\'; mso-fareast-font-family: Arial"><SPAN style="mso-list: Ignore">2.<SPAN style="FONT: 7pt \'Times New Roman\'">&nbsp;&nbsp;&nbsp;&nbsp; </SPAN></SPAN></SPAN><SPAN style="FONT-SIZE: 10pt; COLOR: #333333; FONT-FAMILY: \'Arial\',\'sans-serif\'">MSDN licenses: <STRONG><SPAN style="FONT-WEIGHT: normal; FONT-FAMILY: \'Arial\',\'sans-serif\'; mso-bidi-font-weight: bold">upgrades, Courtyard discussion,</SPAN></STRONG><STRONG><SPAN style="FONT-FAMILY: \'Arial\',\'sans-serif\'"> Quickstart feedback</SPAN></STRONG><o:p></o:p></SPAN></P>'});

    var content = $j("<div></div>").append(ed.getContent());

    ok($j(content).children(":nth(0)").is("ol"), "first node is an ol");
    equals($j(content).find("ol li").length, 1, "one list item");
    equals($j(content).find("ol li span").length, 3, "there are three spans");
    equals($j(content).find("ol li span span").length, 2, "one span contains the other two");
    equals($j(content).find("ol li span strong span").length, 1, "one span is bold");
    equals($j(content).find("ol li span:first").text(),
            "MSDN licenses: upgrades, Courtyard discussion, Quickstart feedback", "one span is bold");
    ok(has(content, "ol li span:first", "style", "font-family"), "font family information was saved");
    ok(has(content, "ol li span:first", "style", "Arial"), "font family information was saved");
    ok(has(content, "ol li span:first", "style", "sans-serif"), "font family information was saved");
    ok(has(content, "ol li span:first", "style", "color"), "color information was saved");
    ok(has(content, "ol li span:first", "style", ["#333333", "rgb(51, 51, 51)"]), "color information was saved");
    ok(has(content, "ol li span:first", "style", "font-size"), "font size information available");
    ok(has(content, "ol li span:first", "style", "10pt"), "font size information available");
    ok(!has(content, "ol li span:first", "style", "font-weight"), "font weight information was not saved");

    equals($j(content).find("ol li span span:first").text(), "upgrades, Courtyard discussion,", "one span is bold");
    ok(has(content, "ol li span span:first", "style", "font-family"), "font family information was saved");
    ok(has(content, "ol li span span:first", "style", "Arial"), "font family information was saved");
    ok(has(content, "ol li span span:first", "style", "sans-serif"), "font family information was saved");
    ok(!has(content, "ol li span span:first", "style", "font-weight"), "font weight information was not saved");

    equals($j(content).find("ol li span strong span").text(), " Quickstart feedback", "one span is bold");
    ok(has(content, "ol li strong span", "style", "font-family"), "font family information was saved");
    ok(has(content, "ol li strong span", "style", "Arial"), "font family information was saved");
    ok(has(content, "ol li strong span", "style", "sans-serif"), "font family information was saved");
    ok(!has(content, "ol li strong span", "style", "font-weight"), "font weight information was not saved");

//    equals(ed.getContent().replace(/[\r\n]+/g, ''), '<ol><li><span style=\"color: #333333; font-family: \'Arial\',\'sans-serif\'; font-size: 10pt;\">MSDN licenses: <span style=\"font-family: \'Arial\',\'sans-serif\';\">upgrades, Courtyard discussion,</span><strong><span style=\"font-family: \'Arial\',\'sans-serif\';\"> Quickstart feedback</span></strong></span></li></ol>');
});

test("Paste font-weight normal text 2", function() {
	var rng = ed.dom.createRng();

	ed.setContent('<p>1234</p>');
	rng.setStart(ed.getBody().firstChild.firstChild, 0);
	rng.setEnd(ed.getBody().firstChild.firstChild, 4);
	ed.selection.setRng(rng);

	ed.execCommand('mceInsertClipboardContent', false, {content : '&nbsp;<P class=MsoNormal style="MARGIN: 2.4pt 0in 2.4pt 0.25in; TEXT-INDENT: -0.25in; mso-list: l0 level1 lfo1; tab-stops: list .25in"><SPAN style="FONT-SIZE: 10pt; COLOR: #333333; FONT-FAMILY: \'Arial\',\'sans-serif\'; mso-fareast-font-family: Arial"><SPAN style="mso-list: Ignore">2.<SPAN style="FONT: 7pt \'Times New Roman\'">&nbsp;&nbsp;&nbsp;&nbsp; </SPAN></SPAN></SPAN><SPAN style="FONT-SIZE: 10pt; COLOR: #333333; FONT-FAMILY: \'Arial\',\'sans-serif\'">MSDN licenses: <STRONG><SPAN style="FONT-FAMILY: \'Arial\',\'sans-serif\'; mso-bidi-font-weight: bold; FONT-WEIGHT: normal">upgrades, Courtyard discussion,</SPAN></STRONG><STRONG><SPAN style="FONT-FAMILY: \'Arial\',\'sans-serif\'"> Quickstart feedback</SPAN></STRONG><o:p></o:p></SPAN></P>'});

    var content = $j("<div></div>").append(ed.getContent());

    ok($j(content).children(":nth(0)").is("ol"), "first node is an ol");
    equals($j(content).find("ol li").length, 1, "one list item");
    equals($j(content).find("ol li span").length, 3, "there are three spans");
    equals($j(content).find("ol li span span").length, 2, "one span contains the other two");
    equals($j(content).find("ol li span strong span").length, 1, "one span is bold");
    equals($j(content).find("ol li span:first").text(),
            "MSDN licenses: upgrades, Courtyard discussion, Quickstart feedback", "one span is bold");
    ok(has(content, "ol li span:first", "style", "font-family"), "font family information was saved");
    ok(has(content, "ol li span:first", "style", "Arial"), "font family information was saved");
    ok(has(content, "ol li span:first", "style", "sans-serif"), "font family information was saved");
    ok(has(content, "ol li span:first", "style", "color"), "color information was saved");
    ok(has(content, "ol li span:first", "style", ["#333333", "rgb(51, 51, 51)"]), "color information was saved");
    ok(has(content, "ol li span:first", "style", "font-size"), "font size information available");
    ok(has(content, "ol li span:first", "style", "10pt"), "font size information available");
    ok(!has(content, "ol li span:first", "style", "font-weight"), "font weight information was not saved");

    equals($j(content).find("ol li span span:first").text(), "upgrades, Courtyard discussion,", "one span is bold");
    ok(has(content, "ol li span span:first", "style", "font-family"), "font family information was saved");
    ok(has(content, "ol li span span:first", "style", "Arial"), "font family information was saved");
    ok(has(content, "ol li span span:first", "style", "sans-serif"), "font family information was saved");
    ok(!has(content, "ol li span span:first", "style", "font-weight"), "font weight information was not saved");

    equals($j(content).find("ol li span strong span").text(), " Quickstart feedback", "one span is bold");
    ok(has(content, "ol li strong span", "style", "font-family"), "font family information was saved");
    ok(has(content, "ol li strong span", "style", "Arial"), "font family information was saved");
    ok(has(content, "ol li strong span", "style", "sans-serif"), "font family information was saved");
    ok(!has(content, "ol li strong span", "style", "font-weight"), "font weight information was not saved");

//    equals(ed.getContent().replace(/[\r\n]+/g, ''), '<ol><li><span style=\"color: #333333; font-family: \'Arial\',\'sans-serif\'; font-size: 10pt;\">MSDN licenses: <span style=\"font-family: \'Arial\',\'sans-serif\';\">upgrades, Courtyard discussion,</span><strong><span style=\"font-family: \'Arial\',\'sans-serif\';\"> Quickstart feedback</span></strong></span></li></ol>');
});

//
// if a <strong> contains only 1 <span>
// that has a style of only font-weight:normal;
// then both tags are removed and just the text remains
test("Paste font-weight normal text 3", function() {
	var rng = ed.dom.createRng();

	ed.setContent('<p>1234</p>');
	rng.setStart(ed.getBody().firstChild.firstChild, 0);
	rng.setEnd(ed.getBody().firstChild.firstChild, 4);
	ed.selection.setRng(rng);

	ed.execCommand('mceInsertClipboardContent', false, {content : '&nbsp;<P class=MsoNormal style="MARGIN: 2.4pt 0in 2.4pt 0.25in; TEXT-INDENT: -0.25in; mso-list: l0 level1 lfo1; tab-stops: list .25in"><SPAN style="FONT-SIZE: 10pt; COLOR: #333333; FONT-FAMILY: \'Arial\',\'sans-serif\'; mso-fareast-font-family: Arial"><SPAN style="mso-list: Ignore">2.<SPAN style="FONT: 7pt \'Times New Roman\'">&nbsp;&nbsp;&nbsp;&nbsp; </SPAN></SPAN></SPAN><SPAN style="FONT-SIZE: 10pt; COLOR: #333333; FONT-FAMILY: \'Arial\',\'sans-serif\'">MSDN licenses: <STRONG><SPAN style="FONT-WEIGHT: normal">upgrades, Courtyard discussion,</SPAN></STRONG><STRONG><SPAN style="FONT-FAMILY: \'Arial\',\'sans-serif\'"> Quickstart feedback</SPAN></STRONG><o:p></o:p></SPAN></P>'});

    var content = $j("<div></div>").append(ed.getContent());

    ok($j(content).children(":nth(0)").is("ol"), "first node is an ol");
    equals($j(content).find("ol li").length, 1, "one list item");
    equals($j(content).find("ol li span").length, 2, "there are three spans");
    equals($j(content).find("ol li span strong span").length, 1, "one span is bold");
    equals($j(content).find("ol li span:first").text(),
            "MSDN licenses: upgrades, Courtyard discussion, Quickstart feedback", "one span is bold");
    ok(has(content, "ol li span:first", "style", "font-family"), "font family information was saved");
    ok(has(content, "ol li span:first", "style", "Arial"), "font family information was saved");
    ok(has(content, "ol li span:first", "style", "sans-serif"), "font family information was saved");
    ok(has(content, "ol li span:first", "style", "color"), "color information was saved");
    ok(has(content, "ol li span:first", "style", ["#333333", "rgb(51, 51, 51)"]), "color information was saved");
    ok(has(content, "ol li span:first", "style", "font-size"), "font size information available");
    ok(has(content, "ol li span:first", "style", "10pt"), "font size information available");
    ok(!has(content, "ol li span:first", "style", "font-weight"), "font weight information was not saved");

    equals($j(content).find("ol li span strong span").text(), " Quickstart feedback", "one span is bold");
    ok(has(content, "ol li strong span", "style", "font-family"), "font family information was saved");
    ok(has(content, "ol li strong span", "style", "Arial"), "font family information was saved");
    ok(has(content, "ol li strong span", "style", "sans-serif"), "font family information was saved");
    ok(!has(content, "ol li strong span", "style", "font-weight"), "font weight information was not saved");

//    equals(ed.getContent().replace(/[\r\n]+/g, ''), '<ol><li><span style=\"color: #333333; font-family: \'Arial\',\'sans-serif\'; font-size: 10pt;\">MSDN licenses: upgrades, Courtyard discussion,<strong><span style=\"font-family: \'Arial\',\'sans-serif\';\"> Quickstart feedback</span></strong></span></li></ol>');
});

// this test ensures we don't strip out <strong>
// when there is /not/ a font-weight defined in the inside <span>
test("Paste font-weight normal text 4", function() {
	var rng = ed.dom.createRng();

	ed.setContent('<p>1234</p>');
	rng.setStart(ed.getBody().firstChild.firstChild, 0);
	rng.setEnd(ed.getBody().firstChild.firstChild, 4);
	ed.selection.setRng(rng);

	ed.execCommand('mceInsertClipboardContent', false, {content : '&nbsp;<P class=MsoNormal style="MARGIN: 2.4pt 0in 2.4pt 0.25in; TEXT-INDENT: -0.25in; mso-list: l0 level1 lfo1; tab-stops: list .25in"><SPAN style="FONT-SIZE: 10pt; COLOR: #333333; FONT-FAMILY: \'Arial\',\'sans-serif\'; mso-fareast-font-family: Arial"><SPAN style="mso-list: Ignore">2.<SPAN style="FONT: 7pt \'Times New Roman\'">&nbsp;&nbsp;&nbsp;&nbsp; </SPAN></SPAN></SPAN><SPAN style="FONT-SIZE: 10pt; COLOR: #333333; FONT-FAMILY: \'Arial\',\'sans-serif\'">MSDN licenses: <STRONG><SPAN style="FONT-FAMILY: \'Arial\',\'sans-serif\'">upgrades, Courtyard discussion,</SPAN></STRONG><STRONG><SPAN style="FONT-FAMILY: \'Arial\',\'sans-serif\'"> Quickstart feedback</SPAN></STRONG><o:p></o:p></SPAN></P>'});

    var content = $j("<div></div>").append(ed.getContent());

    ok($j(content).children(":nth(0)").is("ol"), "first node is an ol");
    equals($j(content).find("ol li").length, 1, "one list item");
    equals($j(content).find("ol li strong").length, 1, "there are 1 strong tag");
    equals($j(content).find("ol li span").length, 3, "there are three spans");
    equals($j(content).find("ol li span span").length, 2, "one span contains the other two");
    equals($j(content).find("ol li span strong span").length, 2, "both spans are bold");
    equals($j(content).find("ol li span:first").text(),
            "MSDN licenses: upgrades, Courtyard discussion, Quickstart feedback", "one span is bold");
    ok(has(content, "ol li span:first", "style", "font-family"), "font family information was saved");
    ok(has(content, "ol li span:first", "style", "Arial"), "font family information was saved");
    ok(has(content, "ol li span:first", "style", "sans-serif"), "font family information was saved");
    ok(has(content, "ol li span:first", "style", "color"), "color information was saved");
    ok(has(content, "ol li span:first", "style", ["#333333", "rgb(51, 51, 51)"]), "color information was saved");
    ok(has(content, "ol li span:first", "style", "font-size"), "font size information available");
    ok(has(content, "ol li span:first", "style", "10pt"), "font size information available");

    equals($j(content).find("ol li span strong span").text(), "upgrades, Courtyard discussion, Quickstart feedback",
            "one span is bold");
    ok(has(content, "ol li span strong:first span", "style", "font-family"), "font family information was saved");
    ok(has(content, "ol li span strong:first span", "style", "Arial"), "font family information was saved");
    ok(has(content, "ol li span strong:first span", "style", "sans-serif"), "font family information was saved");
    ok(!has(content, "ol li span strong:first span", "style", "font-weight"), "font weight information was not saved");

//    equals(ed.getContent().replace(/[\r\n]+/g, ''), '<ol><li><span style=\"color: #333333; font-family: \'Arial\',\'sans-serif\'; font-size: 10pt;\">MSDN licenses: <strong><span style=\"font-family: \'Arial\',\'sans-serif\';\">upgrades, Courtyard discussion,</span></strong><strong><span style=\"font-family: \'Arial\',\'sans-serif\';\"> Quickstart feedback</span></strong></span></li></ol>');
});

// this test ensures we don't strip out the <strong>
// but /do/ strip out the font-weight when the font-weight contains "bold"
test("Paste font-weight normal text 5", function() {
	var rng = ed.dom.createRng();

	ed.setContent('<p>1234</p>');
	rng.setStart(ed.getBody().firstChild.firstChild, 0);
	rng.setEnd(ed.getBody().firstChild.firstChild, 4);
	ed.selection.setRng(rng);

	ed.execCommand('mceInsertClipboardContent', false, {content : '&nbsp;<P class=MsoNormal style="MARGIN: 2.4pt 0in 2.4pt 0.25in; TEXT-INDENT: -0.25in; mso-list: l0 level1 lfo1; tab-stops: list .25in"><SPAN style="FONT-SIZE: 10pt; COLOR: #333333; FONT-FAMILY: \'Arial\',\'sans-serif\'; mso-fareast-font-family: Arial"><SPAN style="mso-list: Ignore">2.<SPAN style="FONT: 7pt \'Times New Roman\'">&nbsp;&nbsp;&nbsp;&nbsp; </SPAN></SPAN></SPAN><SPAN style="FONT-SIZE: 10pt; COLOR: #333333; FONT-FAMILY: \'Arial\',\'sans-serif\'">MSDN licenses: <STRONG><SPAN style="FONT-FAMILY: \'Arial\',\'sans-serif\'; mso-bidi-font-weight: bold; FONT-WEIGHT: bold">upgrades, Courtyard discussion,</SPAN></STRONG><STRONG><SPAN style="FONT-FAMILY: \'Arial\',\'sans-serif\'"> Quickstart feedback</SPAN></STRONG><o:p></o:p></SPAN></P>'});

    var content = $j("<div></div>").append(ed.getContent());

    ok($j(content).children(":nth(0)").is("ol"), "first node is an ol");
    equals($j(content).find("ol li").length, 1, "one list item");
    equals($j(content).find("ol li strong").length, 1, "there are 1 strong tags");
    equals($j(content).find("ol li span").length, 3, "there are three spans");
    equals($j(content).find("ol li span span").length, 2, "one span contains the other two");
    equals($j(content).find("ol li span strong span").length, 2, "both spans are bold");
    equals($j(content).find("ol li span:first").text(),
            "MSDN licenses: upgrades, Courtyard discussion, Quickstart feedback", "one span is bold");
    ok(has(content, "ol li span:first", "style", "font-family"), "font family information was saved");
    ok(has(content, "ol li span:first", "style", "Arial"), "font family information was saved");
    ok(has(content, "ol li span:first", "style", "sans-serif"), "font family information was saved");
    ok(has(content, "ol li span:first", "style", "color"), "color information was saved");
    ok(has(content, "ol li span:first", "style", ["#333333", "rgb(51, 51, 51)"]), "color information was saved");
    ok(has(content, "ol li span:first", "style", "font-size"), "font size information available");
    ok(has(content, "ol li span:first", "style", "10pt"), "font size information available");

    equals($j(content).find("ol li span strong span").text(), "upgrades, Courtyard discussion, Quickstart feedback",
            "one span is bold");
    ok(has(content, "ol li span strong:first span", "style", "font-family"), "font family information was saved");
    ok(has(content, "ol li span strong:first span", "style", "Arial"), "font family information was saved");
    ok(has(content, "ol li span strong:first span", "style", "sans-serif"), "font family information was saved");
    ok(!has(content, "ol li span strong:first span", "style", "font-weight"), "font weight information was not saved");

//    equals(ed.getContent().replace(/[\r\n]+/g, ''), '<ol><li><span style=\"color: #333333; font-family: \'Arial\',\'sans-serif\'; font-size: 10pt;\">MSDN licenses: <strong><span style=\"font-family: \'Arial\',\'sans-serif\';\">upgrades, Courtyard discussion,</span></strong><strong><span style=\"font-family: \'Arial\',\'sans-serif\';\"> Quickstart feedback</span></strong></span></li></ol>');
});

// this test ensures we don't strip out the <strong>
// but /do/ strip out the font-weight when the font-weight contains "bolder"
test("Paste font-weight normal text 6", function() {
	var rng = ed.dom.createRng();

	ed.setContent('<p>1234</p>');
	rng.setStart(ed.getBody().firstChild.firstChild, 0);
	rng.setEnd(ed.getBody().firstChild.firstChild, 4);
	ed.selection.setRng(rng);

	ed.execCommand('mceInsertClipboardContent', false, {content : '&nbsp;<P class=MsoNormal style="MARGIN: 2.4pt 0in 2.4pt 0.25in; TEXT-INDENT: -0.25in; mso-list: l0 level1 lfo1; tab-stops: list .25in"><SPAN style="FONT-SIZE: 10pt; COLOR: #333333; FONT-FAMILY: \'Arial\',\'sans-serif\'; mso-fareast-font-family: Arial"><SPAN style="mso-list: Ignore">2.<SPAN style="FONT: 7pt \'Times New Roman\'">&nbsp;&nbsp;&nbsp;&nbsp; </SPAN></SPAN></SPAN><SPAN style="FONT-SIZE: 10pt; COLOR: #333333; FONT-FAMILY: \'Arial\',\'sans-serif\'">MSDN licenses: <STRONG><SPAN style="FONT-FAMILY: \'Arial\',\'sans-serif\'; mso-bidi-font-weight: bold; FONT-WEIGHT: bolder">upgrades, Courtyard discussion,</SPAN></STRONG><STRONG><SPAN style="FONT-FAMILY: \'Arial\',\'sans-serif\'"> Quickstart feedback</SPAN></STRONG><o:p></o:p></SPAN></P>'});

    var content = $j("<div></div>").append(ed.getContent());

    ok($j(content).children(":nth(0)").is("ol"), "first node is an ol");
    equals($j(content).find("ol li").length, 1, "one list item");
    equals($j(content).find("ol li strong").length, 1, "there are three spans");
    equals($j(content).find("ol li span").length, 3, "there are three spans");
    equals($j(content).find("ol li span span").length, 2, "one span contains the other two");
    equals($j(content).find("ol li span strong span").length, 2, "both spans are bold");
    equals($j(content).find("ol li span:first").text(),
            "MSDN licenses: upgrades, Courtyard discussion, Quickstart feedback", "one span is bold");
    ok(has(content, "ol li span:first", "style", "font-family"), "font family information was saved");
    ok(has(content, "ol li span:first", "style", "Arial"), "font family information was saved");
    ok(has(content, "ol li span:first", "style", "sans-serif"), "font family information was saved");
    ok(has(content, "ol li span:first", "style", "color"), "color information was saved");
    ok(has(content, "ol li span:first", "style", ["#333333", "rgb(51, 51, 51)"]), "color information was saved");
    ok(has(content, "ol li span:first", "style", "font-size"), "font size information available");
    ok(has(content, "ol li span:first", "style", "10pt"), "font size information available");

    equals($j(content).find("ol li span strong:first span").text(),
            "upgrades, Courtyard discussion, Quickstart feedback", "one span is bold");
    ok(has(content, "ol li span strong:first span", "style", "font-family"), "font family information was saved");
    ok(has(content, "ol li span strong:first span", "style", "Arial"), "font family information was saved");
    ok(has(content, "ol li span strong:first span", "style", "sans-serif"), "font family information was saved");
    ok(!has(content, "ol li span strong:first span", "style", "font-weight"), "font weight information was not saved");

//    equals(ed.getContent().replace(/[\r\n]+/g, ''), '<ol><li><span style=\"color: #333333; font-family: \'Arial\',\'sans-serif\'; font-size: 10pt;\">MSDN licenses: <strong><span style=\"font-family: \'Arial\',\'sans-serif\';\">upgrades, Courtyard discussion,</span></strong><strong><span style=\"font-family: \'Arial\',\'sans-serif\';\"> Quickstart feedback</span></strong></span></li></ol>');
});

// this test ensures we don't strip out the <strong>
// but /do/ strip out the <span> when it only contains
// font-weight "bold[er] and some invalid styles like mso-*"
test("Paste font-weight normal text 7", function() {
	var rng = ed.dom.createRng();

	ed.setContent('<p>1234</p>');
	rng.setStart(ed.getBody().firstChild.firstChild, 0);
	rng.setEnd(ed.getBody().firstChild.firstChild, 4);
	ed.selection.setRng(rng);

	ed.execCommand('mceInsertClipboardContent', false, {content : '&nbsp;<P class=MsoNormal style="MARGIN: 2.4pt 0in 2.4pt 0.25in; TEXT-INDENT: -0.25in; mso-list: l0 level1 lfo1; tab-stops: list .25in"><SPAN style="FONT-SIZE: 10pt; COLOR: #333333; FONT-FAMILY: \'Arial\',\'sans-serif\'; mso-fareast-font-family: Arial"><SPAN style="mso-list: Ignore">2.<SPAN style="FONT: 7pt \'Times New Roman\'">&nbsp;&nbsp;&nbsp;&nbsp; </SPAN></SPAN></SPAN><SPAN style="FONT-SIZE: 10pt; COLOR: #333333; FONT-FAMILY: \'Arial\',\'sans-serif\'">MSDN licenses: <STRONG><SPAN style="mso-bidi-font-weight: bold; FONT-WEIGHT: bolder">upgrades, Courtyard discussion,</SPAN></STRONG><STRONG><SPAN style="FONT-FAMILY: \'Arial\',\'sans-serif\'"> Quickstart feedback</SPAN></STRONG><o:p></o:p></SPAN></P>'});

    var content = $j("<div></div>").append(ed.getContent());

    ok($j(content).children(":nth(0)").is("ol"), "first node is an ol");
    equals($j(content).find("ol li").length, 1, "one list item");
    equals($j(content).find("ol li span").length, 2, "there are two spans");
    equals($j(content).find("ol li span span").length, 1, "one span contains the other two");
    equals($j(content).find("ol li span strong").length, 1, "one strong tags");
    equals($j(content).find("ol li span strong span").length, 1, "both spans are bold");
    equals($j(content).find("ol li span:first").text(),
            "MSDN licenses: upgrades, Courtyard discussion, Quickstart feedback", "one span is bold");
    ok(has(content, "ol li span:first", "style", "font-family"), "font family information was saved");
    ok(has(content, "ol li span:first", "style", "Arial"), "font family information was saved");
    ok(has(content, "ol li span:first", "style", "sans-serif"), "font family information was saved");
    ok(has(content, "ol li span:first", "style", "color"), "color information was saved");
    ok(has(content, "ol li span:first", "style", ["#333333", "rgb(51, 51, 51)"]), "color information was saved");
    ok(has(content, "ol li span:first", "style", "font-size"), "font size information available");
    ok(has(content, "ol li span:first", "style", "10pt"), "font size information available");

    equals($j(content).find("ol li span strong").text(), "upgrades, Courtyard discussion, Quickstart feedback",
            "one span is bold");
    equals($j(content).find("ol li span strong span").length, 1, "first bold text doesn't have additional font info");

    equals($j(content).find("ol li span strong span").text(), " Quickstart feedback", "one span is bold");
    ok(has(content, "ol li span strong span", "style", "font-family"), "font family information was saved");
    ok(has(content, "ol li span strong span", "style", "Arial"), "font family information was saved");
    ok(has(content, "ol li span strong span", "style", "sans-serif"), "font family information was saved");
    ok(!has(content, "ol li span strong span", "style", "font-weight"), "font weight information was not saved");

//    equals(ed.getContent().replace(/[\r\n]+/g, ''), '<ol><li><span style=\"color: #333333; font-family: \'Arial\',\'sans-serif\'; font-size: 10pt;\">MSDN licenses: <strong>upgrades, Courtyard discussion,</strong><strong><span style=\"font-family: \'Arial\',\'sans-serif\';\"> Quickstart feedback</span></strong></span></li></ol>');
});


test("Paste large list from Word", function() {
	var rng = ed.dom.createRng();

	ed.setContent('<p>1234</p>');
	rng.setStart(ed.getBody().firstChild.firstChild, 0);
	rng.setEnd(ed.getBody().firstChild.firstChild, 4);
	ed.selection.setRng(rng);

	ed.execCommand('mceInsertClipboardContent', false, {content : '&nbsp;<P style="TEXT-ALIGN: center" align=center><STRONG><U><SPAN style="COLOR: #333333; FONT-FAMILY: \'Arial\',\'sans-serif\'">Agenda for May 31, 2010:</SPAN></U></STRONG><SPAN style="FONT-SIZE: 10pt; COLOR: #333333; FONT-FAMILY: \'Arial\',\'sans-serif\'"><?xml:namespace prefix = o ns = "urn:schemas-microsoft-com:office:office" /><o:p></o:p></SPAN></P><P><STRONG><U><SPAN style="FONT-SIZE: 10pt; COLOR: #333333; FONT-FAMILY: \'Arial\',\'sans-serif\'">Completed Activities:</SPAN></U></STRONG><SPAN style="FONT-SIZE: 10pt; COLOR: #333333; FONT-FAMILY: \'Arial\',\'sans-serif\'"><o:p></o:p></SPAN></P><P class=MsoNormal style="MARGIN: 2.4pt 0in; TEXT-INDENT: 0in; mso-list: l0 level1 lfo1; tab-stops: list .25in"><SPAN style="FONT-SIZE: 10pt; COLOR: #333333; FONT-FAMILY: \'Arial\',\'sans-serif\'; mso-fareast-font-family: Arial"><SPAN style="mso-list: Ignore">A.<SPAN style="FONT: 7pt \'Times New Roman\'">&nbsp;&nbsp;&nbsp; </SPAN></SPAN></SPAN><SPAN style="FONT-SIZE: 10pt; COLOR: #333333; FONT-FAMILY: \'Arial\',\'sans-serif\'">PS Maintenance Renewal Business Case<o:p></o:p></SPAN></P><P class=MsoNormal style="MARGIN: 2.4pt 0in; TEXT-INDENT: 0in; mso-list: l0 level1 lfo1; tab-stops: list .25in"><SPAN style="FONT-SIZE: 10pt; COLOR: #333333; FONT-FAMILY: \'Arial\',\'sans-serif\'; mso-fareast-font-family: Arial"><SPAN style="mso-list: Ignore">B.<SPAN style="FONT: 7pt \'Times New Roman\'">&nbsp;&nbsp;&nbsp; </SPAN></SPAN></SPAN><SPAN style="FONT-SIZE: 10pt; COLOR: #333333; FONT-FAMILY: \'Arial\',\'sans-serif\'">CorpWeb status meeting and minutes<o:p></o:p></SPAN></P><P class=MsoNormal style="MARGIN: 2.4pt 0in 2.4pt 0.25in; TEXT-INDENT: -0.25in; mso-list: l0 level1 lfo1; tab-stops: list .25in"><SPAN style="FONT-SIZE: 10pt; COLOR: #333333; FONT-FAMILY: \'Arial\',\'sans-serif\'; mso-fareast-font-family: Arial"><SPAN style="mso-list: Ignore">C.<SPAN style="FONT: 7pt \'Times New Roman\'">&nbsp;&nbsp;&nbsp; </SPAN></SPAN></SPAN><SPAN style="FONT-SIZE: 10pt; COLOR: #333333; FONT-FAMILY: \'Arial\',\'sans-serif\'">Special OpRef and Ticket Assignment meeting<B style="mso-bidi-font-weight: normal"> </B><o:p></o:p></SPAN></P><P class=MsoNormal style="MARGIN: 2.4pt 0in 2.4pt 0.25in; TEXT-INDENT: -0.25in; mso-list: l0 level1 lfo1; tab-stops: list .25in"><SPAN style="FONT-SIZE: 10pt; COLOR: #333333; FONT-FAMILY: \'Arial\',\'sans-serif\'; mso-fareast-font-family: Arial"><SPAN style="mso-list: Ignore">D.<SPAN style="FONT: 7pt \'Times New Roman\'">&nbsp;&nbsp;&nbsp; </SPAN></SPAN></SPAN><STRONG><SPAN style="FONT-WEIGHT: normal; FONT-SIZE: 10pt; COLOR: #333333; FONT-FAMILY: \'Arial\',\'sans-serif\'; mso-bidi-font-weight: bold">ATD-CorpWeb keywords, faster/better cross-team reassignments</SPAN></STRONG><SPAN style="FONT-SIZE: 10pt; COLOR: #333333; FONT-FAMILY: \'Arial\',\'sans-serif\'"><o:p></o:p></SPAN></P><P><STRONG><U><SPAN style="FONT-SIZE: 10pt; COLOR: #333333; FONT-FAMILY: \'Arial\',\'sans-serif\'">New/Ongoing Activities</SPAN></U></STRONG><SPAN style="FONT-SIZE: 10pt; COLOR: #333333; FONT-FAMILY: \'Arial\',\'sans-serif\'"><o:p></o:p></SPAN></P><P class=MsoNormal style="MARGIN: 2.4pt 0in 2.4pt 0.25in; TEXT-INDENT: -0.25in; mso-list: l1 level1 lfo3; tab-stops: list .25in"><SPAN style="FONT-SIZE: 10pt; COLOR: #333333; FONT-FAMILY: \'Arial\',\'sans-serif\'; mso-fareast-font-family: Arial"><SPAN style="mso-list: Ignore">1.<SPAN style="FONT: 7pt \'Times New Roman\'">&nbsp;&nbsp;&nbsp;&nbsp; </SPAN></SPAN></SPAN><SPAN style="FONT-SIZE: 10pt; COLOR: #333333; FONT-FAMILY: \'Arial\',\'sans-serif\'">&nbsp;Education Plans (and Operating Waterfall): Office, Element K, Forms, DW/Jive/Lagan conferences, Element K expansion<o:p></o:p></SPAN></P><P class=MsoNormal style="MARGIN: 2.4pt 0in 2.4pt 0.25in; TEXT-INDENT: -0.25in; mso-list: l1 level1 lfo3; tab-stops: list .25in"><SPAN style="FONT-SIZE: 10pt; COLOR: #333333; FONT-FAMILY: \'Arial\',\'sans-serif\'; mso-fareast-font-family: Arial"><SPAN style="mso-list: Ignore">2.<SPAN style="FONT: 7pt \'Times New Roman\'">&nbsp;&nbsp;&nbsp;&nbsp; </SPAN></SPAN></SPAN><SPAN style="FONT-SIZE: 10pt; COLOR: #333333; FONT-FAMILY: \'Arial\',\'sans-serif\'">MSDN licenses: <STRONG><SPAN style="FONT-WEIGHT: normal; FONT-FAMILY: \'Arial\',\'sans-serif\'; mso-bidi-font-weight: bold">upgrades, Courtyard discussion,</SPAN></STRONG><STRONG><SPAN style="FONT-FAMILY: \'Arial\',\'sans-serif\'"> Quickstart feedback</SPAN></STRONG><o:p></o:p></SPAN></P><P><STRONG><U><SPAN style="FONT-SIZE: 10pt; COLOR: #333333; FONT-FAMILY: \'Arial\',\'sans-serif\'">Future Activities</SPAN></U></STRONG><SPAN style="FONT-SIZE: 10pt; COLOR: #333333; FONT-FAMILY: \'Arial\',\'sans-serif\'"><o:p></o:p></SPAN></P><P><SPAN style="FONT-SIZE: 10pt; COLOR: #333333; FONT-FAMILY: \'Arial\',\'sans-serif\'">&nbsp;<o:p></o:p></SPAN></P><P><STRONG><U><SPAN style="FONT-SIZE: 10pt; COLOR: #333333; FONT-FAMILY: \'Arial\',\'sans-serif\'">Reference:</SPAN></U></STRONG><SPAN style="FONT-SIZE: 10pt; COLOR: #333333; FONT-FAMILY: \'Arial\',\'sans-serif\'"><o:p></o:p></SPAN></P><P class=MsoNormal style="MARGIN: 2.4pt 0in; TEXT-INDENT: 0in; mso-list: l2 level1 lfo2; tab-stops: list .25in"><SPAN style="FONT-SIZE: 10pt; COLOR: #333333; FONT-FAMILY: \'Arial\',\'sans-serif\'; mso-fareast-font-family: Arial"><SPAN style="mso-list: Ignore">A.<SPAN style="FONT: 7pt \'Times New Roman\'">&nbsp;&nbsp;&nbsp; </SPAN></SPAN></SPAN><SPAN style="FONT-SIZE: 10pt; COLOR: #333333; FONT-FAMILY: \'Arial\',\'sans-serif\'"><A href="javascript:;">Business Solutions - Business Review</A><o:p></o:p></SPAN></P><P class=MsoNormal style="MARGIN: 2.4pt 0in; TEXT-INDENT: 0in; mso-list: l2 level1 lfo2; tab-stops: list .25in"><SPAN style="FONT-SIZE: 10pt; COLOR: #333333; FONT-FAMILY: \'Arial\',\'sans-serif\'; mso-fareast-font-family: Arial"><SPAN style="mso-list: Ignore">B.<SPAN style="FONT: 7pt \'Times New Roman\'">&nbsp;&nbsp;&nbsp; </SPAN></SPAN></SPAN><SPAN style="FONT-SIZE: 10pt; COLOR: #333333; FONT-FAMILY: \'Arial\',\'sans-serif\'"><A href="javascript:;">Application Inventory</A><o:p></o:p></SPAN></P><P class=MsoNormal><o:p>&nbsp;</o:p></P>'});


    var content = $j("<div></div>").append(ed.getContent());

    ok($j(content).children(":nth(0)").is("p"), "first node is paragraph");
    equals($j(content).find("p:first strong u span").length, 1, "the title is bold");
    equals($j(content).find("p:first strong u span").text(), "Agenda for May 31, 2010:", "there are two list items");
    equals($j(content).find("p:first").attr("align"), "center", "title is centered");
    ok(has(content, "p:first strong u span", "style", "font-family"), "font family information was saved");
    ok(has(content, "p:first strong u span", "style", "Arial"), "font family information was saved");
    ok(has(content, "p:first strong u span", "style", "sans-serif"), "font family information was saved");
    ok(has(content, "p:first strong u span", "style", "color"), "color information was saved");
    ok(has(content, "p:first strong u span", "style", ["#333333", "rgb(51, 51, 51)"]), "color information was saved");
    ok(!has(content, "p:first strong u span", "style", "font-size"),
            "no font size information available for the title");


    ok($j(content).children(":nth(1)").is("p"), "second node is paragraph");
    equals($j(content).find("p:nth(1) strong u span").length, 1, "the sub title is bold");
    equals($j(content).find("p:nth(1) strong u span").text(), "Completed Activities:", "text is correct");
    equals($j(content).find("p:nth(1)").prop("align"), "", "sub title is not centered");
    ok(has(content, "p:nth(1) strong u span", "style", "font-family"), "font family information was saved");
    ok(has(content, "p:nth(1) strong u span", "style", "Arial"), "font family information was saved");
    ok(has(content, "p:nth(1) strong u span", "style", "sans-serif"), "font family information was saved");
    ok(has(content, "p:nth(1) strong u span", "style", "color"), "color information was saved");
    ok(has(content, "p:nth(1) strong u span", "style", ["#333333", "rgb(51, 51, 51)"]), "color information was saved");
    ok(has(content, "p:nth(1) strong u span", "style", "font-size"),
            "no font size information available for the title");
    ok(has(content, "p:nth(1) strong u span", "style", "10pt"), "font size information was saved");

        ok($j(content).children(":nth(2)").is("ol"), "third node is an ol");
        equals($j(content).find("ol:first li:nth(0) span").text(), "PS Maintenance Renewal Business Case",
                "text is correct");
        ok(has(content, "ol:first li:nth(0) span", "style", "font-size"), "font size information was saved");
        ok(has(content, "ol:first li:nth(0) span", "style", "10pt"), "font size information was saved");
        ok(has(content, "ol:first li:nth(0) span", "style", "font-family"), "font family information was saved");
        ok(has(content, "ol:first li:nth(0) span", "style", "Arial"), "font family information was saved");
        ok(has(content, "ol:first li:nth(0) span", "style", "sans-serif"), "font family information was saved");
        ok(has(content, "ol:first li:nth(0) span", "style", "color"), "color information was saved");
        ok(has(content, "ol:first li:nth(0) span", "style", ["#333333", "rgb(51, 51, 51)"]),
                "color information was saved");

        equals($j(content).find("ol:first li:nth(1) span").text(), "CorpWeb status meeting and minutes",
                "text is correct");
        ok(has(content, "ol:first li:nth(1) span", "style", "font-size"), "font size information was saved");
        ok(has(content, "ol:first li:nth(1) span", "style", "10pt"), "font size information was saved");
        ok(has(content, "ol:first li:nth(1) span", "style", "font-family"), "font family information was saved");
        ok(has(content, "ol:first li:nth(1) span", "style", "Arial"), "font family information was saved");
        ok(has(content, "ol:first li:nth(1) span", "style", "sans-serif"), "font family information was saved");
        ok(has(content, "ol:first li:nth(1) span", "style", "color"), "color information was saved");
        ok(has(content, "ol:first li:nth(1) span", "style", ["#333333", "rgb(51, 51, 51)"]),
                "color information was saved");

        equals($j(content).find("ol:first li:nth(2) span").text(), "Special OpRef and Ticket Assignment meeting ",
                "text is correct");
        ok(has(content, "ol:first li:nth(2) span", "style", "font-size"), "font size information was saved");
        ok(has(content, "ol:first li:nth(2) span", "style", "10pt"), "font size information was saved");
        ok(has(content, "ol:first li:nth(2) span", "style", "font-family"), "font family information was saved");
        ok(has(content, "ol:first li:nth(2) span", "style", "Arial"), "font family information was saved");
        ok(has(content, "ol:first li:nth(2) span", "style", "sans-serif"), "font family information was saved");
        ok(has(content, "ol:first li:nth(2) span", "style", "color"), "color information was saved");
        ok(has(content, "ol:first li:nth(2) span", "style", ["#333333", "rgb(51, 51, 51)"]),
                "color information was saved");


        equals($j(content).find("ol:first li:nth(3) span").text(),
                "ATD-CorpWeb keywords, faster/better cross-team reassignments", "text is correct");
        ok(has(content, "ol:first li:nth(3) span", "style", "font-size"), "font size information was saved");
        ok(has(content, "ol:first li:nth(3) span", "style", "10pt"), "font size information was saved");
        ok(has(content, "ol:first li:nth(3) span", "style", "font-family"), "font family information was saved");
        ok(has(content, "ol:first li:nth(3) span", "style", "Arial"), "font family information was saved");
        ok(has(content, "ol:first li:nth(3) span", "style", "sans-serif"), "font family information was saved");
        ok(has(content, "ol:first li:nth(3) span", "style", "color"), "color information was saved");
        ok(has(content, "ol:first li:nth(3) span", "style", ["#333333", "rgb(51, 51, 51)"]),
                "color information was saved");

        equals($j(content).find("ol:first li:nth(3) span").length, 1, "font information was saved");
        ok(!has(content, "ol:first li:nth(3) span", "style", "font-weight"), "font-weight information was taken out");
        equals($j(content).find("ol:first li:nth(3) strong span").length, 0, "the strong tag was taken out");

        equals($j(content).find("ol:first li:nth(4)").length, 0, "there are only 4 list items in the first list");

    ok($j(content).children(":nth(3)").is("p"), "fourth node is paragraph");
    equals($j(content).find("p:nth(2) strong u span").length, 1, "the sub title is bold");
    equals($j(content).find("p:nth(2) strong u span").text(), "New/Ongoing Activities", "text is correct");
    equals($j(content).find("p:nth(2)").prop("align"), "", "sub title is not centered");
    ok(has(content, "p:nth(2) strong u span", "style", "font-family"), "font family information was saved");
    ok(has(content, "p:nth(2) strong u span", "style", "Arial"), "font family information was saved");
    ok(has(content, "p:nth(2) strong u span", "style", "sans-serif"), "font family information was saved");
    ok(has(content, "p:nth(2) strong u span", "style", "color"), "color information was saved");
    ok(has(content, "p:nth(2) strong u span", "style", ["#333333", "rgb(51, 51, 51)"]), "color information was saved");
    ok(has(content, "p:nth(2) strong u span", "style", "font-size"),
            "no font size information available for the title");
    ok(has(content, "p:nth(2) strong u span", "style", "10pt"), "font size information was saved");

        ok($j(content).children(":nth(2)").is("ol"), "fifth node is an ol");
        // ie trims whitespace in textnodes :(
        // teh .trim() is to let us test once even though ff and safari have a leading space as they should
        equals($j.trim($j(content).find("ol:nth(1) li:nth(0) span").text()),
                "Education Plans (and Operating Waterfall): Office, Element K, Forms, DW/Jive/Lagan conferences, Element K expansion",
                "text is correct");
        ok(has(content, "ol:nth(1) li:nth(0) span", "style", "font-size"), "font size information was saved");
        ok(has(content, "ol:nth(1) li:nth(0) span", "style", "10pt"), "font size information was saved");
        ok(has(content, "ol:nth(1) li:nth(0) span", "style", "font-family"), "font family information was saved");
        ok(has(content, "ol:nth(1) li:nth(0) span", "style", "Arial"), "font family information was saved");
        ok(has(content, "ol:nth(1) li:nth(0) span", "style", "sans-serif"), "font family information was saved");
        ok(has(content, "ol:nth(1) li:nth(0) span", "style", "color"), "color information was saved");
        ok(has(content, "ol:nth(1) li:nth(0) span", "style", ["#333333", "rgb(51, 51, 51)"]),
                "color information was saved");

        equals($j(content).find("ol:nth(1) li:nth(1) span").text(),
                "MSDN licenses: upgrades, Courtyard discussion, Quickstart feedbackupgrades, Courtyard discussion, Quickstart feedback",
                "text is correct");
        ok(has(content, "ol:nth(1) li:nth(1) span", "style", "font-size"), "font size information was saved");
        ok(has(content, "ol:nth(1) li:nth(1) span", "style", "10pt"), "font size information was saved");
        ok(has(content, "ol:nth(1) li:nth(1) span", "style", "font-family"), "font family information was saved");
        ok(has(content, "ol:nth(1) li:nth(1) span", "style", "Arial"), "font family information was saved");
        ok(has(content, "ol:nth(1) li:nth(1) span", "style", "sans-serif"), "font family information was saved");
        ok(has(content, "ol:nth(1) li:nth(1) span", "style", "color"), "color information was saved");
        ok(has(content, "ol:nth(1) li:nth(1) span", "style", ["#333333", "rgb(51, 51, 51)"]),
                "color information was saved");
        equals($j(content).find("ol:nth(1) li:nth(1) strong").length, 1, "only 1 bold item");
        equals($j(content).find("ol:nth(1) li:nth(1) strong").text(), " Quickstart feedback", "only 1 bold item");

        equals($j(content).find("ol:nth(1) li:nth(2)").length, 0, "there are only 2 list items in the second list");


    ok($j(content).children(":nth(5)").is("p"), "sixth node is paragraph");
    equals($j(content).find("p:nth(3) strong u span").length, 1, "the sub title is bold");
    equals($j(content).find("p:nth(3) strong u span").text(), "Future Activities", "text is correct");
    equals($j(content).find("p:nth(3)").prop("align"), "", "sub title is not centered");
    ok(has(content, "p:nth(3) strong u span", "style", "font-family"), "font family information was saved");
    ok(has(content, "p:nth(3) strong u span", "style", "Arial"), "font family information was saved");
    ok(has(content, "p:nth(3) strong u span", "style", "sans-serif"), "font family information was saved");
    ok(has(content, "p:nth(3) strong u span", "style", "color"), "color information was saved");
    ok(has(content, "p:nth(3) strong u span", "style", ["#333333", "rgb(51, 51, 51)"]), "color information was saved");
    ok(has(content, "p:nth(3) strong u span", "style", "font-size"),
            "no font size information available for the title");
    ok(has(content, "p:nth(3) strong u span", "style", "10pt"), "font size information was saved");

    ok($j(content).children(":nth(6)").is("p"), "seventh node is paragraph");
    equals($j(content).find("p:nth(4) strong u span").text(), "", "text is correct");

    ok($j(content).children(":nth(7)").is("p"), "eighth node is paragraph");
    equals($j(content).find("p:nth(5) strong u span").length, 1, "the sub title is bold");
    equals($j(content).find("p:nth(5) strong u span").text(), "Reference:", "text is correct");
    equals($j(content).find("p:nth(5)").prop("align"), "", "sub title is not centered");
    ok(has(content, "p:nth(5) strong u span", "style", "font-family"), "font family information was saved");
    ok(has(content, "p:nth(5) strong u span", "style", "Arial"), "font family information was saved");
    ok(has(content, "p:nth(5) strong u span", "style", "sans-serif"), "font family information was saved");
    ok(has(content, "p:nth(5) strong u span", "style", "color"), "color information was saved");
    ok(has(content, "p:nth(5) strong u span", "style", ["#333333", "rgb(51, 51, 51)"]), "color information was saved");
    ok(has(content, "p:nth(5) strong u span", "style", "font-size"),
            "no font size information available for the title");
    ok(has(content, "p:nth(5) strong u span", "style", "10pt"), "font size information was saved");

        ok($j(content).children(":nth(8)").is("ol"), "ninth node is an ol");
        equals($j(content).find("ol:nth(2) li:nth(0) span").text(), "Business Solutions - Business Review",
                "text is correct");
        ok(has(content, "ol:nth(2) li:nth(0) span", "style", "font-size"), "font size information was saved");
        ok(has(content, "ol:nth(2) li:nth(0) span", "style", "10pt"), "font size information was saved");
        ok(has(content, "ol:nth(2) li:nth(0) span", "style", "font-family"), "font family information was saved");
        ok(has(content, "ol:nth(2) li:nth(0) span", "style", "Arial"), "font family information was saved");
        ok(has(content, "ol:nth(2) li:nth(0) span", "style", "sans-serif"), "font family information was saved");
        ok(has(content, "ol:nth(2) li:nth(0) span", "style", "color"), "color information was saved");
        ok(has(content, "ol:nth(2) li:nth(0) span", "style", ["#333333", "rgb(51, 51, 51)"]),
                "color information was saved");

        equals($j(content).find("ol:nth(2) li:nth(1) span").text(), "Application Inventory", "text is correct");
        ok(has(content, "ol:nth(2) li:nth(1) span", "style", "font-size"), "font size information was saved");
        ok(has(content, "ol:nth(2) li:nth(1) span", "style", "10pt"), "font size information was saved");
        ok(has(content, "ol:nth(2) li:nth(1) span", "style", "font-family"), "font family information was saved");
        ok(has(content, "ol:nth(2) li:nth(1) span", "style", "Arial"), "font family information was saved");
        ok(has(content, "ol:nth(2) li:nth(1) span", "style", "sans-serif"), "font family information was saved");
        ok(has(content, "ol:nth(2) li:nth(1) span", "style", "color"), "color information was saved");
        ok(has(content, "ol:nth(2) li:nth(1) span", "style", ["#333333", "rgb(51, 51, 51)"]),
                "color information was saved");
        equals($j(content).find("ol:nth(2) li:nth(1) strong").length, 0, "zero bold items");

        equals($j(content).find("ol:nth(1) li:nth(2)").length, 0, "there are only 2 list items in the second list");

//    equals(ed.getContent().replace(/[\r\n]+/g, ''), '');
});





test("Paste list from Word single ordered list bullet", function() {
	var rng = ed.dom.createRng();

	ed.setContent('<p>1234</p>');
	rng.setStart(ed.getBody().firstChild.firstChild, 0);
	rng.setEnd(ed.getBody().firstChild.firstChild, 4);
	ed.selection.setRng(rng);

	ed.execCommand('mceInsertClipboardContent', false, {content : '<P class=MsoNormal style="MARGIN: 2.4pt 0in; TEXT-INDENT: 0in; mso-list: l2 level1 lfo2; tab-stops: list .25in"><SPAN style="FONT-SIZE: 10pt; COLOR: #333333; FONT-FAMILY: \'Arial\',\'sans-serif\'; mso-fareast-font-family: Arial"><SPAN style="mso-list: Ignore">B.<SPAN style="FONT: 7pt \'Times New Roman\'">&nbsp;&nbsp;&nbsp; </SPAN></SPAN></SPAN><SPAN style="FONT-SIZE: 10pt; COLOR: #333333; FONT-FAMILY: \'Arial\',\'sans-serif\'"><A href="javascript:;">Application Inventory</A><o:p></o:p></SPAN></P>'});

    var content = $j("<div></div>").append(ed.getContent());

    equals($j(content).find("ol").length, 1, "there is one list");
    equals($j(content).find("ol li").length, 1, "there is one list item");
    equals($j(content).find("ol li span").length, 1, "font information was saved");
    equals($j(content).find("ol li span a").length, 1, "link information was saved");
    ok(has(content, "ol li span", "style", "font-family"), "font family information was saved");
    ok(has(content, "ol li span", "style", "Arial"), "font family information was saved");
    ok(has(content, "ol li span", "style", "sans-serif"), "font family information was saved");
    ok(has(content, "ol li span", "style", "font-size"), "font size information was saved");
    ok(has(content, "ol li span", "style", "10pt"), "font size information was saved");
    ok(has(content, "ol li span", "style", "color"), "color information was saved");
    ok(has(content, "ol li span", "style", ["#333333", "rgb(51, 51, 51)"]), "color information was saved");
    ok(has(content, "ol li span a", "href", "javascript:;"), "link URL was saved");
    equals($j(content).find("ol li span a").text(), "Application Inventory", "correct text for first bullet");

//    console.log(ed.getContent().replace(/[\r\n]+/g, ''));
});

/**
 * to reproduce in Word, insert a bullet list with non standard bullet
 * like a checkmark or fancy icon or something
 */
test("Paste fancy bullet character list from Word", function() {
	var rng = ed.dom.createRng();

	ed.setContent('<p>1234</p>');
	rng.setStart(ed.getBody().firstChild.firstChild, 0);
	rng.setEnd(ed.getBody().firstChild.firstChild, 4);
	ed.selection.setRng(rng);

	ed.execCommand('mceInsertClipboardContent', false, {content : '&nbsp;<P class=MsoListParagraphCxSpFirst style="TEXT-INDENT: -0.25in; mso-list: l0 level1 lfo1"><SPAN style="FONT-FAMILY: Wingdings; mso-fareast-font-family: Wingdings; mso-bidi-font-family: Wingdings"><SPAN style="mso-list: Ignore">�<SPAN style="FONT: 7pt \'Times New Roman\'">&nbsp; </SPAN></SPAN></SPAN>Fancy bullet</P><P class=MsoListParagraphCxSpMiddle style="TEXT-INDENT: -0.25in; mso-list: l0 level1 lfo1"><SPAN style="FONT-FAMILY: Wingdings; mso-fareast-font-family: Wingdings; mso-bidi-font-family: Wingdings"><SPAN style="mso-list: Ignore">�<SPAN style="FONT: 7pt \'Times New Roman\'">&nbsp; </SPAN></SPAN></SPAN>Asdf</P><P class=MsoListParagraphCxSpLast style="TEXT-INDENT: -0.25in; mso-list: l0 level1 lfo1"><SPAN style="FONT-FAMILY: Wingdings; mso-fareast-font-family: Wingdings; mso-bidi-font-family: Wingdings"><SPAN style="mso-list: Ignore">�<SPAN style="FONT: 7pt \'Times New Roman\'">&nbsp; </SPAN></SPAN></SPAN>qwer</P>'});
    equals(ed.getContent().replace(/[\r\n]+/g, ''), '<ul style=\"list-style-type: disc;\"><li>Fancy bullet</li><li>Asdf</li><li>qwer</li></ul>');
});

/**
 * to reproduce in Word, insert a normal bullet list
 */
test("Paste normal bullet list from Word", function() {
	var rng = ed.dom.createRng();

	ed.setContent('<p>1234</p>');
	rng.setStart(ed.getBody().firstChild.firstChild, 0);
	rng.setEnd(ed.getBody().firstChild.firstChild, 4);
	ed.selection.setRng(rng);

	ed.execCommand('mceInsertClipboardContent', false, {content : '&nbsp;<P class=MsoListParagraphCxSpFirst style="TEXT-INDENT: -0.25in; mso-list: l0 level1 lfo1"><SPAN style="FONT-FAMILY: Symbol; mso-fareast-font-family: Symbol; mso-bidi-font-family: Symbol"><SPAN style="mso-list: Ignore">�<SPAN style="FONT: 7pt \'Times New Roman\'">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </SPAN></SPAN></SPAN>Regular</P><P class=MsoListParagraphCxSpLast style="TEXT-INDENT: -0.25in; mso-list: l0 level1 lfo1"><SPAN style="FONT-FAMILY: Symbol; mso-fareast-font-family: Symbol; mso-bidi-font-family: Symbol"><SPAN style="mso-list: Ignore">�<SPAN style="FONT: 7pt \'Times New Roman\'">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </SPAN></SPAN></SPAN>bullet</P>'});
    equals(ed.getContent().replace(/[\r\n]+/g, ''), '<ul style=\"list-style-type: disc;\"><li>Regular</li><li>bullet</li></ul>');
});

/**
 * to reproduce in Word, insert a normal number list
 */
test("Paste normal number list from Word", function() {
	var rng = ed.dom.createRng();

	ed.setContent('<p>1234</p>');
	rng.setStart(ed.getBody().firstChild.firstChild, 0);
	rng.setEnd(ed.getBody().firstChild.firstChild, 4);
	ed.selection.setRng(rng);

	ed.execCommand('mceInsertClipboardContent', false, {content : '&nbsp;<P class=MsoListParagraphCxSpFirst style="TEXT-INDENT: -0.25in; mso-list: l0 level1 lfo1"><SPAN style="mso-bidi-font-family: Calibri; mso-bidi-theme-font: minor-latin"><SPAN style="mso-list: Ignore">1.<SPAN style="FONT: 7pt \'Times New Roman\'">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </SPAN></SPAN></SPAN>Regular</P><P class=MsoListParagraphCxSpLast style="TEXT-INDENT: -0.25in; mso-list: l0 level1 lfo1"><SPAN style="mso-bidi-font-family: Calibri; mso-bidi-theme-font: minor-latin"><SPAN style="mso-list: Ignore">2.<SPAN style="FONT: 7pt \'Times New Roman\'">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </SPAN></SPAN></SPAN>bullet</P>'});

    var content = $j("<div></div>").append(ed.getContent());

    equals($j(content).find("ol").length, 1, "there is one list");
    equals($j(content).find("ol li").length, 2, "there are two list items");
    equals($j(content).find("ol li span").length, 0, "there is no font info");
    equals($j(content).find("ol li:first").text(), "Regular", "correct text for first bullet");
    equals($j(content).find("ol li:last").text(), "bullet", "correct text for second bullet");

//    equals(ed.getContent().replace(/[\r\n]+/g, ''), '<ol><li>Regular</li><li>bullet</li></ol>');
});

/**
 * to reproduce in Word, download the .doc from CS-23855
 * bullets B -> C have this behavior in the first list
 */
test("Paste bullets in adjacent 'lists' should unify into 1 list and not nest", function() {
	var rng = ed.dom.createRng();

	ed.setContent('<p>1234</p>');
	rng.setStart(ed.getBody().firstChild.firstChild, 0);
	rng.setEnd(ed.getBody().firstChild.firstChild, 4);
	ed.selection.setRng(rng);

	ed.execCommand('mceInsertClipboardContent', false, {content : '&nbsp;' +
'<P class=MsoNormal style="MARGIN: 2.4pt 0in; TEXT-INDENT: 0in; mso-list: l0 level1 lfo1; tab-stops: list .25in"><SPAN style="FONT-SIZE: 10pt; COLOR: #333333; FONT-FAMILY: \'Arial\',\'sans-serif\'; mso-fareast-font-family: Arial"><SPAN style="mso-list: Ignore">A.<SPAN style="FONT: 7pt \'Times New Roman\'">&nbsp;&nbsp;&nbsp; </SPAN></SPAN></SPAN><SPAN style="FONT-SIZE: 10pt; COLOR: #333333; FONT-FAMILY: \'Arial\',\'sans-serif\'">CorpWeb status meeting and minutes<?xml:namespace prefix = o ns = "urn:schemas-microsoft-com:office:office" /><o:p></o:p></SPAN></P>' +
'<P class=MsoNormal style="MARGIN: 2.4pt 0in 2.4pt 0.25in; TEXT-INDENT: -0.25in; mso-list: l0 level1 lfo1; tab-stops: list .25in"><SPAN style="FONT-SIZE: 10pt; COLOR: #333333; FONT-FAMILY: \'Arial\',\'sans-serif\'; mso-fareast-font-family: Arial"><SPAN style="mso-list: Ignore">B.<SPAN style="FONT: 7pt \'Times New Roman\'">&nbsp;&nbsp;&nbsp; </SPAN></SPAN></SPAN><SPAN style="FONT-SIZE: 10pt; COLOR: #333333; FONT-FAMILY: \'Arial\',\'sans-serif\'">Special OpRef and Ticket Assignment meeting<o:p></o:p></SPAN></P>'});

    var content = $j("<div></div>").append(ed.getContent());

    equals($j(content).find("ol").length, 1, "there is one lists");
    equals($j(content).find("ol li").length, 2, "there are two list items");
    equals($j(content).find("ol li span").length, 2, "font information was saved");
    ok(has(content, "ol li span", "style", "font-family"), "font family information was saved");
    ok(has(content, "ol li span", "style", "Arial"), "font family information was saved");
    ok(has(content, "ol li span", "style", "sans-serif"), "font family information was saved");
    ok(has(content, "ol li span", "style", "font-size"), "font size information was saved");
    ok(has(content, "ol li span", "style", "10pt"), "font size information was saved");
    ok(has(content, "ol li span", "style", "color"), "color information was saved");
    ok(has(content, "ol li span", "style", ["#333333", "rgb(51, 51, 51)"]), "color information was saved");
    equals($j(content).find("ol li:first span").text(), "CorpWeb status meeting and minutes",
            "correct text for first bullet");
    equals($j(content).find("ol li:last span").text(), "Special OpRef and Ticket Assignment meeting",
            "correct text for last bullet");

//    equals(ed.getContent().replace(/[\r\n]+/g, ''), '<ol><li><span style=\"color: #333333; font-family: \'Arial\',\'sans-serif\'; font-size: 10pt;\">CorpWeb status meeting and minutes</span></li><li><span style=\"color: #333333; font-family: \'Arial\',\'sans-serif\'; font-size: 10pt;\">Special OpRef and Ticket Assignment meeting</span></li></ol>');
});


/**
 * to reproduce in Word, download the .doc from CS-23855
 * indent bullet C in the first list,
 * then copy paste bullets B->C
 */
test("Paste nested bullet point 1", function() {
	var rng = ed.dom.createRng();

	ed.setContent('<p>1234</p>');
	rng.setStart(ed.getBody().firstChild.firstChild, 0);
	rng.setEnd(ed.getBody().firstChild.firstChild, 4);
	ed.selection.setRng(rng);

	ed.execCommand('mceInsertClipboardContent', false, {content : '&nbsp;' +
'<P class=MsoNormal style="MARGIN: 2.4pt 0in; TEXT-INDENT: 0in; mso-list: l0 level1 lfo1; tab-stops: list .25in"><SPAN style="FONT-SIZE: 10pt; COLOR: #333333; FONT-FAMILY: \'Arial\',\'sans-serif\'; mso-fareast-font-family: Arial"><SPAN style="mso-list: Ignore">A.<SPAN style="FONT: 7pt \'Times New Roman\'">&nbsp;&nbsp;&nbsp; </SPAN></SPAN></SPAN><SPAN style="FONT-SIZE: 10pt; COLOR: #333333; FONT-FAMILY: \'Arial\',\'sans-serif\'">CorpWeb status meeting and minutes<?xml:namespace prefix = o ns = "urn:schemas-microsoft-com:office:office" /><o:p></o:p></SPAN></P>' +
'<P class=MsoNormal style="MARGIN: 2.4pt 0in 2.4pt 1in; TEXT-INDENT: -0.25in; mso-list: l0 level2 lfo1; tab-stops: list 1.0in"><SPAN style="FONT-SIZE: 10pt; COLOR: #333333; FONT-FAMILY: \'Arial\',\'sans-serif\'; mso-fareast-font-family: Arial"><SPAN style="mso-list: Ignore">A.<SPAN style="FONT: 7pt \'Times New Roman\'">&nbsp;&nbsp;&nbsp; </SPAN></SPAN></SPAN><SPAN style="FONT-SIZE: 10pt; COLOR: #333333; FONT-FAMILY: \'Arial\',\'sans-serif\'">Special OpRef and Ticket Assignment meeting<o:p></o:p></SPAN></P>'});

    var content = $j("<div></div>").append(ed.getContent());

    equals($j(content).find("ol").length, 2, "there are two lists");
    equals($j(content).find("ol ol").length, 1, "one list is nested in the other");
    equals($j(content).find("ol li").length, 2, "there are two list items");
    equals($j(content).find("ol ol li").length, 1, "one list item is in the nested list");
    equals($j(content).find("ol li span").length, 2, "font information was saved");
    ok(has(content, "ol li span", "style", "font-family"), "font family information was saved");
    ok(has(content, "ol li span", "style", "Arial"), "font family information was saved");
    ok(has(content, "ol li span", "style", "sans-serif"), "font family information was saved");
    ok(has(content, "ol li span", "style", "font-size"), "font size information was saved");
    ok(has(content, "ol li span", "style", "10pt"), "font size information was saved");
    ok(has(content, "ol li span", "style", "color"), "color information was saved");
    ok(has(content, "ol li span", "style", ["#333333", "rgb(51, 51, 51)"]), "color information was saved");
    equals($j(content).find("ol li:first span").text(), "CorpWeb status meeting and minutes",
            "correct text for first bullet");
    equals($j(content).find("ol ol li span").text(), "Special OpRef and Ticket Assignment meeting",
            "correct text for last bullet");

//    console.log(ed.getContent().replace(/[\r\n]+/g, ''));
});




/**
 * to reproduce in Word, download the .doc from CS-23855
 * indent bullet C in the first list,
 * then copy paste bullets B->C
 */
test("Paste nested bullet point 2", function() {
	var rng = ed.dom.createRng();

	ed.setContent('<p>1234</p>');
	rng.setStart(ed.getBody().firstChild.firstChild, 0);
	rng.setEnd(ed.getBody().firstChild.firstChild, 4);
	ed.selection.setRng(rng);

	ed.execCommand('mceInsertClipboardContent', false, {content : '&nbsp;' +
'<P style="MARGIN-LEFT: 0.5in; TEXT-INDENT: -0.25in; mso-list: l0 level1 lfo1"><STRONG><SPAN style="FONT-WEIGHT: normal; FONT-SIZE: 10pt; COLOR: #333333; FONT-FAMILY: Symbol; mso-fareast-font-family: Symbol; mso-bidi-font-weight: bold; mso-bidi-font-family: Symbol"><SPAN style="mso-list: Ignore"><SPAN style="FONT: 7pt \'Times New Roman\'">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </SPAN></SPAN></SPAN></STRONG><STRONG><SPAN style="FONT-WEIGHT: normal; FONT-SIZE: 10pt; COLOR: #333333; FONT-FAMILY: \'Arial\',\'sans-serif\'; mso-bidi-font-weight: bold">Top level<?xml:namespace prefix = o ns = "urn:schemas-microsoft-com:office:office" /><o:p></o:p></SPAN></STRONG></P>' +
'<P style="MARGIN-LEFT: 1in; TEXT-INDENT: -0.25in; mso-list: l0 level2 lfo1"><STRONG><SPAN style="FONT-WEIGHT: normal; FONT-SIZE: 10pt; COLOR: #333333; FONT-FAMILY: \'Courier New\'; mso-fareast-font-family: \'Courier New\'; mso-bidi-font-weight: bold"><SPAN style="mso-list: Ignore">o<SPAN style="FONT: 7pt \'Times New Roman\'">&nbsp;&nbsp;&nbsp; </SPAN></SPAN></SPAN></STRONG><STRONG><SPAN style="FONT-WEIGHT: normal; FONT-SIZE: 10pt; COLOR: #333333; FONT-FAMILY: \'Arial\',\'sans-serif\'; mso-bidi-font-weight: bold">2<SUP>nd</SUP> level<o:p></o:p></SPAN></STRONG></P>'});

    var content = $j("<div></div>").append(ed.getContent());

    equals($j(content).find("ul").length, 2, "there are two lists");
    equals($j(content).find("ul ul").length, 1, "one list is nested in the other");
    equals($j(content).find("ul li").length, 2, "there are two list items");
    equals($j(content).find("ul ul li").length, 1, "one list item is in the nested list");
    equals($j(content).find("ul li span").length, 2, "font information was saved");
    equals($j(content).find("ul li strong span").length, 1, "font information was saved");
    equals($j(content).find("ul li strong span sup").length, 1, "supertext was saved");
    ok(has(content, "ul li:first span", "style", "font-family"), "font family information was saved");
    ok(has(content, "ul li:first span", "style", "Arial"), "font family information was saved");
    ok(has(content, "ul li:first span", "style", "sans-serif"), "font family information was saved");
    ok(has(content, "ul li:first span", "style", "font-size"), "font size information was saved");
    ok(has(content, "ul li:first span", "style", "10pt"), "font size information was saved");
    ok(has(content, "ul li:first span", "style", "color"), "color information was saved");
    ok(has(content, "ul li:first span", "style", ["#333333", "rgb(51, 51, 51)"]), "color information was saved");
    ok(!has(content, "ul li:first span", "style", "font-weight"), "font weight information was saved");
    ok(!has(content, "ul li:first span", "style", "normal"), "font weight information was saved");

    ok(has(content, "ul li strong span", "style", "font-family"), "font family information was saved");
    ok(has(content, "ul li strong span", "style", "Arial"), "font family information was saved");
    ok(has(content, "ul li strong span", "style", "sans-serif"), "font family information was saved");
    ok(has(content, "ul li strong span", "style", "font-size"), "font size information was saved");
    ok(has(content, "ul li strong span", "style", "10pt"), "font size information was saved");
    ok(has(content, "ul li strong span", "style", "color"), "color information was saved");
    ok(has(content, "ul li strong span", "style", ["#333333", "rgb(51, 51, 51)"]), "color information was saved");
    ok(has(content, "ul li strong span", "style", "font-weight"), "font weight information was saved");
    ok(has(content, "ul li strong span", "style", "normal"), "font weight information was saved");
    equals($j(content).find("ul li:first span").text(), "Top level", "correct text for first bullet");
    equals($j(content).find("ul ul li strong span").text(), "2nd level", "correct text for last bullet");

//    console.log(ed.getContent().replace(/[\r\n]+/g, ''));
});

/**
 * to reproduce in Word, insert a custom bulleted list
 * and choose an image as the bullet. don't use one of the
 * default bullet types
 */
test("Paste bullet list with custom images", function() {
	var rng = ed.dom.createRng();

	ed.setContent('<p>1234</p>');
	rng.setStart(ed.getBody().firstChild.firstChild, 0);
	rng.setEnd(ed.getBody().firstChild.firstChild, 4);
	ed.selection.setRng(rng);

	ed.execCommand('mceInsertClipboardContent', false, {content : '&nbsp;' +
'<P class=MsoListParagraphCxSpFirst style="TEXT-INDENT: -0.25in; mso-list: l0 level1 lfo1"><SPAN style="FONT-FAMILY: Symbol; mso-fareast-font-family: Symbol; mso-bidi-font-family: Symbol"><SPAN style="mso-list: Ignore"><IMG height=12 alt=* src="file:///C:/DOCUME~1/jive/LOCALS~1/Temp/msohtmlclip1/01/clip_image001.gif" width=11><SPAN style="FONT: 7pt \'Times New Roman\'">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </SPAN></SPAN></SPAN>Yayzy</P>' +
'<P class=MsoListParagraphCxSpLast style="TEXT-INDENT: -0.25in; mso-list: l0 level1 lfo1"><SPAN style="FONT-FAMILY: Symbol; mso-fareast-font-family: Symbol; mso-bidi-font-family: Symbol"><SPAN style="mso-list: Ignore"><IMG height=12 alt=* src="file:///C:/DOCUME~1/jive/LOCALS~1/Temp/msohtmlclip1/01/clip_image001.gif" width=11><SPAN style="FONT: 7pt \'Times New Roman\'">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </SPAN></SPAN></SPAN>Awesome</P>'});

    equals(ed.getContent().replace(/[\r\n]+/g, ''), "<ul style=\"list-style-type: disc;\"><li>Yayzy</li><li>Awesome</li></ul>", "correct HTML")
});


test("Paste nested list level 1", function() {
	var rng = ed.dom.createRng();

	ed.setContent('<p>1234</p>');
	rng.setStart(ed.getBody().firstChild.firstChild, 0);
	rng.setEnd(ed.getBody().firstChild.firstChild, 4);
	ed.selection.setRng(rng);

	ed.execCommand('mceInsertClipboardContent', false, {content : '&nbsp;' +
'<P class=MsoListParagraphCxSpFirst style="MARGIN-LEFT: 0.25in; TEXT-INDENT: -0.25in; mso-add-space: auto; mso-list: l0 level1 lfo1"><SPAN style="mso-bidi-font-family: Calibri; mso-bidi-theme-font: minor-latin"><SPAN style="mso-list: Ignore">1)<SPAN style="FONT: 7pt \'Times New Roman\'">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </SPAN></SPAN></SPAN>This is the top of the list</P>' +
'<P class=MsoListParagraphCxSpMiddle style="TEXT-INDENT: -0.25in; mso-list: l0 level2 lfo1"><SPAN style="mso-bidi-font-family: Calibri; mso-bidi-theme-font: minor-latin"><SPAN style="mso-list: Ignore">a)<SPAN style="FONT: 7pt \'Times New Roman\'">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </SPAN></SPAN></SPAN>This is row two</P>' +
'<P class=MsoListParagraphCxSpMiddle style="TEXT-INDENT: -0.25in; mso-list: l0 level2 lfo1"><SPAN style="mso-bidi-font-family: Calibri; mso-bidi-theme-font: minor-latin"><SPAN style="mso-list: Ignore">b)<SPAN style="FONT: 7pt \'Times New Roman\'">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </SPAN></SPAN></SPAN>This is row three</P>' +
'<P class=MsoListParagraphCxSpLast style="MARGIN-LEFT: 0.75in; TEXT-INDENT: -0.25in; mso-add-space: auto; mso-list: l0 level3 lfo1"><SPAN style="mso-bidi-font-family: Calibri; mso-bidi-theme-font: minor-latin"><SPAN style="mso-list: Ignore">i)<SPAN style="FONT: 7pt \'Times New Roman\'">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </SPAN></SPAN></SPAN>This is three�s kid</P>'});


    var content = $j("<div></div>").append(ed.getContent());

    ok($j(content).children(":nth(0)").is("ol"), "first node is an ol");
    equals($j(content).find("ol").length, 3, "there are two lists");
    equals($j(content).find("ol ol").length, 2, "one list is nested in the other");
    equals($j(content).find("ol ol ol").length, 1, "one list is nested in the other");
    equals($j(content).find("ol li").children().length, 0, "no kids for the li");
    equals($j(content).find("ol:first li:first").text(), "This is the top of the list", "text is right");
    equals($j(content).find("ol:nth(1) li:first").text(), "This is row two", "text is right");
    equals($j(content).find("ol:nth(1) li:nth(1)").text(), "This is row three", "text is right");
    equals($j(content).find("ol:nth(2) li:first").text(), "This is three�s kid", "text is right");

    equals($j(content).find("ol:first").children().length, 2, "number of kids is right");
    ok($j(content).find("ol:first").children(":nth(0)").is("li"), "kid is an li");
    ok($j(content).find("ol:first").children(":nth(1)").is("ol"), "kid is an ol");

    equals($j(content).find("ol:first ol:first").children().length, 3, "number of kids is right");
    ok($j(content).find("ol:first ol:first").children(":nth(0)").is("li"), "kid is an li");
    ok($j(content).find("ol:first ol:first").children(":nth(1)").is("li"), "kid is an li");
    ok($j(content).find("ol:first ol:first").children(":nth(2)").is("ol"), "kid is an ol");

    equals($j(content).find("ol:first ol:first ol").children().length, 1, "number of kids is right");
    ok($j(content).find("ol:first ol:first ol").children(":nth(0)").is("li"), "kid is an li");
    //    equals(ed.getContent().replace(/[\r\n]+/g, ''), "<ol><li>This is the top of the list</li><ol><li>This is row two</li><li>This is row three</li><ol><li>This is three&rsquo;s kid</li></ol></ol></ol>", "correct HTML")
});


test("Paste nested list level 2", function() {
	var rng = ed.dom.createRng();

	ed.setContent('<p>1234</p>');
	rng.setStart(ed.getBody().firstChild.firstChild, 0);
	rng.setEnd(ed.getBody().firstChild.firstChild, 4);
	ed.selection.setRng(rng);

	ed.execCommand('mceInsertClipboardContent', false, {content : '&nbsp;' +
'<P class=MsoListParagraphCxSpFirst style="TEXT-INDENT: -0.25in; mso-list: l0 level1 lfo1"><SPAN style="FONT-FAMILY: Symbol; mso-bidi-font-family: Symbol; mso-fareast-font-family: Symbol"><SPAN style="mso-list: Ignore">�<SPAN style="FONT: 7pt \'Times New Roman\'">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </SPAN></SPAN></SPAN>Top row</P>' +
'<P class=MsoListParagraphCxSpMiddle style="MARGIN-LEFT: 1in; TEXT-INDENT: -0.25in; mso-add-space: auto; mso-list: l0 level2 lfo1"><SPAN style="FONT-FAMILY: \'Courier New\'; mso-fareast-font-family: \'Courier New\'"><SPAN style="mso-list: Ignore">o<SPAN style="FONT: 7pt \'Times New Roman\'">&nbsp;&nbsp; </SPAN></SPAN></SPAN>First child</P>' +
'<P class=MsoListParagraphCxSpLast style="TEXT-INDENT: -0.25in; mso-list: l0 level1 lfo1"><SPAN style="FONT-FAMILY: Symbol; mso-bidi-font-family: Symbol; mso-fareast-font-family: Symbol"><SPAN style="mso-list: Ignore">�<SPAN style="FONT: 7pt \'Times New Roman\'">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </SPAN></SPAN></SPAN>Second <SPAN style="mso-spacerun: yes">&nbsp;</SPAN>row</P>'});

    //
    // notice the double spaces in the Second row
    // this is also on purpose from the input pasted HTML
    // see: <SPAN style="mso-spacerun: yes"> above
    equals(ed.getContent().replace(/[\r\n]+/g, ''), "<ul style=\"list-style-type: disc;\"><li>Top row</li><ul style=\"list-style-type: circle;\"><li>First child</li></ul><li>Second  row</li></ul>", "correct HTML")
});


test("Paste nested list level 3", function() {
	var rng = ed.dom.createRng();

	ed.setContent('<p>1234</p>');
	rng.setStart(ed.getBody().firstChild.firstChild, 0);
	rng.setEnd(ed.getBody().firstChild.firstChild, 4);
	ed.selection.setRng(rng);

	ed.execCommand('mceInsertClipboardContent', false, {content : '&nbsp;' +
'<P class=MsoListParagraphCxSpFirst style="TEXT-INDENT: -0.25in; mso-list: l0 level1 lfo1"><SPAN style="mso-bidi-font-family: Calibri; mso-bidi-theme-font: minor-latin"><SPAN style="mso-list: Ignore">1.<SPAN style="FONT: 7pt \'Times New Roman\'">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </SPAN></SPAN></SPAN>Numbered list!</P>' +
'<P class=MsoListParagraphCxSpMiddle style="MARGIN-LEFT: 1in; TEXT-INDENT: -0.25in; mso-add-space: auto; mso-list: l0 level2 lfo1"><SPAN style="mso-bidi-font-family: Calibri; mso-bidi-theme-font: minor-latin"><SPAN style="mso-list: Ignore">a.<SPAN style="FONT: 7pt \'Times New Roman\'">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </SPAN></SPAN></SPAN>Child!</P>' +
'<P class=MsoListParagraphCxSpLast style="TEXT-INDENT: -0.25in; mso-list: l0 level1 lfo1"><SPAN style="mso-bidi-font-family: Calibri; mso-bidi-theme-font: minor-latin"><SPAN style="mso-list: Ignore">2.<SPAN style="FONT: 7pt \'Times New Roman\'">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </SPAN></SPAN></SPAN>Top level</P>'});


    var content = $j("<div></div>").append(ed.getContent());

    ok($j(content).children(":nth(0)").is("ol"), "first node is an ol");
    equals($j(content).find("ol").length, 2, "there are two lists");
    equals($j(content).find("ol ol").length, 1, "one list is nested in the other");
    equals($j(content).find("ol li").children().length, 0, "no kids for the li");
    equals($j(content).find("ol:first li:first").text(), "Numbered list!", "text is right");
    equals($j(content).find("ol ol li").text(), "Child!", "text is right");
    equals($j(content).find("ol:first li:last").text(), "Top level", "text is right");
    equals($j(content).find("ol:first").children().length, 3, "number of kids is right");
    ok($j(content).find("ol:first").children(":nth(0)").is("li"), "kid is an li");
    ok($j(content).find("ol:first").children(":nth(1)").is("ol"), "kid is an ol");
    ok($j(content).find("ol:first").children(":nth(2)").is("li"), "kid is an li");

//    equals(ed.getContent().replace(/[\r\n]+/g, ''), "<ol><li>Numbered list!</li><ol><li>Child!</li></ol><li>Top level</li></ol>", "correct HTML")
});


test("Paste nested list level 4", function() {
	var rng = ed.dom.createRng();

	ed.setContent('<p>1234</p>');
	rng.setStart(ed.getBody().firstChild.firstChild, 0);
	rng.setEnd(ed.getBody().firstChild.firstChild, 4);
	ed.selection.setRng(rng);

	ed.execCommand('mceInsertClipboardContent', false, {content : '&nbsp;' +
'<P class=MsoListParagraphCxSpFirst style="MARGIN-LEFT: 0.25in; TEXT-INDENT: -0.25in; mso-add-space: auto; mso-list: l0 level1 lfo1"><SPAN style="mso-bidi-font-family: Calibri; mso-bidi-theme-font: minor-latin"><SPAN style="mso-list: Ignore">1.<SPAN style="FONT: 7pt \'Times New Roman\'">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </SPAN></SPAN></SPAN>Top Level</P>' +
'<P class=MsoListParagraphCxSpMiddle style="MARGIN-LEFT: 0.55in; TEXT-INDENT: -0.3in; mso-add-space: auto; mso-list: l0 level2 lfo1"><SPAN style="mso-bidi-font-family: Calibri; mso-bidi-theme-font: minor-latin"><SPAN style="mso-list: Ignore">1.1.<SPAN style="FONT: 7pt \'Times New Roman\'">&nbsp;&nbsp;&nbsp; </SPAN></SPAN></SPAN>Kid Level</P>' +
'<P class=MsoListParagraphCxSpLast style="MARGIN-LEFT: 0.25in; TEXT-INDENT: -0.25in; mso-add-space: auto; mso-list: l0 level1 lfo1"><SPAN style="mso-bidi-font-family: Calibri; mso-bidi-theme-font: minor-latin"><SPAN style="mso-list: Ignore">2.<SPAN style="FONT: 7pt \'Times New Roman\'">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </SPAN></SPAN></SPAN>Top Level2</P>'});


    var content = $j("<div></div>").append(ed.getContent());

    ok($j(content).children(":nth(0)").is("ol"), "first node is an ol");
    equals($j(content).find("ol").length, 2, "there are two lists");
    equals($j(content).find("ol ol").length, 1, "one list is nested in the other");
    equals($j(content).find("ol li").children().length, 0, "no kids for the li");
    equals($j(content).find("ol:first li:first").text(), "Top Level", "text is right");
    equals($j(content).find("ol ol li").text(), "Kid Level", "text is right");
    equals($j(content).find("ol:first li:last").text(), "Top Level2", "text is right");
    equals($j(content).find("ol:first").children().length, 3, "number of kids is right");
    ok($j(content).find("ol:first").children(":nth(0)").is("li"), "kid is an li");
    ok($j(content).find("ol:first").children(":nth(1)").is("ol"), "kid is an ol");
    ok($j(content).find("ol:first").children(":nth(2)").is("li"), "kid is an li");

//    equals(ed.getContent().replace(/[\r\n]+/g, ''), "<ol><li>Top Level</li><ol><li>Kid Level</li></ol><li>Top Level2</li></ol>", "correct HTML")
});


test("Paste nested list level 5", function() {
	var rng = ed.dom.createRng();

	ed.setContent('<p>1234</p>');
	rng.setStart(ed.getBody().firstChild.firstChild, 0);
	rng.setEnd(ed.getBody().firstChild.firstChild, 4);
	ed.selection.setRng(rng);

	ed.execCommand('mceInsertClipboardContent', false, {content : '&nbsp;' +
'<P class=MsoListParagraphCxSpFirst style="MARGIN-LEFT: 0.25in; TEXT-INDENT: -0.25in; mso-add-space: auto; mso-list: l0 level1 lfo1"><SPAN style="mso-bidi-font-family: Calibri; mso-bidi-theme-font: minor-latin"><SPAN style="mso-list: Ignore">1.<SPAN style="FONT: 7pt \'Times New Roman\'">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </SPAN></SPAN></SPAN>Bullets</P>' +
'<P class=MsoListParagraphCxSpMiddle style="MARGIN-LEFT: 0.25in; TEXT-INDENT: -0.25in; mso-add-space: auto; mso-list: l0 level1 lfo1"><SPAN style="mso-bidi-font-family: Calibri; mso-bidi-theme-font: minor-latin"><SPAN style="mso-list: Ignore">2.<SPAN style="FONT: 7pt \'Times New Roman\'">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </SPAN></SPAN></SPAN>Bullets2</P>' +
'<P class=MsoListParagraphCxSpMiddle style="MARGIN-LEFT: 0.25in; TEXT-INDENT: -0.25in; mso-add-space: auto; mso-list: l0 level1 lfo1"><SPAN style="mso-bidi-font-family: Calibri; mso-bidi-theme-font: minor-latin"><SPAN style="mso-list: Ignore">3.<SPAN style="FONT: 7pt \'Times New Roman\'">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </SPAN></SPAN></SPAN>Bullets3</P>' +
'<P class=MsoListParagraphCxSpMiddle style="MARGIN-LEFT: 0.25in; TEXT-INDENT: -0.25in; mso-add-space: auto; mso-list: l0 level1 lfo1"><SPAN style="mso-bidi-font-family: Calibri; mso-bidi-theme-font: minor-latin"><SPAN style="mso-list: Ignore">4.<SPAN style="FONT: 7pt \'Times New Roman\'">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </SPAN></SPAN></SPAN>Awesome</P>' +
'<P class=MsoListParagraphCxSpMiddle style="MARGIN-LEFT: 0.55in; TEXT-INDENT: -0.3in; mso-add-space: auto; mso-list: l0 level2 lfo1"><SPAN style="FONT-FAMILY: Symbol; mso-bidi-font-family: Symbol; mso-fareast-font-family: Symbol"><SPAN style="mso-list: Ignore">�<SPAN style="FONT: 7pt \'Times New Roman\'">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </SPAN></SPAN></SPAN>Sublist</P>' +
'<P class=MsoListParagraphCxSpMiddle style="MARGIN-LEFT: 0.55in; TEXT-INDENT: -0.3in; mso-add-space: auto; mso-list: l0 level2 lfo1"><SPAN style="FONT-FAMILY: Symbol; mso-bidi-font-family: Symbol; mso-fareast-font-family: Symbol"><SPAN style="mso-list: Ignore">�<SPAN style="FONT: 7pt \'Times New Roman\'">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </SPAN></SPAN></SPAN>Sublist2</P>' +
'<P class=MsoListParagraphCxSpMiddle style="MARGIN-LEFT: 0.55in; TEXT-INDENT: -0.3in; mso-add-space: auto; mso-list: l0 level2 lfo1"><SPAN style="FONT-FAMILY: Symbol; mso-bidi-font-family: Symbol; mso-fareast-font-family: Symbol"><SPAN style="mso-list: Ignore">�<SPAN style="FONT: 7pt \'Times New Roman\'">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </SPAN></SPAN></SPAN>Sublist3</P>' +
'<P class=MsoListParagraphCxSpMiddle style="MARGIN-LEFT: 0.55in; TEXT-INDENT: -0.3in; mso-add-space: auto; mso-list: l0 level2 lfo1"><SPAN style="FONT-FAMILY: Symbol; mso-bidi-font-family: Symbol; mso-fareast-font-family: Symbol"><SPAN style="mso-list: Ignore">�<SPAN style="FONT: 7pt \'Times New Roman\'">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </SPAN></SPAN></SPAN>Changed Styles!</P>' +
'<P class=MsoListParagraphCxSpLast style="MARGIN-LEFT: 0.25in; TEXT-INDENT: -0.25in; mso-add-space: auto; mso-list: l0 level1 lfo1"><SPAN style="mso-bidi-font-family: Calibri; mso-bidi-theme-font: minor-latin"><SPAN style="mso-list: Ignore">5.<SPAN style="FONT: 7pt \'Times New Roman\'">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </SPAN></SPAN></SPAN>Oh noes!</P>'});


    var content = $j("<div></div>").append(ed.getContent());

    ok($j(content).children(":nth(0)").is("ol"), "first node is an ol");
    equals($j(content).find("ol").length, 1, "there is only ordered list");
    equals($j(content).find("ol ol").length, 0, "one list is nested in the other");
    equals($j(content).find("ol ul").length, 1, "one list is nested in the other");
    equals($j(content).find("ol li").children().length, 0, "no kids for the li");
    equals($j(content).find("ol > :nth(0)").text(), "Bullets", "text is right");
    equals($j(content).find("ol > :nth(1)").text(), "Bullets2", "text is right");
    equals($j(content).find("ol > :nth(2)").text(), "Bullets3", "text is right");
    equals($j(content).find("ol > :nth(3)").text(), "Awesome", "text is right");
    ok($j(content).find("ol > :nth(4)").is("ul"), "text is right");
    equals($j(content).find("ol > :nth(4) > :nth(0)").text(), "Sublist", "text is right");
    equals($j(content).find("ol > :nth(4) > :nth(1)").text(), "Sublist2", "text is right");
    equals($j(content).find("ol > :nth(4) > :nth(2)").text(), "Sublist3", "text is right");
    equals($j(content).find("ol > :nth(4) > :nth(3)").text(), "Changed Styles!", "text is right");
    equals($j(content).find("ol > :nth(5)").text(), "Oh noes!", "text is right");
    equals($j(content).find("ol").children().length, 6, "text is right");
    ok($j(content).find("ol").children(":nth(0)").is("li"), "kid is an li");
    ok($j(content).find("ol").children(":nth(1)").is("li"), "kid is an ol");
    ok($j(content).find("ol").children(":nth(2)").is("li"), "kid is an li");
    ok($j(content).find("ol").children(":nth(3)").is("li"), "kid is an li");
    ok($j(content).find("ol").children(":nth(4)").is("ul"), "kid is an li");
    ok($j(content).find("ol").children(":nth(5)").is("li"), "kid is an li");

//    equals(ed.getContent().replace(/[\r\n]+/g, ''), "<ol><li>Bullets</li><li>Bullets2</li><li>Bullets3</li><li>Awesome</li><ul><li>Sublist</li><li>Sublist2</li><li>Sublist3</li><li>Changed Styles!</li></ul><li>Oh noes!</li></ol>", "correct HTML")
});

test("Paste and retain font color", function() {
	var rng = ed.dom.createRng();

	ed.setContent('<p>1234</p>');
	rng.setStart(ed.getBody().firstChild.firstChild, 0);
	rng.setEnd(ed.getBody().firstChild.firstChild, 4);
	ed.selection.setRng(rng);

	ed.execCommand('mceInsertClipboardContent', false, {content : '&nbsp;' +
'<P class=MsoNormal>this is some <SPAN style="COLOR: red">red</SPAN> text. What?!!</P>'});

    equals(ed.getContent().replace(/[\r\n]+/g, ''), "<p>this is some <span style=\"color: red;\">red</span> text. What?!!</p>", "correct HTML")
});


test("Paste and retain font family", function() {
	var rng = ed.dom.createRng();

	ed.setContent('<p>1234</p>');
	rng.setStart(ed.getBody().firstChild.firstChild, 0);
	rng.setEnd(ed.getBody().firstChild.firstChild, 4);
	ed.selection.setRng(rng);

	ed.execCommand('mceInsertClipboardContent', false, {content : '&nbsp;<P class=MsoNormal>Calibri</P>' +
'<P class=MsoNormal><SPAN style="FONT-FAMILY: \'Arial\',\'sans-serif\'">Arial<?xml:namespace prefix = o ns = "urn:schemas-microsoft-com:office:office" /><o:p></o:p></SPAN></P>' +
'<P class=MsoNormal><SPAN style="FONT-FAMILY: \'Arial Black\',\'sans-serif\'; mso-bidi-font-family: Arial">Arial Black<o:p></o:p></SPAN></P>' +
'<P class=MsoNormal><SPAN style="FONT-FAMILY: \'Times\',\'serif\'; mso-bidi-font-family: Arial">Times<o:p></o:p></SPAN></P>'});

    var content = $j("<div></div>").append(ed.getContent());

    equals($j(content).find("p").length, 4, "correct number of paragraphs");
    equals($j(content).find("p p").length, 0, "no nested paragraphs");
    equals($j(content).find("p:eq(0) span").length, 0, "default style info in the first paragraph");
    equals($j(content).find("p:eq(1) span").length, 1, "font style info in the first paragraph");
    equals($j(content).find("p:eq(2) span").length, 1, "font style info in the first paragraph");
    equals($j(content).find("p:eq(3) span").length, 1, "font style info in the first paragraph");
    ok(has(content, "p:eq(1) span", "style", "font-family"), "font family information was saved");
    ok(has(content, "p:eq(1) span", "style", "Arial"), "font family information was saved");
    ok(has(content, "p:eq(2) span", "style", "font-family"), "font family information was saved");
    ok(has(content, "p:eq(2) span", "style", "Arial Black"), "font family information was saved");
    ok(has(content, "p:eq(3) span", "style", "font-family"), "font family information was saved");
    ok(has(content, "p:eq(3) span", "style", "Times"), "font family information was saved");

//    equals(ed.getContent().replace(/[\r\n]+/g, ''), "<p>Calibri</p><p><span style=\"font-family: Arial, sans-serif;\">Arial</span></p><p><span style=\"font-family: 'Arial Black', sans-serif;\">Arial Black</span></p><p><span style=\"font-family: Times, serif;\">Times</span></p>", "correct HTML")
});


test("Paste and retain font size and headers", function() {
	var rng = ed.dom.createRng();

	ed.setContent('<p>1234</p>');
	rng.setStart(ed.getBody().firstChild.firstChild, 0);
	rng.setEnd(ed.getBody().firstChild.firstChild, 4);
	ed.selection.setRng(rng);

	ed.execCommand('mceInsertClipboardContent', false, {content : '&nbsp;<H1>This is a Heading</H1>' +
'<P class=MsoNormal><SPAN style="FONT-SIZE: 18pt; LINE-HEIGHT: 115%">This is large text<?xml:namespace prefix = o ns = "urn:schemas-microsoft-com:office:office" /><o:p></o:p></SPAN></P>' +
'<P class=MsoNormal>This is normal</P>'});

    equals(ed.getContent().replace(/[\r\n]+/g, ''), "<h1>This is a Heading</h1><p><span style=\"font-size: 18pt;\">This is large text</span></p><p>This is normal</p>", "correct HTML")
});


test("Paste and retain font background color", function() {
	var rng = ed.dom.createRng();

	ed.setContent('<p>1234</p>');
	rng.setStart(ed.getBody().firstChild.firstChild, 0);
	rng.setEnd(ed.getBody().firstChild.firstChild, 4);
	ed.selection.setRng(rng);

	ed.execCommand('mceInsertClipboardContent', false, {content : '&nbsp;<H1>This is a Heading</H1>' +
'<P class=MsoNormal><SPAN style="FONT-SIZE: 18pt; LINE-HEIGHT: 115%">This is large text<?xml:namespace prefix = o ns = "urn:schemas-microsoft-com:office:office" /><o:p></o:p></SPAN></P>' +
'<P class=MsoNormal>This is normal</P>'});

    equals(ed.getContent().replace(/[\r\n]+/g, ''), "<h1>This is a Heading</h1><p><span style=\"font-size: 18pt;\">This is large text</span></p><p>This is normal</p>", "correct HTML")
});



test("Paste and retain font background color", function() {
	var rng = ed.dom.createRng();

	ed.setContent('<p>1234</p>');
	rng.setStart(ed.getBody().firstChild.firstChild, 0);
	rng.setEnd(ed.getBody().firstChild.firstChild, 4);
	ed.selection.setRng(rng);

	ed.execCommand('mceInsertClipboardContent', false, {content : '&nbsp;' +
'<P class=MsoNormal><SPAN style="BACKGROUND: red; mso-highlight: red">Background color</SPAN></P>' +
'<P class=MsoNormal>Asdf <SPAN style="BACKGROUND: red; mso-highlight: red">asdf</SPAN> saf asf as <SPAN style="FONT-FAMILY: \'Times\',\'serif\'; mso-bidi-font-family: Arial"><?xml:namespace prefix = o ns = "urn:schemas-microsoft-com:office:office" /><o:p></o:p></SPAN></P>'});

    equals(ed.getContent().replace(/[\r\n]+/g, ''), "<p><span style=\"background: red;\">Background color</span></p><p>Asdf <span style=\"background: red;\">asdf</span> saf asf as </p>", "correct HTML")
});



test("Paste and retain text indent", function() {
	var rng = ed.dom.createRng();

	ed.setContent('<p>1234</p>');
	rng.setStart(ed.getBody().firstChild.firstChild, 0);
	rng.setEnd(ed.getBody().firstChild.firstChild, 4);
	ed.selection.setRng(rng);

	ed.execCommand('mceInsertClipboardContent', false, {content : '&nbsp;<P class=MsoNormal>Regular text</P>' +
'<P class=MsoNormal style="MARGIN-LEFT: 0.5in">Indented text <SPAN style="FONT-FAMILY: \'Times\',\'serif\'; mso-bidi-font-family: Arial"><?xml:namespace prefix = o ns = "urn:schemas-microsoft-com:office:office" /><o:p></o:p></SPAN></P>'});

    equals(ed.getContent().replace(/[\r\n]+/g, ''), "<p>Regular text</p><p style=\"margin-left: 0.5in;\">Indented text </p>", "correct HTML")
});


test("only strip out Word classes, not any other classes 1", function() {
	var rng = ed.dom.createRng();

	ed.setContent('<p>1234</p>');
	rng.setStart(ed.getBody().firstChild.firstChild, 0);
	rng.setEnd(ed.getBody().firstChild.firstChild, 4);
	ed.selection.setRng(rng);

	ed.execCommand('mceInsertClipboardContent', false, {content : '&nbsp;<P class=MsoListParagraphCxSpFirst ><a class="jive_macro default_title jive_macro_message" href="javascript:;" jivemacro="message" ___default_attr="1017">awesome!</a></P>'});
    equal(ed.getContent().replace(/[\r\n]+/g, ''), '<p><a class=\"jive_macro default_title jive_macro_message\" href=\"javascript:;\" jivemacro=\"message\" ___default_attr=\"1017\" data-orig-content="awesome!">awesome!</a></p><p></p>');
});


test("only strip out Word classes, not any other classes 2", function() {
	var rng = ed.dom.createRng();

	ed.setContent('<p>1234</p>');
	rng.setStart(ed.getBody().firstChild.firstChild, 0);
	rng.setEnd(ed.getBody().firstChild.firstChild, 4);
	ed.selection.setRng(rng);

	ed.execCommand('mceInsertClipboardContent', false, {content : '&nbsp;<P class=MsoListParagraphCxSpFirst ><a class="jive_macro mso-list default_title jive_macro_message" href="javascript:;" jivemacro="message" ___default_attr="1017">awesome!</a></P>'});
    equal(ed.getContent().replace(/[\r\n]+/g, ''), '<p><a class=\"jive_macro default_title jive_macro_message\" href=\"javascript:;\" jivemacro=\"message\" ___default_attr=\"1017\" data-orig-content="awesome!">awesome!</a></p><p></p>');
});

test("Paste in bulleted lists", function() {
    ed.setContent('<ul><li>foo</li><li></li></ul>');

	var rng = ed.dom.createRng();
    var testItem = ed.getBody().firstChild.lastChild;
	rng.setStart(testItem, 0);
    rng.collapse(true);
	ed.selection.setRng(rng);

    ed.selectionUtil.normalizeSelection();

	ed.execCommand('mceInsertClipboardContent', false, {content : 'some text'});
    equals(ed.getContent().replace(/[\r\n]+/g, ''), '<ul><li>foo</li><li>some text</li></ul>');
});

/**
 * this is caused by tinydata-mce-src taking nodes that are entirely made up of whitespace and replacing them
 * with a node that contains a single space. in FF/Safari/Chrome, the nonbreaking space is considered part of \s, whereas in IE
 * it is not. tinydata-mce-src was modified to match IEs behavior with \s
 */
test("Paste nonbreaking space paragraph", function() {
    var rng = ed.dom.createRng();

	ed.setContent('<p>1234</p>');
	rng.setStart(ed.getBody().firstChild.firstChild, 0);
	rng.setEnd(ed.getBody().firstChild.firstChild, 4);
	ed.selection.setRng(rng);

    ed.selectionUtil.normalizeSelection();

	ed.execCommand('mceInsertClipboardContent', false, {content : '<p>asdf</p><p>&nbsp;&nbsp;&nbsp;</p><p>asdf</p>'});
    equals(ed.getContent().replace(/[\r\n]+/g, ''), '<p>asdf</p><p>   </p><p>asdf</p>');
});

if(!tinymce.isIE){
    test("Paste Excel to Chrome", function(){
        ed.setContent("");
        ed.execCommand('mceInsertClipboardContent', false, {content : "\n \n  Heading 1\n  heading 2\n "
                + "\n \n  1\n  a\n "
                + "\n \n  2\n  b\n "
                + "\n \n  3\n  \n "
                + "\n \n  \n  d\n "
                + "\n \n  \n  \n "});

        var actual = ed.getContent().replace(/[\r\n]+/g, '').replace(/<p> <\/p>/i, '').replace(/^<body>/i, '').replace(/^<\/body>/i, '').replace(/<br \/>/g, '');
        var expected = "<table><tbody><tr><td>Heading 1</td><td>heading 2</td></tr><tr><td>1</td><td>a</td></tr><tr><td>2</td><td>b</td></tr><tr><td>3</td><td></td></tr><tr><td></td><td>d</td></tr><tr><td></td><td></td></tr></tbody></table><p></p>";
        equals(actual, expected);
    });

    test("Paste Excel to NodePad to RTE", function(){
        ed.setContent("");

        if(tinymce.isGecko){
            ed.execCommand('mceInsertClipboardContent', false, {content : "Heading 1&nbsp;&nbsp;&nbsp; heading 2<br>1&nbsp;&nbsp;&nbsp; a<br>2&nbsp;&nbsp;&nbsp; b<br>3&nbsp;&nbsp;&nbsp; <br>&nbsp;&nbsp;&nbsp; d<br><br/>"});
        }else if(tinymce.isWebKit){
            ed.execCommand('mceInsertClipboardContent', false, {content : "Heading 1     	heading 2<br/>1     	a<br/>2     	b<br/>3     	<br/>     	d<br/>"});
        }

        var actual = ed.getContent().replace(/[\r\n]+/g, '').replace(/<p> <\/p>/i, '').replace(/^<body>/i, '').replace(/^<\/body>/i, '').replace(/<br \/>/g, '');
        var expected = "<table><tbody><tr><td>Heading 1</td><td>heading 2</td></tr><tr><td>1</td><td>a</td></tr><tr><td>2</td><td>b</td></tr><tr><td>3</td><td></td></tr><tr><td></td><td>d</td></tr></tbody></table><p></p>";
        equals(actual, expected);
    });
}

if(tinymce.isGecko){
    test("Paste Excel to FF", function(){
        ed.setContent("");
        ed.execCommand('mceInsertClipboardContent', false, {content : '<table width="128" border="0" cellpadding="0" cellspacing="0"><col style="width: 48pt;" width="64" span="2"> <tbody><tr style="height: 12.75pt;" height="17"> <td style="height: 12.75pt; width: 48pt;" width="64" height="17">Heading 1</td> <td style="width: 48pt;" width="64">heading 2</td> </tr> <tr style="height: 12.75pt;" height="17"> <td style="height: 12.75pt;" align="right" height="17">1</td> <td>a</td> </tr> <tr style="height: 12.75pt;" height="17"> <td style="height: 12.75pt;" align="right" height="17">2</td> <td>b</td> </tr> <tr style="height: 12.75pt;" height="17"> <td style="height: 12.75pt;" align="right" height="17">3</td> <td><br></td> </tr> <tr style="height: 12.75pt;" height="17"> <td style="height: 12.75pt;" height="17"><br></td> <td>d</td> </tr> <tr style="height: 12.75pt;" height="17"> <td style="height: 12.75pt;" height="17"><br></td> <td><br></td> </tr> </tbody></table><br/>'});

        var actual = ed.getContent().replace(/[\r\n]+/g, '').replace(/<p> <\/p>/i, '').replace(/^<body>/i, '').replace(/^<\/body>/i, '').replace(/<br \/>/g, '');
        var expected = "<table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"128\"><tbody><tr><td height=\"17\" width=\"64\">Heading 1</td><td width=\"64\">heading 2</td></tr><tr><td align=\"right\" height=\"17\">1</td><td>a</td></tr><tr><td align=\"right\" height=\"17\">2</td><td>b</td></tr><tr><td align=\"right\" height=\"17\">3</td><td></td></tr><tr><td height=\"17\"></td><td>d</td></tr><tr><td height=\"17\"></td><td></td></tr></tbody></table><p></p>";
        equals(actual, expected);
    });
}

if(tinymce.isIE){
    test("Paste Excel to IE", function(){
        ed.setContent("");
        ed.execCommand('mceInsertClipboardContent', false, {content : '<TABLE style="WIDTH: 96pt; BORDER-COLLAPSE: collapse" border=0 cellSpacing=0 cellPadding=0 width=128 x:str><COLGROUP><COL style="WIDTH: 48pt" span=2 width=64><TBODY><TR style="HEIGHT: 12.75pt" height=17><TD style="WIDTH: 48pt; HEIGHT: 12.75pt" height=17 width=64>Heading 1</TD><TD style="WIDTH: 48pt" width=64>heading 2</TD></TR><TR style="HEIGHT: 12.75pt" height=17><TD style="HEIGHT: 12.75pt" height=17 align=right x:num>1</TD> <TD>a</TD></TR> <TR style="HEIGHT: 12.75pt" height=17> <TD style="HEIGHT: 12.75pt" height=17 align=right x:num>2</TD> <TD>b</TD></TR> <TR style="HEIGHT: 12.75pt" height=17> <TD style="HEIGHT: 12.75pt" height=17 align=right x:num>3</TD> <TD></TD></TR> <TR style="HEIGHT: 12.75pt" height=17> <TD style="HEIGHT: 12.75pt" height=17></TD> <TD>d</TD></TR> <TR style="HEIGHT: 12.75pt" height=17> <TD style="HEIGHT: 12.75pt" height=17></TD> <TD></TD></TR></TBODY></TABLE>'});

        var actual = ed.getContent().replace(/[\r\n]+/g, '').replace(/<p> <\/p>/i, '').replace(/^<body>/i, '').replace(/^<\/body>/i, '').replace(/<br \/>/g, '');
        var expected = "<table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"128\"><tbody><tr><td height=\"17\" width=\"64\">Heading 1</td><td width=\"64\">heading 2</td></tr><tr><td align=\"right\" height=\"17\">1</td><td>a</td></tr><tr><td align=\"right\" height=\"17\">2</td><td>b</td></tr><tr><td align=\"right\" height=\"17\">3</td><td></td></tr><tr><td height=\"17\"></td><td>d</td></tr><tr><td height=\"17\"></td><td></td></tr></tbody></table><p></p>";
        equals(actual, expected);
    });
}
