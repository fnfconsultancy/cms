<?php

namespace xepan\cms;

class Initiator extends \Controller_Addon {
    
    public $addon_name = 'xepan_cms';

    function setup_admin(){

        if($this->app->is_admin){
            $this->routePages('xepan_cms');
            $this->addLocation(array('template'=>'templates','js'=>'templates/js','css'=>['templates/css','templates/js']))
            ->setBaseURL('../vendor/xepan/cms/');
        }
        $this->app->cms_menu = $m = $this->app->top_menu->addMenu('CMS');
        // $menu = $this->app->side_menu->addMenu(['Website','icon'=>' fa fa-globe','badge'=>['xoxo' ,'swatch'=>' label label-primary pull-right']],'#');
        $m->addItem([' FileManager','icon'=>' fa fa-edit'],'xepan_cms_websites');
        $m->addItem([' CMS Editors','icon'=>' fa fa-edit'],'xepan_cms_cmseditors');
        $m->addItem([' Custom Form','icon'=>' fa fa-wpforms'],'xepan_cms_customform');
        return $this;
    }

    function setup_pre_frontend(){
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

        $extra_info = json_decode($this->app->epan['extra_info'],true);
        $this->app->template->trySet('title',@$extra_info['title']);

        $this->app->template->trySet('meta_keywords',@$extra_info['meta_keyword']);
        $this->app->template->trySet('meta_description',@$extra_info['meta_description']);

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
        $old_js_block = $this->app->template->tags['js_block'];
        $old_js_include = $this->app->template->tags['js_include'];
        $old_js_doc_ready = $this->app->template->tags['document_ready'];

        $old_title = $this->app->template->tags['title'];
        $old_meta_keywords = $this->app->template->tags['meta_keywords'];
        $old_meta_description = $this->app->template->tags['meta_description'];

        $this->app->add('xepan\cms\Controller_ServerSideComponentManager');
        // $this->app->jui->destroy();
        // $this->app->jui=null;
        // $this->app->add('jUI');
        $this->app->template->appendHTML('js_block',implode("\n", $old_js_block[1]));
        $this->app->template->appendHTML('js_include',implode("\n", $old_js_include[1]));
        $this->app->template->appendHTML('document_ready',implode("\n",$old_js_doc_ready[1]));

        $this->app->template->trySet('title',@implode("\n",$old_title[1]));
        $this->app->template->trySet('meta_keywords',@implode("\n",$old_meta_keywords[1]));
        $this->app->template->trySet('meta_description',@implode("\n",$old_meta_description[1]));


        $this->app->exportFrontEndTool('xepan\cms\Tool_Text');
        $this->app->exportFrontEndTool('xepan\cms\Tool_Container');
        $this->app->exportFrontEndTool('xepan\cms\Tool_Columns');
        $this->app->exportFrontEndTool('xepan\cms\Tool_Image');
        $this->app->exportFrontEndTool('xepan\cms\Tool_CustomForm');

        return $this;
    }

    function resetDB(){
        
        // $truncate_models = ['User_CMSEditor'];
        // foreach ($truncate_models as $t) {
        //     $this->add('xepan\cms\Model_'.$t)->deleteAll();
        // }

        $user = $this->add('xepan\base\Model_User_SuperUser')->tryLoadAny(); 
        $editor = $this->add('xepan\cms\Model_User_CMSEditor');

        $editor['user_id'] = $user->id;
        $editor['can_edit_template'] = 1;
        $editor['can_edit_page_content'] = 1;
        $editor->save();
    }
}
