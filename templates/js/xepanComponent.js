jQuery.widget("ui.xepanComponent",{
	self: undefined,

	_create: function(){
		self=this;

		// On tool drop create it again widget /  either sortabel or simple
		// setup dblclick options
		
		self.options.option_panel = $('.xepan-tool-options[for-xepan-component="'+($(this.element).attr('xepan-component'))+'"]');

		if($(this.element).hasClass('xepan-sortable-component'))
			$(this.element).xepanComponent('createSortable');
		
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

		$(this.element).dblclick(function(event,ui){
			$('.xepan-component').xepanComponent('deselect');
			$(this).xepanComponent('select');
			event.stopPropagation();
		});
	},

	select: function (){
		current_selected_component = this.element;

		$('.xepan-tools-options > .xepan-tool-options').hide();
		this.options.option_panel.show();
		this.options.option_panel.trigger('show');
		$('.xepan-tools-options').show();

		console.log('Switched to ' + $(current_selected_component).attr('xepan-component'));
	},

	createSortable: function(){
		$(this.element).sortable(this.sortable_options);
	},

	deselect: function (){
		$(this.element).removeClass('selected');
	},

	remove:function(){
		$(this.element).remove();
		$('.xepan-toolbar').xepanEditor('hideOptions');
	},

	sortable_options: {
		helper: function(event, ui) {
	        return $('<div><h1>Dragging ... </h1></div>');
	    },
	    start: function(event, ui) {
	        if ($(ui.item).hasClass('ui-sortable')) {
	            sortable_disabled = true;
	            $(ui.item).sortable("option", "disabled", true);
	            $(ui.item).find('.epan-sortable-component').sortable("option", "disabled", true);
	        }
	    },
	    sort: function(event, ui) {
	        $(ui.placeholder).html('Drop in ' + $(ui.placeholder).parent().attr('component_type') + ' ??');
	    },
	    stop: function(event, ui) {
	    	console.log(origin);
	    	if(origin=='toolbox')
		    	$(ui.item).replaceWith($(xepan_drop_component_html).xepanComponent());
		    origin='page';
	    }
	},
	
});