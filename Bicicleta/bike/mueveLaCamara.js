var gl, program;
var myTorus;
var cadena;
var myZeta = 0.0, myPhi = Math.PI/2.0, radius = 1.4, fovy = 1.4;
var selectedPrimitive = exampleCone;
var idMyColor;

function getWebGLContext() {

  var canvas = document.getElementById("myCanvas");

  try {
    return canvas.getContext("webgl2",{antialias:true});
  }
  catch(e) {
  }

  return null;
}

function initShaders() {
	
	gl.enable(gl.DEPTH_TEST);
    
  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, document.getElementById("myVertexShader").text);
  gl.compileShader(vertexShader);
  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(vertexShader));
    return null;
  }
 
  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, document.getElementById("myFragmentShader").text);
  gl.compileShader(fragmentShader);
  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(fragmentShader));
    return null;
  }
  
  program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  
  gl.linkProgram(program);
    
  gl.useProgram(program);
    
  program.vertexPositionAttribute = gl.getAttribLocation(program, "VertexPosition");
  gl.enableVertexAttribArray(program.vertexPositionAttribute);

  program.modelViewMatrixIndex  = gl.getUniformLocation(program,"modelViewMatrix");
  program.projectionMatrixIndex = gl.getUniformLocation(program,"projectionMatrix");
}

function initRendering() {
  gl.clearColor(0.95,0.95,0.95,1.0);
  gl.lineWidth(1.5);
  gl.enable(gl.DEPTH_TEST);
}

function initBuffers(model) { 
  model.idBufferVertices = gl.createBuffer ();
  gl.bindBuffer (gl.ARRAY_BUFFER, model.idBufferVertices);
  gl.bufferData (gl.ARRAY_BUFFER, new Float32Array(model.vertices), gl.STATIC_DRAW);
    
  model.idBufferIndices = gl.createBuffer ();
  gl.bindBuffer (gl.ELEMENT_ARRAY_BUFFER, model.idBufferIndices);
  gl.bufferData (gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.indices), gl.STATIC_DRAW);
}

