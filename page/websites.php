<?php

namespace xepan\cms;

class page_websites extends \xepan\base\Page{
	public $title = "Website";
	function init(){
		parent::init();

		// as per page 
		// http://codepen.io/kaizoku-kuma/pen/JDxtC
		$this->app->jui->addStylesheet('codemirror/codemirror');
		$this->app->jui->addStaticInclude('codemirror/codemirror');
		$this->js()->_load('codemirror/codemirror');
		
		$this->js(true,'
				$("#'.$this->name.'").elfinder({
					url: "index.php?page=xepan_base_adminelconnector",
					commandsOptions:{
						edit : {

								mimes : ["text/plain", "text/html", "text/javascript", "text/css", "text/x-php", "application/x-httpd-php", "text/x-markdown"],
								load : function(textarea) {
									this.myCodeMirror = CodeMirror.fromTextArea(textarea, { lineNumbers: true, theme: "ambiance", viewportMargin: Infinity, lineWrapping: true }) 
								},
								close : function(textarea, instance) { this.myCodeMirror = null; 
								},
								save : function(textarea, editor) { textarea.value = this.myCodeMirror.getValue(); this.myCodeMirror = null; 
								}
						}
					}
				}).elfinder("instance");
			');
	}
}