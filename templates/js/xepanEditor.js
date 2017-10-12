current_selected_component = undefined;
origin = 'page';
xepan_drop_component_html= '';
xepan_editor_element = null;
xepan_component_selector = null;
xepan_component_layout_optioned_added = false;

jQuery.widget("ui.xepanEditor",{
	options:{
		base_url:undefined,
		file_path:undefined,
		template_file:undefined,
		template:undefined,
		save_url:undefined,
		template_editing:undefined,
		tools:{},
		basic_properties: undefined,
		component_selector: '.xepan-component',
	},

	topbar:{},
	leftbar:{},
	rightbar:{},

	_create: function(){
		var self = this;
		xepan_editor_element = self.element;
		xepan_component_selector = self.options.component_selector;
		
		if(self.options.template_editing){
			$('.xepan-page-wrapper').removeClass('xepan-sortable-component');
		}else{
			$('.xepan-page-wrapper').addClass('xepan-component');
			$('.xepan-page-wrapper').addClass('xepan-sortable-component');
		}

		self.setupEnvironment();
		self.setupTools();
		// self.setupToolbar();
		self.setUpShortCuts();
		// self.cleanup(); // Actually these are JUGAAD, that must be cleared later on
	},

	setupEnvironment: function(){
		var self = this;

		// throw self html out of body
		$(self.element).insertAfter('body');


		// right bar
		self.rightbar = $('<div id="xepan-cms-toolbar-right-side-panel" class="sidebar sidebar-right" style="right: -230px;" data-status="opened"></div>').insertAfter('body');
		// basic and selection tools
		self.generic_tool = $('<div class="xepan-cms-group-panel clearfix xepan-cms-tool"></div>').appendTo(self.rightbar);
		
		$('<div>Selection</div>').appendTo(self.generic_tool);
		self.selection_previous_sibling = $('<button id="epan-component-selection-previous-sibling" type="button" title="Previous Sibling" class="btn btn-default btn-xs"><i class="fa fa-arrow-left"></i></button>').appendTo(self.generic_tool);
		self.selection_next_sibling = $('<button id="epan-component-selection-next-sibling" type="button" title="Next Sibling" class="btn btn-default btn-xs"><i class="fa fa-arrow-right"></i></button>').appendTo(self.generic_tool);
		self.selection_parent = $('<button id="epan-component-selection-parent" type="button" title="Parent" class="btn btn-default btn-xs"><i class="fa fa-arrow-up"></i></button>').appendTo(self.generic_tool);
		self.selection_child = $('<button id="epan-component-selection-child" type="button" title="Child/Next" class="btn btn-default btn-xs"><i class="fa fa-arrow-down"></i></button>').appendTo(self.generic_tool);

		$(self.selection_previous_sibling).click(function(event){
			ctrlShiftLeftSelection(event);
		});

		$(self.selection_next_sibling).click(function(event){
			ctrlShiftRightSelection(event);
		});

		$(self.selection_parent).click(function(event) {
			ctrlShiftUpSelection(event);
		});

		$(self.selection_child).click(function(event){
			tabSelection(event);
		});

		$('<div>Move</div>').appendTo(self.generic_tool);
		self.move_left = $('<button id="epan-component-move-left" type="button" title="move left" class="btn btn-default"><i class="fa fa-arrow-left"></i></button>').appendTo(self.generic_tool);
		self.move_right = $('<button id="epan-component-move-right" type="button" title="move right" class="btn btn-default"><i class="fa fa-arrow-right"></i></button>').appendTo(self.generic_tool);
		$(self.move_left).click(function(event){
			componentMoveLeft(event);
		});

		$(self.move_right).click(function(event){
			componentMoveRight(event);
		});

		// duplicate
		self.duplicate_wrapper = $('<div class="epan-component-duplicate-wrapper"></div>').appendTo(self.generic_tool);
		self.duplicate_btn = $('<button id="epan-component-duplicate-child">Duplicate</button>').appendTo(self.duplicate_wrapper);
		$(self.duplicate_btn).click(function(event){
			duplicateComponent(event);
		});

		// right bar content
		$('<p class="xepan-cms-tool xepan-cms-tool-option-panel" style="font-size:16px;">OPTION PANEL</p>').appendTo(self.rightbar);
		
		self.rightbar_toggle_btn = $('<div class="toggler"><span class="fa fa-chevron-left fa-2x" style="display: block;">&nbsp;</span> <span class="fa fa-chevron-right fa-2x" style="display: none;">&nbsp;</span></div>').appendTo(self.rightbar);
		$(self.rightbar_toggle_btn).click(function(){
			$('#xepan-cms-toolbar-right-side-panel').toggleClass('toggleSideBar');
		});

		// disable all clicks
		$('body').find('a').click(function(){ return false});
		$('body').find('i.xepan-cms-icon').removeAttr('onclick');


		// left bar
		self.leftbar = $('<div id="xepan-cms-toolbar-left-side-panel" class="sidebar sidebar-left" style="left: -230px;" data-status="opened"></div>').insertAfter('body');
		// right bar content
		self.leftbar_toggle_btn = $('<div class="toggler"><span class="fa fa-chevron-right fa-2x" style="display: block;">&nbsp;</span> <span class="fa fa-chevron-left fa-2x" style="display: none;">&nbsp;</span></div>').appendTo(self.leftbar);
		$(self.leftbar_toggle_btn).click(function(){
			$('#xepan-cms-toolbar-left-side-panel').toggleClass('toggleSideBar');
		});
		
		// // top bar
		// self.topbar = $('<div id="xepan-cms-toolbar-top-side-panel" class="container sidebar sidebar-top toggleSideBar" style="top:-50px;" data-status="opened"></div>').insertAfter('body');
		// // top bar content
		// $('<h2>Top Bar</h2>').appendTo(self.topbar);
		// self.topbar_toggle_btn = $('<div class="toggler"><span class="glyphicon glyphicon-chevron-down" style="display: block;">&nbsp;</span> <span class="glyphicon glyphicon-chevron-up" style="display: none;">&nbsp;</span></div>').appendTo(self.topbar);
		// $(self.topbar_toggle_btn).click(function(){
		// 	$('#xepan-cms-toolbar-top-side-panel').toggleClass('toggleSideBar');
		// });
		
		self.editor_helper_wrapper = $('<div class="xepan-cms-editor-helper-wrraper">').appendTo(self.leftbar);
		// page and template management
		self.setUpPagesAndTemplates();
		// save and snapshot btn
		var save_tool_bar = $('<div class="btn-toolbar" role="toolbar">').appendTo(self.editor_helper_wrapper);
		var save_btn_group = $('<div class="btn-group">').appendTo(save_tool_bar);
		var snapshot_btn = $('<button id="save-as-snapshot" title="Save as Snapshot" type="button" class="btn btn-default btn-sm" ><span class="fa fa-camera-retro" aria-hidden="true"> Snapshot</span></button>').appendTo(save_btn_group);
		var save_btn = $('<button id="xepan-savepage-btn" title="Save Page" type="button" class="btn btn-success btn-sm"><span class="fa fa-floppy-o"></span> Save</button>').appendTo(save_btn_group);
		var logout_btn = $('<button id="xepan-logout-btn" title="Logout" type="button" class="btn btn-danger btn-sm"><span class="fa fa-power-off"></span></button>').appendTo(save_btn_group);
		
		var change_theme = $('<button id="xepan-change-template-theme" title="Change Theme" class="btn btn-warning">Change Theme</button>').appendTo(self.editor_helper_wrapper);

		$(change_theme).click(function(event) {
			$.univ().frameURL('Change Template','index.php?page=xepan_cms_theme&cut_page=1');
		});

		$(save_btn).click(function(){
			$(self.element).xepanEditor('savePage');
		});

		$(logout_btn).click(function(event) {
			window.location.href='?page=logout';
		});

		// show border and easy drop
		var easy_wrapper = $('<div class="input-group xepan-cms-easy-drop-wrapper">').appendTo(self.editor_helper_wrapper);
		var easy_drop = $('<span class="input-group-addon"> <input id="epan-component-extra-padding" aria-label="Checkbox for following text input" type="checkbox"><p>Easy Drop</p></span>').appendTo(easy_wrapper);
		var show_border = $('<span class="input-group-addon"> <input id="epan-component-border" aria-label="Checkbox for following text input" type="checkbox"><p>Show Border</p></span>').appendTo(easy_wrapper);

		/*Component Editing outline show border*/
		$("#epan-component-border").click(function(event) {
		    if($('#epan-component-border:checked').size() > 0){
		        $(xepan_component_selector).find('.xepan-component').addClass('component-outline');
		    }else{
		        $(xepan_component_selector).find('.xepan-component').removeClass('component-outline');
		    }
		});

		/*Drag & Drop Component to Another  Extra Padding top & Bottom*/
		$('#epan-component-extra-padding').click(function(event) {
		    if($('#epan-component-extra-padding:checked').size() > 0){
		        $(xepan_component_selector).find('.xepan-sortable-component').addClass('xepan-sortable-extra-padding');
		    }else{
		        $(xepan_component_selector).find('.xepan-sortable-component').removeClass('xepan-sortable-extra-padding');
		    }
		});

		// settings up tool buttons
		var responsive_tool_bar = $('<div class="btn-toolbar" role="toolbar">').appendTo(self.editor_helper_wrapper);
		var responsive_btn_group =	$('<div class="btn-group btn-group-sm">').appendTo(responsive_tool_bar);
		var $screen_reset_btn = $('<button id="epan-editor-preview-screen-reset" title="Reset to original Preview" type="button" class="btn btn-default"><span class="fa fa-undo" aria-hidden="true"></span></button>').appendTo(responsive_btn_group);
		var $screen_lg_btn = $('<button id="epan-editor-preview-screen-lg" title="Desktop Preview" type="button" class="btn btn-default"><span class="fa fa-desktop" aria-hidden="true"></span></button>').appendTo(responsive_btn_group);
		var $screen_md_btn = $('<button id="epan-editor-preview-screen-md" title="Laptop Preview" type="button" class="btn btn-default" ><span class="fa fa-laptop" aria-hidden="true"></span></button>').appendTo(responsive_btn_group);
		var $screen_sm_btn = $('<button id="epan-editor-preview-screen-sm" title="Tablet Preview" type="button" class="btn btn-default" ><span class="fa fa-tablet" aria-hidden="true"></span></button>').appendTo(responsive_btn_group);
		var $screen_xs_btn = $('<button id="epan-editor-preview-screen-xm" title="Mobile Preview" type="button" class="btn btn-default" ><span class="fa fa-mobile" aria-hidden="true"></span></button>').appendTo(responsive_btn_group);
		// var $screen_custom_btn = $('<button id="epan-editor-preview-screen-xm" title="Custom Size Preview" type="button" class="btn btn-default" ><span class="fa fa-plus" aria-hidden="true"></span></button>').appendTo(responsive_btn_group);

		$screen_reset_btn.click(function(event) {
			$('body').removeClass('xepan-cms-responsive-wrapper xepan-responsive-xs xepan-responsive-sm xepan-responsive-md xepan-responsive-lg');
		});

		$screen_xs_btn.click(function(event) {
			$('body').removeClass('xepan-responsive-sm xepan-responsive-md xepan-responsive-lg');
			$('body').addClass('xepan-cms-responsive-wrapper xepan-responsive-xs');
		});

		$screen_sm_btn.click(function(event) {
			$('body').removeClass('xepan-responsive-xs xepan-responsive-md xepan-responsive-lg');
			$('body').addClass('xepan-cms-responsive-wrapper xepan-responsive-sm');
		});

		$screen_md_btn.click(function(event) {
			$('body').removeClass('xepan-responsive-xs xepan-responsive-sm xepan-responsive-lg');
			$('body').addClass('xepan-cms-responsive-wrapper xepan-responsive-md');
		});

		$screen_lg_btn.click(function(event) {
			$('body').removeClass('xepan-responsive-xs xepan-responsive-sm xepan-responsive-md');
			$('body').addClass('xepan-cms-responsive-wrapper xepan-responsive-lg');
		});


	},

	setupTools: function(){
		var self = this;

		var apps_dropdown = $('<select class="xepan-layout-selector"></select>').appendTo(self.leftbar);
		var option = '<option value="0">Select</option>';
		
		var category_dropdown = $('<select class="xepan-layout-selector-category"></select>').appendTo(self.leftbar);
		$(category_dropdown).hide();

		var tools_options = $('<div class="xepan-tools-options">').appendTo(self.rightbar);

		var layout_category = [];

		$.each(self.options.tools,function(app_name,tools){

			option += '<option value="'+app_name+'">'+app_name+'</option>';
			var app_tool_wrapper = $('<div class="xepan-cms-toolbar-tool '+app_name+'">').appendTo(self.leftbar);
			var tools_html = "";
			$.each(tools,function(tool_name_with_namespace,tool_data){

				// category
				if(tool_data.category != undefined && $.inArray(tool_data.category, layout_category) < 0){
					layout_category.push(tool_data.category);
				}

				var t_name = tool_name_with_namespace;
				if(t_name.length >0 )
					t_name = t_name.replace(/\\/g, "");

				$('<div class="xepan-cms-tool '+tool_data.category+'" data-toolname="'+t_name+'"><img src="'+tool_data.icon_img+'"/ onerror=this.src="./vendor/xepan/cms/templates/images/default_icon.png"><p>'+tool_data.name+'</p></div>')
					.appendTo(app_tool_wrapper)
					.disableSelection()
					.draggable({
						inertia:true,
						appendTo:'body',
						connectToSortable:'.xepan-sortable-component',
						helper:'clone',
						start: function(event,ui){
							origin='toolbox';
							xepan_drop_component_html= tool_data.drop_html;
							self.leftbar.hide();
							$('.xepan-sortable-component').addClass('xepan-sortable-highlight-droppable');
						},

						stop: function(event,ui){
							self.leftbar.show();
							$('.xepan-sortable-component').removeClass('xepan-sortable-highlight-droppable');
						},
						revert: 'invalid',
						tolerance: 'pointer'
					})
					;
					
					if(tool_data.tool =='xepan/cms/Tool_Layout' && xepan_component_layout_optioned_added==true ){
					}else{
						$(tool_data.option_html).appendTo(tools_options);
						if(tool_data.tool =='xepan/cms/Tool_Layout') xepan_component_layout_optioned_added = true;
					}
			});
			$(app_tool_wrapper).hide();
		});

		$(option).appendTo(apps_dropdown);

		var category_option = '<option value="0">All Category</option>';
		$.each(layout_category, function(index, cat_name) {
			category_option += '<option value="'+cat_name+'">'+cat_name+'</option>';
		});
		$(category_option).appendTo(category_dropdown);

		$(apps_dropdown).change(function(){
			selected_app = $(this).val();
			$('.xepan-cms-toolbar-tool').hide();
			$('.xepan-cms-toolbar-tool.'+selected_app).show();
			
			if(selected_app == "Layouts"){
				$(category_dropdown).show();
			}else{
				$(category_dropdown).hide();
			}
		});

		$(category_dropdown).change(function(event) {
			/* Act on the event */
			selected_cat = $(this).val();
			$('.xepan-cms-toolbar-tool.Layouts .xepan-cms-tool').hide();
			$('.xepan-cms-toolbar-tool.Layouts').show();
			if(selected_cat == 0){
				$('.xepan-cms-toolbar-tool.Layouts .xepan-cms-tool').show();
			}else{
				$('.xepan-cms-toolbar-tool.Layouts .'+selected_cat).show();
			}

		});

		// Show default custom layouts
		$(apps_dropdown).val('Layouts');
		$(category_dropdown).show();
		$(category_dropdown).val('customlayout');
		$(category_dropdown).trigger('change');

		$(self.options.basic_properties).appendTo(tools_options);
	},

	setUpPagesAndTemplates: function(){
		var self = this;
		
		var page_btn_wrapper = $('<div class="input-group xepan-cms-template-page-management"></div>').appendTo(self.editor_helper_wrapper);
		var $template_edit_btn = $('<span class="input-group-addon" title="Edit Current Page Template"> <i class="fa fa-edit"> Template</i></span>').appendTo(page_btn_wrapper);
		var $page_btn = $('<input disabled="" title="Current Page:'+self.options.current_page+'" class="form-control" aria-describedby="basic-addon3" value="'+self.options.current_page+' "/><span title="Page and Template Management" class="input-group-addon"><i class="fa fa-cog"></i></span>').appendTo(page_btn_wrapper);
		
		if(self.options.template_editing != true){
			$template_edit_btn.click(function(event) {
				$(self.element).xepanEditor('editTemplate');
			});
		}else{
			$template_edit_btn.addClass('xepan-editor-btn-disabled');
		}

		$page_btn.click(function(event) {
			$.univ().frameURL('Pages & Templates','index.php?page=xepan_cms_cmspagemanager&cut_page=1');
		});


	},

	setupToolbar: function(){
		var self = this;

		$(this.element).draggable({
			handle:'.xepan-toolbar-drag-handler',
			containment : 'window'
		});

		$('.xepan-tools-options').draggable({
			handle:'.xepan-tools-options-drag-handler',
			containment : 'window'
		});
		
		/*=====----Setup TopToolBar Editor-----===========*/
		/*Save page Content*/
		$('#xepan-savepage-btn').click(function(){
			$('.xepan-toolbar').xepanEditor('savePage');
		});
		$('#toolbar-toggle-btn').click(function(){
			$('.xepan-toolbar-group-component').toggle();
		});

		/*Component Editing outline*/
		$('#epan-component-border').click(function(event) {
		    if($('#epan-component-border:checked').size() > 0){
		        $(self.options.component_selector).addClass('component-outline');
		    }else{
		        $(self.options.component_selector).removeClass('component-outline');
		    }
		});
		/*Preview Mode*/
		$('#epan-editor-preview i').click(function(event){
		    $('#epan-editor-left-panel').visibilityToggle();
		});
		/*Access to Admin panel*/
		 $('#dashboard-btn').click(function(event) {
	        // TODO check if content is changed
	        window.location.replace('admin/');
	    });

		/*Drag & Drop Component to Another  Extra Padding top & Bottom*/
		$('#epan-component-extra-padding').click(function(event) {
		    if($('#epan-component-extra-padding:checked').size() > 0){
		        $(self.options.component_selector + ' .xepan-sortable-component').addClass('xepan-sortable-extra-padding');
		    }else{
		        $(self.options.component_selector + ' .xepan-sortable-component').removeClass('xepan-sortable-extra-padding');
		    }
		});
		
		
		/*Website Desktop,Laptop,Tablet,Mobile Device Preview*/

		$('#epan-editor-preview-mobile').click(function(event){
		    $("<div>").append($("<iframe width='100%' height='100%' />")
		        .attr("src", "index.php?preview=1"))
		        .dialog({
		            width: 320,
		            height: 480,
		            modal: true
		    });
		    $('iframe').on("load", function() {
			    $('iframe').contents().find('body').css('margin-top','0');    
				$('iframe').contents().find('.xepan-toolbar').css('display','none');
			});    
		});

		$('#epan-editor-preview-tablet').click(function(event){
		    $("<div>").append($("<iframe width='100%' height='100%' />")
		        .attr("src", "index.php?preview=1"))
		        .dialog({
		            width: 768,
		            height: 480,
		            modal: true
		    });
		    $('iframe').on("load", function() {
			    $('iframe').contents().find('body').css('margin-top','0');    
				$('iframe').contents().find('.xepan-toolbar').css('display','none');
			});    
		});

		$('#epan-editor-preview-laptop').click(function(event){
		    $("<div>").append($("<iframe width='100%' height='100%' style='margin-top:10px' />")
		        .attr("src", "index.php?preview=1"))
		        .dialog({
		            width: 992,
		            height: 500,
		            modal: true
		    });
		    $('iframe').on("load", function() {
			    $('iframe').contents().find('body').css('margin-top','0');    
				$('iframe').contents().find('.xepan-toolbar').css('display','none');
			});    
		});

		$('#epan-editor-preview-desktop').click(function(event){
		    $("<div>").append($("<iframe width='100%' height='100%' />")
		        .attr("src", "index.php?preview=1"))
		        .dialog({
		            width: 1024,
		            height: 550,
		            modal: true
		    });
		    $('iframe').on("load", function() {
			    $('iframe').parent().find('.ui-dialog-titlebar').css('margin-top','55px');    
			    $('iframe').contents().find('body').css('margin-top','0');    
				$('iframe').contents().find('.xepan-toolbar').css('display','none');
			});    
		});

		$('#save-as-snapshot').click(function(event){

		});

		$('#template-btn').click(function(event){
			$('.xepan-toolbar').xepanEditor('editTemplate');
		});

	},

	editTemplate : function(){
		// alert(this.options.template);
		// alert(this.options.template_file);
		$.univ().location('index.php?page='+this.options.template+'&xepan-template-edit='+this.options.template);
	},

	savePage: function(){
		// console.log(this.options.save_url);
		// console.log(this.options.file_path);

		var self= this;
		
		// $('body').trigger('beforeSave');
		try{
	    	$('body').triggerHandler('beforeSave');
		}catch(err){
			console.log(err);
		}

	    $('body').univ().infoMessage('Wait.. saving your page !!!');

	    $(xepan_component_selector).xepanComponent('deselect');
	   	
	   	// responsive classes
	    $('body').removeClass('xepan-cms-responsive-wrapper xepan-responsive-xs xepan-responsive-sm xepan-responsive-md xepan-responsive-lg');

	    var overlay = jQuery('<div id="xepan-cms-page-save-overlay"> </div>');
	    overlay.insertAfter(document.body).css('z-index','10000');

	    html_body = $('.xepan-page-wrapper').clone();
		
		if(self.options.template_editing){
		    html_body = $('body').clone();
		    $(html_body).children().filter(":not(.xepan-v-body)").remove();
		    self.options.file_path = self.options.template_file;
		}		
		
	    $(html_body).find('.xepan-serverside-component').html("");
	    $(html_body).find('.xepan-editable-text').attr('contenteditable','false');
	    $(html_body).find('.mce-tinymce').remove();
	    $(html_body).find('.mce-tooltip').remove();

	    $(html_body).find('.xepan-component-drag-handler').remove();
	    $(html_body).find('.xepan-component-remove').remove();
	    $(html_body).find('.xepan-component').removeClass('xepan-component-hover-selector');
	    $(html_body).find('.xepan-component').removeClass('component-outline');
	    $(html_body).find('.xepan-component').removeClass('xepan-selected-component');
	    $(html_body).find('.xepan-component').removeClass('xepan-sortable-extra-padding');

	    html_body = encodeURIComponent($.trim($(html_body).html()));


	    html_crc = crc32(html_body);

	    // if (edit_template == true) {
	    //     html_body = encodeURIComponent($.trim($('#epan-content-wrapper').html()));
	    //     html_crc = crc32(html_body);
	    // }

	    $("body").css("cursor", "default");

	    var save_and_take_snapshot='Y';


	    $.ajax({
	        url: this.options.save_url,
	        type: 'POST',
	        dataType: 'html',
	        data: {
	            body_html: html_body,
	            body_attributes: encodeURIComponent($('body').attr('style')),
	            take_snapshot: save_and_take_snapshot ? 'Y' : 'N',
	            crc32: html_crc,
	            length: html_body.length,
	            file_path: self.options.file_path,
	            is_template: self.options.template_editing
	        },
	    })
	    .done(function(message) {
            eval(message);	        
	        $('body').triggerHandler('saveSuccess');
	    })
	    .fail(function(err) {
	        $('body').trigger('saveFail');
	    })
	    .always(function() {
	        $('body').triggerHandler('afterSave');
	    });
	},

	hideOptions:function(){
		$('.xepan-tool-options').hide();
	},

	setUpShortCuts: function(){
		var self = this;
		shortcut.add("Ctrl+s", function(event) {
	        $(self.element).xepanEditor('savePage');
	        event.stopPropagation();
	    });

	    shortcut.add("Ctrl+backspace", function(event) {
	    	if (typeof current_selected_component == 'undefined') return;
	        $(current_selected_component).xepanComponent('remove');
	        event.stopPropagation();
	    });

		shortcut.add("Ctrl+Shift+Up", function(event) {
	        ctrlShiftUpSelection(event);
	    });

	    shortcut.add("Ctrl+Shift+Left", function(event) {
	    	ctrlShiftLeftSelection(event);
	    });

	    shortcut.add("Ctrl+Shift+Right", function(event) {
	    	ctrlShiftRightSelection();
	    });

		shortcut.add("Tab", function(event) {
	        tabSelection(event);
	    }, {
	        disable_in_input: true
	    });

	    shortcut.add("Shift+Tab", function(event) {
	    	shiftTabSelection(event);
	    });

	    shortcut.add("Esc", function(event) {
	        $(xepan_component_selector).xepanComponent('deselect');
	        $('#xepan-cms-toolbar-right-side-panel').removeClass('toggleSideBar');
	        $('#xepan-cms-toolbar-left-side-panel').removeClass('toggleSideBar');
	        event.stopPropagation();
	    });

	    shortcut.add("F2", function(event) {
        $('.xepan-toolbar-group-component ').toggle('slideup');
	    });

	    shortcut.add("F4", function(event) {
	        $('.xepan-tools-options').toggle('slideup');
	    });


	},

	cleanup: function(){
		
	}

	
});

