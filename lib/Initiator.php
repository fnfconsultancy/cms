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
        $m->addItem([' Configuration','icon'=>' fa fa-cog'],'xepan_cms_configuration');
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

        // execute template server side components
        $old_js_block = $this->app->template->tags['js_block'];
        $old_js_include = $this->app->template->tags['js_include'];
        $old_js_doc_ready = $this->app->template->tags['document_ready'];

        $auth_layout = null;
        if(($offline_content = $this->isSiteOffline()) && !$this->app->recall('offline_continue',false) ){
            $this->app->template = $this->app->add('GiTemplate')->loadTemplate('plain');
            $this->app->page_object=$this->app->add('View',null,'Content');
            $this->app->add('View')->setHTML($offline_content);

            $this->app->template->appendHTML('js_block',implode("\n", $old_js_block[1]));
            $this->app->template->appendHTML('js_include',implode("\n", $old_js_include[1]));
            $this->app->template->appendHTML('document_ready',implode("\n",$old_js_doc_ready[1]));
            $auth_layout = 'xepan\base\Layout_Login';
        }


        $user = $this->add('xepan\base\Model_User');
        
        $auth = $this->app->add('BasicAuth',['login_layout_class'=>$auth_layout]);
        $auth->usePasswordEncryption('md5');
        $auth->setModel($user,'username','password');

        if($this->isSiteOffline() && !$this->app->recall('offline_continue',false) ){
            $auth->addHook('createForm',function($a,$p){
                $f = $p->add('Form',null,null,['form/minimal']);
                $f->add('H2')->set('Login to proceed')->setAttr('align','center');
                $f->setLayout(['layout/offlinelogin','form_layout']);
                $f->addField('Line','username','Email address');
                $f->addField('Password','password','Password');
                $f->addStyle(['width'=>'30%','margin-left'=>'auto','margin-right'=>'auto']);
                $this->breakHook($f);
            });

            $auth->check();
            $this->app->memorize('offline_continue',true);
            $this->app->redirect($this->app->url());
        }

        if($_GET['js_redirect_url']){                                    
            $this->app->js(true)->univ()->dialogOK('Redirecting To Printing Demo', 'Website URL'.$_GET['js_redirect_url'])->redirect($_GET['js_redirect_url']);
        }

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

    function isSiteOffline(){
        $config_m = $this->add('xepan\base\Model_ConfigJsonModel',
        [
            'fields'=>[
                        'site_offline'=>'Line',
                        'offline_site_content'=>'xepan\base\RichText',
                        ],
                'config_key'=>'FRONTEND_WEBSITE_STATUS',
                'application'=>'cms'
        ]);
        
        $config_m->tryLoadAny();

        if(!$config_m['site_offline']) return false;
        return $config_m['offline_site_content'];
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