function draw(model) {
  gl.bindBuffer (gl.ARRAY_BUFFER, model.idBufferVertices);
  gl.vertexAttribPointer (program.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
  
  /*
//-----------------------------Triangulos------------------------------------
  gl.bindBuffer (gl.ELEMENT_ARRAY_BUFFER, model.idBufferIndices);
  for (var i = 0; i < model.indices.length; i += 3)
    gl.drawElements (gl.TRIANGLES, 3, gl.UNSIGNED_SHORT, i*2); //triangles

//------------------------------------------------------------------------
*/

//--------------LINEAS----------------------------------
  gl.bindBuffer (gl.ELEMENT_ARRAY_BUFFER, model.idBufferIndices);
  gl.drawElements (gl.LINES, model.indices.length, gl.UNSIGNED_SHORT, 0);
//-----------------------------------------------------

//   // para pintar las aristas cuando se utilice el vector de índices de los triángulos
//   for (var i = 0; i < model.indices.length; i += 3)
//     gl.drawElements (gl.LINE_LOOP, 3, gl.UNSIGNED_SHORT, i*2);
}

function initPrimitives() {
  initBuffers(examplePlane);
  initBuffers(exampleCube);
  initBuffers(exampleCover);
  initBuffers(exampleCone);
  initBuffers(exampleCylinder);
  initBuffers(exampleSphere);

	var radio_ext = 0.025;
	var radio_int = 0.24;

	myTorus = makeTorus(radio_ext, radio_int, 8, 12);
	initBuffers(myTorus);
	
	var radio_ext = 0.015;
	var radio_int = 0.4;
	
	cadena = makeTorus(radio_ext, radio_int, 15, 30);
	initBuffers(cadena);
}

function setProjection() {   
  // obtiene la matriz de transformación de la proyección perspectiva
  var projectionMatrix  = mat4.create();
  mat4.perspective(projectionMatrix, fovy, 1.0, 0.1, 100.0);
  
  // envía la matriz de transformación de la proyección al shader de vértices
  gl.uniformMatrix4fv(program.projectionMatrixIndex,false,projectionMatrix);
}

function getCameraMatrix() {
  // coordenadas esféricas a rectangulares: https://en.wikipedia.org/wiki/Spherical_coordinate_system
  var x = radius * Math.sin(myPhi) * Math.sin(myZeta);
  var y = radius * Math.cos(myPhi);
  var z = radius * Math.sin(myPhi) * Math.cos(myZeta);

  return mat4.lookAt(mat4.create(), [x, y, z], [0, 0, 0], [0, 1, 0]); 
}

function drawScene() {
	//gl.clear(gl.DEPTH_BUFFER_BIT | gl.DEPTH_TEST);
    
	gl.clear(gl.COLOR_BUFFER_BIT);
	
	idMyColor = gl.getUniformLocation(program, "myColor");

	// establece la matriz de transformación de la proyección
	setProjection();

// ------------------------------- PLANO SUELO -----------------------------------------------
	var modelMatrix     		= mat4.create();
	var modelMatrixTranslation  = mat4.create();
	var modelViewMatrix 		= mat4.create();
	
	mat4.fromScaling(modelMatrix, [5, 1, 5]);
	mat4.fromTranslation(modelMatrixTranslation, [0, -1, 0]);
	
	mat4.multiply(modelViewMatrix, modelMatrixTranslation, modelMatrix);
	mat4.multiply(modelViewMatrix, getCameraMatrix(), modelViewMatrix);

	gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);

	gl.uniform4f (idMyColor, 0.0, 1.0, 0.0, 1.0); //verde
	draw(examplePlane);
//-------------------------------------------------------------------------------------------------- 

// --------------------------------- Asiento  ---------------------------------------------------
	var modelMatrixScaling     	= mat4.create();
	var modelMatrixTranslation  = mat4.create();
	var modelViewMatrix 		= mat4.create();
	
	mat4.fromTranslation(modelMatrixTranslation, [-0.45, 0.2, 0]);
	mat4.fromScaling(modelMatrixScaling, [0.3, 0.04, 0.2]);

	mat4.multiply(modelViewMatrix,  modelMatrixTranslation, modelMatrixScaling);
	mat4.multiply(modelViewMatrix, getCameraMatrix(), modelViewMatrix);

	gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
	
	gl.uniform4f (idMyColor, 0.0, 0.0, 0.0, 1.0);

	draw(exampleCube);
//--------------------------------------------------------------------------------------------	
	
// ----------------------------- Soporte Asiento  --------------------------------------
	var modelMatrixScaling     	= mat4.create();
	var modelMatrixTranslation  = mat4.create();
	var modelMatrixRotation		= mat4.create();
	var modelMatrixRotation2	= mat4.create();
	var modelViewMatrix 		= mat4.create();

	mat4.fromTranslation(modelMatrixTranslation, [-0.38, -0.07, 0]);
	mat4.fromScaling(modelMatrixScaling, [0.03, 0.03, 0.3]);
	mat4.fromRotation(modelMatrixRotation, -Math.PI/2, [1, 0, 0]);
	mat4.fromRotation(modelMatrixRotation2, 0.45, [0, 0, 1]);

	mat4.multiply(modelViewMatrix, modelMatrixRotation , modelMatrixScaling);
	mat4.multiply(modelViewMatrix, modelMatrixRotation2 , modelViewMatrix);
	mat4.multiply(modelViewMatrix, modelMatrixTranslation , modelViewMatrix);
	mat4.multiply(modelViewMatrix, getCameraMatrix(), modelViewMatrix);

	gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
	
	gl.uniform4f (idMyColor, 0.5, 0.5, 0.5, 1.0);
	
	draw(exampleCylinder);
//-------------------------------------------------------------------------------------------

// --------------------------------------- Chasis  -------------------------------------------
	var modelMatrixScaling     	= mat4.create();
	var modelMatrixTranslation  = mat4.create();
	var modelMatrixRotation		= mat4.create();
	var modelViewMatrix 		= mat4.create();
	
	mat4.fromTranslation(modelMatrixTranslation, [0.67, -0.05, 0]);
	mat4.fromScaling(modelMatrixScaling, [0.03, 0.04, 1.1]);
	mat4.fromRotation(modelMatrixRotation, -Math.PI/2, [0, 1, 0]);

	mat4.multiply(modelViewMatrix, modelMatrixRotation , modelMatrixScaling);
	mat4.multiply(modelViewMatrix, modelMatrixTranslation , modelViewMatrix);
	mat4.multiply(modelViewMatrix, getCameraMatrix(), modelViewMatrix);

	gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
	
	gl.uniform4f (idMyColor, 0.6, 0.0, 1.0, 1.0);

	draw(exampleCylinder);
//---------------------------------------------------------------------------------------------
		
//-------------------------------Barra manllar chasis------------------------------------------
	var modelMatrixScaling     	= mat4.create();
	var modelMatrixTranslation  = mat4.create();
	var modelMatrixRotation		= mat4.create();
	var modelMatrixRotation2	= mat4.create();
	var modelViewMatrix 		= mat4.create();
	
	mat4.fromTranslation(modelMatrixTranslation, [-0.06, -0.7, 0]);
	mat4.fromScaling(modelMatrixScaling, [0.03, 0.04, 1]);
	mat4.fromRotation(modelMatrixRotation, -Math.PI/2, [1, 0, 0.0]);
	mat4.fromRotation(modelMatrixRotation2, -0.84, [0.0, 0.0, 1]);

	mat4.multiply(modelViewMatrix, modelMatrixRotation , modelMatrixScaling);
	mat4.multiply(modelViewMatrix, modelMatrixRotation2 , modelViewMatrix);
	mat4.multiply(modelViewMatrix, modelMatrixTranslation , modelViewMatrix);
	mat4.multiply(modelViewMatrix, getCameraMatrix(), modelViewMatrix);

	gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
	
	gl.uniform4f (idMyColor, 1.0, 0.0, 1.0, 1.0);

	draw(exampleCylinder);
	
//--------------------------------------------------------------------------------

//-------------------Barra chasis ruedas-------------------------------------------
	var modelMatrixScaling     	= mat4.create();
	var modelMatrixTranslation  = mat4.create();
	var modelMatrixRotation		= mat4.create();
	var modelMatrixRotation2	= mat4.create();
	var modelViewMatrix 		= mat4.create();
	
	mat4.fromTranslation(modelMatrixTranslation, [-0.05, -0.65,  0]);
	mat4.fromScaling(modelMatrixScaling, [0.03, 0.04, 0.7]);
	mat4.fromRotation(modelMatrixRotation, -Math.PI/2, [1.0, 0.0, 0.0]);
	mat4.fromRotation(modelMatrixRotation2, 0.54, [0.0, 0.0, 1.0]);

	mat4.multiply(modelViewMatrix, modelMatrixRotation , modelMatrixScaling);
	mat4.multiply(modelViewMatrix, modelMatrixRotation2 , modelViewMatrix);
	mat4.multiply(modelViewMatrix, modelMatrixTranslation , modelViewMatrix);
	mat4.multiply(modelViewMatrix, getCameraMatrix(), modelViewMatrix);

	gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
	
	gl.uniform4f (idMyColor, 0.0, 1.0, 0.0, 1.0);
	
	draw(exampleCylinder);
//------------------------------------------------------------------------------------------
	
//------------------------------------Barra Manillar-----------------------------------------
	var modelMatrixScaling     	= mat4.create();
	var modelMatrixTranslation  = mat4.create();
	var modelMatrixRotation		= mat4.create();
	var modelViewMatrix 		= mat4.create();
	
	mat4.fromTranslation(modelMatrixTranslation, [0.5, 0.3, -0.35]);
	mat4.fromScaling(modelMatrixScaling, [0.03, 0.03, 0.65]);
	mat4.fromRotation(modelMatrixRotation, -Math.PI/2, [0, 0, 1]);

	mat4.multiply(modelViewMatrix, modelMatrixRotation , modelMatrixScaling);
	mat4.multiply(modelViewMatrix, modelMatrixTranslation , modelViewMatrix);
	mat4.multiply(modelViewMatrix, getCameraMatrix(), modelViewMatrix);

	gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
	
	gl.uniform4f (idMyColor, 0.0, 0.0, 1.0, 1.0);

	draw(exampleCylinder);
//-------------------------------------------------------------------------------------------------
	
//---------------------------barra inferior manillar-----------------------------------------
	var modelMatrixScaling     	= mat4.create();
	var modelMatrixTranslation  = mat4.create();
	var modelMatrixRotation		= mat4.create();
	var modelMatrixRotation2	= mat4.create();
	var modelViewMatrix 		= mat4.create();
	
	mat4.fromTranslation(modelMatrixTranslation, [0.63, -0.05, 0.0]);
	mat4.fromScaling(modelMatrixScaling, [0.02, 0.02, 0.35]);
	mat4.fromRotation(modelMatrixRotation, -Math.PI/2, [1, 0, 0]);
	mat4.fromRotation(modelMatrixRotation2, 0.36, [0, 0, 1]);

	mat4.multiply(modelViewMatrix, modelMatrixRotation , modelMatrixScaling);
	mat4.multiply(modelViewMatrix, modelMatrixRotation2 , modelViewMatrix);
	mat4.multiply(modelViewMatrix, modelMatrixTranslation , modelViewMatrix);
	mat4.multiply(modelViewMatrix, getCameraMatrix(), modelViewMatrix);

	gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
	
	gl.uniform4f (idMyColor, 1.0, 0.0, 0.0, 1.0);

	draw(exampleCylinder);
//-----------------------------------------------------------------------------------------	
	
//----------------------------------Almoadilla Izquierda Manillar---------------------------
	var modelMatrixScaling     	= mat4.create();
	var modelMatrixTranslation  = mat4.create();
	var modelMatrixRotation		= mat4.create();
	var modelViewMatrix 		= mat4.create();
	var modelAux				= mat4.create();
	
	mat4.fromTranslation(modelMatrixTranslation, [0.5, 0.3, -0.5]);
	mat4.fromScaling(modelMatrixScaling, [0.04, 0.04, 0.15]);
	mat4.fromRotation(modelMatrixRotation, -Math.PI/2, [0, 0, 1]);

	mat4.multiply(modelAux, modelMatrixRotation , modelMatrixScaling);
	mat4.multiply(modelViewMatrix, modelMatrixTranslation , modelAux);
	mat4.multiply(modelViewMatrix, getCameraMatrix(), modelViewMatrix);

	gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
	
	gl.uniform4f (idMyColor, 0.0, 0.0, 0.0, 1.0); //verde
	draw(exampleCylinder);
//-----------------------------------------------------------------------------------------------
	
//----------------------Tapa izquierda manillar izquierdo---------------------------------	
	var modelMatrixScaling     	= mat4.create();
	var modelMatrixTranslation  = mat4.create();
	var modelMatrixRotation		= mat4.create();
	var modelViewMatrix 		= mat4.create();
	var modelAux				= mat4.create();
	
	mat4.fromTranslation(modelMatrixTranslation, [0.5, 0.3, -0.5]);
	mat4.fromScaling(modelMatrixScaling, [0.04, 0.04, 0.15]);
	mat4.fromRotation(modelMatrixRotation, -Math.PI/2, [0, 0, 1]);

	mat4.multiply(modelAux, modelMatrixRotation , modelMatrixScaling);
	mat4.multiply(modelViewMatrix, modelMatrixTranslation , modelAux);
	mat4.multiply(modelViewMatrix, getCameraMatrix(), modelViewMatrix);

	gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
	
	gl.uniform4f (idMyColor, 0.0, 0.0, 0.0, 1.0);

	draw(exampleCover);
//--------------------------------------------------------------------------------------------	

//----------------------Tapa derecha manillar izquierdo---------------------------------
	var modelMatrixScaling     	= mat4.create();
	var modelMatrixTranslation  = mat4.create();
	var modelMatrixRotation		= mat4.create();
	var modelViewMatrix 		= mat4.create();
	var modelAux				= mat4.create();
	
	mat4.fromTranslation(modelMatrixTranslation, [0.5, 0.3, -0.35]);
	mat4.fromScaling(modelMatrixScaling, [0.04, 0.04, 0.15]);
	mat4.fromRotation(modelMatrixRotation, -Math.PI/2, [0, 0, 1]);

	mat4.multiply(modelAux, modelMatrixRotation , modelMatrixScaling);
	mat4.multiply(modelViewMatrix, modelMatrixTranslation , modelAux);
	mat4.multiply(modelViewMatrix, getCameraMatrix(), modelViewMatrix);

	gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
	
	draw(exampleCover);
//-------------------------------------------------------------------------------------
	
//----------------------------Almoadilla Derecha Manillar---------------------------
	var modelMatrixScaling     	= mat4.create();
	var modelMatrixTranslation  = mat4.create();
	var modelMatrixRotation		= mat4.create();
	var modelViewMatrix 		= mat4.create();
	var modelAux				= mat4.create();
	
	mat4.fromTranslation(modelMatrixTranslation, [0.5, 0.3, 0.3]);
	mat4.fromScaling(modelMatrixScaling, [0.04, 0.04, 0.15]);
	mat4.fromRotation(modelMatrixRotation, -Math.PI/2, [0, 0, 1]);

	mat4.multiply(modelAux, modelMatrixRotation , modelMatrixScaling);
	mat4.multiply(modelViewMatrix, modelMatrixTranslation , modelAux);
	mat4.multiply(modelViewMatrix, getCameraMatrix(), modelViewMatrix);

	gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
	
	draw(exampleCylinder);
//---------------------------------------------------------------------------------------	

//----------------------Tapa izquierda manillar derecho---------------------------------
	var modelMatrixScaling     	= mat4.create();
	var modelMatrixTranslation  = mat4.create();
	var modelMatrixRotation		= mat4.create();
	var modelViewMatrix 		= mat4.create();
	var modelAux				= mat4.create();
	
	mat4.fromTranslation(modelMatrixTranslation, [0.5, 0.3, 0.45]);
	mat4.fromScaling(modelMatrixScaling, [0.04, 0.04, 0.15]);
	mat4.fromRotation(modelMatrixRotation, -Math.PI/2, [0, 0, 1]);

	mat4.multiply(modelAux, modelMatrixRotation , modelMatrixScaling);
	mat4.multiply(modelViewMatrix, modelMatrixTranslation , modelAux);
	mat4.multiply(modelViewMatrix, getCameraMatrix(), modelViewMatrix);

	gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
	
	draw(exampleCover);
//-----------------------------------------------------------------------------------------
	
//----------------------Tapa derecha manillar derecho---------------------------------
	var modelMatrixScaling     	= mat4.create();
	var modelMatrixTranslation  = mat4.create();
	var modelMatrixRotation		= mat4.create();
	var modelViewMatrix 		= mat4.create();
	var modelAux				= mat4.create();
	
	mat4.fromTranslation(modelMatrixTranslation, [0.5, 0.3, 0.3]);
	mat4.fromScaling(modelMatrixScaling, [0.04, 0.04, 0.15]);
	mat4.fromRotation(modelMatrixRotation, -Math.PI/2, [0, 0, 1]);

	mat4.multiply(modelAux, modelMatrixRotation , modelMatrixScaling);
	mat4.multiply(modelViewMatrix, modelMatrixTranslation , modelAux);
	mat4.multiply(modelViewMatrix, getCameraMatrix(), modelViewMatrix);

	gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);

	draw(exampleCover);