function ctrlShiftRightSelection(event){
	if (typeof current_selected_component == 'undefined') return;
    next_sibling = $(current_selected_component).next('.xepan-component');
    if (next_sibling.length === 0) {
        $('body').univ().errorMessage('No Next Sibling element found');
        return;
    }
    $(current_selected_component).xepanComponent('deselect');
    $(next_sibling).xepanComponent('select');
    event.stopPropagation();
}

function ctrlShiftLeftSelection(event){
	if (typeof current_selected_component == 'undefined') return;
    prev_sibling = $(current_selected_component).prev('.xepan-component');
    if (prev_sibling.length === 0) {
        $('body').univ().errorMessage('No Next Sibling element found');
        return;
    }
    $(current_selected_component).xepanComponent('deselect');
    $(prev_sibling).xepanComponent('select');
    event.stopPropagation();
}

function ctrlShiftUpSelection(event){
	if (typeof current_selected_component == 'undefined') return;
    parent_component = $(current_selected_component).parent('.xepan-component');
    if (parent_component.length === 0) {
        $('body').univ().errorMessage('On Top Component');
        return;
    }
    $(current_selected_component).xepanComponent('deselect');
    $(parent_component).xepanComponent('select');
}

function tabSelection(event){
	if (typeof current_selected_component == 'undefined') {
        next_component = $('.xepan-page-wrapper').children('.xepan-component:first-child');
    } else {
        var $x = $('.xepan-component:not(.xepan-page-wrapper)');
        next_component = $x.eq($x.index($(current_selected_component)) + 1);
    }

    if($(next_component).attr('id') === undefined){
        next_component = $('.xepan-page-wrapper').children('.xepan-component:first-child');
        if($(next_component).attr('id') === undefined){
            event.stopPropagation();
            $.univ.errorMessage('No Component On Screen');
            return;
        }
    }

    $(xepan_component_selector).xepanComponent('deselect');
    $(next_component).xepanComponent('select');
    event.stopPropagation();
}


