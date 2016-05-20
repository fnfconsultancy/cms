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

        return $this;
    }

    function setup_frontend(){
        $this->routePages('xepan_cms');
        $this->addLocation(array('template'=>'templates','js'=>'templates/js','css'=>['templates/css','templates/js']))
        ->setBaseURL('./vendor/xepan/cms/');

        $tinymce_addon_base_path=$this->app->locatePath('addons','tinymce\tinymce');
        $this->addLocation(array('js'=>'.','css'=>'skins'))
        ->setBasePath($tinymce_addon_base_path)
        ->setBaseURL('./vendor/tinymce/tinymce/');


        $elfinder_addon_base_path=$this->app->locatePath('addons','studio-42\elfinder');
        $this->addLocation(array('js'=>'js','css'=>'css','image'=>'img'))
        ->setBasePath($elfinder_addon_base_path)
        ->setBaseURL('./vendor/studio-42/elfinder/');
        

        $user = $this->add('xepan\base\Model_User');
        
        $auth = $this->app->add('BasicAuth');
        $auth->usePasswordEncryption('md5');
        $auth->setModel($user,'username','password');


        // execute template server side components
        $this->app->add('xepan\cms\Controller_ServerSideComponentManager');
        $this->app->jui->destroy();
        $this->app->jui=null;
        $this->app->add('jUI');

        $this->app->isEditing = false;

        if($this->app->auth->isLoggedIn()) {
            $user = $this->add('xepan\cms\Model_User_CMSEditor');
            $user->tryLoadBy('user_id',$this->app->auth->model->id);

            if($user->loaded() && !$_GET['xepan-template-edit'] && $user['can_edit_page_content']){
                $this->app->isEditing = true;
                $this->app->editing_template = null;
            }elseif($user->loaded() && $_GET['xepan-template-edit']){
                if($user['can_edit_template']){
                    $this->app->isEditing = true;
                    $this->app->editing_template = $_GET['xepan-template-edit'];
                }else{
                    throw $this->exception('You are not authorised to edit templates');
                }
            }
        }

        $this->app->exportFrontEndTool('xepan\cms\Tool_Text');
        $this->app->exportFrontEndTool('xepan\cms\Tool_Container');
        $this->app->exportFrontEndTool('xepan\cms\Tool_Columns');
        $this->app->exportFrontEndTool('xepan\cms\Tool_Image');

        return $this;
    }

    function resetDB(){
        
        $truncate_models = ['User_CMSEditor'];
        foreach ($truncate_models as $t) {
            $this->add('xepan\cms\Model_'.$t)->deleteAll();
        }
    }
}