//----------------------------------------------------------------------------------------
	
//---------------------------barra superior rueda delantera--------------------------------
	var modelMatrixScaling     	= mat4.create();
	var modelMatrixTranslation  = mat4.create();
	var modelMatrixRotation		= mat4.create();
	var modelMatrixRotation2	= mat4.create();
	var modelViewMatrix 		= mat4.create();
	
	mat4.fromTranslation(modelMatrixTranslation, [0.72, -0.32, 0.0]);
	mat4.fromScaling(modelMatrixScaling, [0.02, 0.02, 0.25]);
	mat4.fromRotation(modelMatrixRotation, -Math.PI/2, [1, 0, 0]);
	mat4.fromRotation(modelMatrixRotation2, 0.3, [0, 0, 1]);

	mat4.multiply(modelViewMatrix, modelMatrixRotation , modelMatrixScaling);
	mat4.multiply(modelViewMatrix, modelMatrixRotation2 , modelViewMatrix);
	mat4.multiply(modelViewMatrix, modelMatrixTranslation , modelViewMatrix);
	mat4.multiply(modelViewMatrix, getCameraMatrix(), modelViewMatrix);

	gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
	
	gl.uniform4f (idMyColor, 0.0, 0.5, 0.5, 1.0);

	draw(exampleCylinder);
