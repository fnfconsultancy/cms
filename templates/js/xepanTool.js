jQuery.widget("ui.xepanTool",{
	
	_create: function(){
		self = this;
		self.setupTool();
	},

	setupTool: function(){
		self = this;
		$(this.element).disableSelection().draggable({
			connectToSortable: '.xepan-sortable-component',
			helper: function(){
				return $('<div style="width:100px;"></div>').html($(this).xepanTool('getHTML'));
			},
			start: function(){
				origin='toolbox';
				xepan_drop_component_html = $($(this).xepanTool('getHTML'));
			},
			revert: 'invalid',
		  	tolerance: 'pointer'
		});
	},

	getHTML(){
		return this.options.drop_html;
	}
	
});