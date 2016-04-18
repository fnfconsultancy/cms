jQuery.widget("ui.xepanComponent",{
	/**
	 * Panel is main DOM for Option panel
	 * @type {jQuery DOM}
	 */
	panel : undefined,


	/**
	 * Widget initiator, called once when widget is created
	 */
	_create: function(){
		self = this;
		/**
		 * Create Basic Outer Panel and store in this.panel
		 */
		this.createOptionPanel();

		this.createContentEditor();
		
		
		$(this.element).on('dblclick',function(elm){
			$(self.panel).show();
		})
	},

	createOptionPanel: function(){
		// this.panel = $('<div style="width:200px; height:200px; background-color:red; position:absolute; z-index:1000; display:none">')
		// 				.prependTo('body');
		// this.panel.load(this.options.option_page_url);
		// this.panel.draggable();
	},

	createContentEditor: function (){
		// $('#'+$(this.element.attr('id') + ' .xepan-edittext')->attr('contenteditable','true');
	}
	
});