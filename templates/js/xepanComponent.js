jQuery.widget("ui.xepanComponent",{
	self: undefined,

	_create: function(){
		self=this;

		// On tool drop create it again widget /  either sortabel or simple
		// setup dblclick options
		
		self.options.option_panel = $('.xepan-tool-options[for-xepan-component="'+($(this.element).attr('xepan-component'))+'"]');

		if($(this.element).hasClass('xepan-sortable-component'))
			$(this.element).xepanComponent('createSortable');
			

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