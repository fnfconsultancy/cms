jQuery.widget("ui.xepanComponent",{
	self: undefined,

	_create: function(){
		self=this;

		if($(this.element).closest('.xepan-toolbar').length !=0) return;

		self.options.option_panel = $('.xepan-tool-options[for-xepan-component="'+($(this.element).attr('xepan-component'))+'"]');

		if($(this.element).hasClass('xepan-sortable-component')){
			$(this.element).xepanComponent('createSortable');
		}

		if($(this.element).hasClass('xepan-editable-text')){
			$(this.element).xepanComponent('createTextEditable');
		}
		
		if(!$(this.element).hasClass('xepan-page-wrapper')){
			$(this.element).hover(
				// on hover
				function(event,ui){
					$(this).addClass('xepan-component-hover-selector');
					drag_handler = $('<div class="xepan-component-hover-bar"></div>').appendTo($(this));
					remove_btn = $('<i class="glyphicon glyphicon-trash xepan-component-remove"></i>').appendTo(drag_handler);
					drag_btn =  $('<i class="glyphicon glyphicon-move xepan-component-drag-handler"></i>').appendTo(drag_handler);	
					$(remove_btn).click(function(event,ui){
						$(this).closest('.xepan-component').xepanComponent('remove');
					});
					event.stopPropagation();				
				},
				//remove hover
				function(event,ui){
					$(this).removeClass('xepan-component-hover-selector');
					$(this).find('.xepan-component-hover-bar').remove();
					event.stopPropagation();				
				}
			);
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
		$('.xepan-tools-options > .xepan-tool-options').hide();
		this.options.option_panel.show();
		this.options.option_panel.trigger('show');
		$('.xepan-tools-options').show();

		console.log('Switched to ' + $(current_selected_component).attr('xepan-component'));
	},

	createSortable: function(){
		$(this.element).sortable(this.sortable_options);
	},

	createTextEditable: function(){
		self=this;
		$(this.element).attr('contenteditable','true');
		window.setTimeout(function(){
			$.univ().richtext(self.element,{inline:true,forced_root_block: false},true);
		},200);
	},

	deselect: function (){
		if(typeof current_selected_component !== 'undefined' && this.element == current_selected_component){
			current_selected_component=undefined;
			$('.xepan-toolbar').xepanEditor('hideOptions');
		}
		$(this.element).removeClass('xepan-selected-component');
	},

	remove:function(){
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
		    	$(ui.item).replaceWith($new_component);
	    	}
		    origin='page';
	    }
	},
	
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