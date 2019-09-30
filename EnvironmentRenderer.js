(function () {
	var EnvironmentRenderer = function EnvironmentRenderer( opts ) {
		//CANVAS & WEBGL CONTEXT
		this.canvas = document.getElementById( "canvas" );
		this.GL = null;
		try {
			this.GL = canvas.getContext( "webgl" , {
				preserveDrawingBuffer : true ,
				alpha : true ,
				premultipliedAlpha : false
			} ) || canvas.getContext( "experimental-webgl" , {
				preserveDrawingBuffer : true ,
				alpha : true ,
				premultipliedAlpha : false
			} );
		} catch ( e ) {
		}
		if ( !this.GL ) {
			alert( "Unable to initialize WebGL. Your browser may not support it." );
			this.GL = null;
		}
		this.width = this.GL.canvas.clientWidth;
		this.height = this.GL.canvas.clientHeight;
		this.GL.canvas.width = this.width;
		this.GL.canvas.height = this.height;
		this.canvas.style.backgroundColor = "rgba(0, 0, 0, 0)";
		this.defaultCursor = "default";

		//RENDERING PARAMETERS
		this.old_x = null;
		this.old_y = null;
		this.dX = 0;
		this.dY = 0;

		//SHADERS
		this.SHADER_PROGRAM = null;
		this.shader_vertex_source = "\n\
attribute vec2 position;\n\
uniform mat4 Pmatrix;\n\
uniform mat4 Vmatrix;\n\
uniform mat4 Mmatrix;\n\
varying vec2 vPos;\n\
void main(void) {\n\
gl_Position = Pmatrix*Vmatrix*Mmatrix*vec4(position, 0., 1.);\n\
vPos = vec2(position.x, position.y);\n\
}";
		this.shader_fragment_source = "\n\
precision mediump float;\n\
uniform sampler2D sampler;\n\
varying vec3 vPos;\n\
void main() {\n\
gl_FragColor = vec4(texture2D(sampler, vPos).rgb, 1.0);\n\
}";
		this._Pmatrix = null;
		this._Vmatrix = null;
		this._Mmatrix = null;
		this._sampler = null;
		this._position = null;
		//CUBE VERTEXES
		this.square_vertex = [
			-1 , -1 ,
			1 , -1 ,
			1 , 1 ,
			-1 , 1
		];
		this.SQUARE_VERTEXES = null;
		//CUBE FACES
		this.square_face = [
			0 , 1 , 2 ,
			0 , 2 , 3
		];
		this.SQUARE_FACES = null;
		//MATRIX
		this.transX = 0;
		this.transY = 0;
		this.transZ = 0;

		this.LIBS = new LIBS();
		this.zMin = 0.125;
		this.zMax = 1024.0;
		this.a = this.width / this.height;
		this.PROJMATRIX = this.LIBS.get_projection( this.angle , this.a , this.zMin , this.zMax );
		this.MOVEMATRIX = this.LIBS.get_I4();
		this.VIEWMATRIX = this.LIBS.get_I4();
		//TEXTURES
		this.square_texture = this.cmc.texture;


		this.start = function () {

			this.ui = new UserInterface( this );
			this.ui.captureEvents();
			this.createShaders();
			this.createSquare();
			this.square_texture = this.getTexture();
			this.draw();
		};
	};
	window.EnvironmentRenderer = EnvironmentRenderer;
	EnvironmentRenderer.prototype.createShaders = function () {
		var that = this;
		var get_shader = function ( source , type , typeString ) {
			var shader = that.GL.createShader( type );
			that.GL.shaderSource( shader , source );
			that.GL.compileShader( shader );
			if ( !that.GL.getShaderParameter( shader , that.GL.COMPILE_STATUS ) ) {
				alert( "ERROR IN " + typeString + " SHADER : " + that.GL.getShaderInfoLog( shader ) );
				return false;
			}
			return shader;
		};
		var shader_vertex = get_shader( this.shader_vertex_source , this.GL.VERTEX_SHADER , "VERTEX" );
		var shader_fragment = get_shader( this.shader_fragment_source , this.GL.FRAGMENT_SHADER , "FRAGMENT" );
		this.SHADER_PROGRAM = this.GL.createProgram();
		this.GL.attachShader( this.SHADER_PROGRAM , shader_vertex );
		this.GL.attachShader( this.SHADER_PROGRAM , shader_fragment );
		this.GL.linkProgram( this.SHADER_PROGRAM );
		this._Pmatrix = this.GL.getUniformLocation( this.SHADER_PROGRAM , "Pmatrix" );
		this._Vmatrix = this.GL.getUniformLocation( this.SHADER_PROGRAM , "Vmatrix" );
		this._Mmatrix = this.GL.getUniformLocation( this.SHADER_PROGRAM , "Mmatrix" );
		this._sampler = this.GL.getUniformLocation( this.SHADER_PROGRAM , "sampler" );
		this._position = this.GL.getAttribLocation( this.SHADER_PROGRAM , "position" );
		this.GL.enableVertexAttribArray( this._position );
		this.GL.useProgram( this.SHADER_PROGRAM );
		this.GL.uniform1i( this._sampler , 0 );
	};
	EnvironmentRenderer.prototype.createSquare = function () {
		this.CUBE_VERTEXES = this.GL.createBuffer();
		this.GL.bindBuffer( this.GL.ARRAY_BUFFER , this.CUBE_VERTEXES );
		this.GL.bufferData( this.GL.ARRAY_BUFFER , new Float32Array( this.square_vertex ) , this.GL.STATIC_DRAW );
		this.CUBE_FACES = this.GL.createBuffer();
		this.GL.bindBuffer( this.GL.ELEMENT_ARRAY_BUFFER , this.CUBE_FACES );
		this.GL.bufferData( this.GL.ELEMENT_ARRAY_BUFFER , new Uint16Array( this.square_faces ) , this.GL.STATIC_DRAW );
	};
	EnvironmentRenderer.prototype.getTexture = function () {
		this.GL.bindFramebuffer( this.GL.FRAMEBUFFER , null );
		this.GL.texParameteri( this.GL.TEXTURE_2D , this.GL.TEXTURE_MAG_FILTER , this.GL.LINEAR );
		this.GL.texParameteri( this.GL.TEXTURE_2D , this.GL.TEXTURE_MIN_FILTER , this.GL.LINEAR_MIPMAP_LINEAR );
		this.GL.texParameteri( this.GL.TEXTURE_2D , this.GL.TEXTURE_WRAP_S , this.GL.CLAMP_TO_EDGE );
		this.GL.texParameteri( this.GL.TEXTURE_2D , this.GL.TEXTURE_WRAP_T , this.GL.CLAMP_TO_EDGE );
		this.GL.generateMipmap( this.GL.TEXTURE_2D );
		this.GL.viewport( 0.0 , 0.0 , this.GL.drawingBufferWidth , this.GL.drawingBufferHeight );
	};
	EnvironmentRenderer.prototype.resize = function () {
		this.width = window.cmc.div.offsetWidth;
		this.height = window.cmc.div.offsetHeight;
		if ( this.GL.canvas.width !== this.width || this.GL.canvas.height !== this.height ) {
			this.a = this.width / this.height;
			this.GL.canvas.width = this.width;
			this.GL.canvas.height = this.height;
			this.GL.viewport( 0.0 , 0.0 , this.GL.drawingBufferWidth , this.GL.drawingBufferHeight );
		}
	};
	EnvironmentRenderer.prototype.draw = function () {
		var that = this;
		this.GL.clearColor( 0.0 , 0.0 , 0.0 , 1.0 );
		var time_old = 0;
		var animate = function ( time ) {
			var dt = time - time_old;
			time_old = time;
			that.PROJMATRIX = that.LIBS.get_projection( that.angle , that.a , that.zMin , that.zMax );
			that.LIBS.set_I4( that.MOVEMATRIX );
			that.LIBS.scale_XYZ( that.MOVEMATRIX , that.imageScale , that.imageScale , 1 );
			that.LIBS.translateX( that.MOVEMATRIX , that.transX );
			that.LIBS.translateY( that.MOVEMATRIX , that.transY );
			that.LIBS.translateZ( that.MOVEMATRIX , that.transZ );
			that.GL.clear( that.GL.COLOR_BUFFER_BIT | that.GL.DEPTH_BUFFER_BIT );
			that.GL.useProgram( that.SHADER_PROGRAM );
			that.GL.uniform1i( that._sampler , 0 );
			that.GL.blendFunc( that.GL.ONE , that.GL.ONE );
			that.GL.blendEquation( that.GL.FUNC_ADD );
			that.GL.uniformMatrix4fv( that._Pmatrix , false , that.PROJMATRIX );
			that.GL.uniformMatrix4fv( that._Vmatrix , false , that.VIEWMATRIX );
			that.GL.uniformMatrix4fv( that._Mmatrix , false , that.MOVEMATRIX );
			that.GL.activeTexture( that.GL.TEXTURE0 );
			that.GL.bindTexture( that.GL.TEXTURE_2D , that.cmc.texture );
			that.GL.bindBuffer( that.GL.ARRAY_BUFFER , that.CUBE_VERTEXES );
			that.GL.vertexAttribPointer( that._position , 3 , that.GL.FLOAT , false , 4 * 3 , 0 );
			that.GL.bindBuffer( that.GL.ELEMENT_ARRAY_BUFFER , that.CUBE_FACES );
			that.GL.drawElements( that.GL.TRIANGLES , 6 * 2 * 3 , that.GL.UNSIGNED_SHORT , 0 );
			that.animationId = window.requestAnimationFrame( animate );
		};
		animate( 0 );
	};
})();
