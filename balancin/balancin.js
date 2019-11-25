var gl, program;
var myTorus;
var myZeta = 0.0, myPhi = Math.PI/2.0, radius = 1.4, fovy = 1.4;
var angGiro = 0;
var turn = false;
var idMyColor;
var texturesId = [];

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
  
	gl.enable(gl.DEPTH_TEST)  //Habilitar la profundidad
  
	// normales
	program.vertexNormalAttribute = gl.getAttribLocation ( program, "VertexNormal");
	gl.enableVertexAttribArray(program.vertexNormalAttribute);
  
	program.normalMatrixIndex     = gl.getUniformLocation( program, "normalMatrix");
  
	//coordenadas de textura
	program.vertexTexcoordsAttribute = gl.getAttribLocation(program, "VertexTexcoords");
	gl.enableVertexAttribArray(program.vertexTexcoordsAttribute);
  
	// material
	program.KaIndex               = gl.getUniformLocation( program, "Material.Ka");
	program.KdIndex               = gl.getUniformLocation( program, "Material.Kd");
	program.KsIndex               = gl.getUniformLocation( program, "Material.Ks");
	program.alphaIndex            = gl.getUniformLocation( program, "Material.alpha");
  
	// fuente de luz
	program.LaIndex               = gl.getUniformLocation( program, "Light.La");
	program.LdIndex               = gl.getUniformLocation( program, "Light.Ld");
	program.LsIndex               = gl.getUniformLocation( program, "Light.Ls");
	program.PositionIndex         = gl.getUniformLocation( program, "Light.Position");
  
	program.myTextureindex = gl.getUniformLocation(program, "myTexture");
	gl.uniform1i(program.myTextureindex, 3);
  
	/*
	program.repetition = gl.getUniformLocation(program, "repetition");
	gl.uniform1f(program.repetition, 1.0);
	*/
	gl.activeTexture(gl.TEXTURE3);
	
	program.ScaleIndex            = gl.getUniformLocation( program, "Scale");
	program.ThresholdIndex        = gl.getUniformLocation( program, "Threshold");
  }

function initRendering() {

  gl.clearColor(1.0,1.0,0.6,1.0);
  gl.lineWidth(1.5);

  setShaderLight();
}

function initBuffers(model) {

  model.idBufferVertices = gl.createBuffer ();
  gl.bindBuffer (gl.ARRAY_BUFFER, model.idBufferVertices);
  gl.bufferData (gl.ARRAY_BUFFER, new Float32Array(model.vertices), gl.STATIC_DRAW);

  model.idBufferIndices = gl.createBuffer ();
  gl.bindBuffer (gl.ELEMENT_ARRAY_BUFFER, model.idBufferIndices);
  gl.bufferData (gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.indices), gl.STATIC_DRAW);
}

function drawWire(model) {

  gl.bindBuffer (gl.ARRAY_BUFFER, model.idBufferVertices);
  gl.vertexAttribPointer (program.vertexPositionAttribute, 3, gl.FLOAT, false, 8*4,   0);
  gl.vertexAttribPointer (program.vertexNormalAttribute,   3, gl.FLOAT, false, 8*4, 3*4);
  gl.vertexAttribPointer (program.vertexTexcoordsAttribute, 2, gl.FLOAT, false, 8*4, 6*4);

  gl.bindBuffer   (gl.ELEMENT_ARRAY_BUFFER, model.idBufferIndices);
  gl.drawElements (gl.TRIANGLES, model.indices.length, gl.UNSIGNED_SHORT, 0);
}

