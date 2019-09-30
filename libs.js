(function () {
	var LIBS = function LIBS() {
		var that = this;
		this.degToRad = function ( angle ) {
			return (angle * Math.PI / 180);
		};
		this.get_projection = function ( angle , a , zMin , zMax ) {
			var tan = Math.tan( that.degToRad( 0.5 * angle ) ) ,
				A = -(zMax + zMin) / (zMax - zMin) ,
				B = (-2 * zMax * zMin) / (zMax - zMin);
			return [
				1 / tan , 0 , 0 , 0 ,
				0 , a / tan , 0 , 0 ,
				0 , 0 , A , -1 ,
				0 , 0 , B , 0
			];
		};
		this.get_I4 = function () {
			return [ 1 , 0 , 0 , 0 ,
				0 , 1 , 0 , 0 ,
				0 , 0 , 1 , 0 ,
				0 , 0 , 0 , 1 ];
		};
		this.set_I4 = function ( m ) {
			m[ 0 ] = 1, m[ 1 ] = 0, m[ 2 ] = 0, m[ 3 ] = 0,
				m[ 4 ] = 0, m[ 5 ] = 1, m[ 6 ] = 0, m[ 7 ] = 0,
				m[ 8 ] = 0, m[ 9 ] = 0, m[ 10 ] = 1, m[ 11 ] = 0,
				m[ 12 ] = 0, m[ 13 ] = 0, m[ 14 ] = 0, m[ 15 ] = 1;
		};
		this.scale_XYZ = function ( m , x , y , z ) {
			m[ 0 ] *= x, m[ 5 ] *= y, m[ 10 ] *= z;
		};
		this.rotateX = function ( m , angle ) {
			var c = Math.cos( angle );
			var s = Math.sin( angle );
			var mv1 = m[ 1 ] , mv5 = m[ 5 ] , mv9 = m[ 9 ];
			m[ 1 ] = m[ 1 ] * c - m[ 2 ] * s;
			m[ 5 ] = m[ 5 ] * c - m[ 6 ] * s;
			m[ 9 ] = m[ 9 ] * c - m[ 10 ] * s;
			m[ 2 ] = m[ 2 ] * c + mv1 * s;
			m[ 6 ] = m[ 6 ] * c + mv5 * s;
			m[ 10 ] = m[ 10 ] * c + mv9 * s;
		};
		this.rotateY = function ( m , angle ) {
			var c = Math.cos( angle );
			var s = Math.sin( angle );
			var mv0 = m[ 0 ] , mv4 = m[ 4 ] , mv8 = m[ 8 ];
			m[ 0 ] = c * m[ 0 ] + s * m[ 2 ];
			m[ 4 ] = c * m[ 4 ] + s * m[ 6 ];
			m[ 8 ] = c * m[ 8 ] + s * m[ 10 ];
			m[ 2 ] = c * m[ 2 ] - s * mv0;
			m[ 6 ] = c * m[ 6 ] - s * mv4;
			m[ 10 ] = c * m[ 10 ] - s * mv8;
		};
		this.rotateZ = function ( m , angle ) {
			var c = Math.cos( angle );
			var s = Math.sin( angle );
			var mv0 = m[ 0 ] , mv4 = m[ 4 ] , mv8 = m[ 8 ];
			m[ 0 ] = c * m[ 0 ] - s * m[ 1 ];
			m[ 4 ] = c * m[ 4 ] - s * m[ 5 ];
			m[ 8 ] = c * m[ 8 ] - s * m[ 9 ];
			m[ 1 ] = c * m[ 1 ] + s * mv0;
			m[ 5 ] = c * m[ 5 ] + s * mv4;
			m[ 9 ] = c * m[ 9 ] + s * mv8;
		};
		this.translateX = function ( m , t ) {
			m[ 12 ] += t;
		};
		this.translateY = function ( m , t ) {
			m[ 13 ] += t;
		};
		this.translateZ = function ( m , t ) {
			m[ 14 ] += t;
		};
	};
	window.LIBS = LIBS;
})();
