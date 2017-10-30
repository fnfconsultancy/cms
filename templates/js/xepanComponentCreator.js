jQuery.widget("ui.xepanComponentCreator",{
	options:{
		base_url:undefined,
		file_path:undefined,
		template_file:undefined,
		template:undefined,
		save_url:undefined,
		template_editing:undefined,
		tools:{},
		basic_properties: undefined,
		component_selector: '.xepan-component',
	},

	self: undefined,

	_create: function(){
		self = this;

		this.createDomInspector();
		this.manageDomSelected();

	},

	createDomInspector: function(){
		// to this.element // hide UI if any outer most
			// on click attach moucemove/enter/out event
			// on click set current_selected_dom variable
			// and detach UI
	},

	manageDomSelected: function () {
		// create Base UI // component type only infact
		// filter types like if rows and bootstrap col-md/sd etc is there let column Type be there or remove
		this.handleComponentTypeChange();
	},

	handleComponentTypeChange: function(){
		// on server side component create related UI
		if(this.isSelectedComponentServerSide()){
			this.createServerSideComponentUI();
		}else{
			this.createClientSideComponentUI();
		}
	},

	isExistingComponent: function(){
		return $(current_selected_dom).hasClass('xepan-component');
	},

	isServerSideComponent(){
		return this.isExistingComponent() && $(current_selected_dom).hasClass('xepan-serverside-component');
	},

	isSelectedComponentServerSide: function(){
		// send ajax this component value or lookup un in options;
		return true;
	},

	createServerSideComponentUI: function (){
		// get Original File Code
		// get Overrided File Code
		// set in Tabs or any poper UI
		// create rest of UI 
		// populate tags related UI
		if(this.isServerSideComponent()){
			// reload values or create required run time components
		}
	},

	createClientSideComponentUI: function(){
		// create UI 
		if(this.isExistingComponent()){
			// reload values or create required run time components
		}
	}


});