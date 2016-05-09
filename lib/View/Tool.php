<?php
namespace xepan\cms;

class View_Tool extends \View{

	public $options=[];
	public $_options=[];

	public $virtual_page=null;
	public $add_option_helper = true;

	public $runatServer=true;
	

	function initializeTemplate($template_spot = null, $template_branch = null){
		$this->options = $this->_options + $this->options;
		parent::initializeTemplate($template_spot, $template_branch);
	}

	function init(){
		parent::init();
		$this->option_page = $this->option_panel_page = $this->add('VirtualPage');
	}

	function setModel($model,$fields=null){
		$m = parent::setModel($model,$fields);
		if($this->add_option_helper)
			$this->add('xepan\cms\Controller_Tool_Optionhelper');
		return $m;
	}
}