function initPrimitives() {

  initBuffers(examplePlane);
  initBuffers(exampleCube);
  initBuffers(exampleCover);
  initBuffers(exampleCone);
  initBuffers(exampleCylinder);
  initBuffers(exampleSphere);

  myTorus = makeTorus(0.4, 1.0, 8, 12);
  initBuffers(myTorus);
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

function setShaderProjectionMatrix(projectionMatrix) {

  gl.uniformMatrix4fv(program.projectionMatrixIndex, false, projectionMatrix);
}

function setShaderModelViewMatrix(modelViewMatrix) {

  gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
}

function setShaderNormalMatrix(normalMatrix) {

  gl.uniformMatrix3fv(program.normalMatrixIndex, false, normalMatrix);
}

function getNormalMatrix(modelViewMatrix) {

  return mat3.normalFromMat4(mat3.create(), modelViewMatrix);
}

function getProjectionMatrix() {

  return mat4.perspective(mat4.create(), fovy, 1.0, 0.1, 100.0);
}

function setShaderMaterial(material){

	gl.uniform3fv(program.KaIndex, material.mat_ambient);
	gl.uniform3fv(program.KdIndex, material.mat_diffuse);
	gl.uniform3fv(program.KsIndex, material.mat_specular);
	gl.uniform1f(program.alphaIndex, material.alpha);
}

function setShaderLight(){

	gl.uniform3f(program.LaIndex, 1.0, 1.0, 1.0);
	gl.uniform3f(program.LdIndex, 1.0, 1.0, 1.0);
	gl.uniform3f(program.LsIndex, 1.0, 1.0, 1.0);
	gl.uniform3f(program.PositionIndex, 10.0, 10.0, 10.0);
}

function drawScene() {

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	setShaderProjectionMatrix(getProjectionMatrix());

	// establece la matriz de transformación de la proyección
	setProjection();   

//============================= Dibjujar plano del suelo ================================
	setShaderMaterial(Cyan_plastic);
	gl.bindTexture(gl.TEXTURE_2D, texturesId[0]);
	drawPlane();
	
//========================== Dibujar conos soporte =====================================	
	setShaderMaterial(Red_plastic);
	gl.bindTexture(gl.TEXTURE_2D, texturesId[0]);
	drawSupports();

//========================== Dibujar cilindro soporte =================================
	setShaderMaterial(Copper);
	gl.bindTexture(gl.TEXTURE_2D, texturesId[0]);
	drawCylinder();

//======================== Dibujar Balancin ============================================
	setShaderMaterial(Brass);
	gl.bindTexture(gl.TEXTURE_2D, texturesId[2]);
	drawBalancin();

//======================== Dibujar palos manillar ======================================
	setShaderMaterial(Tin);
	gl.bindTexture(gl.TEXTURE_2D, texturesId[1]);
	drawManillarBalancin();

//========================== Dibujar agarraderas manillar ==============================

	setShaderMaterial(Black_plastic);
	gl.bindTexture(gl.TEXTURE_2D, texturesId[1]);
	drawAgarraderasBalancin();

//========================= Dibujar semiesferas ========================================
setShaderMaterial(Red_rubber);
	gl.bindTexture(gl.TEXTURE_2D, texturesId[3]);
	drawEsfera();
}

//================================ Base del modelado =======================================
function drawPlane(){

	var m1 = mat4.create();
	var m2 = mat4.create();
	var modelMatrix= mat4.create();

	mat4.fromScaling(m1, [7, 7, 7]);
	mat4.fromTranslation(m2, [0, -0.75, 0]);
	mat4.multiply(modelMatrix, m2, m1);

	var modelViewMatrix = mat4.create();
	mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix);
	setShaderModelViewMatrix(modelViewMatrix);

	// se obtiene la matriz de transformacion de la normal y se envia al shader
	setShaderNormalMatrix(getNormalMatrix(modelViewMatrix));
	
	drawWire(examplePlane);
}

//======================= Conos que soportan el balancin ==============================