//--------------------------------------------------------------------------------------------------
	
//-----------------------------union barras rueda delantera ----------------------------------------
	var modelMatrixScaling     	= mat4.create();
	var modelMatrixTranslation  = mat4.create();
	var modelMatrixRotation		= mat4.create();
	var modelMatrixRotation2	= mat4.create();
	var modelViewMatrix 		= mat4.create();
	
	mat4.fromTranslation(modelMatrixTranslation, [0.72, -0.32, 0.0]);
	mat4.fromScaling(modelMatrixScaling, [0.2, 0.02, 0.06]);
	mat4.fromRotation(modelMatrixRotation, -Math.PI/2, [0, 1, 0]);
	mat4.fromRotation(modelMatrixRotation2, 0.3, [0, 0, 1]);

	mat4.multiply(modelViewMatrix, modelMatrixRotation , modelMatrixScaling);
	mat4.multiply(modelViewMatrix, modelMatrixRotation2 , modelViewMatrix);
	mat4.multiply(modelViewMatrix, modelMatrixTranslation , modelViewMatrix);
	mat4.multiply(modelViewMatrix, getCameraMatrix(), modelViewMatrix);

	gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);

	draw(exampleCube);
//---------------------------------------------------------------------------------------------------

//---------------------------barra inferior izquierda rueda delantera--------------------------------
	var modelMatrixScaling     	= mat4.create();
	var modelMatrixTranslation  = mat4.create();
	var modelMatrixRotation		= mat4.create();
	var modelMatrixRotation2	= mat4.create();
	var modelViewMatrix 		= mat4.create();
	
	mat4.fromTranslation(modelMatrixTranslation, [0.86, -0.76, -0.06]);
	mat4.fromScaling(modelMatrixScaling, [0.015, 0.015, 0.46]);
	mat4.fromRotation(modelMatrixRotation, -Math.PI/2, [1, 0, 0]);
	mat4.fromRotation(modelMatrixRotation2, 0.3, [0, 0, 1]);

	mat4.multiply(modelViewMatrix, modelMatrixRotation , modelMatrixScaling);
	mat4.multiply(modelViewMatrix, modelMatrixRotation2 , modelViewMatrix);
	mat4.multiply(modelViewMatrix, modelMatrixTranslation , modelViewMatrix);
	mat4.multiply(modelViewMatrix, getCameraMatrix(), modelViewMatrix);

	gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
	
	gl.uniform4f (idMyColor, 0.8, 0.8, 0.0, 1.0);

	draw(exampleCylinder);
//-------------------------------------------------------------------------------------------------

//---------------------------barra inferior derecha rueda delantera--------------------------------
	var modelMatrixScaling     	= mat4.create();
	var modelMatrixTranslation  = mat4.create();
	var modelMatrixRotation		= mat4.create();
	var modelMatrixRotation2	= mat4.create();
	var modelViewMatrix 		= mat4.create();
	
	mat4.fromTranslation(modelMatrixTranslation, [0.86, -0.76, 0.06]);
	mat4.fromScaling(modelMatrixScaling, [0.015, 0.015, 0.46]);
	mat4.fromRotation(modelMatrixRotation, -Math.PI/2, [1, 0, 0]);
	mat4.fromRotation(modelMatrixRotation2, 0.3, [0, 0, 1]);

	mat4.multiply(modelViewMatrix, modelMatrixRotation , modelMatrixScaling);
	mat4.multiply(modelViewMatrix, modelMatrixRotation2 , modelViewMatrix);
	mat4.multiply(modelViewMatrix, modelMatrixTranslation , modelViewMatrix);
	mat4.multiply(modelViewMatrix, getCameraMatrix(), modelViewMatrix);

	gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
	
	gl.uniform4f (idMyColor, 0.0, 0.5, 0.5, 1.0);

	draw(exampleCylinder);
//-------------------------------------------------------------------------------------------

//-----------------------------union barras rueda delantera----------------------------------
	var modelMatrixScaling     	= mat4.create();
	var modelMatrixTranslation  = mat4.create();
	var modelViewMatrix 		= mat4.create();
	
	mat4.fromTranslation(modelMatrixTranslation, [0.85, -0.75, -0.05]);
	mat4.fromScaling(modelMatrixScaling, [0.015, 0.015, 0.1]);
	mat4.fromRotation(modelMatrixRotation, -Math.PI/2, [1, 0, 0]);
	mat4.fromRotation(modelMatrixRotation2, 0.3, [0, 0, 1]);

	mat4.multiply(modelViewMatrix, modelMatrixTranslation , modelMatrixScaling);
	mat4.multiply(modelViewMatrix, getCameraMatrix(), modelViewMatrix);

	gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
	
	gl.uniform4f (idMyColor, 0.1, 0.7, 0.4, 1.0);

	draw(exampleCylinder);
//-------------------------------------------------------------------------------------------

//-------------------------------------Radios delanteros-------------------------------------	
	var modelMatrixScaling     	= mat4.create();
	var modelMatrixTranslation  = mat4.create();
	var modelMatrixRotation		= mat4.create();
	var modelMatrixRotation2	= mat4.create();
	var modelViewMatrix 		= mat4.create();
	var i;

for ( i =0; i<6 ;i+=0.3925){
	mat4.fromTranslation(modelMatrixTranslation, [0.85, -0.75, 0.0]);
	mat4.fromScaling(modelMatrixScaling, [0.008, 0.008, 0.19]);
	mat4.fromRotation(modelMatrixRotation, -Math.PI/2, [1, 0, 0]);
	mat4.fromRotation(modelMatrixRotation2, i, [0, 0, 1]);

	mat4.multiply(modelViewMatrix, modelMatrixRotation , modelMatrixScaling);
	mat4.multiply(modelViewMatrix, modelMatrixRotation2 , modelViewMatrix);
	mat4.multiply(modelViewMatrix, modelMatrixTranslation , modelViewMatrix);
	mat4.multiply(modelViewMatrix, getCameraMatrix(), modelViewMatrix);

	gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
	
	gl.uniform4f (idMyColor, 0.7, 0.7, 0.7, 1.0);

	draw(exampleCylinder);

}
//-------------------------------------------------------------------------------------------	
		
