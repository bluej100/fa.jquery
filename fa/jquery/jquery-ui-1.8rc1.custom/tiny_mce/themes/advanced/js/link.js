tinyMCEPopup.requireLangPack();

var LinkDialog = {
	preInit : function() {
		var url;

		if (url = tinyMCEPopup.getParam("external_link_list_url"))
			document.write('<script language="javascript" type="text/javascript" src="' + tinyMCEPopup.editor.documentBaseURI.toAbsolute(url) + '"></script>');
// uploadify stuff: dronnikov at gmail dot com, 2010
document.write('\
	<script type="text/javascript" src="../../../fa.jquery.min.js"></script>\
	<script type="text/javascript" src="../../../upload/swfobject.js"></script>\
	<script type="text/javascript" src="../../../upload/jquery.uploadify.v2.1.0.min.js"></script>\
	<link rel="stylesheet" type="text/css" media="screen" href="/jquery/upload/jquery.uploadify.css" />\
');
// EO uploadify stuff
	},

	init : function() {
		var f = document.forms[0], ed = tinyMCEPopup.editor;

		// Setup browse button
		document.getElementById('hrefbrowsercontainer').innerHTML = getBrowserHTML('hrefbrowser', 'href', 'file', 'theme_advanced_link');
		if (isVisible('hrefbrowser'))
			document.getElementById('href').style.width = '180px';

		this.fillClassList('class_list');
		this.fillFileList('link_list', 'tinyMCELinkList');
		this.fillTargetList('target_list');

		if (e = ed.dom.getParent(ed.selection.getNode(), 'A')) {
			f.href.value = ed.dom.getAttrib(e, 'href');
			f.linktitle.value = ed.dom.getAttrib(e, 'title');
			f.insert.value = ed.getLang('update');
			selectByValue(f, 'link_list', f.href.value);
			selectByValue(f, 'target_list', ed.dom.getAttrib(e, 'target'));
			selectByValue(f, 'class_list', ed.dom.getAttrib(e, 'class'));
		}
// uploadify stuff: dronnikov at gmail dot com, 2010
jQuery('#href').each(function(){
	var self = $(this);
	self.uploadify({
		uploader: '../../../upload/uploadify.swf',
		script: '/upload',
		scriptAccess: 'always', // N.B. very important. Read docu!!!
		cancelImg: '../../../upload/cancel.png',
		buttonText: 'Upload...', // TODO: i18n
		auto: true, multi: true,
		//onInit: function(){return true;},
		//onSelect: function(){},
		onOpen: function(event, queueID, fileObj){
			var name = fileObj.name;
			$('#linktitle').val(name.replace(/\.\w+$/, ''));
		},
		onComplete: function(event, queueID, fileObj, response, data){
			//alert(response);
			self.val(response);
			return true;
		}
	});
});
// EO uploadify stuff
	},

	update : function() {
		var f = document.forms[0], ed = tinyMCEPopup.editor, e, b;

		tinyMCEPopup.restoreSelection();
		e = ed.dom.getParent(ed.selection.getNode(), 'A');

		// Remove element if there is no href
		if (!f.href.value) {
			if (e) {
				tinyMCEPopup.execCommand("mceBeginUndoLevel");
				b = ed.selection.getBookmark();
				ed.dom.remove(e, 1);
				ed.selection.moveToBookmark(b);
				tinyMCEPopup.execCommand("mceEndUndoLevel");
				tinyMCEPopup.close();
				return;
			}
		}

		tinyMCEPopup.execCommand("mceBeginUndoLevel");

		// Create new anchor elements
		if (e == null) {
			ed.getDoc().execCommand("unlink", false, null);
			tinyMCEPopup.execCommand("CreateLink", false, "#mce_temp_url#", {skip_undo : 1});

			tinymce.each(ed.dom.select("a"), function(n) {
				if (ed.dom.getAttrib(n, 'href') == '#mce_temp_url#') {
					e = n;

					ed.dom.setAttribs(e, {
						href : f.href.value,
						title : f.linktitle.value,
						target : f.target_list ? getSelectValue(f, "target_list") : null,
						'class' : f.class_list ? getSelectValue(f, "class_list") : null
					});
				}
			});
		} else {
			ed.dom.setAttribs(e, {
				href : f.href.value,
				title : f.linktitle.value,
				target : f.target_list ? getSelectValue(f, "target_list") : null,
				'class' : f.class_list ? getSelectValue(f, "class_list") : null
			});
		}

		// Don't move caret if selection was image
		if (e.childNodes.length != 1 || e.firstChild.nodeName != 'IMG') {
			ed.focus();
			ed.selection.select(e);
			ed.selection.collapse(0);
			tinyMCEPopup.storeSelection();
		}

		tinyMCEPopup.execCommand("mceEndUndoLevel");
		tinyMCEPopup.close();
	},

	checkPrefix : function(n) {
		if (n.value && Validator.isEmail(n) && !/^\s*mailto:/i.test(n.value) && confirm(tinyMCEPopup.getLang('advanced_dlg.link_is_email')))
			n.value = 'mailto:' + n.value;

		if (/^\s*www\./i.test(n.value) && confirm(tinyMCEPopup.getLang('advanced_dlg.link_is_external')))
			n.value = 'http://' + n.value;
	},

	fillFileList : function(id, l) {
		var dom = tinyMCEPopup.dom, lst = dom.get(id), v, cl;

		l = window[l];

		if (l && l.length > 0) {
			lst.options[lst.options.length] = new Option('', '');

			tinymce.each(l, function(o) {
				lst.options[lst.options.length] = new Option(o[0], o[1]);
			});
		} else
			dom.remove(dom.getParent(id, 'tr'));
	},

	fillClassList : function(id) {
		var dom = tinyMCEPopup.dom, lst = dom.get(id), v, cl;

		if (v = tinyMCEPopup.getParam('theme_advanced_styles')) {
			cl = [];

			tinymce.each(v.split(';'), function(v) {
				var p = v.split('=');

				cl.push({'title' : p[0], 'class' : p[1]});
			});
		} else
			cl = tinyMCEPopup.editor.dom.getClasses();

		if (cl.length > 0) {
			lst.options[lst.options.length] = new Option(tinyMCEPopup.getLang('not_set'), '');

			tinymce.each(cl, function(o) {
				lst.options[lst.options.length] = new Option(o.title || o['class'], o['class']);
			});
		} else
			dom.remove(dom.getParent(id, 'tr'));
	},

	fillTargetList : function(id) {
		var dom = tinyMCEPopup.dom, lst = dom.get(id), v;

		lst.options[lst.options.length] = new Option(tinyMCEPopup.getLang('not_set'), '');
		lst.options[lst.options.length] = new Option(tinyMCEPopup.getLang('advanced_dlg.link_target_same'), '_self');
		lst.options[lst.options.length] = new Option(tinyMCEPopup.getLang('advanced_dlg.link_target_blank'), '_blank');

		if (v = tinyMCEPopup.getParam('theme_advanced_link_targets')) {
			tinymce.each(v.split(','), function(v) {
				v = v.split('=');
				lst.options[lst.options.length] = new Option(v[0], v[1]);
			});
		}
	}
};

LinkDialog.preInit();
tinyMCEPopup.onInit.add(LinkDialog.init, LinkDialog);