function drawSupports(){
	var m1 = mat4.create();
	var m2 = mat4.create();
	var m3 = mat4.create();
	var m4 = mat4.create();
	var ancho = 0.1;
	var alto = 0.4;
	var altura = -0.75;
	var posX = 0.5;

	var modelMatrix= mat4.create();

	mat4.fromScaling(m1, [ancho, ancho, alto]);
	mat4.fromTranslation(m2, [posX, altura, 0]);
	mat4.fromRotation(m3, -Math.PI/2, [1, 0, 0]);
	mat4.multiply(m4, m3, m1);
	mat4.multiply(modelMatrix, m2, m4);

	var modelViewMatrix = mat4.create();
	mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix);
	setShaderModelViewMatrix(modelViewMatrix);

  // se obtiene la matriz de transformacion de la normal y se envia al shader
	setShaderNormalMatrix(getNormalMatrix(modelViewMatrix));

	drawWire(exampleCone);

	mat4.fromScaling(m1, [ancho, ancho, alto]);
	mat4.fromTranslation(m2, [-posX, altura, 0]);
	mat4.multiply(m4, m3, m1);
	mat4.multiply(modelMatrix, m2, m4);

	var modelViewMatrix = mat4.create();
	mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix);
	setShaderModelViewMatrix(modelViewMatrix);

	drawWire(exampleCone);
}

//============================ Cilindro central ==================================
function drawCylinder(){
	var m1 = mat4.create();
	var m2 = mat4.create();
	var m3 = mat4.create();
	var m4 = mat4.create();
	var modelMatrix= mat4.create();
	var anchura = 0.02;

	mat4.fromScaling(m1, [anchura, anchura, 1.02]);
	mat4.fromTranslation(m2, [0.51, -0.35, 0]);
	mat4.fromRotation(m3, -Math.PI/2, [0, 1, 0]);
	mat4.multiply(m4, m3, m1);
	mat4.multiply(modelMatrix, m2, m4);

	var modelViewMatrix = mat4.create();
	mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix);
	setShaderModelViewMatrix(modelViewMatrix);

  // se obtiene la matriz de transformacion de la normal y se envia al shader
	setShaderNormalMatrix(getNormalMatrix(modelViewMatrix));	
	
	drawWire(exampleCylinder);

//===================== Tapas del cilindro 1 ==========================
	var m1 = mat4.create();
	var m2 = mat4.create();
	var m3 = mat4.create();
	var m4 = mat4.create();
	var modelMatrix= mat4.create();
	var anchura = 0.02;
	var posX = 0.51;
	var posY = -0.35;

	mat4.fromScaling(m1, [anchura, anchura, 1.02]);
	mat4.fromTranslation(m2, [posX, posY, 0]);
	mat4.fromRotation(m3, -Math.PI/2, [0, 1, 0]);
	mat4.multiply(m4, m3, m1);
	mat4.multiply(modelMatrix, m2, m4);

	var modelViewMatrix = mat4.create();
	mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix);
	setShaderModelViewMatrix(modelViewMatrix);
	drawWire(exampleCover);

//===================== Tapas del cilindro 2 ==========================
	mat4.fromTranslation(m2, [-posX, posY, 0]);
	mat4.fromRotation(m3, -Math.PI/2, [0, 1, 0]);
	mat4.multiply(m4, m3, m1);
	mat4.multiply(modelMatrix, m2, m4);

	var modelViewMatrix = mat4.create();
	mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix);
	setShaderModelViewMatrix(modelViewMatrix);
	drawWire(exampleCover);
}

//============================= Balancin ===============================
function drawBalancin(){
	var m1 = mat4.create();
	var m2 = mat4.create();
	var m3 = mat4.create();
	var m4 = mat4.create();
	var modelMatrix= mat4.create();
	var anchura = 5;
	var alto = 0.7;
	var largo = 0.2;

	mat4.fromScaling(m1, [anchura, largo, alto]);
	mat4.fromTranslation(m2, [0, -0.23, 0]);
	mat4.fromRotation(m3, -Math.PI/2, [0, 1, 0]);
	mat4.multiply(m4, m3, m1);
	mat4.multiply(modelMatrix, m2, m4);

	var modelViewMatrix = mat4.create();
	mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix);
	setShaderModelViewMatrix(modelViewMatrix);

  // se obtiene la matriz de transformacion de la normal y se envia al shader
	setShaderNormalMatrix(getNormalMatrix(modelViewMatrix));	
	
	drawWire(exampleCube);
}

