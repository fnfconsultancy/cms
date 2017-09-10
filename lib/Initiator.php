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

        if(!$this->app->getConfig('hidden_xepan_cms',false)){
            $this->app->cms_menu = $m = $this->app->top_menu->addMenu('CMS');
            // $menu = $this->app->side_menu->addMenu(['Website','icon'=>' fa fa-globe','badge'=>['xoxo' ,'swatch'=>' label label-primary pull-right']],'#');
            $m->addItem([' Carousel','icon'=>' fa fa-file-image-o'],'xepan_cms_carousel');
            $m->addItem([' Template & Pages','icon'=>' fa fa-file'],'xepan_cms_templateandpage');
            $m->addItem([' Themes','icon'=>' fa fa-file'],'xepan_cms_theme');
            $m->addItem([' FileManager','icon'=>' fa fa-edit'],'xepan_cms_websites');
            $m->addItem([' CMS Editors','icon'=>' fa fa-edit'],'xepan_cms_cmseditors');
            $m->addItem([' Custom Form','icon'=>' fa fa-wpforms'],'xepan_cms_customform');
            $m->addItem([' Configuration','icon'=>' fa fa-cog'],'xepan_cms_configuration');
        }
        
        return $this;
    }

    function exportEntities($app,&$array){
        $array['CarouselCategory'] = ['caption'=>'CarouselCategory','type'=>'DropDown','model'=>'xepan\cms\Model_CarouselCategory'];
        $array['CarouselImage'] = ['caption'=>'CarouselImage','type'=>'DropDown','model'=>'xepan\cms\Model_CarouselImage'];        
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

        if($this->app->isEditing){
            $this->app->template->appendHTML('js_include','<link rel="stylesheet" type="text/css" href="'.$this->api->url()->absolute()->getBaseURL().'vendor/xepan/cms/templates/css/xepan_editor_loader.css" />');
            $this->app->jui->addStaticInclude($this->api->url()->absolute()->getBaseURL().'vendor/xepan/cms/templates/js/pace.js');
            $this->app->js(true,"Pace.on('done',function(){
                ".(string) $this->app->js()->_selector('.xepan-toolbar,.xepan-cms-toolbar,.epan-editor-top-panel')->show().";
            });");

            $this->app->js(true,'$("body").on("beforeSave",function(){$("body").find(".pace").remove();$("body").find("meta"); });');
            // $this->app->js(true,'$("body").find("[http-equiv=\"Content-Type\"]").css("border","2px solid red");');

        }

        $extra_info = json_decode($this->app->epan['extra_info'],true);
        $this->app->template->trySet('title',@$this->app->xepan_cms_page['page_title']?:@$extra_info['title']);
        $this->app->template->trySet('meta_keywords',@$this->app->xepan_cms_page['meta_kewords']?:@$extra_info['meta_keyword']);
        $this->app->template->trySet('meta_description',@$this->app->xepan_cms_page['meta_description']?:@$extra_info['meta_description']);
        $this->app->template->trySetHTML('after_body_code',@$this->app->xepan_cms_page['after_body_code']?:@$extra_info['after_body_code']);

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
            if($offline_content['continue_crons'] && $this->app->page == 'xepan_base_cron'){
            }else{
                $this->app->template = $this->app->add('GiTemplate')->loadTemplate('plain');
                $this->app->page_object=$this->app->add('View',null,'Content');
                $this->app->add('View')->setHTML($offline_content['offline_site_content']);

                $this->app->template->appendHTML('js_block',implode("\n", $old_js_block[1]));
                $this->app->template->appendHTML('js_include',implode("\n", $old_js_include[1]));
                $this->app->template->appendHTML('document_ready',implode("\n",$old_js_doc_ready[1]));
                $auth_layout = 'xepan\base\Layout_Login';
            }
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

            if($offline_content['continue_crons'] && $this->app->page == 'xepan_base_cron'){
            }
            else{
                $auth->check();
                $this->app->memorize('offline_continue',true);
                $this->app->redirect($this->app->url());
            }
        }

        if($this->app->isEditing){
            $this->app->jui
                ->addStaticInclude('ace/ace/ace')
                ->addStaticInclude('ace/ace/mode-html')
                ->addStaticInclude('ace/ace/mode-php')
                ->addStaticInclude('ace/ace/mode-css')
                ->addStaticInclude('ace/ace/theme-tomorrow')
                ->addStaticInclude('ace/jquery-ace.min')

                ->addStaticInclude('iconset/iconset-glyphicon.min')
                ->addStaticInclude('iconset/iconset-fontawesome-4.0.0.min')
                ->addStaticInclude('bootstrap-iconpicker.min')
                ->addStaticStyleSheet('bootstrap-iconpicker.min')
                ;
        }

        $this->app->jui->addStaticInclude('pnotify.custom.min');
        $this->app->jui->addStaticInclude('xepan.pnotify');
        $this->app->jui->addStaticStyleSheet('pnotify.custom.min');
        $this->app->jui->addStaticStyleSheet('animate');
        $this->app->jui->addStaticInclude('xepan_jui');
        $this->app->jui->addStaticInclude('xepan_jui');
        $this->app->jui->addStaticStyleSheet('bootstrap.min');
        $this->app->jui->addStaticInclude('bootstrap.min');
        $this->app->jui->addStaticStyleSheet('font-awesome');
        // check my style css is exist or not
        $path = $this->api->pathfinder->base_location->base_path.'/websites/'.$this->app->current_website_name."/www/css";
        if(!file_exists($path)){
            $folder = \Nette\Utils\FileSystem::createDir($path);
        }  
        $path .= "/mystyle.css";
        $mystyle = " /*Define Your Custom CSS*/";
        if(!file_exists($path)){
            $file = \Nette\Utils\FileSystem::write($path,$mystyle);
        }
        $this->app->template->appendHTML('js_include','<link id="xepan-cms-custom-mystylecss" type="text/css" href="websites/'.$this->app->current_website_name.'/www/css/mystyle.css" rel="stylesheet" />'."\n");
        // end of custom css include 

        if($_GET['js_redirect_url']){                                    
            $this->app->js(true)->univ()->dialogOK('Redirecting To Page', 'Website URL'.$_GET['js_redirect_url'])->redirect($_GET['js_redirect_url']);
        }

        $old_title = $this->app->template->tags['title'];
        $old_meta_keywords = $this->app->template->tags['meta_keywords'];
        $old_meta_description = $this->app->template->tags['meta_description'];
        $old_after_body_code = $this->app->template->tags['after_body_code'];

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
        $this->app->template->trySetHTML('after_body_code',@implode("\n",$old_after_body_code[1]));

        if(isset($this->app->editing_template))
            $this->app->exportFrontEndTool('xepan\cms\Tool_TemplateContentRegion');

        $this->app->jui->addStylesheet('jquery-ui');
            
        $this->app->exportFrontEndTool('xepan\cms\Tool_Text');
        $this->app->exportFrontEndTool('xepan\cms\Tool_Container');
        $this->app->exportFrontEndTool('xepan\cms\Tool_Columns');
        $this->app->exportFrontEndTool('xepan\cms\Tool_Image');
        $this->app->exportFrontEndTool('xepan\cms\Tool_SVG');
        $this->app->exportFrontEndTool('xepan\cms\Tool_Icon');
        $this->app->exportFrontEndTool('xepan\cms\Tool_CustomForm');
        $this->app->exportFrontEndTool('xepan\cms\Tool_Carousel');
        $this->app->exportFrontEndTool('xepan\cms\Tool_Marquee');
        $this->app->exportFrontEndTool('xepan\cms\Tool_BootStrapMenu');
        $this->app->exportFrontEndTool('xepan\cms\Tool_Button');
        $this->app->exportFrontEndTool('xepan\base\Tool_UserPanel');
        $this->app->exportFrontEndTool('xepan\base\Tool_Location');
        $this->app->exportFrontEndTool('xepan\cms\Tool_HtmlBlock');
        $this->app->exportFrontEndTool('xepan\cms\Tool_ImageGallery');
        $this->app->exportFrontEndTool('xepan\cms\Tool_ImageWithDescription');
        $this->app->exportFrontEndTool('xepan\cms\Tool_PopupToolTip');
        $this->app->exportFrontEndTool('xepan\cms\Tool_BootStrapSlider');
        $this->app->exportFrontEndTool('xepan\cms\Tool_AwesomeSlider');
        $this->app->exportFrontEndTool('xepan\cms\Tool_EasyFullscreenCarouselSlider');

        return $this;
    }

    function isSiteOffline(){
        $config_m = $this->add('xepan\base\Model_ConfigJsonModel',
        [
            'fields'=>[
                        'site_offline'=>'Line',
                        'offline_site_content'=>'xepan\base\RichText',
                        'continue_crons'=>'Checkbox',
                        ],
                'config_key'=>'FRONTEND_WEBSITE_STATUS',
                'application'=>'cms'
        ]);
        
        $config_m->tryLoadAny();

        if(!$config_m['site_offline']) return false;
        return $config_m;
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
