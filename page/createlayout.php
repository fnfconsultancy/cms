<?php

namespace xepan\cms;

class page_createlayout extends \Page{

	function page_index(){
		$return = ['status'=>'success','message'=>'layout created'];
				
		$file_name = $_GET['lname'].".html";
		$file_content = $_GET['lhtml'];

        $url = "{$_SERVER['HTTP_HOST']}";
        $domain = str_replace('www.','',$this->app->extract_domain($url))?:'www';
        $sub_domain = str_replace('www.','',$this->app->extract_subdomains($url))?:'www';
		
		$base_path	= $this->app->pathfinder->base_location->base_path.'/websites/'.$this->app->current_website_name."/www";
		
		// check websitelayout folder is exist or not
		if($this->app->epan['is_template']){
			$folder_name = 'themelayout';
		}else{
			$folder_name = 'customlayout';
		}

		// for template layout
		$folder_path = $base_path."/".$folder_name;
		if(!file_exists(realpath($folder_path))){
			\Nette\Utils\FileSystem::createDir('./websites/'.$this->app->current_website_name.'/www/'.$folder_name);
		}

		//check file with name is already exist
		$file_path = $folder_path."/".$file_name;
		if(file_exists(realpath($file_path))){
			$return['status'] = 'failed';
			$return['message'] = 'file with this is already exist';
			echo json_encode($return);
			exit;
		}

		$fs = \Nette\Utils\FileSystem::write('./websites/'.$this->app->current_website_name.'/www/'.$folder_name.'/'.$file_name,$file_content);

		echo json_encode($return);
		exit;
	}

}