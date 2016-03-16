<?php

namespace xepan\cms;

class Initiator extends \Controller_Addon {
    
    public $addon_name = 'xepan_cms';

    function init(){
        parent::init();

        $this->routePages('xepan_cms');
        $this->addLocation(array('template'=>'templates','js'=>'templates/js'))
        ->setBaseURL('../vendor/xepan/cms/');

        $user = $this->add('xepan\base\Model_User_Active');
        $user->addCondition('scope',['Editor','Both','SuperUser']);
        
        $auth = $this->app->add('BasicAuth');
        $auth->setModel($user,'username','password');

        if(strpos($this->app->page,'xepan_cms_editor')!==false){
            $this->app->template->loadTemplate('html');
            $l = $this->app->add('Layout_Fluid');
            $m = $l->add('Menu_Horizontal',null,'Top_Menu');
            $m->addItem('Pages','xepan_cms_editor_pages');

            $auth->check();
		}

        $this->app->isEditing = false;
        if($auth->isLoggedIn()) $this->app->isEditing = true;
        
    }
}
