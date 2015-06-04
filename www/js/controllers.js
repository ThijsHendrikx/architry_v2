angular.module('starter.controllers', [])

.controller('ProjectsCtrl',function($scope,$http,$ionicLoading,$ionicPlatform,$q,$cordovaFileTransfer,Projects){

	//Parameters
	$scope.projects = Projects.all();


	//Methods
	$scope.addProject = function(projectCode){

		$ionicLoading.show({
	      template: 'Fetching project...'
	    });

		var postData = {code:projectCode};

	    $http.post('http://i281998.iris.fhict.nl/architry/getproject.php', postData)

		    .success(function (data) {

		      if(data.message == "success"){

		      	var project = data.data;

		      	if(!$scope.projectExists(project)){

					$scope.downloadMediaForProject(project);
				
				}else{
					alert("project already exists");
					$ionicLoading.hide();
				}

		    
		      }else{
		        alert(data.message);
		        $ionicLoading.hide();
		      }


		    })

		    .error(function(data){
		        alert( "failure message: " + JSON.stringify({data: data}));
		        $ionicLoading.hide();
		    });

	}




	$scope.projectExists = function(project){
		for(var i = 0; i < $scope.projects.length; i++){
      		if($scope.projects[i].id == project.id){
      			return true;
     		}
      	}

      	return false;
	}




	//Downloads the image and or video files from an project
	$scope.downloadMediaForProject = function(project){

		var urls = [];
	    var trustHosts = true
	    var options = {};
	    var targetUrls = [];

	 	urls.push(project.thumbnail);



	 	project.thumbnail = cordova.file.documentsDirectory + "project" + project.id + "_thumbnail.jpg";
	 	targetUrls.push(project.thumbnail);



	 	for(var i = 0; i < project.views.length; i++){
	 		urls.push(project.views[i].imgLeftUrl);
	 		urls.push(project.views[i].imgRightUrl);

	 		project.views[i].imgLeftUrl = cordova.file.documentsDirectory + "project" + project.id + "_view" + project.views[i].viewId + "_left.png";
	 		project.views[i].imgRightUrl = cordova.file.documentsDirectory + "project" + project.id + "_view" + project.views[i].viewId + "_right.png";
	 		
	 		targetUrls.push(project.views[i].imgLeftUrl);
	 		targetUrls.push(project.views[i].imgRightUrl);

	 	}

	 	var promises = [];

		for(var i = 0; i < urls.length; i++){
			
			promises.push($cordovaFileTransfer.download(urls[i],targetUrls[i], options, trustHosts));
		
		}
		 
		
		$q.all(promises).then(function(res) {

			for(var i = 0; i < res.length; i++){
				console.log(res[i].fullPath);
			}

			Projects.add(project);
 
			$scope.projects = Projects.all();

			$ionicLoading.hide();
		});

	}



	$scope.addTestProject = function(){

		$scope.addProject("testproject");

		var testProject = {

			id:99,
			title:"Test project",
			description:"Dit is een test project",
			thumbnail:"../img/scene1_left.jpg",
			views:[
				{
					viewId:97,
					title:"Test1",
					imgLeftUrl:"../img/scene1_left.jpg",
					imgRightUrl:"../img/scene1_right.jpg",

				},{
					viewId:98,
					title:"Test2",
					imgLeftUrl:"../img/scene2_view1_left.jpg",
					imgRightUrl:"../img/scene2_view1_right.jpg",

				}

			]

		}

		$scope.projects.push(testProject);
	
	}


	$ionicPlatform.ready(function() {

  		if($scope.projects.length == 0){
  			$scope.addTestProject();
  		}

 	});

})








.controller('ProjectDetailsCtrl', function($scope, $stateParams,Projects) {
 
  $scope.project = Projects.get($stateParams.projectId);

})





.controller('VRViewerCtrl', function($scope, $stateParams,$ionicHistory,$cordovaFile,$ionicLoading,Simulator,Projects) {

	Simulator.imgLeftUrl = Projects.getView($stateParams.viewId).imgLeftUrl;
	Simulator.imgRightUrl = Projects.getView($stateParams.viewId).imgRightUrl;

	alert( Simulator.imgRightUrl );

	$scope.$on('$ionicView.loaded', function (viewInfo, state) {

		$ionicLoading.show({
	      template: 'Loading virtual reality...'
	    });

        if ('orientation' in screen) {
		   screen.lockOrientation('landscape');

		   setTimeout(function(){ Simulator.start(); $ionicLoading.hide(); },500);
		}

		window.plugins.insomnia.keepAwake()

    });




    $scope.$on('$ionicView.unloaded', function (viewInfo, state) {
        if ('orientation' in screen) {
		    screen.lockOrientation("portrait");
		}

		window.plugins.insomnia.allowSleepAgain()
    });


 
    $scope.quit = function(event)  {
	   $ionicHistory.goBack();
	 
	
	}

})








.directive('detectGestures', function($ionicGesture) {
  return {

    restrict :  'A',

    link : function(scope, elem, attrs) {

        $ionicGesture.on('doubletap', scope.quit, elem);

    }
  }
});