function shiftTabSelection(event){
    if (typeof current_selected_component == 'undefined') {
        next_component = $('.xepan-page-wrapper').children('.xepan-component:first-child');
    } else {
        var $x = $('.xepan-component:not(.xepan-page-wrapper)');
        next_component = $x.eq($x.index($(current_selected_component)) - 1);
    }

    if($(next_component).attr('id') === undefined){
        next_component = $('.xepan-page-wrapper').children('.xepan-component:first-child');
        if($(next_component).attr('id') === undefined){
            event.stopPropagation();
            $.univ.errorMessage('No Component On Screen');
            return;
        }
    }

    $(xepan_component_selector).xepanComponent('deselect');
    $(next_component).xepanComponent('select');
    event.stopPropagation();
}

function componentMoveLeft(event){
	if (typeof current_selected_component == 'undefined') return;
    previous_sibling = $(current_selected_component).prev('.xepan-component');
    if (previous_sibling.length === 0) {
        $('body').univ().errorMessage('No Previous Sibling element found');
        return;
    }

    $(current_selected_component).insertBefore(previous_sibling);
    event.stopPropagation();
}

function componentMoveRight(event){
	if (typeof current_selected_component == 'undefined') return;
    next_sibling = $(current_selected_component).next('.xepan-component');
    if (next_sibling.length === 0) {
        $('body').univ().errorMessage('No Next Sibling element found');
        return;
    }

    $(current_selected_component).insertAfter(next_sibling);
    event.stopPropagation();
}