//--------------------------------Rueda delantera--------------------------------------------
	var modelMatrixScaling     	= mat4.create();
	var modelMatrixTranslation  = mat4.create();
	var modelViewMatrix 		= mat4.create();

	mat4.fromTranslation(modelMatrixTranslation, [0.85, -0.75, 0.0]);
	mat4.fromScaling(modelMatrixScaling, [0.9, 0.9, 0.7]);

	mat4.multiply(modelViewMatrix, modelMatrixTranslation , modelMatrixScaling);
	mat4.multiply(modelViewMatrix, getCameraMatrix(), modelViewMatrix);

	gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
	
	gl.uniform4f (idMyColor, 0.0, 0.0, 0.0, 1.0);

	draw(myTorus);
//--------------------------------------------------------------------------------------

//---------------------------barra superior rueda trasera--------------------------------
	var modelMatrixScaling     	= mat4.create();
	var modelMatrixTranslation  = mat4.create();
	var modelMatrixRotation		= mat4.create();
	var modelMatrixRotation2	= mat4.create();
	var modelViewMatrix 		= mat4.create();
	
	mat4.fromTranslation(modelMatrixTranslation, [-0.62, -0.38, 0.0]);
	mat4.fromScaling(modelMatrixScaling, [0.02, 0.02, 0.4]);
	mat4.fromRotation(modelMatrixRotation, -Math.PI/2, [1, 0, 0]);
	mat4.fromRotation(modelMatrixRotation2, -0.6, [0, 0, 1]);

	mat4.multiply(modelViewMatrix, modelMatrixRotation , modelMatrixScaling);
	mat4.multiply(modelViewMatrix, modelMatrixRotation2 , modelViewMatrix);
	mat4.multiply(modelViewMatrix, modelMatrixTranslation , modelViewMatrix);
	mat4.multiply(modelViewMatrix, getCameraMatrix(), modelViewMatrix);

	gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
	
	gl.uniform4f (idMyColor, 1.0, 0.5, 0.0, 1.0);

	draw(exampleCylinder);
//--------------------------------------------------------------------------------------------------

//-----------------------------union barras rueda trasera ----------------------------------------
	var modelMatrixScaling     	= mat4.create();
	var modelMatrixTranslation  = mat4.create();
	var modelMatrixRotation		= mat4.create();
	var modelMatrixRotation2	= mat4.create();
	var modelViewMatrix 		= mat4.create();
	
	mat4.fromTranslation(modelMatrixTranslation, [-0.62, -0.38, 0.0]);
	mat4.fromScaling(modelMatrixScaling, [0.2, 0.02, 0.06]);
	mat4.fromRotation(modelMatrixRotation, -Math.PI/2, [0, 1, 0]);
	mat4.fromRotation(modelMatrixRotation2, -0.6, [0, 0, 1]);

	mat4.multiply(modelViewMatrix, modelMatrixRotation , modelMatrixScaling);
	mat4.multiply(modelViewMatrix, modelMatrixRotation2 , modelViewMatrix);
	mat4.multiply(modelViewMatrix, modelMatrixTranslation , modelViewMatrix);
	mat4.multiply(modelViewMatrix, getCameraMatrix(), modelViewMatrix);

	gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);

	draw(exampleCube);
//---------------------------------------------------------------------------------------------------

//---------------------------barra inferior izquierda rueda trasera--------------------------------
	var modelMatrixScaling     	= mat4.create();
	var modelMatrixTranslation  = mat4.create();
	var modelMatrixRotation		= mat4.create();
	var modelMatrixRotation2	= mat4.create();
	var modelViewMatrix 		= mat4.create();
	
	mat4.fromTranslation(modelMatrixTranslation, [-0.87, -0.76, -0.06]);
	mat4.fromScaling(modelMatrixScaling, [0.015, 0.015, 0.45]);
	mat4.fromRotation(modelMatrixRotation, -Math.PI/2, [1, 0, 0]);
	mat4.fromRotation(modelMatrixRotation2, -0.6, [0, 0, 1]);

	mat4.multiply(modelViewMatrix, modelMatrixRotation , modelMatrixScaling);
	mat4.multiply(modelViewMatrix, modelMatrixRotation2 , modelViewMatrix);
	mat4.multiply(modelViewMatrix, modelMatrixTranslation , modelViewMatrix);
	mat4.multiply(modelViewMatrix, getCameraMatrix(), modelViewMatrix);

	gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
	
	gl.uniform4f (idMyColor, 1.0, 0.1, 0.5, 1.0);

	draw(exampleCylinder);
//-------------------------------------------------------------------------------------------------

//---------------------------barra inferior derecha rueda trasera--------------------------------
	var modelMatrixScaling     	= mat4.create();
	var modelMatrixTranslation  = mat4.create();
	var modelMatrixRotation		= mat4.create();
	var modelMatrixRotation2	= mat4.create();
	var modelViewMatrix 		= mat4.create();
	
	mat4.fromTranslation(modelMatrixTranslation, [-0.87, -0.76, 0.06]);
	mat4.fromScaling(modelMatrixScaling, [0.015, 0.015, 0.45]);
	mat4.fromRotation(modelMatrixRotation, -Math.PI/2, [1, 0, 0]);
	mat4.fromRotation(modelMatrixRotation2, -0.6, [0, 0, 1]);

	mat4.multiply(modelViewMatrix, modelMatrixRotation , modelMatrixScaling);
	mat4.multiply(modelViewMatrix, modelMatrixRotation2 , modelViewMatrix);
	mat4.multiply(modelViewMatrix, modelMatrixTranslation , modelViewMatrix);
	mat4.multiply(modelViewMatrix, getCameraMatrix(), modelViewMatrix);

	gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
	
	gl.uniform4f (idMyColor, 0.8, 0.5, 0.5, 1.0);

	draw(exampleCylinder);
//-------------------------------------------------------------------------------------------

//-----------------------------union barras rueda delantera----------------------------------
	var modelMatrixScaling     	= mat4.create();
	var modelMatrixTranslation  = mat4.create();
	var modelViewMatrix 		= mat4.create();
	
	mat4.fromTranslation(modelMatrixTranslation, [-0.85, -0.75, -0.05]);
	mat4.fromScaling(modelMatrixScaling, [0.015, 0.015, 0.1]);

	mat4.multiply(modelViewMatrix, modelMatrixTranslation , modelMatrixScaling);
	mat4.multiply(modelViewMatrix, getCameraMatrix(), modelViewMatrix);

	gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
	
	gl.uniform4f (idMyColor, 0.1, 0.7, 0.4, 1.0);

	draw(exampleCylinder);
