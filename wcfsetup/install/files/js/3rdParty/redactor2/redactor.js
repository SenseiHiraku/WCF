/*
	Redactor II
	Version 2.99
	Heavily modified version for WoltLab Suite.

	http://imperavi.com/redactor/

	Copyright (c) 2009-2017, Imperavi LLC.
	License: http://imperavi.com/redactor/license/

	Usage: $('#content').redactor();
*/

(function ($) {
	'use strict';
	
	if (!Function.prototype.bind) {
		Function.prototype.bind = function (scope) {
			var fn = this;
			return function () {
				return fn.apply(scope);
			};
		};
	}
	
	var uuid = 0;
	
	var Environment = null;
	if (typeof window.require === 'function') {
		// Load the Environment class for a better browser detection, guarded by a function check
		// to avoid bricking any calls to this file in a different context.
		require(['Environment'], function(Env) {
			Environment = Env;
		});
	}
	
	// Plugin
	$.fn.redactor = function (options) {
		var val = [];
		var args = Array.prototype.slice.call(arguments, 1);
		
		if (typeof options === 'string') {
			this.each(function () {
				var instance = $.data(this, 'redactor');
				var func;
				
				if (options.search(/\./) !== '-1') {
					func = options.split('.');
					if (typeof instance[func[0]] !== 'undefined') {
						func = instance[func[0]][func[1]];
					}
				}
				else {
					func = instance[options];
				}
				
				if (typeof instance !== 'undefined' && $.isFunction(func)) {
					var methodVal = func.apply(instance, args);
					if (methodVal !== undefined && methodVal !== instance) {
						val.push(methodVal);
					}
				}
				else {
					$.error('No such method "' + options + '" for Redactor');
				}
			});
		}
		else {
			this.each(function () {
				$.data(this, 'redactor', {});
				$.data(this, 'redactor', Redactor(this, options));
			});
		}
		
		if (val.length === 0) {
			return this;
		}
		else if (val.length === 1) {
			return val[0];
		}
		else {
			return val;
		}
		
	};
	
	// Initialization
	function Redactor(el, options) {
		return new Redactor.prototype.init(el, options);
	}
	
	// Options
	$.Redactor = Redactor;
	$.Redactor.VERSION = '2.99'; // Fake version
	$.Redactor.modules = [
		'air', // Unsupported module
		'autosave', // Unsupported module
		'block',
		'buffer',
		'build',
		'button',
		'caret',
		'clean',
		'code',
		'core',
		'detect',
		'dropdown',
		'events',
		'file', // Unsupported module
		'focus',
		'image',
		'indent',
		'inline',
		'insert',
		'keydown',
		'keyup',
		'lang',
		'line',
		'link',
		'linkify', // Unsupported module
		'list',
		'marker',
		'modal',
		'observe',
		'offset',
		'paragraphize',
		'paste',
		'placeholder', // Unsupported module
		'progress', // Unsupported module
		'selection',
		'shortcuts',
		'storage', // Unsupported module
		'toolbar',
		'upload', // Unsupported module
		'uploads3', // Unsupported module
		'utils',
		
		'browser' // deprecated
	];
	
	$.Redactor.settings = {};
	$.Redactor.opts = {
		
		// settings
		animation: false,
		lang: 'en',
		direction: 'ltr',
		spellcheck: true,
		overrideStyles: true,
		stylesClass: false,
		scrollTarget: document,
		
		focus: false,
		focusEnd: false,
		
		clickToEdit: false,
		structure: false,
		
		tabindex: false,
		
		minHeight: false, // string
		maxHeight: false, // string
		
		maxWidth: false, // string
		
		plugins: false, // array
		callbacks: {},
		
		placeholder: false,
		
		linkify: true,
		enterKey: true,
		
		pastePlainText: false,
		pasteImages: true,
		pasteLinks: true,
		pasteBlockTags: [
			'pre',
			'h1',
			'h2',
			'h3',
			'h4',
			'h5',
			'h6',
			'table',
			'tbody',
			'thead',
			'tfoot',
			'th',
			'tr',
			'td',
			'ul',
			'ol',
			'li',
			'blockquote',
			'p',
			'figure',
			'figcaption'
		],
		pasteInlineTags: [
			'br',
			'strong',
			'ins',
			'code',
			'del',
			'span',
			'samp',
			'kbd',
			'sup',
			'sub',
			'mark',
			'var',
			'cite',
			'small',
			'b',
			'u',
			'em',
			'i'
		],
		
		preClass: false, // string
		preSpaces: 4, // or false
		tabAsSpaces: false, // true or number of spaces
		tabKey: true,
		
		autosave: false, // false or url
		autosaveName: false,
		autosaveFields: false,
		
		imageUpload: null,
		imageUploadParam: 'file',
		imageUploadFields: false,
		imageUploadForms: false,
		imageTag: 'figure',
		imageEditable: true,
		imageCaption: true,
		
		imagePosition: false,
		imageResizable: false,
		imageFloatMargin: '10px',
		
		dragImageUpload: true,
		multipleImageUpload: true,
		clipboardImageUpload: true,
		
		fileUpload: null,
		fileUploadParam: 'file',
		fileUploadFields: false,
		fileUploadForms: false,
		dragFileUpload: true,
		
		s3: false,
		
		linkNewTab: false,
		linkTooltip: true,
		linkNofollow: false,
		linkSize: 30,
		linkValidation: true,
		pasteLinkTarget: false,
		
		videoContainerClass: 'video-container',
		
		toolbar: true,
		toolbarFixed: true,
		toolbarFixedTarget: document,
		toolbarFixedTopOffset: 0, // pixels
		toolbarExternal: false, // ID selector
		toolbarOverflow: false,
		
		air: false,
		airWidth: false,
		
		formatting: ['p', 'blockquote', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
		formattingAdd: false,
		
		buttons: ['format', 'bold', 'italic', 'deleted', 'lists', 'image', 'file', 'link', 'horizontalrule'], // + 'horizontalrule', 'underline', 'ol', 'ul', 'indent', 'outdent'
		buttonsTextLabeled: false,
		buttonsHide: [],
		buttonsHideOnMobile: [],
		
		script: true,
		removeNewlines: false,
		removeComments: true,
		replaceTags: {
			'b': 'strong',
			'i': 'em',
			'strike': 'del'
		},
		
		keepStyleAttr: [], // tag name array
		keepInlineOnEnter: false,
		
		// shortcuts
		shortcuts: {
			'ctrl+shift+m, meta+shift+m': {func: 'inline.removeFormat'},
			'ctrl+b, meta+b': {
				func: 'inline.format',
				params: ['bold']
			},
			'ctrl+i, meta+i': {
				func: 'inline.format',
				params: ['italic']
			},
			'ctrl+h, meta+h': {
				func: 'inline.format',
				params: ['superscript']
			},
			'ctrl+l, meta+l': {
				func: 'inline.format',
				params: ['subscript']
			},
			'ctrl+k, meta+k': {func: 'link.show'},
			'ctrl+shift+7': {
				func: 'list.toggle',
				params: ['orderedlist']
			},
			'ctrl+shift+8': {
				func: 'list.toggle',
				params: ['unorderedlist']
			}
		},
		shortcutsAdd: false,
		
		activeButtons: ['deleted', 'italic', 'bold'],
		activeButtonsStates: {
			b: 'bold',
			strong: 'bold',
			i: 'italic',
			em: 'italic',
			del: 'deleted',
			strike: 'deleted'
		},
		
		// private lang
		langs: {
			en: {
				
				'format': 'Format',
				'image': 'Image',
				'file': 'File',
				'link': 'Link',
				'bold': 'Bold',
				'italic': 'Italic',
				'deleted': 'Strikethrough',
				'underline': 'Underline',
				'bold-abbr': 'B',
				'italic-abbr': 'I',
				'deleted-abbr': 'S',
				'underline-abbr': 'U',
				'lists': 'Lists',
				'link-insert': 'Insert link',
				'link-edit': 'Edit link',
				'link-in-new-tab': 'Open link in new tab',
				'unlink': 'Unlink',
				'cancel': 'Cancel',
				'close': 'Close',
				'insert': 'Insert',
				'save': 'Save',
				'delete': 'Delete',
				'text': 'Text',
				'edit': 'Edit',
				'title': 'Title',
				'paragraph': 'Normal text',
				'quote': 'Quote',
				'code': 'Code',
				'heading1': 'Heading 1',
				'heading2': 'Heading 2',
				'heading3': 'Heading 3',
				'heading4': 'Heading 4',
				'heading5': 'Heading 5',
				'heading6': 'Heading 6',
				'filename': 'Name',
				'optional': 'optional',
				'unorderedlist': 'Unordered List',
				'orderedlist': 'Ordered List',
				'outdent': 'Outdent',
				'indent': 'Indent',
				'horizontalrule': 'Line',
				'upload-label': 'Drop file here or ',
				'caption': 'Caption',
				
				'bulletslist': 'Bullets',
				'numberslist': 'Numbers',
				
				'image-position': 'Position',
				'none': 'None',
				'left': 'Left',
				'right': 'Right',
				'center': 'Center',
				
				'accessibility-help-label': 'Rich text editor'
			}
		},
		
		// private
		type: 'textarea', // textarea, div, inline, pre
		inline: false,
		inlineTags: [
			'a',
			'span',
			'strong',
			'strike',
			'b',
			'u',
			'em',
			'i',
			'code',
			'del',
			'ins',
			'samp',
			'kbd',
			'sup',
			'sub',
			'mark',
			'var',
			'cite',
			'small'
		],
		blockTags: [
			'pre',
			'ul',
			'ol',
			'li',
			'p',
			'h1',
			'h2',
			'h3',
			'h4',
			'h5',
			'h6',
			'dl',
			'dt',
			'dd',
			'div',
			'td',
			'blockquote',
			'output',
			'figcaption',
			'figure',
			'address',
			'section',
			'header',
			'footer',
			'aside',
			'article',
			'iframe'
		],
		paragraphize: true,
		paragraphizeBlocks: [
			'table',
			'div',
			'pre',
			'form',
			'ul',
			'ol',
			'h1',
			'h2',
			'h3',
			'h4',
			'h5',
			'h6',
			'dl',
			'blockquote',
			'figcaption',
			'address',
			'section',
			'header',
			'footer',
			'aside',
			'article',
			'object',
			'style',
			'script',
			'iframe',
			'select',
			'input',
			'textarea',
			'button',
			'option',
			'map',
			'area',
			'math',
			'hr',
			'fieldset',
			'legend',
			'hgroup',
			'nav',
			'figure',
			'details',
			'menu',
			'summary',
			'center',
			'p'
		],
		emptyHtml: '<p>&#x200b;</p>',
		invisibleSpace: '&#x200b;',
		emptyHtmlRendered: $('').html('​').html(),
		imageTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
		userAgent: navigator.userAgent.toLowerCase(),
		observe: {
			dropdowns: []
		},
		regexps: {
			linkyoutube: /https?:\/\/(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube\.com\S*[^\w\-\s])([\w\-]{11})(?=[^\w\-]|$)(?![?=&+%\w.\-]*(?:['"][^<>]*>|<\/a>))[?=&+%\w.-]*/ig,
			linkvimeo: /https?:\/\/(www\.)?vimeo.com\/(\d+)($|\/)/,
			linkimage: /((https?|www)[^\s]+\.)(jpe?g|png|gif)(\?[^\s-]+)?/ig,
			url: /(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/ig
		}
		
	};
	
	// Functionality
	Redactor.fn = $.Redactor.prototype = {
		
		keyCode: {
			BACKSPACE: 8,
			DELETE: 46,
			UP: 38,
			DOWN: 40,
			ENTER: 13,
			SPACE: 32,
			ESC: 27,
			TAB: 9,
			CTRL: 17,
			META: 91,
			SHIFT: 16,
			ALT: 18,
			RIGHT: 39,
			LEFT: 37,
			LEFT_WIN: 91
		},
		
		// =init
		init: function (el, options) {
			this.$element = $(el);
			this.uuid = uuid++;
			this.sBuffer = [];
			this.sRebuffer = [];
			
			this.loadOptions(options);
			this.loadModules();
			
			// click to edit
			if (this.opts.clickToEdit && !this.$element.hasClass('redactor-click-to-edit')) {
				return this.loadToEdit(options);
			}
			else if (this.$element.hasClass('redactor-click-to-edit')) {
				this.$element.removeClass('redactor-click-to-edit');
			}
			
			// block & inline test tag regexp
			this.reIsBlock = new RegExp('^(' + this.opts.blockTags.join('|').toUpperCase() + ')$', 'i');
			this.reIsInline = new RegExp('^(' + this.opts.inlineTags.join('|').toUpperCase() + ')$', 'i');
			
			// set up drag upload
			this.opts.dragImageUpload = (this.opts.imageUpload === null) ? false : this.opts.dragImageUpload;
			this.opts.dragFileUpload = (this.opts.fileUpload === null) ? false : this.opts.dragFileUpload;
			
			// formatting storage
			this.formatting = {};
			
			// load lang
			this.lang.load();
			
			// extend shortcuts
			$.extend(this.opts.shortcuts, this.opts.shortcutsAdd);
			
			// set editor
			this.$editor = this.$element;
			
			// detect type of editor
			this.detectType();
			
			// start callback
			this.core.callback('start');
			this.core.callback('startToEdit');
			
			// build
			this.start = true;
			this.build.start();
			
		},
		detectType: function () {
			if (this.build.isInline() || this.opts.inline) {
				this.opts.type = 'inline';
			}
			else if (this.build.isTag('DIV')) {
				this.opts.type = 'div';
			}
			else if (this.build.isTag('PRE')) {
				this.opts.type = 'pre';
			}
		},
		loadToEdit: function (options) {
			
			this.$element.on('click.redactor-click-to-edit', $.proxy(function () {
				this.initToEdit(options);
				
			}, this));
			
			this.$element.addClass('redactor-click-to-edit');
			
			return;
		},
		initToEdit: function (options) {
			$.extend(options.callbacks, {
				startToEdit: function () {
					this.insert.node(this.marker.get(), false);
				},
				initToEdit: function () {
					this.selection.restore();
					this.clickToCancelStorage = this.code.get();
					
					// cancel
					$(this.opts.clickToCancel).off('.redactor-click-to-edit');
					$(this.opts.clickToCancel).show().on('click.redactor-click-to-edit',
						$.proxy(function (e) {
							e.preventDefault();
							
							this.core.destroy();
							this.events.syncFire = false;
							this.$element.html(this.clickToCancelStorage);
							this.core.callback('cancel', this.clickToCancelStorage);
							this.events.syncFire = true;
							this.clickToCancelStorage = '';
							$(this.opts.clickToCancel).hide();
							$(this.opts.clickToSave).hide();
							
							this.$element.on('click.redactor-click-to-edit',
								$.proxy(function () {
									this.initToEdit(options);
								}, this)
							);
							
							this.$element.addClass('redactor-click-to-edit');
							
						}, this)
					);
					
					// save
					$(this.opts.clickToSave).off('.redactor-click-to-edit');
					$(this.opts.clickToSave).show().on('click.redactor-click-to-edit',
						$.proxy(function (e) {
							e.preventDefault();
							
							this.core.destroy();
							this.core.callback('save', this.code.get());
							$(this.opts.clickToCancel).hide();
							$(this.opts.clickToSave).hide();
							this.$element.on('click.redactor-click-to-edit',
								$.proxy(function () {
									this.initToEdit(options);
								}, this)
							);
							this.$element.addClass('redactor-click-to-edit');
							
						}, this)
					);
				}
				
			});
			
			this.$element.redactor(options);
			this.$element.off('.redactor-click-to-edit');
			
		},
		loadOptions: function (options) {
			var settings = {};
			
			// check namespace
			if (typeof $.Redactor.settings.namespace !== 'undefined') {
				if (this.$element.hasClass($.Redactor.settings.namespace)) {
					settings = $.Redactor.settings;
				}
			}
			else {
				settings = $.Redactor.settings;
			}
			
			this.opts = $.extend({}, $.Redactor.opts, this.$element.data(), options);
			
			this.opts = $.extend({}, this.opts, settings);
			
		},
		getModuleMethods: function (object) {
			return Object.getOwnPropertyNames(object).filter(function (property) {
				return typeof object[property] === 'function';
			});
		},
		loadModules: function () {
			var len = $.Redactor.modules.length;
			for (var i = 0; i < len; i++) {
				this.bindModuleMethods($.Redactor.modules[i]);
			}
		},
		bindModuleMethods: function (module) {
			if (typeof this[module] === 'undefined') {
				return;
			}
			
			// init module
			this[module] = this[module]();
			
			var methods = this.getModuleMethods(this[module]);
			var len = methods.length;
			
			// bind methods
			for (var z = 0; z < len; z++) {
				this[module][methods[z]] = this[module][methods[z]].bind(this);
			}
		},
		
		// =air -- UNSUPPORTED MODULE
		air: function () {
			return {
				enabled: false,
				collapsed: function () {},
				collapsedEnd: function () {},
				build: function () {},
				append: function () {},
				createContainer: function () {},
				show: function () {},
				bindHide: function () {},
				hide: function () {}
			};
		},
		
		// =autosave -- UNSUPPORTED MODULE
		autosave: function () {
			return {
				enabled: false,
				html: false,
				init: function () {},
				is: function () {},
				send: function () {},
				getHiddenFields: function () {},
				success: function () {},
				disable: function () {}
			};
		},
		
		// =block
		block: function () {
			return {
				format: function (tag, attr, value, type) {
					tag = (tag === 'quote') ? 'blockquote' : tag;
					
					this.block.tags = [
						'p',
						'blockquote',
						'pre',
						'h1',
						'h2',
						'h3',
						'h4',
						'h5',
						'h6',
						'div',
						'figure'
					];
					if ($.inArray(tag, this.block.tags) === -1) {
						return;
					}
					
					if (tag === 'p' && typeof attr === 'undefined') {
						// remove all
						attr = 'class';
					}
					
					this.buffer.set();
					
					return (this.utils.isCollapsed()) ? this.block.formatCollapsed(tag,
						attr,
						value,
						type
					) : this.block.formatUncollapsed(
						tag,
						attr,
						value,
						type
					);
				},
				formatCollapsed: function (tag, attr, value, type) {
					this.selection.save();
					
					var block = this.selection.block();
					var currentTag = block.tagName.toLowerCase();
					if ($.inArray(currentTag, this.block.tags) === -1) {
						this.selection.restore();
						return;
					}
					
					var clearAllAttrs = false;
					if (currentTag === tag && attr === undefined) {
						tag = 'p';
						clearAllAttrs = true;
					}
					
					if (clearAllAttrs) {
						this.block.removeAllClass();
						this.block.removeAllAttr();
					}
					
					var replaced;
					if (currentTag === 'blockquote' && this.utils.isEndOfElement(block)) {
						this.marker.remove();
						
						replaced = document.createElement('p');
						replaced.innerHTML = this.opts.invisibleSpace;
						
						$(block).after(replaced);
						this.caret.start(replaced);
						var $last = $(block).children().last();
						
						if ($last.length !== 0 && $last[0].tagName === 'BR') {
							$last.remove();
						}
					}
					else {
						replaced = this.utils.replaceToTag(block, tag);
					}
					
					if (typeof attr === 'object') {
						type = value;
						for (var key in attr) {
							replaced = this.block.setAttr(replaced, key, attr[key], type);
						}
					}
					else {
						replaced = this.block.setAttr(replaced, attr, value, type);
					}
					
					// trim pre
					if (tag === 'pre' && replaced.length === 1) {
						$(replaced).html($.trim($(replaced).html()));
					}
					
					this.selection.restore();
					this.block.removeInlineTags(replaced);
					
					return replaced;
				},
				formatUncollapsed: function (tag, attr, value, type) {
					this.selection.save();
					
					var replaced = [];
					var blocks = this.selection.blocks();
					
					if (blocks[0] && ($(blocks[0]).hasClass('redactor-in') || $(blocks[0]).hasClass(
						'redactor-box'))) {
						blocks = this.core.editor().find(this.opts.blockTags.join(', '));
					}
					
					var len = blocks.length;
					for (var i = 0; i < len; i++) {
						var currentTag = blocks[i].tagName.toLowerCase();
						if ($.inArray(currentTag,
							this.block.tags
						) !== -1 && currentTag !== 'figure') {
							var block = this.utils.replaceToTag(blocks[i], tag);
							
							if (typeof attr === 'object') {
								type = value;
								for (var key in attr) {
									block = this.block.setAttr(block,
										key,
										attr[key],
										type
									);
								}
							}
							else {
								block = this.block.setAttr(block, attr, value, type);
							}
							
							replaced.push(block);
							this.block.removeInlineTags(block);
						}
					}
					
					this.selection.restore();
					
					// combine pre
					if (tag === 'pre' && replaced.length !== 0) {
						var first = replaced[0];
						$.each(replaced, function (i, s) {
							if (i !== 0) {
								$(first).append('\n' + $.trim(s.html()));
								$(s).remove();
							}
						});
						
						replaced = [];
						replaced.push(first);
					}
					
					return replaced;
				},
				removeInlineTags: function (node) {
					node = node[0] || node;
					
					var tags = this.opts.inlineTags;
					var blocks = ['PRE', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'];
					
					if ($.inArray(node.tagName, blocks) === -1) {
						return;
					}
					
					if (node.tagName !== 'PRE') {
						var index = tags.indexOf('a');
						tags.splice(index, 1);
					}
					
					$(node).find(tags.join(',')).not('.redactor-selection-marker').contents().unwrap();
				},
				setAttr: function (block, attr, value, type) {
					if (typeof attr === 'undefined') {
						return block;
					}
					
					var func = (typeof type === 'undefined') ? 'replace' : type;
					
					if (attr === 'class') {
						block = this.block[func + 'Class'](value, block);
					}
					else {
						if (func === 'remove') {
							block = this.block[func + 'Attr'](attr, block);
						}
						else if (func === 'removeAll') {
							block = this.block[func + 'Attr'](attr, block);
						}
						else {
							block = this.block[func + 'Attr'](attr, value, block);
						}
					}
					
					return block;
					
				},
				getBlocks: function (block) {
					block = (typeof block === 'undefined') ? this.selection.blocks() : block;
					
					if ($(block).hasClass('redactor-box')) {
						var blocks = [];
						var nodes = this.core.editor().children();
						$.each(nodes, $.proxy(function (i, node) {
							if (this.utils.isBlock(node)) {
								blocks.push(node);
							}
							
						}, this));
						
						return blocks;
					}
					
					return block;
				},
				replaceClass: function (value, block) {
					return $(this.block.getBlocks(block)).removeAttr('class').addClass(value)[0];
				},
				toggleClass: function (value, block) {
					return $(this.block.getBlocks(block)).toggleClass(value)[0];
				},
				addClass: function (value, block) {
					return $(this.block.getBlocks(block)).addClass(value)[0];
				},
				removeClass: function (value, block) {
					return $(this.block.getBlocks(block)).removeClass(value)[0];
				},
				removeAllClass: function (block) {
					return $(this.block.getBlocks(block)).removeAttr('class')[0];
				},
				replaceAttr: function (attr, value, block) {
					block = this.block.removeAttr(attr, block);
					
					return $(block).attr(attr, value)[0];
				},
				toggleAttr: function (attr, value, block) {
					block = this.block.getBlocks(block);
					
					var self = this;
					var returned = [];
					$.each(block, function (i, s) {
						var $el = $(s);
						if ($el.attr(attr)) {
							returned.push(self.block.removeAttr(attr, s));
						}
						else {
							returned.push(self.block.addAttr(attr, value, s));
						}
					});
					
					return returned;
					
				},
				addAttr: function (attr, value, block) {
					return $(this.block.getBlocks(block)).attr(attr, value)[0];
				},
				removeAttr: function (attr, block) {
					return $(this.block.getBlocks(block)).removeAttr(attr)[0];
				},
				removeAllAttr: function (block) {
					block = this.block.getBlocks(block);
					
					var returned = [];
					$.each(block, function (i, s) {
						if (typeof s.attributes !== 'undefined') {
							while (s.attributes.length) {
								s.removeAttribute(s.attributes[0].name);
							}
						}
						
						returned.push(s);
					});
					
					return returned;
				}
			};
		},
		
		// buffer
		buffer: function () {
			return {
				set: function (type) {
					if (typeof type === 'undefined') {
						this.buffer.clear();
					}
					
					if (typeof type === 'undefined' || type === 'undo') {
						this.buffer.setUndo();
					}
					else {
						this.buffer.setRedo();
					}
				},
				setUndo: function () {
					var saved = this.selection.saveInstant();
					
					var last = this.sBuffer[this.sBuffer.length - 1];
					var current = this.core.editor().html();
					
					var save = (typeof last !== 'undefined' && (last[0] === current)) ? false : true;
					if (save) {
						this.sBuffer.push([current, saved]);
					}
					
					//this.selection.restore();
				},
				setRedo: function () {
					var saved = this.selection.saveInstant();
					this.sRebuffer.push([this.core.editor().html(), saved]);
					//this.selection.restore();
				},
				add: function () {
					this.sBuffer.push([this.core.editor().html(), 0]);
				},
				undo: function () {
					if (this.sBuffer.length === 0) {
						return;
					}
					
					var buffer = this.sBuffer.pop();
					
					this.buffer.set('redo');
					this.core.editor().html(buffer[0]);
					
					this.selection.restoreInstant(buffer[1]);
					this.selection.restore();
					this.observe.load();
				},
				redo: function () {
					if (this.sRebuffer.length === 0) {
						return;
					}
					
					var buffer = this.sRebuffer.pop();
					
					this.buffer.set('undo');
					this.core.editor().html(buffer[0]);
					
					this.selection.restoreInstant(buffer[1]);
					this.selection.restore();
					this.observe.load();
				},
				clear: function () {
					this.sRebuffer = [];
				}
			};
		},
		
		// =build
		build: function () {
			return {
				start: function () {
					if (this.opts.type !== 'textarea') {
						throw new Error('Only `<textarea>` types are allowed.');
					}
					
					this.build.startTextarea();
					
					// set in
					this.build.setIn();
					
					// set id
					this.build.setId();
					
					// enable
					this.build.enableEditor();
					
					// options
					this.build.setOptions();
					
					// call
					this.build.callEditor();
					
				},
				createContainerBox: function () {
					this.$box = $('<div class="redactor-box" role="application" />');
				},
				setIn: function () {
					this.core.editor().addClass('redactor-in');
				},
				setId: function () {
					var id = (this.opts.type === 'textarea') ? 'redactor-uuid-' + this.uuid : this.$element.attr(
						'id');
					
					this.core.editor().attr('id',
						(typeof id === 'undefined') ? 'redactor-uuid-' + this.uuid : id
					);
				},
				getName: function () {
					var name = this.$element.attr('name');
					
					return (typeof name === 'undefined') ? 'content-' + this.uuid : name;
				},
				buildTextarea: function () {},
				loadFromTextarea: function () {
					this.$editor = $('<div />');
					
					// textarea
					this.$textarea = this.$element;
					this.$element.attr('name', this.build.getName());
					
					// place
					this.$box.insertAfter(this.$element).append(this.$editor).append(this.$element);
					
					this.build.setStartAttrs();
					
					// styles
					this.$editor.addClass('redactor-layer');
					if (this.opts.overrideStyles) this.$editor.addClass('redactor-styles');
					
					this.$element.hide();
					
					this.$box.prepend('<span class="redactor-voice-label" id="redactor-voice-' + this.uuid + '" aria-hidden="false">' + this.lang.get(
						'accessibility-help-label') + '</span>');
					
				},
				setStartAttrs: function () {
					this.$editor.attr({
						'aria-labelledby': 'redactor-voice-' + this.uuid,
						'role': 'presentation'
					});
				},
				startTextarea: function () {
					this.build.createContainerBox();
					
					// load
					this.build.loadFromTextarea();
					
					// set code
					this.code.start(this.core.textarea().val());
					
					// set value
					this.core.textarea().val(this.clean.onSync(this.$editor.html()));
				},
				isTag: function (tag) {
					return (this.$element[0].tagName === tag);
				},
				isInline: function () {
					return (!this.build.isTag('TEXTAREA') && !this.build.isTag('DIV') && !this.build.isTag(
						'PRE'));
				},
				enableEditor: function () {
					this.core.editor().attr({'contenteditable': true});
				},
				setOptions: function () {
					// inline
					if (this.opts.type === 'inline') {
						this.opts.enterKey = false;
					}
					
					// inline & pre
					if (this.opts.type === 'inline' || this.opts.type === 'pre') {
						this.opts.toolbarMobile = false;
						this.opts.toolbar = false;
						
					}
					
					// spellcheck
					this.core.editor().attr('spellcheck', this.opts.spellcheck);
					
					// structure
					if (this.opts.structure) {
						this.core.editor().addClass('redactor-structure');
					}
					
					// styles class
					if (this.opts.stylesClass) {
						this.core.editor().addClass(this.opts.stylesClass);
					}
					
					// options sets only in textarea mode
					if (this.opts.type !== 'textarea') {
						return;
					}
					
					// direction
					this.core.box().attr('dir', this.opts.direction);
					this.core.editor().attr('dir', this.opts.direction);
					
					// tabindex
					if (this.opts.tabindex) {
						this.core.editor().attr('tabindex', this.opts.tabindex);
					}
					
					// min height
					if (this.opts.minHeight) {
						this.core.editor().css('min-height', this.opts.minHeight);
					}
					else {
						this.core.editor().css('min-height', '40px');
					}
					
					// max height
					if (this.opts.maxHeight) {
						this.core.editor().css('max-height', this.opts.maxHeight);
					}
					
					// max width
					if (this.opts.maxWidth) {
						this.core.editor().css({
							'max-width': this.opts.maxWidth,
							'margin': 'auto'
						});
					}
					
				},
				callEditor: function () {
					this.build.disableBrowsersEditing();
					
					this.events.init();
					this.build.setHelpers();
					
					// init buttons
					this.toolbarsButtons = this.button.init();
					
					// load toolbar
					this.toolbar.build();
					
					// observe dropdowns
					this.core.editor().on(
						'mouseup.redactor-observe.' + this.uuid + ' keyup.redactor-observe.' + this.uuid + ' focus.redactor-observe.' + this.uuid + ' touchstart.redactor-observe.' + this.uuid,
						$.proxy(this.observe.toolbar, this)
					);
					this.core.element().on('blur.callback.redactor', $.proxy(function () {
						this.button.setInactiveAll();
						
					}, this));
					
					// modal templates init
					this.modal.templates();
					
					// plugins
					this.build.plugins();
					
					// sync code
					this.code.html = this.code.cleaned(this.core.editor().html());
					
					// init callback
					this.core.callback('init');
					this.core.callback('initToEdit');
					
					// started
					this.start = false;
					
				},
				setHelpers: function () {
					// focus
					if (this.opts.focus) {
						setTimeout(this.focus.start, 100);
					}
					else if (this.opts.focusEnd) {
						setTimeout(this.focus.end, 100);
					}
					
				},
				disableBrowsersEditing: function () {
					try {
						// FF fix
						document.execCommand('enableObjectResizing', false, false);
						document.execCommand('enableInlineTableEditing', false, false);
						// IE prevent converting links
						document.execCommand('AutoUrlDetect', false, false);
					}
					catch (e) {}
				},
				plugins: function () {
					if (!this.opts.plugins) {
						return;
					}
					
					$.each(this.opts.plugins, $.proxy(function (i, s) {
						var func = (typeof RedactorPlugins !== 'undefined' && typeof RedactorPlugins[s] !== 'undefined') ? RedactorPlugins : Redactor.fn;
						
						if (!$.isFunction(func[s])) {
							return;
						}
						
						this[s] = func[s]();
						
						// get methods
						var methods = this.getModuleMethods(this[s]);
						var len = methods.length;
						
						// bind methods
						for (var z = 0; z < len; z++) {
							this[s][methods[z]] = this[s][methods[z]].bind(this);
						}
						
						// append lang
						if (typeof this[s].langs !== 'undefined') {
							var lang = {};
							if (typeof this[s].langs[this.opts.lang] !== 'undefined') {
								lang = this[s].langs[this.opts.lang];
							}
							else if (typeof this[s].langs[this.opts.lang] === 'undefined' && typeof this[s].langs.en !== 'undefined') {
								lang = this[s].langs.en;
							}
							
							// extend
							var self = this;
							$.each(lang, function (i, s) {
								if (typeof self.opts.curLang[i] === 'undefined') {
									self.opts.curLang[i] = s;
								}
							});
						}
						
						// init
						if (typeof this[s].init === 'function') {
							this[s].init();
						}
					}, this));
					
				}
			};
		},
		
		// =button
		button: function () {
			return {
				toolbar: function () {
					return (typeof this.button.$toolbar === 'undefined' || !this.button.$toolbar) ? this.$toolbar : this.button.$toolbar;
				},
				init: function () {
					return {
						format: {
							title: this.lang.get('format'),
							icon: true,
							dropdown: {
								p: {
									title: this.lang.get('paragraph'),
									func: 'block.format'
								},
								blockquote: {
									title: this.lang.get('quote'),
									func: 'block.format'
								},
								pre: {
									title: this.lang.get('code'),
									func: 'block.format'
								},
								h1: {
									title: this.lang.get('heading1'),
									func: 'block.format'
								},
								h2: {
									title: this.lang.get('heading2'),
									func: 'block.format'
								},
								h3: {
									title: this.lang.get('heading3'),
									func: 'block.format'
								},
								h4: {
									title: this.lang.get('heading4'),
									func: 'block.format'
								},
								h5: {
									title: this.lang.get('heading5'),
									func: 'block.format'
								},
								h6: {
									title: this.lang.get('heading6'),
									func: 'block.format'
								}
							}
						},
						bold: {
							title: this.lang.get('bold-abbr'),
							icon: true,
							label: this.lang.get('bold'),
							func: 'inline.format'
						},
						italic: {
							title: this.lang.get('italic-abbr'),
							icon: true,
							label: this.lang.get('italic'),
							func: 'inline.format'
						},
						deleted: {
							title: this.lang.get('deleted-abbr'),
							icon: true,
							label: this.lang.get('deleted'),
							func: 'inline.format'
						},
						underline: {
							title: this.lang.get('underline-abbr'),
							icon: true,
							label: this.lang.get('underline'),
							func: 'inline.format'
						},
						lists: {
							title: this.lang.get('lists'),
							icon: true,
							dropdown: {
								unorderedlist: {
									title: '&bull; ' + this.lang.get('unorderedlist'),
									func: 'list.toggle'
								},
								orderedlist: {
									title: '1. ' + this.lang.get('orderedlist'),
									func: 'list.toggle'
								},
								outdent: {
									title: '< ' + this.lang.get('outdent'),
									func: 'indent.decrease',
									observe: {
										element: 'li',
										out: {
											attr: {
												'class': 'redactor-dropdown-link-inactive',
												'aria-disabled': true
											}
										}
									}
								},
								indent: {
									title: '> ' + this.lang.get('indent'),
									func: 'indent.increase',
									observe: {
										element: 'li',
										out: {
											attr: {
												'class': 'redactor-dropdown-link-inactive',
												'aria-disabled': true
											}
										}
									}
								}
							}
						},
						ul: {
							title: '&bull; ' + this.lang.get('bulletslist'),
							icon: true,
							func: 'list.toggle'
						},
						ol: {
							title: '1. ' + this.lang.get('numberslist'),
							icon: true,
							func: 'list.toggle'
						},
						outdent: {
							title: this.lang.get('outdent'),
							icon: true,
							func: 'indent.decrease'
						},
						indent: {
							title: this.lang.get('indent'),
							icon: true,
							func: 'indent.increase'
						},
						image: {
							title: this.lang.get('image'),
							icon: true,
							func: 'image.show'
						},
						file: {
							title: this.lang.get('file'),
							icon: true,
							func: 'file.show'
						},
						link: {
							title: this.lang.get('link'),
							icon: true,
							dropdown: {
								link: {
									title: this.lang.get('link-insert'),
									func: 'link.show',
									observe: {
										element: 'a',
										'in': {
											title: this.lang.get('link-edit')
										},
										out: {
											title: this.lang.get(
												'link-insert')
										}
									}
								},
								unlink: {
									title: this.lang.get('unlink'),
									func: 'link.unlink',
									observe: {
										element: 'a',
										out: {
											attr: {
												'class': 'redactor-dropdown-link-inactive',
												'aria-disabled': true
											}
										}
									}
								}
							}
						},
						horizontalrule: {
							title: this.lang.get('horizontalrule'),
							icon: true,
							func: 'line.insert'
						}
					};
				},
				setFormatting: function () {
					for (var key in this.toolbarsButtons.format.dropdown) {
						if (this.toolbarsButtons.format.dropdown.hasOwnProperty(key) && this.opts.formatting.indexOf(key) === -1) {
							delete this.toolbarsButtons.format.dropdown[key];
						}
					}
					
				},
				hideButtons: function () {
					if (this.opts.buttonsHide.length !== 0) {
						this.button.hideButtonsSlicer(this.opts.buttonsHide);
					}
				},
				hideButtonsOnMobile: function () {
					if (this.detect.isMobile() && this.opts.buttonsHideOnMobile.length !== 0) {
						this.button.hideButtonsSlicer(this.opts.buttonsHideOnMobile);
					}
				},
				hideButtonsSlicer: function (buttons) {
					$.each(buttons, $.proxy(function (i, s) {
						var index = this.opts.buttons.indexOf(s);
						if (index !== -1) {
							this.opts.buttons.splice(index, 1);
						}
						
					}, this));
				},
				load: function ($toolbar) {
					this.button.buttons = [];
					
					this.opts.buttons.forEach((function(btnName) {
						if (btnName === 'image' && !this.image.is()) {
							return;
						}
						
						if (this.toolbarsButtons.hasOwnProperty(btnName)) {
							var listItem = elCreate('li');
							listItem.appendChild(this.button.build(btnName,
								this.toolbarsButtons[btnName]
							)[0]);
							$toolbar[0].appendChild(listItem);
						}
					}).bind(this));
				},
				buildButtonTooltip: function () {},
				build: function (btnName, btnObject) {
					var $button = $('<a href="javascript:void(null);" rel="' + btnName + '" />');
					
					$button.addClass('re-button re-' + btnName);
					$button.attr({
						'role': 'button',
						'tabindex': '-1'
					});
					
					$button.html(btnObject.title);
					
					// click
					if (btnObject.func || btnObject.command || btnObject.dropdown) {
						this.button.setEvent($button, btnName, btnObject);
					}
					
					// dropdown
					if (btnObject.dropdown) {
						$button.addClass('redactor-toolbar-link-dropdown').attr('aria-haspopup',
							true
						);
						
						var $dropdown = $('<ul class="dropdownMenu redactor-dropdown-menu redactor-dropdown-menu-' + $button[0].rel + '" data-dropdown-allow-flip="horizontal" data-dropdown-ignore-page-scroll="true" />');
						$button.data('dropdown', $dropdown);
						this.dropdown.build(btnName, $dropdown, btnObject.dropdown);
						
						this.button.setupDropdown($button[0], $dropdown[0]);
					}
					
					this.button.buttons.push($button);
					
					return $button;
				},
				setupDropdown: function(button, dropdown) {
					require(['Ui/SimpleDropdown'], (function (UiSimpleDropdown) {
						UiSimpleDropdown.initFragment(button, dropdown);
						UiSimpleDropdown.registerCallback(button.id, (function(containerId, action) {
							if (action === 'close') {
								this.dropdown.hideOut();
							}
						}).bind(this));
						
						elData(button, 'a11y-mouse-event', 'mousedown');
						elData(button, 'aria-expanded', false);
						
						button.addEventListener('click', function (event) {
							event.preventDefault();
							event.stopPropagation();
						});
					}).bind(this));
				},
				getButtons: function () {
					return this.button.toolbar().find('a.re-button');
				},
				getButtonsKeys: function () {
					return this.button.buttons;
				},
				setEvent: function ($button, btnName, btnObject) {
					$button.on('mousedown', $.proxy(function (e) {
						e.preventDefault();
						
						if ($button.hasClass('redactor-button-disabled')) {
							return false;
						}
						
						var type = 'func';
						var callback = btnObject.func;
						
						if (btnObject.command) {
							type = 'command';
							callback = btnObject.command;
						}
						else if (btnObject.dropdown) {
							type = 'dropdown';
							callback = false;
						}
						
						this.button.toggle(e, btnName, type, callback);
						
						return false;
						
					}, this));
				},
				toggle: function (e, btnName, type, callback, args) {
					
					if (this.detect.isIe() || !this.detect.isDesktop()) {
						this.utils.freezeScroll();
						e.returnValue = false;
					}
					
					if (type === 'command') {
						this.inline.format(callback);
					}
					else if (type === 'dropdown') {
						this.dropdown.show(e, btnName);
					}
					else {
						this.button.clickCallback(e, callback, btnName, args);
					}
					
					if (type !== 'dropdown') {
						this.dropdown.hideAll(false);
					}
					
					if (this.detect.isIe() || !this.detect.isDesktop()) {
						this.utils.unfreezeScroll();
					}
				},
				clickCallback: function (e, callback, btnName, args) {
					var func;
					
					if (e instanceof Event) {
						e.preventDefault();
					}
					else if (e && e.originalEvent) {
						e.originalEvent.preventDefault();
					}
					
					args = (typeof args === 'undefined') ? btnName : args;
					
					if ($.isFunction(callback)) {
						callback.call(this, btnName);
					}
					else if (callback.search(/\./) !== '-1') {
						func = callback.split('.');
						if (typeof this[func[0]] === 'undefined') {
							return;
						}
						
						if (typeof args === 'object') {
							this[func[0]][func[1]].apply(this, args);
						}
						else {
							this[func[0]][func[1]].call(this, args);
						}
					}
					else {
						
						if (typeof args === 'object') {
							this[callback].apply(this, args);
						}
						else {
							this[callback].call(this, args);
						}
					}
					
					this.observe.buttons(e, btnName);
					
				},
				all: function () {
					return this.button.buttons;
				},
				get: function (key) {
					if (this.opts.toolbar === false) {
						return;
					}
					
					return this.button.toolbar().find('a.re-' + key);
				},
				set: function (key, title) {
					if (this.opts.toolbar === false) {
						return;
					}
					
					var $btn = this.button.toolbar().find('a.re-' + key);
					
					$btn.html(title).attr('aria-label', title);
					
					return $btn;
				},
				add: function (key, title) {
					if (this.button.isAdded(key) !== true) {
						return $();
					}
					
					var btn = this.button.build(key, {title: title});
					
					this.button.toolbar().append($('<li>').append(btn));
					
					return btn;
				},
				addFirst: function (key, title) {
					if (this.button.isAdded(key) !== true) {
						return $();
					}
					
					var btn = this.button.build(key, {title: title});
					
					this.button.toolbar().prepend($('<li>').append(btn));
					
					return btn;
				},
				addAfter: function (afterkey, key, title) {
					if (this.button.isAdded(key) !== true) {
						return $();
					}
					
					var btn = this.button.build(key, {title: title});
					var $btn = this.button.get(afterkey);
					
					if ($btn.length !== 0) {
						$btn.parent().after($('<li>').append(btn));
					}
					else {
						this.button.toolbar().append($('<li>').append(btn));
					}
					
					return btn;
				},
				addBefore: function (beforekey, key, title) {
					if (this.button.isAdded(key) !== true) {
						return $();
					}
					
					var btn = this.button.build(key, {title: title});
					var $btn = this.button.get(beforekey);
					
					if ($btn.length !== 0) {
						$btn.parent().before($('<li>').append(btn));
					}
					else {
						this.button.toolbar().append($('<li>').append(btn));
					}
					
					return btn;
				},
				isAdded: function (key) {
					var index = this.opts.buttonsHideOnMobile.indexOf(key);
					if (this.opts.toolbar === false || (index !== -1 && this.detect.isMobile())) {
						return false;
					}
					
					return true;
				},
				setIcon: function ($btn, icon) {
					if (!this.opts.buttonsTextLabeled) {
						$btn.html(icon).addClass('re-button-icon');
					}
				},
				changeIcon: function (key, newIconClass) {
					var $btn = this.button.get(key);
					if ($btn.length !== 0) {
						$btn.find('i').removeAttr('class').addClass('re-icon-' + newIconClass);
					}
				},
				addCallback: function ($btn, callback) {
					if (typeof $btn === 'undefined' || this.opts.toolbar === false) {
						return;
					}
					
					var type = (callback === 'dropdown') ? 'dropdown' : 'func';
					var key = $btn.attr('rel');
					$btn.on('mousedown', $.proxy(function (e) {
						if ($btn.hasClass('redactor-button-disabled')) {
							return false;
						}
						
						this.button.toggle(e, key, type, callback);
						
					}, this));
				},
				addDropdown: function ($btn, dropdown) {
					if (this.opts.toolbar === false) {
						return;
					}
					
					$btn.addClass('redactor-toolbar-link-dropdown').attr('aria-haspopup', true);
					
					var key = $btn.attr('rel');
					this.button.addCallback($btn, 'dropdown');
					
					var $dropdown = $('<ul class="dropdownMenu redactor-dropdown-menu redactor-dropdown-menu-' + key + '" data-dropdown-allow-flip="horizontal" data-dropdown-ignore-page-scroll="true" />');
					$btn.data('dropdown', $dropdown);
					
					// build dropdown
					if (dropdown) {
						this.dropdown.build(key, $dropdown, dropdown);
						
						this.button.setupDropdown($btn[0], $dropdown[0]);
					}
					
					return $dropdown;
				},
				setActive: function (key) {
					this.button.get(key).addClass('redactor-act').attr({
						'aria-pressed': true,
						tabindex: 0
					});
				},
				setInactive: function (key) {
					this.button.get(key).removeClass('redactor-act').attr({
						'aria-pressed': false,
						tabindex: (key === 'html') ? 0 : -1
					});
				},
				setInactiveAll: function (key) {
					var $btns = this.button.toolbar().find('a.re-button');
					
					if (typeof key !== 'undefined') {
						$btns = $btns.not('.re-' + key);
					}
					
					$btns.removeClass('redactor-act').attr({
						'aria-pressed': false,
						tabindex: (key === 'html') ? 0 : -1
					});
				},
				disable: function (key) {
					this.button.get(key).addClass('redactor-button-disabled').attr('aria-disabled', true);
				},
				enable: function (key) {
					this.button.get(key).removeClass('redactor-button-disabled').attr('aria-disabled', false);
				},
				disableAll: function (key) {
					var $btns = this.button.toolbar().find('a.re-button');
					if (typeof key !== 'undefined') {
						if (!Array.isArray(key)) {
							key = [key];
						}
						
						key = key.map(function(value) {
							return '.re-' + value
						});
						
						$btns = $btns.not(key.join(','));
					}
					
					$btns.addClass('redactor-button-disabled').attr('aria-disabled', true);
				},
				enableAll: function () {
					this.button.toolbar().find('a.re-button').removeClass('redactor-button-disabled').attr('aria-disabled', false);
				},
				remove: function (key) {
					this.button.get(key).remove();
				}
			};
		},
		
		// =caret
		caret: function () {
			return {
				set: function (node1, node2, end) {
					var cs = this.core.editor().scrollTop();
					this.core.editor().focus();
					this.core.editor().scrollTop(cs);
					
					end = (typeof end === 'undefined') ? 0 : 1;
					
					node1 = node1[0] || node1;
					node2 = node2[0] || node2;
					
					var sel = this.selection.get();
					var range = this.selection.range(sel);
					
					try {
						range.setStart(node1, 0);
						range.setEnd(node2, end);
					}
					catch (e) {}
					
					this.selection.update(sel, range);
				},
				prepare: function (node) {
					// firefox focus
					if (this.detect.isFirefox() && typeof this.start !== 'undefined') {
						this.core.editor().focus();
					}
					
					return node[0] || node;
				},
				start: function (node) {
					var sel, range;
					node = this.caret.prepare(node);
					
					if (!node) {
						return;
					}
					
					if (node.tagName === 'BR') {
						return this.caret.before(node);
					}
					
					var $first = $(node).children().first();
					
					// empty or inline tag
					var inline = this.utils.isInlineTag(node.tagName);
					if (node.innerHTML === '' || inline) {
						this.caret.setStartEmptyOrInline(node, inline);
					}
					// empty inline inside
					else if ($first && $first.length !== 0 && this.utils.isInlineTag($first[0].tagName) && $first.text() === '') {
						this.caret.setStartEmptyOrInline($first[0], true);
					}
					// block tag
					else {
						sel = window.getSelection();
						sel.removeAllRanges();
						
						range = document.createRange();
						range.selectNodeContents(node);
						range.collapse(true);
						sel.addRange(range);
					}
					
				},
				setStartEmptyOrInline: function (node, inline) {
					var sel = window.getSelection();
					var range = document.createRange();
					var textNode = document.createTextNode('\u200B');
					
					range.setStart(node, 0);
					range.insertNode(textNode);
					range.setStartAfter(textNode);
					range.collapse(true);
					
					sel.removeAllRanges();
					sel.addRange(range);
					
					// remove invisible text node
					if (!inline) {
						this.core.editor().on('keydown.redactor-remove-textnode', function () {
							$(textNode).remove();
							$(this).off('keydown.redactor-remove-textnode');
						});
					}
				},
				end: function (node) {
					var sel, range;
					node = this.caret.prepare(node);
					
					if (!node) {
						return;
					}
					
					// empty node
					if (node.tagName !== 'BR' && node.innerHTML === '') {
						return this.caret.start(node);
					}
					
					// br
					if (node.tagName === 'BR') {
						var space = document.createElement('span');
						space.className = 'redactor-invisible-space';
						space.innerHTML = '&#x200b;';
						
						$(node).after(space);
						
						sel = window.getSelection();
						sel.removeAllRanges();
						
						range = document.createRange();
						
						range.setStartBefore(space);
						range.setEndBefore(space);
						sel.addRange(range);
						
						$(space).replaceWith(function () {
							return $(this).contents();
						});
						
						return;
					}
					
					if (node.lastChild && node.lastChild.nodeType === 1) {
						return this.caret.after(node.lastChild);
					}
					
					var sel = window.getSelection();
					if (sel.getRangeAt || sel.rangeCount) {
						try {
							var range = sel.getRangeAt(0);
							range.selectNodeContents(node);
							range.collapse(false);
							
							sel.removeAllRanges();
							sel.addRange(range);
						}
						catch (e) {}
					}
				},
				after: function (node) {
					var sel, range;
					node = this.caret.prepare(node);
					
					if (!node) {
						return;
					}
					
					if (node.tagName === 'BR') {
						return this.caret.end(node);
					}
					
					// block tag
					if (this.utils.isBlockTag(node.tagName)) {
						var next = this.caret.next(node);
						
						if (typeof next === 'undefined') {
							this.caret.end(node);
						}
						else {
							// table
							if (next.tagName === 'TABLE') {
								next = $(next).find('th, td').first()[0];
							}
							// list
							else if (next.tagName === 'UL' || next.tagName === 'OL') {
								next = $(next).find('li').first()[0];
							}
							
							this.caret.start(next);
						}
						
						return;
					}
					else {
						var next = this.caret.next(node);
						if (next && next.nodeName === 'BR') {
							this.caret.before(next);

							return;
						}
					}
					
					// inline tag
					var textNode = document.createTextNode('\u200B');
					
					sel = window.getSelection();
					sel.removeAllRanges();
					
					range = document.createRange();
					range.setStartAfter(node);
					range.insertNode(textNode);
					range.setStartAfter(textNode);
					range.collapse(true);
					
					sel.addRange(range);
					
				},
				before: function (node) {
					var sel, range;
					node = this.caret.prepare(node);
					
					if (!node) {
						return;
					}
					
					// block tag
					if (this.utils.isBlockTag(node.tagName)) {
						var prev = this.caret.prev(node);
						
						if (typeof prev === 'undefined') {
							this.caret.start(node);
						}
						else {
							// table
							if (prev.tagName === 'TABLE') {
								prev = $(prev).find('th, td').last()[0];
							}
							// list
							else if (prev.tagName === 'UL' || prev.tagName === 'OL') {
								prev = $(prev).find('li').last()[0];
							}
							
							this.caret.end(prev);
						}
						
						return;
					}
					
					// inline tag
					sel = window.getSelection();
					sel.removeAllRanges();
					
					range = document.createRange();
					
					range.setStartBefore(node);
					range.collapse(true);
					
					sel.addRange(range);
				},
				next: function (node) {
					var $next = $(node).next();
					if ($next.hasClass('redactor-script-tag, redactor-selection-marker')) {
						return $next.next()[0];
					}
					else {
						return $next[0];
					}
				},
				prev: function (node) {
					var $prev = $(node).prev();
					if ($prev.hasClass('redactor-script-tag, redactor-selection-marker')) {
						return $prev.prev()[0];
					}
					else {
						return $prev[0];
					}
				},
				
				// #backward
				offset: function (node) {
					return this.offset.get(node);
				}
				
			};
		},
		
		// =clean
		clean: function () {
			return {
				onSet: function (html) {
					html = this.clean.savePreCode(html);
					
					// convert script tag
					if (this.opts.script) {
						html = html.replace(
							/<script(.*?[^>]?)>([\w\W]*?)<\/script>/gi,
							'<pre class="redactor-script-tag" $1>$2</pre>'
						);
					}
					
					// converting entity
					html = html.replace(/\$/g, '&#36;');
					html = html.replace(/&amp;/g, '&');
					
					// replace special characters in links
					html = html.replace(/<a href="(.*?[^>]?)®(.*?[^>]?)">/gi,
						'<a href="$1&reg$2">'
					);
					
					// save markers
					html = html.replace(/<span id="selection-marker-1"(.*?[^>]?)>​<\/span>/gi,
						'###marker1###'
					);
					html = html.replace(/<span id="selection-marker-2"(.*?[^>]?)>​<\/span>/gi,
						'###marker2###'
					);
					
					// replace tags
					var self = this;
					var $div = $('<div/>').html($.parseHTML(html, document, true));
					
					var replacement = this.opts.replaceTags;
					if (replacement) {
						var keys = Object.keys(this.opts.replaceTags);
						$div.find(keys.join(',')).each(function (i, s) {
							self.utils.replaceToTag(s,
								replacement[s.tagName.toLowerCase()]
							);
						});
					}
					
					// add span marker
					$div.find('span, a').attr('data-redactor-span', true);
					
					// add style cache
					$div.find(this.opts.inlineTags.join(',')).each(function () {
						// add style cache
						var $el = $(this);
						
						if ($el.attr('style')) {
							$el.attr('data-redactor-style-cache', $el.attr('style'));
						}
					});
					
					html = $div.html();
					
					// remove tags
					var tags = ['font', 'html', 'head', 'link', 'body', 'meta', 'applet'];
					if (!this.opts.script) {
						tags.push('script');
					}
					
					html = this.clean.stripTags(html, tags);
					
					// remove html comments
					if (this.opts.removeComments) {
						html = html.replace(/<!--[\s\S]*?-->/gi, '');
					}
					
					// paragraphize
					html = this.paragraphize.load(html);
					
					// restore markers
					html = html.replace(
						'###marker1###',
						'<span id="selection-marker-1" class="redactor-selection-marker">​</span>'
					);
					html = html.replace(
						'###marker2###',
						'<span id="selection-marker-2" class="redactor-selection-marker">​</span>'
					);
					
					// empty
					if (html.search(/^(||\s||<br\s?\/?>||&nbsp;)$/i) !== -1) {
						return this.opts.emptyHtml;
					}
					
					return html;
				},
				onGet: function (html) {
					return this.clean.onSync(html);
				},
				onSync: function (html) {
					// remove invisible spaces
					html = html.replace(/\u200B/g, '');
					html = html.replace(/&#x200b;/gi, '');
					//html = html.replace(/&nbsp;&nbsp;/gi, '&nbsp;');
					
					if (html.search(/^<p>(||\s||<br\s?\/?>||&nbsp;)<\/p>$/i) !== -1) {
						return '';
					}
					
					// remove image resize
					html = html.replace(
						/<span(.*?)id="redactor-image-box"(.*?[^>])>([\w\W]*?)<img(.*?)><\/span>/gi,
						'$3<img$4>'
					);
					html = html.replace(/<span(.*?)id="redactor-image-resizer"(.*?[^>])>(.*?)<\/span>/gi,
						''
					);
					html = html.replace(/<span(.*?)id="redactor-image-editter"(.*?[^>])>(.*?)<\/span>/gi,
						''
					);
					html = html.replace(
						/<img(.*?)style="(.*?)opacity: 0\.5;(.*?)"(.*?)>/gi,
						'<img$1style="$2$3"$4>'
					);
					
					var $div = $('<div/>').html($.parseHTML(html, document, true));
					
					// remove empty atributes
					$div.find('*[style=""]').removeAttr('style');
					$div.find('*[class=""]').removeAttr('class');
					$div.find('*[rel=""]').removeAttr('rel');
					$div.find('*[data-image=""]').removeAttr('data-image');
					$div.find('*[alt=""]').removeAttr('alt');
					$div.find('*[title=""]').removeAttr('title');
					$div.find('*[data-redactor-style-cache]').removeAttr('data-redactor-style-cache');
					
					// remove markers
					$div.find('.redactor-invisible-space, .redactor-unlink').each(function () {
						$(this).contents().unwrap();
					});
					
					// remove span without attributes & span marker
					$div.find('span, a').removeAttr('data-redactor-span data-redactor-style-cache').each(
						function () {
							if (this.attributes.length === 0) {
								$(this).contents().unwrap();
							}
						});
					
					// remove rel attribute from img
					$div.find('img').removeAttr('rel');
					
					$div.find('.redactor-selection-marker, #redactor-insert-marker').contents().unwrap();
					
					html = $div.html();
					
					// reconvert script tag
					if (this.opts.script) {
						html = html.replace(
							/<pre class="redactor-script-tag"(.*?[^>]?)>([\w\W]*?)<\/pre>/gi,
							'<script$1>$2</script>'
						);
					}
					
					// restore form tag
					html = this.clean.restoreFormTags(html);
					
					// remove br in|of li/header tags
					html = html.replace(new RegExp('<br\\s?/?></h', 'gi'), '</h');
					html = html.replace(new RegExp('<br\\s?/?></li>', 'gi'), '</li>');
					html = html.replace(new RegExp('</li><br\\s?/?>', 'gi'), '</li>');
					
					// pre class
					html = html.replace(/<pre>/gi, '<pre>\n');
					if (this.opts.preClass) {
						html = html.replace(/<pre>/gi,
							'<pre class="' + this.opts.preClass + '">'
						);
					}
					
					// link nofollow
					if (this.opts.linkNofollow) {
						html = html.replace(/<a(.*?)rel="nofollow"(.*?[^>])>/gi, '<a$1$2>');
						html = html.replace(/<a(.*?[^>])>/gi, '<a$1 rel="nofollow">');
					}
					
					// replace special characters
					var chars = {
						'\u2122': '&trade;',
						'\u00a9': '&copy;',
						'\u2026': '&hellip;',
						'\u2014': '&mdash;',
						'\u2010': '&dash;'
					};
					
					$.each(chars, function (i, s) {
						html = html.replace(new RegExp(i, 'g'), s);
					});
					
					html = html.replace(/&amp;/g, '&');
					
					// remove empty paragpraphs
					//html = html.replace(/<p><\/p>/gi, "");
					
					// remove new lines
					html = html.replace(/\n{2,}/g, '\n');
					
					// remove all newlines
					if (this.opts.removeNewlines) {
						html = html.replace(/\r?\n/g, '');
					}
					
					return html;
				},
				onPaste: function (html, data, insert) {
					// if paste event
					if (insert !== true) {
						// remove google docs markers
						html = html.replace(/<b\sid="internal-source-marker(.*?)">([\w\W]*?)<\/b>/gi,
							'$2'
						);
						html = html.replace(/<b(.*?)id="docs-internal-guid(.*?)">([\w\W]*?)<\/b>/gi,
							'$3'
						);
						
						// google docs styles
						html = html.replace(
							/<span[^>]*(font-style: italic; font-weight: bold|font-weight: bold; font-style: italic)[^>]*>([\w\W]*?)<\/span>/gi,
							'<b><i>$2</i></b>'
						);
						html = html.replace(
							/<span[^>]*(font-style: italic; font-weight: 700|font-weight: 700; font-style: italic)[^>]*>([\w\W]*?)<\/span>/gi,
							'<b><i>$2</i></b>'
						);
						html = html.replace(
							/<span[^>]*font-style: italic[^>]*>([\w\W]*?)<\/span>/gi,
							'<i>$1</i>'
						);
						html = html.replace(
							/<span[^>]*font-weight: bold[^>]*>([\w\W]*?)<\/span>/gi,
							'<b>$1</b>'
						);
						html = html.replace(
							/<span[^>]*font-weight: 700[^>]*>([\w\W]*?)<\/span>/gi,
							'<b>$1</b>'
						);
						
						// op tag
						html = html.replace(/<o:p[^>]*>/gi, '');
						html = html.replace(/<\/o:p>/gi, '');
						
						var msword = this.clean.isHtmlMsWord(html);
						if (msword) {
							html = this.clean.cleanMsWord(html);
						}
					}
					
					html = $.trim(html);
					
					if (data.pre) {
						if (this.opts.preSpaces) {
							html = html.replace(/\t/g,
								new Array(this.opts.preSpaces + 1).join(' ')
							);
						}
					}
					else {
						
						html = this.clean.replaceBrToNl(html);
						html = this.clean.removeTagsInsidePre(html);
					}
					
					// if paste event
					if (insert !== true) {
						html = this.clean.removeEmptyInlineTags(html);
						
						if (data.encode === false) {
							html = html.replace(/&/g, '&amp;');
							html = this.clean.convertTags(html, data);
							html = this.clean.getPlainText(html);
							html = this.clean.reconvertTags(html, data);
						}
						
					}
					
					if (data.text) {
						html = this.clean.replaceNbspToSpaces(html);
						html = this.clean.getPlainText(html);
					}
					
					if (data.lists) {
						html = html.replace('\n', '<br>');
					}
					
					if (data.encode) {
						html = this.clean.encodeHtml(html);
					}
					
					if (data.paragraphize) {
						// ff bugfix
						html = html.replace(/ \n/g, ' ');
						html = html.replace(/\n /g, ' ');
						
						html = this.paragraphize.load(html);
						
						// remove empty p
						html = html.replace(/<p><\/p>/g, '');
					}
					
					// remove paragraphs form lists (google docs bug)
					html = html.replace(/<li><p>/g, '<li>');
					html = html.replace(/<\/p><\/li>/g, '</li>');
					
					return html;
					
				},
				getCurrentType: function (html, insert) {
					var blocks = this.selection.blocks();
					
					var data = {
						text: false,
						encode: false,
						paragraphize: true,
						line: this.clean.isHtmlLine(html),
						blocks: this.clean.isHtmlBlocked(html),
						pre: false,
						lists: false,
						block: true,
						inline: true,
						links: true,
						images: true
					};
					
					if (blocks.length === 1 && this.utils.isCurrentOrParent([
						'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'figcaption'
					])) {
						data.text = true;
						data.paragraphize = false;
						data.inline = false;
						data.images = false;
						data.links = false;
						data.line = true;
					}
					else if (this.opts.type === 'inline' || this.opts.enterKey === false) {
						data.paragraphize = false;
						data.block = false;
						data.line = true;
					}
					else if (blocks.length === 1 && this.utils.isCurrentOrParent(['li'])) {
						data.lists = true;
						data.block = false;
						data.paragraphize = false;
						data.images = false;
					}
					else if (blocks.length === 1 && this.utils.isCurrentOrParent([
						'th', 'td', 'blockquote'
					])) {
						data.block = false;
						data.paragraphize = false;
						
					}
					else if (this.opts.type === 'pre' || (blocks.length === 1 && this.utils.isCurrentOrParent(
						'pre'))) {
						data.inline = false;
						data.block = false;
						data.encode = true;
						data.pre = true;
						data.paragraphize = false;
						data.images = false;
						data.links = false;
					}
					
					if (data.line === true) {
						data.paragraphize = false;
					}
					
					if (insert === true) {
						data.text = false;
					}
					
					return data;
					
				},
				isHtmlBlocked: function (html) {
					var match1 = html.match(new RegExp('</(' + this.opts.blockTags.join('|').toUpperCase() + ')>',
						'gi'
					));
					var match2 = html.match(new RegExp('<hr(.*?[^>])>', 'gi'));
					
					return (match1 === null && match2 === null) ? false : true;
				},
				isHtmlLine: function (html) {
					if (this.clean.isHtmlBlocked(html)) {
						return false;
					}
					
					var matchBR = html.match(/<br\s?\/?>/gi);
					var matchNL = html.match(/\n/gi);
					
					return (!matchBR && !matchNL) ? true : false;
				},
				isHtmlMsWord: function (html) {
					return html.match(
						/class="?Mso|style="[^"]*\bmso-|style='[^'']*\bmso-|w:WordDocument/i);
				},
				removeEmptyInlineTags: function (html) {
					var tags = this.opts.inlineTags;
					var $div = $('<div/>').html($.parseHTML(html, document, true));
					var self = this;
					
					var $spans = $div.find('span');
					var $tags = $div.find(tags.join(','));
					
					$tags.removeAttr('style');
					
					$tags.each(function () {
						var tagHtml = $(this).html();
						if (this.attributes.length === 0 && self.utils.isEmpty(tagHtml)) {
							$(this).replaceWith(function () {
								return $(this).contents();
							});
						}
					});
					
					$spans.each(function () {
						var tagHtml = $(this).html();
						if (this.attributes.length === 0) {
							$(this).replaceWith(function () {
								return $(this).contents();
							});
						}
					});
					
					html = $div.html();
					
					// convert php tags
					html = html.replace('<!--?php', '<?php');
					html = html.replace('<!--?', '<?');
					html = html.replace('?-->', '?>');
					
					$div.remove();
					
					return html;
				},
				cleanMsWord: function (html) {
					html = html.replace(/<!--[\s\S]*?-->/g, '');
					html = html.replace(/<o:p>[\s\S]*?<\/o:p>/gi, '');
					html = html.replace(/\n/g, ' ');
					html = html.replace(/<\/p>/gi, '</p><p><br data-redactor="br"></p>');
					html = html.replace(/<\/div>|<\/li>|<\/td>/gi, '\n\n');
					
					var $div = $('<div/>').html(html);
					
					// Find any <p> that contains a <br> and split it into separate paragraphs.
					/** @var {Element} br */
					elBySelAll('br', $div[0], function(br) {
						if (elData(br, 'redactor') === 'br') {
							br.removeAttribute('data-redactor');
						}
						else {
							var parent = br.parentNode;
							if (parent && parent.nodeName === 'P') {
								var paragraph = elCreate('p');
								while (br.nextSibling) {
									paragraph.appendChild(br.nextSibling);
								}
								parent.parentNode.insertBefore(paragraph, parent.nextSibling);
								elRemove(br);
							}
						}
					});
					
					// lists
					var lastList = false;
					var lastLevel = 1;
					var listsIds = [];
					
					$div.find('p[style]').each(function () {
						var matches = $(this).attr('style').match(
							/mso\-list\:l([0-9]+)\slevel([0-9]+)/);
						
						if (matches) {
							var currentList = parseInt(matches[1]);
							var currentLevel = parseInt(matches[2]);
							var listType = $(this).html().match(/^[\w]+\./) ? 'ol' : 'ul';
							
							var $li = $('<li/>').html($(this).html());
							
							$li.html($li.html().replace(/^([\w\.]+)</, '<'));
							$li.find('span:first').remove();
							
							if (currentLevel == 1 && $.inArray(currentList,
								listsIds
							) == -1) {
								var $list = $('<' + listType + '/>').attr({
									'data-level': currentLevel,
									'data-list': currentList
								}).html($li);
								$(this).replaceWith($list);
								
								lastList = currentList;
								listsIds.push(currentList);
							}
							else {
								if (currentLevel > lastLevel) {
									var $prevList = $div.find('[data-level="' + lastLevel + '"][data-list="' + lastList + '"]');
									var $lastList = $prevList;
									
									for (var i = lastLevel; i < currentLevel; i++) {
										$list = $('<' + listType + '/>');
										$list.appendTo($lastList.find('li').last());
										
										$lastList = $list;
									}
									
									$lastList.attr({
										'data-level': currentLevel,
										'data-list': currentList
									}).html($li);
									
								}
								else {
									var $prevList = $div.find('[data-level="' + currentLevel + '"][data-list="' + currentList + '"]').last();
									
									$prevList.append($li);
								}
								
								lastLevel = currentLevel;
								lastList = currentList;
								
								$(this).remove();
							}
						}
					});
					
					$div.find('[data-level][data-list]').removeAttr('data-level data-list');
					
					// Find lists at the top level that are surrounded by `<p><br></p>`.
					elBySelAll('ol, ul', $div[0], function(list) {
						['nextElementSibling', 'previousElementSibling'].forEach(function(property) {
							var sibling = list[property];
							while (sibling && sibling.nodeName === 'P' && sibling.className === '') {
								if (sibling.innerHTML !== '<br>') {
									break;
								}
								
								elRemove(sibling);
								sibling = list[property];
							}
						});
					});
					
					html = $div.html();
					
					return html;
				},
				replaceNbspToSpaces: function (html) {
					return html.replace('&nbsp;', ' ');
				},
				replaceBrToNl: function (html) {
					return html.replace(/<br\s?\/?>/gi, '\n');
				},
				replaceNlToBr: function (html) {
					return html.replace(/\n/g, '<br />');
				},
				convertTags: function (html, data) {
					var $div = $('<div>').html(html);
					
					// remove iframe
					$div.find('iframe').remove();
					
					// link target & attrs
					var $links = $div.find('a');
					$links.removeAttr('style');
					if (this.opts.pasteLinkTarget !== false) {
						$links.attr('target', this.opts.pasteLinkTarget);
					}
					
					// links
					if (data.links && this.opts.pasteLinks) {
						$div.find('a').each(function (i, link) {
							if (link.href) {
								var tmp = '#####[a href="' + link.href + '"';
								var attr;
								for (var j = 0, length = link.attributes.length; j < length; j++) {
									attr = link.attributes.item(j);
									if (attr.name !== 'href') {
										tmp += ' ' + attr.name + '="' + attr.value + '"';
									}
								}
								
								link.outerHTML = tmp + ']#####' + link.innerHTML + '#####[/a]#####';
							}
						});
					}
					
					html = $div.html();
					
					// images
					if (data.images && this.opts.pasteImages) {
						html = html.replace(
							/<img(.*?)src="(.*?)"(.*?[^>])>/gi,
							'#####[img$1src="$2"$3]#####'
						);
					}
					
					// plain text
					if (this.opts.pastePlainText) {
						return html;
					}
					
					// all tags
					var blockTags = (data.lists) ? ['ul', 'ol', 'li'] : this.opts.pasteBlockTags;
					
					var tags;
					if (data.block || data.lists) {
						tags = (data.inline) ? blockTags.concat(this.opts.pasteInlineTags) : blockTags;
					}
					else {
						tags = (data.inline) ? this.opts.pasteInlineTags : [];
					}
					
					var len = tags.length;
					for (var i = 0; i < len; i++) {
						html = html.replace(new RegExp('<\/' + tags[i] + '>', 'gi'),
							'###/' + tags[i] + '###'
						);
						
						if (tags[i] === 'td' || tags[i] === 'th') {
							html = html.replace(new RegExp(
								'<' + tags[i] + '([^>]*?)>',
								'gi'
							), '###' + tags[i] + ' $1###');
						}
						else if (this.utils.isInlineTag(tags[i])) {
							html = html.replace(
								new RegExp('<' + tags[i] + '([^>]*)class="([^>]*)"[^>]*>',
									'gi'
								),
								'###' + tags[i] + ' class="$2"###'
							);
							html = html.replace(new RegExp(
								'<' + tags[i] + '([^>]*)data-redactor-style-cache="([^>]*)"[^>]*>',
								'gi'
							), '###' + tags[i] + ' cache="$2"###');
							html = html.replace(new RegExp('<' + tags[i] + '[^>]*>', 'gi'),
								'###' + tags[i] + '###'
							);
						}
						else {
							html = html.replace(new RegExp('<' + tags[i] + '[^>]*>', 'gi'),
								'###' + tags[i] + '###'
							);
						}
					}
					
					return html;
					
				},
				reconvertTags: function (html, data) {
					// links & images
					if ((data.links && this.opts.pasteLinks) || (data.images && this.opts.pasteImages)) {
						html = html.replace(new RegExp('#####\\[', 'gi'), '<');
						html = html.replace(new RegExp('\\]#####', 'gi'), '>');
					}
					
					// plain text
					if (this.opts.pastePlainText) {
						return html;
					}
					
					var blockTags = (data.lists) ? ['ul', 'ol', 'li'] : this.opts.pasteBlockTags;
					
					var tags;
					if (data.block || data.lists) {
						tags = (data.inline) ? blockTags.concat(this.opts.pasteInlineTags) : blockTags;
					}
					else {
						tags = (data.inline) ? this.opts.pasteInlineTags : [];
					}
					
					var len = tags.length;
					for (var i = 0; i < len; i++) {
						html = html.replace(new RegExp('###\/' + tags[i] + '###', 'gi'),
							'</' + tags[i] + '>'
						);
					}
					
					for (var i = 0; i < len; i++) {
						html = html.replace(new RegExp('###' + tags[i] + '###', 'gi'),
							'<' + tags[i] + '>'
						);
					}
					
					for (var i = 0; i < len; i++) {
						if (tags[i] === 'td' || tags[i] === 'th') {
							html = html.replace(
								new RegExp('###' + tags[i] + '(?:\\s?|\\s([^#]*?))###', 'gi'),
								'<' + tags[i] + '$1>'
							);
						}
						else if (this.utils.isInlineTag(tags[i])) {
							
							var spanMarker = (tags[i] === 'span') ? ' data-redactor-span="true"' : '';
							
							html = html.replace(new RegExp('###' + tags[i] + ' cache="(.*?[^#])"###',
								'gi'
								),
								'<' + tags[i] + ' style="$1"' + spanMarker + ' data-redactor-style-cache="$1">'
							);
							html = html.replace(
								new RegExp('###' + tags[i] + '\s?(.*?[^#])###', 'gi'),
								'<' + tags[i] + '$1>'
							);
						}
					}
					
					return html;
					
				},
				cleanPre: function (block) {
					block = (typeof block === 'undefined') ? $(this.selection.block()).closest('pre',
						this.core.editor()[0]
					) : block;
					
					$(block).find('br').replaceWith(function () {
						return document.createTextNode('\n');
					});
					
					$(block).find('p').replaceWith(function () {
						return $(this).contents();
					});
					
				},
				removeTagsInsidePre: function (html) {
					var $div = $('<div />').append(html);
					$div.find('pre').replaceWith(function () {
						var str = $(this).html();
						str = str.replace(/<br\s?\/?>|<\/p>|<\/div>|<\/li>|<\/td>/gi, '\n');
						str = str.replace(/(<([^>]+)>)/gi, '');
						
						return $('<pre />').append(str);
					});
					
					html = $div.html();
					$div.remove();
					
					return html;
					
				},
				getPlainText: function (html) {
					html = html.replace(/<!--[\s\S]*?-->/gi, '');
					html = html.replace(/<style[\s\S]*?style>/gi, '');
					html = html.replace(/<p><\/p>/g, '');
					html = html.replace(/<\/div>|<\/li>|<\/td>/gi, '\n');
					html = html.replace(/<\/p>/gi, '\n\n');
					html = html.replace(/<\/H[1-6]>/gi, '\n\n');
					
					var tmp = document.createElement('div');
					tmp.innerHTML = html;
					html = tmp.textContent || tmp.innerText;
					
					return $.trim(html);
				},
				savePreCode: function (html) {
					html = this.clean.savePreFormatting(html);
					html = this.clean.saveCodeFormatting(html);
					html = this.clean.restoreSelectionMarkers(html);
					
					return html;
				},
				savePreFormatting: function (html) {
					var pre = html.match(/<pre(.*?)>([\w\W]*?)<\/pre>/gi);
					if (pre === null) {
						return html;
					}
					
					$.each(pre, $.proxy(function (i, s) {
						var arr = [];
						var codeTag = false;
						var contents, attr1, attr2;
						
						if (s.match(/<pre(.*?)>(([\n\r\s]+)?)<code(.*?)>/i)) {
							arr = s.match(
								/<pre(.*?)>(([\n\r\s]+)?)<code(.*?)>([\w\W]*?)<\/code>(([\n\r\s]+)?)<\/pre>/i);
							codeTag = true;
							
							contents = arr[5];
							attr1 = arr[1];
							attr2 = arr[4];
						}
						else {
							arr = s.match(/<pre(.*?)>([\w\W]*?)<\/pre>/i);
							
							contents = arr[2];
							attr1 = arr[1];
						}
						
						contents = contents.replace(/<br\s?\/?>/g, '\n');
						contents = contents.replace(/&nbsp;/g, ' ');
						
						if (this.opts.preSpaces) {
							contents = contents.replace(/\t/g,
								new Array(this.opts.preSpaces + 1).join(' ')
							);
						}
						
						contents = this.clean.encodeEntities(contents);
						
						// $ fix
						contents = contents.replace(/\$/g, '&#36;');
						
						if (codeTag) {
							html = html.replace(s,
								'<pre' + attr1 + '><code' + attr2 + '>' + contents + '</code></pre>'
							);
						}
						else {
							html = html.replace(s,
								'<pre' + attr1 + '>' + contents + '</pre>'
							);
						}
						
					}, this));
					
					return html;
				},
				saveCodeFormatting: function (html) {
					var code = html.match(/<code(.*?)>([\w\W]*?)<\/code>/gi);
					if (code === null) {
						return html;
					}
					
					$.each(code, $.proxy(function (i, s) {
						var arr = s.match(/<code(.*?)>([\w\W]*?)<\/code>/i);
						
						arr[2] = arr[2].replace(/&nbsp;/g, ' ');
						arr[2] = this.clean.encodeEntities(arr[2]);
						arr[2] = arr[2].replace(/\$/g, '&#36;');
						
						html = html.replace(s, '<code' + arr[1] + '>' + arr[2] + '</code>');
						
					}, this));
					
					return html;
				},
				restoreSelectionMarkers: function (html) {
					html = html.replace(
						/&lt;span id=&quot;selection-marker-([0-9])&quot; class=&quot;redactor-selection-marker&quot;&gt;​&lt;\/span&gt;/g,
						'<span id="selection-marker-$1" class="redactor-selection-marker">​</span>'
					);
					
					return html;
				},
				saveFormTags: function (html) {
					return html;
				},
				restoreFormTags: function (html) {
					return html.replace(
						/<section(.*?) rel="redactor-form-tag"(.*?)>([\w\W]*?)<\/section>/gi,
						'<form$1$2>$3</form>'
					);
				},
				encodeHtml: function (html) {
					html = html.replace(/”/g, '"');
					html = html.replace(/“/g, '"');
					html = html.replace(/‘/g, '\'');
					html = html.replace(/’/g, '\'');
					html = this.clean.encodeEntities(html);
					
					return html;
				},
				encodeEntities: function (str) {
					str = String(str).replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g,
						'>'
					).replace(/&quot;/g, '"');
					str = str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g,
						'&gt;'
					).replace(/"/g, '&quot;');
					
					return str;
				},
				stripTags: function (input, denied) {
					if (typeof denied === 'undefined') {
						return input.replace(/(<([^>]+)>)/gi, '');
					}
					
					var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
					
					return input.replace(tags, function ($0, $1) {
						return denied.indexOf($1.toLowerCase()) === -1 ? $0 : '';
					});
				},
				removeMarkers: function (html) {
					return html.replace(
						/<span(.*?[^>]?)class="redactor-selection-marker"(.*?[^>]?)>([\w\W]*?)<\/span>/gi,
						''
					);
				},
				removeSpaces: function (html) {
					html = $.trim(html);
					html = html.replace(/\n/g, '');
					html = html.replace(/[\t]*/g, '');
					html = html.replace(/\n\s*\n/g, '\n');
					html = html.replace(/^[\s\n]*/g, ' ');
					html = html.replace(/[\s\n]*$/g, ' ');
					html = html.replace(/>\s{2,}</g, '> <'); // between inline tags can be only one space
					html = html.replace(/\n\n/g, '\n');
					html = html.replace(/\u200B/g, '');
					
					return html;
				},
				removeSpacesHard: function (html) {
					html = $.trim(html);
					html = html.replace(/\n/g, '');
					html = html.replace(/[\t]*/g, '');
					html = html.replace(/\n\s*\n/g, '\n');
					html = html.replace(/^[\s\n]*/g, '');
					html = html.replace(/[\s\n]*$/g, '');
					html = html.replace(/>\s{2,}</g, '><');
					html = html.replace(/\n\n/g, '\n');
					html = html.replace(/\u200B/g, '');
					
					return html;
				},
				normalizeCurrentHeading: function () {
					var heading = this.selection.block();
					if (this.utils.isCurrentOrParentHeader() && heading) {
						heading.normalize();
					}
				}
			};
		},
		
		// =code
		code: function () {
			return {
				syncFire: true,
				html: false,
				start: function (html) {
					html = $.trim(html);
					html = html.replace(
						/^(<span id="selection-marker-1" class="redactor-selection-marker">​<\/span>)/,
						''
					);
					
					html = this.clean.onSet(html);
					
					html = html.replace(
						/<p><span id="selection-marker-1" class="redactor-selection-marker">​<\/span><\/p>/,
						''
					);
					
					this.events.stopDetectChanges();
					this.core.editor().html(html);
					
					this.observe.load();
					this.events.startDetectChanges();
				},
				set: function (html, options) {
					html = $.trim(html);
					
					options = options || {};
					
					// start
					if (options.start) {
						this.start = options.start;
					}
					
					// clean
					if (this.opts.type === 'textarea') {
						html = this.clean.onSet(html);
					}
					else if (this.opts.type === 'div' && html === '') {
						html = this.opts.emptyHtml;
					}
					
					this.core.editor().html(html);
					
					if (this.opts.type === 'textarea') {
						this.code.sync();
					}
				},
				get: function () {
					if (this.opts.type === 'textarea') {
						return this.core.textarea().val();
					}
					else {
						var html = this.core.editor().html();
						
						// clean
						html = this.clean.onGet(html);
						
						return html;
					}
				},
				sync: function () {
					if (!this.code.syncFire) {
						return;
					}
					
					var html = this.core.editor().html();
					var htmlCleaned = this.code.cleaned(html);
					
					// is there a need to synchronize
					if (this.code.isSync(htmlCleaned)) {
						// do not sync
						return;
					}
					
					// save code
					this.code.html = htmlCleaned;
					
					if (this.opts.type !== 'textarea') {
						this.core.callback('sync', html);
						this.core.callback('change', html);
						return;
					}
					
					if (this.opts.type === 'textarea') {
						setTimeout($.proxy(function () {
							this.code.startSync(html);
							
						}, this), 10);
					}
				},
				startSync: function (html) {
					// before clean callback
					html = this.core.callback('syncBefore', html);
					
					// clean
					html = this.clean.onSync(html);
					
					// set code
					this.core.textarea().val(html);
					
					// after sync callback
					this.core.callback('sync', html);
					
					// change callback
					if (this.start === false) {
						this.core.callback('change', html);
					}
					
					this.start = false;
				},
				isSync: function (htmlCleaned) {
					var html = (this.code.html !== false) ? this.code.html : false;
					
					return (html !== false && html === htmlCleaned);
				},
				cleaned: function (html) {
					html = html.replace(/\u200B/g, '');
					return this.clean.removeMarkers(html);
				}
			};
		},
		
		// =core
		core: function () {
			return {
				
				id: function () {
					return this.$editor.attr('id');
				},
				element: function () {
					return this.$element;
				},
				editor: function () {
					return (typeof this.$editor === 'undefined') ? $() : this.$editor;
				},
				textarea: function () {
					return this.$textarea;
				},
				box: function () {
					return (this.opts.type === 'textarea') ? this.$box : this.$element;
				},
				toolbar: function () {
					return (this.$toolbar) ? this.$toolbar : false;
				},
				air: function () {
					return (this.$air) ? this.$air : false;
				},
				object: function () {
					return $.extend({}, this);
				},
				structure: function () {
					this.core.editor().toggleClass('redactor-structure');
				},
				addEvent: function (name) {
					this.core.event = name;
				},
				getEvent: function () {
					return this.core.event;
				},
				callback: function (type, e, data) {
					var eventNamespace = 'redactor';
					var returnValue = false;
					var events = $._data(this.core.element()[0], 'events');
					
					// on callback
					if (typeof events !== 'undefined' && typeof events[type] !== 'undefined') {
						var len = events[type].length;
						for (var i = 0; i < len; i++) {
							var namespace = events[type][i].namespace;
							if (namespace === 'callback.' + eventNamespace) {
								var handler = events[type][i].handler;
								var args = (typeof data === 'undefined') ? [e] : [
									e, data
								];
								returnValue = (typeof args === 'undefined') ? handler.call(this,
									e
								) : handler.call(this, e, args);
							}
						}
					}
					
					if (returnValue) {
						return returnValue;
					}
					
					// no callback
					if (typeof this.opts.callbacks[type] === 'undefined') {
						return (typeof data === 'undefined') ? e : data;
					}
					
					// callback
					var callback = this.opts.callbacks[type];
					
					if ($.isFunction(callback)) {
						return (typeof data === 'undefined') ? callback.call(this,
							e
						) : callback.call(this, e, data);
					}
					else {
						return (typeof data === 'undefined') ? e : data;
					}
				},
				destroy: function () {
					this.opts.destroyed = true;
					
					this.core.callback('destroy');
					
					// help label
					$('#redactor-voice-' + this.uuid).remove();
					
					this.core.editor().removeClass(
						'redactor-in redactor-styles redactor-structure redactor-layer-img-edit');
					
					// caret service
					this.core.editor().off('keydown.redactor-remove-textnode');
					
					// observer
					this.core.editor().off('.redactor-observe.' + this.uuid);
					
					// off events and remove data
					this.$element.off('.redactor').removeData('redactor');
					this.core.editor().off('.redactor');
					
					$(document).off('.redactor-air.' + this.uuid);
					$(document).off('mousedown.redactor-blur.' + this.uuid);
					$(document).off('mousedown.redactor.' + this.uuid);
					$(document).off('touchstart.redactor.' + this.uuid + ' click.redactor.' + this.uuid);
					$(window).off('.redactor-toolbar.' + this.uuid);
					$(window).off('touchmove.redactor.' + this.uuid);
					$('body').off('scroll.redactor.' + this.uuid);
					
					$(this.opts.toolbarFixedTarget).off('scroll.redactor.' + this.uuid);
					
					// plugins events
					var self = this;
					if (this.opts.plugins !== false) {
						$.each(this.opts.plugins, function (i, s) {
							$(window).off('.redactor-plugin-' + s);
							$(document).off('.redactor-plugin-' + s);
							$('body').off('.redactor-plugin-' + s);
							self.core.editor().off('.redactor-plugin-' + s);
						});
					}
					
					// click to edit
					this.$element.off('click.redactor-click-to-edit');
					this.$element.removeClass('redactor-click-to-edit');
					
					// common
					this.core.editor().removeClass('redactor-layer');
					this.core.editor().removeAttr('contenteditable');
					
					var html = this.code.get();
					
					if (this.opts.toolbar && this.$toolbar) {
						// dropdowns off
						this.$toolbar.find('a').each(function () {
							var $el = $(this);
							if ($el.data('dropdown')) {
								$el.data('dropdown').remove();
								$el.data('dropdown', {});
							}
						});
					}
					
					if (this.opts.type === 'textarea') {
						this.$box.after(this.$element);
						this.$box.remove();
						this.$element.val(html).show();
					}
					
					if (this.opts.toolbar && this.$toolbar) {
						this.$toolbar.remove();
					}
					
					// modal
					if (this.$modalBox) {
						this.$modalBox.remove();
					}
					
					if (this.$modalOverlay) {
						this.$modalOverlay.remove();
					}
					
					// hide link's tooltip
					$('.redactor-link-tooltip').remove();
				}
			};
		},
		
		// =detect
		detect: function () {
			return {
				
				// public
				isWebkit: function () {
					return /webkit/.test(this.opts.userAgent);
				},
				isFirefox: function () {
					return this.opts.userAgent.indexOf('firefox') > -1;
				},
				isIe: function (v) {
					if (document.documentMode || /Edge/.test(navigator.userAgent)) {
						return 'edge';
					}
					
					var ie;
					ie = RegExp('msie' + (!isNaN(v) ? ('\\s' + v) : ''),
						'i'
					).test(navigator.userAgent);
					
					if (!ie) {
						ie = !!navigator.userAgent.match(/Trident.*rv[ :]*11\./);
					}
					
					return ie;
				},
				isMobile: function () {
					return /(iPhone|iPod|BlackBerry|Android)/.test(navigator.userAgent);
				},
				isDesktop: function () {
					return !/(iPhone|iPod|iPad|BlackBerry|Android)/.test(navigator.userAgent);
				},
				isIpad: function () {
					return /iPad/.test(navigator.userAgent);
				}
				
			};
		},
		
		// =dropdown
		dropdown: function () {
			return {
				active: false,
				button: false,
				key: false,
				position: [],
				getDropdown: function () {
					return this.dropdown.active;
				},
				build: function (name, $dropdown, dropdownObject) {
					var btnObject, fragment = document.createDocumentFragment();
					for (var btnName in dropdownObject) {
						if (dropdownObject.hasOwnProperty(btnName)) {
							btnObject = dropdownObject[btnName];
							
							var item = this.dropdown.buildItem(btnName, btnObject);
							
							this.observe.addDropdown($(item), btnName, btnObject);
							fragment.appendChild(item);
						}
					}
					
					var hasItems = false;
					for (var i = 0, length = fragment.childNodes.length; i < length; i++) {
						if (fragment.childNodes[i].nodeType === Node.ELEMENT_NODE) {
							hasItems = true;
							break;
						}
					}
					
					if (hasItems) {
						$dropdown[0].rel = name;
						$dropdown[0].appendChild(fragment);
					}
				},
				buildFormatting: function () {},
				buildItem: function (btnName, btnObject) {
					var itemContainer = elCreate('li');
					if (typeof btnObject.classname !== 'undefined') {
						itemContainer.classList.add(btnObject.classname);
					}
					
					if (btnName.toLowerCase().indexOf('divider') === 0) {
						itemContainer.classList.add('redactor-dropdown-divider');
						
						return itemContainer;
					}
					
					itemContainer.innerHTML = '<a href="#" class="redactor-dropdown-' + btnName + '" role="button"><span>' + btnObject.title + '</span></a>';
					// Use a jQuery event here to support the unbinding of the event listener in
					// existing "3rdParty" code.
					$(itemContainer.children[0]).on('mousedown', (function(event) {
						event.preventDefault();
						
						this.dropdown.buildClick(event, btnName, btnObject);
					}).bind(this));
					
					return itemContainer;
				},
				buildClick: function (e, btnName, btnObject) {
					if ($(e.target).hasClass('redactor-dropdown-link-inactive')) {
						return;
					}
					
					var command = this.dropdown.buildCommand(btnObject);
					
					if (typeof btnObject.args !== 'undefined') {
						this.button.toggle(e,
							btnName,
							command.type,
							command.callback,
							btnObject.args
						);
					}
					else {
						this.button.toggle(e, btnName, command.type, command.callback);
					}
				},
				buildCommand: function (btnObject) {
					var command = {};
					command.type = 'func';
					command.callback = btnObject.func;
					
					if (btnObject.command) {
						command.type = 'command';
						command.callback = btnObject.command;
					}
					else if (btnObject.dropdown) {
						command.type = 'dropdown';
						command.callback = btnObject.dropdown;
					}
					
					return command;
				},
				show: function (e, key) {
					if (this.detect.isDesktop()) {
						this.core.editor().focus();
					}
					
					this.dropdown.hideAll(false, key);
					
					this.dropdown.key = key;
					this.dropdown.button = this.button.get(this.dropdown.key);
					
					require(['Ui/SimpleDropdown'], (function(UiSimpleDropdown) {
						var dropdownId = this.dropdown.button[0].id;

						if (this.detect.isMobile() && !UiSimpleDropdown.isOpen(dropdownId)) {
							this.selection.save();
						}
						
						UiSimpleDropdown.toggleDropdown(dropdownId);
						if (UiSimpleDropdown.isOpen(dropdownId)) {
							this.dropdown.active = $(UiSimpleDropdown.getDropdownMenu(dropdownId));
							
							this.core.callback('dropdownShow', {
								dropdown: this.dropdown.active,
								key: this.dropdown.key,
								button: this.dropdown.button
							});
							
							this.button.setActive(this.dropdown.key);
							this.dropdown.button.addClass('dropact').attr('aria-expanded', true);
							
							this.dropdown.enableCallback();
						}
						else {
							this.dropdown.hide();
						}
					}).bind(this));
					
					e.preventDefault();
				},
				showIsFixedToolbar: function () {},
				showIsUnFixedToolbar: function () {},
				enableEvents: function () {},
				enableCallback: function () {
					this.core.callback('dropdownShown', {
						dropdown: this.dropdown.active,
						key: this.dropdown.key,
						button: this.dropdown.button
					});
				},
				getButtonPosition: function () {},
				closeHandler: function () {},
				hideAll: function (e, key) { this.dropdown.hideOut(key); },
				hide: function () { this.dropdown.hideOut(); },
				hideOut: function (key) {
					if (this.dropdown.active === false) {
						return;
					}
					
					if (this.dropdown.button[0].rel === key) {
						return;
					}
					
					this.core.callback('dropdownHide', this.dropdown.active);
					
					var id = this.dropdown.button[0].id;
					require(['Ui/SimpleDropdown'], function(UiSimpleDropdown) {
						UiSimpleDropdown.close(id);
					});
					
					this.dropdown.button.removeClass('redactor-act dropact').attr('aria-expanded', false);
					this.dropdown.button = false;
					this.dropdown.key = false;
					this.dropdown.active = false;
				}
			};
		},
		
		// =events
		events: function () {
			return {
				focused: false,
				blured: true,
				dropImage: false,
				stopChanges: false,
				stopDetectChanges: function () {
					this.events.stopChanges = true;
				},
				startDetectChanges: function () {
					var self = this;
					setTimeout(function () {
						self.events.stopChanges = false;
					}, 1);
				},
				dragover: function (e) {
					e.preventDefault();
					
					if (e.target.tagName === 'IMG') {
						$(e.target).addClass('redactor-image-dragover');
					}
					
				},
				dragleave: function (e) {
					// remove image dragover
					this.core.editor().find('img').removeClass('redactor-image-dragover');
				},
				drop: function (e) {
					e = e.originalEvent || e;
					
					// remove image dragover
					this.core.editor().find('img').removeClass('redactor-image-dragover');
					
					if (this.opts.type === 'inline' || this.opts.type === 'pre') {
						e.preventDefault();
						return false;
					}
					
					if (window.FormData === undefined || !e.dataTransfer) {
						return true;
					}
					
					if (e.dataTransfer.files.length === 0) {
						return this.events.onDrop(e);
					}
					else {
						this.events.onDropUpload(e);
					}
					
					this.core.callback('drop', e);
					
				},
				click: function (e) {
					var event = this.core.getEvent();
					var type = (event === 'click' || event === 'arrow') ? false : 'click';
					
					this.core.addEvent(type);
					this.utils.disableSelectAll();
					this.core.callback('click', e);
				},
				focus: function (e) {
					if (this.rtePaste) {
						return;
					}
					
					if (this.events.isCallback('focus')) {
						this.core.callback('focus', e);
					}
					
					this.events.focused = true;
					this.events.blured = false;
					
					// tab
					if (this.selection.current() === false) {
						var sel = this.selection.get();
						var range = this.selection.range(sel);
						
						range.setStart(this.core.editor()[0], 0);
						range.setEnd(this.core.editor()[0], 0);
						this.selection.update(sel, range);
					}
					
				},
				blur: function (e) {
					if (this.start || this.rtePaste) {
						return;
					}
					
					if ($(e.target).closest('#' + this.core.id() + ', .redactor-toolbar, .redactor-dropdown, #redactor-modal-box').length !== 0) {
						return;
					}
					
					if (!this.events.blured && this.events.isCallback('blur')) {
						this.core.callback('blur', e);
					}
					
					this.events.focused = false;
					this.events.blured = true;
				},
				touchImageEditing: function () {
					var scrollTimer = -1;
					this.events.imageEditing = false;
					$(window).on('touchmove.redactor.' + this.uuid, $.proxy(function () {
						this.events.imageEditing = true;
						if (scrollTimer !== -1) {
							clearTimeout(scrollTimer);
						}
						
						scrollTimer = setTimeout($.proxy(function () {
							this.events.imageEditing = false;
							
						}, this), 500);
						
					}, this));
				},
				init: function () {
					this.core.editor().on('dragover.redactor dragenter.redactor',
						$.proxy(this.events.dragover, this)
					);
					this.core.editor().on('dragleave.redactor',
						$.proxy(this.events.dragleave, this)
					);
					this.core.editor().on('drop.redactor', $.proxy(this.events.drop, this));
					this.core.editor().on('click.redactor', $.proxy(this.events.click, this));
					this.core.editor().on('paste.redactor', $.proxy(this.paste.init, this));
					this.core.editor().on('keydown.redactor', $.proxy(this.keydown.init, this));
					this.core.editor().on('keyup.redactor', $.proxy(this.keyup.init, this));
					this.core.editor().on('focus.redactor', $.proxy(this.events.focus, this));
					
					$(document).on('mousedown.redactor-blur.' + this.uuid,
						$.proxy(this.events.blur, this)
					);
					
					this.events.touchImageEditing();
					
					this.events.createObserver();
					this.events.setupObserver();
					
				},
				createObserver: function () {
					var self = this;
					this.events.observer = new MutationObserver(function (mutations) {
						mutations.forEach($.proxy(self.events.iterateObserver, self));
					});
					
				},
				iterateObserver: function (mutation) {
					
					var stop = false;
					
					// target
					if (((this.opts.type === 'textarea' || this.opts.type === 'div') && (!this.detect.isFirefox() && mutation.target === this.core.editor()[0])) || (mutation.attributeName === 'class' && mutation.target === this.core.editor()[0]) || (mutation.attributeName == 'data-vivaldi-spatnav-clickable')) {
						stop = true;
					}
					
					if (!stop) {
						this.observe.load();
						this.events.changeHandler();
					}
				},
				setupObserver: function () {
					this.events.observer.observe(this.core.editor()[0], {
						attributes: true,
						subtree: true,
						childList: true,
						characterData: true,
						characterDataOldValue: true
					});
				},
				changeHandler: function () {
					if (this.events.stopChanges) {
						return;
					}
					
					this.code.sync();
					
				},
				onDropUpload: function (e) {
					e.preventDefault();
					e.stopPropagation();
					
					if ((!this.opts.dragImageUpload && !this.opts.dragFileUpload) || (this.opts.imageUpload === null && this.opts.fileUpload === null)) {
						return;
					}
					
					if (e.target.tagName === 'IMG') {
						this.events.dropImage = e.target;
					}
					
					var files = e.dataTransfer.files;
					var len = files.length;
					for (var i = 0; i < len; i++) {
						this.upload.directUpload(files[i], e);
					}
				},
				onDrop: function (e) {
					this.core.callback('drop', e);
				},
				isCallback: function (name) {
					return (typeof this.opts.callbacks[name] !== 'undefined' && $.isFunction(this.opts.callbacks[name]));
				},
				
				// #backward
				stopDetect: function () {
					this.events.stopDetectChanges();
				},
				startDetect: function () {
					this.events.startDetectChanges();
				}
				
			};
		},
		
		// =file -- UNSUPPORTED MODULE
		file: function () {
			return {
				is: function () {},
				show: function () {},
				insert: function () {},
				release: function () {},
				text: function (json) {}
			};
		},
		
		// =focus
		focus: function () {
			return {
				start: function () {
					this.core.editor().focus();
					
					if (this.opts.type === 'inline') {
						return;
					}
					
					var $first = this.focus.first();
					if ($first !== false) {
						this.caret.start($first);
					}
				},
				end: function () {
					this.core.editor().focus();
					
					var last = (this.opts.inline) ? this.core.editor() : this.focus.last();
					if (last.length === 0) {
						return;
					}
					
					// get inline last node
					var lastNode = this.focus.lastChild(last);
					if (!this.detect.isWebkit() && lastNode !== false) {
						this.caret.end(lastNode);
					}
					else {
						var sel = this.selection.get();
						var range = this.selection.range(sel);
						
						if (range !== null) {
							range.selectNodeContents(last[0]);
							range.collapse(false);
							
							this.selection.update(sel, range);
						}
						else {
							this.caret.end(last);
						}
					}
					
				},
				first: function () {
					var $first = this.core.editor().children().first();
					if ($first.length === 0 && ($first[0].length === 0 || $first[0].tagName === 'BR' || $first[0].tagName === 'HR' || $first[0].nodeType === 3)) {
						return false;
					}
					
					if ($first[0].tagName === 'UL' || $first[0].tagName === 'OL') {
						return $first.find('li').first();
					}
					
					return $first;
					
				},
				last: function () {
					return this.core.editor().children().last();
				},
				lastChild: function (last) {
					var lastNode = last[0].lastChild;
					
					return (lastNode !== null && this.utils.isInlineTag(lastNode.tagName)) ? lastNode : false;
				},
				is: function () {
					return (this.core.editor()[0] === document.activeElement);
				}
			};
		},
		
		// =image
		image: function () {
			return {
				is: function () {
					return !(!this.opts.imageUpload || !this.opts.imageUpload && !this.opts.s3);
				},
				show: function () {
					// build modal
					this.modal.load('image', this.lang.get('image'), 700);
					
					// build upload
					this.upload.init('#redactor-modal-image-droparea',
						this.opts.imageUpload,
						this.image.insert
					);
					this.modal.show();
					
				},
				insert: function (json, direct, e) {
					var $img;
					
					// error callback
					if (typeof json.error !== 'undefined') {
						this.modal.close();
						this.events.dropImage = false;
						this.core.callback('imageUploadError', json, e);
						return;
					}
					
					// change image
					if (this.events.dropImage !== false) {
						$img = $(this.events.dropImage);
						
						this.core.callback('imageDelete', $img[0].src, $img);
						
						$img.attr('src', json.url);
						
						this.events.dropImage = false;
						this.core.callback('imageUpload', $img, json);
						return;
					}
					
					var $figure = $('<' + this.opts.imageTag + '>');
					
					$img = $('<img>');
					$img.attr('src', json.url);
					
					// set id
					var id = (typeof json.id === 'undefined') ? '' : json.id;
					var type = (typeof json.s3 === 'undefined') ? 'image' : 's3';
					$img.attr('data-' + type, id);
					
					$figure.append($img);
					
					var pre = this.utils.isTag(this.selection.current(), 'pre');
					
					if (direct) {
						this.marker.remove();
						
						var node = this.insert.nodeToPoint(e, this.marker.get());
						var $next = $(node).next();
						
						this.selection.restore();
						
						// buffer
						this.buffer.set();
						
						// insert
						if (typeof $next !== 'undefined' && $next.length !== 0 && $next[0].tagName === 'IMG') {
							// delete callback
							this.core.callback('imageDelete', $next[0].src, $next);
							
							// replace
							$next.closest('figure, p', this.core.editor()[0]).replaceWith(
								$figure);
							this.caret.after($figure);
						}
						else {
							if (pre) {
								$(pre).after($figure);
							}
							else {
								this.insert.node($figure);
							}
							
							this.caret.after($figure);
						}
						
					}
					else {
						this.modal.close();
						
						// buffer
						this.buffer.set();
						
						// insert
						if (pre) {
							$(pre).after($figure);
						}
						else {
							this.insert.node($figure);
						}
						
						this.caret.after($figure);
					}
					
					this.events.dropImage = false;
					
					var nextNode = $img[0].nextSibling;
					var $nextFigure = $figure.next();
					var isNextEmpty = $(nextNode).text().replace(/\u200B/g, '');
					var isNextFigureEmpty = $nextFigure.text().replace(/\u200B/g, '');
					
					if (isNextEmpty === '') {
						$(nextNode).remove();
					}
					
					if ($nextFigure.length === 1 && $nextFigure[0].tagName === 'FIGURE' && isNextFigureEmpty === '') {
						$nextFigure.remove();
					}
					
					if (direct !== null) {
						this.core.callback('imageUpload', $img, json);
					}
					else {
						this.core.callback('imageInserted', $img, json);
					}
				},
				setEditable: function ($image) {
					$image.on('dragstart', function (e) {
						e.preventDefault();
					});
					
					if (this.opts.imageResizable) {
						var handler = $.proxy(function (e) {
							this.observe.image = $image;
							this.image.resizer = this.image.loadEditableControls($image);
							
							$(document).on('mousedown.redactor-image-resize-hide.' + this.uuid,
								$.proxy(this.image.hideResize, this)
							);
							
							if (this.image.resizer) {
								this.image.resizer.on(
									'mousedown.redactor touchstart.redactor',
									$.proxy(function (e) {
										this.image.setResizable(e, $image);
									}, this)
								);
							}
							
						}, this);
						
						$image.off('mousedown.redactor').on('mousedown.redactor',
							$.proxy(this.image.hideResize, this)
						);
						$image.off('click.redactor touchstart.redactor').on('click.redactor touchstart.redactor',
							handler
						);
					}
					else {
						$image.off('click.redactor touchstart.redactor').on('click.redactor touchstart.redactor',
							$.proxy(function (e) {
								setTimeout($.proxy(function () {
									this.image.showEdit($image);
									
								}, this), 200);
								
							}, this)
						);
					}
					
				},
				setResizable: function (e, $image) {
					e.preventDefault();
					
					this.image.resizeHandle = {
						x: e.pageX,
						y: e.pageY,
						el: $image,
						ratio: $image.width() / $image.height(),
						h: $image.height()
					};
					
					e = e.originalEvent || e;
					
					if (e.targetTouches) {
						this.image.resizeHandle.x = e.targetTouches[0].pageX;
						this.image.resizeHandle.y = e.targetTouches[0].pageY;
					}
					
					this.image.startResize();
				},
				startResize: function () {
					$(document).on('mousemove.redactor-image-resize touchmove.redactor-image-resize',
						$.proxy(this.image.moveResize, this)
					);
					$(document).on('mouseup.redactor-image-resize touchend.redactor-image-resize',
						$.proxy(this.image.stopResize, this)
					);
				},
				moveResize: function (e) {
					e.preventDefault();
					
					e = e.originalEvent || e;
					
					var height = this.image.resizeHandle.h;
					
					if (e.targetTouches) height += (e.targetTouches[0].pageY - this.image.resizeHandle.y); else height += (e.pageY - this.image.resizeHandle.y);
					
					var width = Math.round(height * this.image.resizeHandle.ratio);
					
					if (height < 50 || width < 100) return;
					if (this.core.editor().width() <= width) return;
					
					this.image.resizeHandle.el.attr({
						width: width,
						height: height
					});
					this.image.resizeHandle.el.width(width);
					this.image.resizeHandle.el.height(height);
					
					this.code.sync();
				},
				stopResize: function () {
					this.handle = false;
					$(document).off('.redactor-image-resize');
					
					this.image.hideResize();
				},
				hideResize: function (e) {
					if (e && $(e.target).closest('#redactor-image-box',
						this.$editor[0]
					).length !== 0) {
						return;
					}
					if (e && e.target.tagName == 'IMG') {
						var $image = $(e.target);
					}
					
					var imageBox = this.$editor.find('#redactor-image-box');
					if (imageBox.length === 0) return;
					
					$('#redactor-image-editter').remove();
					$('#redactor-image-resizer').remove();
					
					imageBox.find('img').css({
						marginTop: imageBox[0].style.marginTop,
						marginBottom: imageBox[0].style.marginBottom,
						marginLeft: imageBox[0].style.marginLeft,
						marginRight: imageBox[0].style.marginRight
					});
					
					imageBox.css('margin', '');
					imageBox.find('img').css('opacity', '');
					imageBox.replaceWith(function () {
						return $(this).contents();
					});
					
					$(document).off('mousedown.redactor-image-resize-hide.' + this.uuid);
					
					if (typeof this.image.resizeHandle !== 'undefined') {
						this.image.resizeHandle.el.attr('rel',
							this.image.resizeHandle.el.attr('style')
						);
					}
				},
				loadResizableControls: function ($image, imageBox) {
					if (this.opts.imageResizable && !this.detect.isMobile()) {
						var imageResizer = $(
							'<span id="redactor-image-resizer" data-redactor="verified"></span>');
						
						if (!this.detect.isDesktop()) {
							imageResizer.css({
								width: '15px',
								height: '15px'
							});
						}
						
						imageResizer.attr('contenteditable', false);
						imageBox.append(imageResizer);
						imageBox.append($image);
						
						return imageResizer;
					}
					else {
						imageBox.append($image);
						return false;
					}
				},
				loadEditableControls: function ($image) {
					if ($('#redactor-image-box').length !== 0) {
						return;
					}
					
					var imageBox = $('<span id="redactor-image-box" data-redactor="verified">');
					imageBox.css('float', $image.css('float')).attr('contenteditable', false);
					
					if ($image[0].style.margin != 'auto') {
						imageBox.css({
							marginTop: $image[0].style.marginTop,
							marginBottom: $image[0].style.marginBottom,
							marginLeft: $image[0].style.marginLeft,
							marginRight: $image[0].style.marginRight
						});
						
						$image.css('margin', '');
					}
					else {
						imageBox.css({
							'display': 'block',
							'margin': 'auto'
						});
					}
					
					$image.css('opacity', '.5').after(imageBox);
					
					if (this.opts.imageEditable) {
						// editter
						this.image.editter = $(
							'<span id="redactor-image-editter" data-redactor="verified">' + this.lang.get(
							'edit') + '</span>');
						this.image.editter.attr('contenteditable', false);
						this.image.editter.on('click', $.proxy(function () {
							this.image.showEdit($image);
						}, this));
						
						imageBox.append(this.image.editter);
						
						// position correction
						var editerWidth = this.image.editter.innerWidth();
						this.image.editter.css('margin-left', '-' + editerWidth / 2 + 'px');
					}
					
					return this.image.loadResizableControls($image, imageBox);
					
				},
				showEdit: function ($image) {
					if (this.events.imageEditing) {
						return;
					}
					
					this.observe.image = $image;
					
					var $link = $image.closest('a', this.$editor[0]);
					var $figure = $image.closest('figure', this.$editor[0]);
					var $container = ($figure.length !== 0) ? $figure : $image;
					
					this.modal.load('image-edit', this.lang.get('edit'), 705);
					
					this.image.buttonDelete = this.modal.getDeleteButton().text(this.lang.get(
						'delete'));
					this.image.buttonSave = this.modal.getActionButton().text(this.lang.get('save'));
					
					this.image.buttonDelete.on('click', $.proxy(this.image.remove, this));
					this.image.buttonSave.on('click', $.proxy(this.image.update, this));
					
					if (this.opts.imageCaption === false) {
						$('#redactor-image-caption').val('').hide().prev().hide();
					}
					else {
						var $parent = $image.closest(this.opts.imageTag, this.$editor[0]);
						var $ficaption = $parent.find('figcaption');
						if ($ficaption !== 0) {
							
							$('#redactor-image-caption').val($ficaption.text()).show();
						}
					}
					
					if (!this.opts.imagePosition) {
						$('.redactor-image-position-option').hide();
					}
					else {
						var isCentered = ($figure.length !== 0) ? ($container.css('text-align') === 'center') : ($container.css(
							'display') == 'block' && $container.css('float') == 'none');
						var floatValue = (isCentered) ? 'center' : $container.css('float');
						$('#redactor-image-align').val(floatValue);
					}
					
					$('#redactor-image-preview').html($('<img src="' + $image.attr('src') + '" style="max-width: 100%;">'));
					$('#redactor-image-title').val($image.attr('alt'));
					
					if ($link.length !== 0) {
						$('#redactor-image-link').val($link.attr('href'));
						if ($link.attr('target') === '_blank') {
							$('#redactor-image-link-blank').prop('checked', true);
						}
					}
					
					// hide link's tooltip
					$('.redactor-link-tooltip').remove();
					
					this.modal.show();
					
					// focus
					if (this.detect.isDesktop()) {
						$('#redactor-image-title').focus();
					}
					
				},
				update: function () {
					var $image = this.observe.image;
					var $link = $image.closest('a', this.core.editor()[0]);
					
					var title = $('#redactor-image-title').val().replace(/(<([^>]+)>)/ig, '');
					$image.attr('alt', title).attr('title', title);
					
					this.image.setFloating($image);
					
					// as link
					var link = $.trim($('#redactor-image-link').val()).replace(/(<([^>]+)>)/ig, '');
					if (link !== '') {
						// test url (add protocol)
						var pattern = '((xn--)?[a-z0-9]+(-[a-z0-9]+)*\\.)+[a-z]{2,}';
						var re = new RegExp('^(http|ftp|https)://' + pattern, 'i');
						var re2 = new RegExp('^' + pattern, 'i');
						
						if (link.search(re) === -1 && link.search(re2) === 0 && this.opts.linkProtocol) {
							link = this.opts.linkProtocol + '://' + link;
						}
						
						var target = ($('#redactor-image-link-blank').prop('checked')) ? true : false;
						
						if ($link.length === 0) {
							var a = $('<a href="' + link + '" id="redactor-img-tmp">' + this.utils.getOuterHtml(
								$image) + '</a>');
							if (target) {
								a.attr('target', '_blank');
							}
							
							$image = $image.replaceWith(a);
							$link = this.core.editor().find('#redactor-img-tmp');
							$link.removeAttr('id');
						}
						else {
							$link.attr('href', link);
							if (target) {
								$link.attr('target', '_blank');
							}
							else {
								$link.removeAttr('target');
							}
						}
					}
					else if ($link.length !== 0) {
						$link.replaceWith(this.utils.getOuterHtml($image));
					}
					
					this.image.addCaption($image, $link);
					this.modal.close();
					
					// buffer
					this.buffer.set();
					
				},
				setFloating: function ($image) {
					var $figure = $image.closest('figure', this.$editor[0]);
					var $container = ($figure.length !== 0) ? $figure : $image;
					var floating = $('#redactor-image-align').val();
					
					var imageFloat = '';
					var imageDisplay = '';
					var imageMargin = '';
					var textAlign = '';
					
					switch (floating) {
						case 'left':
							imageFloat = 'left';
							imageMargin = '0 ' + this.opts.imageFloatMargin + ' ' + this.opts.imageFloatMargin + ' 0';
							break;
						case 'right':
							imageFloat = 'right';
							imageMargin = '0 0 ' + this.opts.imageFloatMargin + ' ' + this.opts.imageFloatMargin;
							break;
						case 'center':
							
							if ($figure.length !== 0) {
								textAlign = 'center';
							}
							else {
								imageDisplay = 'block';
								imageMargin = 'auto';
							}
							
							break;
					}
					
					$container.css({
						'float': imageFloat,
						'display': imageDisplay,
						'margin': imageMargin,
						'text-align': textAlign
					});
					$container.attr('rel', $image.attr('style'));
				},
				addCaption: function ($image, $link) {
					var caption = $('#redactor-image-caption').val();
					
					var $target = ($link.length !== 0) ? $link : $image;
					var $figcaption = $target.next();
					
					if ($figcaption.length === 0 || $figcaption[0].tagName !== 'FIGCAPTION') {
						$figcaption = false;
					}
					
					if (caption !== '') {
						if ($figcaption === false) {
							$figcaption = $('<figcaption />').text(caption);
							$target.after($figcaption);
						}
						else {
							$figcaption.text(caption);
						}
					}
					else if ($figcaption !== false) {
						$figcaption.remove();
					}
				},
				remove: function (e, $image, index) {
					$image = (typeof $image === 'undefined') ? $(this.observe.image) : $image;
					
					// delete from modal
					if (typeof e !== 'boolean') {
						this.buffer.set();
					}
					
					this.events.stopDetectChanges();
					
					var $link = $image.closest('a', this.core.editor()[0]);
					var $figure = $image.closest(this.opts.imageTag, this.core.editor()[0]);
					var $parent = $image.parent();
					
					// callback
					var imageDeleteStop = this.core.callback('imageDelete', e, $image[0]);
					if (imageDeleteStop === false) {
						if (e) e.preventDefault();
						return false;
					}
					
					if ($('#redactor-image-box').length !== 0) {
						$parent = $('#redactor-image-box').parent();
					}
					
					var $next, $prev;
					if ($figure.length !== 0) {
						$prev = $figure.prev();
						$next = $figure.next();
						$figure.remove();
					}
					else if ($link.length !== 0) {
						$parent = $link.parent();
						$link.remove();
					}
					else {
						$image.remove();
					}
					
					$('#redactor-image-box').remove();
					
					if (e !== false) {
						if ($next && $next.length !== 0) {
							this.caret.start($next);
						}
						else if ($prev && $prev.length !== 0) {
							this.caret.end($prev);
						}
					}
					
					if (typeof e !== 'boolean') {
						this.modal.close();
					}
					
					this.utils.restoreScroll();
					this.observe.image = false;
					this.events.startDetectChanges();
					this.code.sync();
					
				}
			};
		},
		
		// =indent
		indent: function () {
			return {
				increase: function () {
					if (!this.list.get()) {
						return;
					}
					
					var $current = $(this.selection.current()).closest('li');
					var $list = $current.closest('ul, ol', this.core.editor()[0]);
					
					var $li = $current.closest('li');
					var $prev = $li.prev();
					if ($prev.length === 0 || $prev[0].tagName !== 'LI') {
						return;
					}
					
					this.buffer.set();
					
					if (this.utils.isCollapsed()) {
						var listTag = $list[0].tagName;
						var $newList = $('<' + listTag + ' />');
						
						this.selection.save();
						
						var $ol = $prev.find('ol').first();
						if ($ol.length === 1) {
							$ol.append($current);
						}
						else {
							var listTag = $list[0].tagName;
							var $newList = $('<' + listTag + ' />');
							$newList.append($current);
							$prev.append($newList);
						}
						
						this.selection.restore();
					}
					else {
						document.execCommand('indent');
						
						// normalize
						this.selection.save();
						this.indent.removeEmpty();
						this.indent.normalize();
						this.selection.restore();
					}
				},
				decrease: function () {
					if (!this.list.get()) {
						return;
					}
					
					var $current = $(this.selection.current()).closest('li');
					var $list = $current.closest('ul, ol', this.core.editor()[0]);
					
					this.buffer.set();
					
					document.execCommand('outdent');
					
					var $item = $(this.selection.current()).closest('li', this.core.editor()[0]);
					
					if (this.utils.isCollapsed()) {
						this.indent.repositionItem($item);
					}
					
					var tmpWrapper = null;
					if ($item.length === 0) {
						// `formatBlock` does not handle custom elements gracefully, always
						// treating them as inline elements, causing these to be chopped up
						// into separate elements. We can mitigate this problem by introducing
						// a temporary intermediate `<div>` which will serve as a block wrapper.
						var block = this.selection.block();
						if (block && block.nodeName.indexOf('-') !== -1) {
							this.selection.save();
							
							tmpWrapper = elCreate('div');
							while (block.childNodes.length) {
								tmpWrapper.appendChild(block.childNodes[0]);
							}
							block.appendChild(tmpWrapper);
							
							this.selection.restore();
						}
						
						document.execCommand('formatblock', false, 'p');
						$item = $(this.selection.current());
						var $next = $item.next();
						if ($next.length !== 0 && $next[0].tagName === 'BR') {
							$next.remove();
						}
					}
					
					// normalize
					this.selection.save();
					
					if (tmpWrapper !== null) {
						var parent = tmpWrapper.parentNode;
						while (tmpWrapper.childNodes.length) {
							parent.insertBefore(tmpWrapper.childNodes[0], tmpWrapper);
						}
						parent.removeChild(tmpWrapper);
					}
					
					this.indent.removeEmpty();
					this.indent.normalize();
					this.selection.restore();
					
				},
				repositionItem: function ($item) {
					var $next = $item.next();
					if ($next.length !== 0 && ($next[0].tagName !== 'UL' || $next[0].tagName !== 'OL')) {
						$item.append($next);
					}
					
					var $prev = $item.prev();
					if ($prev.length !== 0 && $prev[0].tagName !== 'LI') {
						this.selection.save();
						var $li = $item.parents('li', this.core.editor()[0]);
						$li.after($item);
						this.selection.restore();
					}
				},
				normalize: function () {
					this.core.editor().find('li').each($.proxy(function (i, s) {
						var $el = $(s);
						
						// remove style
						var filter = '';
						if (this.opts.keepStyleAttr.length !== 0) {
							filter = ',' + this.opts.keepStyleAttr.join(',');
						}
						
						$el.find(this.opts.inlineTags.join(',')).not('img' + filter).removeAttr(
							'style');
						
						var $parent = $el.parent();
						if ($parent.length !== 0 && $parent[0].tagName === 'LI') {
							$parent.after($el);
							return;
						}
						
						var $next = $el.next();
						if ($next.length !== 0 && ($next[0].tagName === 'UL' || $next[0].tagName === 'OL')) {
							$el.append($next);
						}
						
					}, this));
					
				},
				removeEmpty: function ($list) {
					var $lists = this.core.editor().find('ul, ol');
					var $items = this.core.editor().find('li');
					
					$items.each($.proxy(function (i, s) {
						this.indent.removeItemEmpty(s);
						
					}, this));
					
					$lists.each($.proxy(function (i, s) {
						this.indent.removeItemEmpty(s);
						
					}, this));
					
					$items.each($.proxy(function (i, s) {
						this.indent.removeItemEmpty(s);
						
					}, this));
				},
				removeItemEmpty: function (s) {
					var html = s.innerHTML.replace(/[\t\s\n]/g, '');
					html = html.replace(/<span><\/span>/g, '');
					
					if (html === '') {
						$(s).remove();
					}
				}
			};
		},
		
		// =inline
		inline: function () {
			return {
				format: function (tag, attr, value, type) {
					// Stop formatting pre/code
					if (this.utils.isCurrentOrParent(['PRE', 'CODE'])) return;
					
					// Get params
					var params = this.inline.getParams(attr, value, type);
					
					// Arrange tag
					tag = this.inline.arrangeTag(tag);
					
					this.buffer.set();
					
					(this.utils.isCollapsed()) ? this.inline.formatCollapsed(tag,
						params
					) : this.inline.formatUncollapsed(tag, params);
				},
				formatCollapsed: function (tag, params) {
					var newInline;
					var inline = this.selection.inline();
					
					if (inline) {
						var currentTag = inline.tagName.toLowerCase();
						if (currentTag === tag) {
							// empty = remove
							if (this.utils.isEmpty(inline.innerHTML)) {
								this.caret.after(inline);
								$(inline).remove();
							}
							// not empty = break
							else {
								var $first = this.inline.insertBreakpoint(inline,
									currentTag
								);
								this.caret.after($first);
							}
						}
						else if ($(inline).closest(tag).length === 0) {
							newInline = this.inline.insertInline(tag);
							newInline = this.inline.setParams(newInline, params);
						}
						else {
							var $first = this.inline.insertBreakpoint(inline, currentTag);
							this.caret.after($first);
						}
					}
					else {
						newInline = this.inline.insertInline(tag);
						newInline = this.inline.setParams(newInline, params);
					}
				},
				formatUncollapsed: function (tag, params) {
					var element;
					
					this.selection.save();

					var range = window.getSelection().getRangeAt(0);
					var contents = range.cloneContents();
					if (contents.querySelector(tag) === null) {
						element = range.startContainer;
						if (element.nodeType === Node.TEXT_NODE) {
							element = element.parentElement;
						}

						var parentWithTheSameTag = element.closest(tag);
						if (parentWithTheSameTag !== null && this.core.editor()[0].contains(parentWithTheSameTag)) {
							// We need to split the matching parent element
							// by moving everything to the left and the right
							// into separate nodes.
							var leftElement = document.createElement(tag);
							parentWithTheSameTag.insertAdjacentElement("beforebegin", leftElement);

							var leftRange = document.createRange();
							leftRange.selectNodeContents(parentWithTheSameTag);
							leftRange.setEnd(range.startContainer, range.startOffset);
							leftElement.appendChild(leftRange.extractContents());

							const leftMarker = leftElement.querySelector(".redactor-selection-marker");
							if (leftMarker) {
								parentWithTheSameTag.prepend(leftMarker);
							}

							var rightElement = document.createElement(tag);
							parentWithTheSameTag.insertAdjacentElement("afterend", rightElement);

							var rightRange = document.createRange();
							rightRange.selectNodeContents(parentWithTheSameTag);
							rightRange.setStart(range.endContainer, range.endOffset);
							rightElement.appendChild(rightRange.extractContents());

							const rightMarker = rightElement.querySelector(".redactor-selection-marker");
							if (rightMarker) {
								parentWithTheSameTag.append(rightMarker);
							}

							// Finally remove the offending parent element.
							var parentElement = parentWithTheSameTag.parentElement;
							while (parentWithTheSameTag.childNodes.length) {
								parentElement.insertBefore(parentWithTheSameTag.childNodes[0], parentWithTheSameTag);
							}
							parentWithTheSameTag.remove();

							// Check if the browser range was bad and the selection
							// only matched the contents of the parent, but not the
							// parent itself.
							//
							// This would cause HTML like this:
							// <strong>Text</strong>
							// to become this mess:
							// <strong></strong>Text<strong></strong>
							[leftElement, rightElement].forEach((element) => {
								if (element.childNodes.length === 0) {
									element.remove();
									return;
								}

								if (element.textContent.length !== 0) {
									return;
								}

								if (element.querySelector("img, br") !== null) {
									return;
								}

								const span = element.querySelector("span");
								if (span && span.className.length) {
									return;
								}

								element.remove();
							});

							this.selection.restore();
							
							return;
						}
					}
					
					var nodes = this.inline.getClearedNodes();
					this.inline.setNodesStriked(nodes, tag, params);
					
					this.selection.restore();
					
					document.execCommand('strikethrough');
					
					this.selection.save();

					// WoltLab: Chrome misbehaves in some cases, causing the `<strike>` element for
					// contained elements to be stripped. Instead, those children are assigned the
					// CSS style `text-decoration-line: line-through`.
					var chromeElements = this.core.editor()[0].querySelectorAll('[style*="line-through"]'), strike;
					for (var i = 0, length = chromeElements.length; i < length; i++) {
						element = chromeElements[0];

						strike = document.createElement('strike');
						element.parentNode.insertBefore(strike, element);
						strike.appendChild(element);

						// Remove the bogus style attribute.
						element.style.removeProperty('text-decoration');
					}
					
					var self = this;
					this.core.editor().find('strike').each(function () {
						var $el = self.utils.replaceToTag(this, tag);
						self.inline.setParams($el[0], params);
						
						var $inside = $el.find(tag);
						var $parent = $el.parent();
						var $parentAround = $parent.parent();
						
						// revert formatting (safari bug)
						if ($parentAround.length !== 0 && $parentAround[0].tagName.toLowerCase() === tag && $parentAround.html() == $parent[0].outerHTML) {
							$el.replaceWith(function () { return $(this).contents(); });
							$parentAround.replaceWith(function () { return $(this).contents(); });
							
							return;
						}
						
						// remove inside
						if ($inside.length !== 0) {
							self.inline.cleanInsideOrParent($inside, params);
						}
						
						// same parent
						if ($parent.html() == $el[0].outerHTML) {
							self.inline.cleanInsideOrParent($parent, params);
						}
						
						// bugfix: remove empty inline tags after selection
						if (self.detect.isFirefox()) {
							self.core.editor().find(tag + ':empty').remove();
						}
					});
					
					this.selection.restore();
				},
				cleanInsideOrParent: function ($el, params) {
					if (params) {
						for (var key in params.data) {
							this.inline.removeSpecificAttr($el, key, params.data[key]);
						}
					}
				},
				getClearedNodes: function () {
					var nodes = this.selection.nodes();
					var newNodes = [];
					var len = nodes.length;
					var started = 0;
					
					// find array slice
					for (var i = 0; i < len; i++) {
						if ($(nodes[i]).hasClass('redactor-selection-marker')) {
							started = i + 2;
							break;
						}
					}
					
					// find selected inline & text nodes
					for (var i = 0; i < len; i++) {
						if (i >= started && !this.utils.isBlockTag(nodes[i].tagName)) {
							newNodes.push(nodes[i]);
						}
					}
					
					return newNodes;
				},
				isConvertableAttr: function (node, name, value) {
					var nodeAttrValue = $(node).attr(name);
					if (nodeAttrValue) {
						if (name === 'style') {
							value = $.trim(value).replace(/;$/, '');
							
							var rules = value.split(';');
							var count = 0;
							for (var i = 0; i < rules.length; i++) {
								var arr = rules[i].split(':');
								var ruleName = $.trim(arr[0]);
								var ruleValue = $.trim(arr[1]);
								
								if (ruleName.search(/color/) !== -1) {
									var val = $(node).css(ruleName);
									if (val && (val === ruleValue || this.utils.rgb2hex(
										val) === ruleValue)) {
										count++;
									}
								}
								else if ($(node).css(ruleName) === ruleValue) {
									count++;
								}
							}
							
							if (count === rules.length) {
								return 1;
							}
						}
						else if (nodeAttrValue === value) {
							return 1;
						}
					}
					
					return 0;
					
				},
				isConvertable: function (node, nodeTag, tag, params) {
					if (nodeTag === tag) {
						if (params) {
							var count = 0;
							for (var key in params.data) {
								count += this.inline.isConvertableAttr(node,
									key,
									params.data[key]
								);
							}
							
							if (count === Object.keys(params.data).length) {
								return true;
							}
						}
						else {
							return true;
						}
					}
					
					return false;
				},
				setNodesStriked: function (nodes, tag, params) {
					for (var i = 0; i < nodes.length; i++) {
						var nodeTag = (nodes[i].tagName) ? nodes[i].tagName.toLowerCase() : undefined;
						
						var parent = nodes[i].parentNode;
						var parentTag = (parent && parent.tagName) ? parent.tagName.toLowerCase() : undefined;
						
						var convertable = this.inline.isConvertable(parent,
							parentTag,
							tag,
							params
						);
						if (convertable) {
							var $el = $(parent).replaceWith(function () {
								return $('<strike>').append($(this).contents());
							});
							
							$el.attr('data-redactor-inline-converted');
						}
						
						var convertable = this.inline.isConvertable(nodes[i],
							nodeTag,
							tag,
							params
						);
						if (convertable) {
							var $el = $(nodes[i]).replaceWith(function () {
								return $('<strike>').append($(this).contents());
							});
						}
					}
				},
				insertBreakpoint: function (inline, currentTag) {
					var breakpoint = document.createElement('span');
					breakpoint.id = 'redactor-inline-breakpoint';
					breakpoint = this.insert.node(breakpoint);
					
					var end = this.utils.isEndOfElement(inline);
					var code = this.utils.getOuterHtml(inline);
					var endTag = (end) ? '' : '<' + currentTag + '>';
					
					code = code.replace(/<span id="redactor-inline-breakpoint"><\/span>/i,
						'</' + currentTag + '>' + endTag
					);
					
					var $code = $(code);
					$(inline).replaceWith($code);
					
					if (endTag !== '') {
						this.utils.cloneAttributes(inline, $code.last());
					}
					
					return $code.first();
				},
				insertInline: function (tag) {
					var node = document.createElement(tag);
					
					this.insert.node(node);
					this.caret.start(node);
					
					return node;
				},
				arrangeTag: function (tag) {
					var tags = [
						'b',
						'bold',
						'i',
						'italic',
						'underline',
						'strikethrough',
						'deleted',
						'superscript',
						'subscript'
					];
					var replaced = [
						'strong', 'strong', 'em', 'em', 'u', 'del', 'del', 'sup', 'sub'
					];
					
					tag = tag.toLowerCase();
					
					for (var i = 0; i < tags.length; i++) {
						if (tag === tags[i]) {
							tag = replaced[i];
						}
					}
					
					return tag;
				},
				getStyleParams: function (params) {
					var result = {};
					var rules = params.trim().replace(/;$/, '').split(';');
					for (var i = 0; i < rules.length; i++) {
						var rule = rules[i].split(':');
						if (rule) {
							result[rule[0].trim()] = rule[1].trim();
						}
					}
					
					return result;
				},
				getParams: function (attr, value, type) {
					var data = false;
					var func = 'toggle';
					if (typeof attr === 'object') {
						data = attr;
						func = (value !== undefined) ? value : func;
					}
					else if (attr !== undefined && value !== undefined) {
						data = {};
						data[attr] = value;
						func = (type !== undefined) ? type : func;
					}
					
					return (data) ? {
						'func': func,
						'data': data
					} : false;
				},
				setParams: function (node, params) {
					if (params) {
						for (var key in params.data) {
							var $node = $(node);
							if (key === 'style') {
								node = this.inline[params.func + 'Style'](params.data[key],
									node
								);
								$node.attr('data-redactor-style-cache',
									$node.attr('style')
								);
							}
							else if (key === 'class') {
								node = this.inline[params.func + 'Class'](params.data[key],
									node
								);
							}
							// attr
							else {
								node = (params.func === 'remove') ? this.inline[params.func + 'Attr'](key,
									node
								) : this.inline[params.func + 'Attr'](key,
									params.data[key],
									node
								);
							}
							
							if (key === 'style' && node.tagName === 'SPAN') {
								$node.attr('data-redactor-span', true);
							}
						}
					}
					
					return node;
				},
				
				// Each
				eachInline: function (node, callback) {
					var lastNode;
					var nodes = (node === undefined) ? this.selection.inlines() : [node];
					if (nodes) {
						for (var i = 0; i < nodes.length; i++) {
							lastNode = callback(nodes[i])[0];
						}
					}
					
					return lastNode;
				},
				
				// Class
				replaceClass: function (value, node) {
					return this.inline.eachInline(node, function (el) {
						return $(el).removeAttr('class').addClass(value);
					});
				},
				toggleClass: function (value, node) {
					return this.inline.eachInline(node, function (el) {
						return $(el).toggleClass(value);
					});
				},
				addClass: function (value, node) {
					return this.inline.eachInline(node, function (el) {
						return $(el).addClass(value);
					});
				},
				removeClass: function (value, node) {
					return this.inline.eachInline(node, function (el) {
						return $(el).removeClass(value);
					});
				},
				removeAllClass: function (node) {
					return this.inline.eachInline(node, function (el) {
						return $(el).removeAttr('class');
					});
				},
				
				// Attr
				replaceAttr: function (name, value, node) {
					return this.inline.eachInline(node, function (el) {
						return $(el).removeAttr(name).attr(name.value);
					});
				},
				toggleAttr: function (name, value, node) {
					return this.inline.eachInline(node, function (el) {
						var attr = $(el).attr(name);
						
						return (attr) ? $(el).removeAttr(name) : $(el).attr(name.value);
					});
				},
				addAttr: function (name, value, node) {
					return this.inline.eachInline(node, function (el) {
						return $(el).attr(name, value);
					});
				},
				removeAttr: function (name, node) {
					return this.inline.eachInline(node, function (el) {
						var $el = $(el);
						
						$el.removeAttr(name);
						if (name === 'style') {
							$el.removeAttr('data-redactor-style-cache');
						}
						
						return $el;
					});
				},
				removeAllAttr: function (node) {
					return this.inline.eachInline(node, function (el) {
						var $el = $(el);
						var len = el.attributes.length;
						for (var z = 0; z < len; z++) {
							$el.removeAttr(el.attributes[z].name);
						}
						
						return $el;
					});
				},
				removeSpecificAttr: function (node, key, value) {
					var $el = $(node);
					if (key === 'style') {
						var arr = value.split(':');
						var name = arr[0].trim();
						$el.css(name, '');
						
						if (this.utils.removeEmptyAttr(node, 'style')) {
							$el.removeAttr('data-redactor-style-cache');
						}
					}
					else {
						$el.removeAttr(key)[0];
					}
				},
				
				// Style
				hasParentStyle: function ($el) {
					var $parent = $el.parent();
					
					return ($parent.length === 1 && $parent[0].tagName === $el[0].tagName && $parent.html() === $el[0].outerHTML) ? $parent : false;
				},
				addParentStyle: function ($el) {
					var $parent = this.inline.hasParentStyle($el);
					if ($parent) {
						var style = this.inline.getStyleParams($el.attr('style'));
						$parent.css(style);
						$parent.attr('data-redactor-style-cache', $parent.attr('style'));
						
						$el.replaceWith(function () {
							return $(this).contents();
						});
					}
					else {
						$el.attr('data-redactor-style-cache', $el.attr('style'));
					}
					
					return $el;
				},
				replaceStyle: function (params, node) {
					params = this.inline.getStyleParams(params);
					
					var self = this;
					return this.inline.eachInline(node, function (el) {
						var $el = $(el);
						$el.removeAttr('style').css(params);
						
						var style = $el.attr('style');
						if (style) $el.attr('style', style.replace(/"/g, '\''));
						
						$el = self.inline.addParentStyle($el);
						
						return $el;
					});
				},
				toggleStyle: function (params, node) {
					params = this.inline.getStyleParams(params);
					
					var self = this;
					return this.inline.eachInline(node, function (el) {
						var $el = $(el);
						
						for (var key in params) {
							var newVal = params[key];
							var oldVal = $el.css(key);
							
							oldVal = (self.utils.isRgb(oldVal)) ? self.utils.rgb2hex(oldVal) : oldVal.replace(/"/g,
								''
							);
							newVal = (self.utils.isRgb(newVal)) ? self.utils.rgb2hex(newVal) : newVal.replace(/"/g,
								''
							);
							
							if (oldVal === newVal) {
								$el.css(key, '');
							}
							else {
								$el.css(key, newVal);
							}
						}
						
						var style = $el.attr('style');
						if (style) $el.attr('style', style.replace(/"/g, '\''));
						
						if (!self.utils.removeEmptyAttr(el, 'style')) {
							$el = self.inline.addParentStyle($el);
						}
						else {
							$el.removeAttr('data-redactor-style-cache');
						}
						
						return $el;
					});
				},
				addStyle: function (params, node) {
					params = this.inline.getStyleParams(params);
					
					var self = this;
					return this.inline.eachInline(node, function (el) {
						var $el = $(el);
						
						$el.css(params);
						
						var style = $el.attr('style');
						if (style) $el.attr('style', style.replace(/"/g, '\''));
						
						$el = self.inline.addParentStyle($el);
						
						return $el;
					});
				},
				removeStyle: function (params, node) {
					params = this.inline.getStyleParams(params);
					
					var self = this;
					return this.inline.eachInline(node, function (el) {
						var $el = $(el);
						
						for (var key in params) {
							$el.css(key, '');
						}
						
						if (self.utils.removeEmptyAttr(el, 'style')) {
							$el.removeAttr('data-redactor-style-cache');
						}
						else {
							$el.attr('data-redactor-style-cache', $el.attr('style'));
						}
						
						return $el;
					});
				},
				removeAllStyle: function (node) {
					return this.inline.eachInline(node, function (el) {
						return $(el).removeAttr('style').removeAttr('data-redactor-style-cache');
					});
				},
				removeStyleRule: function (name) {
					var parent = this.selection.parent();
					var nodes = this.selection.inlines();
					
					this.buffer.set();
					
					if (parent && parent.tagName === 'SPAN') {
						this.inline.removeStyleRuleAttr($(parent), name);
					}
					
					for (var i = 0; i < nodes.length; i++) {
						var el = nodes[i];
						var $el = $(el);
						if ($.inArray(el.tagName.toLowerCase(),
							this.opts.inlineTags
						) != -1 && !$el.hasClass('redactor-selection-marker')) {
							this.inline.removeStyleRuleAttr($el, name);
						}
					}
					
				},
				removeStyleRuleAttr: function ($el, name) {
					$el.css(name, '');
					if (this.utils.removeEmptyAttr($el, 'style')) {
						$el.removeAttr('data-redactor-style-cache');
					}
					else {
						$el.attr('data-redactor-style-cache', $el.attr('style'));
					}
				},
				
				// Update
				update: function (tag, attr, value, type) {
					tag = this.inline.arrangeTag(tag);
					
					var params = this.inline.getParams(attr, value, type);
					var nodes = this.selection.inlines();
					var result = [];
					
					if (nodes) {
						for (var i = 0; i < nodes.length; i++) {
							var el = nodes[i];
							if (tag === '*' || el.tagName.toLowerCase() === tag) {
								result.push(this.inline.setParams(el, params));
							}
						}
					}
					
					return result;
				},
				
				// All
				removeFormat: function () {
					this.selection.save();
					
					var nodes = this.inline.getClearedNodes();
					for (var i = 0; i < nodes.length; i++) {
						if (nodes[i].nodeType === 1) {
							$(nodes[i]).replaceWith(function () {
								return $(this).contents();
							});
						}
					}
					
					this.selection.restore();
				}
				
			};
		},
		
		// =insert
		insert: function () {
			return {
				set: function (html) {
					this.code.set(html);
					this.focus.end();
				},
				html: function (html, data) {
					this.core.editor().focus();
					
					var block = this.selection.block();
					var inline = this.selection.inline();
					
					// clean
					if (typeof data === 'undefined') {
						data = this.clean.getCurrentType(html, true);
						html = this.clean.onPaste(html, data, true);
					}
					
					html = $.parseHTML(html);
					
					// end node
					var endNode = $(html).last();
					
					// delete selected content
					var sel = this.selection.get();
					var range = this.selection.range(sel);
					range.deleteContents();
					
					this.selection.update(sel, range);
					
					// insert list in list
					if (data.lists) {
						var $list = $(html);
						if ($list.length !== 0 && ($list[0].tagName === 'UL' || $list[0].tagName === 'OL')) {
							
							this.insert.appendLists(block, $list);
							return;
						}
					}
					
					if (data.blocks && block) {
						if (this.utils.isSelectAll()) {
							this.core.editor().html(html);
							this.focus.end();
						}
						else {
							var breaked = this.utils.breakBlockTag();
							if (breaked === false) {
								this.insert.placeHtml(html);
							}
							else {
								var $last = $(html).children().last();
								$last.append(this.marker.get());
								
								if (breaked.type === 'start') {
									breaked.$block.before(html);
								}
								else {
									breaked.$block.after(html);
								}
								
								this.selection.restore();
								this.core.editor().find('p').each(function () {
									if ($.trim(this.innerHTML) === '') {
										$(this).remove();
									}
								});
							}
						}
					}
					else {
						if (inline) {
							// remove same tag inside
							var $div = $('<div/>').html(html);
							$div.find(inline.tagName.toLowerCase()).each(function () {
								$(this).contents().unwrap();
							});
							
							html = $div.html();
							html = $.parseHTML(html);
							
							endNode = $(html).last();
							
						}
						
						if (this.utils.isSelectAll()) {
							var $node = $(this.opts.emptyHtml);
							this.core.editor().html('').append($node);
							$node.html(html);
							this.caret.end($node);
						}
						else {
							this.insert.placeHtml(html);
						}
					}
					
					this.utils.disableSelectAll();
					
					if (data.pre) this.clean.cleanPre();
					
					this.caret.end(endNode);
				},
				text: function (text) {
					text = text.toString();
					text = $.trim(text);
					
					var tmp = document.createElement('div');
					tmp.innerHTML = text;
					text = tmp.textContent || tmp.innerText;
					
					if (typeof text === 'undefined') {
						return;
					}
					
					this.core.editor().focus();
					
					// blocks
					var blocks = this.selection.blocks();
					
					// nl to spaces
					text = text.replace(/\n/g, ' ');
					
					// select all
					if (this.utils.isSelectAll()) {
						var $node = $(this.opts.emptyHtml);
						this.core.editor().html('').append($node);
						$node.html(text);
						this.caret.end($node);
					}
					else {
						// insert
						var sel = this.selection.get();
						var node = document.createTextNode(text);
						
						if (sel.getRangeAt && sel.rangeCount) {
							var range = sel.getRangeAt(0);
							range.deleteContents();
							range.insertNode(node);
							range.setStartAfter(node);
							range.collapse(true);
							
							this.selection.update(sel, range);
						}
						
						// wrap node if selected two or more block tags
						if (blocks.length > 1) {
							$(node).wrap('<p>');
							this.caret.after(node);
						}
					}
					
					this.utils.disableSelectAll();
					this.clean.normalizeCurrentHeading();
					
				},
				raw: function (html) {
					this.core.editor().focus();
					
					var sel = this.selection.get();
					
					var range = this.selection.range(sel);
					range.deleteContents();
					
					var el = document.createElement('div');
					el.innerHTML = html;
					
					var frag = document.createDocumentFragment(), node, lastNode;
					while ((node = el.firstChild)) {
						lastNode = frag.appendChild(node);
					}
					
					range.insertNode(frag);
					
					if (lastNode) {
						range = range.cloneRange();
						range.setStartAfter(lastNode);
						range.collapse(true);
						sel.removeAllRanges();
						sel.addRange(range);
					}
				},
				node: function (node, deleteContent) {
					if (typeof this.start !== 'undefined') {
						this.core.editor().focus();
					}
					
					node = node[0] || node;
					
					var block = this.selection.block();
					var gap = this.utils.isBlockTag(node.tagName);
					var result = true;
					
					if (this.utils.isSelectAll()) {
						if (gap) {
							this.core.editor().html(node);
						}
						else {
							this.core.editor().html($('<p>').html(node));
						}
						
						this.code.sync();
					}
					else if (gap && block) {
						var breaked = this.utils.breakBlockTag();
						if (breaked === false) {
							this.insert.placeNode(node, deleteContent);
						}
						else {
							if (breaked.type === 'start') {
								breaked.$block.before(node);
							}
							else {
								breaked.$block.after(node);
							}
							
							this.core.editor().find('p:empty').remove();
						}
					}
					else {
						result = this.insert.placeNode(node, deleteContent);
					}
					
					this.utils.disableSelectAll();
					
					if (result) {
						this.caret.end(node);
					}
					
					return node;
					
				},
				appendLists: function (block, $list) {
					var $block = $(block);
					var last;
					var isEmpty = this.utils.isEmpty(block.innerHTML);
					
					if (isEmpty || this.utils.isEndOfElement(block)) {
						last = $block;
						$list.find('li').each(function () {
							last.after(this);
							last = $(this);
						});
						
						if (isEmpty) {
							$block.remove();
						}
					}
					else if (this.utils.isStartOfElement(block)) {
						$list.find('li').each(function () {
							$block.before(this);
							last = $(this);
						});
					}
					else {
						var endOfNode = this.selection.extractEndOfNode(block);
						
						$block.after($('<li>').append(endOfNode));
						$block.append($list);
						last = $list;
					}
					
					this.marker.remove();
					
					if (last) {
						this.caret.end(last);
					}
				},
				placeHtml: function (html) {
					var marker = document.createElement('span');
					marker.id = 'redactor-insert-marker';
					marker = this.insert.node(marker);
					
					$(marker).before(html);
					this.selection.restore();
					this.caret.after(marker);
					$(marker).remove();
				},
				placeNode: function (node, deleteContent) {
					var sel = this.selection.get();
					var range = this.selection.range(sel);
					if (range == null) {
						return false;
					}
					
					if (deleteContent !== false) {
						range.deleteContents();
					}
					
					range.insertNode(node);
					range.collapse(false);
					
					this.selection.update(sel, range);
				},
				nodeToPoint: function (e, node) {
					node = node[0] || node;
					
					if (this.utils.isEmpty()) {
						node = (this.utils.isBlock(node)) ? node : $('<p />').append(node);
						
						this.core.editor().html(node);
						
						return node;
					}
					
					var range;
					var x = e.clientX, y = e.clientY;
					if (document.caretPositionFromPoint) {
						var pos = document.caretPositionFromPoint(x, y);
						var sel = document.getSelection();
						range = sel.getRangeAt(0);
						range.setStart(pos.offsetNode, pos.offset);
						range.collapse(true);
						range.insertNode(node);
					}
					else if (document.caretRangeFromPoint) {
						range = document.caretRangeFromPoint(x, y);
						range.insertNode(node);
					}
					else if (typeof document.body.createTextRange !== 'undefined') {
						range = document.body.createTextRange();
						range.moveToPoint(x, y);
						var endRange = range.duplicate();
						endRange.moveToPoint(x, y);
						range.setEndPoint('EndToEnd', endRange);
						range.select();
					}
					
					return node;
					
				},
				
				// #backward
				nodeToCaretPositionFromPoint: function (e, node) {
					this.insert.nodeToPoint(e, node);
				},
				marker: function () {
					this.marker.insert();
				}
			};
		},
		
		// =keydown
		keydown: function () {
			return {
				init: function (e) {
					if (this.rtePaste) {
						return;
					}
					
					var key = e.which;
					var arrow = (key >= 37 && key <= 40);
					
					this.keydown.ctrl = e.ctrlKey || e.metaKey;
					this.keydown.parent = this.selection.parent();
					this.keydown.current = this.selection.current();
					this.keydown.block = this.selection.block();
					
					// detect tags
					this.keydown.pre = this.utils.isTag(this.keydown.current, 'pre');
					this.keydown.blockquote = this.utils.isTag(this.keydown.current, 'blockquote');
					this.keydown.figcaption = this.utils.isTag(this.keydown.current, 'figcaption');
					this.keydown.figure = this.utils.isTag(this.keydown.current, 'figure');
					
					// callback
					var keydownStop = this.core.callback('keydown', e);
					if (keydownStop === false) {
						e.preventDefault();
						return false;
					}
					
					// shortcuts setup
					this.shortcuts.init(e, key);
					
					// buffer
					this.keydown.checkEvents(arrow, key);
					this.keydown.setupBuffer(e, key);
					
					if (this.utils.isSelectAll() && (key === this.keyCode.ENTER || key === this.keyCode.BACKSPACE || key === this.keyCode.DELETE)) {
						e.preventDefault();
						
						this.code.set(this.opts.emptyHtml);
						this.events.changeHandler();
						return;
					}
					
					this.keydown.addArrowsEvent(arrow);
					this.keydown.setupSelectAll(e, key);
					
					// turn off enter key
					if (!this.opts.enterKey && key === this.keyCode.ENTER) {
						e.preventDefault();
						
						// remove selected
						var sel = this.selection.get();
						var range = this.selection.range(sel);
						
						if (!range.collapsed) {
							range.deleteContents();
						}
						
						return;
					}
					
					// down
					if (this.opts.enterKey && key === this.keyCode.DOWN) {
						this.keydown.onArrowDown();
					}
					
					// up
					if (this.opts.enterKey && key === this.keyCode.UP) {
						this.keydown.onArrowUp();
					}
					
					// replace to p before / after the table or into body
					if ((this.opts.type === 'textarea' || this.opts.type === 'div') && this.keydown.current && this.keydown.current.nodeType === 3 && $(
						this.keydown.parent).hasClass('redactor-in')) {
						this.keydown.wrapToParagraph();
					}
					
					// on Shift+Space or Ctrl+Space
					if (!this.keyup.lastShiftKey && key === this.keyCode.SPACE && (e.ctrlKey || e.shiftKey)) {
						e.preventDefault();
						
						return this.keydown.onShiftSpace();
					}

					// Shift+Enter should always behave like a "regular" Enter keypress inside `<pre>`.
					if (this.keydown.pre && key === this.keyCode.ENTER) {
						return this.keydown.onEnter(e);
					}
					
					// on Shift+Enter or Ctrl+Enter
					if (key === this.keyCode.ENTER && (e.ctrlKey || e.shiftKey)) {
						// iOS Safari will report the shift key to be pressed, if the caret is at the
						// front of the line and the next character should be an uppercase character.
						if (Environment === null || Environment.platform() !== 'ios') {
							e.preventDefault();

							return this.keydown.onShiftEnter(e);
						}
					}
					
					// on enter
					if (key === this.keyCode.ENTER && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
						return this.keydown.onEnter(e);
					}
					
					// tab or cmd + [
					if (key === this.keyCode.TAB || e.metaKey && key === 221 || e.metaKey && key === 219) {
						return this.keydown.onTab(e, key);
					}
					
					// firefox bugfix
					if (this.detect.isFirefox() && key === this.keyCode.BACKSPACE && this.keydown.block && this.keydown.block.tagName === 'P' && this.utils.isStartOfElement(
						this.keydown.block)) {
						var $prev = $(this.keydown.block).prev();
						if ($prev.length !== 0) {
							e.preventDefault();
							
							$prev.append(this.marker.get());
							$prev.append($(this.keydown.block).html());
							$(this.keydown.block).remove();
							
							this.selection.restore();
							
							return;
						}
					}
					
					// backspace & delete
					if (key === this.keyCode.BACKSPACE || key === this.keyCode.DELETE) {
						if (this.observe.image && typeof this.observe.image !== 'undefined' && $(
							'#redactor-image-box').length !== 0) {
							e.preventDefault();
							
							var $prev = this.observe.image.closest('figure, p').prev();
							this.image.remove(false);
							this.observe.image = false;
							
							if ($prev && $prev.length !== 0) {
								this.caret.end($prev);
							}
							else {
								this.core.editor().focus();
							}
							
							return;
						}
						
						this.keydown.onBackspaceAndDeleteBefore();
					}
					
					if (key === this.keyCode.DELETE) {
						var $next = $(this.keydown.block).next();
						
						// delete figure
						if (this.utils.isEndOfElement(this.keydown.block) && $next.length !== 0 && $next[0].tagName === 'FIGURE') {
							$next.remove();
							return false;
						}
						
						// append list (safari bug)
						var tagLi = (this.keydown.block && this.keydown.block.tagName === 'LI') ? this.keydown.block : false;
						if (tagLi) {
							var $list = $(this.keydown.block).parents('ul, ol').last();
							var $nextList = $list.next();
							
							if (this.utils.isRedactorParent($list) && this.utils.isEndOfElement(
								$list) && $nextList.length !== 0 && ($nextList[0].tagName === 'UL' || $nextList[0].tagName === 'OL')) {
								e.preventDefault();
								
								$list.append($nextList.contents());
								$nextList.remove();
								
								return false;
							}
						}
						
						// append pre
						if (this.utils.isEndOfElement(this.keydown.block) && $next.length !== 0 && $next[0].tagName === 'PRE') {
							$(this.keydown.block).append($next.text());
							$next.remove();
							return false;
						}
						
					}
					
					// image delete
					if (key === this.keyCode.DELETE && $('#redactor-image-box').length !== 0) {
						this.image.remove();
					}
					
					// backspace
					if (key === this.keyCode.BACKSPACE) {
						if (this.detect.isFirefox()) {
							this.line.removeOnBackspace(e);
						}
						
						// combine list after and before if paragraph is empty
						if (this.list.combineAfterAndBefore(this.keydown.block)) {
							e.preventDefault();
							return;
						}
						
						// backspace as outdent
						var block = this.selection.block();
						if (block && block.tagName === 'LI' && this.utils.isCollapsed() && this.utils.isStartOfElement()) {
							this.indent.decrease();
							e.preventDefault();
							return;
						}
						
						this.keydown.removeInvisibleSpace();
						this.keydown.removeEmptyListInTable(e);
						
					}
					
					if (key === this.keyCode.BACKSPACE || key === this.keyCode.DELETE) {
						this.keydown.onBackspaceAndDeleteAfter(e);
					}
					
				},
				onShiftSpace: function () {
					this.buffer.set();
					this.insert.raw('&nbsp;');
					
					return false;
				},
				onShiftEnter: function (e) {
					this.buffer.set();
					
					return (this.keydown.pre) ? this.keydown.insertNewLine(e) : this.insert.raw(
						'<br>');
				},
				onBackspaceAndDeleteBefore: function () {
					this.utils.saveScroll();
				},
				onBackspaceAndDeleteAfter: function (e) {
					// remove style tag
					setTimeout($.proxy(function () {
						this.code.syncFire = false;
						this.keydown.removeEmptyLists();
						
						var filter = '';
						if (this.opts.keepStyleAttr.length !== 0) {
							filter = ',' + this.opts.keepStyleAttr.join(',');
						}
						
						var $styleTags = this.core.editor().find('*[style]');
						$styleTags.not(
							'img, figure, iframe, #redactor-image-box, #redactor-image-editter, [data-redactor-style-cache], [data-redactor-span]' + filter).removeAttr(
							'style');
						
						this.keydown.formatEmpty(e);
						this.code.syncFire = true;
						
					}, this), 1);
				},
				onEnter: function (e) {
					var stop = this.core.callback('enter', e);
					if (stop === false) {
						e.preventDefault();
						return false;
					}
					
					// blockquote exit
					if (this.keydown.blockquote && this.keydown.exitFromBlockquote(e) === true) {
						return false;
					}
					
					// pre
					if (this.keydown.pre) {
						return this.keydown.insertNewLine(e);
					}
					// blockquote & figcaption
					else if (this.keydown.blockquote || this.keydown.figcaption) {
						return this.keydown.insertBreakLine(e);
					}
					// figure
					else if (this.keydown.figure) {
						setTimeout($.proxy(function () {
							this.keydown.replaceToParagraph('FIGURE');
							
						}, this), 1);
					}
					// paragraphs
					else if (this.keydown.block) {
						setTimeout($.proxy(function () {
							this.keydown.replaceToParagraph('DIV');
							
						}, this), 1);
						
						// empty list exit
						if (this.keydown.block.tagName === 'LI') {
							var current = this.selection.current();
							var $parent = $(current).closest('li', this.$editor[0]);
							var $list = $parent.parents('ul,ol', this.$editor[0]).last();
							
							if ($parent.length !== 0 && this.utils.isEmpty($parent.html()) && $list.next().length === 0 && this.utils.isEmpty(
								$list.find('li').last().html())) {
								$list.find('li').last().remove();
								
								var node = $(this.opts.emptyHtml);
								$list.after(node);
								this.caret.start(node);
								
								return false;
							}
						}
						
					}
					// outside
					else if (!this.keydown.block) {
						return this.keydown.insertParagraph(e);
					}
					
					// firefox enter into inline element
					if (this.detect.isFirefox() && this.utils.isInline(this.keydown.parent)) {
						this.keydown.insertBreakLine(e);
						return;
					}
					
					// remove inline tags in new-empty paragraph
					if (!this.opts.keepInlineOnEnter) {
						setTimeout($.proxy(function () {
							var inline = this.selection.inline();
							if (inline && this.utils.isEmpty(inline.innerHTML)) {
								var parent = this.selection.block();
								$(inline).remove();
								//this.caret.start(parent);
								
								var range = document.createRange();
								range.setStart(parent, 0);
								
								var textNode = document.createTextNode('\u200B');
								
								range.insertNode(textNode);
								range.setStartAfter(textNode);
								range.collapse(true);
								
								var sel = window.getSelection();
								sel.removeAllRanges();
								sel.addRange(range);
							}
							
						}, this), 1);
					}
				},
				checkEvents: function (arrow, key) {
					if (!arrow && (this.core.getEvent() === 'click' || this.core.getEvent() === 'arrow')) {
						this.core.addEvent(false);
						
						if (this.keydown.checkKeyEvents(key)) {
							this.buffer.set();
						}
					}
				},
				checkKeyEvents: function (key) {
					var k = this.keyCode;
					var keys = [
						k.BACKSPACE,
						k.DELETE,
						k.ENTER,
						k.ESC,
						k.TAB,
						k.CTRL,
						k.META,
						k.ALT,
						k.SHIFT
					];
					
					return ($.inArray(key, keys) === -1) ? true : false;
					
				},
				addArrowsEvent: function (arrow) {
					if (!arrow) {
						return;
					}
					
					if ((this.core.getEvent() === 'click' || this.core.getEvent() === 'arrow')) {
						this.core.addEvent(false);
						return;
					}
					
					this.core.addEvent('arrow');
				},
				setupBuffer: function (e, key) {
					if (this.keydown.ctrl && key === 90 && !e.shiftKey && !e.altKey && this.sBuffer.length) // z key
					{
						e.preventDefault();
						this.buffer.undo();
						return;
					}
					// redo
					else if (this.keydown.ctrl && key === 90 && e.shiftKey && !e.altKey && this.sRebuffer.length !== 0) {
						e.preventDefault();
						this.buffer.redo();
						return;
					}
					else if (!this.keydown.ctrl) {
						if (key === this.keyCode.SPACE || key === this.keyCode.BACKSPACE || key === this.keyCode.DELETE || (key === this.keyCode.ENTER && !e.ctrlKey && !e.shiftKey)) {
							this.buffer.set();
						}
					}
				},
				exitFromBlockquote: function (e) {
					if (!this.utils.isEndOfElement(this.keydown.blockquote)) {
						return;
					}
					
					var tmp = this.clean.removeSpacesHard($(this.keydown.blockquote).html());
					if (tmp.search(/(<br\s?\/?>){1}$/i) !== -1) {
						e.preventDefault();
						
						var $last = $(this.keydown.blockquote).children().last();
						
						$last.filter('br').remove();
						$(this.keydown.blockquote).children().last().filter('span').remove();
						
						var node = $(this.opts.emptyHtml);
						$(this.keydown.blockquote).after(node);
						this.caret.start(node);
						
						return true;
						
					}
					
					return;
				},
				onArrowDown: function () {
					var tags = [this.keydown.blockquote, this.keydown.pre, this.keydown.figcaption];
					
					for (var i = 0; i < tags.length; i++) {
						if (tags[i]) {
							this.keydown.insertAfterLastElement(tags[i]);
							return false;
						}
					}
				},
				onArrowUp: function () {
					var tags = [this.keydown.blockquote, this.keydown.pre, this.keydown.figcaption];
					
					for (var i = 0; i < tags.length; i++) {
						if (tags[i]) {
							this.keydown.insertBeforeFirstElement(tags[i]);
							return false;
						}
					}
				},
				insertAfterLastElement: function (element) {
					if (!this.utils.isEndOfElement(element)) {
						return;
					}
					
					var last = this.core.editor().contents().last();
					var $next = (element.tagName === 'FIGCAPTION') ? $(this.keydown.block).parent().next() : $(
						this.keydown.block).next();
					
					if ($next.length !== 0) {
						return;
					}
					else if (last.length === 0 && last[0] !== element) {
						this.caret.start(last);
						return;
					}
					else {
						var node = $(this.opts.emptyHtml);
						
						if (element.tagName === 'FIGCAPTION') {
							$(element).parent().after(node);
						}
						else {
							$(element).after(node);
						}
						
						this.caret.start(node);
					}
					
				},
				insertBeforeFirstElement: function (element) {
					if (!this.utils.isStartOfElement()) {
						return;
					}
					
					if (this.core.editor().contents().length > 1 && this.core.editor().contents().first()[0] !== element) {
						return;
					}
					
					var node = $(this.opts.emptyHtml);
					$(element).before(node);
					this.caret.start(node);
					
				},
				onTab: function (e, key) {
					if (!this.opts.tabKey) {
						return true;
					}
					
					var isList = (this.keydown.block && this.keydown.block.tagName === 'LI');
					if (this.utils.isEmpty(this.code.get()) || (!isList && !this.keydown.pre && this.opts.tabAsSpaces === false)) {
						return true;
					}
					
					e.preventDefault();
					this.buffer.set();
					
					var isListStart = (isList && this.utils.isStartOfElement(this.keydown.block));
					var node;
					
					if (this.keydown.pre && !e.shiftKey) {
						node = (this.opts.preSpaces) ? document.createTextNode(Array(this.opts.preSpaces + 1).join(
							'\u00a0')) : document.createTextNode('\t');
						this.insert.node(node);
					}
					else if (this.opts.tabAsSpaces !== false && !isListStart) {
						node = document.createTextNode(Array(this.opts.tabAsSpaces + 1).join(
							'\u00a0'));
						this.insert.node(node);
					}
					else {
						if (e.metaKey && key === 219) {
							this.indent.decrease();
						}
						else if (e.metaKey && key === 221) {
							this.indent.increase();
						}
						else if (!e.shiftKey) {
							this.indent.increase();
						}
						else {
							this.indent.decrease();
						}
					}
					
					return false;
				},
				setupSelectAll: function (e, key) {
					if (this.keydown.ctrl && key === 65) {
						this.utils.enableSelectAll();
					}
					else if (key !== this.keyCode.LEFT_WIN && !this.keydown.ctrl) {
						this.utils.disableSelectAll();
					}
				},
				insertNewLine: function (e) {
					e.preventDefault();
					
					var node = document.createTextNode('\n');
					
					var sel = this.selection.get();
					var range = this.selection.range(sel);
					
					range.deleteContents();
					range.insertNode(node);
					
					this.caret.after(node);
					
					return false;
				},
				insertParagraph: function (e) {
					e.preventDefault();
					
					var p = document.createElement('p');
					//p.innerHTML = this.opts.invisibleSpace;
					p.innerHTML = '<br>';
					
					var sel = this.selection.get();
					var range = this.selection.range(sel);
					
					range.deleteContents();
					range.insertNode(p);
					
					this.caret.start(p);
					
					return false;
				},
				insertBreakLine: function (e) {
					return this.keydown.insertBreakLineProcessing(e);
				},
				insertDblBreakLine: function (e) {
					return this.keydown.insertBreakLineProcessing(e, true);
				},
				insertBreakLineProcessing: function (e, dbl) {
					e.stopPropagation();
					
					var br1 = document.createElement('br');
					this.insert.node(br1);
					
					if (dbl === true) {
						var br2 = document.createElement('br');
						this.insert.node(br2);
						this.caret.after(br2);
					}
					else {
						this.caret.after(br1);
					}
					
					return false;
					
				},
				wrapToParagraph: function () {
					var $current = $(this.keydown.current);
					var node = $('<p>').append($current.clone());
					$current.replaceWith(node);
					
					var next = $(node).next();
					if (typeof (next[0]) !== 'undefined' && next[0].tagName === 'BR') {
						next.remove();
					}
					
					this.caret.end(node);
					
				},
				replaceToParagraph: function (tag) {
					var blockElem = this.selection.block();
					var $prev = $(blockElem).prev();
					
					var blockHtml = blockElem.innerHTML.replace(/<br\s?\/?>/gi, '');
					if (blockElem.tagName === tag && this.utils.isEmpty(blockHtml) && !$(blockElem).hasClass(
						'redactor-in')) {
						var p = document.createElement('p');
						$(blockElem).replaceWith(p);
						
						this.keydown.setCaretToParagraph(p);
						
						return false;
					}
					else if (blockElem.tagName === 'P') {
						$(blockElem).removeAttr('class').removeAttr('style');
						
						// fix #227
						if (this.detect.isIe() && this.utils.isEmpty(blockHtml) && this.utils.isInline(
							this.keydown.parent)) {
							$(blockElem).on('input', $.proxy(function () {
								var parent = this.selection.parent();
								if (this.utils.isInline(parent)) {
									var html = $(parent).html();
									$(blockElem).html(html);
									this.caret.end(blockElem);
								}
								
								$(blockElem).off('keyup');
								
							}, this));
						}
						
						return false;
					}
					else if ($prev.hasClass(this.opts.videoContainerClass)) {
						$prev.removeAttr('class');
						
						var p = document.createElement('p');
						$prev.replaceWith(p);
						
						this.keydown.setCaretToParagraph(p);
						
						return false;
					}
				},
				setCaretToParagraph: function (p) {
					var range = document.createRange();
					range.setStart(p, 0);
					
					var textNode = document.createTextNode('\u200B');
					
					range.insertNode(textNode);
					range.setStartAfter(textNode);
					range.collapse(true);
					
					var sel = window.getSelection();
					sel.removeAllRanges();
					sel.addRange(range);
				},
				removeInvisibleSpace: function () {
					var $current = $(this.keydown.current);
					if ($current.text().search(/^\u200B$/g) === 0) {
						$current.remove();
					}
				},
				removeEmptyListInTable: function (e) {
					var $current = $(this.keydown.current);
					var $parent = $(this.keydown.parent);
					var td = $current.closest('td', this.$editor[0]);
					
					if (td.length !== 0 && $current.closest('li',
						this.$editor[0]
					) && $parent.children('li').length === 1) {
						if (!this.utils.isEmpty($current.text())) {
							return;
						}
						
						e.preventDefault();
						
						$current.remove();
						$parent.remove();
						
						this.caret.start(td);
					}
				},
				removeEmptyLists: function () {
					var removeIt = function () {
						var html = $.trim(this.innerHTML).replace(/\/t\/n/g, '');
						if (html === '') {
							$(this).remove();
						}
					};
					
					this.core.editor().find('li').each(removeIt);
					this.core.editor().find('ul, ol').each(removeIt);
				},
				formatEmpty: function (e) {
					var html = $.trim(this.core.editor().html());
					
					if (!this.utils.isEmpty(html)) {
						return;
					}
					
					e.preventDefault();
					
					if (this.opts.type === 'inline' || this.opts.type === 'pre') {
						this.core.editor().html(this.marker.html());
						this.selection.restore();
					}
					else {
						var updateHtml = function() {
							this.core.editor().html(this.opts.emptyHtml);
							this.focus.start();
						}.bind(this);
						
						if (Environment !== null && Environment.platform() === 'ios') {
							// In iOS Safari the backspace sometimes appears to be triggered twice if the editor
							// is completely empty. After debugging for way too much time, and realizing that
							// the remote debugger's breakpoints alter the behavior of async callbacks (*), this
							// should solve the issue.
							//
							// (*) Set up a `console.log()` inside a MutationObserver and then make use of the
							// `debugger;` statement to halt the execution flow. The observer is executed, but
							// the output never appears on the console. Output works if there is no breakpoint.
							setTimeout(updateHtml, 50);
						}
						else {
							updateHtml();
						}
					}
					
					return false;
					
				}
			};
		},
		
		// =keyup
		keyup: function () {
			return {
				init: function (e) {
					if (this.rtePaste) {
						return;
					}
					
					var key = e.which;
					this.keyup.block = this.selection.block();
					this.keyup.current = this.selection.current();
					this.keyup.parent = this.selection.parent();
					this.keyup.lastShiftKey = e.shiftKey;
					
					// callback
					var stop = this.core.callback('keyup', e);
					if (stop === false) {
						e.preventDefault();
						return false;
					}
					
					// replace a prev figure to paragraph if caret is before image
					if (key === this.keyCode.ENTER) {
						if (this.keyup.block && this.keyup.block.tagName === 'FIGURE') {
							var $prev = $(this.keyup.block).prev();
							if ($prev.length !== 0 && $prev[0].tagName === 'FIGURE') {
								var $newTag = this.utils.replaceToTag($prev, 'p');
								this.caret.start($newTag);
								return;
							}
						}
					}
					
					// replace figure to paragraph
					if (key === this.keyCode.BACKSPACE || key === this.keyCode.DELETE) {
						if (this.utils.isSelectAll()) {
							this.focus.start();
							
							return;
						}
						
						// if caret before figure - delete image
						if (this.keyup.block && this.keydown.block && this.keyup.block.tagName === 'FIGURE' && this.utils.isStartOfElement(
							this.keydown.block)) {
							e.preventDefault();
							
							this.selection.save();
							$(this.keyup.block).find('figcaption').remove();
							$(this.keyup.block).find('img').first().remove();
							this.utils.replaceToTag(this.keyup.block, 'p');
							
							var $marker = this.marker.find();
							$('html, body').animate({scrollTop: $marker.position().top + 20},
								500
							);
							
							this.selection.restore();
							return;
						}
						
						// if paragraph does contain only image replace to figure
						if (this.keyup.block && this.keyup.block.tagName === 'P') {
							var isContainImage = $(this.keyup.block).find('img').length;
							var text = $(this.keyup.block).text().replace(/\u200B/g, '');
							if (text === '' && isContainImage !== 0) {
								this.utils.replaceToTag(this.keyup.block, 'figure');
							}
						}
						
						// if figure does not contain image - replace to paragraph
						if (this.keyup.block && this.keyup.block.tagName === 'FIGURE' && $(this.keyup.block).find(
							'img').length === 0) {
							this.selection.save();
							this.utils.replaceToTag(this.keyup.block, 'p');
							this.selection.restore();
						}
					}
				}
				
			};
		},
		
		// =lang
		lang: function () {
			return {
				load: function () {
					this.opts.curLang = this.opts.langs[this.opts.lang];
				},
				get: function (name) {
					return (typeof this.opts.curLang[name] !== 'undefined') ? this.opts.curLang[name] : '';
				}
			};
		},
		
		// =line
		line: function () {
			return {
				insert: function () {
					this.buffer.set();
					
					// insert
					this.insert.html(this.line.getLineHtml());
					
					// find
					var $hr = this.core.editor().find('#redactor-hr-tmp-id');
					$hr.removeAttr('id');
					
					this.core.callback('insertedLine', $hr);
					
					return $hr;
				},
				getLineHtml: function () {
					var html = '<hr id="redactor-hr-tmp-id" />';
					if (!this.detect.isFirefox() && this.utils.isEmpty()) {
						html += '<p>' + this.opts.emptyHtml + '</p>';
					}
					
					return html;
				}, // ff only
				removeOnBackspace: function (e) {
					if (!this.utils.isCollapsed()) {
						return;
					}
					
					var $block = $(this.selection.block());
					if ($block.length === 0 || !this.utils.isStartOfElement($block)) {
						return;
					}
					
					// if hr is previous element
					var $prev = $block.prev();
					if ($prev && $prev.length !== 0 && $prev[0].tagName === 'HR') {
						e.preventDefault();
						$prev.remove();
					}
				}
			};
		},
		
		// =link
		link: function () {
			return {
				
				// public
				get: function () {
					return $(this.selection.inlines('a'));
				},
				is: function () {
					var nodes = this.selection.nodes();
					var $link = $(this.selection.current()).closest('a', this.core.editor()[0]);
					
					return ($link.length === 0 || nodes.length > 1) ? false : $link;
				},
				unlink: function (e, $link) {
					// if call from clickable element
					if (typeof e !== 'undefined' && e.preventDefault) {
						e.preventDefault();
					}
					
					// buffer
					this.buffer.set();
					
					var links = $link ? [$link] : this.selection.inlines('a');
					if (links.length === 0) {
						return;
					}
					
					var $links = this.link.replaceLinksToText(links);
					
					this.observe.closeAllTooltip();
					this.core.callback('deletedLink', $links);
					
				},
				insert: function (link, cleaned, savedLink) {
					var $el = savedLink || this.link.is();
					
					if (cleaned !== true) {
						link = this.link.buildLinkFromObject($el, link);
						if (link === false) {
							return false;
						}
					}
					
					// buffer
					this.buffer.set();
					
					// callback
					link = this.core.callback('beforeInsertingLink', link);
					
					if ($el === false) {
						// insert
						$el = $('<a />');
						$el = this.link.update($el, link);
						$el = $(this.insert.node($el));
						
						var $parent = $el.parent();
						if (this.utils.isRedactorParent($parent) === false) {
							$el.wrap('<p>');
						}
						
						// remove unlink wrapper
						if ($parent.hasClass('redactor-unlink')) {
							$parent.replaceWith(function () {
								return $(this).contents();
							});
						}
						
						this.caret.after($el);
						this.core.callback('insertedLink', $el);
					}
					else {
						// update
						$el = this.link.update($el, link);
						this.caret.after($el);
					}
					
					return $el;
					
				},
				update: function ($el, link) {
					$el.text(link.text);
					$el.attr('href', link.url);
					
					this.link.target($el, link.target);
					
					return $el;
					
				},
				target: function ($el, target) {
					return (target) ? $el.attr('target', '_blank') : $el.removeAttr('target');
				},
				show: function (e) {
					// if call from clickable element
					if (typeof e !== 'undefined' && e.preventDefault) {
						e.preventDefault();
					}
					
					// close tooltip
					this.observe.closeAllTooltip();
					
					// is link
					var $el = this.link.is();
					
					// build modal
					this.link.buildModal($el);
					
					// build link
					var link = this.link.buildLinkFromElement($el);
					
					// if link cut & paste inside editor browser added self host to a link
					link.url = this.link.removeSelfHostFromUrl(link.url);
					
					// new tab target
					if (this.opts.linkNewTab && !$el) {
						link.target = true;
					}
					
					// set modal values
					this.link.setModalValues(link);
					
					// show modal
					this.modal.show();
					
					// focus
					if (this.detect.isDesktop()) {
						$('#redactor-link-url').focus();
					}
				},
				
				// private
				setModalValues: function (link) {
					$('#redactor-link-blank').prop('checked', link.target);
					$('#redactor-link-url').val(link.url);
					$('#redactor-link-url-text').val(link.text);
				},
				buildModal: function ($el) {
					this.modal.load('link',
						this.lang.get(($el === false) ? 'link-insert' : 'link-edit'),
						600
					);
					
					// button insert
					var $btn = this.modal.getActionButton();
					$btn.text(this.lang.get(($el === false) ? 'insert' : 'save')).on('click',
						$.proxy(this.link.callback, this)
					);
					
				},
				callback: function () {
					// build link
					var link = this.link.buildLinkFromModal();
					if (link === false) {
						return false;
					}
					
					// close
					this.modal.close();
					
					// insert or update
					this.link.insert(link, true);
				},
				cleanUrl: function (url) {
					return (typeof url === 'undefined') ? '' : $.trim(url.replace(/[^\W\w\D\d+&\'@#/%?=~_|!:,.;\(\)]/gi,
						''
					));
				},
				cleanText: function (text) {
					return (typeof text === 'undefined') ? '' : text.trim();
				},
				getText: function (link) {
					return (link.text === '' && link.url !== '') ? this.link.truncateUrl(link.url.replace(/<|>/g,
						''
					)) : link.text;
				},
				isUrl: function (url) {
					var reUrl = new RegExp(
						'^((https?|ftp):\\/\\/)?(([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*(\\?[;&a-z\\d%_.~+=-]*)?(\\#[-a-z\\d_]*)?$',
						'i'
					);
					
					return (reUrl.test(url)) ? url : false;
				},
				isMailto: function (url) {
					return (url.search('@') !== -1 && /(http|ftp|https):\/\//i.test(url) === false);
				},
				isEmpty: function (link) {
					return (link.url === '' || (link.text === '' && link.url === ''));
				},
				truncateUrl: function (url) {
					return (url.length > this.opts.linkSize) ? url.substring(0,
						this.opts.linkSize
					) + '...' : url;
				},
				parse: function (link) {
					// mailto
					if (this.link.isMailto(link.url)) {
						link.url = 'mailto:' + link.url.replace('mailto:', '');
					}
					// url
					else if (link.url.search('#') !== 0) {
						if (this.opts.linkValidation) {
							link.url = (this.link.isUrl(link.url)) ? 'http://' + link.url.replace(/(ftp|https?):\/\//gi,
								''
							) : link.url;
						}
					}
					
					// empty url or text or isn't url
					return (this.link.isEmpty(link) || link.url === false) ? false : link;
					
				},
				buildLinkFromModal: function () {
					var link = {};
					
					// url
					link.url = this.link.cleanUrl($('#redactor-link-url').val());
					
					// text
					link.text = this.link.cleanText($('#redactor-link-url-text').val());
					link.text = this.link.getText(link);
					
					// target
					link.target = ($('#redactor-link-blank').prop('checked')) ? true : false;
					
					// parse
					return this.link.parse(link);
					
				},
				buildLinkFromObject: function ($el, link) {
					// url
					link.url = this.link.cleanUrl(link.url);
					
					// text
					link.text = (typeof link.text === 'undefined' && this.selection.is()) ? this.selection.text() : this.link.cleanText(
						link.text);
					link.text = this.link.getText(link);
					
					// target
					link.target = ($el === false) ? link.target : this.link.buildTarget($el);
					
					// parse
					return this.link.parse(link);
					
				},
				buildLinkFromElement: function ($el) {
					var link = {
						url: '',
						text: (this.selection.is()) ? this.selection.text() : '',
						target: false
					};
					
					if ($el !== false) {
						link.url = $el.attr('href');
						link.text = $el.text();
						link.target = this.link.buildTarget($el);
					}
					
					return link;
				},
				buildTarget: function ($el) {
					return (typeof $el.attr('target') !== 'undefined' && $el.attr('target') === '_blank') ? true : false;
				},
				removeSelfHostFromUrl: function (url) {
					var href = self.location.href.replace('#', '').replace(/\/$/i, '');
					return url.replace(/^\/\#/, '#').replace(href, '').replace('mailto:', '');
				},
				replaceLinksToText: function (links) {
					var $first;
					var $links = $.each(links, function (i, s) {
						var $el = $(s);
						var $unlinked = $('<span class="redactor-unlink" />').append($el.contents());
						$el.replaceWith($unlinked);
						
						if (i === 0) {
							$first = $unlinked;
						}
						
						return $el;
					});
					
					// set caret after unlinked node
					if (links.length === 1 && this.selection.isCollapsed()) {
						this.caret.after($first);
					}
					
					return $links;
				}
			};
		},
		
		// =linkify -- UNSUPPORTED MODULE
		linkify: function () {
			return {
				isKey: function () {},
				isLink: function () {},
				isFiltered: function () {},
				handler: function () {},
				format: function () {},
				convertVideoLinks: function () {},
				convertImages: function () {},
				convertLinks: function () {}
			};
		},
		
		// =list
		list: function () {
			return {
				toggle: function (type) {
					if (this.utils.inBlocks(['table', 'td', 'th', 'tr'])) {
						return;
					}
					
					type = (type === 'orderedlist') ? 'ol' : type;
					type = (type === 'unorderedlist') ? 'ul' : type;
					
					type = type.toLowerCase();
					
					this.buffer.set();
					this.selection.save();
					
					var nodes = this.list._getBlocks();
					var block = this.selection.block();
					var $list = $(block).parents('ul, ol').last();
					if (nodes.length === 0 && $list.length !== 0) {
						nodes = [$list.get(0)];
					}
					
					nodes = (this.list._isUnformat(type, nodes)) ? this.list._unformat(type,
						nodes
					) : this.list._format(type, nodes);
					
					this.selection.restore();
					
					return nodes;
				},
				get: function () {
					var current = this.selection.current();
					var $list = $(current).closest('ul, ol', this.core.editor()[0]);
					
					return ($list.length === 0) ? false : $list;
				},
				combineAfterAndBefore: function (block) {
					var $prev = $(block).prev();
					var $next = $(block).next();
					var isEmptyBlock = (block && block.tagName === 'P' && (block.innerHTML === '<br>' || block.innerHTML === ''));
					var isBlockWrapped = ($prev.closest('ol, ul',
						this.core.editor()[0]
					).length === 1 && $next.closest(
						'ol, ul',
						this.core.editor()[0]
					).length === 1);
					
					if (isEmptyBlock && isBlockWrapped) {
						$prev.children('li').last().append(this.marker.get());
						$prev.append($next.contents());
						this.selection.restore();
						
						return true;
					}
					
					return false;
					
				},
				_getBlocks: function () {
					var finalBlocks = [];
					var blocks = this.selection.blocks();
					for (var i = 0; i < blocks.length; i++) {
						var $el = $(blocks[i]);
						var isFirst = ($el.parent().hasClass('redactor-in'));
						
						if (isFirst) finalBlocks.push(blocks[i]);
					}
					
					return finalBlocks;
				},
				_isUnformat: function (type, nodes) {
					var countLists = 0;
					for (var i = 0; i < nodes.length; i++) {
						if (nodes[i].nodeType !== 3) {
							var tag = nodes[i].tagName.toLowerCase();
							if (tag === type || tag === 'figure') {
								countLists++;
							}
						}
					}
					
					return (countLists === nodes.length);
				},
				_uniteBlocks: function (nodes, tags) {
					var z = 0;
					var blocks = {0: []};
					var lastcell = false;
					for (var i = 0; i < nodes.length; i++) {
						var $node = $(nodes[i]);
						var $cell = $node.closest('th, td');
						
						if ($cell.length !== 0) {
							if ($cell.get(0) !== lastcell) {
								// create block
								z++;
								blocks[z] = [];
							}
							
							if (this.list._isUniteBlock(nodes[i], tags)) {
								blocks[z].push(nodes[i]);
							}
						}
						else {
							if (this.list._isUniteBlock(nodes[i], tags)) {
								blocks[z].push(nodes[i]);
							}
							else {
								// create block
								z++;
								blocks[z] = [];
							}
						}
						
						lastcell = $cell.get();
					}
					
					return blocks;
				},
				_isUniteBlock: function (node, tags) {
					return (node.nodeType === 3 || tags.indexOf(node.tagName.toLowerCase()) !== -1);
				},
				_createList: function (type, blocks, key) {
					var last = blocks[blocks.length - 1];
					var $last = $(last);
					var $list = $('<' + type + '>');
					$last.after($list);
					
					return $list;
				},
				_createListItem: function (item) {
					var $item = $('<li>');
					if (item.nodeType === 3) {
						$item.append(item);
					}
					else {
						var $el = $(item);
						$item.append($el.contents());
						$el.remove();
					}
					
					return $item;
				},
				_format: function (type, nodes) {
					var tags = [
						'p',
						'div',
						'blockquote',
						'pre',
						'h1',
						'h2',
						'h3',
						'h4',
						'h5',
						'h6',
						'ul',
						'ol'
					];
					var blocks = this.list._uniteBlocks(nodes, tags);
					var lists = [];
					
					for (var key in blocks) {
						var items = blocks[key];
						var $list = this.list._createList(type, blocks[key]);
						
						for (var i = 0; i < items.length; i++) {
							var $item;
							
							// lists
							if (items[i].nodeType !== 3 && (items[i].tagName === 'UL' || items[i].tagName === 'OL')) {
								$item = $(items[i]).contents();
								$list.append($item);
							}
							// other blocks or texts
							else {
								$item = this.list._createListItem(items[i]);
								//this.utils.normalizeTextNodes($item);
								$list.append($item);
							}
						}
						
						lists.push($list.get(0));
					}
					
					return lists;
				},
				_unformat: function (type, nodes) {
					
					if (nodes.length === 1) {
						// one list
						var $list = $(nodes[0]);
						var $items = $list.find('li');
						
						var selectedItems = this.selection.blocks(['li']);
						var block = this.selection.block();
						var $li = $(block).closest('li');
						if (selectedItems.length === 0 && $li.length !== 0) {
							selectedItems = [$li.get(0)];
						}
						
						// 1) entire
						if (selectedItems.length === $items.length) {
							return this.list._unformatEntire(nodes[0]);
						}
						
						var pos = this.list._getItemsPosition($items, selectedItems);
						
						// 2) top
						if (pos === 'Top') {
							return this.list._unformatAtSide('before',
								selectedItems,
								$list
							);
						}
						
						// 3) bottom
						else if (pos === 'Bottom') {
							selectedItems.reverse();
							return this.list._unformatAtSide('after', selectedItems, $list);
						}
						
						// 4) middle
						else if (pos === 'Middle') {
							var $last = $(selectedItems[selectedItems.length - 1]);
							
							var ci = false;
							
							var $parent = false;
							var $secondList = $('<' + $list.get(0).tagName.toLowerCase() + '>');
							$items.each(function (i, node) {
								if (ci) {
									var $node = $(node);
									var $childList = ($node.children('ul, ol').length !== 0);
									
									if ($node.closest('.redactor-split-item').length === 0 && ($parent === false || $node.closest(
										$parent).length === 0)) {
										$node.addClass('redactor-split-item');
									}
									
									$parent = $node;
									
								}
								
								if (node === $last.get(0)) {
									ci = true;
								}
							});
							
							$items.filter('.redactor-split-item').each(function (i, node) {
								var $node = $(node);
								$node.removeClass('redactor-split-item');
								$secondList.append(node);
							});
							
							$list.after($secondList);
							
							selectedItems.reverse();
							for (var i = 0; i < selectedItems.length; i++) {
								var $item = $(selectedItems[i]);
								var $container = this.list._createUnformatContainer(
									$item);
								
								$list.after($container);
								$container.find('ul, ol').remove();
								$item.remove();
							}
							
							return;
						}
						
					}
					else {
						// unformat all
						for (var i = 0; i < nodes.length; i++) {
							if (nodes[i].nodeType !== 3 && nodes[i].tagName.toLowerCase() === type) {
								this.list._unformatEntire(nodes[i]);
							}
						}
					}
				},
				_unformatEntire: function (list) {
					var $list = $(list);
					var $items = $list.find('li');
					$items.each(function (i, node) {
						var $item = $(node);
						var $container = this.list._createUnformatContainer($item);
						
						$item.remove();
						$list.before($container);
						
					}.bind(this));
					
					$list.remove();
				},
				_unformatAtSide: function (type, selectedItems, $list) {
					for (var i = 0; i < selectedItems.length; i++) {
						var $item = $(selectedItems[i]);
						var $container = this.list._createUnformatContainer($item);
						
						$list[type]($container);
						
						var $innerLists = $container.find('ul, ol').first();
						$item.append($innerLists);
						
						$innerLists.each(function (i, node) {
							var $node = $(node);
							var $parent = $node.closest('li');
							
							if ($parent.get(0) === selectedItems[i]) {
								$node.unwrap();
								$parent.addClass('r-unwrapped');
							}
							
						});
						
						if (this.utils.isEmpty($item.html())) $item.remove();
					}
					
					// clear empty
					$list.find('.r-unwrapped').each(function (node) {
						var $node = $(node);
						if ($node.html().trim() === '') {
							$node.remove();
						}
						else {
							$node.removeClass('r-unwrapped');
						}
					});
				},
				_getItemsPosition: function ($items, selectedItems) {
					var pos = 'Middle';
					
					var sFirst = selectedItems[0];
					var sLast = selectedItems[selectedItems.length - 1];
					
					var first = $items.first().get(0);
					var last = $items.last().get(0);
					
					if (first === sFirst && last !== sLast) {
						pos = 'Top';
					}
					else if (first !== sFirst && last === sLast) {
						pos = 'Bottom';
					}
					
					return pos;
				},
				_createUnformatContainer: function ($item) {
					var $container = $('<p>');
					$container.append($item.contents());
					
					return $container;
				}
			};
		},
		
		// =marker
		marker: function () {
			return {
				
				// public
				get: function (num) {
					num = (typeof num === 'undefined') ? 1 : num;
					
					var marker = document.createElement('span');
					
					marker.id = 'selection-marker-' + num;
					marker.className = 'redactor-selection-marker';
					marker.innerHTML = this.opts.invisibleSpace;
					
					return marker;
				},
				html: function (num) {
					return this.utils.getOuterHtml(this.marker.get(num));
				},
				find: function (num) {
					num = (typeof num === 'undefined') ? 1 : num;
					
					return this.core.editor().find('span#selection-marker-' + num);
				},
				insert: function () {
					var sel = this.selection.get();
					var range = this.selection.range(sel);
					
					this.marker.insertNode(range, this.marker.get(1), true);
					if (range && range.collapsed === false) {
						this.marker.insertNode(range, this.marker.get(2), false);
					}
					
				},
				remove: function () {
					this.core.editor().find('.redactor-selection-marker').each(this.marker.iterateRemove);
				},
				
				// private
				insertNode: function (range, node, collapse) {
					var parent = this.selection.parent();
					if (range === null || $(parent).closest('.redactor-in').length === 0) {
						return;
					}
					
					range = range.cloneRange();
					
					try {
						range.collapse(collapse);
						range.insertNode(node);
					}
					catch (e) {
						this.focus.start();
					}
				},
				iterateRemove: function (i, el) {
					var $el = $(el);
					var text = $el.text().replace(/\u200B/g, '');
					var parent = $el.parent()[0];
					
					if (text === '') $el.remove(); else $el.replaceWith(function () { return $(this).contents(); });
					
					// if (parent && parent.normalize) parent.normalize();
				}
			};
		},
		
		// =modal
		modal: function () {
			return {
				callbacks: {},
				templates: function () {
					this.opts.modal = {
						'image-edit': '',
						
						'image': '',
						
						'file': '',
						
						'link': String() + '<div class="redactor-modal-tab" data-title="General">' + '<section>' + '<label>URL</label>' + '<input type="url" id="redactor-link-url" aria-label="URL" />' + '</section>' + '<section>' + '<label>' + this.lang.get(
							'text') + '</label>' + '<input type="text" id="redactor-link-url-text" aria-label="' + this.lang.get(
							'text') + '" />' + '</section>' + '<section>' + '<label class="checkbox"><input type="checkbox" id="redactor-link-blank"> ' + this.lang.get(
							'link-in-new-tab') + '</label>' + '</section>' + '<section>' + '<button id="redactor-modal-button-action">' + this.lang.get(
							'insert') + '</button>' + '<button id="redactor-modal-button-cancel">' + this.lang.get(
							'cancel') + '</button>' + '</section>' + '</div>'
					};
					
					$.extend(this.opts, this.opts.modal);
					
				},
				addCallback: function (name, callback) {
					this.modal.callbacks[name] = callback;
				},
				addTemplate: function (name, template) {
					this.opts.modal[name] = template;
				},
				getTemplate: function (name) {
					return this.opts.modal[name];
				},
				getModal: function () {
					return this.$modalBody;
				},
				getActionButton: function () {
					return this.$modalBody.find('#redactor-modal-button-action');
				},
				getCancelButton: function () {
					return this.$modalBody.find('#redactor-modal-button-cancel');
				},
				getDeleteButton: function () {
					return this.$modalBody.find('#redactor-modal-button-delete');
				},
				load: function () { /* WoltLabModal.js */ },
				show: function () { /* WoltLabModal.js */ },
				buildWidth: function () { },
				buildTabber: function () {},
				showTab: function () {},
				setTitle: function () { /* WoltLabModal.js */ },
				setContent: function () {
					this.$modalBody.html(this.modal.getTemplate(this.modal.templateName));
					
					this.modal.getCancelButton().on('mousedown', $.proxy(this.modal.close, this));
				},
				setDraggable: function () {},
				setEnter: function () {},
				build: function () {
					this.modal.buildOverlay();
					
					this.$modalBox = $('<div id="redactor-modal-box"/>').hide();
					this.$modal = $('<div id="redactor-modal" role="dialog" />');
					this.$modalHeader = $('<div id="redactor-modal-header" />');
					this.$modalClose = $(
						'<button type="button" id="redactor-modal-close" aria-label="' + this.lang.get(
						'close') + '" />').html('&times;');
					this.$modalBody = $('<div id="redactor-modal-body" />');
					
					this.$modal.append(this.$modalHeader);
					this.$modal.append(this.$modalBody);
					this.$modal.append(this.$modalClose);
					this.$modalBox.append(this.$modal);
					this.$modalBox.appendTo(document.body);
					
				},
				buildOverlay: function () {
					this.$modalOverlay = $('<div id="redactor-modal-overlay">').hide();
					$('body').prepend(this.$modalOverlay);
				},
				enableEvents: function () {},
				disableEvents: function () {},
				closeHandler: function () {},
				close: function () { /* WoltLabModal.js */ }
			};
		},
		
		// =observe
		observe: function () {
			return {
				load: function () {
					if (typeof this.opts.destroyed !== 'undefined') {
						return;
					}
					
					this.observe.links();
					this.observe.images();
					
				},
				isCurrent: function ($el, $current) {
					if (typeof $current === 'undefined') {
						$current = $(this.selection.current());
					}
					
					return $current.is($el) || $current.parents($el).length > 0;
				},
				toolbar: function () {
					this.observe.buttons();
					this.observe.dropdowns();
				},
				buttons: function (e, btnName) {
					var current = this.selection.current();
					var parent = this.selection.parent();
					
					if (e !== false) {
						this.button.setInactiveAll();
					}
					else {
						this.button.setInactiveAll(btnName);
					}
					
					if (e === false && btnName !== 'html') {
						if ($.inArray(btnName, this.opts.activeButtons) !== -1) {
							this.button.toggleActive(btnName);
						}
						return;
					}
					
					if (!this.utils.isRedactorParent(current)) {
						return;
					}
					
					// disable line
					if (this.core.editor().css('display') !== 'none') {
						if (this.utils.isCurrentOrParentHeader() || this.utils.isCurrentOrParent(
							['table', 'pre', 'blockquote', 'li'])) {
							this.button.disable('horizontalrule');
						}
						else {
							this.button.enable('horizontalrule');
						}
					}
					
					$.each(this.opts.activeButtonsStates, $.proxy(function (key, value) {
						var parentEl = $(parent).closest(key, this.$editor[0]);
						var currentEl = $(current).closest(key, this.$editor[0]);
						
						if (parentEl.length !== 0 && !this.utils.isRedactorParent(parentEl)) {
							return;
						}
						
						if (!this.utils.isRedactorParent(currentEl)) {
							return;
						}
						
						if (parentEl.length !== 0 || currentEl.closest(key,
							this.$editor[0]
						).length !== 0) {
							this.button.setActive(value);
						}
						
					}, this));
					
				},
				dropdowns: function () {
					var finded = $('<div />').html(this.selection.html()).find('a').length;
					var $current = $(this.selection.current());
					var isRedactor = this.utils.isRedactorParent($current);
					
					$.each(this.opts.observe.dropdowns, $.proxy(function (key, value) {
						var observe = value.observe, element = observe.element,
							$item = value.item,
							inValues = typeof observe['in'] !== 'undefined' ? observe['in'] : false,
							outValues = typeof observe.out !== 'undefined' ? observe.out : false;
						
						if (($current.closest(element).length > 0 && isRedactor) || (element === 'a' && finded !== 0)) {
							this.observe.setDropdownProperties($item, inValues, outValues);
						}
						else {
							this.observe.setDropdownProperties($item, outValues, inValues);
						}
						
					}, this));
				},
				setDropdownProperties: function ($item, addProperties, deleteProperties) {
					if (deleteProperties && typeof deleteProperties.attr !== 'undefined') {
						this.observe.setDropdownAttr($item, deleteProperties.attr, true);
					}
					
					if (typeof addProperties.attr !== 'undefined') {
						this.observe.setDropdownAttr($item, addProperties.attr);
					}
					
					if (typeof addProperties.title !== 'undefined') {
						$item.find('span').text(addProperties.title);
					}
				},
				setDropdownAttr: function ($item, properties, isDelete) {
					$.each(properties, function (key, value) {
						if (key === 'class') {
							if (!isDelete) {
								$item.addClass(value);
							}
							else {
								$item.removeClass(value);
							}
						}
						else {
							if (!isDelete) {
								$item.attr(key, value);
							}
							else {
								$item.removeAttr(key);
							}
						}
					});
				},
				addDropdown: function ($item, btnName, btnObject) {
					if (typeof btnObject.observe === 'undefined') {
						return;
					}
					
					btnObject.item = $item;
					
					this.opts.observe.dropdowns.push(btnObject);
				},
				images: function () {
					if (this.opts.imageEditable) {
						this.core.editor().addClass('redactor-layer-img-edit');
						this.core.editor().find('img').each($.proxy(function (i, img) {
							var $img = $(img);
							
							// IE fix (when we clicked on an image and then press backspace IE does goes to image's url)
							$img.closest('a', this.$editor[0]).on('click',
								function (e) { e.preventDefault(); }
							);
							
							this.image.setEditable($img);
							
						}, this));
					}
				},
				links: function () {
					if (this.opts.linkTooltip) {
						this.core.editor().find('a').each($.proxy(function (i, s) {
							var $link = $(s);
							if ($link.data('cached') !== true) {
								$link.data('cached', true);
								$link.on(
									'touchstart.redactor.' + this.uuid + ' click.redactor.' + this.uuid,
									$.proxy(this.observe.showTooltip, this)
								);
							}
							
						}, this));
					}
				},
				getTooltipPosition: function ($link) {
					return $link.offset();
				},
				showTooltip: function (e) {
					var $el = $(e.target);
					
					if ($el[0].tagName === 'IMG') {
						return;
					}
					
					if ($el[0].tagName !== 'A') {
						$el = $el.closest('a', this.$editor[0]);
					}
					
					if ($el[0].tagName !== 'A') {
						return;
					}
					
					var $link = $el;
					
					var pos = this.observe.getTooltipPosition($link);
					var tooltip = $('<span class="redactor-link-tooltip"></span>');
					
					var href = $link.attr('href');
					if (href === undefined) {
						href = '';
					}
					
					if (href.length > 24) {
						href = href.substring(0, 24) + '...';
					}
					
					var aLink = $('<a href="' + $link.attr('href') + '" target="_blank" />').html(
						href).addClass('redactor-link-tooltip-action');
					var aEdit = $('<a href="#" />')
						.html(this.lang.get('edit'))
						.addClass('redactor-link-tooltip-action')
						.on('click', (event) => this.link.show(event, $link));
					var aUnlink = $('<a href="#" />')
						.html(this.lang.get('unlink'))
						.addClass('redactor-link-tooltip-action')
						.on('click', (event) => this.link.unlink(event, $link));
					
					tooltip.append(aLink).append(' | ').append(aEdit).append(' | ').append(aUnlink);
					
					var lineHeight = parseInt($link.css('line-height'), 10);
					var lineClicked = Math.ceil((e.pageY - pos.top) / lineHeight);
					var top = pos.top + lineClicked * lineHeight;

					// WoltLab Modification START

					// Check if the tooltip would exceed the available screen.
					document.body.appendChild(tooltip[0]);
					const tooltipWidth = Math.trunc(tooltip[0].clientWidth);
					tooltip[0].remove();

					var tooltipLeft = `${pos.left}px`;
					var tooltipRight = "auto";
					const overflowRight = document.body.clientWidth - (pos.left + tooltipWidth);
					if (overflowRight < 0) {
						const rect = $link[0].getBoundingClientRect();
						const rightBoundary = Math.trunc(rect.right);
						const leftBoundary = rightBoundary - tooltipWidth;

						// Align it with the right boundary if there is enough space this way.
						if (leftBoundary > 0) {
							tooltipLeft = "auto";
							tooltipRight = (document.body.clientWidth - rightBoundary) + "px";
						} else {
							// The tooltip will overflow the left side too, align the tooltip
							// to the center.
							let offsetLeft = Math.trunc((document.body.clientWidth - tooltipWidth) / 2);

							// If the tooltip does not fit on the screen, force it to go from
							// exactly left to right.
							if (offsetLeft < 0) {
								tooltipLeft = "0px";
								tooltipRight = "0px";
							} else {
								tooltipLeft = `${offsetLeft}px`;
							}
						}
					}

					// WoltLab Modification END
					
					tooltip.css({
						top: top + 'px',
						left: tooltipLeft,
						right: tooltipRight
					});
					
					$('.redactor-link-tooltip').remove();
					$('body').append(tooltip);
					
					this.core.editor().on('touchstart.redactor.' + this.uuid + ' click.redactor.' + this.uuid,
						$.proxy(this.observe.closeTooltip, this)
					);
					$(document).on('touchstart.redactor.' + this.uuid + ' click.redactor.' + this.uuid,
						$.proxy(this.observe.closeTooltip, this)
					);
				},
				closeAllTooltip: function () {
					$('.redactor-link-tooltip').remove();
				},
				closeTooltip: function (e) {
					e = e.originalEvent || e;
					
					var target = e.target;
					var $parent = $(target).closest('a', this.$editor[0]);
					if ($parent.length !== 0 && $parent[0].tagName === 'A' && target.tagName !== 'A') {
						return;
					}
					else if ((target.tagName === 'A' && this.utils.isRedactorParent(target)) || $(
						target).hasClass('redactor-link-tooltip-action')) {
						return;
					}
					
					this.observe.closeAllTooltip();
					
					this.core.editor().off('touchstart.redactor.' + this.uuid + ' click.redactor.' + this.uuid,
						$.proxy(this.observe.closeTooltip, this)
					);
					$(document).off('touchstart.redactor.' + this.uuid + ' click.redactor.' + this.uuid,
						$.proxy(this.observe.closeTooltip, this)
					);
				}
				
			};
		},
		
		// =offset
		offset: function () {
			return {
				get: function (node) {
					var cloned = this.offset.clone(node);
					if (cloned === false) {
						return 0;
					}
					
					var div = document.createElement('div');
					div.appendChild(cloned.cloneContents());
					div.innerHTML = div.innerHTML.replace(/<img(.*?[^>])>$/gi, 'i');
					
					var text = $.trim($(div).text()).replace(/[\t\n\r\n]/g, '').replace(/\u200B/g,
						''
					);
					
					return text.length;
					
				},
				clone: function (node) {
					var sel = this.selection.get();
					var range = this.selection.range(sel);
					
					if (range === null && typeof node === 'undefined') {
						return false;
					}
					
					node = (typeof node === 'undefined') ? this.$editor : node;
					if (node === false) {
						return false;
					}
					
					node = node[0] || node;
					
					var cloned = range.cloneRange();
					cloned.selectNodeContents(node);
					cloned.setEnd(range.endContainer, range.endOffset);
					
					return cloned;
				},
				set: function (start, end) {
					end = (typeof end === 'undefined') ? start : end;
					
					if (!this.focus.is()) {
						this.focus.start();
					}
					
					var sel = this.selection.get();
					var range = this.selection.range(sel);
					var node, offset = 0;
					var walker = document.createTreeWalker(this.$editor[0],
						NodeFilter.SHOW_TEXT,
						null,
						null
					);
					
					while ((node = walker.nextNode()) !== null) {
						offset += node.nodeValue.length;
						if (offset > start) {
							range.setStart(node, node.nodeValue.length + start - offset);
							start = Infinity;
						}
						
						if (offset >= end) {
							range.setEnd(node, node.nodeValue.length + end - offset);
							break;
						}
					}
					
					range.collapse(false);
					this.selection.update(sel, range);
				}
			};
		},
		
		// =paragraphize
		paragraphize: function () {
			return {
				load: function (html) {
					if (this.opts.paragraphize === false || this.opts.type === 'inline' || this.opts.type === 'pre') {
						return html;
					}
					
					if (html === '' || html === '<p></p>') {
						return this.opts.emptyHtml;
					}
					
					html = html + '\n';
					
					this.paragraphize.safes = [];
					this.paragraphize.z = 0;
					
					// before
					html = html.replace(/(<br\s?\/?>){1,}\n?<\/blockquote>/gi, '</blockquote>');
					html = html.replace(/<\/pre>/gi, '</pre>\n\n');
					html = html.replace(/<p>\s<br><\/p>/gi, '<p></p>');
					
					html = this.paragraphize.getSafes(html);
					
					html = html.replace('<br>', '\n');
					html = this.paragraphize.convert(html);
					
					html = this.paragraphize.clear(html);
					html = this.paragraphize.restoreSafes(html);
					
					// after
					html = html.replace(new RegExp('<br\\s?/?>\n?<(' + this.opts.paragraphizeBlocks.join(
						'|') + ')(.*?[^>])>', 'gi'), '<p><br /></p>\n<$1$2>');
					
					return $.trim(html);
				},
				getSafes: function (html) {
					var $div = $('<div />').append(html);
					
					// remove paragraphs in blockquotes
					$div.find('blockquote p').replaceWith(function () {
						return $(this).append('<br />').contents();
					});
					
					$div.find(this.opts.paragraphizeBlocks.join(', ')).each($.proxy(function (i, s) {
						this.paragraphize.z++;
						this.paragraphize.safes[this.paragraphize.z] = s.outerHTML;
						
						return $(s).replaceWith('\n#####replace' + this.paragraphize.z + '#####\n\n');
						
					}, this));
					
					// deal with redactor selection markers
					$div.find('span.redactor-selection-marker').each($.proxy(function (i, s) {
						this.paragraphize.z++;
						this.paragraphize.safes[this.paragraphize.z] = s.outerHTML;
						
						return $(s).replaceWith('\n#####replace' + this.paragraphize.z + '#####\n\n');
					}, this));
					
					return $div.html();
				},
				restoreSafes: function (html) {
					$.each(this.paragraphize.safes, function (i, s) {
						s = (typeof s !== 'undefined') ? s.replace(/\$/g, '&#36;') : s;
						html = html.replace('#####replace' + i + '#####', s);
						
					});
					
					return html;
				},
				convert: function (html) {
					html = html.replace(/\r\n/g, 'xparagraphmarkerz');
					html = html.replace(/\n/g, 'xparagraphmarkerz');
					html = html.replace(/\r/g, 'xparagraphmarkerz');
					
					var re1 = /\s+/g;
					html = html.replace(re1, ' ');
					html = $.trim(html);
					
					var re2 = /xparagraphmarkerzxparagraphmarkerz/gi;
					html = html.replace(re2, '</p><p>');
					
					var re3 = /xparagraphmarkerz/gi;
					html = html.replace(re3, '<br>');
					
					html = '<p>' + html + '</p>';
					
					html = html.replace('<p></p>', '');
					html = html.replace('\r\n\r\n', '');
					html = html.replace(/<\/p><p>/g, '</p>\r\n\r\n<p>');
					html = html.replace(new RegExp('<br\\s?/?></p>', 'g'), '</p>');
					html = html.replace(new RegExp('<p><br\\s?/?>', 'g'), '<p>');
					html = html.replace(new RegExp('<p><br\\s?/?>', 'g'), '<p>');
					html = html.replace(new RegExp('<br\\s?/?></p>', 'g'), '</p>');
					html = html.replace(/<p>&nbsp;<\/p>/gi, '');
					html = html.replace(/<p>\s?<br>&nbsp;<\/p>/gi, '');
					html = html.replace(/<p>\s?<br>/gi, '<p>');
					
					return html;
				},
				clear: function (html) {
					
					html = html.replace(
						/<p>(.*?)#####replace(.*?)#####\s?<\/p>/gi,
						'<p>$1</p>#####replace$2#####'
					);
					html = html.replace(/(<br\s?\/?>){2,}<\/p>/gi, '</p>');
					
					html = html.replace(new RegExp('</blockquote></p>', 'gi'), '</blockquote>');
					html = html.replace(new RegExp('<p></blockquote>', 'gi'), '</blockquote>');
					html = html.replace(new RegExp('<p><blockquote>', 'gi'), '<blockquote>');
					html = html.replace(new RegExp('<blockquote></p>', 'gi'), '<blockquote>');
					
					html = html.replace(new RegExp('<p><p ', 'gi'), '<p ');
					html = html.replace(new RegExp('<p><p>', 'gi'), '<p>');
					html = html.replace(new RegExp('</p></p>', 'gi'), '</p>');
					html = html.replace(new RegExp('<p>\\s?</p>', 'gi'), '');
					html = html.replace(new RegExp('\n</p>', 'gi'), '</p>');
					html = html.replace(new RegExp('<p>\t?\t?\n?<p>', 'gi'), '<p>');
					html = html.replace(new RegExp('<p>\t*</p>', 'gi'), '');
					
					return html;
				}
			};
		},
		
		// =paste
		paste: function () {
			return {
				init: function (e) {
					this.rtePaste = true;
					var pre = (this.opts.type === 'pre' || this.utils.isCurrentOrParent('pre')) ? true : false;
					
					// clipboard event
					if (this.detect.isDesktop()) {
						
						if (!this.paste.pre && this.opts.clipboardImageUpload && this.opts.imageUpload && this.paste.detectClipboardUpload(
							e)) {
							if (this.detect.isIe()) {
								setTimeout($.proxy(this.paste.clipboardUpload, this),
									100
								);
							}
							
							return;
						}
					}
					
					this.utils.saveScroll();
					this.selection.save();
					this.paste.createPasteBox(pre);
					
					$(window).on('scroll.redactor-freeze', $.proxy(function () {
						$(window).scrollTop(this.saveBodyScroll);
						
					}, this));
					
					setTimeout($.proxy(function () {
						var html = this.paste.getPasteBoxCode(pre);
						
						// buffer
						this.buffer.set();
						this.selection.restore();
						
						this.utils.restoreScroll();
						
						// paste info
						var data = this.clean.getCurrentType(html);
						
						// clean
						html = this.clean.onPaste(html, data);
						
						// callback
						var returned = this.core.callback('paste', html);
						html = (typeof returned === 'undefined') ? html : returned;
						
						this.paste.insert(html, data);
						this.rtePaste = false;
						
						// clean pre breaklines
						if (pre) {
							this.clean.cleanPre();
						}
						
						$(window).off('scroll.redactor-freeze');
						
					}, this), 1);
					
				},
				getPasteBoxCode: function (pre) {
					var html = (pre) ? this.$pasteBox.val() : this.$pasteBox.html();
					this.$pasteBox.remove();
					
					return html;
				},
				createPasteBox: function (pre) {
					var css = {
						position: 'fixed',
						width: '1px',
						top: 0,
						left: '-9999px'
					};
					
					this.$pasteBox = (pre) ? $('<textarea>').css(css) : $('<div>').attr('contenteditable',
						'true'
					).css(css);
					this.paste.appendPasteBox();
					this.$pasteBox.focus();
				},
				appendPasteBox: function () {
					if (this.detect.isIe()) {
						this.core.box().append(this.$pasteBox);
					}
					else {
						// bootstrap modal
						var $visibleModals = $('.modal-body:visible');
						if ($visibleModals.length > 0) {
							$visibleModals.append(this.$pasteBox);
						}
						else {
							$('body').prepend(this.$pasteBox);
						}
					}
				},
				detectClipboardUpload: function (e) {
					e = e.originalEvent || e;
					
					var clipboard = e.clipboardData;
					if (this.detect.isIe() || this.detect.isFirefox()) {
						return false;
					}
					
					// prevent safari fake url
					var types = clipboard.types;
					if (types.indexOf('public.tiff') !== -1) {
						e.preventDefault();
						return false;
					}
					
					if (!clipboard.items || !clipboard.items.length) {
						return;
					}
					
					var file = clipboard.items[0].getAsFile();
					if (file === null) {
						return false;
					}
					
					var reader = new FileReader();
					reader.readAsDataURL(file);
					reader.onload = $.proxy(this.paste.insertFromClipboard, this);
					
					return true;
				},
				clipboardUpload: function () {
					var imgs = this.$editor.find('img');
					$.each(imgs, $.proxy(function (i, s) {
						if (s.src.search(/^data\:image/i) === -1) {
							return;
						}
						
						var formData = !!window.FormData ? new FormData() : null;
						if (!window.FormData) {
							return;
						}
						
						this.upload.direct = true;
						this.upload.type = 'image';
						this.upload.url = this.opts.imageUpload;
						this.upload.callback = $.proxy(function (data) {
							if (this.detect.isIe()) {
								$(s).wrap($('<figure />'));
							}
							
							else {
								var $parent = $(s).parent();
								this.utils.replaceToTag($parent, 'figure');
							}
							
							s.src = data.url;
							this.core.callback('imageUpload', $(s), data);
							
						}, this);
						
						var blob = this.utils.dataURItoBlob(s.src);
						
						formData.append('clipboard', 1);
						formData.append(this.opts.imageUploadParam, blob);
						
						this.upload.send(formData, false);
						this.code.sync();
						this.rtePaste = false;
						
					}, this));
				},
				insertFromClipboard: function (e) {
					var formData = !!window.FormData ? new FormData() : null;
					if (!window.FormData) {
						return;
					}
					
					this.upload.direct = true;
					this.upload.type = 'image';
					this.upload.url = this.opts.imageUpload;
					this.upload.callback = this.image.insert;
					
					var blob = this.utils.dataURItoBlob(e.target.result);
					
					formData.append('clipboard', 1);
					formData.append(this.opts.imageUploadParam, blob);
					
					this.upload.send(formData, e);
					this.rtePaste = false;
				},
				insert: function (html, data) {
					if (data.pre) {
						this.insert.raw(html);
					}
					else if (data.text) {
						this.insert.text(html);
					}
					else {
						this.insert.html(html, data);
					}
					
					// Firefox Clipboard Observe
					if (this.detect.isFirefox() && this.opts.imageUpload && this.opts.clipboardImageUpload) {
						setTimeout($.proxy(this.paste.clipboardUpload, this), 100);
					}
					
				}
			};
		},
		
		// =placeholder -- UNSUPPORTED MODULE
		placeholder: function () {
			return {
				enable: function () {},
				show: function () {},
				update: function () {},
				hide: function () {},
				is: function () {},
				init: function () {},
				enabled: function () {},
				enableEvents: function () {},
				disableEvents: function () {},
				build: function () {},
				buildPosition: function () {},
				getPosition: function () {},
				isEditorEmpty: function () {},
				isAttr: function () {},
				destroy: function () {}
			};
		},
		
		// =progress -- UNSUPPORTED MODULE
		progress: function () {
			return {
				$box: null,
				$bar: null,
				target: document.body,  // or id selector
				show: function () {},
				hide: function () {},
				update: function () {},
				is: function () {},
				build: function () {},
				destroy: function () {}
			};
		},
		
		// =selection
		selection: function () {
			return {
				get: function () {
					if (window.getSelection) {
						return window.getSelection();
					}
					else if (document.selection && document.selection.type !== 'Control') {
						return document.selection;
					}
					
					return null;
				},
				range: function (sel) {
					if (typeof sel === 'undefined') {
						sel = this.selection.get();
					}
					
					if (sel.getRangeAt && sel.rangeCount) {
						return sel.getRangeAt(0);
					}
					
					return null;
				},
				is: function () {
					return (this.selection.isCollapsed()) ? false : true;
				},
				isRedactor: function () {
					var range = this.selection.range();
					
					if (range !== null) {
						var el = range.startContainer.parentNode;
						
						if ($(el).hasClass('redactor-in') || $(el).parents('.redactor-in').length !== 0) {
							return true;
						}
					}
					
					return false;
				},
				isCollapsed: function () {
					var sel = this.selection.get();
					
					return (sel === null) ? false : sel.isCollapsed;
				},
				update: function (sel, range) {
					if (range === null) {
						return;
					}
					
					sel.removeAllRanges();
					sel.addRange(range);
				},
				current: function () {
					var sel = this.selection.get();
					
					return (sel === null) ? false : sel.anchorNode;
				},
				parent: function () {
					var current = this.selection.current();
					
					return (current === null) ? false : current.parentNode;
				},
				block: function (node) {
					node = node || this.selection.current();
					
					while (node) {
						if (this.utils.isBlockTag(node.tagName)) {
							return ($(node).hasClass('redactor-in')) ? false : node;
						}
						
						node = node.parentNode;
					}
					
					return false;
				},
				inline: function (node) {
					node = node || this.selection.current();
					
					while (node) {
						if (this.utils.isInlineTag(node.tagName)) {
							return ($(node).hasClass('redactor-in')) ? false : node;
						}
						
						node = node.parentNode;
					}
					
					return false;
				},
				element: function (node) {
					if (!node) {
						node = this.selection.current();
					}
					
					while (node) {
						if (node.nodeType === 1) {
							if ($(node).hasClass('redactor-in')) {
								return false;
							}
							
							return node;
						}
						
						node = node.parentNode;
					}
					
					return false;
				},
				prev: function () {
					var current = this.selection.current();
					
					return (current === null) ? false : this.selection.current().previousSibling;
				},
				next: function () {
					var current = this.selection.current();
					
					return (current === null) ? false : this.selection.current().nextSibling;
				},
				blocks: function (tag) {
					var blocks = [];
					var nodes = this.selection.nodes(tag);
					
					$.each(nodes, $.proxy(function (i, node) {
						if (this.utils.isBlock(node)) {
							blocks.push(node);
						}
						
					}, this));
					
					var block = this.selection.block();
					if (blocks.length === 0 && block === false) {
						return [];
					}
					else if (blocks.length === 0 && block !== false) {
						return [block];
					}
					else {
						return blocks;
					}
					
				},
				inlines: function (tag) {
					var inlines = [];
					var nodes = this.selection.nodes(tag);
					
					$.each(nodes, $.proxy(function (i, node) {
						if (this.utils.isInline(node)) {
							inlines.push(node);
						}
						
					}, this));
					
					var inline = this.selection.inline();
					if (inlines.length === 0 && inline === false) {
						return [];
					}
					else if (inlines.length === 0 && inline !== false) {
						return [inline];
					}
					else {
						return inlines;
					}
				},
				nodes: function (tag) {
					var filter = (typeof tag === 'undefined') ? [] : (($.isArray(tag)) ? tag : [tag]);
					
					var sel = this.selection.get();
					var range = this.selection.range(sel);
					var nodes = [];
					var resultNodes = [];
					
					if (this.utils.isCollapsed()) {
						nodes = [this.selection.current()];
					}
					else {
						var node = range.startContainer;
						var endNode = range.endContainer;
						
						// single node
						if (node === endNode) {
							return [node];
						}
						
						// iterate
						while (node && node !== endNode) {
							nodes.push(node = this.selection.nextNode(node));
						}
						
						// partially selected nodes
						node = range.startContainer;
						while (node && node !== range.commonAncestorContainer) {
							nodes.unshift(node);
							node = node.parentNode;
						}
					}
					
					// remove service nodes
					$.each(nodes, function (i, s) {
						if (s) {
							var tagName = (s.nodeType !== 1) ? false : s.tagName.toLowerCase();
							
							if ($(s).hasClass('redactor-script-tag') || $(s).hasClass(
								'redactor-selection-marker')) {
								return;
							}
							else if (tagName && filter.length !== 0 && $.inArray(tagName,
								filter
							) === -1) {
								return;
							}
							else {
								resultNodes.push(s);
							}
						}
					});
					
					return (resultNodes.length === 0) ? [] : resultNodes;
				},
				nextNode: function (node) {
					if (node.hasChildNodes()) {
						return node.firstChild;
					}
					else {
						while (node && !node.nextSibling) {
							node = node.parentNode;
						}
						
						if (!node) {
							return null;
						}
						
						return node.nextSibling;
					}
				},
				save: function () {
					this.marker.insert();
					this.savedSel = this.core.editor().html();
				},
				restore: function (removeMarkers) {
					var node1 = this.marker.find(1);
					var node2 = this.marker.find(2);
					
					if (this.detect.isFirefox()) {
						this.core.editor().focus();
					}
					
					if (node1.length !== 0 && node2.length !== 0) {
						this.caret.set(node1, node2);
					}
					else if (node1.length !== 0) {
						this.caret.start(node1);
					}
					else {
						this.core.editor().focus();
					}
					
					if (removeMarkers !== false) {
						this.marker.remove();
						this.savedSel = false;
					}
				},
				saveInstant: function () {
					var el = this.core.editor()[0];
					var doc = el.ownerDocument, win = doc.defaultView;
					var sel = win.getSelection();
					
					if (!sel.getRangeAt || !sel.rangeCount) {
						return;
					}
					
					var range = sel.getRangeAt(0);
					var selectionRange = range.cloneRange();
					
					selectionRange.selectNodeContents(el);
					selectionRange.setEnd(range.startContainer, range.startOffset);
					
					var start = selectionRange.toString().length;
					
					this.saved = {
						start: start,
						end: start + range.toString().length,
						node: range.startContainer
					};
					
					return this.saved;
				},
				restoreInstant: function (saved) {
					if (typeof saved === 'undefined' && !this.saved) {
						return;
					}
					
					this.saved = (typeof saved !== 'undefined') ? saved : this.saved;
					
					var $node = this.core.editor().find(this.saved.node);
					if ($node.length !== 0 && $node.text().trim().replace(/\u200B/g,
						''
					).length === 0) {
						try {
							var range = document.createRange();
							range.setStart($node[0], 0);
							
							var sel = window.getSelection();
							sel.removeAllRanges();
							sel.addRange(range);
						}
						catch (e) {}
						
						return;
					}
					
					var el = this.core.editor()[0];
					var doc = el.ownerDocument, win = doc.defaultView;
					var charIndex = 0, range = doc.createRange();
					
					range.setStart(el, 0);
					range.collapse(true);
					
					var nodeStack = [el], node, foundStart = false, stop = false;
					while (!stop && (node = nodeStack.pop())) {
						if (node.nodeType == 3) {
							var nextCharIndex = charIndex + node.length;
							if (!foundStart && this.saved.start >= charIndex && this.saved.start <= nextCharIndex) {
								range.setStart(node, this.saved.start - charIndex);
								foundStart = true;
							}
							
							if (foundStart && this.saved.end >= charIndex && this.saved.end <= nextCharIndex) {
								range.setEnd(node, this.saved.end - charIndex);
								stop = true;
							}
							charIndex = nextCharIndex;
						}
						else {
							var i = node.childNodes.length;
							while (i--) {
								nodeStack.push(node.childNodes[i]);
							}
						}
					}
					
					var sel = win.getSelection();
					sel.removeAllRanges();
					sel.addRange(range);
				},
				node: function (node) {
					$(node).prepend(this.marker.get(1));
					$(node).append(this.marker.get(2));
					
					this.selection.restore();
				},
				all: function () {
					this.core.editor().focus();
					
					var sel = this.selection.get();
					var range = this.selection.range(sel);
					
					range.selectNodeContents(this.core.editor()[0]);
					
					this.selection.update(sel, range);
				},
				remove: function () {
					this.selection.get().removeAllRanges();
				},
				replace: function (html) {
					this.insert.html(html);
				},
				text: function () {
					return this.selection.get().toString();
				},
				html: function () {
					var html = '';
					var sel = this.selection.get();
					
					if (sel.rangeCount) {
						var container = document.createElement('div');
						var len = sel.rangeCount;
						for (var i = 0; i < len; ++i) {
							container.appendChild(sel.getRangeAt(i).cloneContents());
						}
						
						html = this.clean.onGet(container.innerHTML);
					}
					
					return html;
				},
				extractEndOfNode: function (node) {
					var sel = this.selection.get();
					var range = this.selection.range(sel);
					
					var clonedRange = range.cloneRange();
					clonedRange.selectNodeContents(node);
					clonedRange.setStart(range.endContainer, range.endOffset);
					
					return clonedRange.extractContents();
				},
				
				// #backward
				removeMarkers: function () {
					this.marker.remove();
				},
				marker: function (num) {
					return this.marker.get(num);
				},
				markerHtml: function (num) {
					return this.marker.html(num);
				}
				
			};
		},
		
		// =shortcuts
		shortcuts: function () {
			return {
				// based on https://github.com/jeresig/jquery.hotkeys
				hotkeysSpecialKeys: {
					8: 'backspace',
					9: 'tab',
					10: 'return',
					13: 'return',
					16: 'shift',
					17: 'ctrl',
					18: 'alt',
					19: 'pause',
					20: 'capslock',
					27: 'esc',
					32: 'space',
					33: 'pageup',
					34: 'pagedown',
					35: 'end',
					36: 'home',
					37: 'left',
					38: 'up',
					39: 'right',
					40: 'down',
					45: 'insert',
					46: 'del',
					59: ';',
					61: '=',
					96: '0',
					97: '1',
					98: '2',
					99: '3',
					100: '4',
					101: '5',
					102: '6',
					103: '7',
					104: '8',
					105: '9',
					106: '*',
					107: '+',
					109: '-',
					110: '.',
					111: '/',
					112: 'f1',
					113: 'f2',
					114: 'f3',
					115: 'f4',
					116: 'f5',
					117: 'f6',
					118: 'f7',
					119: 'f8',
					120: 'f9',
					121: 'f10',
					122: 'f11',
					123: 'f12',
					144: 'numlock',
					145: 'scroll',
					173: '-',
					186: ';',
					187: '=',
					188: ',',
					189: '-',
					190: '.',
					191: '/',
					192: '`',
					219: '[',
					220: '\\',
					221: ']',
					222: '\''
				},
				hotkeysShiftNums: {
					'`': '~',
					'1': '!',
					'2': '@',
					'3': '#',
					'4': '$',
					'5': '%',
					'6': '^',
					'7': '&',
					'8': '*',
					'9': '(',
					'0': ')',
					'-': '_',
					'=': '+',
					';': ': ',
					'\'': '"',
					',': '<',
					'.': '>',
					'/': '?',
					'\\': '|'
				},
				init: function (e, key) {
					// disable browser's hot keys for bold and italic if shortcuts off
					if (this.opts.shortcuts === false) {
						if ((e.ctrlKey || e.metaKey) && (key === 66 || key === 73)) {
							e.preventDefault();
						}
						
						return false;
					}
					else {
						// build
						$.each(this.opts.shortcuts, $.proxy(function (str, command) {
							this.shortcuts.build(e, str, command);
							
						}, this));
					}
				},
				build: function (e, str, command) {
					var handler = $.proxy(function () {
						this.shortcuts.buildHandler(command);
						
					}, this);
					
					var keys = str.split(',');
					var len = keys.length;
					for (var i = 0; i < len; i++) {
						if (typeof keys[i] === 'string') {
							this.shortcuts.handler(e, $.trim(keys[i]), handler);
						}
					}
					
				},
				buildHandler: function (command) {
					var func;
					if (command.func.search(/\./) !== '-1') {
						func = command.func.split('.');
						if (typeof this[func[0]] !== 'undefined') {
							this[func[0]][func[1]].apply(this, command.params);
						}
					}
					else {
						this[command.func].apply(this, command.params);
					}
				},
				handler: function (e, keys, origHandler) {
					keys = keys.toLowerCase().split(' ');
					
					var special = this.shortcuts.hotkeysSpecialKeys[e.keyCode];
					var character = String.fromCharCode(e.which).toLowerCase();
					var modif = '', possible = {};
					
					$.each(['alt', 'ctrl', 'meta', 'shift'], function (index, specialKey) {
						if (e[specialKey + 'Key'] && special !== specialKey) {
							modif += specialKey + '+';
						}
					});
					
					if (special) {
						possible[modif + special] = true;
					}
					
					if (character) {
						possible[modif + character] = true;
						possible[modif + this.shortcuts.hotkeysShiftNums[character]] = true;
						
						// "$" can be triggered as "Shift+4" or "Shift+$" or just "$"
						if (modif === 'shift+') {
							possible[this.shortcuts.hotkeysShiftNums[character]] = true;
						}
					}
					
					var len = keys.length;
					for (var i = 0; i < len; i++) {
						if (possible[keys[i]]) {
							e.preventDefault();
							return origHandler.apply(this, arguments);
						}
					}
				}
			};
		},
		
		// =storage -- UNSUPPORTED MODULE
		storage: function () {
			return {
				data: [],
				add: function () {},
				status: function () {},
				observe: function () {},
				changes: function () {}
				
			};
		},
		
		// =toolbar
		toolbar: function () {
			return {
				build: function () {
					this.button.hideButtons();
					this.button.hideButtonsOnMobile();
					
					this.$toolbarBox = $('<div class="redactor-toolbar-box" />');
					this.$toolbarBox[0].innerHTML = '<ul class="redactor-toolbar" id="redactor-toolbar-' + this.uuid + '" role="toolbar"></ul>';
					this.$toolbar = $(this.$toolbarBox[0].children[0]);
					this.$box[0].insertBefore(this.$toolbarBox[0], this.$box[0].firstChild);
					
					this.button.$toolbar = this.$toolbar;
					this.button.setFormatting();
					this.button.load(this.$toolbar);
					
					require(['Core'], (function(Core) {
						this.$toolbar[0].addEventListener('keydown', this.toolbar.keydown.bind(this, Core));
					}).bind(this));
				},
				createContainer: function () {},
				append: function () {},
				setOverflow: function () {},
				setFixed: function () {},
				setUnfixed: function () {},
				getBoxTop: function () {},
				observeScroll: function () {},
				observeScrollResize: function () {},
				observeScrollEnable: function () {},
				observeScrollDisable: function () {},
				setDropdownsFixed: function () {},
				unsetDropdownsFixed: function () {},
				setDropdownPosition: function () {},
				/**
				 * @param {object} Core
				 * @param {KeyboardEvent} event
				 */
				keydown: function(Core, event) {
					var activeButton = document.activeElement;
					if (!activeButton.classList.contains('re-button')) {
						return;
					}
					
					// Enter, Space, End, Home, ArrowLeft, ArrowRight, ArrowDown
					// Remarks: ArrowUp is not considered, because we do not support radio groups at the top level.
					var keyboardCodes = [13, 32, 35, 36, 37, 39, 40];
					if (keyboardCodes.indexOf(event.which) === -1) {
						return;
					}
					
					// [Enter] || [Space]
					if (event.which === 13 || event.which === 32) {
						event.preventDefault();
						
						require(['Core'], function(Core) {
							Core.triggerEvent(activeButton, 'mousedown');
						});
						
						return;
					}
					
					// [ArrowDown] opens drop-down menus, but does nothing on "regular" buttons.
					if (event.which === 40) {
						if (elAttr(activeButton, 'aria-haspopup') !== 'true') {
							return;
						}
						
						event.preventDefault();
						Core.triggerEvent(activeButton, 'mousedown');
						
						var dropdown = $(activeButton).data('dropdown');
						var firstItem = elBySel('li', dropdown[0]);
						if (firstItem) firstItem.focus();
						return;
					}
					
					event.preventDefault();
					
					var buttons = Array.prototype.slice.call(elBySelAll('.re-button', this.$toolbar[0]));
					var newActiveButton = null;
					// [End]
					if (event.which === 35) {
						newActiveButton = buttons[buttons.length - 1];
					}
					// [Home]
					else if (event.which === 36) {
						newActiveButton = buttons[0];
					}
					else {
						var index = buttons.indexOf(activeButton);
						
						// [ArrowLeft]
						if (event.which === 37) {
							index--;
							
							if (index === -1) {
								index = buttons.length - 1;
							}
						}
						// [ArrowRight]
						else if (event.which === 39) {
							index++;
							
							if (index === buttons.length) {
								index = 0;
							}
						}
						
						newActiveButton = buttons[index];
					}
					
					if (newActiveButton !== null) {
						newActiveButton.focus();
					}
				}
			};
		},
		
		// =upload -- UNSUPPORTED MODULE
		upload: function () {
			return {
				init: function () {},
				directUpload: function () {},
				onDrop: function () {},
				traverseFile: function () {},
				setConfig: function () {},
				getType: function () {},
				getHiddenFields: function () {},
				send: function () {},
				onDrag: function () {},
				onDragLeave: function () {},
				clearImageFields: function () {},
				addImageFields: function () {},
				removeImageFields: function () {},
				clearFileFields: function () {},
				addFileFields: function () {},
				removeFileFields: function () {}
			};
		},
		
		// =s3 -- UNSUPPORTED MODULE
		uploads3: function () {
			return {
				send: function () {},
				executeOnSignedUrl: function () {},
				createCORSRequest: function () {},
				sendToS3: function () {}
			};
		},
		
		// =utils
		utils: function () {
			return {
				isEmpty: function (html) {
					html = (typeof html === 'undefined') ? this.core.editor().html() : html;
					
					html = html.replace(/[\u200B-\u200D\uFEFF]/g, '');
					html = html.replace(/&nbsp;/gi, '');
					html = html.replace(/<\/?br\s?\/?>/g, '');
					html = html.replace(/\s/g, '');
					html = html.replace(/^<p>[^\W\w\D\d]*?<\/p>$/i, '');
					html = html.replace(/<iframe(.*?[^>])>$/i, 'iframe');
					html = html.replace(/<source(.*?[^>])>$/i, 'source');
					
					// remove empty tags
					html = html.replace(/<[^\/>][^>]*><\/[^>]+>/gi, '');
					html = html.replace(/<[^\/>][^>]*><\/[^>]+>/gi, '');
					
					html = $.trim(html);
					
					return html === '';
				},
				isElement: function (obj) {
					try {
						// Using W3 DOM2 (works for FF, Opera and Chrome)
						return obj instanceof HTMLElement;
					}
					catch (e) {
						return (typeof obj === 'object') && (obj.nodeType === 1) && (typeof obj.style === 'object') && (typeof obj.ownerDocument === 'object');
					}
				},
				strpos: function (haystack, needle, offset) {
					var i = haystack.indexOf(needle, offset);
					return i >= 0 ? i : false;
				},
				dataURItoBlob: function (dataURI) {
					var byteString;
					if (dataURI.split(',')[0].indexOf('base64') >= 0) {
						byteString = atob(dataURI.split(',')[1]);
					}
					else {
						byteString = unescape(dataURI.split(',')[1]);
					}
					
					var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
					
					var ia = new Uint8Array(byteString.length);
					for (var i = 0; i < byteString.length; i++) {
						ia[i] = byteString.charCodeAt(i);
					}
					
					return new Blob([ia], {type: mimeString});
				},
				getOuterHtml: function (el) {
					return $('<div>').append($(el).eq(0).clone()).html();
				},
				cloneAttributes: function (from, to) {
					from = from[0] || from;
					to = $(to);
					
					var attrs = from.attributes;
					var len = attrs.length;
					while (len--) {
						var attr = attrs[len];
						to.attr(attr.name, attr.value);
					}
					
					return to;
				},
				breakBlockTag: function () {
					var block = this.selection.block();
					if (!block) {
						return false;
					}
					
					var isEmpty = this.utils.isEmpty(block.innerHTML);
					
					var tag = block.tagName.toLowerCase();
					if (tag === 'pre' || tag === 'li' || tag === 'td' || tag === 'th') {
						return false;
					}
					
					if (!isEmpty && this.utils.isStartOfElement(block)) {
						return {
							$block: $(block),
							$next: $(block).next(),
							type: 'start'
						};
					}
					else if (!isEmpty && this.utils.isEndOfElement(block)) {
						return {
							$block: $(block),
							$next: $(block).next(),
							type: 'end'
						};
					}
					else {
						var endOfNode = this.selection.extractEndOfNode(block);
						var $nextPart = $('<' + tag + ' />').append(endOfNode);
						
						$nextPart = this.utils.cloneAttributes(block, $nextPart);
						$(block).after($nextPart);
						
						return {
							$block: $(block),
							$next: $nextPart,
							type: 'break'
						};
					}
				}, // tag detection
				inBlocks: function (tags) {
					tags = ($.isArray(tags)) ? tags : [tags];
					
					var blocks = this.selection.blocks();
					var len = blocks.length;
					var contains = false;
					for (var i = 0; i < len; i++) {
						if (blocks[i] !== false) {
							var tag = blocks[i].tagName.toLowerCase();
							
							if ($.inArray(tag, tags) !== -1) {
								contains = true;
							}
						}
					}
					
					return contains;
					
				},
				inInlines: function (tags) {
					tags = ($.isArray(tags)) ? tags : [tags];
					
					var inlines = this.selection.inlines();
					var len = inlines.length;
					var contains = false;
					for (var i = 0; i < len; i++) {
						var tag = inlines[i].tagName.toLowerCase();
						
						if ($.inArray(tag, tags) !== -1) {
							contains = true;
						}
					}
					
					return contains;
					
				},
				isTag: function (current, tag) {
					var element = $(current).closest(tag, this.core.editor()[0]);
					if (element.length === 1) {
						return element[0];
					}
					
					return false;
				},
				isBlock: function (block) {
					if (block === null) {
						return false;
					}
					
					block = block[0] || block;
					
					return block && this.utils.isBlockTag(block.tagName);
				},
				isBlockTag: function (tag) {
					return (typeof tag === 'undefined') ? false : this.reIsBlock.test(tag);
				},
				isInline: function (inline) {
					inline = inline[0] || inline;
					
					return inline && this.utils.isInlineTag(inline.tagName);
				},
				isInlineTag: function (tag) {
					return (typeof tag === 'undefined') ? false : this.reIsInline.test(tag);
				}, // parents detection
				isRedactorParent: function (el) {
					if (!el) {
						return false;
					}
					
					if ($(el).parents('.redactor-in').length === 0 || $(el).hasClass('redactor-in')) {
						return false;
					}
					
					return el;
				},
				isCurrentOrParentHeader: function () {
					return this.utils.isCurrentOrParent(['H1', 'H2', 'H3', 'H4', 'H5', 'H6']);
				},
				isCurrentOrParent: function (tagName) {
					var parent = this.selection.parent();
					var current = this.selection.current();
					
					if ($.isArray(tagName)) {
						var matched = 0;
						$.each(tagName, $.proxy(function (i, s) {
							if (this.utils.isCurrentOrParentOne(current, parent, s)) {
								matched++;
							}
						}, this));
						
						return (matched === 0) ? false : true;
					}
					else {
						return this.utils.isCurrentOrParentOne(current, parent, tagName);
					}
				},
				isCurrentOrParentOne: function (current, parent, tagName) {
					tagName = tagName.toUpperCase();
					
					return parent && parent.tagName === tagName ? parent : current && current.tagName === tagName ? current : false;
				},
				isEditorRelative: function () {
					var position = this.core.editor().css('position');
					var arr = ['absolute', 'fixed', 'relative'];
					
					return ($.inArray(arr, position) !== -1);
				},
				setEditorRelative: function () {
					this.core.editor().addClass('redactor-relative');
				}, // scroll
				getScrollTarget: function () {
					var $scrollTarget = $(this.opts.scrollTarget);
					
					return ($scrollTarget.length !== 0) ? $scrollTarget : $(document);
				},
				freezeScroll: function () {
					this.freezeScrollTop = this.utils.getScrollTarget().scrollTop();
					this.utils.getScrollTarget().scrollTop(this.freezeScrollTop);
				},
				unfreezeScroll: function () {
					if (typeof this.freezeScrollTop === 'undefined') {
						return;
					}
					
					this.utils.getScrollTarget().scrollTop(this.freezeScrollTop);
				},
				saveScroll: function () {
					this.tmpScrollTop = this.utils.getScrollTarget().scrollTop();
				},
				restoreScroll: function () {
					if (typeof this.tmpScrollTop === 'undefined') {
						return;
					}
					
					this.utils.getScrollTarget().scrollTop(this.tmpScrollTop);
				},
				isStartOfElement: function (element) {
					if (typeof element === 'undefined') {
						element = this.selection.block();
						if (!element) {
							return false;
						}
					}
					
					return (this.offset.get(element) === 0) ? true : false;
				},
				isEndOfElement: function (element) {
					if (typeof element === 'undefined') {
						element = this.selection.block();
						if (!element) {
							return false;
						}
					}
					
					var text = $.trim($(element).text()).replace(/[\t\n\r\n]/g, '').replace(/\u200B/g,
						''
					);
					var offset = this.offset.get(element);
					
					return (offset === text.length) ? true : false;
				},
				removeEmptyAttr: function (el, attr) {
					var $el = $(el);
					if (typeof $el.attr(attr) === 'undefined') {
						return true;
					}
					
					if ($el.attr(attr) === '') {
						$el.removeAttr(attr);
						return true;
					}
					
					return false;
				},
				replaceToTag: function (node, tag) {
					var replacement;
					$(node).replaceWith(function () {
						replacement = $('<' + tag + ' />').append($(this).contents());
						
						for (var i = 0; i < this.attributes.length; i++) {
							replacement.attr(this.attributes[i].name,
								this.attributes[i].value
							);
						}
						
						return replacement;
					});
					
					return replacement;
				}, // select all
				isSelectAll: function () {
					return this.selectAll;
				},
				enableSelectAll: function () {
					this.selectAll = true;
				},
				disableSelectAll: function () {
					this.selectAll = false;
				},
				disableBodyScroll: function () {},
				measureScrollbar: function () {
					var $body = $('body');
					var scrollDiv = document.createElement('div');
					scrollDiv.className = 'redactor-scrollbar-measure';
					
					$body.append(scrollDiv);
					var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
					$body[0].removeChild(scrollDiv);
					return scrollbarWidth;
				},
				enableBodyScroll: function () {},
				appendFields: function (appendFields, data) {
					if (!appendFields) {
						return data;
					}
					else if (typeof appendFields === 'object') {
						$.each(appendFields, function (k, v) {
							if (v !== null && v.toString().indexOf('#') === 0) {
								v = $(v).val();
							}
							
							data.append(k, v);
							
						});
						
						return data;
					}
					
					var $fields = $(appendFields);
					if ($fields.length === 0) {
						return data;
					}
					else {
						var str = '';
						$fields.each(function () {
							data.append($(this).attr('name'), $(this).val());
						});
						
						return data;
					}
				},
				appendForms: function (appendForms, data) {
					if (!appendForms) {
						return data;
					}
					
					var $forms = $(appendForms);
					if ($forms.length === 0) {
						return data;
					}
					else {
						var formData = $forms.serializeArray();
						
						$.each(formData, function (z, f) {
							data.append(f.name, f.value);
						});
						
						return data;
					}
				},
				isRgb: function (str) {
					return (str.search(/^rgb/i) === 0);
				},
				rgb2hex: function (rgb) {
					rgb = rgb.match(
						/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
					
					return (rgb && rgb.length === 4) ? '#' + ('0' + parseInt(rgb[1],
						10
					).toString(16)).slice(-2) + ('0' + parseInt(rgb[2],
						10
					).toString(16)).slice(-2) + ('0' + parseInt(rgb[3],
						10
					).toString(16)).slice(-2) : '';
				},
				
				// #backward
				isCollapsed: function () {
					return this.selection.isCollapsed();
				},
				isMobile: function () {
					return this.detect.isMobile();
				},
				isDesktop: function () {
					return this.detect.isDesktop();
				},
				isPad: function () {
					return this.detect.isIpad();
				}
				
			};
		},
		
		// #backward
		browser: function () {
			return {
				webkit: function () {
					return this.detect.isWebkit();
				},
				ff: function () {
					return this.detect.isFirefox();
				},
				ie: function () {
					return this.detect.isIe();
				}
			};
		}
	};
	
	$(window).on('load.tools.redactor', function () {
		$('[data-tools="redactor"]').redactor();
	});
	
	// constructor
	Redactor.prototype.init.prototype = Redactor.prototype;
	
})(jQuery);

(function ($) {
	$.fn.redactorAnimation = function (animation, options, callback) {
		return this.each(function () {
			new redactorAnimation(this, animation, options, callback);
		});
	};
	
	function redactorAnimation(element, animation, options, callback) {
		// default
		var opts = {
			duration: 0.5,
			iterate: 1,
			delay: 0,
			prefix: 'redactor-',
			timing: 'linear'
		};
		
		this.animation = animation;
		this.slide = (this.animation === 'slideDown' || this.animation === 'slideUp');
		this.$element = $(element);
		this.prefixes = ['', '-moz-', '-o-animation-', '-webkit-'];
		this.queue = [];
		
		// options or callback
		if (typeof options === 'function') {
			callback = options;
			this.opts = opts;
		}
		else {
			this.opts = $.extend(opts, options);
		}
		
		// slide
		if (this.slide) {
			this.$element.height(this.$element.height());
		}
		
		// init
		this.init(callback);
		
	}
	
	redactorAnimation.prototype = {
		
		init: function (callback) {
			this.queue.push(this.animation);
			
			this.clean();
			
			if (this.animation === 'show') {
				this.opts.timing = 'linear';
				this.$element.removeClass('hide').show();
				
				if (typeof callback === 'function') {
					callback(this);
				}
			}
			else if (this.animation === 'hide') {
				this.opts.timing = 'linear';
				this.$element.hide();
				
				if (typeof callback === 'function') {
					callback(this);
				}
			}
			else {
				this.animate(callback);
			}
			
		},
		animate: function (callback) {
			this.$element.addClass('redactor-animated').css('display', '').removeClass('hide');
			this.$element.addClass(this.opts.prefix + this.queue[0]);
			
			this.set(this.opts.duration + 's', this.opts.delay + 's', this.opts.iterate, this.opts.timing);
			
			var _callback = (this.queue.length > 1) ? null : callback;
			this.complete('AnimationEnd', $.proxy(function () {
				if (this.$element.hasClass(this.opts.prefix + this.queue[0])) {
					this.clean();
					this.queue.shift();
					
					if (this.queue.length) {
						this.animate(callback);
					}
				}
				
			}, this), _callback);
		},
		set: function (duration, delay, iterate, timing) {
			var len = this.prefixes.length;
			
			while (len--) {
				this.$element.css(this.prefixes[len] + 'animation-duration', duration);
				this.$element.css(this.prefixes[len] + 'animation-delay', delay);
				this.$element.css(this.prefixes[len] + 'animation-iteration-count', iterate);
				this.$element.css(this.prefixes[len] + 'animation-timing-function', timing);
			}
			
		},
		clean: function () {
			this.$element.removeClass('redactor-animated');
			this.$element.removeClass(this.opts.prefix + this.queue[0]);
			
			this.set('', '', '', '');
			
		},
		complete: function (type, make, callback) {
			this.$element.one(type.toLowerCase() + ' webkit' + type + ' o' + type + ' MS' + type,
				$.proxy(function () {
					if (typeof make === 'function') {
						make();
					}
					
					if (typeof callback === 'function') {
						callback(this);
					}
					
					// hide
					var effects = [
						'fadeOut',
						'slideUp',
						'zoomOut',
						'slideOutUp',
						'slideOutRight',
						'slideOutLeft'
					];
					if ($.inArray(this.animation, effects) !== -1) {
						this.$element.css('display', 'none');
					}
					
					// slide
					if (this.slide) {
						this.$element.css('height', '');
					}
					
				}, this)
			);
			
		}
	};
})(jQuery);