function duplicateComponent(event){
	if (typeof current_selected_component == 'undefined') return;
	html_clone = $(current_selected_component).clone();

	// console.log(html_clone);
	$(html_clone).removeAttr('id');
	$(html_clone).find('.xepan-component').each(function(){
		$(this).removeAttr('id');
	});

	duplicate_component = $(html_clone).insertAfter(current_selected_component);

	old_options = $.extend(true, {}, (current_selected_component).xepanComponent('getOptions'));
	$(current_selected_component).xepanComponent('deselect');
    $(duplicate_component).xepanComponent(old_options);
    $(duplicate_component).xepanComponent('select');
    $(duplicate_component).find('.xepan-component').xepanComponent(old_options);

    event.stopPropagation();
}

function Utf8Encode(string) {
    string = string.replace(/\r\n/g, "\n");
    var utftext = "";

    for (var n = 0; n < string.length; n++) {
        var c = string.charCodeAt(n);
        if (c < 128) {
            utftext += String.fromCharCode(c);
        } else if ((c > 127) && (c < 2048)) {
            utftext += String.fromCharCode((c >> 6) | 192);
            utftext += String.fromCharCode((c & 63) | 128);
        } else {
            utftext += String.fromCharCode((c >> 12) | 224);
            utftext += String.fromCharCode(((c >> 6) & 63) | 128);
            utftext += String.fromCharCode((c & 63) | 128);
        }
    }
    return utftext;
};

