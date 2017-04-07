current_selected_component = undefined;
origin = 'page';
xepan_drop_component_html= '';

jQuery.widget("ui.xepanEditor",{
	options:{
		base_url:undefined,
		file_path:undefined,
		template_file:undefined,
		template:undefined,
		save_url:undefined,
		template_editing:undefined,
		tools:{},
		basic_properties: undefined,
		component_selector: '.xepan-component'
	},

	topbar:{},
	leftbar:{},
	rightbar:{},

	_create: function(){
		var self = this;

		self.setupEnvironment();
		self.setupTools();
		// self.setupToolbar();
		self.setUpShortCuts();
		self.setUpPagesAndTemplates();
		// self.cleanup(); // Actually these are JUGAAD, that must be cleared later on
		// if(self.options.template_editing){
		// 	$('.xepan-page-wrapper').removeClass('xepan-sortable-component');
		// }
	},

	setupEnvironment: function(){
		var self = this;

		// throw self html out of body
		$(self.element).appendTo('body');

		// right bar
		self.rightbar = $('<div id="xepan-cms-toolbar-right-side-panel" class="container sidebar sidebar-right" style="right: -230px;" data-status="opened"></div>').insertAfter('body');
		// right bar content
		$('<h2>Options Panel</h2>').appendTo(self.rightbar);
		
		self.rightbar_toggle_btn = $('<div class="toggler"><span class="glyphicon glyphicon-chevron-right" style="display: block;">&nbsp;</span> <span class="glyphicon glyphicon-chevron-left" style="display: none;">&nbsp;</span></div>').appendTo(self.rightbar);
		$(self.rightbar_toggle_btn).click(function(){
			$('#xepan-cms-toolbar-right-side-panel').toggleClass('toggleSideBar');
		});


		// left bar
		self.leftbar = $('<div id="xepan-cms-toolbar-left-side-panel" class="container sidebar sidebar-left" style="left: -230px;" data-status="opened"></div>').insertAfter('body');
		// right bar content
		self.leftbar_toggle_btn = $('<div class="toggler"><span class="glyphicon glyphicon-chevron-right" style="display: block;">&nbsp;</span> <span class="glyphicon glyphicon-chevron-left" style="display: none;">&nbsp;</span></div>').appendTo(self.leftbar);
		$(self.leftbar_toggle_btn).click(function(){
			$('#xepan-cms-toolbar-left-side-panel').toggleClass('toggleSideBar');
		});
		
		// // top bar
		// self.topbar = $('<div id="xepan-cms-toolbar-top-side-panel" class="container sidebar sidebar-top toggleSideBar" style="top:-50px;" data-status="opened"></div>').insertAfter('body');
		// // top bar content
		// $('<h2>Top Bar</h2>').appendTo(self.topbar);
		// self.topbar_toggle_btn = $('<div class="toggler"><span class="glyphicon glyphicon-chevron-down" style="display: block;">&nbsp;</span> <span class="glyphicon glyphicon-chevron-up" style="display: none;">&nbsp;</span></div>').appendTo(self.topbar);
		// $(self.topbar_toggle_btn).click(function(){
		// 	$('#xepan-cms-toolbar-top-side-panel').toggleClass('toggleSideBar');
		// });
	},

	setupTools: function(){
		var self = this;

		var apps_dropdown = $('<select class="xepan-layout-selector"></select>').appendTo(self.leftbar);
		var option = '<option value="0">Select</option>';

		var tools_options = $('<div class="xepan-tools-options">').appendTo(self.rightbar);

		$.each(self.options.tools,function(app_name,tools){
			option += '<option value="'+app_name+'">'+app_name+'</option>';			
			
			var app_tool_wrapper = $('<div class="xepan-cms-toolbar-tool '+app_name+'">').appendTo(self.leftbar);
			var tools_html = "";
			$.each(tools,function(tool_name_with_namespace,tool_data){
				var t_name = tool_name_with_namespace;
				t_name = t_name.replace(/\\/g, "");

				$('<div class="xepan-cms-tool" data-toolname="'+t_name+'"><img src="'+tool_data.icon_img+'"/ onerror=this.src="./vendor/xepan/cms/templates/images/default_icon.png"><p>'+tool_data.name+'</p></div>')
					.appendTo(app_tool_wrapper)
					.disableSelection()
					.draggable({
						inertia:true,
						appendTo:'body',
						connectToSortable:'.xepan-sortable-component',
						helper:'clone',
						start: function(event,ui){
							origin='toolbox';
							xepan_drop_component_html= tool_data.drop_html;
							self.leftbar.hide();
						},

						stop: function(event,ui){
							self.leftbar.show();
						},
						revert: 'invalid',
						tolerance: 'pointer'
					})
					;
	
					$(tool_data.option_html).appendTo(tools_options);
			});
			$(app_tool_wrapper).hide();
		});

		$(option).appendTo(apps_dropdown);

		$(apps_dropdown).change(function(){
			selected_app = $(this).val();
			$('.xepan-cms-toolbar-tool').hide();
			$('.xepan-cms-toolbar-tool.'+selected_app).show();
		});

		$(self.options.basic_properties).appendTo(tools_options);
	},

	setUpPagesAndTemplates: function(){
		var self = this;
		var $page_btn = $('<button class="btn input-block-level form-control btn-primary">'+self.options.current_page+'</button>').appendTo(self.leftbar);
		$page_btn.click(function(event) {
			$.univ().frameURL('Pages & Templates','index.php?page=xepan_cms_cmspagemanager&cut_page=1');
		});
	},

	setupToolbar: function(){
		var self = this;

		$(this.element).draggable({
			handle:'.xepan-toolbar-drag-handler',
			containment : 'window'
		});

		$('.xepan-tools-options').draggable({
			handle:'.xepan-tools-options-drag-handler',
			containment : 'window'
		});
		
		/*=====----Setup TopToolBar Editor-----===========*/
		/*Save page Content*/
		$('#xepan-savepage-btn').click(function(){
			$('.xepan-toolbar').xepanEditor('savePage');
		});
		$('#toolbar-toggle-btn').click(function(){
			$('.xepan-toolbar-group-component').toggle();
		});

		/*Component Editing outline*/
		$('#epan-component-border').click(function(event) {
		    if($('#epan-component-border:checked').size() > 0){
		        $(self.options.component_selector).addClass('component-outline');
		    }else{
		        $(self.options.component_selector).removeClass('component-outline');
		    }
		});
		/*Preview Mode*/
		$('#epan-editor-preview i').click(function(event){
		    $('#epan-editor-left-panel').visibilityToggle();
		});
		/*Access to Admin panel*/
		 $('#dashboard-btn').click(function(event) {
	        // TODO check if content is changed
	        window.location.replace('admin/');
	    });

		/*Drag & Drop Component to Another  Extra Padding top & Bottom*/
		$('#epan-component-extra-padding').click(function(event) {
		    if($('#epan-component-extra-padding:checked').size() > 0){
		        $(self.options.component_selector + ' .xepan-sortable-component').addClass('epan-sortable-extra-padding');
		    }else{
		        $(self.options.component_selector + ' .xepan-sortable-component').removeClass('epan-sortable-extra-padding');
		    }
		});
		
		
		/*Website Desktop,Laptop,Tablet,Mobile Device Preview*/

		$('#epan-editor-preview-mobile').click(function(event){
		    $("<div>").append($("<iframe width='100%' height='100%' />")
		        .attr("src", "index.php?preview=1"))
		        .dialog({
		            width: 320,
		            height: 480,
		            modal: true
		    });
		    $('iframe').on("load", function() {
			    $('iframe').contents().find('body').css('margin-top','0');    
				$('iframe').contents().find('.xepan-toolbar').css('display','none');
			});    
		});

		$('#epan-editor-preview-tablet').click(function(event){
		    $("<div>").append($("<iframe width='100%' height='100%' />")
		        .attr("src", "index.php?preview=1"))
		        .dialog({
		            width: 768,
		            height: 480,
		            modal: true
		    });
		    $('iframe').on("load", function() {
			    $('iframe').contents().find('body').css('margin-top','0');    
				$('iframe').contents().find('.xepan-toolbar').css('display','none');
			});    
		});

		$('#epan-editor-preview-laptop').click(function(event){
		    $("<div>").append($("<iframe width='100%' height='100%' style='margin-top:10px' />")
		        .attr("src", "index.php?preview=1"))
		        .dialog({
		            width: 992,
		            height: 500,
		            modal: true
		    });
		    $('iframe').on("load", function() {
			    $('iframe').contents().find('body').css('margin-top','0');    
				$('iframe').contents().find('.xepan-toolbar').css('display','none');
			});    
		});

		$('#epan-editor-preview-desktop').click(function(event){
		    $("<div>").append($("<iframe width='100%' height='100%' />")
		        .attr("src", "index.php?preview=1"))
		        .dialog({
		            width: 1024,
		            height: 550,
		            modal: true
		    });
		    $('iframe').on("load", function() {
			    $('iframe').parent().find('.ui-dialog-titlebar').css('margin-top','55px');    
			    $('iframe').contents().find('body').css('margin-top','0');    
				$('iframe').contents().find('.xepan-toolbar').css('display','none');
			});    
		});

		$('#save-as-snapshot').click(function(event){

		});

		$('#template-btn').click(function(event){
			$('.xepan-toolbar').xepanEditor('editTemplate');
		});

	},

	editTemplate : function(){
		// alert(this.options.template);
		// alert(this.options.template_file);
		$.univ().location(document.location.href+'?page='+this.options.template+'&xepan-template-edit='+this.options.template);
	},

	savePage: function(){
		// console.log(this.options.save_url);
		// console.log(this.options.file_path);

		var self= this;
		
		// $('body').trigger('beforeSave');
		try{
	    	$('body').triggerHandler('beforeSave');
		}catch(err){
			console.log(err);
		}

	    $('body').univ().errorMessage('Wait.. saving your page !!!');

	    $('.xepan-component').xepanComponent('deselect');
	    $('.xepan-component-drag-handler').remove();
	    $('.xepan-component-remove').remove();
	    $('.xepan-component').removeClass('xepan-component-hover-selector');
	    

	    var overlay = jQuery('<div id="xepan-cms-page-save-overlay"> </div>');
	    overlay.appendTo(document.body).css('z-index','10000');

	    html_body = $('.xepan-page-wrapper').clone();
		
		if(self.options.template_editing){
		    html_body = $('body').clone();
		    $(html_body).find("#xepan-cms-page-save-overlay").remove();
		    $(html_body).find(".ui-pnotify").remove();
		    self.options.file_path = self.options.template_file;
		}
		
	    $(html_body).find('.xepan-serverside-component').html("");
	    $(html_body).find('.xepan-editable-text').attr('contenteditable','false');

	    html_body = encodeURIComponent($.trim($(html_body).html()));


	    html_crc = crc32(html_body);

	    // if (edit_template == true) {
	    //     html_body = encodeURIComponent($.trim($('#epan-content-wrapper').html()));
	    //     html_crc = crc32(html_body);
	    // }

	    $("body").css("cursor", "default");

	    var save_and_take_snapshot='Y';

	    $.ajax({
	        url: this.options.save_url,
	        type: 'POST',
	        dataType: 'html',
	        data: {
	            body_html: html_body,
	            body_attributes: encodeURIComponent($('body').attr('style')),
	            take_snapshot: save_and_take_snapshot ? 'Y' : 'N',
	            crc32: html_crc,
	            length: html_body.length,
	            file_path: self.options.file_path,
	            is_template: self.options.template_editing
	        },
	    })
	    .done(function(message) {
            eval(message);	        
	        $('body').triggerHandler('saveSuccess');
	    })
	    .fail(function(err) {
	        $('body').trigger('saveFail');
	    })
	    .always(function() {
	        $('body').triggerHandler('afterSave');
	    });
	},

	hideOptions:function(){
		$('.xepan-tool-options').hide();
	},

	setUpShortCuts: function(){
		var self = this;

		shortcut.add("Ctrl+s", function(event) {
	        $('#'+self.options.editor_id).xepanEditor('savePage');
	        event.stopPropagation();
	    });

	    shortcut.add("Ctrl+backspace", function(event) {
	    	if (typeof current_selected_component == 'undefined') return;
	        $(current_selected_component).xepanComponent('remove');
	        event.stopPropagation();
	    });

		shortcut.add("Ctrl+Shift+Up", function(event) {
	        if (typeof current_selected_component == 'undefined') return;
	        parent_component = $(current_selected_component).parent('.xepan-component');
	        if (parent_component.length === 0) {
	            $('body').univ().errorMessage('On Top Component');
	            return;
	        }
	        $(current_selected_component).xepanComponent('deselect');
	        $(parent_component).xepanComponent('select');
	    });

	    shortcut.add("Ctrl+Shift+Left", function(event) {
	        if (typeof current_selected_component == 'undefined') return;
	        prev_sibling = $(current_selected_component).prev('.xepan-component');
	        if (prev_sibling.length === 0) {
	            $('body').univ().errorMessage('No Next element found');
	            return;
	        }
	        $(current_selected_component).xepanComponent('deselect');
	        $(prev_sibling).xepanComponent('select');
	        event.stopPropagation();

	    });

	    shortcut.add("Ctrl+Shift+Right", function(event) {
	        if (typeof current_selected_component == 'undefined') return;
	        next_sibling = $(current_selected_component).next('.xepan-component');
	        if (next_sibling.length === 0) {
	            $('body').univ().errorMessage('No Next element found');
	            return;
	        }
	        $(current_selected_component).xepanComponent('deselect');
	        $(next_sibling).xepanComponent('select');
	        event.stopPropagation();

	    });

		shortcut.add("Tab", function(event) {
	        if (typeof current_selected_component == 'undefined') {
	            next_component = $('.xepan-page-wrapper').children('.xepan-component:first-child');
	        } else {
	            var $x = $('.xepan-component:not(.xepan-page-wrapper)');
	            next_component = $x.eq($x.index($(current_selected_component)) + 1);
	        }

	        if($(next_component).attr('id') === undefined){
	            next_component = $('.xepan-page-wrapper').children('.xepan-component:first-child');
	            if($(next_component).attr('id') === undefined){
	                event.stopPropagation();
	                $.univ.errorMessage('No Component On Screen');
	                return;
	            }
	        }

	        $(self.options.component_selector).xepanComponent('deselect');
	        $(next_component).xepanComponent('select');
	        event.stopPropagation();
	    }, {
	        disable_in_input: true
	    });

	    shortcut.add("Shift+Tab", function(event) {
	        if (typeof current_selected_component == 'undefined') {
	            next_component = $('.xepan-page-wrapper').children('.xepan-component:first-child');
	        } else {
	            var $x = $('.xepan-component:not(.xepan-page-wrapper)');
	            next_component = $x.eq($x.index($(current_selected_component)) - 1);
	        }

	        if($(next_component).attr('id') === undefined){
	            next_component = $('.xepan-page-wrapper').children('.xepan-component:first-child');
	            if($(next_component).attr('id') === undefined){
	                event.stopPropagation();
	                $.univ.errorMessage('No Component On Screen');
	                return;
	            }
	        }

	        $(self.options.component_selector).xepanComponent('deselect');
	        $(next_component).xepanComponent('select');
	        event.stopPropagation();
	    });

	    shortcut.add("Esc", function(event) {
	        $(self.options.component_selector).xepanComponent('deselect');
	        $('#xepan-cms-toolbar-right-side-panel').removeClass('toggleSideBar');
	        $('#xepan-cms-toolbar-left-side-panel').removeClass('toggleSideBar');
	        event.stopPropagation();
	    });

	    shortcut.add("F2", function(event) {
        $('.xepan-toolbar-group-component ').toggle('slideup');
	    });

	    shortcut.add("F4", function(event) {
	        $('.xepan-tools-options').toggle('slideup');
	    });


	},

	cleanup: function(){
		
	}

	
});

