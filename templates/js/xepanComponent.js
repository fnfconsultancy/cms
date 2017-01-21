jQuery.widget("ui.xepanComponent",{
	self: undefined,

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
		
		if(!$(this.element).hasClass('xepan-page-wrapper')){

			$(this.element).on('mouseover', function(e) {
			    $(this).closest('.xepan-component').toggleClass('xepan-component-hover-selector', e.type === 'mouseover');  
			    
			    if(!$(this).hasClass('xepan-disable-move') && !$(this).hasClass('xepan-disable-remove') && $(this).hasClass('xepan-component-hover-selector')){
					drag_handler = $('<div class="xepan-component-hover-tool-bar"></div>').appendTo($(this));
				}

				if(!$(this).hasClass('xepan-disable-move')){
					drag_btn =  $('<i class="glyphicon glyphicon-move xepan-component-drag-handler"></i>').appendTo(drag_handler);	
				}

				if(!$(this).hasClass('xepan-disable-remove')){
					remove_btn = $('<i class="glyphicon glyphicon-trash xepan-component-remove"></i>').appendTo(drag_handler);
					$(remove_btn).click(function(event,ui){
						$(this).closest('.xepan-component').xepanComponent('remove');
					});
				}
			    e.stopPropagation();
			});

			$(this.element).on('mouseout', function(e) {
			    $(this).closest('.xepan-component').toggleClass('xepan-component-hover-selector', e.type === 'mouseover');
				
				$(this).find('.xepan-component-hover-tool-bar').remove();
			    e.stopPropagation();
			});
			
		}else{
			$(this.element).css('min-height','200px');
		}

		$(this.element).dblclick(function(event,ui){
			event.stopPropagation();
			$('.xepan-component').xepanComponent('deselect');
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
		handle: ' .xepan-component-drag-handler',
		helper: function(event, ui) {
	        return $('<div><h1>Dragging ... </h1></div>');
	    },
	    start: function(event, ui) {

	    	$(ui.placeholder).removeClass("col-md-6 col-sm-6 xepan-tool-bar-tool ui-draggable").css('visibility','visible');

	        if ($(ui.item).hasClass('ui-sortable')) {
	            sortable_disabled = true;
	            $(ui.item).sortable("option", "disabled", true);
	            $(ui.item).find('.xepan-sortable-component').sortable("option", "disabled", true);
	        }
	    },
	    sort: function(event, ui) {
	        $(ui.placeholder).html('Drop in ' + $(ui.placeholder).parent().attr('xepan-component') + ' ??');
	    },
	    stop: function(event, ui) {
	    	if(origin=='toolbox'){
	    		// Find sub components if any and make components
	    		$new_component = $(xepan_drop_component_html).xepanComponent();
				$($new_component).find('.xepan-component').xepanComponent();
				$($new_component).attr('id',generateUUID());
				window.setTimeout(function(){
					if($($new_component).hasClass('xepan-editable-text'))
						$.univ().richtext($new_component,self.tinyceme_options,true);
				},200);
		    	$(ui.item).replaceWith($new_component);
	    	}
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
        .parent('.xepan-component')
        .andSelf()
    // .reverse()
    .each(function(index, el) {
        var self = this;
        var current_selected = $(el).attr('xepan-component');

		if (!current_selected) { 
			current_selected = "Root"; 
		}
        
        var breadCrumbcomponent = current_selected.substring(current_selected.indexOf("_") + 1);
        new_btn = $('<div class=\'glyphicon glyphicon-forward pull-left\' style=\'margin:0 5px;\'></div>' + '<div class=\' xepan-breadcrumb-component pull-left \'>' + breadCrumbcomponent + '</div>');
        new_btn.click(function(event) {
            if (self == current_selected_component) {
                $(current_selected_component).effect("bounce", "slow");
                return;
            }
            $(self).dblclick();
        });
        new_btn.appendTo('#xepan-editing-toolbar-breadcrumb');
    });



};