//============================== Manillares balancin ============================
function drawManillarBalancin(){
//Manillar 
	var m1 = mat4.create();
	var m2 = mat4.create();
	var m3 = mat4.create();
	var m4 = mat4.create();
	var modelMatrix= mat4.create();
	var anchura = 0.05;

	mat4.fromScaling(m1, [anchura, anchura, 0.3]);
	mat4.fromTranslation(m2, [0, -0.13, 1.75]);
	mat4.fromRotation(m3, -Math.PI/2, [1, 0, 0]);
	mat4.multiply(m4, m3, m1);
	mat4.multiply(modelMatrix, m2, m4);

	var modelViewMatrix = mat4.create();
	mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix);
	setShaderModelViewMatrix(modelViewMatrix);

  // se obtiene la matriz de transformacion de la normal y se envia al shader
	setShaderNormalMatrix(getNormalMatrix(modelViewMatrix));	
	
	drawWire(exampleCylinder);

	var m1 = mat4.create();
	var m2 = mat4.create();
	var m3 = mat4.create();
	var m4 = mat4.create();
	var modelMatrix= mat4.create();
	var anchura = 0.05;

	mat4.fromScaling(m1, [anchura, anchura, 0.6]);
	mat4.fromTranslation(m2, [0.3, 0.17, 1.75]);
	mat4.fromRotation(m3, -Math.PI/2, [0, 1, 0]);
	mat4.multiply(m4, m3, m1);
	mat4.multiply(modelMatrix, m2, m4);

	var modelViewMatrix = mat4.create();
	mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix);
	setShaderModelViewMatrix(modelViewMatrix);

  // se obtiene la matriz de transformacion de la normal y se envia al shader
	setShaderNormalMatrix(getNormalMatrix(modelViewMatrix));	
	
	drawWire(exampleCylinder);

//Manillar 2
	mat4.fromScaling(m1, [anchura, anchura, 0.3]);
	mat4.fromTranslation(m2, [0, -0.13, -1.75]);
	mat4.fromRotation(m3, -Math.PI/2, [1, 0, 0]);
	mat4.multiply(m4, m3, m1);
	mat4.multiply(modelMatrix, m2, m4);

	var modelViewMatrix = mat4.create();
	mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix);
	setShaderModelViewMatrix(modelViewMatrix);

  // se obtiene la matriz de transformacion de la normal y se envia al shader
	setShaderNormalMatrix(getNormalMatrix(modelViewMatrix));	
	
	drawWire(exampleCylinder);

	mat4.fromScaling(m1, [anchura, anchura, 0.6]);
	mat4.fromTranslation(m2, [0.3, 0.17, -1.75]);
	mat4.fromRotation(m3, -Math.PI/2, [0, 1, 0]);
	mat4.multiply(m4, m3, m1);
	mat4.multiply(modelMatrix, m2, m4);

	var modelViewMatrix = mat4.create();
	mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix);
	setShaderModelViewMatrix(modelViewMatrix);

  // se obtiene la matriz de transformacion de la normal y se envia al shader
	setShaderNormalMatrix(getNormalMatrix(modelViewMatrix));	
	
	drawWire(exampleCylinder);
}

