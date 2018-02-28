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
			$this->js()->univ()->errorMessage( 'Length send ' . $_POST['length'] . " AND Length calculated again is " . strlen( $_POST['body_html'] ) )->execute();
		}

		if ( $_POST['crc32'] != sprintf("%u",crc32( $_POST['body_html'] ) )) {
			$this->js()->univ()->errorsMessage( 'CRC send ' . $_POST['crc32'] . " AND CRC calculated again is " . sprintf("%u",crc32( $_POST['body_html'] )) )->execute();
		}

		if(strpos($_POST['file_path'], realpath('websites/'.$this->app->current_website_name)!==0)){
			$this->js()->univ()->errorMessage('You cannot save in this location')->execute();
		}

		$html_content = urldecode( trim( $_POST['body_html'] ) );

		// convert all absolute url to relative
		$domain = $this->app->pm->base_url.$this->app->pm->base_path.'websites/'.$this->app->current_website_name.'/www/';
		$html_content = str_replace($domain, '', $html_content);

		$domain = 'websites/'.$this->app->current_website_name.'/www/';
		$html_content = str_replace($domain, '', $html_content);

		// add {$Content} tag if its template being saved
		if(strpos($_POST['file_path'], $this->app->pm->base_path.'websites/'.$this->app->current_website_name.'/www/layout/')){
			$this->pq = $pq = new phpQuery();
			$this->dom = $dom = $pq->newDocument($html_content);
			foreach ($dom['.xepan-page-wrapper'] as $d) {
				$d=$pq->pq($d);
				$d->html('{$Content}');
			}
			$html_content = $dom->html();

			// open existing file load in pq
			$old_dom = $pq->newDocument(file_get_contents($_POST['file_path']));
			foreach ($old_dom['body'] as $one_body) {
				// replace body with coming content 
				$d=$pq->pq($one_body);
				$d->html($html_content);	
			}

			// assign to html_contet
			$html_content = $old_dom->html();
			// $this->js()->univ()->errorMessage('Yes its template')->execute();
		}

		// $this->js()->univ()->errorMessage($this->app->pm->base_path.'websites/'.$this->app->current_website_name.'/www/layout/')->execute();

		if($_POST['take_snapshot'] !=='N'){
			$snap = $this->add('xepan\cms\Model_Snapshots');
			$snap['content']=$html_content;
			$snap['page_url']=$_POST['file_path'];
			$snap['page_id']=$_POST['webpage_id'];
			$snap['created_by_id']=$this->add('xepan\base\Model_Contact')->loadLoggedIn(null,true)->get('id');
			$snap['name']=$_POST['take_snapshot'];
			$snap->save();
		}

		try{
			file_put_contents($_POST['file_path'], $html_content);
			$this->js()->_selectorDocument()->univ()->successMessage("Content Saved")->execute();
		}catch(\Exception $e){
			$this->js()->_selectorDocument()->univ()->errorMessage($e->getMessage())->execute();
		}

	}
}