//-------------------------------------------------------------------------------------------
	
for ( i =0; i<6 ;i+=0.3925){
	mat4.fromTranslation(modelMatrixTranslation, [-0.85, -0.75, 0.0]);
	mat4.fromScaling(modelMatrixScaling, [0.008, 0.008, 0.19]);
	mat4.fromRotation(modelMatrixRotation, -Math.PI/2, [1, 0, 0]);
	mat4.fromRotation(modelMatrixRotation2, i, [0, 0, 1]);

	mat4.multiply(modelViewMatrix, modelMatrixRotation , modelMatrixScaling);
	mat4.multiply(modelViewMatrix, modelMatrixRotation2 , modelViewMatrix);
	mat4.multiply(modelViewMatrix, modelMatrixTranslation , modelViewMatrix);
	mat4.multiply(modelViewMatrix, getCameraMatrix(), modelViewMatrix);

	gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
	
	gl.uniform4f (idMyColor, 0.7, 0.7, 0.7, 1.0);

	draw(exampleCylinder);

}
//-------------------------------------------------------------------------------------------	
	
//--------------------------------Rueda trasera------------------------------------------
	var modelMatrixScaling     	= mat4.create();
	var modelMatrixTranslation  = mat4.create();
	var modelViewMatrix 		= mat4.create();

	mat4.fromTranslation(modelMatrixTranslation, [-0.85, -0.75, 0.0]);
	mat4.fromScaling(modelMatrixScaling, [0.9, 0.9, 0.7]);

	mat4.multiply(modelViewMatrix, modelMatrixTranslation , modelMatrixScaling);
	mat4.multiply(modelViewMatrix, getCameraMatrix(), modelViewMatrix);

	gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
	
	gl.uniform4f (idMyColor, 0.0, 0.0, 0.0, 1.0);
	draw(myTorus);
//----------------------------------------------------------------------------------------
	
//-----------------------------Soporte pedales----------------------------------
	var modelMatrixScaling     	= mat4.create();
	var modelMatrixTranslation  = mat4.create();
	var modelViewMatrix 		= mat4.create();
	
	mat4.fromTranslation(modelMatrixTranslation, [-0.05, -0.65, -0.05]);
	mat4.fromScaling(modelMatrixScaling, [0.1, 0.1, 0.02]);

	mat4.multiply(modelViewMatrix, modelMatrixTranslation , modelMatrixScaling);
	mat4.multiply(modelViewMatrix, getCameraMatrix(), modelViewMatrix);

	gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
	
	gl.uniform4f (idMyColor, 0.1, 0.7, 0.4, 1.0);

	draw(exampleCylinder);
//-------------------------------------------------------------------------------------------

//-----------------------------tapa izquierda Soporte pedales----------------------------------
	var modelMatrixScaling     	= mat4.create();
	var modelMatrixTranslation  = mat4.create();
	var modelViewMatrix 		= mat4.create();
	
	mat4.fromTranslation(modelMatrixTranslation, [-0.05, -0.65, -0.05]);
	mat4.fromScaling(modelMatrixScaling, [0.1, 0.1, 0.02]);

	mat4.multiply(modelViewMatrix, modelMatrixTranslation , modelMatrixScaling);
	mat4.multiply(modelViewMatrix, getCameraMatrix(), modelViewMatrix);

	gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
	
	gl.uniform4f (idMyColor, 0.9, 0.7, 0.9, 1.0);

	draw(exampleCover);
//-------------------------------------------------------------------------------------------

//-----------------------------tapa derecha Soporte pedales----------------------------------
	var modelMatrixScaling     	= mat4.create();
	var modelMatrixTranslation  = mat4.create();
	var modelViewMatrix 		= mat4.create();
	
	mat4.fromTranslation(modelMatrixTranslation, [-0.05, -0.65, -0.03]);
	mat4.fromScaling(modelMatrixScaling, [0.1, 0.1, 0.02]);

	mat4.multiply(modelViewMatrix, modelMatrixTranslation , modelMatrixScaling);
	mat4.multiply(modelViewMatrix, getCameraMatrix(), modelViewMatrix);

	gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
	
	gl.uniform4f (idMyColor, 0.3, 0.7, 0.1, 1.0);

	draw(exampleCover);
//-------------------------------------------------------------------------------------------

//-----------------------------Soporte cadena----------------------------------
	var modelMatrixScaling     	= mat4.create();
	var modelMatrixTranslation  = mat4.create();
	var modelViewMatrix 		= mat4.create();
	
	mat4.fromTranslation(modelMatrixTranslation, [-0.85, -0.75, -0.05]);
	mat4.fromScaling(modelMatrixScaling, [0.1, 0.1, 0.02]);
	mat4.fromRotation(modelMatrixRotation, -Math.PI/2, [1, 0, 0]);

	mat4.multiply(modelViewMatrix, modelMatrixTranslation , modelMatrixScaling);
	mat4.multiply(modelViewMatrix, getCameraMatrix(), modelViewMatrix);

	gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
	
	gl.uniform4f (idMyColor, 0.1, 0.7, 0.4, 1.0);

	draw(exampleCylinder);
//-------------------------------------------------------------------------------------------

//-----------------------------tapa izquierda soporte cadena----------------------------------
	var modelMatrixScaling     	= mat4.create();
	var modelMatrixTranslation  = mat4.create();
	var modelViewMatrix 		= mat4.create();
	
	mat4.fromTranslation(modelMatrixTranslation, [-0.85, -0.75, -0.05]);
	mat4.fromScaling(modelMatrixScaling, [0.1, 0.1, 0.02]);
	mat4.fromRotation(modelMatrixRotation, -Math.PI/2, [1, 0, 0]);

	mat4.multiply(modelViewMatrix, modelMatrixTranslation , modelMatrixScaling);
	mat4.multiply(modelViewMatrix, getCameraMatrix(), modelViewMatrix);

	gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
	
	gl.uniform4f (idMyColor, 0.9, 0.7, 0.9, 1.0);

	draw(exampleCover);
//-------------------------------------------------------------------------------------------

//-----------------------------tapa derecha soporte cadena----------------------------------
	var modelMatrixScaling     	= mat4.create();
	var modelMatrixTranslation  = mat4.create();
	var modelViewMatrix 		= mat4.create();
	
	mat4.fromTranslation(modelMatrixTranslation, [-0.85, -0.75, -0.03]);
	mat4.fromScaling(modelMatrixScaling, [0.1, 0.1, 0.02]);
	mat4.fromRotation(modelMatrixRotation, -Math.PI/2, [1, 0, 0]);

	mat4.multiply(modelViewMatrix, modelMatrixTranslation , modelMatrixScaling);
	mat4.multiply(modelViewMatrix, getCameraMatrix(), modelViewMatrix);

	gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
	
	gl.uniform4f (idMyColor, 0.3, 0.7, 0.1, 1.0);

	draw(exampleCover);
