jQuery.widget("ui.xepanComponent",{
	
	_create: function(){
		this.createOptionPanel();
		$(this.element).on('dblclick',function(elm){
			alert("hello");
		})
	},

	createOptionPanel: function(){
		
	}
	
});