//================================ Agarraderas del balancin ============================
function drawAgarraderasBalancin(){

	gl.uniform2f(program.ScaleIndex,     1.0, 15.0);
	gl.uniform2f(program.ThresholdIndex, 0.01, 0.7);
	
//====================================== Lado 1 =========================================
//================================== Agarradera 1 =======================================
	var m1 = mat4.create();
	var m2 = mat4.create();
	var m3 = mat4.create();
	var m4 = mat4.create();
	var modelMatrix= mat4.create();
	var anchura = 0.07;

	mat4.fromScaling(m1, [anchura, anchura, 0.2]);
	mat4.fromTranslation(m2, [0.3, 0.17, 1.75]);
	mat4.fromRotation(m3, -Math.PI/2, [0, 1, 0]);
	mat4.multiply(m4, m3, m1);
	mat4.multiply(modelMatrix, m2, m4);

	var modelViewMatrix = mat4.create();
	mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix);
	setShaderModelViewMatrix(modelViewMatrix);

  // se obtiene la matriz de transformacion de la normal y se envia al shader
	setShaderNormalMatrix(getNormalMatrix(modelViewMatrix));	
	
	drawWire(exampleCylinder);

	//================================= Agarradera 2 ======================================
	mat4.fromTranslation(m2, [-0.1, 0.17, 1.75]);
	//mat4.fromRotation(m3, -Math.PI/2, [0, 1, 0]);
	mat4.multiply(m4, m3, m1);
	mat4.multiply(modelMatrix, m2, m4);

	var modelViewMatrix = mat4.create();
	mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix);
	setShaderModelViewMatrix(modelViewMatrix);

  // se obtiene la matriz de transformacion de la normal y se envia al shader
	setShaderNormalMatrix(getNormalMatrix(modelViewMatrix));	
	
	drawWire(exampleCylinder);

//===================== Tapa 1 de la agarradera 1 ==============================
	gl.uniform2f(program.ScaleIndex,     0, 0);
	gl.uniform2f(program.ThresholdIndex, 0, 0);
	var anchura = 0.07;

	mat4.fromScaling(m1, [anchura, anchura, 0.2]);
	mat4.fromTranslation(m2, [0.3, 0.17, 1.75]);
	mat4.fromRotation(m3, -Math.PI/2, [0, 1, 0]);
	mat4.multiply(m4, m3, m1);
	mat4.multiply(modelMatrix, m2, m4);

	var modelViewMatrix = mat4.create();
	mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix);
	setShaderModelViewMatrix(modelViewMatrix);
	drawWire(exampleCover);

//===================== Tapa 2 de la agarradera 1 ===============================
	mat4.fromTranslation(m2, [0.1, 0.17, 1.75]);
	//mat4.fromRotation(m3, -Math.PI/2, [0, 1, 0]);
	mat4.multiply(m4, m3, m1);
	mat4.multiply(modelMatrix, m2, m4);

	var modelViewMatrix = mat4.create();
	mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix);
	setShaderModelViewMatrix(modelViewMatrix);
	drawWire(exampleCover);

//===================== Tapa 1 de la agarradera 2 =============================
	mat4.fromTranslation(m2, [-0.3, 0.17, 1.75]);
	//mat4.fromRotation(m3, -Math.PI/2, [0, 1, 0]);
	mat4.multiply(m4, m3, m1);
	mat4.multiply(modelMatrix, m2, m4);

	var modelViewMatrix = mat4.create();
	mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix);
	setShaderModelViewMatrix(modelViewMatrix);
	drawWire(exampleCover);

//===================== Tapa 2 de la agarradera 2 =============================
	mat4.fromTranslation(m2, [-0.1, 0.17, 1.75]);
	//mat4.fromRotation(m3, -Math.PI/2, [0, 1, 0]);
	mat4.multiply(m4, m3, m1);
	mat4.multiply(modelMatrix, m2, m4);

	var modelViewMatrix = mat4.create();
	mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix);
	setShaderModelViewMatrix(modelViewMatrix);
	drawWire(exampleCover);	

