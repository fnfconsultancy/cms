$.each({
	xEpanColorPicker: function(){
		$(this.jquery).colorpicker({
			parts:'full',
	        alpha:true,
	        showOn:'both',
	        buttonColorize:true,
	        showNoneButton:true,
	        position: {
				my: 'center',
				at: 'center',
				of: window
			},
			modal: true,
			buttonImage:'vendor/xepan/cms/templates/css/colorpicker/images/ui-colorpicker.png',
			// ok: function(event,color){
			// 	console.log('ok '+color.formatted);
			// },
			// cancel: function(event,color){
			// 	console.log('cancel '+color.formatted);
			// }

		});
		// $(this.jquery).pickAColor();
	}
},$.univ._import);