xepan_cms_tinymce_options={
		inline:true,
		menubar: false,
		forced_root_block: 'p',
		plugins: ["advlist autolink link image lists charmap print preview hr anchor pagebreak spellchecker",
                "searchreplace wordcount visualblocks visualchars code fullscreen insertdatetime media nonbreaking",
                "save table contextmenu directionality emoticons template paste textcolor colorpicker imagetools"],
		toolbar1: "undo redo | styleselect | bold italic underline strikethrough fontselect fontsizeselect | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image table | fullpage | forecolor backcolor emoticons",                
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


jQuery.widget("ui.xepanComponent",{
	self: undefined,
	options:{
		editing_template:0,
		component_selector:null,
		editor_id: null
	},

	_create: function(){
		var self=this;

		if($(this.element).closest('.xepan-toolbar').length !=0) return;
		if(!$(this.element).attr('id')) $(this.element).attr('id',generateUUID());

		self.options.option_panel = $('.xepan-tool-options[for-xepan-component="'+($(this.element).attr('xepan-component'))+'"]');

		if($(this.element).hasClass('xepan-sortable-component')){
			$(this.element).xepanComponent('createSortable');
		}

		$(this.element).find('.xepan-sortable-component').sortable(this.sortable_options);

		if($(this.element).hasClass('xepan-editable-text')){
			$(this.element).xepanComponent('createTextEditable');
		}
		
		var enable_hover = true;

		if($(this.element).is('body')){
			enable_hover = false;
		}else if($(this.element).hasClass('xepan-page-wrapper') && !this.options.editing_template ){
			enable_hover = false;
		}

		if(enable_hover){
			$(this.element).hover(

				function(event,ui){
					$('.xepan-component-hover-selector').removeClass('xepan-component-hover-selector');
					$('.xepan-component-hoverbar').remove();

					$(this).addClass('xepan-component-hover-selector');
					var hoverbar = $('<div class="xepan-component-hoverbar">').appendTo($(this));				
					var	drag_btn =  $('<div class="xepan-component-drag-handler"><i class="glyphicon glyphicon-move"></i></div>').appendTo(hoverbar);
					var remove_btn = $('<div class="xepan-component-remove"><i class="glyphicon glyphicon-trash"></i></div>').appendTo(hoverbar);

					$(remove_btn).click(function(){
						var comp_temp = $(this).closest('.xepan-component');
						var t_name = $(comp_temp).attr('xepan-component');
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
				
				event.stopPropagation();
			},

				function(event,ui){
					$('.xepan-component-hover-selector').removeClass('xepan-component-hover-selector');
					$('.xepan-component-hoverbar').remove();
					event.stopPropagation();
				}
			);

		}else{
			$(this.element).css('min-height','200px');
		}

		$(this.element).dblclick(function(event,ui){
			$(self.options.component_selector).xepanComponent('deselect');
			$(this).xepanComponent('select');
			event.stopPropagation();
		});
	},

	select: function (){
		current_selected_component = this.element;
		$(this.element).addClass('xepan-selected-component');
		$('.xepan-tool-options').hide();
		this.options.option_panel.show();
		$('#'+this.options.option_panel.attr('id')).trigger('show');
		$('#xepan-basic-css-panel').trigger('show');

		$(this.options.option_panel).closest('.xepan-tool-options').show();
		$('#xepan-cms-toolbar-right-side-panel').addClass('toggleSideBar');

		updateBreadCrumb();
		// console.log($(this.options.option_panel).closest('.xepan-tool-options'));
		// console.log('Switched to ' + $(current_selected_component).attr('xepan-component'));
	},

	createSortable: function(){
		$(this.element).sortable(this.sortable_options);
	},

	createTextEditable: function(){
		self=this;
		if(!$(this.element).hasClass('xepan-editable-text')) return;
		$(this.element).attr('contenteditable','true');
		$.univ().richtext(self.element,xepan_cms_tinymce_options,true);
	},

	deselect: function (){
		if(typeof current_selected_component !== 'undefined' && this.element == current_selected_component){
			current_selected_component=undefined;
			$(xepan_editor_element).xepanEditor('hideOptions');
		}
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
			if(t_name != 'undefined'){
				t_name = t_name.replace(/\//g, "");
				tool_drag_html = $('.xepan-cms-tool[data-toolname="'+t_name+'"]').prop('outerHTML');
			}
	        return $(tool_drag_html);
	    },
	    start: function(event, ui) {
	    	$(ui.placeholder).removeClass("col-md-6 col-sm-6 xepan-tool-bar-tool ui-draggable").css('visibility','visible');
	        // if ($(ui.item).hasClass('ui-sortable')) {
         //    	sortable_disabled = true;
         //    	$(ui.item).sortable("option", "disabled", true);
         //    	$(ui.item).find('.epan-sortable-component').sortable("option", "disabled", true);
        	// }
	    },
	    sort: function(event, ui) {
	        // $(ui.placeholder).html('Drop in ' + $(ui.placeholder).parent().attr('xepan-component') + ' ??');
	        $(ui.placeholder).html('<div class="xepan-cms-droppable-placeholder"> Drop in ' + $(ui.placeholder).parent().attr('xepan-component') + ' ??'+'</div>');
	    },
	    stop: function(event, ui) {
	    	if(typeof origin == 'undefined' || origin == 'toolbox'){
	    		// Find sub components if any and make components
	    		$new_component = $(xepan_drop_component_html).xepanComponent();
				$($new_component).find('.xepan-component').xepanComponent();
				$($new_component).attr('id',generateUUID());
				window.setTimeout(function(){
					if($($new_component).hasClass('xepan-editable-text'))
						$.univ().richtext($new_component,xepan_cms_tinymce_options,true);
				},400);
		    	$(ui.item).replaceWith($new_component);

		    	if($('#epan-component-border:checked').size() > 0)
			        $new_component.addClass('component-outline');

			    if($('#epan-component-extra-padding:checked').size() > 0){
			        if($new_component.hasClass('xepan-sortable-component')) 
			        	$new_component.addClass('epan-sortable-extra-padding');
			        $new_component.find('.xepan-sortable-component').addClass('epan-sortable-extra-padding');
			    }
			    
	    	}
	    	// console.log(origin);
		    origin='page';
	    }
	},

	getComponentSelector: function(){
		var self =  this;
		return self.options.component_selector;
	}
	
});

function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
    });
    return uuid;
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