//====================================== Lado 2 ======================================
//================================== Agarradera 1 =======================================

	gl.uniform2f(program.ScaleIndex,     1.0, 15.0);
	gl.uniform2f(program.ThresholdIndex, 0.01, 0.7);
	
	var anchura = 0.07;

	mat4.fromScaling(m1, [anchura, anchura, 0.2]);
	mat4.fromTranslation(m2, [0.3, 0.17, -1.75]);
	//mat4.fromRotation(m3, -Math.PI/2, [0, 1, 0]);
	mat4.multiply(m4, m3, m1);
	mat4.multiply(modelMatrix, m2, m4);

	var modelViewMatrix = mat4.create();
	mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix);
	setShaderModelViewMatrix(modelViewMatrix);

	// se obtiene la matriz de transformacion de la normal y se envia al shader
	setShaderNormalMatrix(getNormalMatrix(modelViewMatrix));	

	drawWire(exampleCylinder);

//================================= Agarradera 2 ======================================
	mat4.fromTranslation(m2, [-0.1, 0.17, -1.75]);
	//mat4.fromRotation(m3, -Math.PI/2, [0, 1, 0]);
	mat4.multiply(m4, m3, m1);
	mat4.multiply(modelMatrix, m2, m4);

	var modelViewMatrix = mat4.create();
	mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix);
	setShaderModelViewMatrix(modelViewMatrix);

	// se obtiene la matriz de transformacion de la normal y se envia al shader
	setShaderNormalMatrix(getNormalMatrix(modelViewMatrix));	

	drawWire(exampleCylinder);

//===================== Tapa 1 de la agarradera 1 ==========================
	gl.uniform2f(program.ScaleIndex,     0, 0);
	gl.uniform2f(program.ThresholdIndex, 0, 0);	

	var anchura = 0.07;

	mat4.fromScaling(m1, [anchura, anchura, 0.2]);
	mat4.fromTranslation(m2, [0.3, 0.17, -1.75]);
	//mat4.fromRotation(m3, -Math.PI/2, [0, 1, 0]);
	mat4.multiply(m4, m3, m1);
	mat4.multiply(modelMatrix, m2, m4);

	var modelViewMatrix = mat4.create();
	mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix);
	setShaderModelViewMatrix(modelViewMatrix);
	drawWire(exampleCover);

//===================== Tapa 2 de la agarradera 1 ==========================
	mat4.fromTranslation(m2, [0.1, 0.17, -1.75]);
	//mat4.fromRotation(m3, -Math.PI/2, [0, 1, 0]);
	mat4.multiply(m4, m3, m1);
	mat4.multiply(modelMatrix, m2, m4);

	var modelViewMatrix = mat4.create();
	mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix);
	setShaderModelViewMatrix(modelViewMatrix);
	drawWire(exampleCover);

//===================== Tapa 1 de la agarradera 2 ==========================
	mat4.fromTranslation(m2, [-0.3, 0.17, -1.75]);
	//mat4.fromRotation(m3, -Math.PI/2, [0, 1, 0]);
	mat4.multiply(m4, m3, m1);
	mat4.multiply(modelMatrix, m2, m4);

	var modelViewMatrix = mat4.create();
	mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix);
	setShaderModelViewMatrix(modelViewMatrix);
	drawWire(exampleCover);

//===================== Tapa 2 de la agarradera 2 ==========================
	mat4.fromTranslation(m2, [-0.1, 0.17, -1.75]);
	//mat4.fromRotation(m3, -Math.PI/2, [0, 1, 0]);
	mat4.multiply(m4, m3, m1);
	mat4.multiply(modelMatrix, m2, m4);

	var modelViewMatrix = mat4.create();
	mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix);
	setShaderModelViewMatrix(modelViewMatrix);
	drawWire(exampleCover);
}

function drawEsfera(){
//======================== Semiesfera 1 =============================
	var m1 = mat4.create();
	var m2 = mat4.create();
	var modelMatrix= mat4.create();

	mat4.fromScaling(m1, [0.2, 0.1, 0.2]);
	mat4.fromTranslation(m2, [0, -0.36, 1.9]);
	mat4.multiply(modelMatrix, m2, m1);

	var modelViewMatrix = mat4.create();
	mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix);
	setShaderModelViewMatrix(modelViewMatrix);

  // se obtiene la matriz de transformacion de la normal y se envia al shader
	setShaderNormalMatrix(getNormalMatrix(modelViewMatrix));

	drawWire(exampleSphere);

