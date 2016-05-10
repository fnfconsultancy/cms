current_selected_component : undefined;
origin : '';
xepan_drop_component_html: '';

jQuery.widget("ui.xepanEditor",{
	
	_create: function(){
		self = this;
		self.setupToolbar();
	},

	setupToolbar: function(){
		$(this.element).draggable({handle:'.xepan-toolbar-drag-handler'}); // TODO: define handler
		$('.xepan-tools-options').draggable({handle:'.xepan-tools-options-drag-handler'});
		$('#xepan-savepage-btn').click(function(){
			$('.xepan-toolbar').xepanEditor('savePage');
		});
	},

	savePage: function(){
		console.log(this.options.save_url);
		console.log(this.options.save_page);
	},

	hideOptions:function(){
		$('.xepan-tools-options').hide();
	}

	
});