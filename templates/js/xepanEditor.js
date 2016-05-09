current_selected_component : undefined;
origin : '';
xepan_drop_component_html: '';

jQuery.widget("ui.xepanEditor",{
	
	_create: function(){
		self = this;
		self.setupToolbar();
		// Create xepan-cpomponent xepan-sortable sortable
		// Create existing components components
		self.createPageWidgets();
		// Create ToolBar (draggable and ui)
		// Create Droppable Tools
			// On tool drop create it again widget /  either sortabel or simple
	},

	setupToolbar: function(){
		$(this.element).draggable({handle:'.xepan-toolbar-drag-handler'}); // TODO: define handler
		$('.xepan-tools-options').draggable({handle:'.xepan-tools-options-drag-handler'});
	},

	createPageWidgets: function(){
		$('.xepan-component').xepanComponent();
	}
	
});