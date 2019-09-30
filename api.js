window.imageAPI = {};

window.imageAPI.getCameraPosition = function(){
	return {
		x: 0,
		y: 0
	}
};

window.imageAPI.setCameraPosition = function(x, y){
	console.log("Set x: "+x+" y:"+y);
};