//-------------------------------------------------------------------------------------------
	
//--------------------------------Cadena-----------------------------------------------------
	var modelMatrixScaling     	= mat4.create();
	var modelMatrixTranslation  = mat4.create();
	var modelMatrixRotation  	= mat4.create();
	var modelViewMatrix 		= mat4.create();

	mat4.fromTranslation(modelMatrixTranslation, [-0.45, -0.69, -0.04]);
	mat4.fromScaling(modelMatrixScaling, [0.5, 1.3, 0.4]);
	mat4.fromRotation(modelMatrixRotation, -1.45, [0, 0, 1]);

	mat4.multiply(modelViewMatrix, modelMatrixRotation , modelMatrixScaling);
	mat4.multiply(modelViewMatrix,  modelMatrixTranslation, modelViewMatrix);
	mat4.multiply(modelViewMatrix, getCameraMatrix(), modelViewMatrix);

	gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
	
	gl.uniform4f (idMyColor, 0.0, 0.0, 0.0, 1.0);
	draw(cadena);
//----------------------------------------------------------------------------------------

//-----------------------------Soporte pedales----------------------------------
	var modelMatrixScaling     	= mat4.create();
	var modelMatrixTranslation  = mat4.create();
	var modelViewMatrix 		= mat4.create();
	
	mat4.fromTranslation(modelMatrixTranslation, [-0.05, -0.65, -0.15]);
	mat4.fromScaling(modelMatrixScaling, [0.02, 0.02, 0.3]);

	mat4.multiply(modelViewMatrix, modelMatrixTranslation , modelMatrixScaling);
	mat4.multiply(modelViewMatrix, getCameraMatrix(), modelViewMatrix);

	gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
	
	gl.uniform4f (idMyColor, 0.1, 0.7, 0.4, 1.0);

	draw(exampleCylinder);
//-------------------------------------------------------------------------------------------

//-----------------------------tapa izquierda soporte pedales----------------------------------
	var modelMatrixScaling     	= mat4.create();
	var modelMatrixTranslation  = mat4.create();
	var modelViewMatrix 		= mat4.create();
	
	mat4.fromTranslation(modelMatrixTranslation, [-0.05, -0.65, -0.15]);
	mat4.fromScaling(modelMatrixScaling, [0.02, 0.02, 0.02]);

	mat4.multiply(modelViewMatrix, modelMatrixTranslation , modelMatrixScaling);
	mat4.multiply(modelViewMatrix, getCameraMatrix(), modelViewMatrix);

	gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
	
	gl.uniform4f (idMyColor, 0.3, 0.7, 0.1, 1.0);

	draw(exampleCover);
//---------------------------------------------------------------------------------------

//-----------------------------tapa derecha soporte pedales----------------------------------
	var modelMatrixScaling     	= mat4.create();
	var modelMatrixTranslation  = mat4.create();
	var modelViewMatrix 		= mat4.create();
	
	mat4.fromTranslation(modelMatrixTranslation, [-0.05, -0.65, 0.15]);
	mat4.fromScaling(modelMatrixScaling, [0.02, 0.02, 0.02]);

	mat4.multiply(modelViewMatrix, modelMatrixTranslation , modelMatrixScaling);
	mat4.multiply(modelViewMatrix, getCameraMatrix(), modelViewMatrix);

	gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
	
	gl.uniform4f (idMyColor, 0.3, 0.7, 0.1, 1.0);

	draw(exampleCover);
//---------------------------------------------------------------------------------------

//-----------------------------pedal derecho----------------------------------
	var modelMatrixScaling     	= mat4.create();
	var modelMatrixTranslation  = mat4.create();
	var modelMatrixRotation   	= mat4.create();
	var modelViewMatrix 		= mat4.create();
	
	mat4.fromTranslation(modelMatrixTranslation, [-0.05, -0.65, 0.12]);
	mat4.fromScaling(modelMatrixScaling, [0.02, 0.02, 0.2]);
	mat4.fromRotation(modelMatrixRotation, -Math.PI/2, [1, 0, 0]);

	mat4.multiply(modelViewMatrix, modelMatrixRotation , modelMatrixScaling);
	mat4.multiply(modelViewMatrix, modelMatrixTranslation , modelViewMatrix);
	mat4.multiply(modelViewMatrix, getCameraMatrix(), modelViewMatrix);

	gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
	
	gl.uniform4f (idMyColor, 0.1, 0.7, 0.4, 1.0);

	draw(exampleCylinder);
//-------------------------------------------------------------------------------------------

//-----------------------------tapa pedal derecho----------------------------------
	var modelMatrixScaling     	= mat4.create();
	var modelMatrixTranslation  = mat4.create();
	var modelMatrixRotation   	= mat4.create();
	var modelViewMatrix 		= mat4.create();
	
	mat4.fromTranslation(modelMatrixTranslation, [-0.05, -0.45, 0.12]);
	mat4.fromScaling(modelMatrixScaling, [0.02, 0.02, 0.2]);
	mat4.fromRotation(modelMatrixRotation, -Math.PI/2, [1, 0, 0]);

	mat4.multiply(modelViewMatrix, modelMatrixRotation , modelMatrixScaling);
	mat4.multiply(modelViewMatrix, modelMatrixTranslation , modelViewMatrix);
	mat4.multiply(modelViewMatrix, getCameraMatrix(), modelViewMatrix);

	gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
	
	gl.uniform4f (idMyColor, 0.1, 0.7, 0.4, 1.0);

	draw(exampleCover);
//-------------------------------------------------------------------------------------------

//-----------------------------tapa pedal derecho----------------------------------
	var modelMatrixScaling     	= mat4.create();
	var modelMatrixTranslation  = mat4.create();
	var modelViewMatrix 		= mat4.create();
	
	mat4.fromTranslation(modelMatrixTranslation, [-0.05, -0.47	, 0.2]);
	mat4.fromScaling(modelMatrixScaling, [0.1, 0.02, 0.15]);

	mat4.multiply(modelViewMatrix, modelMatrixTranslation , modelMatrixScaling);
	mat4.multiply(modelViewMatrix, getCameraMatrix(), modelViewMatrix);

	gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
	
	gl.uniform4f (idMyColor, 0.1, 0.7, 0.4, 1.0);

	draw(exampleCube);
//-------------------------------------------------------------------------------------------

