<?php

namespace xepan\cms;

class Initiator extends \Controller_Addon {
    
    public $addon_name = 'xepan_cms';

    function setup_admin(){

        if($this->app->is_admin){
            $this->routePages('xepan_cms');
            $this->addLocation(array('template'=>'templates','js'=>'templates/js','css'=>'template/css'))
            ->setBaseURL('../vendor/xepan/cms/');
            
        }        
    }

    function setup_frontend(){
        $this->routePages('xepan_cms');
        $this->addLocation(array('template'=>'templates','js'=>'templates/js','css'=>'template/css'))
        ->setBaseURL('./vendor/xepan/cms/');

        $user = $this->add('xepan\base\Model_User_Active');
        $user->addCondition('scope',['Editor','Both','SuperUser','AdminUser']);
        
        $auth = $this->app->add('BasicAuth');
        $auth->usePasswordEncryption('md5');
        $auth->setModel($user,'username','password');

        if(strpos($this->app->page,'_admin_')!==false){
            $old_jui = $this->api->jui->destroy();
            $this->app->jui=null;

            $this->app->template->loadTemplate('html');
            $this->app->add('jUI');

            $l = $this->app->add('Layout_Fluid');
            $m = $l->add('Menu_Horizontal',null,'Top_Menu');
            $m->addItem('Pages','xepan_cms_editor_pages');

            $auth->check();
        }else{
            $this->app->add('xepan\cms\Controller_ServerSideComponentManager');
            $this->app->jui->destroy();
            $this->app->jui=null;
            $this->app->add('jUI');
        }        

        $this->app->isEditing = false;
        if($auth->isLoggedIn()) $this->app->isEditing = true;

        return $this;
    }


    function generateInstaller(){
    }
}
