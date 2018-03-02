xepan_cms_tinymce_options={
		inline:true,
		menubar: false,
		forced_root_block: 'p',
		plugins: ["advlist autolink link image lists charmap print preview hr anchor pagebreak spellchecker",
                "searchreplace wordcount visualblocks visualchars code fullscreen insertdatetime media nonbreaking",
                "save table contextmenu directionality emoticons template paste textcolor colorpicker imagetools"],
		toolbar1: "undo redo code | styleselect | bold italic underline strikethrough fontselect fontsizeselect ",
		toolbar2: "alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image table  hr | forecolor backcolor ",                
		importcss_append: true,
		verify_html: true,
		theme_url: 'vendor/tinymce/tinymce/themes/modern/theme.min.js',
		theme: 'modern',
		setup: function(editor) {
        	editor.on("init", function(){
            	editor.addShortcut("ctrl+u", "", "");
        	});
    	}
	};

toolbar_initialized = false;

jQuery.widget("ui.xepanComponent",{
	self: undefined,
	options:{
		editing_template:0,
		component_selector:null,
		editor_id: null
	},
	opts: {
        namespace: 'xepan-',
        borderWidth: 2,
        onClick: false,
        filter: false
    },
    keyCodes: {
        BACKSPACE: 8,
        ESC: 27,
        DELETE: 46
    },
    active: false,
    elements: {},
    pub:{},

	_create: function(){
		var self=this;

		self.initStylesheet();

		if($(this.element).closest('.xepan-toolbar').length !=0) return;
		if(!$(this.element).attr('id')) $(this.element).attr('id',generateUUID());

		self.options.option_panel = $('.xepan-tool-options[for-xepan-component="'+($(this.element).attr('xepan-component'))+'"]');

		if($(this.element).hasClass('xepan-sortable-component')){
			$(this.element).xepanComponent('createSortable');
		}

		$(this.element).find('.xepan-sortable-component').sortable(this.sortable_options);

		// now moved in xepanEditor JS as seperate function setupEditableText
		// if($(this.element).hasClass('xepan-editable-text')){
		// 	$(this.element).xepanComponent('createTextEditable');
		// }
		
		var enable_hover = true;

		if($(this.element).is('body')){
			enable_hover = false;
		}else if($(this.element).hasClass('xepan-page-wrapper') && !this.options.editing_template ){
			enable_hover = false;
		}

		// if(enable_hover){
		// 	$(this.element).hover(
		// 		function(event,ui){
		// 			$('.xepan-component-hover-selector').removeClass('xepan-component-hover-selector');
		// 			$('.xepan-component-hoverbar').remove();

		// 			if($(self.element).hasClass('xepan-no-move') && $(self.element).hasClass('xepan-no-delete') ) return;

		// 			$(this).addClass('xepan-component-hover-selector');
		// 			var hoverbar = $('<div class="xepan-component-hoverbar">').appendTo($(this));				
		// 			if(!$(self.element).hasClass('xepan-no-move')){
		// 				var	drag_btn =  $('<div class="xepan-component-drag-handler"><i class="glyphicon glyphicon-move"></i></div>').appendTo(hoverbar);
		// 			}

		// 			if(!$(self.element).hasClass('xepan-no-delete')){
		// 				var remove_btn = $('<div class="xepan-component-remove"><i class="glyphicon glyphicon-trash"></i></div>').appendTo(hoverbar);

		// 				$(remove_btn).click(function(){
		// 				var comp_temp = $(this).closest('.xepan-component');
		// 				var t_name = $(comp_temp).attr('xepan-component');
		// 				if(t_name == undefined || t_name == "" || t_name == null)
		// 					t_name = "Generic";
		// 				else
		// 					t_name = t_name.replace(/\\/g, "");

		// 				$('<div></div>')
		// 					.appendTo('body')
		// 					.html('<div>Are you sure to remove '+ t_name+' ?</div>')
		// 					.dialog({
		// 						modal: true, 
		// 						title: 'Remove', 
		// 						autoOpen: true,
		// 						resizable: false,
		// 						dialogClass:'xepan-component-remove-confirm',
		// 						buttons: {
		// 					    	Yes: function () {
		// 								$(comp_temp).xepanComponent('remove');
		// 					            $(this).dialog("close");
		// 					          },
		// 					        No: function () {
		// 					            $(this).dialog("close");
		// 					          }
		// 					      },
		// 					      close: function (event, ui) {
		// 					          $(this).remove();
		// 					      }
		// 					});
		// 				});
		// 			}
		// 		event.stopPropagation();
		// 	},

		// 		function(event,ui){
		// 			$('.xepan-component-hover-selector').removeClass('xepan-component-hover-selector');
		// 			$('.xepan-component-hoverbar').remove();
		// 			event.stopPropagation();
		// 		}
		// 	);

		// }else{
		// 	$(this.element).css('min-height','200px');
		// }

		$(this.element).dblclick(function(event,ui){
				$(self.options.component_selector).each(function(index, el) {
					// $('.xepan-selected-component').removeClass('xepan-selected-component');
					try{
						$(el).xepanComponent('deselect');	
					}catch(e){
						console.log('This looks like wrong xepanComponent in wrong position, class is not making it component');
						console.log($(this));
						console.trace();
						// throw e;
					}
				});
			$(this).xepanComponent('select');
			event.preventDefault();event.stopPropagation();
		});

		// $(this.element).find('.xepan-component').xepanComponent(self.options);
	},

	select: function (){
		current_selected_component = this.element;
		// $(this.element).addClass('xepan-selected-component');
		$('.xepan-tool-options').hide();
		this.options.option_panel.show();
		$('#'+this.options.option_panel.attr('id')).trigger('show');
		$('#xepan-basic-css-panel').trigger('show');

		$(this.options.option_panel).closest('.xepan-tool-options').show();
		$('#xepan-cms-toolbar-right-side-panel').addClass('toggleSideBar');

		updateBreadCrumb();
		// console.log($(this.options.option_panel).closest('.xepan-tool-options'));
		// console.log('Switched to ' + $(current_selected_component).attr('xepan-component'));
		this.showComponentToolBar();

		if($(current_selected_component).attr('xepan-component-dynamic-option-list') == undefined){
			this.manageDynamicOptions($(current_selected_component));
		}else{
			this.manageDynamicOptionsList();
		}

	},

	createSortable: function(){
		$(this.element).sortable(this.sortable_options);
	},

	createTextEditable: function(){
		self=this;
		if(!$(this.element).hasClass('xepan-editable-text')) return;
		$(this.element).attr('contenteditable','true');
		if($(this.element).hasClass('xepan-no-richtext')) return;
		$.univ().richtext(self.element,xepan_cms_tinymce_options,true);
	},

	getOptions:function(){
		self = this;
        return self.options;
    },

	deselect: function (){
		this.hideComponentToolBar();
		this.manageDynamicOptionsList();
		if(typeof current_selected_component !== 'undefined' && this.element == current_selected_component){
			$(xepan_editor_element).xepanEditor('hideOptions');
		}

		current_selected_component=$('body');

		$(this.element).removeClass('xepan-selected-component');
		updateBreadCrumb();
	},

	remove:function(){
		// Remove tinymce from tool if applied
		if($(this.element).hasClass('xepan-editable-text')){
			$('.mce-tinymce.mce-panel').hide();
			tinymce.remove($(this.element).attr('id'));
		}
		$(this.element).remove();
		if(typeof current_selected_component !== 'undefined' && this.element == current_selected_component){
			$('#'+this.options.editor_id).xepanEditor('hideOptions');
		}

		// hide options panel
		if($('#xepan-cms-toolbar-right-side-panel').hasClass('toggleSideBar')){
			$('#xepan-cms-toolbar-right-side-panel').removeClass('toggleSideBar');
		}
	},

	manageDynamicOptionsList: function(){
		var self = this;

		$option_panel = $('#xepan-basic-css-panel.epan-css-options');
		$option_panel.find('.xepan-component-dynamic-option').remove();
		
		lister_selector = $(current_selected_component).attr('xepan-component-dynamic-option-list');
		var list_count = 1;		
		$(current_selected_component).find(lister_selector).each(function(index) {
			self.manageDynamicOptions($(this)[0],"Dynamic Option "+list_count);
			list_count += 1;
		});
	},

	manageDynamicOptions: function(dynamic_option_for_component,dynamic_option_name){
		// clear dynamic option area from option panel
		// look for xepan-dynamic-option-* inside selected component but not in nested xepan-component
		// create dynamic options with events on change
			// events populate desired values as said in dynamic option

		// what can be asked for
			// for selector inside current selected component :: attribute value, style, class, internal text
		// format to ask for in component
		/* 	<div class='xepan-comonent' 
				xepan-dynamic-option-1=".mysubclass|Your Sales This Month|text"
				xepan-dynamic-option-2=".readmorebtn|Button Text|href"
				xepan-dynamic-option-3=".readmorebtn|Target|target|Self,New Window"
				xepan-dynamic-option-4=".color-class|What Color you like|style|color"
				xepan-dynamic-option-5="this|Background Image|style|background"
				xepan-dynamic-option-6=".my-sub-icon|Icon|class|fa-*,glyphicon-*" // classes to remove in last before applying new class
				xepan-dynamic-option-n="this/inner component class/id|TEXT TO ASK|attribute/style/class|related information,which style"
			> ... </div>
		*/

		// temporary removed

		if(!$(dynamic_option_for_component).length)
			dynamic_option_for_component = current_selected_component;

		// find all dynamic options first
		var matched = [];
		var find_str = "xepan-dynamic-option-";
		$(dynamic_option_for_component).each(function(index) {
			var elem = this;
			$.each(this.attributes, function( index, attr ) {
				if(attr.name.indexOf(find_str)===0){
					matched.push(attr.value);
				}
			});
		});

        if(!matched.length) return;

        if(dynamic_option_name == undefined){
        	var dynamic_option_name = "Dynamic Option";
        	
        	// removing previous added dynamic option
        	$option_panel = $('#xepan-basic-css-panel.epan-css-options');
			$option_panel.find('.xepan-component-dynamic-option').remove();
        }

        var unique_id = generateUUID();
		var dynamic_section = '<div class="xepan-cms-group-panel xepan-component-dynamic-option clearfix xepan-cms-tool">'+
								'<div data-toggle="collapse" data-target="#'+unique_id+'" aria-expanded="false" class="xepan-cms-toolbar-heading">'+
									'<span>'+dynamic_option_name+'</span>'+
									'<i class="fa fa-chevron-down pull-right"></i>'+
								'</div>'+
								'<div id="'+unique_id+'" class="xepan-cms-tools-bar-panel row-fluid in" style="height: auto;">'+
									'<div class="xepan-toolbar-panel-body xepan-collasp-body">'
							;

		$.each(matched, function(index, el) {
			option_array = el.split('|');
			var dyn_selector = option_array[0];
			var name = option_array[1];
			var where_to_set = $.trim(option_array[2]);
			var dropdown_options = "";
			if(option_array[3] != undefined)
				dropdown_options = $.trim(option_array[3]);

			var old_value = "";

			if(dyn_selector == "this"){
				$targets = $(dynamic_option_for_component);
			}else
				$targets = $(dynamic_option_for_component).find(dyn_selector);

			
			switch(where_to_set){
				case 'href':
					old_value = $targets.attr('href');
				break;
				case 'text':
					old_value = $targets.html();
				break;
				case 'css':
					old_value = $targets.attr('class');
				break;
				case 'src':
					old_value = $targets.attr('src');
				break;
				case 'attr':
					old_value = $targets.attr(dropdown_options);
				break;
			}

			if(where_to_set == "text"){
				dynamic_section	+= '<label>'+name+'</label>' +' <textarea class="xepan-dynamic-component-value" dynamic-selector="'+el+'" >'+old_value+'</textarea>';

			}else if(where_to_set == "src"){
				dynamic_section += '<div class="dynamic-img-wrapper"><label>'+name+'</label><input id="xepan-dynamic-image-option-src" type="text" disabled="true" value="'+old_value+'"/><div class="btn btn-group btn-group-xs"><button dynamic-selector="'+el+'" type="button" class="btn btn-primary btn-xs xepan-dynamic-image-option-select">Select</button></div></div>';

			}else if(where_to_set == "css"){
				if(dropdown_options.length != 0){
					class_array = dropdown_options.split(',');
					var select_dropdown = '<select data-list="'+dropdown_options+'" dynamic-selector="'+el+'" value="'+old_value+'" class="xepan-dynamic-component-value"><option value="" >Select</option>';
					$.each(class_array, function(key, value){
						select_dropdown += '<option value="'+ value +'">'+ value +'</option>';
					});
					select_dropdown += '</select>';
					dynamic_section += '<div><label>'+name+'</label>'+select_dropdown+'</div>';
				}else
					dynamic_section += '<label>'+name+'</label>' +' <input class="xepan-dynamic-component-value" dynamic-selector="'+el+'" value="'+old_value+'" />';

			}else if(where_to_set == "label"){
				dynamic_section	+= '<label>'+name+'</label>';
			}else{
				dynamic_section	+= '<label>'+name+'</label>' +' <input class="xepan-dynamic-component-value" dynamic-selector="'+el+'" value="'+old_value+'" />';
			}

		});
		dynamic_section += '</div></div></div>';

		// $('#xepan-basic-css-panel.epan-css-options > hr ').after(dynamic_section);

		var list_options_object = $(dynamic_section).insertAfter('#xepan-basic-css-panel.epan-css-options > hr');
		// $(dynamic_section).prependTo($('#xepan-basic-css-panel.epan-css-options'));

		// implement dynamic function change event
		$(list_options_object).find('.xepan-dynamic-component-value').change(function(event) {
			var dyn_option = $(this).attr('dynamic-selector');
			var value_list = $(this).attr('data-list');
			var option_array = dyn_option.split('|');
			var dyn_selector = option_array[0];
			var where_to_set = $.trim(option_array[2]);
			var new_value = $(this).val();
			var dropdown_options = '';
			if(option_array[3] != undefined)
				dropdown_options = $.trim(option_array[3]);

			if(dyn_selector == "this"){
				$targets = $(dynamic_option_for_component);
			}else
				$targets = $(dynamic_option_for_component).find(dyn_selector);

			switch(where_to_set){
				case 'href':
					$targets.attr('href',new_value);
				break;
				case 'text':
					$targets.html(new_value);
				break;
				case 'css':
					if(value_list.length != 0){
						old_values = $targets.attr('class');
						old_class = old_values.split(" ");
						value_list = value_list.split(" ");
						value_list = value_list.toString();
						value_list = value_list.split(',');

						$.each(old_class, function(key, value){
							if($.inArray(value, value_list) == -1)
								new_value += " "+value;
						});
					}

					$targets.attr('class',new_value);
				break;
				case 'image':
					$targets.attr('src',new_value);
				break;
				case 'attr':
					$targets.attr(dropdown_options,new_value);
				break;


			}
		});

		// image option select button
		$('.xepan-dynamic-image-option-select').click(function(event) {
			var dyn_option = $(this).attr('dynamic-selector');
			var option_array = dyn_option.split('|');
			var dyn_selector = option_array[0];

			var fm = $('<div/>').dialogelfinder({
			url : '?page=xepan_base_elconnector',
			lang : 'en',
			width : 840,
			destroyOnClose : true,
			getFileCallback : function(files, fm){
				// console.log(files.url);
				$(this).closest('.dynamic-img-wrapper').find('input').val(files.url);
				$(dynamic_option_for_component).find(dyn_selector).attr('src',files.url);
			},
				commandsOptions : {	
					getfile : {
					oncomplete : 'close',
					folders : true
					}
				}
			}).dialogelfinder('instance');
		});
	},

	sortable_options: {
		appendTo:'body',
		connectWith:'.xepan-sortable-component',
		handle: '.xepan-component-drag-handler',
		cursor: "move",
		revert: true,
		tolerance: "pointer",
		activate: function(event,ui){
			$(this).addClass('xepan-droppable-highlight');
		},
		deactivate:function(event,ui){
			$(this).removeClass('xepan-droppable-highlight');
		},

		helper: function(event, ui) {
			var t_name = $(ui).closest('.xepan-component').attr('xepan-component');
			var tool_drag_html = '<div class="xepan-cms-component-dragging">Dragging ...</div>';

			if(t_name == undefined || t_name == "undefined" || t_name == null){
				t_name = "Generic";
			}else{
				t_name = t_name.replace(/\//g, "");
				tool_drag_html = $('.xepan-cms-tool[data-toolname="'+t_name+'"]').prop('outerHTML');
			}
	        return $(tool_drag_html);
	    },
	    start: function(event, ui) {
	    	$(ui.placeholder).removeClass("col-md-6 col-sm-6 xepan-tool-bar-tool ui-draggable").css('visibility','visible');
	    	$('.xepan-sortable-component').addClass('xepan-sortable-highlight-droppable');
	    	$(current_selected_component).xepanComponent('hideComponentToolBar');
	        // if ($(ui.item).hasClass('ui-sortable')) {
         //    	sortable_disabled = true;
         //    	$(ui.item).sortable("option", "disabled", true);
         //    	$(ui.item).find('.epan-sortable-component').sortable("option", "disabled", true);
        	// }
	    },
	    sort: function(event, ui) {
	        // $(ui.placeholder).html('Drop in ' + $(ui.placeholder).parent().attr('xepan-component') + ' ??');
	        var component_name = $(ui.placeholder).parent().attr('xepan-component');
	        
	        if(typeof component_name === 'undefined') component_name = $(ui.placeholder).parent().attr('xepan-component-name');

	        $(ui.placeholder).html('<div class="xepan-cms-droppable-placeholder"> Drop in ' + component_name + ' ??'+'</div>');
	    },
	    stop: function(event, ui) {
	    	$('.xepan-sortable-component').removeClass('xepan-sortable-highlight-droppable');
	    	if(typeof origin == 'undefined' || origin == 'toolbox'){
	    		// Find sub components if any and make components
	    		$new_component = $(xepan_drop_component_html).xepanComponent();
				$($new_component).find('.xepan-component').xepanComponent();
				$($new_component).attr('id',generateUUID());
				window.setTimeout(function(){
					if($($new_component).hasClass('xepan-editable-text') && !$($new_component).hasClass('xepan-no-richtext'))
						$.univ().richtext($new_component,xepan_cms_tinymce_options,true);
				},400);

		    	if($('#epan-component-border:checked').size() > 0){
			        $new_component.addClass('component-outline');
			        $new_component.find('.xepan-component').addClass('component-outline');
		    	}

		    	$new_component.find('a, .btn').click(function(ev){ ev.preventDefault();});
				$new_component.find('i.xepan-cms-icon').removeAttr('onclick');

			    if($('#epan-component-extra-padding:checked').size() > 0){
			        if($new_component.hasClass('xepan-sortable-component')) 
			        	$new_component.addClass('xepan-sortable-extra-padding');
			        $new_component.find('.xepan-sortable-component').addClass('xepan-sortable-extra-padding');
			    }
			    
		    	$(ui.item).replaceWith($new_component);
		    	$(ui.item).xepanComponent('select');
	    	}
	    	// console.log(origin);
		    origin='page';
	    }
	},

	getComponentSelector: function(){
		var self =  this;
		return self.options.component_selector;
	},

    // ====== tool bar creation start =====
	createOutlineElements: function() {
		var self = this;
        self.elements.label = jQuery('<div></div>').addClass(self.opts.namespace + '_label').appendTo('body');
        self.elements.top = jQuery('<div></div>').addClass(self.opts.namespace).appendTo('body');
        self.elements.bottom = jQuery('<div></div>').addClass(self.opts.namespace).appendTo('body');
        self.elements.left = jQuery('<div></div>').addClass(self.opts.namespace).appendTo('body');
        self.elements.right = jQuery('<div></div>').addClass(self.opts.namespace).appendTo('body');
    },

    removeOutlineElements: function () {
    	var self = this;
        jQuery.each(self.elements, function(name, element) {
            element.remove();
        });
    },

    compileLabelText: function(element, width, height) {
        var label = element.tagName.toLowerCase();
        if (element.id) {
            label += '#' + element.id;
        }
        if (element.className) {
            label += ('.' + jQuery.trim(element.className).replace(/ /g, '.')).replace(/\.\.+/g, '.');
        }
        return label + ' (' + Math.round(width) + 'x' + Math.round(height) + ')';
    },

    getScrollTop: function() {
    	var self = this;
        if (!self.elements.window) {
            self.elements.window = jQuery(window);
        }
        return self.elements.window.scrollTop();
    },

    updateOutlinePosition: function(e) {
    	var self = this;
    	var pub =self.pub;
        pub.element = e;

        var b = self.opts.borderWidth;
        var scroll_top = self.getScrollTop();
        var pos = pub.element.getBoundingClientRect();
        var top = pos.top + scroll_top;

        var label_text = self.compileLabelText(pub.element, pos.width, pos.height);
        var label_top = Math.max(0, top - 20 - b, scroll_top);
        var label_left = Math.max(0, pos.left - b);

        self.elements.label.css({ top: label_top, left: label_left }).text(label_text);
        self.elements.top.css({ top: Math.max(0, top - b), left: pos.left - b, width: pos.width + b, height: b });
        self.elements.bottom.css({ top: top + pos.height, left: pos.left - b, width: pos.width + b, height: b });
        self.elements.left.css({ top: top - b, left: Math.max(0, pos.left - b), width: b, height: pos.height + b });
        self.elements.right.css({ top: top - b, left: pos.left + pos.width, width: b, height: pos.height + (b * 2) });
    },


    writeStylesheet: function(css) {
        var element = document.createElement('style');
        element.type = 'text/css';
        document.getElementsByTagName('head')[0].appendChild(element);

        if (element.styleSheet) {
            element.styleSheet.cssText = css; // IE
        } else {
            element.innerHTML = css; // Non-IE
        }
    },

    initStylesheet: function() {
    	var self = this;

        if (toolbar_initialized !== true) {
            var css = '' +
                '.' + self.opts.namespace + ' {' +
                '    background: #09c;' +
                '    position: absolute;' +
                '    z-index: 1000000;' +
                '}' +
                '.' + self.opts.namespace + '_label {' +
                '    background: #09c;' +
                '    border-radius: 2px;' +
                '    color: #fff;' +
                '    font: bold 12px/12px Helvetica, sans-serif;' +
                '    padding: 4px 6px;' +
                '    position: absolute;' +
                '    text-shadow: 0 1px 1px rgba(0, 0, 0, 0.25);' +
                '    z-index: 1000001;' +
                '}';

            self.writeStylesheet(css);
            toolbar_initialized = true;
        }
    },

	showComponentToolBar:function(){
		var self = this;

		$('.xepan-component-hover-selector').removeClass('xepan-component-hover-selector');
		$('.xepan-component-hoverbar').remove();
		if($(self.element).hasClass('xepan-no-move') && ($(self.element).hasClass('xepan-no-delete') || $(self.element).hasClass('xepan-no-remove')) ) return;

		self.createOutlineElements();
		self.updateOutlinePosition(current_selected_component[0]);
		var	drag_btn =  $('<div class="xepan-component-drag-handler"></div>').appendTo(current_selected_component);
		return;

		$(current_selected_component).addClass('xepan-component-hover-selector');
		var hoverbar = $('<div class="xepan-component-hoverbar">').appendTo($(current_selected_component));
		if(!$(current_selected_component).hasClass('xepan-no-move')){
			var	drag_btn =  $('<div class="xepan-component-drag-handler"><i class="glyphicon glyphicon-move"></i></div>').appendTo(hoverbar);
		}

		if(!$(current_selected_component).hasClass('xepan-no-delete')){
			var remove_btn = $('<div class="xepan-component-remove"><i class="glyphicon glyphicon-trash"></i></div>').appendTo(hoverbar);

			$(remove_btn).click(function(){
			var comp_temp = $(current_selected_component).closest('.xepan-component');
			var t_name = $(comp_temp).attr('xepan-component');
			if(t_name == undefined || t_name == "" || t_name == null)
				t_name = "Generic";
			else
				t_name = t_name.replace(/\\/g, "");

			$('<div></div>')
				.appendTo('body')
				.html('<div>Are you sure to remove '+ t_name+' ?</div>')
				.dialog({
					modal: true, 
					title: 'Remove', 
					autoOpen: true,
					resizable: false,
					dialogClass:'xepan-component-remove-confirm',
					buttons: {
				    	Yes: function () {
							$(comp_temp).xepanComponent('remove');
				            $(this).dialog("close");
				          },
				        No: function () {
				            $(this).dialog("close");
				          }
				      },
				      close: function (event, ui) {
				          $(this).remove();
				      }
				});
			});
		}
	},

	hideComponentToolBar:function(){
		var self = this;
		self.removeOutlineElements();
		$(current_selected_component).find('.xepan-component-drag-handler').remove();
		// $('.xepan-component-hover-selector').removeClass('xepan-component-hover-selector');
		// $('.xepan-component-hoverbar').remove();
	}
	
});

function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
    });
    return 'xepan-'+uuid;
}

function updateBreadCrumb() {
    $('#xepan-editing-toolbar-breadcrumb').html('');

    if (typeof current_selected_component === 'undefined') return;

    $(current_selected_component)
        .parents('.xepan-component')
        .andSelf()
    	// .reverse()
	    .each(function(index, el) {
	        var self = el;
	        var current_selected = $(el).attr('xepan-component');

			if (!current_selected) { 
				current_selected = "Root"; 
			}
	        
	        var breadCrumbcomponent = current_selected.substring(current_selected.indexOf("_") + 1);
	        new_btn = $('<div class=\'glyphicon glyphicon-forward pull-left\' style=\'margin:0 5px;\'></div>' + '<div class=\' xepan-breadcrumb-component pull-left \'>' + breadCrumbcomponent + '</div>');
	        new_btn.click(function(event) {
	            if (self === current_selected_component) {
	                $(current_selected_component).effect("bounce", "slow");
	                return;
	            }
	            $(self).dblclick();
	        });
	        new_btn.appendTo('#xepan-editing-toolbar-breadcrumb');
	    });



};