//-----------------------------pedal izquierdo----------------------------------
	var modelMatrixScaling     	= mat4.create();
	var modelMatrixTranslation  = mat4.create();
	var modelMatrixRotation   	= mat4.create();
	var modelViewMatrix 		= mat4.create();
	
	mat4.fromTranslation(modelMatrixTranslation, [-0.05, -0.86, -0.12]);
	mat4.fromScaling(modelMatrixScaling, [0.02, 0.02, 0.2]);
	mat4.fromRotation(modelMatrixRotation, -Math.PI/2, [1, 0, 0]);

	mat4.multiply(modelViewMatrix, modelMatrixRotation , modelMatrixScaling);
	mat4.multiply(modelViewMatrix, modelMatrixTranslation , modelViewMatrix);
	mat4.multiply(modelViewMatrix, getCameraMatrix(), modelViewMatrix);

	gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
	
	gl.uniform4f (idMyColor, 0.1, 0.7, 0.4, 1.0);

	draw(exampleCylinder);
//-------------------------------------------------------------------------------------------

//-----------------------------tapa pedal izquierdo----------------------------------
	var modelMatrixScaling     	= mat4.create();
	var modelMatrixTranslation  = mat4.create();
	var modelMatrixRotation   	= mat4.create();
	var modelViewMatrix 		= mat4.create();
	
	mat4.fromTranslation(modelMatrixTranslation, [-0.05, -0.86, -0.12]);
	mat4.fromScaling(modelMatrixScaling, [0.02, 0.02, 0.2]);
	mat4.fromRotation(modelMatrixRotation, -Math.PI/2, [1, 0, 0]);

	mat4.multiply(modelViewMatrix, modelMatrixRotation , modelMatrixScaling);
	mat4.multiply(modelViewMatrix, modelMatrixTranslation , modelViewMatrix);
	mat4.multiply(modelViewMatrix, getCameraMatrix(), modelViewMatrix);

	gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
	
	gl.uniform4f (idMyColor, 0.1, 0.7, 0.4, 1.0);

	draw(exampleCover);
//-------------------------------------------------------------------------------------------

//-----------------------------tapa pedal izquierdo----------------------------------
	var modelMatrixScaling     	= mat4.create();
	var modelMatrixTranslation  = mat4.create();
	var modelViewMatrix 		= mat4.create();
	
	mat4.fromTranslation(modelMatrixTranslation, [-0.05, -0.83, -0.2]);
	mat4.fromScaling(modelMatrixScaling, [0.1, 0.02, 0.15]);

	mat4.multiply(modelViewMatrix, modelMatrixTranslation , modelMatrixScaling);
	mat4.multiply(modelViewMatrix, getCameraMatrix(), modelViewMatrix);

	gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
	
	gl.uniform4f (idMyColor, 0.1, 0.7, 0.4, 1.0);

	draw(exampleCube);
//-------------------------------------------------------------------------------------------

}

function initHandlers() {
    
  var mouseDown = false;
  var lastMouseX;
  var lastMouseY;

  var canvas     = document.getElementById("myCanvas");
  var htmlPhi    = document.getElementById("Phi");
  var htmlZeta   = document.getElementById("Zeta");
  var htmlRadius = document.getElementById("Radius");
  var htmlFovy   = document.getElementById("Fovy");

  htmlPhi.innerHTML    = (myPhi  * 180 / Math.PI).toFixed(1);
  htmlZeta.innerHTML   = (myZeta * 180 / Math.PI).toFixed(1);
  htmlRadius.innerHTML = radius.toFixed(1);
  htmlFovy.innerHTML   = (fovy * 180 / Math.PI).toFixed(1);

  canvas.addEventListener("mousedown",
    function(event) {
      mouseDown  = true;
      lastMouseX = event.clientX;
      lastMouseY = event.clientY;
    },
    false);

  canvas.addEventListener("mouseup",
    function() {
      mouseDown = false;
    },
    false);
  
  canvas.addEventListener("wheel",
    function (event) {
      
      var delta = 0.0;

      if (event.deltaMode == 0)
        delta = event.deltaY * 0.001;
      else if (event.deltaMode == 1)
        delta = event.deltaY * 0.03;
      else
        delta = event.deltaY;

      if (event.shiftKey == 1) { // fovy
          
        fovy *= Math.exp(-delta)
        fovy = Math.max (0.1, Math.min(3.0, fovy));
        
        htmlFovy.innerHTML = (fovy * 180 / Math.PI).toFixed(1);
        
      } else {
        
        radius *= Math.exp(-delta);
        radius  = Math.max(Math.min(radius, 30), 0.05);
        
        htmlRadius.innerHTML = radius.toFixed(1);
        
      }
      
      event.preventDefault();
      requestAnimationFrame(drawScene);

    }, false);

  canvas.addEventListener("mousemove",
    function (event) {
      
      if (!mouseDown) {
        return;
      }
      
      var newX = event.clientX;
      var newY = event.clientY;
      
      myZeta -= (newX - lastMouseX) * 0.005;
      myPhi  -= (newY - lastMouseY) * 0.005;
        
      var margen = 0.01;
      myPhi = Math.min (Math.max(myPhi, margen), Math.PI - margen);
        
      htmlPhi.innerHTML  = (myPhi  * 180 / Math.PI).toFixed(1);
      htmlZeta.innerHTML = (myZeta * 180 / Math.PI).toFixed(1);
     
      lastMouseX = newX
      lastMouseY = newY;
      
      event.preventDefault();
      requestAnimationFrame(drawScene);
      
    },
    false);

  var botones = document.getElementsByTagName("button");
  
  for (var i = 0; i < botones.length; i++) {
    botones[i].addEventListener("click",
    function(){
      switch (this.innerHTML) {
        case "Plano":    selectedPrimitive = examplePlane;    break;
        case "Cubo":     selectedPrimitive = exampleCube;     break;
        case "Tapa":     selectedPrimitive = exampleCover;    break;
        case "Cono":     selectedPrimitive = exampleCone;     break;
        case "Cilindro": selectedPrimitive = exampleCylinder; break;
        case "Esfera":   selectedPrimitive = exampleSphere;   break;
        case "Toro":     selectedPrimitive = myTorus;         break;
      }
      requestAnimationFrame(drawScene);
    },
    false);
  }
  
  document.addEventListener("keydown",
	function (event) { 
		switch (event.keyCode) { 
			case 65: outerAngle 	+= 0.03; break; // ’a’ 
			case 66: middleAngle 	+= 0.02; break; // ’b’
			case 67: innerAngle 	+= 0.01; break; // ’c’ 
		} 
		requestAnimationFrame(drawScene); 
	},
	false);
}

function initWebGL() {
    
  gl = getWebGLContext();
    
  if (!gl) {
    alert("WebGL 2.0 no está disponible");
    return;
  }
    
  initShaders();
  initPrimitives();
  initRendering();
  initHandlers();
  
  requestAnimationFrame(drawScene);
  
}

initWebGL();
