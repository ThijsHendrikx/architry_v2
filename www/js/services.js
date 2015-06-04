angular.module('starter.services', [])

.factory('Projects',function(){

	var projects = JSON.parse(window.localStorage['projects'] || '[]');


	return {
	    all: function() {
	      return projects;
	    },


	    remove: function(project) {

        var aprojects = JSON.parse(window.localStorage['projects'] || '[]');

	      aprojects.splice(aprojects.indexOf(project), 1);

        window.localStorage["projects"] = JSON.stringify(aprojects);

        projects = aprojects;
	    },


	    get: function(projectId) {

	      for (var i = 0; i < projects.length; i++) {
	        if (projects[i].id == parseInt(projectId)) {
	          return projects[i];
	        }
	      }
	      return null;
	    },

	    getView: function(viewId){
	    	
	    	for (var i = 0; i < projects.length; i++) {
	          
	          for (var x = 0; x < projects[i].views.length; x++) {
			      
			        if (projects[i].views[x].viewId == parseInt(viewId)) {
			          
			          return projects[i].views[x];
			        
			        }
		      	}

	      	}
	      	
	      	return null;

	    },



	    add: function(project){

	      var aprojects = JSON.parse(window.localStorage['projects'] || '[]');


	      //Delete the test project if exists
	      for(var i = 0; i < aprojects.length; i++){
	      	if(parseInt(aprojects[i].id) == -1){

	      		//this.remove(aprojects[i]);
	      	}
	      }

	      aprojects.reverse();
	      aprojects.push( project );
	      aprojects.reverse();

	      window.localStorage["projects"] = JSON.stringify(aprojects);

	      projects = aprojects;
	    }
	};

})








.factory("Simulator",function(){

	var translationLeft = null;
  var translationRight = null;

  var rotationLeft = null;
  var rotationRight = null;

  var currentRotation = 0;
  var currentTranslation = 0;

  var translationWidth = 0;

  var imgLeftUrl = "";
  var imgRightUrl = "";

  return{

    start:function(){

      //Scenes
      var sceneRTTLeft = new THREE.Scene();
      var sceneRTTRight = new THREE.Scene();

      var scene = new THREE.Scene();


      //Cameras
      var cameraRTTLeft = new THREE.PerspectiveCamera( 90, (window.innerWidth / 2) / window.innerHeight,1, 1000);
      var cameraRTTRight = new THREE.PerspectiveCamera( 90, (window.innerWidth / 2) / window.innerHeight,1, 1000);

      var camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, -10000, 10000 );

      //Renderer
      var renderer = new THREE.WebGLRenderer({clearColor:0x888888,antialias:true});
      renderer.setSize( window.innerWidth, window.innerHeight );
     
      document.querySelector(".simulator").appendChild( renderer.domElement );



      //Geometry
      var sphereGeometry = new THREE.SphereGeometry( 20, 32, 32 );
      var planeGeometry = new THREE.PlaneGeometry( window.innerWidth / 2, window.innerHeight );

      

      //Textures
      var textureRTTLeft = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBFormat } );
      var textureRTTRight = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBFormat } );



      //Materials
      var materialRTTLeft = new THREE.MeshBasicMaterial({
        side: THREE.BackSide,
        map: THREE.ImageUtils.loadTexture(imgLeftUrl)
      });

      var materialRTTRight = new THREE.MeshBasicMaterial({
        side: THREE.BackSide,
        map: THREE.ImageUtils.loadTexture(imgRightUrl)
      });

     var materialLeft =  new THREE.MeshBasicMaterial({map:textureRTTLeft} );
     var materialRight = new THREE.MeshBasicMaterial({map:textureRTTRight} );



      //Meshes
      var sphereLeft  = new THREE.Mesh( sphereGeometry, materialRTTLeft );
      var sphereRight = new THREE.Mesh( sphereGeometry, materialRTTRight );

      var planeLeft  = new THREE.Mesh( planeGeometry, materialLeft );
      var planeRight = new THREE.Mesh( planeGeometry, materialRight );
      

      sceneRTTLeft.add(  sphereLeft );
      sceneRTTRight.add( sphereRight );

      scene.add(planeLeft);
      scene.add(planeRight);


      camera.position.z = 5;


      planeLeft.position.x = -window.innerWidth / 4;
      planeRight.position.x = -window.innerWidth / -4;


      controlsLeft = new DeviceOrientationController( cameraRTTLeft, renderer.domElement );
      controlsLeft.connect();  

      controlsLeft.enableManualZoom = false;     

      controlsRight = new DeviceOrientationController( cameraRTTRight, renderer.domElement );
      controlsRight.connect();     

      controlsRight.enableManualZoom = false;
      
 

      var render = function () {
        requestAnimationFrame( render );

        controlsLeft.update();
        controlsRight.update();

        renderer.render(sceneRTTLeft, cameraRTTLeft,textureRTTLeft,true);

        renderer.render(sceneRTTRight, cameraRTTRight,textureRTTRight,true);

        renderer.render(scene,camera);
      };

      render();
     
    }


  }




})