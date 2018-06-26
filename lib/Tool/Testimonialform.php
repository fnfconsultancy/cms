<?php
namespace xepan\cms;

class Tool_Testimonialform extends \xepan\cms\View_Tool{
	public $contact_model;
	public $options = [
				'category_id'=>0,
				'default_status'=>'Pending',
				'show_testimonial_history'=>true,
				'success_message'=>'thank you for testimonial'
			];
	function init(){
		parent ::init();

		if($this->owner instanceof \AbstractController){	
			$this->add('View')->set('please select testimonial options, by double clicking on it')->addClass('alert alert-info');
			return;		
		}
		if(!$this->options['category_id']){	
			$this->add('View_Error')->set('please select testimonial category, by double clicking on it')->addClass('alert alert-error');
			return;		
		} 

		$this->contact_model = $this->add('xepan\base\Model_Contact');
		if(!$this->contact_model->loadLoggedin()){
			$this->add('View')->set('please login first to write a testimonial');
			return false;
		}

		$model = $this->add('xepan\cms\Model_Testimonial');
		$model->addCondition('contact_id',$this->contact_model->id);
		$model->addCondition('category_id',$this->options['category_id']);
		$model->addCondition('status',$this->options['default_status']);

		$form= $this->add('Form');
		$form->add('xepan\base\Controller_FLC')
				->showLables(true)
				->addContentSpot()
				->makePanelCollepsible(true)
				->layout([
						'name~Title'=>'Add New Testimonial~c1~6',
						'rating'=>'c7~6',
						'description'=>'c4~6',
						'video_url'=>'c5~6',
						
						'FormButtons~&nbsp;'=>'c8~12'

					]);
				
		$form->setModel($model,['name','description','video_url','rating']);
		$form->addSubmit('Submit')->addClass('btn btn-primary');


		if($this->options['show_testimonial_history']){
			$test_record = $this->add('xepan\cms\Model_Testimonial');
			$test_record->addCondition('contact_id',$this->contact_model->id);
			$test_record->setOrder('id','desc');

			$grid = $this->add('xepan\base\grid');
			$grid->fixed_header = false;
			$grid->template->tryDel('quick_search_wrapper');
			$grid->setModel($test_record,['created_at','name','rating','description','status']);
			$grid->addPaginator(5);
		}

		if($form->isSubmitted()){
			$form->save();
			$js = [$form->js()->reload()];
			if($this->options['show_testimonial_history'])
				$js[] = $grid->js()->reload();

			$form->js(null,$js)->univ()->successMessage($this->options['success_message'])->execute();

		}



			
	}
}