//======================== Semiesfera 2 =============================
	mat4.fromTranslation(m2, [0, -0.36, -1.9]);
	mat4.multiply(modelMatrix, m2, m1);

	var modelViewMatrix = mat4.create();
	mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix);
	setShaderModelViewMatrix(modelViewMatrix);

	// se obtiene la matriz de transformacion de la normal y se envia al shader
	setShaderNormalMatrix(getNormalMatrix(modelViewMatrix));

	drawWire(exampleSphere);
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
      //requestAnimationFrame(drawScene);

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
      //requestAnimationFrame(drawScene);

    },
    false);

  var botones = document.getElementsByTagName("button");

  for (var i = 0; i < botones.length; i++) {
    botones[i].addEventListener("click",
    function(){
      switch (this.innerHTML) {
        case "Bascular":  activo = ! activo;    break;
      }
      //requestAnimationFrame(drawScene);
    },
    false);
  }
}


function setTexture(image, texturePos) {
	
	 //---------- TEXTURAS ----------\\

  //PRIMERA PARTE, creacion del objeto textura
//   var texturesId = gl.createTexture();

  //SEGUNDA PARTE, datos de la textura
  gl.bindTexture(gl.TEXTURE_2D, texturesId[texturePos]);

  //tipo e imagen, parámetros de filtrado y repetición
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, image.width, image.height, 0,  gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);

  //creacion del mipmap
  gl.generateMipmap(gl.TEXTURE_2D);  
  
  texturesId[texturePos].loaded = true;
  
}

function loadTextureFromFile(filename, texturePos) {

  var reader = new FileReader(); // Evita que Chrome se queje de SecurityError al cargar la imagen elegida por el usuario
  
  reader.addEventListener("load",
                          function() {
                            var image = new Image();
                            image.addEventListener("load", function() {
                                                     setTexture(image, texturePos);
                                                  },
                                                   false);
                            image.src = reader.result;
                          },
                          false);
  
  reader.readAsDataURL(filename);

}

function loadTextureFromServer (filename, texturePos) {
    
  var image = new Image();
    
  image.addEventListener("load",
                         function() {
                           setTexture(image, texturePos);
                        },
                         false);
  image.addEventListener("error",
                         function(err) {
                           console.log("MALA SUERTE: no esta disponible " + this.src);
                        },
                         false);
  image.crossOrigin = 'anonymous'; // Esto evita que Chrome se queje de SecurityError al cargar la imagen de otro dominio
  image.src         = filename;

}

function initTextures() {

	//var serverUrl    = "http://cphoto.uji.es/vj1221/assets/textures/jordiLlobregat/";
	//var texFilenames;
  var texFilenames = ["http://cphoto.uji.es/vj1221/assets/textures/jordiLlobregat/acero.jpg", 
					  "http://cphoto.uji.es/vj1221/assets/textures/jordiLlobregat/plastico.jpg",
					   "http://cphoto.uji.es/vj1221/assets/textures/jordiLlobregat/madera.jpg", 
					   "http://cphoto.uji.es/vj1221/assets/textures/jordiLlobregat/esfera.png"];

  for (var texturePos = 0; texturePos < 4; texturePos++) {
	// loadTextureFromServer(serverUrl+texFilenames[texturePos], texturePos);
    // creo el objeto textura
    texturesId[texturePos] = gl.createTexture();
    texturesId[texturePos].loaded = false;
    
    // solicito la carga de la textura
    loadTextureFromServer(texFilenames[texturePos], texturePos);
    
  }

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
	initTextures();
	
  setInterval(drawScene, 50);
}

initWebGL();