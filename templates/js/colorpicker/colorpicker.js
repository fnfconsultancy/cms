$.each({
	xEpanColorPicker: function(){
		$(this.jquery).colorpicker({
			parts:'full',
	        alpha:false,
	        showOn:'both',
	        buttonColorize:true,
	        showNoneButton:true,
	        position: {
				my: 'center',
				at: 'center',
				of: window
			},
			modal: true,
			buttonImage:'vendor/xepan/cms/templates/css/colorpicker/images/ui-colorpicker.png'
		});
		// $(this.jquery).pickAColor();
	}
},$.univ._import);