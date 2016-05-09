<?php


namespace xepan\cms;


class View_ToolBar extends \View {
	function init(){
		parent::init();

		$this->js(true)->_load($this->api->url()->absolute()->getBaseURL().'vendor/xepan/cms/templates/js/xepanTool.js');

		$group_tpl = $this->template->cloneRegion('group');
		$this->template->del('group');
		$tool_tpl = $this->template->cloneRegion('tool');
		$this->template->del('tool');

		$tools = $this->app->getFrontEndTools();

		foreach (array_keys($tools) as $group) {
			$g_v = $this->add('View',null,'groups',clone $group_tpl);
			$g_v->template->set('name',$group);
			foreach ($tools[$group] as $tool) {
				$t_v = $g_v->add($tool,null,'tools');
				$t_v_icon = $g_v->add('View',null,'tools',clone $tool_tpl);
				$t_v_icon->template->set('name',$tool);
				$t_v_icon->js(true)->xepanTool(
					[
					'name'=>$tool,
					'drop_html'=> '<div class="xepan-component '.($t_v->runatServer?'xepan-serverside-component':'').'" xepan-component="/'.str_replace('\\', '/', get_class($t_v)).'">' .$t_v->getHTML(). '</div>'
					]
				);

				$this->add($tool.'_Options',null,'tool_options');
			}
		}

		$this->js(true)
			->_load($this->api->url()->absolute()->getBaseURL().'vendor/xepan/cms/templates/js/xepanComponent.js')
			->_load($this->api->url()->absolute()->getBaseURL().'vendor/xepan/cms/templates/js/xepanEditor.js')
			->xepanEditor([
				'base_url'=>$this->api->url()->absolute()->getBaseURL()
			]);
	}

	function defaultTemplate(){
		return ['view/cms/toolbar/layout'];
	}
}