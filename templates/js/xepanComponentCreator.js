current_selected_dom = 0;
current_selected_dom_component_type = undefined;

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

	_create: function(){
		var self = this;

		self.createDomInspector();
		// this.manageDomSelected();

	},

	createDomInspector: function(){
		var self = this;
		// to this.element // hide UI if any outer most
			// on click attach moucemove/enter/out event
			// on click set current_selected_dom variable
			// and detach UI
		var myDomOutline = DomOutline({
			'onClick': function(element){
				current_selected_dom = element;
				self.manageDomSelected();
			}
		});

		$('#xepan-tool-inspector').click(function(){
			myDomOutline.start();
			return false;
		});

		// myDomOutline.stop();
	},

	manageDomSelected: function () {
		var self = this;
		// create Base UI // component type only infact
		// filter types like if rows and bootstrap col-md/sd etc is there let column Type be there or remove

		$('.sidebar').removeClass('toggleSideBar');
		if($('#xepan-component-creator-form').length){
			$('#xepan-component-creator-form').remove();
			$('.modal-backdrop').remove();
		}

		// display form in modal layout
		var form_layout = '<div id="xepan-component-creator-form" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="xepan-component-creator">'+
  						'<div class="modal-dialog modal-lg" role="document">'+
    						'<div class="modal-content">'+
      							'<div class="modal-header">'+
        							'<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>'+
        							'<h4 class="modal-title" id="gridSystemModalLabel">Epan Component Creator</h4>'+
      							'</div>'+
      							'<div class="modal-body">'+
      							'</div>'+
      							'<div class="modal-footer">'+
        							'<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>'+
        							'<button type="button" class="btn btn-primary" id="xepan-component-creator-form-save">Save changes</button>'+
      							'</div>'+
    						'</div>'+
  						'</div>'+ 
					'</div>';

		$form = $(form_layout).appendTo('body');
		$form.modal('toggle');

		var form_body = $form.find('.modal-body');
		var form_footer = $form.find('.modal-footer');
		
		current_selected_dom_component_type = $(current_selected_dom).attr('xepan-component')?$(current_selected_dom).attr('xepan-component'):'Generic';

		// html code 
		current_selected_dom_html = '<textarea style="width:100%;" rows="4" readonly></textarea>';
		html_textarea = $(current_selected_dom_html).appendTo($(form_body));
		$(html_textarea).val($(current_selected_dom).prop('outerHTML'));

		// selection
		selection_group = $('<div class="btn-group btn-group-xs"></div>').appendTo($(form_body));

		$('<button class="btn btn-primary">Selection</button>').appendTo($(selection_group));
		var selection_parent = $('<button id="xepan-creator-current-dom-select-parent" type="button" title="Parent" class="btn btn-default"><i class="fa fa-arrow-up"></i></button>').appendTo($(selection_group));
		// var selection_child = $('<button id="xepan-creator-current-dom-select-child" type="button" title="Child/Next" class="btn btn-default"><i class="fa fa-arrow-down"></i></button>').appendTo($(selection_group));
		// var selection_previous_sibling = $('<button id="xepan-creator-current-dom-select-previous-sibling" type="button" title="Previous Sibling" class="btn btn-default"><i class="fa fa-arrow-left"></i></button>').appendTo($(selection_group));
		// var selection_next_sibling = $('<button id="xepan-creator-current-dom-select-next-sibling" type="button" title="Next Sibling" class="btn btn-default"><i class="fa fa-arrow-right"></i></button>').appendTo($(selection_group));

		$(selection_parent).click(function(event){
			current_selected_dom = $(current_selected_dom).parent()[0];
			self.manageDomSelected();
		});

		// $(self.selection_next_sibling).click(function(event){
		// 	ctrlShiftRightSelection(event);
		// });

		// $(self.selection_parent).click(function(event) {
		// 	ctrlShiftUpSelection(event);
		// });

		// $(self.selection_child).click(function(event){
		// 	tabSelection(event);
		// });

		var type_select_layout = '<select id="xepan-component-creator-component-type-selector"><option value="Generic"> Generic Tool</option>';
		$.each(self.options.tools, function(appliction, app_tools) {
			 /* iterate through array or object */
			 if(appliction == "Layouts") return; //actually continue

			 $.each(app_tools, function(tool_name, tool_info) {
			 	tool_name = tool_name.replace(/\\/g, "/");
			 	type_select_layout += '<option value="'+tool_name+'">'+tool_name+'</option>';
			 });
		});
		type_select_layout += '</select>';

		$type_select =  $(type_select_layout).appendTo($(form_body));
		
		// append component wrapper
		$('<div id="xepan-component-creator-type-wrapper"></div>').appendTo($(form_body));

		self.handleComponentTypeChange(current_selected_dom_component_type);
		$type_select.change(function(event) {
			self.handleComponentTypeChange($(this).val());
		});
		$type_select.val(current_selected_dom_component_type);

		
		// save button called
		$('#xepan-component-creator-form-save').click(function(event) {
			// on server side component create related UI
			if(self.isComponentServerSide($('#xepan-component-creator-component-type-selector').val())){
				self.saveServerSideComponent();
			}else{
				self.saveClientSideComponent();
			}

		});
	},

	saveClientSideComponent: function(){
		// xepan component 
		if($('#xepan-cmp-cratetor-xepan-component:checked').size() > 0)
			$(current_selected_dom).addClass('xepan-component');
		else
			$(current_selected_dom).removeClass('xepan-component');

		// xepan sortable component 
		if($('#xepan-cmp-cratetor-xepan-sortable-component:checked').size() > 0)
			$(current_selected_dom).addClass('xepan-sortable-component');
		else
			$(current_selected_dom).removeClass('xepan-sortable-component');

		// xepan editable text
		if($('#xepan-cmp-cratetor-xepan-editable-text:checked').size() > 0)
			$(current_selected_dom).addClass('xepan-editable-text');
		else
			$(current_selected_dom).removeClass('xepan-editable-text');
		
		// no richtext
		if($('#xepan-cmp-cratetor-xepan-no-richtext:checked').size() > 0)
			$(current_selected_dom).addClass('xepan-no-richtext');
		else
			$(current_selected_dom).removeClass('xepan-no-richtext');

		// no move
		if($('#xepan-cmp-cratetor-xepan-no-move:checked').size() > 0)
			$(current_selected_dom).addClass('xepan-no-move');
		else
			$(current_selected_dom).removeClass('xepan-no-move');

		// no delete
		if($('#xepan-cmp-cratetor-xepan-no-delete:checked').size() > 0)
			$(current_selected_dom).addClass('xepan-no-delete');
		else
			$(current_selected_dom).removeClass('xepan-no-delete');

		// dynamic option list
		var find_str = "xepan-dynamic-option-";
		$.each(current_selected_dom.attributes, function( index, attr ) {
			// console.log("attribute: ",attr);
			if(attr == undefined) return ; //actually continnue
			if(attr.name.indexOf(find_str)===0){
				$(current_selected_dom).removeAttr(attr.name);
			}
		});

		$.each($('#xepan-creator-existing-dynamic-list .xepan-creator-existing-dynamic-list-added'), function(index, row_obj) {
			var name = 'xepan-dynamic-option-'+(index + 1);
			$(current_selected_dom).attr(name,$(row_obj).attr('data-dynamic-option'));
		});

		$.univ().infoMessage('saved and reload page');
		// $('#xepan-component-creator-form').modal('close');
		$('#xepan-component-creator-form').remove();
		$('.modal-backdrop').remove();

	},
	saveServerSideComponent: function(){
		alert('todo');
	},


	handleComponentTypeChange: function(tool_name){
		var self = this;
		$('#xepan-component-creator-type-wrapper').html("");

		// on server side component create related UI
		if(self.isComponentServerSide(tool_name)){
			self.createServerSideComponentUI();
		}else{
			self.createClientSideComponentUI();
		}
	},

	isExistingComponent: function(){
		return $(current_selected_dom).hasClass('xepan-component');
	},

	isComponentServerSide: function(tool_name){
		var self = this;

		var is_serverside = false;
		$.each(self.options.tools, function(appliction, app_tools) {
			 /* iterate through array or object */
			 if(appliction == "Layouts") return; //actually continue

			 $.each(app_tools, function(app_tool_name, tool_info) {
			 	app_tool_name = app_tool_name.replace(/\\/g, "/");

			 	if(app_tool_name == tool_name){
			 		is_serverside = tool_info.is_serverside;
			 	}
			 });
		});

		// return this.isExistingComponent() && $(current_selected_dom).hasClass('xepan-serverside-component');
		// send ajax this component value or lookup un in options;
		// console.log('is server side '+is_serverside);
		return is_serverside;
	},

	createServerSideComponentUI: function (){
		var self = this;
		$creator_wrapper =  $('#xepan-component-creator-type-wrapper');
		$('<div class="alert alert-danger"> Todo Server Side </div>').appendTo($creator_wrapper);

		// get Original File Code
		// get Overrided File Code
		// set in Tabs or any poper UI
		// create rest of UI 
		// populate tags related UI
		// if(this.isServerSideComponent()){
			// reload values or create required run time components
		// }
	},

	createClientSideComponentUI: function(){
		// create UI 
		var self = this;
		$creator_wrapper =  $('#xepan-component-creator-type-wrapper');
		$('<div class="alert alert-success"> Client Side </div>').appendTo($creator_wrapper);

		// xepan component
		if($(current_selected_dom).hasClass('xepan-component')){
			$('<input type="checkbox" id="xepan-cmp-cratetor-xepan-component" checked /><label for="xepan-cmp-cratetor-xepan-component"> Create Component</label>').appendTo($creator_wrapper);
		}else{
			$('<input type="checkbox" id="xepan-cmp-cratetor-xepan-component" /><label for="xepan-cmp-cratetor-xepan-component"> Create Component</label>').appendTo($creator_wrapper);
		}

		// sortable component
		if($(current_selected_dom).hasClass('xepan-sortable-component'))
			$('<input checked type="checkbox" id="xepan-cmp-cratetor-xepan-sortable-component" /><label for="xepan-cmp-cratetor-xepan-sortable-component"> Make Sortable/Droppable</label>').appendTo($creator_wrapper);
		else
			$('<input type="checkbox" id="xepan-cmp-cratetor-xepan-sortable-component" /><label for="xepan-cmp-cratetor-xepan-sortable-component"> Make Sortable/Droppable</label>').appendTo($creator_wrapper);
		
		// editable text
		if($(current_selected_dom).hasClass('xepan-editable-text'))
			$('<input checked type="checkbox" id="xepan-cmp-cratetor-xepan-editable-text" /><label for="xepan-cmp-cratetor-xepan-editable-text"> Create Editable Text</label>').appendTo($creator_wrapper);	
		else
			$('<input type="checkbox" id="xepan-cmp-cratetor-xepan-editable-text" /><label for="xepan-cmp-cratetor-xepan-editable-text"> Create Editable Text</label>').appendTo($creator_wrapper);	
			
		// editable text
		if($(current_selected_dom).hasClass('xepan-no-richtext'))
			$('<input checked type="checkbox" id="xepan-cmp-cratetor-xepan-no-richtext" /><label for="xepan-cmp-cratetor-xepan-no-richtext"> No Rich Text</label>').appendTo($creator_wrapper);
		else
			$('<input type="checkbox" id="xepan-cmp-cratetor-xepan-no-richtext" /><label for="xepan-cmp-cratetor-xepan-no-richtext"> No Rich Text</label>').appendTo($creator_wrapper);
		
		// no move
		if($(current_selected_dom).hasClass('xepan-no-move'))
			$('<input checked type="checkbox" id="xepan-cmp-cratetor-xepan-no-move" /><label for="xepan-cmp-cratetor-xepan-no-move">Disabled Moving</label>').appendTo($creator_wrapper);
		else
			$('<input type="checkbox" id="xepan-cmp-cratetor-xepan-no-move" /><label for="xepan-cmp-cratetor-xepan-no-move">Disabled Moving</label>').appendTo($creator_wrapper);

		// no delete 
		if($(current_selected_dom).hasClass('xepan-no-delete'))
			$('<input checked type="checkbox" id="xepan-cmp-cratetor-xepan-no-delete" /><label for="xepan-cmp-cratetor-xepan-no-delete">Disabled Delete</label>').appendTo($creator_wrapper);
		else
			$('<input type="checkbox" id="xepan-cmp-cratetor-xepan-no-delete" /><label for="xepan-cmp-cratetor-xepan-no-delete">Disabled Delete</label>').appendTo($creator_wrapper);

		$('<hr/>').appendTo($creator_wrapper);
		var add_dynamic_html = 
								'<h3>Dynamic Options</h3>'+
								'<div class="row xepan-cmp-creator-dynamic-option">'+
									'<div class="col-md-4">'+
										'<div class="form-group">'+
											'<label for="xepan-creator-dynamic-selector" class="control-label">Selector:</label>'+
											'<input class="form-control" id="xepan-creator-dynamic-selector">'+
										'</div>'+
									'</div>'+
									'<div class="col-md-2">'+
										'<div class="form-group">'+
											'<label for="xepan-creator-dynamic-title" class="control-label">Title:</label>'+
											'<input class="form-control" id="xepan-creator-dynamic-title">'+
										'</div>'+
									'</div>'+
									'<div class="col-md-2">'+
										'<div class="form-group">'+
											'<label for="xepan-creator-dynamic-attribute" class="control-label">Attribute:</label>'+
											'<select class="form-control" id="xepan-creator-dynamic-attribute">'+
												'<option value="">select</option>'+
												'<option value="text">text</option>'+
												'<option value="href">href</option>'+
												'<option value="css">css</option>'+
												'<option value="src">src</option>'+
											'</select>'+
										'</div>'+
									'</div>'+
									'<div class="col-md-2">'+
										'<div class="form-group">'+
											'<label for="xepan-creator-dynamic-additional" class="control-label">Additional:</label>'+
											'<input class="form-control" id="xepan-creator-dynamic-additional">'+
										'</div>'+
									'</div>'+
									'<div class="col-md-2">'+
										'<label class="control-label"> </label>'+
										'<button class="btn btn-primary btn-block" id="xepan-creator-dynamic-add-btn">Add</button>'+
									'</div>'+
								'</div>';

		$(add_dynamic_html).appendTo($creator_wrapper);
		
		$existing_list = $('<div id="xepan-creator-existing-dynamic-list"></div>').appendTo($creator_wrapper);

		var find_str = "xepan-dynamic-option-";
		$(current_selected_dom).each(function(index) {
			var elem = this;
			$.each(this.attributes, function( index, attr ) {
				if(attr.name.indexOf(find_str)===0){
					self.addDynamicOptionToList(attr.value);
				}
			});
		});

		$('#xepan-creator-dynamic-add-btn').click(function(){

			var selector =  $.trim($('#xepan-creator-dynamic-selector').val());
			var title =  $.trim($('#xepan-creator-dynamic-title').val());
			var attribute =  $.trim($('#xepan-creator-dynamic-attribute').val());
			var additional =  $.trim($('#xepan-creator-dynamic-additional').val());
			
			if(!selector.length){
				var form_group = $('#xepan-creator-dynamic-selector').closest('.form-group');
				$(form_group).addClass('has-error');
				$('<p class="xepan-creator-form-error-text text-danger">must not be empty</p>').appendTo($(form_group));
				return;
			}

			if(!title.length){
				var form_group = $('#xepan-creator-dynamic-title').closest('.form-group');
				$(form_group).addClass('has-error');
				$('<p class="xepan-creator-form-error-text text-danger">must not be empty</p>').appendTo($(form_group));
				return;
			}

			if(!attribute.length){
				var form_group = $('#xepan-creator-dynamic-attribute').closest('.form-group');
				$(form_group).addClass('has-error');
				$('<p class="xepan-creator-form-error-text text-danger">must not be empty</p>').appendTo($(form_group));
				return;
			}

			var str = selector+'|'+title+'|'+attribute+'|'+additional;

			$('#xepan-creator-dynamic-selector').val("");
			$('#xepan-creator-dynamic-title').val("");
			$('#xepan-creator-dynamic-attribute').val("");
			$('#xepan-creator-dynamic-additional').val("");

			self.addDynamicOptionToList(str.trim('|'));
		});

		// if(this.isExistingComponent()){
			// reload values or create required run time components
		// }

		// error wrapper removed
		$('.form-group input').keyup(function(event) {
			$(this).closest('.form-group').removeClass('has-error');
			$(this).closest('.form-group').find('p.xepan-creator-form-error-text').remove();
		});

		$('.form-group select').change(function(event) {
			$(this).closest('.form-group').removeClass('has-error');
			$(this).closest('.form-group').find('p.xepan-creator-form-error-text').remove();
		});
	},

	addDynamicOptionToList: function(dynamic_option){

		option_array = dynamic_option.split('|');
		var selector = option_array[0];
		var title = option_array[1];
		var attribute = option_array[2];
		var additional = option_array[3];
		if( additional == undefined){
			additional = "";
			dynamic_option = dynamic_option.trim('|');
		}

		var html = '<div class="row xepan-creator-existing-dynamic-list-added" data-dynamic-option="'+dynamic_option+'">'+
									'<div class="col-md-4">'+
										'<div class="form-group">'+
											// '<label for="xepan-creator-dynamic-selector" class="control-label">Selector:</label>'+
											'<input disabled class="form-control" id="xepan-creator-dynamic-selector" value="'+selector+'">'+
										'</div>'+
									'</div>'+
									'<div class="col-md-2">'+
										'<div class="form-group">'+
											// '<label for="xepan-creator-dynamic-title" class="control-label">Title:</label>'+
											'<input disabled class="form-control" id="xepan-creator-dynamic-title" value="'+title+'">'+
										'</div>'+
									'</div>'+
									'<div class="col-md-2">'+
										'<div class="form-group">'+
											// '<label for="xepan-creator-dynamic-attribute" class="control-label">Attribute:</label>'+
											'<input disabled class="form-control" id="xepan-creator-dynamic-attribute" value="'+attribute+'">'+
										'</div>'+
									'</div>'+
									'<div class="col-md-2">'+
										'<div class="form-group">'+
											// '<label for="xepan-creator-dynamic-additional" class="control-label">Additional:</label>'+
											'<input disabled class="form-control" id="xepan-creator-dynamic-additional" value="'+additional+'">'+
										'</div>'+
									'</div>'+
									'<div class="col-md-2 dynamic-option-remove-wrapper">'+
									'</div>'+
								'</div>';
		record_row =  $(html).appendTo($('#xepan-creator-existing-dynamic-list'));

		$('<button class="btn btn-danger btn-block" id="xepan-creator-dynamic-option-remove-btn">Remove</button>')
			.appendTo($(record_row).find('.dynamic-option-remove-wrapper'))
			.click(function(event) {
				$(this).closest('.row').remove();
			});
	}

});