angular.module('starter.controllers', [])

.controller('ProjectsCtrl',function($scope,$http,$ionicLoading,$ionicPlatform,$q,$cordovaFileTransfer,$cordovaFile,Projects){

	//Parameters
	$scope.projects = Projects.all();

	$scope.notification = "";

	$scope.notify = function(message){
		$scope.notification =  message;

		setTimeout(function () {
	        $scope.$apply(function(){
	            $scope.dismissNotification();
	        });
	    }, 3000);

	}

	$scope.dismissNotification = function(){
		$scope.notification = "";
	}



	$scope.checkFile = function(path){



		$cordovaFile.checkFile(cordova.file.dataDirectory, path.replace(/^.*[\\\/]/, ''))
	      .then(function (success) {
	      	alert("found: " + path)
	        
	      }, function (error) {
	        alert("test");
	      });
	}


	//Methods
	$scope.addProject = function(projectCode){

		cordova.plugins.Keyboard.close();

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
					$scope.notify(project.title + " is already added");
					$ionicLoading.hide();
				}

		    
		      }else{
		        $scope.notify(data.message);
		        $ionicLoading.hide();
		      }


		    })

		    .error(function(data){
		        $scope.notify("Sorry, an error has accured :(");
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

		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onSuccess, null);

		function onSuccess(fileSystem){

			var urls = [];
		    var trustHosts = true
		    var options = {};
		    var targetUrls = [];

		 	urls.push(project.thumbnail);



		 	project.thumbnail = fileSystem.root.toURL() + "project" + project.id + "_thumbnail.jpg";
		 	targetUrls.push(project.thumbnail);




		 	for(var i = 0; i < project.views.length; i++){
		 		urls.push(project.views[i].imgLeftUrl);
		 		urls.push(project.views[i].imgRightUrl);

		 		project.views[i].imgLeftUrl = fileSystem.root.toURL() + "project" + project.id + "_view" + project.views[i].viewId + "_left.jpg";
		 		project.views[i].imgRightUrl = fileSystem.root.toURL() + "project" + project.id + "_view" + project.views[i].viewId + "_right.jpg";
		 		
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

	

	}



	$scope.addTestProject = function(){

		if( ionic.Platform.isIOS() || ionic.Platform.isAndroid() ) {
			$scope.addProject("testproject");

		}else{

			var testProject1 = {

				id:99,
				title:"Test project",
				description:"Dit is een test project",
				thumbnail:"../img/scene1_left.jpg",
				views:[
					{
						viewId:97,
						title:"1. keuken",
						imgLeftUrl:"../img/scene1_left.jpg",
						imgRightUrl:"../img/scene1_right.jpg",

					},{
						viewId:98,
						title:"2. buitenview",
						imgLeftUrl:"../img/scene2_view1_left.jpg",
						imgRightUrl:"../img/scene2_view1_right.jpg",

					}

				]

			}

			var testProject2 = {

				id:98,
				title:"Test project 2",
				description:"Dit is een test project",
				thumbnail:"../img/scene1_left.jpg",
				views:[]

			}

			Projects.add(testProject1);
			Projects.add(testProject2);
		}
	
	}


 	$scope.$on('$ionicView.afterEnter', function(){

 		$scope.projects = Projects.all();

		if($scope.projects.length == 0){
  			$scope.addTestProject();
  		}
	});

})








.controller('ProjectDetailsCtrl', function($scope, $stateParams,$ionicHistory,Projects) {
 
  $scope.project = Projects.get($stateParams.projectId);

  $scope.Remove = function(project){

  	Projects.remove(project);

  	$ionicHistory.goBack();

  }

})





.controller('VRViewerCtrl', function($scope, $stateParams,$ionicHistory,$cordovaFile,$ionicLoading,Simulator,Projects) {

	$scope.imgLeftUrl = Projects.getView($stateParams.viewId).imgLeftUrl;
	$scope.imgRightUrl = Projects.getView($stateParams.viewId).imgRightUrl;

	$scope.$on('$ionicView.loaded', function (viewInfo, state) {

		$ionicLoading.show({
	      template: 'Loading virtual reality...'
	    });

        if ('orientation' in screen) {
		   screen.lockOrientation('landscape');

		   setTimeout(function(){ Simulator.start($scope.imgLeftUrl,$scope.imgRightUrl); $ionicLoading.hide(); },500);
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

	$scope.tap = function(event){

		icon = document.querySelector(".double-tap-icon")


		icon.className = icon.className + " double-tap-icon-animate";


		setTimeout(
			function(){
				icon.className = "double-tap-icon";
			},500);
	}

})








.directive('detectGestures', function($ionicGesture) {
  return {

    restrict :  'A',

    link : function(scope, elem, attrs) {

        var gestureType = attrs.gestureType;
      	$ionicGesture.on('doubletap', scope.quit, elem);
      	$ionicGesture.on('tap', scope.tap, elem);
      	$ionicGesture.on('swipe', scope.quit, elem);

    }
  }
});









