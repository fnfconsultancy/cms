/*

tag as text in also attribute ... replace at the time of saveBack
adding tag as text should see if tag is a leaf in tree

*/



current_selected_dom = 0;
current_selected_tree_node = 0;
current_selected_tree_node_dom=undefined;
current_selected_tree_node_dom_4_server=undefined;
current_selected_dom_of_code_change = 0;
current_selected_dom_original_html = "";
current_selected_dom_component_type = undefined;
repitative_selected_dom = 0;
current_selected_tag_dom = 0;
tags_associate_list = [];
selection_previous_dom=[];

jQuery.widget("ui.xepanComponentCreator",{
	options:{
		base_url:undefined,
		file_path:undefined,
		template_file:undefined,
		template:undefined,
		template_editing:undefined,
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

		// filter_selector = ".xepan-page-wrapper *";
		// if(self.options.template_editing)
		// 	filter_selector = 'body *';

		filter_selector = ".xepan-v-body *";

		var myDomOutline = DomOutline({
			'onClick': function(element){
				current_selected_dom = element;

				var xepan_component_of_dom = $(current_selected_dom).closest('[xepan-component]').attr('xepan-component');
				// check if component is server side
				if(self.isComponentServerSide(xepan_component_of_dom)){
					var r = confirm("this is part of server side component, we are selecting it");
					if (r == true) {
						current_selected_dom = $(current_selected_dom).closest('[xepan-component]');
					}
					if(r == false)
						return;
				}

				// check here text and server side component
				if($(current_selected_dom).closest('.xepan-editable-text').length){
					var r = confirm("this is part of editable text, selecting parent component");
					if (r == true) {
						current_selected_dom = $(current_selected_dom).closest('.xepan-editable-text');
					}
					if(r == false)
						return;
				}

				// check if selected dom is img for existing image component

				if($(current_selected_dom).closest('[xepan-component="xepan/cms/Tool_Image"]').length){
					var r = confirm("This is image of existing Image Tool, selecting 'Image' component");
					if (r == true) {
						current_selected_dom = $(current_selected_dom).closest('[xepan-component="xepan/cms/Tool_Image"]');
					}
					if(r == false)
						return;
				}
				self.createEditor();
				self.updateJsTreeBlock(current_selected_dom);
				self.manageDomSelected();
			
			},
			filter:filter_selector
		});

		$('#xepan-tool-inspector').click(function(){
			myDomOutline.start();
			return false;
		});

		// myDomOutline.stop();
	},

	createEditor: function(){
		var self = this;

		current_selected_dom_original_html = $(current_selected_dom).prop('outerHTML');
		
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
      								'<div class="xepan-creator-top-bar">'+
      								'</div>'+
      							'</div>'+
      							'<div class="modal-footer">'+
        							'<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>'+
        							'<button type="button" class="btn btn-primary" id="xepan-component-creator-form-save">Save changes</button>'+
      							'</div>'+
    						'</div>'+
  						'</div>'+ 
					'</div>';

		self.$form = $(form_layout).appendTo('body');
		self.$form.modal('toggle');

		self.form_body = self.$form.find('.modal-body');
		self.form_footer = self.$form.find('.modal-footer');

		// selection
		selection_group = $('<div class="btn-group btn-group-xs"></div>').appendTo($('.xepan-creator-top-bar'));

		$('<button class="btn btn-primary" id="xepan-creator-reselection"><i class="fa fa-arrows"></i>Selection</button>').appendTo($(selection_group));
		// var selection_parent = $('<button id="xepan-creator-current-dom-select-parent" type="button" title="Parent" class="btn btn-default"><i class="fa fa-arrow-up"></i></button>').appendTo($(selection_group));
		// var selection_previous = $('<button id="xepan-creator-current-dom-select-previous" type="button" title="Previous" class="btn btn-default" style="display:none"><i class="fa fa-arrow-down"></i></button>').appendTo($(selection_group));
		// var selection_child = $('<button id="xepan-creator-current-dom-select-child" type="button" title="Child/Next" class="btn btn-default"><i class="fa fa-arrow-down"></i></button>').appendTo($(selection_group));
		// var selection_previous_sibling = $('<button id="xepan-creator-current-dom-select-previous-sibling" type="button" title="Previous Sibling" class="btn btn-default"><i class="fa fa-arrow-left"></i></button>').appendTo($(selection_group));
		// var selection_next_sibling = $('<button id="xepan-creator-current-dom-select-next-sibling" type="button" title="Next Sibling" class="btn btn-default"><i class="fa fa-arrow-right"></i></button>').appendTo($(selection_group));

		$(selection_group).click(function(event) {
			$('#xepan-component-creator-form').remove();
			$('.modal-backdrop').remove();
			$('#xepan-tool-inspector').trigger('click');
		});

		// $(selection_parent).click(function(event){
		// 	selection_previous_dom.push($(current_selected_dom));
		// 	current_selected_dom = $(current_selected_dom).parent()[0];
		// 	self.manageDomSelected();
		// });

		// $(selection_previous).click(function(event){
		// 	current_selected_dom = selection_previous_dom.pop()[0];
		// 	$(selection_parent).show();
		// 	self.manageDomSelected();
		// });

		// if($(current_selected_dom).parent('.xepan-page-wrapper').length){
		// 	$(selection_parent).hide();
		// }

		// if(selection_previous_dom.length > 0 ) 
		// 	$(selection_previous).show();
		// else
		// 	$(selection_previous).hide();

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


		$type_select =  $(type_select_layout).appendTo($('.xepan-creator-top-bar'));
		
		// add move section
		// self.addMoveToTemplate();

		// save button called
		$('#xepan-component-creator-form-save').click(function(event) {
			// on server side component create related UI
			// alert('ready ???');
			tree_data = ($('#xepan-component-creator-js-tree').jstree(true).get_json('#'));

			self.saveBackToDom(tree_data[0]);

			$(tree_data[0].data.element).find('img.xepan-component').each(function(index,img){
				if(!$(this).parent('span.xepan-component').length){
					$span_img_wrapper = $('<span class="xepan-component">');
					$span_img_wrapper.attr('xepan-component-name',$(this).attr('xepan-component-name'));
					$span_img_wrapper.attr('xepan-component',$(this).attr('xepan-component')); 
				    $(this).wrap($span_img_wrapper);
				}
				$(this).removeAttr('xepan-component');
				$(this).removeAttr('xepan-component-name');
				$(this).removeClass('xepan-component');
			});
			// serverside component wrap in a div and take all REQUIRED attributes from element and place as outer div
			$(tree_data[0].data.element).find('.xepan-serverside-component').andSelf().each(function(index, el) {
		        if(!$(this).hasClass('xepan-serverside-component')) return; //actually continue 
		        // senitize server side component
		        $(this).find('.xepan-component,.xepan-editable-text,.xepan-serverside-component,.xepan-sortable-component').removeClass('xepan-component xepan-serverside-component xepan-editable-text xepan-sortable-component');

				// <div class="xepan-component xepan-serverside-component" xepan-component-name="'.$tool_name.'" xepan-component="'.str_replace('\\', '/', get_class($t_v)).'">' .$t_v->getHTML(). '</div>
				$server_side_div = $('<div class="xepan-component xepan-serverside-component">');
				$server_side_div.attr('xepan-component-name',$(this).attr('xepan-component-name'));
				$server_side_div.attr('xepan-component',$(this).attr('xepan-component')); 
			    $(this).wrap($server_side_div);
				$(this).removeAttr('xepan-component');
				$(this).removeAttr('xepan-component-name');
				$(this).removeClass('xepan-component xepan-serverside-component');
				// add template attributes
			    $(this).attr('id','{$_name}');
			    $(this).addClass('{$class}');
			    if(typeof($(this).attr('style')) != "undefined")
			    	$(this).attr('style','{$style} '+$(this).attr('style'));
			    else
			    	$(this).attr('style','{$style} ');

			    if(typeof($(this).attr('no-record-found-message')) != "undefined"){
			    	$not_found_str = '<not_found is-xepan-tag="{not_found}" ><div class="alert alert-danger">{not_found_message}'+$(this).attr('no-record-found-message')+'{/}</div></not_found>';
			    	$(this).append($not_found_str);
			    }
			    if(typeof($(this).attr('add-paginator-spot')) != "undefined" && $(this).attr('add-paginator-spot') == "true"){
			    	$paginator_str = '<Paginator is-xepan-tag="{Paginator}" ></Paginator>';
			    	$(this).append($paginator_str);
			    }

				xepan_tag_list=[];
				
				$(this).find('[is-xepan-tag]').andSelf().each(function(index, el) {
			        if(typeof($(this).attr()) == "undefined") return ; //actually continue
					xepan_tag_list.push($(this).attr('is-xepan-tag'));
				});

				component_string = $(this).prop('outerHTML');
				// console.log('BEFORE'+component_string);
				$.each(xepan_tag_list, function(index, tagstr) {
					if(typeof(tagstr) == "undefined") return; //actually continue
					tagstr = tagstr.replace(/{/,'').replace(/}/,'');
					component_string =  component_string.replace(new RegExp('<'+tagstr+'\\s+[^>]+>', "gi"), "{"+tagstr+"}");
					component_string = component_string.replace(new RegExp('<\/'+tagstr+'>', "gi"), "{/"+tagstr+"}");
				});
				// console.log('AFTER'+component_string);


				$.ajax({
					url :'index.php?page=xepan_cms_overridetemplate&cut_page=1',
					type: 'POST',
					data: {
						'xepan-tool-to-clone':$server_side_div.attr('xepan-component'),
						'template_html': component_string
					},
					async:false,
					success: function(json){
						// console.log(json);
						var result = $.parseJSON(json);
						if(result.status != "success"){
							$.univ().errorMessage('Not Saved');
							return;
						}

						$(el).parent().html('PLEASE SAVE AND RELOAD');
											
						$.univ().successMessage('Saved');
					}
				});			
				

			$('#xepan-component-creator-form').remove();
			$('#xepan-component-creator-code-form').remove();
			$('.modal-backdrop').remove();


			});

			$.univ().successMessage('Please save and Reload');
			// $('#xepan-component-creator-form').modal('close');
			$('#xepan-component-creator-form').remove();
			$('.modal-backdrop').remove();
		});

		// append component wrapper
		$('<div id="xepan-component-js-tree-view-wrapper" style="overflow:auto"></div>').appendTo($(self.form_body));
		$('<div id="xepan-component-creator-type-wrapper"></div>').appendTo($(self.form_body));
	},

	putBackJsTreeNode: function(jQObj,node){
		if(typeof(node) === "undefined" ) node = current_selected_tree_node;
		if(typeof(jQObj) === "undefined" ) jQObj = current_selected_tree_node_dom;
		$('#'+node.id+' > a').contents()[1].nodeValue = $(jQObj).prop('outerHTML').replace(/<\/\S+>$/,'');
		current_selected_tree_node_dom = $($(jQObj).prop('outerHTML'));
		if(typeof($(jQObj).prop('outerHTML')) == "undefined")
			current_selected_tree_node.text = $(jQObj).html();
		else
			current_selected_tree_node.text = $(jQObj).prop('outerHTML').replace(/<\/\S+>$/,'').replace(/</,'&lt;').replace(/>/,'&gt;');
	},

	updateJsTreeBlock: function (element){
		var self = this;

		jstree_wrapper = $('<div id="xepan-component-creator-js-tree">JS TREE HERE</div>').appendTo($('#xepan-component-js-tree-view-wrapper'));
		$(jstree_wrapper).on("changed.jstree", function (e, data) {
			
			var selected_treenode = data.instance.get_selected(true);
			current_selected_tree_node = selected_treenode[0];
			current_selected_tree_node_dom = $($('#'+selected_treenode[0].id + '> a').text());

						
			if($('li a:contains("xepan-serverside-component"):contains("xepan-component")').closest('li').find('#'+current_selected_tree_node.id).length){
				var temp_string = $('#'+selected_treenode[0].id + '> a').text();
				current_selected_tree_node_dom = $($('#'+current_selected_tree_node.id).closest('li:contains("xepan-serverside-component"):contains("xepan-component")').find('a').first().text());
				self.manageDomSelected();
				current_selected_tree_node_dom = $(temp_string);
				return;
			}
			
			// current_selected_tree_node_dom.addClass('xepan-component');
			// self.putBackJsTreeNode();
			if(selected_treenode[0].data.element !== false){
				current_selected_dom = $(selected_treenode[0].data.element);
				self.manageDomSelected();
			}
		    // console.log(data.instance.get_selected(true)); // newly selected
		    // console.log(data.changed.selected); // newly selected
		    // console.log(data.changed.deselected); // newly deselected
		    }).jstree({
				'core':{
					'check_callback': true,
					'dataType':'json',
					'data': self.getJsTreeData($(element)),
					"multiple" : false
				},
				'plugins': ['wholerow','changed','contextmenu']
			});
	},

	getJsTreeData: function(node){
		var self = this;
		var data=[];
		$.each($(node), function(index, $obj) {
		    
		    var temp;
		    if($($obj).children().length == 0 && $($obj).text()){
		    	temp = false;//[{id: generateUUID(),text:$($obj).text(), children: false ,icon:'fa fa-file', data:{element:false}}];
		    }else{
		    	temp = self.getJsTreeData($($obj).children());
		    }

			var attrs = "";
		    $.each( $obj.attributes, function ( index, attribute ) {
		        attrs += (" "+attribute.name +"=\""+ attribute.value+"\"");
		    });

		    if(!temp && $($obj).text()){
		    	attrs += (" xepan-contains=\"" + $($obj).text()+"\"");
		    }

		    icon = null;
		    if($($obj).hasClass('xepan-component')) icon='fa fa-cog';
		    else if($($obj).closest('xepan-component').length) icon='fa fa-arrow-alt-circle-up';

		    data.push({id: generateUUID(),text:'&lt;'+ $obj.tagName.toLowerCase() + ' ' + attrs +'&gt;', children: temp, data:{element: $obj}, icon: icon});
		    
		});

		return data;
	},

	manageDomSelected: function () {
		var self = this;
		// create Base UI // component type only infact
		// filter types like if rows and bootstrap col-md/sd etc is there let column Type be there or remove

		
		
		current_selected_dom_component_type = $(current_selected_tree_node_dom).attr('xepan-component')?$(current_selected_tree_node_dom).attr('xepan-component'):'Generic';
		// console.log(current_selected_dom_component_type);
		// html code 
		// current_selected_dom_html = '<textarea class="form-control" style="width:100%;" rows="4" disabled></textarea>';
		// html_textarea = $(current_selected_dom_html).appendTo($(form_body));
		// $(html_textarea).val($(current_selected_dom).prop('outerHTML'));

		// jstree instead html code 
		

		// console.log(self.getJsTreeData($(current_selected_dom)));
		

		

		// $(self.selection_next_sibling).click(function(event){
		// 	ctrlShiftRightSelection(event);
		// });

		// $(self.selection_parent).click(function(event) {
		// 	ctrlShiftUpSelection(event);
		// });

		// $(self.selection_child).click(function(event){
		// 	tabSelection(event);
		// });

		

		self.handleComponentTypeChange(current_selected_dom_component_type);
		$type_select.change(function(event) {
			if($(this).val() !== "Generic") {
				$(current_selected_tree_node_dom).addClass('xepan-component');
				if(self.isComponentServerSide($('#xepan-component-creator-component-type-selector').val())){
					$(current_selected_tree_node_dom).addClass('xepan-serverside-component');
					$(current_selected_tree_node_dom).attr('no-record-found-message','no record found');
					$(current_selected_tree_node_dom).attr('add-paginator-spot','true');
				}else{
					$(current_selected_tree_node_dom).removeClass('xepan-serverside-component');
					$(current_selected_tree_node_dom).removeAttr('no-record-found-message');
					$(current_selected_tree_node_dom).removeAttr('add-paginator-spot');
				}
			}else{
				$(current_selected_tree_node_dom).removeClass('xepan-component');
				$(current_selected_tree_node_dom).removeClass('xepan-serverside-component');
			}



			$(current_selected_tree_node_dom).attr('xepan-component',$(this).val());
			$(current_selected_tree_node_dom).attr('xepan-component-name',$(this).val().replace(/\//g, ""));
			self.putBackJsTreeNode();
			current_selected_dom_component_type = $(this).val();
			self.handleComponentTypeChange($(this).val());
		});
		$type_select.val(current_selected_dom_component_type);
	},

	saveBackToDom: function(obj){
		var self = this;

		if(typeof(obj) == 'undefined'){
			// console.log('undefined');
			// console.log(obj);
			return;
		}

		temp_jq_obj= $($('#'+obj.id+' > a').text());

		if(typeof(temp_jq_obj[0]) != "undefined" && typeof(temp_jq_obj[0].attributes) != "undefined"){
			$.each(temp_jq_obj[0].attributes, function(index, at) {
				if(typeof(at) !== 'undefined'){
					switch(at.name){
						case 'xepan-contains':
							$(obj.data.element).text(at.value)
							$(obj.data.element).attr(at.name,at.value);
							break;
						case 'xepan-serverside-component-wrappers':
							if(at.value == '{repetative_section}'){
								t = '<rows is-xepan-tag="{rows}"><row is-xepan-tag="{row}">';
							}else{
								t = at.value.replace('{',"");
								t = t.replace('}',"");
								t = t.replace('$','');
								t = '<'+ t +' is-xepan-tag="{'+t+'}">';
							}
							$(obj.data.element).wrap(t);
							break;
						default:
							$(obj.data.element).attr(at.name,at.value);
					}
				}
			});
		}
		

		if(typeof(obj.children) != "undefined" && obj.children != false){
			$.each(obj.children, function(index, obj) {
				 self.saveBackToDom(obj);
			});
		}

		temp_jq_obj = null;
		// wrapper changes outerHTML and all related elements are no more referenced they are created new 
		// so make this happen after everything on replated element is done
		// setInterval(function(){
		// 	$('#'+ obj.id +'> a:contains("xepan-serverside-component-wrappers")').each(function(index, o) {
		// 		o = $(o).closest('li');
		// 		console.log(o);
		// 		$.each(o[0].attributes, function(index, at) {
		// 			if(typeof(at) !== 'undefined'){
		// 				console.log(at);
		// 				switch(at.name){
		// 					case 'xepan-serverside-component-wrappers':
		// 						if(at.value=='{repetative_section}'){
		// 							$(o.data.element).prop('outerHTML','{rows}{row}'+$(o.data.element)[0].outerHTML+'{/row}{/rows}');
		// 						}
		// 						break;
		// 				}
		// 			}
		// 		});
		// 	});
		// },2000);

	},

	

	saveClientSideComponent: function(){

		switch(current_selected_dom_component_type){
			case 'xepan/cms/Tool_Image':
				$(current_selected_dom).wrap('<span class="xepan-component" xepan-component="xepan/cms/Tool_Image" xepan-component-name="Image"></span>');
				$.univ().infoMessage('saved and reload page');
				// $('#xepan-component-creator-form').modal('close');
				$('#xepan-component-creator-form').remove();
				$('.modal-backdrop').remove();
				return;
			case 'xepan/cms/Tool_Icon':
			// i.xepan-component.xepan-cms-icon.text-center.fa.fa-leaf(id="{$_name}" xepan-component='xepan/cms/Tool_Icon' icon-link-target="none" icon-class="fa-leaf" icon-size="fa-1x" icon-link="#" icon-align="text-center" style="width:100%;" xepan-component-name="Icon")
				$(current_selected_dom)
					.addClass('xepan-component')
					.attr({
						'xepan-component'	: 'xepan/cms/Tool_Icon',
						'icon-link-target'	: 'none',
						'icon-size'			: "fa-1x",
						'icon-link'			: "#",
						'icon-align'		: "text-center",
						'icon-class'		:"fa-leaf",
						'xepan-component-name': "Icon"
					});
				var classNames = $(current_selected_dom).attr("class").toString().split(' ');
		        $.each(classNames, function (i, className) {
		            if(className.match(/fa-/i)){
		            	$(current_selected_dom).attr('icon-class', className);
		            }
		        });
				$('#xepan-component-creator-form').remove();
				$('.modal-backdrop').remove();
				return;
		}

		// xepan component 
		if($('#xepan-cmp-creator-xepan-component:checked').size() > 0)
			$(current_selected_dom).addClass('xepan-component');
		else
			$(current_selected_dom).removeClass('xepan-component');

		// xepan sortable component 
		if($('#xepan-cmp-creator-xepan-sortable-component:checked').size() > 0)
			$(current_selected_dom).addClass('xepan-sortable-component');
		else
			$(current_selected_dom).removeClass('xepan-sortable-component');

		// xepan editable text
		if($('#xepan-cmp-creator-xepan-editable-text:checked').size() > 0){
			$(current_selected_dom).addClass('xepan-editable-text');
		}else
			$(current_selected_dom).removeClass('xepan-editable-text');
		
		// no richtext
		if($('#xepan-cmp-creator-xepan-no-richtext:checked').size() > 0)
			$(current_selected_dom).addClass('xepan-no-richtext');
		else
			$(current_selected_dom).removeClass('xepan-no-richtext');

		// no move
		if($('#xepan-cmp-creator-xepan-no-move:checked').size() > 0)
			$(current_selected_dom).addClass('xepan-no-move');
		else
			$(current_selected_dom).removeClass('xepan-no-move');

		// no delete
		if($('#xepan-cmp-creator-xepan-no-delete:checked').size() > 0)
			$(current_selected_dom).addClass('xepan-no-delete');
		else
			$(current_selected_dom).removeClass('xepan-no-delete');

		// component name
		if($('#xepan-cmp-creator-component-name').val().length){
			$(current_selected_dom).attr('xepan-component-name',$('#xepan-cmp-creator-component-name').val());
		}else{
			$(current_selected_dom).attr('xepan-component-name','Generic');
		}

		// dynamic options lister
		if($('#xepan-cmp-creator-dynamic-list-selector').val().length){
			$(current_selected_dom).attr('xepan-component-dynamic-option-list',$('#xepan-cmp-creator-dynamic-list-selector').val());
		}else
			$(current_selected_dom).removeAttr('xepan-component-dynamic-option-list');

		// remove selector
		// if($('#xepan-cmp-creator-selector-to-remove-before-save').val().length){
		// 	$(current_selected_dom).attr('xepan-selector-to-remove-before-save',$('#xepan-cmp-creator-selector-to-remove-before-save').val());
		// }else
		// 	$(current_selected_dom).removeAttr('xepan-selector-to-remove-before-save');

		// run jquery code
		// if($('#xepan-cmp-creator-code-run-before-save').val().length){
		// 	$(current_selected_dom).attr('xepan-cmp-creator-code-run-before-save',$('#xepan-cmp-creator-code-run-before-save').val());
		// }else
		// 	$(current_selected_dom).removeAttr('xepan-cmp-creator-code-run-before-save');

		// dynamic option list
		var find_str = "xepan-dynamic-option-";

		if(current_selected_dom.attributes != undefined){
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
		}

		$.univ().infoMessage('saved and reload page');
		// $('#xepan-component-creator-form').modal('close');
		$('#xepan-component-creator-form').remove();
		$('.modal-backdrop').remove();

	},
	saveServerSideComponent: function(){
		// code-editor form modal removed

		if($.inArray('{rows}',self.tags) && !$(repitative_selected_dom).length){
			$.univ().errorMessage('first select repitative section');
			return;
		}
		
		$('#xepan-component-creator-code-form').remove();
		$('.modal-backdrop').remove();

		$('*').removeClass('xepan-component-creator-extra-margin');

		if($(repitative_selected_dom).length){
		
			var repetative_orig_html = $(repitative_selected_dom).prop('outerHTML');

			$(repitative_selected_dom).siblings().remove();
			// console.log('siblings: ',$(repitative_selected_dom).siblings());

			row_html = "{rows}{row}"+repetative_orig_html+"{\/}{\/}";

			// not found message
			var no_message = $('#xepan-cmp-creator-not-found-message').val();
			row_html += '{not_found}<div role="alert" class="full-width alert alert-warning"><strong class="glyphicon glyphicon-warning-sign">&nbsp;Warning!<span>&nbsp;{not_found_message}'+no_message+'{\/}</span></strong></div>{\/}';

			// paginator tags
			if($('#xepan-cmp-creator-add-paginator:checked').size() > 0)
				row_html += "{paginator_wrapper}{$Paginator}{\/}";

			$(repitative_selected_dom).prop('outerHTML', row_html);
			$('#xepan-creator-repitative-html').val($(repitative_selected_dom).prop('outerHTML'));
			// $(repitative_selected_dom).html(repetative_orig_html);
		}

		$(current_selected_dom).removeClass('xepan-component-hover-selector');
		$(current_selected_dom).find('.xepan-component-hoverbar').remove();

		if($(current_selected_dom).attr('xepan-component')){
			var template_html = $(current_selected_dom).html();
		}else{
			var template_html = $(current_selected_dom).prop('outerHTML');
		}
		
		template_html = $(template_html);
		$(template_html).attr('id','{$_name}');
		$(template_html).addClass('{$class}');
		$(template_html).attr('style', $(template_html).attr('style')+" {$style}");

		template_html = $(template_html).prop('outerHTML');

		// open new modal popup
		var code_editor_form = '<div id="xepan-component-creator-code-form" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="xepan-component-creator">'+
  						'<div class="modal-dialog" role="document">'+
    						'<div class="modal-content">'+
      							'<div class="modal-header">'+
        							'<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>'+
        							'<h4 class="modal-title" id="gridSystemModalLabel">Epan Component Creator Code Editor</h4>'+
      							'</div>'+
      							'<div class="modal-body">'+
      							'</div>'+
      							'<div class="modal-footer">'+
        							'<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>'+
        							'<button type="button" class="btn btn-primary" id="xepan-component-creator-code-editor-form-save">Save</button>'+
      							'</div>'+
    						'</div>'+
  						'</div>'+ 
					'</div>';

		$code_form = $(code_editor_form).appendTo('body');
		$code_form.modal('show');

		var code_field = $('<textarea id="xepan-component-creator-layout-code" style="width:100%;height:400px"></textarea>').appendTo($code_form.find('.modal-body'));
		$(code_field).val(template_html);
		$(code_field).ace({'width':'100%'});

		$('#xepan-component-creator-code-editor-form-save').click(function(event) {
			template_html = $('#xepan-component-creator-layout-code').val();
			$.ajax({
				url :'index.php?page=xepan_cms_overridetemplate&cut_page=1',
				type: 'POST',
				data: {
					'xepan-tool-to-clone':current_selected_dom_component_type,
					'template_html': template_html
				},
				async:false,
				success: function(json){
					// console.log(json);
					var result = $.parseJSON(json);
					if(result.status != "success"){
						$.univ().errorMessage('Not Saved');
						return;
					}

					if($(current_selected_dom).attr('xepan-component') == undefined){
						current_selected_dom.outerHTML = '<div class="xepan-component xepan-serverside-component" xepan-component="'+current_selected_dom_component_type+'">PLEASE SAVE AND RELOAD</div>';
					}
										
					// $(current_selected_dom).html(current_selected_dom_original_html);
					// current_selected_dom = 0;
					current_selected_dom_original_html = "";
					current_selected_dom_component_type = undefined;
					repitative_selected_dom = 0;
					current_selected_tag_dom = 0;
					tags_associate_list = [];
					$.univ().successMessage('Saved');

					$('#xepan-component-creator-form').remove();
					$('#xepan-component-creator-code-form').remove();
					$('.modal-backdrop').remove();
				}
			});			
		});
		return;
		// $.univ().frameURL('Override Tool Template');

		

	},

	addToTagList: function(tag_name,dom_obj,implement_as){

		var self = this;

		if(tag_name.indexOf('$') > 0){
			tag_name_with_dollar = tag_name;
			tag_name_without_dollar = tag_name.replace('$',"");
		}else{
			tag_name_with_dollar = tag_name.replace('{','{$');
			tag_name_without_dollar = tag_name;
		}

		switch(implement_as){
			case 'href':
				$(dom_obj).attr('href',tag_name_with_dollar);
			break;

			case 'src':
				$(dom_obj).attr('src',tag_name_with_dollar);
			break;
				
			case 'text':
				$(dom_obj).attr('xepan-contains',tag_name_with_dollar);
			break;

			case 'wrapper':
			 	$(dom_obj).attr('xepan-serverside-component-wrappers', tag_name_without_dollar);
			break;

			case 'class':
				$(dom_obj).addClass(tag_name_with_dollar);
			break;

			// case 'style':
			// 	$(dom_obj).css(tag_name_with_dollar);
			break;
		}

		self.putBackJsTreeNode();
		// console.log("dom obj:",$(dom_obj));
		// console.log("dom obj html:",$(dom_obj).prop('outerHTML'));
	},

	handleComponentTypeChange: function(tool_name){
		var self = this;
		$('#xepan-component-creator-type-wrapper').html("");
		// console.log('#xepan-component-creator-type-wrapper empty');
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

		// console.log('checking if serverside ' + tool_name);

		var is_serverside = false;
		if(tool_name=='Generic') return false;
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

		// get Original File Code
		// get Overrided File Code
		// set in Tabs or any poper UI
		// create rest of UI 
		// populate tags related UI
		// if(this.isServerSideComponent()){
			// reload values or create required run time components
		// }

		$creator_wrapper = $('#xepan-component-creator-type-wrapper');
		$('<div class="alert alert-info"> Server Side Component</div>').appendTo($creator_wrapper);

		var row = $('<div class="row">').appendTo($creator_wrapper);
		var col1 = $('<div class="col-lg-6 col-md-6 col-sm-12 col-xs-12"><h4>Original HTML</h4></div>').appendTo($(row));
		// var col2 = $('<div class="col-lg-6 col-md-6 col-sm-12 col-xs-12"><h4>Override HTML</h4></div>').appendTo($(row));
		var col3 = $('<div class="col-lg-6 col-md-6 col-sm-12 col-xs-12"></div>').appendTo($(row));
	
		$('<label>Existing Applied Template Code</label>').appendTo($(col3));
		var original_template_textarea = $('<textarea id="xepan-tool-original-template">').appendTo($(col3));
		// var override_template_textarea = $('<textarea id="xepan-tool-override-template">').appendTo($(col2));
		// var original_tags = $('<textarea id="xepan-tool-original-template-tags">').appendTo($(col1));
		self.original_template_tags = [];

		$.ajax({
			url :'index.php?page=xepan_cms_overridetemplate&cut_page=1',
			data: {
				'xepan-tool-to-clone':current_selected_dom_component_type,
				required: 'htmlcode'
			},
			async:false,
			success: function(json){
				return_data = $.parseJSON(json);
				$(original_template_textarea).val(return_data.original_content);
				var tags = return_data.tags[0];
				// $(original_tags).val(tags);
				self.original_template_tags = tags;
			}
		});

		// $(override_template_textarea).val($(current_selected_dom).html());

		// if original template file contains {Rows} 
		/*
		{
			make a dom_selector (title- Repetitive block){
				on select/click{
					set variable current_selected_dom_repititve_dom = Selected one
				}
				make parent selector or code shower etc ...
			} 
		 }
		
		make dom_selector (title - set tag)
		on select dom {
			tag_dom_array[next] = selected one
			create short form for this dom
			[selector] [tags list dropdown] [as/href/src/text/wrapper] [remove btn]
		}

		create no recrod found message
		and paginator spot

		====== ON SAVE ====
		 */
		if($.inArray('{rows}',self.tags)){
			$('<h4>Repetative Selector</h4>').appendTo($(col3));
			repetative_btn_group = $('<div class="btn-group btn-group-xs"></div>').appendTo($(col3));
			// $('<button class="btn btn-primary">Selection</button>').appendTo($(repetative_btn_group));
			// var repetative_dom_selector = $('<button id="xepan-creator-repitative-dom-selector" type="button" title="Repetitive Dom Selector" class="btn btn-warning"><i class="fa fa-arrows"></i></button>').appendTo($(repetative_btn_group));
			// var repetative_selection_parent = $('<button id="xepan-creator-repitative-select-parent" type="button" title="Parent" class="btn btn-default"><i class="fa fa-arrow-up"></i></button>').appendTo($(repetative_btn_group));
			// var repetative_html = $('<textarea id="xepan-creator-repitative-html">').appendTo($(col3));
			
			// initialize dom object
			// var repitativeDomOutline = DomOutline({
			// 	'onClick': function(element){
			// 		repitative_selected_dom = element;

			// 		// extra padding
			// 		if($('#xepan-cmp-creator-add-extra-padding:checked').size() > 0)
			// 			$(repitative_selected_dom).addClass('xepan-component-creator-extra-margin');
			// 		else
			// 			$(repitative_selected_dom).removeClass('xepan-component-creator-extra-margin');

			// 		$('#xepan-component-creator-form').modal('show');
			// 		$('#xepan-creator-repitative-html').val($(repitative_selected_dom).prop('outerHTML'));
			// 	}
			// });
			// // repetative dom selector
			// $(repetative_dom_selector).click(function(){
			// 	$('#xepan-component-creator-form').modal('hide');
			// 	repitativeDomOutline.start();
			// 	return false;
			// });

			// // parent selection
			// $(repetative_selection_parent).click(function(event) {
			// 	repitative_selected_dom = $(repitative_selected_dom).parent();
			// 	$('#xepan-creator-repitative-html').val($(repitative_selected_dom).prop('outerHTML'));
			// });

			// no record found message
			$('<label for="xepan-cmp-creator-not-found-message">No Record Found Message</label><br/><input id="xepan-cmp-creator-not-found-message" value="Not Matching Record Found" />').appendTo($(col1));
			$no_record_message = $('#xepan-cmp-creator-not-found-message').val($(current_selected_tree_node_dom).attr('no-record-found-message'));
			$($no_record_message).change(function(){
				$(current_selected_tree_node_dom).attr('no-record-found-message',$(this).val());
				self.putBackJsTreeNode();
			});

			// add paginator section here if {rows}{row} has then pagination is must
			$('<br/><input type="checkbox" id="xepan-cmp-creator-add-paginator" checked /><label for="xepan-cmp-creator-add-paginator"> Add Paginator</label><br/>').appendTo($(col1));
			$add_paginator = $('#xepan-cmp-creator-add-paginator').val($(current_selected_tree_node_dom).val());
			$($add_paginator).change(function(){
				if(this.checked) {
					$(current_selected_tree_node_dom).attr('add-paginator-spot',true);
				}else
					$(current_selected_tree_node_dom).removeAttr('add-paginator-spot');

				self.putBackJsTreeNode();
			});

			// add extra padding for selection
			// var extra_padding = $('<input type="checkbox" id="xepan-cmp-creator-add-extra-padding" checked /><label for="xepan-cmp-creator-add-extra-padding"> Add Extra Padding For Selection</label>').appendTo($(col3));
			// $('#xepan-cmp-creator-add-extra-padding').change(function(event) {
			// 	if(!$(repitative_selected_dom).length){
			// 		$.univ().errorMessage('first select repatative ');
			// 		return;
			// 	}
			// 	if(this.checked) {
			// 		$(repitative_selected_dom).addClass('xepan-component-creator-extra-margin');
			// 	}else
			// 		$(repitative_selected_dom).removeClass('xepan-component-creator-extra-margin');
			// });
		}

		var tag_implementor_wrapper = $('<div class="xepan-tag-implementor-wrapper"></div>').prependTo($(col1));
		$('<label>Implement Tags</label>').prependTo($(col1));
		$('<div id="xepan-creator-implement-tag-wrapper"></div>').appendTo($(col1));
		// $('<button class="btn btn-primary">Selection</button>').appendTo($(tag_implementor_wrapper));
		// var tag_dom_selector = $('<button id="xepan-creator-tag-dom-selector" type="button" title="Repetitive Dom Selector" class="btn btn-warning"><i class="fa fa-arrows"></i></button>').appendTo($(tag_implementor_wrapper));

		// tag select
		var tag_select = '<div class="btn-group" role="group"><select id="xepan-component-serverside-creator-tags" ><option value="">Select Tags</option>';
		$.each(self.original_template_tags, function(index, tag_name) {
			tag_select += '<option value="'+tag_name+'">'+tag_name+'</option>';
		});
		tag_select += '</select></div>';
		$(tag_select).appendTo($(tag_implementor_wrapper));

		// as 
		var as_select = '<div class="btn-group" role="group"><select id="xepan-component-serverside-creator-apply-as">'+
							'<option value="">apply as</option>'+
							'<option value="href">href</option>'+
							'<option value="src">src</option>'+
							'<option value="text">text</option>'+
							'<option value="wrapper">wrapper</option>'+
							'<option value="class">class</option>'+
							// '<option value="style">style</option>'+
						'</select></div>';
		$(as_select).appendTo($(tag_implementor_wrapper));

		tag_associate_btn = $('<button id="xepan-component-creator-tag-dom-association-btn" class="btn btn-primary">Add</button>').appendTo($(tag_implementor_wrapper));
		// tag_textarea = $('<textarea id="xepan-creator-tag-html" >').appendTo($(tag_implementor_wrapper));
		// tags_added wrapper

		// initialize dom object
		// var tagDomOutline = DomOutline({
		// 	'onClick': function(element){

		// 		if($.contains(repitative_selected_dom,element)){
		// 			current_selected_tag_dom = element;
		// 			$('#xepan-creator-tag-html').val($(current_selected_tag_dom).prop('outerHTML'));
		// 		}
		// 		else
		// 			alert('Please select child of repetative dom/Element ');

		// 		$('#xepan-component-creator-form').modal('show');
		// 	}
		// });

		// $(tag_dom_selector).click(function(event) {
		// 	$('#xepan-component-creator-form').modal('hide');
		// 	tagDomOutline.start();
		// 	return false;
		// });

		// if has tag dom then select show the crud
		// if($(current_selected_tag_dom).length){

		// }

		$(tag_associate_btn).click(function(event){
			var selected_tag = $('#xepan-component-serverside-creator-tags').val();
			var implement_as = $('#xepan-component-serverside-creator-apply-as').val();

			if($('li a:contains("xepan-serverside-component")').closest('li').find('#'+current_selected_tree_node.id).length == 0){
				$.univ().errorMessage('Please select node under serverside component');
				return;
			}

			if(!$(current_selected_tree_node_dom).length){
				return;
			}

			if(!selected_tag.length){
				$.univ().errorMessage('tags must not be empty');
				return;
			}
			
			if(!implement_as.length){
				$.univ().errorMessage('apply as must not be empty');
				return;
			}


			// console.log(current_selected_tag_dom);
			var temp = {};
				temp.tag = selected_tag;
				temp.dom = $(current_selected_tree_node_dom);
				temp.implement_as = implement_as;
				temp.jsnode = current_selected_tree_node;

			tags_associate_list.push(temp);

			// console.log(tags_associate_list);

			self.addToTagList(selected_tag,$(current_selected_tree_node_dom),implement_as);
			
			$('#xepan-component-serverside-creator-tags').val("");
			$('#xepan-component-serverside-creator-apply-as').val("");
			// $('#xepan-creator-tag-html').val("");
			self.showAppliedTags();
		});

		// self.addDomCodeUI(col3);

	},

	addMoveToTemplate: function(){
		var self = this;

		// manage move to header of footer
		if(self.options.template_editing){
			return;	
		}

		if($(current_selected_dom).parent('.xepan-page-wrapper').length == 0){
			return;
		}

		var wrapper = $('#xepan-component-creator-form .modal-body');
		// edit dom code to change html
		var btn_wrapper = $('<div class="btn-group btn-group-xs"></div>').appendTo($(wrapper));
		var move_to_header = $('<button id="xepan-creator-move-to-header-btn" type="button" title="update html to dom" class="btn btn-primary"> Move To Header</button>').appendTo($(btn_wrapper));
		var move_to_footer = $('<button id="xepan-creator-move-to-footer-btn" type="button" title="remove" class="btn btn-danger"> Move To Footer</button>').appendTo($(btn_wrapper));

		$(move_to_header).click(function(event) {
			self.moveToCall('header');
		});

		$(move_to_footer).click(function(event) {
			self.moveToCall('footer');
		});

	},

	moveToCall: function(move_to) {
		var self = this;

		$(current_selected_dom).removeClass('xepan-component-hover-selector');
		$(current_selected_dom).find('.xepan-component-hoverbar').remove();

		var move_html = $(current_selected_dom).prop('outerHTML');
		$.ajax({
			url :'index.php?page=xepan_cms_componentcreator&cut_page=1',
			type: 'POST',
			data: {
				'template':self.options.template,
				'move_html': move_html,
				'move_to': move_to
			},
			async:false,
			success: function(result){
				eval(result);
				
				$('#xepan-component-creator-form').remove();
				$('.modal-backdrop').remove();
				$(current_selected_dom).remove();
				$.univ().errorMessage('Please reload page to see effect');
			}
		});
	},

	addDomCodeUI: function(parent){
		var self = this;

		if(parent == undefined)
			var wrapper = $('#xepan-component-creator-type-wrapper');
		else
			var wrapper = $(parent);

		// edit dom code to change html
		var dom_code_change_wrapper = $('<div class="btn-group btn-group-xs"></div>').appendTo($(wrapper));
		$('<button class="btn btn-primary">Change HTML Of DOM</button>').appendTo($(dom_code_change_wrapper));
		var dom_code_change_selector = $('<button id="xepan-creator-dom-code-change-html-selector" type="button" title="Dom Selector for html update" class="btn btn-warning"><i class="fa fa-arrows"></i></button>').appendTo($(dom_code_change_wrapper));
		var dom_code_change_selector_parent = $('<button id="xepan-creator-dom-code-change-html-selector-parent" type="button" title="select parent" class="btn btn-default"><i class="fa fa-arrow-up"></i></button>').appendTo($(dom_code_change_wrapper));
		var dom_code_change_save_btn = $('<button id="xepan-creator-dom-code-change-html-save-btn" type="button" title="update html to dom" class="btn btn-primary"><i class="fa fa-save"></i> Save</button>').appendTo($(dom_code_change_wrapper));
		var dom_code_change_remove_btn = $('<button id="xepan-creator-dom-code-change-html-remove-btn" type="button" title="remove" class="btn btn-danger"><i class="fa fa-remove"></i> Remove</button>').appendTo($(dom_code_change_wrapper));
		var dom_html = $('<textarea id="xepan-creator-dom-code-updated-html">').appendTo($(dom_code_change_wrapper));

		// initialize dom object
		var codeDomChangeOutline = DomOutline({
			'onClick': function(element){
				current_selected_dom_of_code_change = element;
				
				$(dom_code_change_remove_btn).show();
				$(dom_code_change_save_btn).show();

				$('#xepan-component-creator-form').modal('show');
				$('#xepan-creator-dom-code-updated-html').val($(current_selected_dom_of_code_change).prop('outerHTML'));
			}
		});

		$(dom_code_change_selector_parent).click(function(event) {
			if(!$(current_selected_dom_of_code_change).length){
				$.univ().errorMessage('first select the dom/element');
				return;
			}

			$(dom_code_change_remove_btn).show();
			$(dom_code_change_save_btn).show();

			current_selected_dom_of_code_change = $(current_selected_dom_of_code_change).parent()[0];
			$('#xepan-creator-dom-code-updated-html').val($(current_selected_dom_of_code_change).prop('outerHTML'));
		});

		$('#xepan-creator-dom-code-change-html-selector').click(function(event) {
			$('#xepan-component-creator-form').modal('hide');
			codeDomChangeOutline.start();
			return false;
		});

		$('#xepan-creator-dom-code-change-html-save-btn').click(function(event) {
			if(!$(current_selected_dom_of_code_change).length){
				$.univ().errorMessage('first select the dom/element');
				return;
			}

			current_selected_dom_of_code_change = $(current_selected_dom_of_code_change).prop('outerHTML', $('#xepan-creator-dom-code-updated-html').val());
			$(this).hide();
			$(dom_code_change_remove_btn).hide();
			$.univ().successMessage('Seleced Element/Dom Html Updated');
		});

		$(dom_code_change_remove_btn).click(function(event) {
			if(!$(current_selected_dom_of_code_change).length){
				$.univ().errorMessage('first select the dom/element');
				return;
			}

			// $(current_selected_dom_of_code_change).prop('outerHTML', "");
			$(current_selected_dom_of_code_change).remove();
			$('#xepan-creator-dom-code-updated-html').val("");

			$.univ().successMessage('Selected Element Removed');
		});

	},

	showAppliedTags: function(){
		var self = this;

		$('#xepan-creator-implement-tag-wrapper').html("");
		$('<p>Implemented Tags are: </p>').appendTo($('#xepan-creator-implement-tag-wrapper'));
		$.each(tags_associate_list, function(index, data) {
			var applied_btn = $('<div class="label label-success">'+data.tag+'('+data.implement_as+')</div>').appendTo($('#xepan-creator-implement-tag-wrapper'));
		// 	var delete_btn = $('<span class="xepan-creator-delete-applied-tag label label-danger" data-id='+index+'>x</span>').appendTo($(applied_btn));
		// 	$(delete_btn).click(function(event){
				
		// 		tag_name = data.tag;

		// 		if(tag_name.indexOf('$') > 0){
		// 			tag_name_with_dollar = tag_name;
		// 			tag_name_without_dollar = tag_name.replace('$',"");
		// 		}else{
		// 			tag_name_with_dollar = tag_name.replace('{','{$');
		// 			tag_name_without_dollar = tag_name;
		// 		}

		// 		dom_obj = data.dom;

		// 		switch(data.implement_as){
		// 			case 'href':
		// 				$(dom_obj).attr('href',$(data.jsnode.data.element).attr("href"));
		// 			break;

		// 			case 'src':
		// 				$(dom_obj).removeAttr('src');
		// 			break;
						
		// 			case 'text':
		// 				$(dom_obj).text($(data.jsnode.data.element).text());
		// 				// $(dom_obj).text($(data.jsnode.data.element).nodeValue);
		// 			break;

		// 			case 'wrapper':
		// 			 	$(dom_obj).removeAttr('xepan-serverside-component-wrappers');
		// 			break;

		// 			case 'class':
		// 				$(dom_obj).removeClass(tag_name_with_dollar);
		// 			break;

		// 			case 'style':
		// 				$(dom_obj).addStyle(tag_name_with_dollar);
		// 			break;
		// 		}

		// 		self.putBackJsTreeNode();
		// 	 	// delete tags_associate_list[$(this).attr('data-id')];
		// 	 	// delete data;
		// 	 	self.showAppliedTags();
		// 	});
		});
	},

	createClientSideComponentUI: function(){
		// create UI 
		var self = this;

		repitative_selected_dom = 0;
		current_selected_tag_dom = 0;
		tags_associate_list = [];
		$creator_wrapper = $('#xepan-component-creator-type-wrapper');
		$creator_top_bar_wrapper = $('<div class="alert alert-info"><h3>Client Side Component</h3></div>').appendTo($creator_wrapper);
		// $('<div class="alert alert-success"> Client Side </div>').appendTo($creator_wrapper);

		// xepan component
		// console.log($(current_selected_tree_node_dom));
		// console.log('should have class xepan-component');
		$component_checkbox = $('<input type="checkbox" id="xepan-cmp-creator-xepan-component" class="node_class_toggler" node_toggle_class="xepan-component" /><label for="xepan-cmp-creator-xepan-component"> Create Component</label>').appendTo($creator_top_bar_wrapper);
		$component_sortable_checkbox = $('<input type="checkbox" id="xepan-cmp-creator-xepan-sortable-component" class="node_class_toggler" node_toggle_class="xepan-sortable-component"  /><label for="xepan-cmp-creator-xepan-sortable-component"> Make Sortable/Droppable</label>').appendTo($creator_top_bar_wrapper);
		$component_editable_checkbox = $('<input type="checkbox" id="xepan-cmp-creator-xepan-editable-text"  class="node_class_toggler" node_toggle_class="xepan-editable-text"  /><label for="xepan-cmp-creator-xepan-editable-text"> Create Editable Text</label>').appendTo($creator_top_bar_wrapper);
		$component_norich_checkbox = $('<input type="checkbox" id="xepan-cmp-creator-xepan-no-richtext"  class="node_class_toggler" node_toggle_class="xepan-no-richtext" /><label for="xepan-cmp-creator-xepan-no-richtext"> No Rich Text</label>').appendTo($creator_top_bar_wrapper);
		$component_nomove_checkbox = $('<input type="checkbox" id="xepan-cmp-creator-xepan-no-move" class="node_class_toggler" node_toggle_class="xepan-no-move" /><label for="xepan-cmp-creator-xepan-no-move">Disabled Moving</label>').appendTo($creator_top_bar_wrapper);
		$component_nodelete_checkbox = $('<input type="checkbox" id="xepan-cmp-creator-xepan-no-delete" class="node_class_toggler" node_toggle_class="xepan-no-delete" /><label for="xepan-cmp-creator-xepan-no-delete">Disabled Delete</label>').appendTo($creator_top_bar_wrapper);
		
		// component name
		$('<div><label for="xepan-cmp-creator-component-name">Component Name</label><input id="xepan-cmp-creator-component-name" /></div>').appendTo($creator_top_bar_wrapper);
		$component_name = $('#xepan-cmp-creator-component-name').val($(current_selected_tree_node_dom).attr('xepan-component-name'));
		$component_name.change(function(event) {
			$(current_selected_tree_node_dom).attr('xepan-component-name',$(this).val());
			self.putBackJsTreeNode();
		});

		$('.node_class_toggler').each(function(index, el) {	
			if($(current_selected_tree_node_dom).hasClass($(el).attr('node_toggle_class'))) $(el).prop('checked',true);
		});

		$('.node_class_toggler').click(function(event) {
			$is_checked_on = $(this).prop('checked');
			if(!self.validateClientside(this,$(this).attr('node_toggle_class'),$is_checked_on)) {
				$(this).prop('checked',!$(this).prop('checked'));
				return;
			}
			$(current_selected_tree_node_dom).toggleClass($(this).attr('node_toggle_class'));
			switch($(this).attr('node_toggle_class')){
				case 'xepan-editable-text':
					if($is_checked_on){
						$('#'+current_selected_tree_node.id+ ' ul').hide();
					}else{
						$('#'+current_selected_tree_node.id+ ' ul').show();
					}
				break;
			}
			self.putBackJsTreeNode();
		});


		$('#xepan-cmp-creator-xepan-editable-text').change(function(event) {
			if($('#xepan-cmp-creator-xepan-editable-text:checked').size() > 0 ){
				if($(current_selected_dom).children('.xepan-component').length > 0){
					$.univ().errorMessage('this element contains existing component, can not convert to editable text');
					$('#xepan-cmp-creator-xepan-editable-text').prop('checked', false);
				}
			}
		});

		$row = $('<div class="row"></div>').appendTo($creator_wrapper);
		$col1 = $('<div class="col-md-6 col-xs-12 col-lg-6 col-sm-12"></div>').appendTo($row);
		$col2 = $('<div class="col-md-6 col-xs-12 col-lg-6 col-sm-12"></div>').appendTo($row);

		// selector before remove
		$('<div><label for="xepan-cmp-creator-selector-to-remove-before-save">Selector To Remove Before Page Save</label><textarea id="xepan-cmp-creator-selector-to-remove-before-save" ></textarea></div>').appendTo($col1);
		$remove_selector_before_save = $('#xepan-cmp-creator-selector-to-remove-before-save').val($(current_selected_tree_node_dom).attr('xepan-selector-to-remove-before-save'));
		$remove_selector_before_save.change(function(event){
			$(current_selected_tree_node_dom ).attr('xepan-selector-to-remove-before-save',$(this).val());
			self.putBackJsTreeNode();
		});

		// eval jquery code
		$('<div><label for="xepan-cmp-creator-code-run-before-save">Jquery Code To Run Before Page Save</label><textarea id="xepan-cmp-creator-code-run-before-save"></textarea></div>').appendTo($col2);
		$run_jquery_before_save = $('#xepan-cmp-creator-code-run-before-save').val($(current_selected_tree_node_dom).attr('xepan-cmp-creator-code-run-before-save'));
		$run_jquery_before_save.change(function(event){
			$(current_selected_tree_node_dom).attr('xepan-cmp-creator-code-run-before-save',$(this).val());
			self.putBackJsTreeNode();
		});

		// self.addDomCodeUI();
		$('<hr/>').appendTo($creator_wrapper);

		var add_dynamic_html = 
								'<h3>Dynamic Options</h3>'+
								'<div id="dynamic-option-list-selector-wrapper"></div>'+
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
												'<option value="label">label</option>'+
												'<option value="attr">attribute</option>'+
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

		// dynamic lister selector input box
		$('<div><label for="xepan-cmp-creator-dynamic-list-selector">Dynamic Option List Selector</label><input id="xepan-cmp-creator-dynamic-list-selector" /></div>').appendTo($('#dynamic-option-list-selector-wrapper'));
		$dynamic_list_selector = $('#xepan-cmp-creator-dynamic-list-selector').val($(current_selected_tree_node_dom).attr('xepan-component-dynamic-option-list'));
		$dynamic_list_selector.change(function(event) {
			$(current_selected_tree_node_dom).attr('xepan-component-dynamic-option-list',$(this).val());
			self.putBackJsTreeNode();
		});
		
		$existing_list = $('<div id="xepan-creator-existing-dynamic-list"></div>').appendTo($creator_wrapper);

		var find_str = "xepan-dynamic-option-";
		$(current_selected_tree_node_dom).each(function(index) {
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

			// dynamic option list
			var find_str = "xepan-dynamic-option-";
			existing_dynamic_options_count = $('.xepan-creator-existing-dynamic-list-added').length-1;
			$(current_selected_tree_node_dom).attr('xepan-dynamic-option-'+(existing_dynamic_options_count+1),str);
			self.putBackJsTreeNode();
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

	validateClientside: function(click_obj,node_toggle_class, current_state){
		console.log('click object');
		console.log(click_obj);
		console.log('node toggleClass');
		console.log(node_toggle_class);
		console.log("current state ");
		console.log(current_state);
		console.log("current dom tag name");
		console.log($(current_selected_tree_node_dom)[0].tagName.toLowerCase());
		console.log("current dom");
		console.log($(current_selected_tree_node_dom));

		var cd = $(current_selected_tree_node_dom);
		switch(node_toggle_class){
			case 'xepan-editable-text':
				if(cd.hasClass('xepan-sortable-component')){
					$.univ().errorMessage('Editable text cannot be sortable');
					return false;
				}

				if(cd[0].tagName.toLowerCase() == 'ul'){
					$.univ().errorMessage('Cannot create ul as editable text');
					return false;
				}

				if(cd[0].tagName.toLowerCase() == 'li' && current_state == true && !cd.hasClass('xepan-no-richtext')){
					$.univ().errorMessage('li cannot be richtext, create richtext of child span. applying no-richtext class');
					$('#xepan-cmp-creator-xepan-no-richtext').click();
				}
				// else if($(current_selected_tree_node_dom)[0].tagName.toLowerCase() == 'li' && current_state == false && cd.hasClass('xepan-no-richtext')){
				// 	$('#xepan-cmp-creator-xepan-no-richtext').click();
				// }

				if($('li a:contains("xepan-editable-text")').closest('li').find('#'+current_selected_tree_node.id).length){
					$.univ().errorMessage('Cannot redeclare editable text in child of existing editable text');
					return false;
				}

				// TODO
				// if($('#'+current_selected_tree_node.id).find('a:contains("xepan-editable-text")').length){
				// 	$.univ().errorMessage('Already have an editable text as child, cannot proceed');
				// 	return false;
				// }
			break;

			case 'xepan-no-richtext':
				if(cd.hasClass('xepan-editable-text') && cd[0].tagName.toLowerCase() == 'li' && current_state == false){
					$.univ().errorMessage('li cannot be richtext, create richtext of child span. applying no-richtext class');
					return false;
				}
			break;

			case 'xepan-sortable-component':
				if(cd.hasClass('xepan-editable-text')){
					$.univ().errorMessage('Sortable component cannot be editable text');
					return false;
				}
			break;

		}
		return true;
	},

	addDynamicOptionToList: function(dynamic_option){
		var self = this;

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

				var find_str = "xepan-dynamic-option-";
				$(current_selected_tree_node_dom).each(function(index) {
					var elem = this;
					$.each(this.attributes, function( index, attr ) {
						if(typeof(attr) !== "undefined" && typeof(attr.name) !== "undefined" && attr.name.indexOf(find_str)===0){
							$(current_selected_tree_node_dom).removeAttr(attr.name);
							self.putBackJsTreeNode();
						}
					});
				});
				
				$.each($('#xepan-creator-existing-dynamic-list .xepan-creator-existing-dynamic-list-added'), function(index, row_obj) {
					var name = 'xepan-dynamic-option-'+(index + 1);
					// console.log('adding '+name);
					$(current_selected_tree_node_dom).attr(name,$(row_obj).attr('data-dynamic-option'));
				});
				self.putBackJsTreeNode();

			});
	}

});