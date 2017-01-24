<?php

/**
* description: ATK Model
* 
* @author : Gowrav Vishwakarma
* @email : gowravvishwakarma@gmail.com, info@xavoc.com
* @website : http://xepan.org
* 
*/

namespace xepan\cms;

class Model_Webpage extends \xepan\base\Model_Table{
	public $table='webpage';
	public $acl_type = 'Webpage';

	function init(){
		parent::init();		

		$this->hasOne('xepan\cms\Template','template_id');

		$this->addField('name')->hint('used for display ie. menu');
		$this->addField('path')->hint('folder_1/folder_2/template_name.html');
		$this->addField('is_template')->type('boolean');
		$this->addField('is_muted')->type('boolean')->hint('for show or hide on menu');

		$this->hasMany('xepan\cms\Webpage','template_id',null,'Pages');

		$this->is([
			'name|to_trim|required',
			'path|to_trim|required',
		]);

		$this->addHook('beforeSave',$this);
	}

	function beforeSave(){

		$path = $this->api->pathfinder->base_location->base_path.'/websites/'.$this->app->current_website_name."/www";
		if($this['is_template']){
			$path .= "/layout";
		}

		$path_array = explode("/", $this['path']);
		$count = count($path_array);

		$original_name="";
		//for loop check folder or file exist or not
		for ($i=0; $i < $count ; $i++) {
			$name = trim($path_array[$i]);
			$name = $this->app->normalizeName($name,'.');

			if(!strlen($name)){
				throw $this->exception('wrong path file name must define','ValidityCheck')->setField('path');
			}
			
			//check if count is last for file
			if($count == ($i+1)){
				$temp_array = explode(".", $name);
				if(strtolower(trim(end($temp_array))) != "html"){
					$name .= ".html";
				}

				$path .= "/".$name;
				if(!file_exists($path)){
					$file = \Nette\Utils\FileSystem::write($path," ");
		  		}

				$original_name .= $name;
			}else{
				// for creation of folder
				$path .= "/".$name;
				if(!file_exists($path)){
					$folder = \Nette\Utils\FileSystem::createDir($path);
		  		}

				$original_name .= $name."/";
			}

		}

		$this['path'] = $original_name;
	}
}
