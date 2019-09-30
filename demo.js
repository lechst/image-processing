// GUI menus
var divMenu = document.getElementById( "menu" );
var guiMenu = new dat.GUI( { autoPlace : false , width : 450 } );


// adding tooltips to dat.gui
var eachController = function ( fnc ) {
	for ( var controllerName in dat.controllers ) {
		if ( dat.controllers.hasOwnProperty( controllerName ) ) {
			fnc( dat.controllers[ controllerName ] );
		}
	}
};
var setTitle = function ( v ) {
	// __li is the root dom element of each controller
	if ( v ) {
		this.__li.setAttribute( "title" , v );
	} else {
		this.__li.removeAttribute( "title" )
	}
	return this;
};
eachController( function ( controller ) {
	if ( !controller.prototype.hasOwnProperty( "title" ) ) {
		controller.prototype.title = setTitle;
	}
} );

// main GUI object
var guiObj = {}; // gui object containing all functions and parameters

// CAMERA variables
var guiCameraOptions = null;


var guiFunction = function(){

	// prepare dat.gui containers
	divMenu.appendChild( guiMenu.domElement );

	// CAMERA options
	guiCameraOptions = guiMenu.addFolder( "Camera options" );
	guiCameraOptions.open();
	// set camera shift from the center of the scene along X axis (in current scene's width in pixels units)
	Object.defineProperty( guiObj , "cameraLR" , {
		get : function () {
			return window.imageAPI.getCameraPosition().x;
		} ,
		set : function ( cameraPositionX ) {
			var cameraPositionY = window.imageAPI.getCameraPosition().y;
			window.imageAPI.setCameraPosition( cameraPositionX , cameraPositionY );
		}
	} );
	guiCameraOptions.add( guiObj , "cameraLR" , -0.5 , 0.5 ).step( 0.01 ).listen().name( "camera left-right" )
		.title( "Moves camera inside of the scene. The value is in the scene's width units, and means offset from it's center in X-axis's direction." );
	// set camera shift from the center of the scene along Y axis (in current scene's height in pixels units)
	Object.defineProperty( guiObj , "cameraUD" , {
		get : function () {
			return window.imageAPI.getCameraPosition().y;
		} ,
		set : function ( cameraPositionY ) {
			var cameraPositionX = window.imageAPI.getCameraPosition().x;
			window.imageAPI.setCameraPosition( cameraPositionX , cameraPositionY );
		}
	} );
	guiCameraOptions.add( guiObj , "cameraUD" , -0.5 , 0.5 ).step( 0.01 ).listen().name( "camera down-up" )
		.title( "Moves camera inside of thescene. The value is in the scene's height units, and means offset from it's center in Y-axis's direction." );

};


guiFunction();