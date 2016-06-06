<?php

namespace xepan\cms;

class page_websites extends \xepan\base\Page{
	public $title = "Website";
	function init(){
		parent::init();

		// as per page 
		// http://codepen.io/kaizoku-kuma/pen/JDxtC
		$this->app->jui->addStylesheet('codemirror/codemirror-5.15.2/lib/codemirror');
		$this->app->jui->addStylesheet('codemirror/codemirror-5.15.2/theme/ambiance');
		$this->app->jui->addStylesheet('codemirror/codemirror-5.15.2/theme/dracula');

		$this->app->jui->addStaticInclude('codemirror/codemirror-5.15.2/lib/codemirror');
		$this->app->jui->addStaticInclude('codemirror/codemirror-5.15.2/mode/htmlmixed/htmlmixed');
		$this->app->jui->addStaticInclude('codemirror/codemirror-5.15.2/mode/jade/jade');
		$this->app->jui->addStaticInclude('codemirror/codemirror-5.15.2/mode/php/php');
		$this->app->jui->addStaticInclude('codemirror/codemirror-5.15.2/mode/xml/xml');
		// $this->app->jui->addStaticInclude('codemirror/codemirror-5.15.2/keymap/sublime');
		// $this->app->jui->addStaticInclude('codemirror/codemirror-5.15.2/keymap/emacs');
		// $this->js()->_load('codemirror/codemirror-5.15.2/lib/codemirror');
		
		$this->js(true,'
				$("#'.$this->name.'").elfinder({
					url: "index.php?page=xepan_base_adminelconnector",
					commandsOptions: {
						edit : { 
							// list of allowed mimetypes to edit // if empty - any text files can be edited mimes : [],
							// you can have a different editor for different mimes 
							editors : [{
								addKeyMap:["emacs","top"],
								mimes : ["text/plain", "text/html","text/x-jade", "text/javascript", "text/css", "text/x-php", "application/x-httpd-php", "text/x-markdown", "text/plain", "text/html", "text/javascript", "text/css"],
								load : function(textarea) {
									this.myCodeMirror = CodeMirror.fromTextArea(textarea, { lineNumbers: true, theme: "dracula", viewportMargin: Infinity, lineWrapping: true, htmlMode: true});
								},
								close : function(textarea, instance) { 
									this.myCodeMirror = null; 
								},
								save : function(textarea, editor) {
									textarea.value = this.myCodeMirror.getValue(); this.myCodeMirror = null; 
								}
							}] //editors 
						} //edit
					} //commandsOptions 
				}).elfinder("instance");
			');
	}
}