function crc32(str) {
    str = Utf8Encode(str);
    var table = "00000000 77073096 EE0E612C 990951BA 076DC419 706AF48F E963A535 9E6495A3 0EDB8832 79DCB8A4 E0D5E91E 97D2D988 09B64C2B 7EB17CBD E7B82D07 90BF1D91 1DB71064 6AB020F2 F3B97148 84BE41DE 1ADAD47D 6DDDE4EB F4D4B551 83D385C7 136C9856 646BA8C0 FD62F97A 8A65C9EC 14015C4F 63066CD9 FA0F3D63 8D080DF5 3B6E20C8 4C69105E D56041E4 A2677172 3C03E4D1 4B04D447 D20D85FD A50AB56B 35B5A8FA 42B2986C DBBBC9D6 ACBCF940 32D86CE3 45DF5C75 DCD60DCF ABD13D59 26D930AC 51DE003A C8D75180 BFD06116 21B4F4B5 56B3C423 CFBA9599 B8BDA50F 2802B89E 5F058808 C60CD9B2 B10BE924 2F6F7C87 58684C11 C1611DAB B6662D3D 76DC4190 01DB7106 98D220BC EFD5102A 71B18589 06B6B51F 9FBFE4A5 E8B8D433 7807C9A2 0F00F934 9609A88E E10E9818 7F6A0DBB 086D3D2D 91646C97 E6635C01 6B6B51F4 1C6C6162 856530D8 F262004E 6C0695ED 1B01A57B 8208F4C1 F50FC457 65B0D9C6 12B7E950 8BBEB8EA FCB9887C 62DD1DDF 15DA2D49 8CD37CF3 FBD44C65 4DB26158 3AB551CE A3BC0074 D4BB30E2 4ADFA541 3DD895D7 A4D1C46D D3D6F4FB 4369E96A 346ED9FC AD678846 DA60B8D0 44042D73 33031DE5 AA0A4C5F DD0D7CC9 5005713C 270241AA BE0B1010 C90C2086 5768B525 206F85B3 B966D409 CE61E49F 5EDEF90E 29D9C998 B0D09822 C7D7A8B4 59B33D17 2EB40D81 B7BD5C3B C0BA6CAD EDB88320 9ABFB3B6 03B6E20C 74B1D29A EAD54739 9DD277AF 04DB2615 73DC1683 E3630B12 94643B84 0D6D6A3E 7A6A5AA8 E40ECF0B 9309FF9D 0A00AE27 7D079EB1 F00F9344 8708A3D2 1E01F268 6906C2FE F762575D 806567CB 196C3671 6E6B06E7 FED41B76 89D32BE0 10DA7A5A 67DD4ACC F9B9DF6F 8EBEEFF9 17B7BE43 60B08ED5 D6D6A3E8 A1D1937E 38D8C2C4 4FDFF252 D1BB67F1 A6BC5767 3FB506DD 48B2364B D80D2BDA AF0A1B4C 36034AF6 41047A60 DF60EFC3 A867DF55 316E8EEF 4669BE79 CB61B38C BC66831A 256FD2A0 5268E236 CC0C7795 BB0B4703 220216B9 5505262F C5BA3BBE B2BD0B28 2BB45A92 5CB36A04 C2D7FFA7 B5D0CF31 2CD99E8B 5BDEAE1D 9B64C2B0 EC63F226 756AA39C 026D930A 9C0906A9 EB0E363F 72076785 05005713 95BF4A82 E2B87A14 7BB12BAE 0CB61B38 92D28E9B E5D5BE0D 7CDCEFB7 0BDBDF21 86D3D2D4 F1D4E242 68DDB3F8 1FDA836E 81BE16CD F6B9265B 6FB077E1 18B74777 88085AE6 FF0F6A70 66063BCA 11010B5C 8F659EFF F862AE69 616BFFD3 166CCF45 A00AE278 D70DD2EE 4E048354 3903B3C2 A7672661 D06016F7 4969474D 3E6E77DB AED16A4A D9D65ADC 40DF0B66 37D83BF0 A9BCAE53 DEBB9EC5 47B2CF7F 30B5FFE9 BDBDF21C CABAC28A 53B39330 24B4A3A6 BAD03605 CDD70693 54DE5729 23D967BF B3667A2E C4614AB8 5D681B02 2A6F2B94 B40BBE37 C30C8EA1 5A05DF1B 2D02EF8D";
    var crc = 0;
    var x = 0;
    var y = 0;

    crc = crc ^ (-1);
    for (var i = 0, iTop = str.length; i < iTop; i++) {
        y = (crc ^ str.charCodeAt(i)) & 0xFF;
        x = "0x" + table.substr(y * 9, 8);
        crc = (crc >>> 8) ^ x;
    }

    return (crc ^ (-1)) >>> 0;
};

(function(old) {
  $.fn.attr = function() {
    if(arguments.length === 0) {
      if(this.length === 0) {
        return null;
      }

      var obj = {};
      $.each(this[0].attributes, function() {
        if(this.specified) {
          obj[this.name] = this.value;
        }
      });
      return obj;
    }

    return old.apply(this, arguments);
  };
})($.fn.attr);

// $('iframe').load(function(){
// 	$(this).find('body').css('margin-top','0');
// });
