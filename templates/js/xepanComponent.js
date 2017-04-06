jQuery.widget("ui.xepanComponent",{
	self: undefined,
	options:{
		editing_template:0,
		component_selector:null
	},

	_create: function(){
		self=this;

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
		}else if($(this.element).hasClass('.xepan-page-wrapper') && !this.options.editing_template ){
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
						$('<div></div>')
							.appendTo('body')
							.html('<div><h6>Are you sure ?</h6></div>')
							.dialog({
								modal: true, 
								title: 'message', 
								autoOpen: true,
								resizable: false,
								dialogClass:'xepan-component-remove-confirm',
								buttons: {
							    	Yes: function () {
										$(self.element).closest('.xepan-component').xepanComponent('remove');
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
			event.stopPropagation();
			$(self.options.component_selector).xepanComponent('deselect');
			$(this).xepanComponent('select');
		});
	},

	select: function (){
		current_selected_component = this.element;
		$(this.element).addClass('xepan-selected-component');
		$('.xepan-tools-options .xepan-tool-options').hide();
		this.options.option_panel.show();
		// this.options.option_panel.trigger('show');
		// $('#xepan-basic-css-panel').trigger('show');
		$('.xepan-tools-options').show();
		updateBreadCrumb();
		console.log('Switched to ' + $(current_selected_component).attr('xepan-component'));
	},

	createSortable: function(){
		$(this.element).sortable(this.sortable_options);
	},

	createTextEditable: function(){
		self=this;
		if(!$(this.element).hasClass('xepan-editable-text')) return;
		$(this.element).attr('contenteditable','true');
		$.univ().richtext(self.element,self.tinyceme_options,true);
	},

	deselect: function (){
		if(typeof current_selected_component !== 'undefined' && this.element == current_selected_component){
			current_selected_component=undefined;
			$('.xepan-toolbar').xepanEditor('hideOptions');
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
			$('.xepan-toolbar').xepanEditor('hideOptions');
		}
	},

	sortable_options: {
		appendTo:'body',
		connectWith:'.xepan-sortable-component',
		handle: '> .xepan-component-drag-handler',
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
	        return $('<div><h1>Dragging ... </h1></div>');
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
	        $(ui.placeholder).html('Drop in ' + $(ui.placeholder).parent().attr('xepan-component') + ' ??');

	    },
	    stop: function(event, ui) {
	    	var self = this;

	    	if(typeof origin == 'undefined' || origin == 'toolbox'){
	    		// Find sub components if any and make components
	    		$new_component = $(xepan_drop_component_html).xepanComponent(self.options);
				$($new_component).find('.xepan-component').xepanComponent(self.options);
				$($new_component).attr('id',generateUUID());
				window.setTimeout(function(){
					if($($new_component).hasClass('xepan-editable-text'))
						$.univ().richtext($new_component,self.tinyceme_options,true);
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

	tinyceme_options: {
		inline:true,
		forced_root_block: false,
		plugins: ["advlist autolink link image lists charmap print preview hr anchor pagebreak spellchecker",
                "searchreplace wordcount visualblocks visualchars code fullscreen insertdatetime media nonbreaking",
                "save table contextmenu directionality emoticons template paste textcolor colorpicker imagetools"],
		toolbar1: "insertfile undo redo | styleselect | bold italic fontselect fontsizeselect | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | print preview media fullpage | forecolor backcolor emoticons",                
		importcss_append: true,
		verify_html: false
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