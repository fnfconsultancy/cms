<?php

/**
* description: ATK Page
* 
* @author : Gowrav Vishwakarma
* @email : gowravvishwakarma@gmail.com, info@xavoc.com
* @website : http://xepan.org
* 
*/

namespace xepan\cms;

class page_admin_save_page extends \Page {

	function init(){
		parent::init();
		
		if(!$this->api->auth->isLoggedIn())	{
			$this->js()->univ()->errorMessage('You Are Not Logged In')->execute();
		}
		
		if ( $_POST['length'] != strlen( $_POST['body_html'] ) ) {
			$this->js()->univ()->successMessage( 'Length send ' . $_POST['length'] . " AND Length calculated again is " . strlen( $_POST['body_html'] ) )->execute();
		}

		if ( $_POST['crc32'] != sprintf("%u",crc32( $_POST['body_html'] ) )) {
			$this->js()->univ()->successMessage( 'CRC send ' . $_POST['crc32'] . " AND CRC calculated again is " . sprintf("%u",crc32( $_POST['body_html'] )) )->execute();
		}

		if(strpos($_POST['file_path'], realpath('websites/'.$this->app->current_website_name)!==0)){
			$this->js()->univ()->errorMessage('You cannot save in this location')->execute();
		}
		$html_content = urldecode( trim( $_POST['body_html'] ) );

		// convert all absolute url to relative
		$domain = $this->app->pm->base_url.$this->app->pm->base_path.'websites/'.$this->app->current_website_name.'/www/';
		$html_content = str_replace($domain, '', $html_content);

		file_put_contents($_POST['file_path'], $html_content);

		$this->js()->_selectorDocument()->univ()->successMessage("Content Saved")->execute();
	}
}