function Utf8Encode(string) {
    string = string.replace(/\r\n/g, "\n");
    var utftext = "";

    for (var n = 0; n < string.length; n++) {
        var c = string.charCodeAt(n);
        if (c < 128) {
            utftext += String.fromCharCode(c);
        } else if ((c > 127) && (c < 2048)) {
            utftext += String.fromCharCode((c >> 6) | 192);
            utftext += String.fromCharCode((c & 63) | 128);
        } else {
            utftext += String.fromCharCode((c >> 12) | 224);
            utftext += String.fromCharCode(((c >> 6) & 63) | 128);
            utftext += String.fromCharCode((c & 63) | 128);
        }
    }
    return utftext;
};

function crc32(str) {
    str = Utf8Encode(str);
    var table = "00000000 77073096 EE0E612C 990951BA 076DC419 706AF48F E963A535 9E6495A3 0EDB8832 79DCB8A4 E0D5E91E 97D2D988 09B64C2B 7EB17CBD E7B82D07 90BF1D91 1DB71064 6AB020F2 F3B97148 84BE41DE 1ADAD47D 6DDDE4EB F4D4B551 83D385C7 136C9856 646BA8C0 FD62F97A 8A65C9EC 14015C4F 63066CD9 FA0F3D63 8D080DF5 3B6E20C8 4C69105E D56041E4 A2677172 3C03E4D1 4B04D447 D20D85FD A50AB56B 35B5A8FA 42B2986C DBBBC9D6 ACBCF940 32D86CE3 45DF5C75 DCD60DCF ABD13D59 26D930AC 51DE003A C8D75180 BFD06116 21B4F4B5 56B3C423 CFBA9599 B8BDA50F 2802B89E 5F058808 C60CD9B2 B10BE924 2F6F7C87 58684C11 C1611DAB B6662D3D 76DC4190 01DB7106 98D220BC EFD5102A 71B18589 06B6B51F 9FBFE4A5 E8B8D433 7807C9A2 0F00F934 9609A88E E10E9818 7F6A0DBB 086D3D2D 91646C97 E6635C01 6B6B51F4 1C6C6162 856530D8 F262004E 6C0695ED 1B01A57B 8208F4C1 F50FC457 65B0D9C6 12B7E950 8BBEB8EA FCB9887C 62DD1DDF 15DA2D49 8CD37CF3 FBD44C65 4DB26158 3AB551CE A3BC0074 D4BB30E2 4ADFA541 3DD895D7 A4D1C46D D3D6F4FB 4369E96A 346ED9FC AD678846 DA60B8D0 44042D73 33031DE5 AA0A4C5F DD0D7CC9 5005713C 270241AA BE0B1010 C90C2086 5768B525 206F85B3 B966D409 CE61E49F 5EDEF90E 29D9C998 B0D09822 C7D7A8B4 59B33D17 2EB40D81 B7BD5C3B C0BA6CAD EDB88320 9ABFB3B6 03B6E20C 74B1D29A EAD54739 9DD277AF 04DB2615 73DC1683 E3630B12 94643B84 0D6D6A3E 7A6A5AA8 E40ECF0B 9309FF9D 0A00AE27 7D079EB1 F00F9344 8708A3D2 1E01F268 6906C2FE F762575D 806567CB 196C3671 6E6B06E7 FED41B76 89D32BE0 10DA7A5A 67DD4ACC F9B9DF6F 8EBEEFF9 17B7BE43 60B08ED5 D6D6A3E8 A1D1937E 38D8C2C4 4FDFF252 D1BB67F1 A6BC5767 3FB506DD 48B2364B D80D2BDA AF0A1B4C 36034AF6 41047A60 DF60EFC3 A867DF55 316E8EEF 4669BE79 CB61B38C BC66831A 256FD2A0 5268E236 CC0C7795 BB0B4703 220216B9 5505262F C5BA3BBE B2BD0B28 2BB45A92 5CB36A04 C2D7FFA7 B5D0CF31 2CD99E8B 5BDEAE1D 9B64C2B0 EC63F226 756AA39C 026D930A 9C0906A9 EB0E363F 72076785 05005713 95BF4A82 E2B87A14 7BB12BAE 0CB61B38 92D28E9B E5D5BE0D 7CDCEFB7 0BDBDF21 86D3D2D4 F1D4E242 68DDB3F8 1FDA836E 81BE16CD F6B9265B 6FB077E1 18B74777 88085AE6 FF0F6A70 66063BCA 11010B5C 8F659EFF F862AE69 616BFFD3 166CCF45 A00AE278 D70DD2EE 4E048354 3903B3C2 A7672661 D06016F7 4969474D 3E6E77DB AED16A4A D9D65ADC 40DF0B66 37D83BF0 A9BCAE53 DEBB9EC5 47B2CF7F 30B5FFE9 BDBDF21C CABAC28A 53B39330 24B4A3A6 BAD03605 CDD70693 54DE5729 23D967BF B3667A2E C4614AB8 5D681B02 2A6F2B94 B40BBE37 C30C8EA1 5A05DF1B 2D02EF8D";
    var crc = 0;
    var x = 0;
    var y = 0;

    crc = crc ^ (-1);
    for (var i = 0, iTop = str.length; i < iTop; i++) {
        y = (crc ^ str.charCodeAt(i)) & 0xFF;
        x = "0x" + table.substr(y * 9, 8);
        crc = (crc >>> 8) ^ x;
    }

    return (crc ^ (-1)) >>> 0;
};

(function(old) {
  $.fn.attr = function() {
    if(arguments.length === 0) {
      if(this.length === 0) {
        return null;
      }

      var obj = {};
      $.each(this[0].attributes, function() {
        if(this.specified) {
          obj[this.name] = this.value;
        }
      });
      return obj;
    }

    return old.apply(this, arguments);
  };
})($.fn.attr);

// $('iframe').load(function(){
// 	$(this).find('body').css('margin-top','0');
// });
