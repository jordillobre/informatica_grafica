var gl, program;
var myTorus;
var Torus2;
var Torus3;
var myphi = Math.PI/3.0, zeta = -0.5, radius = 7, fovy = 1.5;

var outerAngle=0;
var middleAngle=0;
var innerAngle=0;

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

  gl.clearColor(1.0, 1.0 , 0.7, 1);
  //gl.lineWidth(1.5);
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
  gl.vertexAttribPointer (program.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
    
  gl.bindBuffer (gl.ELEMENT_ARRAY_BUFFER, model.idBufferIndices);
  for (var i = 0; i < model.indices.length; i += 3)
    gl.drawElements (gl.LINE_LOOP, 3, gl.UNSIGNED_SHORT, i*2);
}

function initPrimitives() {

  initBuffers(examplePlane);
  initBuffers(exampleCube);
  initBuffers(exampleCover);
  initBuffers(exampleCone);
  initBuffers(exampleCylinder);
  initBuffers(exampleSphere);

  myTorus = makeTorus(0.01, 0.2, 20, 30);
  initBuffers(myTorus);
  TorusCuerpo= makeTorus (0.05, 0.3, 20, 30);
  initBuffers(TorusCuerpo);
  TorusCuerpo2= makeTorus (0.02, 0.3, 20, 30);
  initBuffers(TorusCuerpo2);
  TorusCuerpo3= makeTorus (0.15, 0.4, 20, 30);
  initBuffers(TorusCuerpo3);
  Torus3= makeTorus (0.005, 0.4, 20, 30);
  initBuffers(Torus3);
}

function setProjection() {

  // obtiene la matriz de transformación de la proyección perspectiva
  var projectionMatrix  = mat4.create();
  mat4.perspective(projectionMatrix, fovy, 1.0, 0.1, 100.0);

  // envía la matriz de transformación de la proyección al shader de vértices
  gl.uniformMatrix4fv(program.projectionMatrixIndex,false,projectionMatrix);

}

function drawSolid(model) { 
    
  gl.bindBuffer (gl.ARRAY_BUFFER, model.idBufferVertices);
  gl.vertexAttribPointer (program.vertexPositionAttribute, 3, gl.FLOAT, false, 8*4,   0);
  gl.vertexAttribPointer (program.vertexNormalAttribute,   3, gl.FLOAT, false, 8*4, 3*4);
  gl.vertexAttribPointer (program.vertexTexcoordsAttribute, 2, gl.FLOAT, false, 8*4, 6*4);
    
  gl.bindBuffer   (gl.ELEMENT_ARRAY_BUFFER, model.idBufferIndices);
  gl.drawElements (gl.TRIANGLES, model.indices.length, gl.UNSIGNED_SHORT, 0);

}

function getCameraMatrix() {
    
  // conversion de coordenadas polares (_zeta,_phi) a rectangulares (x, y, z)
  // ver: https://en.wikipedia.org/wiki/Spherical_coordinate_system

  var x = radius * Math.sin(myphi) * Math.sin(zeta);
  var y = radius * Math.cos(myphi);
  var z = radius * Math.sin(myphi) * Math.cos(zeta);

  return mat4.lookAt(mat4.create(), [x, y, z], [0, 2.5, 0], [0, 1, 0]);
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

function setShaderMaterial(material) {

  gl.uniform3fv(program.KaIndex,    material.mat_ambient);
  gl.uniform3fv(program.KdIndex,    material.mat_diffuse);
  gl.uniform3fv(program.KsIndex,    material.mat_specular);
  gl.uniform1f (program.alphaIndex, material.alpha);
  
}

function setShaderLight() {

  gl.uniform3f(program.LaIndex,        1.0, 1.0, 1.0)  //colorSombra
  gl.uniform3f(program.LdIndex,        1.0,  1.0, 1.1);  // colorFigura
  gl.uniform3f(program.LsIndex,        2.5,  2.5, 1.0);  //colorReflejo
  gl.uniform3f(program.PositionIndex, 10.0, -2.0, 10.0); // en coordenadas del ojo
  
}

function drawTimes() {
    
  // 1. calcula la matriz de transformación del modelo-vista
  var modelMatrix     = mat4.create();
  var modelMatrixAux     = mat4.create();
  var modelViewMatrix = mat4.create();
  
  mat4.fromScaling(modelMatrix, [1.5, 1.5, 1.5]);
 
  mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix);
  
  // 2. envía la matriz calculada al shader de vértices
  gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
    
  // 3. dibuja la primitiva actualmente seleccionada
  modelMatrix     = mat4.create();	// reiniciar matriz (hacerlo al terminar cada primitiva)
    var modelMatrixAux     = mat4.create();
    var modelMatrixAux2     = mat4.create();
		var matA = mat4.create(); //escala
		var matB = mat4.create(); //mueve 
		var matC = mat4.create(); //rota
		var alturaCono = 4;
		var conoY = 1.3;
		var alturaCabeza = alturaCono + conoY + 0.5;
		var alturaOrejas = alturaCabeza + 0.5;
		var distanciaOrejas = 0.5;
        
        // se selecciona una unidad de textura
        gl.activeTexture(gl.TEXTURE3);
        
    // CONO
          gl.bindTexture(gl.TEXTURE_2D, texturesId[1]);
			// Se crean las transformaciones 
				mat4.fromRotation(matC, -1.57, [1, 0, 0]);
				mat4.fromScaling(matA, [3, conoY, 3]);
				mat4.fromTranslation(matB, [0, alturaCono, 0]);
  
			//Se aplican las transformaciones 
				mat4.multiply(modelMatrix, matA, matC);
				mat4.multiply(modelMatrix, matB, modelMatrix);
                
                //Control
                mat4.fromRotation(matC, outerAngle, [0, 1, 0]);
				mat4.multiply(modelMatrix, matC, modelMatrix);
  
                //gl.uniform4f(program.idMyColor, 0, 1 , 0, 1);  //Verde
                
				mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix); 
                
                //gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
                setShaderModelViewMatrix(modelViewMatrix);
                // se obtiene la matriz de transformacion de la normal y se envia al shader
                setShaderNormalMatrix(getNormalMatrix(modelViewMatrix));
                
               // setShaderMaterial(White_plastic);        <---------        
                    
				drawSolid(exampleCone);
				
			// TAPA DEL CONO
                
                  gl.bindTexture(gl.TEXTURE_2D, texturesId[0]);
				// Se crean las transformaciones 
					mat4.fromRotation(matC, -1.57, [1, 0, 0]);
					mat4.fromScaling(matA, [3, 1, 3]);
					mat4.fromTranslation(matB, [0, alturaCono - 0.5, 0]);
  
				//Se aplican las transformaciones 
					mat4.multiply(modelMatrix, matA, matC);
					mat4.multiply(modelMatrix, matB, modelMatrix);
  
                    //Control
                    mat4.fromRotation(matC, outerAngle, [0, 1, 0]);
                    mat4.multiply(modelMatrix, matC, modelMatrix);
                    
					mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix); 
					gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
                    
                    setShaderModelViewMatrix(modelViewMatrix);
					  // se obtiene la matriz de transformacion de la normal y se envia al shader
                    setShaderNormalMatrix(getNormalMatrix(modelViewMatrix));
  
					drawSolid(exampleCover);
					
			// CILINDRO EN EL CONO
				// Se crean las transformaciones (solo se cambian los numeros)
					mat4.fromRotation(matC, -1.57, [1, 0, 0]);
					mat4.fromScaling(matA, [3, 0.5, 3]);
					mat4.fromTranslation(matB, [0, alturaCono - 0.5, 0]);
  
				//Se aplican las transformaciones 
					mat4.multiply(modelMatrix, matA, matC);
					mat4.multiply(modelMatrix, matB, modelMatrix);
	
                    //Control
                    mat4.fromRotation(matC, outerAngle, [0, 1, 0]);
                    mat4.multiply(modelMatrix, matC, modelMatrix);
                    
					mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix); 
					gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);                    
                    
                    setShaderModelViewMatrix(modelViewMatrix);
					  // se obtiene la matriz de transformacion de la normal y se envia al shader
					  setShaderNormalMatrix(getNormalMatrix(modelViewMatrix));
  
					drawSolid(exampleCylinder);
		
    // MICKEY MOUSE
                    setShaderMaterial(Obsidian);
			//CABESA
				
				// Se crean las transformaciones (solo se cambian los numeros)
					mat4.fromScaling(matA, [0.6, 0.6, 0.6]);
					mat4.fromTranslation(matB, [0, alturaCabeza, 0]);
  
				//Se aplican las transformaciones (hay que hacerlo siempre igual)
					mat4.multiply(modelMatrix, matB, matA);
	
                    //Control
                    mat4.fromRotation(matC, outerAngle, [0, 1, 0]);
                    mat4.multiply(modelMatrix, matC, modelMatrix);
                    
                    gl.uniform4f(program.idMyColor, 1, 0.8 , 0.7, 1)
                    
					mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix); 
									
					gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
                    
                    setShaderModelViewMatrix(modelViewMatrix);
                    // se obtiene la matriz de transformacion de la normal y se envia al shader
                    setShaderNormalMatrix(getNormalMatrix(modelViewMatrix));
					  
					drawSolid(exampleSphere);
					
			//OREJA DCHA
                    
				// Se crean las transformaciones (solo se cambian los numeros)
					mat4.fromScaling(matA, [0.4, 0.4, 0.1]);
					mat4.fromTranslation(matB, [distanciaOrejas, alturaOrejas, 0]);
  
				//Se aplican las transformaciones (hay que hacerlo siempre igual)
					mat4.multiply(modelMatrix, matB, matA);
                    
                    //Control
                    mat4.fromRotation(matC, outerAngle, [0, 1, 0]);
                    mat4.multiply(modelMatrix, matC, modelMatrix);
	
					mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix); 
					gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
                        
                    setShaderModelViewMatrix(modelViewMatrix);
                    // se obtiene la matriz de transformacion de la normal y se envia al shader
                    setShaderNormalMatrix(getNormalMatrix(modelViewMatrix));
  
					drawSolid(exampleSphere);
			//OREJA IZQ
			
				// Se crean las transformaciones (solo se cambian los numeros)
					mat4.fromScaling(matA, [0.4, 0.4, 0.1]);
					mat4.fromTranslation(matB, [-distanciaOrejas, alturaOrejas, 0]);
  
				//Se aplican las transformaciones (hay que hacerlo siempre igual)
					mat4.multiply(modelMatrix, matB, matA);
	
                    //Control
                    mat4.fromRotation(matC, outerAngle, [0, 1, 0]);
                    mat4.multiply(modelMatrix, matC, modelMatrix);
                    
					mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix); 
					gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
                    
                    setShaderModelViewMatrix(modelViewMatrix);
                    // se obtiene la matriz de transformacion de la normal y se envia al shader
                    setShaderNormalMatrix(getNormalMatrix(modelViewMatrix));
  
					drawSolid(exampleSphere);
					
			//MORRITO
				// Se crean las transformaciones 
					mat4.fromScaling(matA, [0.3, 0.3, 0.6]);
					mat4.fromTranslation(matB, [0, alturaCabeza - 0.1, 0.4]);
  
				//Se aplican las transformaciones 
					mat4.multiply(modelMatrix, matB, matA);
  
                    //Control
                    mat4.fromRotation(matC, outerAngle, [0, 1, 0]);
                    mat4.multiply(modelMatrix, matC, modelMatrix);
                    
					mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix); 
					gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
                    
                    setShaderModelViewMatrix(modelViewMatrix);
                    // se obtiene la matriz de transformacion de la normal y se envia al shader
                    setShaderNormalMatrix(getNormalMatrix(modelViewMatrix));
	
					drawSolid(exampleCone);
					
			//NARIZ
                setShaderMaterial(Perl);
				// Se crean las transformaciones (solo se cambian los numeros)
					mat4.fromScaling(matA, [0.1, 0.1, 0.1]);
					mat4.fromTranslation(matB, [0, alturaCabeza - 0.1, 1]);
  
				//Se aplican las transformaciones (hay que hacerlo siempre igual)
					mat4.multiply(modelMatrix, matB, matA);
	
                    //Control
                    mat4.fromRotation(matC, outerAngle, [0, 1, 0]);
                    mat4.multiply(modelMatrix, matC, modelMatrix);
                    
					mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix); 
					gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
                    
                    setShaderModelViewMatrix(modelViewMatrix);
                    // se obtiene la matriz de transformacion de la normal y se envia al shader
                    setShaderNormalMatrix(getNormalMatrix(modelViewMatrix));
  
					drawSolid(exampleSphere);		
					
			//OJO DCHO
  
				// Se crean las transformaciones (solo se cambian los numeros)
					mat4.fromScaling(matA, [0.1, 0.2, 0.1]);
					mat4.fromTranslation(matB, [0.2, alturaCabeza + 0.2, 0.5]);
  
				//Se aplican las transformaciones (hay que hacerlo siempre igual)
					mat4.multiply(modelMatrix, matB, matA);
	
                    //Control
                    mat4.fromRotation(matC, outerAngle, [0, 1, 0]);
                    mat4.multiply(modelMatrix, matC, modelMatrix);
                    
					mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix); 
					gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
                    
                    setShaderModelViewMatrix(modelViewMatrix);
                    // se obtiene la matriz de transformacion de la normal y se envia al shader
                    setShaderNormalMatrix(getNormalMatrix(modelViewMatrix));
  
					drawSolid(exampleSphere);		
							
			//OJO IZQ
  
				// Se crean las transformaciones (solo se cambian los numeros)
					mat4.fromScaling(matA, [0.1, 0.2, 0.1]);
					mat4.fromTranslation(matB, [-0.2, alturaCabeza + 0.2, 0.5]);
  
				//Se aplican las transformaciones (hay que hacerlo siempre igual)
					mat4.multiply(modelMatrix, matB, matA);
	
                    //Control
                    mat4.fromRotation(matC, outerAngle, [0, 1, 0]);
                    mat4.multiply(modelMatrix, matC, modelMatrix);
                    
					mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix); 
					gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
                    
                    setShaderModelViewMatrix(modelViewMatrix);
                    // se obtiene la matriz de transformacion de la normal y se envia al shader
                    setShaderNormalMatrix(getNormalMatrix(modelViewMatrix));
                    
					drawSolid(exampleSphere);		
	///*	
    //Sillas  
                    
  var dist = 1.5;
  var i;
  
  gl.uniform2f(program.ScaleIndex,     5.0, 5.0);
  gl.uniform2f(program.ThresholdIndex, 0.5, 0.5);
  
  for ( i =0; i<6 ;i+=0.785){
            
        setShaderMaterial(Copper);
        
        modelMatrix     = mat4.create();
                //Asiento
        mat4.fromScaling(matA, [0.3, 0.1, 0.3]);
        mat4.multiply(modelMatrix, matA, modelMatrix);
        
        mat4.fromTranslation(matB, [dist*1.5, dist/2 , 0]);
        mat4.multiply(modelMatrix, matB, modelMatrix);
        
        gl.uniform4f(program.idMyColor, 0.8, 0.2 , 0.3, 1);
                //For-Control
            mat4.fromRotation(matC, i, [0, 1, 0]);
            mat4.multiply(modelMatrixAux, matC, modelMatrix);
            
            mat4.fromRotation(matC, outerAngle, [0, 1, 0]);
            mat4.multiply(modelMatrixAux, matC, modelMatrixAux);
        
        mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrixAux); 
        gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);

        setShaderModelViewMatrix(modelViewMatrix);
        // se obtiene la matriz de transformacion de la normal y se envia al shader
        setShaderNormalMatrix(getNormalMatrix(modelViewMatrix));
            
        drawSolid(exampleCube);

        mat4.fromTranslation(matB, [-(dist*1.5), -dist/2 , 0]);
        mat4.multiply(modelMatrix, matB, modelMatrix);
        
        mat4.fromScaling(matA, [1, 1 , 1.7]);
        mat4.multiply(modelMatrix, matA, modelMatrix);
        mat4.fromRotation(matC, -1.57, [1, 0, 0]);
        mat4.multiply(modelMatrix, matC, modelMatrix);
        mat4.fromTranslation(matB, [0, 0.205 , -0.2]);
        mat4.multiply(modelMatrix, matB, modelMatrix);
        
        mat4.fromTranslation(matB, [dist*1.5, dist/2 , 0]);
        mat4.multiply(modelMatrix, matB, modelMatrix);
        
                //For-Control
            mat4.fromRotation(matC, i, [0, 1, 0]);
            mat4.multiply(modelMatrixAux, matC, modelMatrix);
            
            mat4.fromRotation(matC, outerAngle, [0, 1, 0]);
            mat4.multiply(modelMatrixAux, matC, modelMatrixAux);
        
        mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrixAux); 
        gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
        
        setShaderModelViewMatrix(modelViewMatrix);
        // se obtiene la matriz de transformacion de la normal y se envia al shader
        setShaderNormalMatrix(getNormalMatrix(modelViewMatrix));
        
        drawSolid(exampleCube);
        
                //Barras
        
        setShaderMaterial(Obsidian);
        
        modelMatrix     = mat4.create();
        matA = mat4.create(); //escala
        matB = mat4.create(); //mueve 
        matC = mat4.create(); //rota
        
        mat4.fromScaling(matA, [0.9, 0.4 , 1]);
        mat4.multiply(modelMatrix, matA, modelMatrix);
        mat4.fromRotation(matC, -1.57, [0, 1, 0]);
        mat4.multiply(modelMatrix, matC, modelMatrix);
        mat4.fromTranslation(matB, [-0.14, 0.08 , -0.025]);
        mat4.multiply(modelMatrix, matB, modelMatrix);
        
        mat4.fromTranslation(matB, [dist*1.5, dist/2 , 0]);
        mat4.multiply(modelMatrix, matB, modelMatrix);
        
        gl.uniform4f(program.idMyColor, 1, 0.8 , 0.7, 1);
        
                //For-Control
            mat4.fromRotation(matC, i, [0, 1, 0]);
            mat4.multiply(modelMatrixAux, matC, modelMatrix);
            
            mat4.fromRotation(matC, outerAngle, [0, 1, 0]);
            mat4.multiply(modelMatrixAux, matC, modelMatrixAux);
        
        mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrixAux); 
        gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
        
        setShaderModelViewMatrix(modelViewMatrix);
        // se obtiene la matriz de transformacion de la normal y se envia al shader
        setShaderNormalMatrix(getNormalMatrix(modelViewMatrix));
        
        drawSolid(myTorus);
        
        
        mat4.fromTranslation(matB, [0.28, 0 , 0]);
        mat4.multiply(modelMatrix, matB, modelMatrix);
        
                //For-Control
            mat4.fromRotation(matC, i, [0, 1, 0]);
            mat4.multiply(modelMatrixAux, matC, modelMatrix);
            
            mat4.fromRotation(matC, outerAngle, [0, 1, 0]);
            mat4.multiply(modelMatrixAux, matC, modelMatrixAux);
        
        mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrixAux); 
        gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
        
        setShaderModelViewMatrix(modelViewMatrix);
        // se obtiene la matriz de transformacion de la normal y se envia al shader
        setShaderNormalMatrix(getNormalMatrix(modelViewMatrix));
        
        drawSolid(myTorus);
    
        
        modelMatrix  = mat4.create();
        
        mat4.fromRotation(matC, 1.57, [0, 1, 0]);
        mat4.multiply(modelMatrix, matC, modelMatrix);
        mat4.fromScaling(matA, [0.29, 0.005 , 0.005]);
        mat4.multiply(modelMatrix, matA, modelMatrix);
        mat4.fromTranslation(matB, [-0.145, 0.1524 , 0.05]);
        mat4.multiply(modelMatrix, matB, modelMatrix);
        
        mat4.fromTranslation(matB, [dist*1.5, dist/2 , 0]);
        mat4.multiply(modelMatrix, matB, modelMatrix);
        
                //For-Control
            mat4.fromRotation(matC, i, [0, 1, 0]);
            mat4.multiply(modelMatrixAux, matC, modelMatrix);
            
            mat4.fromRotation(matC, outerAngle, [0, 1, 0]);
            mat4.multiply(modelMatrixAux, matC, modelMatrixAux);
        
        mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrixAux); 
        gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
        
        setShaderModelViewMatrix(modelViewMatrix);
        // se obtiene la matriz de transformacion de la normal y se envia al shader
        setShaderNormalMatrix(getNormalMatrix(modelViewMatrix));
        
        drawSolid(exampleCylinder);
        
                //Cuerdas
        modelMatrix     = mat4.create();
        matA = mat4.create(); //escala
        matB = mat4.create(); //mueve 
        matC = mat4.create(); //rota
        
        mat4.fromScaling(matA, [0.01, 0.01 , 3]);
        mat4.multiply(modelMatrix, matA, modelMatrix);
        
        mat4.fromRotation(matC, -1.57, [1, 0, 0]);
        mat4.multiply(modelMatrix, matC, modelMatrix);
        
        mat4.fromTranslation(matB, [dist*1.5, dist/2 , 0]);
        mat4.multiply(modelMatrix, matB, modelMatrix);
        
        mat4.fromRotation(matC, 0.09, [0, 1, 0]);
        mat4.multiply(modelMatrix, matC, modelMatrix);

                //For-Control
            mat4.fromRotation(matC, i, [0, 1, 0]);
            mat4.multiply(modelMatrixAux, matC, modelMatrix);
            
            mat4.fromRotation(matC, outerAngle, [0, 1, 0]);
            mat4.multiply(modelMatrixAux, matC, modelMatrixAux);
        
        mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrixAux); 
        gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
        
        setShaderModelViewMatrix(modelViewMatrix);
        // se obtiene la matriz de transformacion de la normal y se envia al shader
        setShaderNormalMatrix(getNormalMatrix(modelViewMatrix));
        
        drawSolid(exampleCylinder);
  } 
  
   //Tronco
   setShaderMaterial(Jade);
 
  gl.uniform2f(program.ScaleIndex,     0, 0);
  gl.uniform2f(program.ThresholdIndex, 0, 0);
  
  //Primer Cilindro tronco
  modelMatrix     = mat4.create();
  matA = mat4.create(); //escala
  matB = mat4.create(); //mueve 
 
  mat4.fromScaling(matA, [0.3, 0.3, 0.4]);
  mat4.fromTranslation(matB, [0, 0, -0.25]);
  mat4.multiply(modelMatrix, matB, matA);
  mat4.fromRotation(matC, -1.57, [1, 0, 0]);
  mat4.multiply(modelMatrix, matC, modelMatrix);
  
  gl.uniform4f(program.idMyColor, 0, 0 , 1, 1);
  
  mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix); 
  gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
  
   setShaderModelViewMatrix(modelViewMatrix);
  // se obtiene la matriz de transformacion de la normal y se envia al shader
  setShaderNormalMatrix(getNormalMatrix(modelViewMatrix));
  
  drawSolid(exampleCylinder);
  
  //Segundo Cilindro tronco
  modelMatrix     = mat4.create();
  matA = mat4.create(); //escala
  matB = mat4.create(); //mueve 
 
  mat4.fromScaling(matA, [0.3, 0.3, 0.57]);
  mat4.fromTranslation(matB, [0, 0, 0.67]);
  mat4.multiply(modelMatrix, matB, matA);
  mat4.fromRotation(matC, -1.57, [1, 0, 0]);
  mat4.multiply(modelMatrix, matC, modelMatrix);
  
  mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix); 
  gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
  drawSolid(exampleCylinder);
  gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
  
   setShaderModelViewMatrix(modelViewMatrix);
  // se obtiene la matriz de transformacion de la normal y se envia al shader
  setShaderNormalMatrix(getNormalMatrix(modelViewMatrix));
  
  drawSolid(exampleCover)
  
  //Torus 2 del cuerpo desde abajo
  
  setShaderMaterial(Cyan_plastic);
  
  modelMatrix     = mat4.create();
  matA = mat4.create(); //escala
  matB = mat4.create(); //mueve 
  
  mat4.fromScaling(matA, [1.2, 1.2, 1.8]);
  mat4.fromTranslation(matB, [0, 0, 1.3]);
  mat4.multiply(modelMatrix, matB, matA);
  mat4.fromRotation(matC, -1.57, [0, 0, 0]);
  mat4.multiply(modelMatrix, matC, modelMatrix);
  
  gl.uniform4f(program.idMyColor, 1, 0 , 0, 1);  //Rojo
  
  mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix); 
  gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
  
   setShaderModelViewMatrix(modelViewMatrix);
  // se obtiene la matriz de transformacion de la normal y se envia al shader
  setShaderNormalMatrix(getNormalMatrix(modelViewMatrix));
  
  drawSolid(TorusCuerpo);

  
  //Torus 3 del cuerpo desde abajo
  modelMatrix     = mat4.create();
  matA = mat4.create(); //escala
  matB = mat4.create(); //mueve 
  
  mat4.fromScaling(matA, [1.1, 1.1, 1.6]);
  mat4.fromTranslation(matB, [0, 0, 1.4]);
  mat4.multiply(modelMatrix, matB, matA);
  mat4.fromRotation(matC, -1.57, [1, 0, 0]);
  mat4.multiply(modelMatrix, matC, modelMatrix);
  
  mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix); 
  gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
  
   setShaderModelViewMatrix(modelViewMatrix);
  // se obtiene la matriz de transformacion de la normal y se envia al shader
  setShaderNormalMatrix(getNormalMatrix(modelViewMatrix));
  
  drawSolid(TorusCuerpo2);
  
  //Segundo Cilindro tronco
  
  setShaderMaterial(Green_rubber);
  
  modelMatrix     = mat4.create();
  matA = mat4.create(); //escala
  matB = mat4.create(); //mueve 
  
  mat4.fromScaling(matA, [0.3, 0.3, 1.5]);
  mat4.multiply(modelMatrix, matA, modelMatrix);
  mat4.fromTranslation(matB, [0, 0, 1.3]);
  mat4.multiply(modelMatrix, matB, matA);
  mat4.fromRotation(matC, -1.57, [1, 0, 0]);
  mat4.multiply(modelMatrix, matC, modelMatrix);
  
  gl.uniform4f(program.idMyColor, 0, 0 , 1, 1); //Azul
  
  mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix); 
  gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
  
   setShaderModelViewMatrix(modelViewMatrix);
  // se obtiene la matriz de transformacion de la normal y se envia al shader
  setShaderNormalMatrix(getNormalMatrix(modelViewMatrix));
  
  drawSolid(exampleCylinder);
  
  mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix); 
  gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
  
   setShaderModelViewMatrix(modelViewMatrix);
  // se obtiene la matriz de transformacion de la normal y se envia al shader
  setShaderNormalMatrix(getNormalMatrix(modelViewMatrix));
  
  drawSolid(exampleCover);
  
  //Tapas del segundo cilindro
  mat4.fromTranslation(matB, [0, 1.5, 0]);
  
  mat4.multiply(modelMatrix, matB, modelMatrix);
  mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix); 
  gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
  
   setShaderModelViewMatrix(modelViewMatrix);
  // se obtiene la matriz de transformacion de la normal y se envia al shader
  setShaderNormalMatrix(getNormalMatrix(modelViewMatrix));
  
  drawSolid(exampleCover);
  
  //Tercer Cilindro tronco
  
   setShaderMaterial(Jade);
  
  modelMatrix     = mat4.create();
  matA = mat4.create(); //escala
  matB = mat4.create(); //mueve 
  
  mat4.fromScaling(matA, [0.4, 0.4, 0.7]);
  mat4.multiply(modelMatrix, matA, modelMatrix);
  mat4.fromTranslation(matB, [0, 0, 2.8]);
  mat4.multiply(modelMatrix, matB, matA);
  mat4.fromRotation(matC, -1.57, [1, 0, 0]);
  mat4.multiply(modelMatrix, matC, modelMatrix);
  
  
  mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix); 
  gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
  
   setShaderModelViewMatrix(modelViewMatrix);
  // se obtiene la matriz de transformacion de la normal y se envia al shader
  setShaderNormalMatrix(getNormalMatrix(modelViewMatrix));
  
  drawSolid(exampleCylinder);
  
  mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix); 
  gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
  
   setShaderModelViewMatrix(modelViewMatrix);
  // se obtiene la matriz de transformacion de la normal y se envia al shader
  setShaderNormalMatrix(getNormalMatrix(modelViewMatrix));
  
  drawSolid(exampleCover);
  
  //Tapas del segundo cilindro
  
  mat4.fromTranslation(matB, [0, 0.7, 0]);
  mat4.multiply(modelMatrix, matB, modelMatrix);
  mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix); 
  gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
  
   setShaderModelViewMatrix(modelViewMatrix);
  // se obtiene la matriz de transformacion de la normal y se envia al shader
  setShaderNormalMatrix(getNormalMatrix(modelViewMatrix));
  
  drawSolid(exampleCover);
  
  //Torus 1 del cuerpo desde abajo
  
  setShaderMaterial(Cyan_plastic);
  
  modelMatrix     = mat4.create();
  matA = mat4.create(); //escala
  matB = mat4.create(); //mueve 
  
  mat4.fromScaling(matA, [0.9, 0.9, 2]);
  mat4.fromTranslation(matB, [0, 0, 0.4]);
  mat4.multiply(modelMatrix, matB, matA);
  mat4.fromRotation(matC, -1.57, [1, 0, 0]);
  mat4.multiply(modelMatrix, matC, modelMatrix);
  
  gl.uniform4f(program.idMyColor, 1, 0 , 0, 1);  //Rojo
  
  mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix); 
  gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
  
   setShaderModelViewMatrix(modelViewMatrix);
  // se obtiene la matriz de transformacion de la normal y se envia al shader
  setShaderNormalMatrix(getNormalMatrix(modelViewMatrix));
  
  drawSolid(TorusCuerpo3);
  
  //esferas
  setShaderMaterial(Ruby);
  
  var altura = 1.5;
  
  modelMatrix     = mat4.create();
  mat4.fromScaling(matA, [0.1, 0.1, 0.1]);
  mat4.fromTranslation(matB, [0, altura, 0.37]);
  mat4.multiply(modelMatrix, matB, matA);
  mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix); 
  
  for ( var i =0; i<5 ;i++){
    mat4.fromRotation(matC, 1.23, [0, 1, 0]);
    mat4.multiply(modelMatrix, matC, modelMatrix);
    mat4.fromScaling(matA, [1, 1, 1]);  //esto no hace nada, solo para iniciar modelmatrixAux
    mat4.multiply(modelMatrixAux, matA, modelMatrix); 
    mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix); 
    gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
    
    setShaderModelViewMatrix(modelViewMatrix);
    // se obtiene la matriz de transformacion de la normal y se envia al shader
    setShaderNormalMatrix(getNormalMatrix(modelViewMatrix));
    
    drawSolid(exampleSphere); 
    
    for ( var j =0; j<6 ;j++){
        mat4.fromTranslation(matB, [0, 0.2, 0]);
        mat4.fromRotation(matC, 0.4, [0, 1, 0]);
        mat4.multiply(modelMatrixAux, matB, modelMatrixAux);
        mat4.multiply(modelMatrixAux, matC, modelMatrixAux);
        
        mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrixAux); 
        gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
        
        setShaderModelViewMatrix(modelViewMatrix);
        // se obtiene la matriz de transformacion de la normal y se envia al shader
        setShaderNormalMatrix(getNormalMatrix(modelViewMatrix));
        
        drawSolid(exampleSphere); 
    }
  }
  
  //Plano
  
   var suelo = -0.50;
   setShaderMaterial(Yellow_plastic);
  
  modelMatrix     = mat4.create();
  matA = mat4.create(); //escala
  matB = mat4.create(); //mueve 
  matC = mat4.create(); //escala
  
  mat4.fromScaling(matA, [10, 10, 10]);
  mat4.fromTranslation(matB, [0, suelo , 0]);
   mat4.fromRotation(matC, -1.57, [1, 0, 0]);
  mat4.multiply(modelMatrix, matC, matA);
 
  mat4.multiply(modelMatrix, matB, modelMatrix);
  
  gl.uniform4f(program.idMyColor, 1, 1 , 1, 1);
  
  mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix); 
  gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
  
   gl.bindTexture(gl.TEXTURE_2D, texturesId[2]);
  
   setShaderModelViewMatrix(modelViewMatrix);
  // se obtiene la matriz de transformacion de la normal y se envia al shader
  setShaderNormalMatrix(getNormalMatrix(modelViewMatrix));
  
  drawSolid(exampleCover);
  
  //BASE
  
    setShaderMaterial(Silver);
    gl.bindTexture(gl.TEXTURE_2D, texturesId[3]);

    mat4.fromRotation(matC, -1.57, [1, 0, 0]);
    mat4.fromScaling(matA, [3, 1, 3]);
    mat4.fromTranslation(matB, [0, suelo/2, 0]);
  
    mat4.multiply(modelMatrix, matA, matC);
	mat4.multiply(modelMatrix, matB, modelMatrix);
  
	mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix); 
	gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);

    setShaderModelViewMatrix(modelViewMatrix);
	// se obtiene la matriz de transformacion de la normal y se envia al shader
	setShaderNormalMatrix(getNormalMatrix(modelViewMatrix));
  
	drawSolid(exampleCover);
					
	// CILINDRO 
    
    gl.bindTexture(gl.TEXTURE_2D, texturesId[4]);
    
	mat4.fromRotation(matC, -1.57, [1, 0, 0]);
	mat4.fromScaling(matA, [3, 0.25, 3]);
	mat4.fromTranslation(matB, [0, suelo, 0]);
  
	mat4.multiply(modelMatrix, matA, matC);
	mat4.multiply(modelMatrix, matB, modelMatrix);
	                    
	mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix); 
	gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
                    
    setShaderModelViewMatrix(modelViewMatrix);
	// se obtiene la matriz de transformacion de la normal y se envia al shader
	 setShaderNormalMatrix(getNormalMatrix(modelViewMatrix));

	drawSolid(exampleCylinder);
  
  // FAROLITAS
  
	var posFarolax = 4;
	var posFarolay = 4;
	var alturaFarola = 3;
	var distBolaFarola = 0.5;
	for (var j =0; j<4 ;j++)	{
        
		if ( j == 0) {posFarolax = 4, posFarolay = 4;}
		else if ( j == 1) {posFarolax = -4, posFarolay = 4;}
		else if ( j == 2) {posFarolax = -4, posFarolay = -4;}
		else {posFarolax = 4, posFarolay = -4;}

		// Palotes
			
		gl.bindTexture(gl.TEXTURE_2D, texturesId[0]);
			
		setShaderMaterial(Silver);

		mat4.fromRotation(matC, -1.57, [1, 0, 0]);
		mat4.fromScaling(matA, [0.1, alturaFarola, 0.1]);
		mat4.fromTranslation(matB, [posFarolax, suelo/2, -posFarolay]);
  
		
		mat4.multiply(modelMatrix, matA, matC);
		mat4.multiply(modelMatrix, matB, modelMatrix);
                    
		mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix); 
		gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
  
        setShaderModelViewMatrix(modelViewMatrix);
		// se obtiene la matriz de transformacion de la normal y se envia al shader
		setShaderNormalMatrix(getNormalMatrix(modelViewMatrix));
                    
		drawSolid(exampleCylinder);
        
		//TapaPalotes

		mat4.fromRotation(matC, -1.57, [1, 0, 0]);
		mat4.fromScaling(matA, [0.1, 1, 0.1]);
		mat4.fromTranslation(matB, [posFarolax, alturaFarola + suelo, -posFarolay]);
  
        mat4.multiply(modelMatrix, matA, matC);
		mat4.multiply(modelMatrix, matB, modelMatrix);
                    
		mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix); 
		gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
  
        setShaderModelViewMatrix(modelViewMatrix);
		 // se obtiene la matriz de transformacion de la normal y se envia al shader
		setShaderNormalMatrix(getNormalMatrix(modelViewMatrix));
                    
		drawSolid(exampleCover);
        
		//Palitos
        
		mat4.fromRotation(matC, -1.57, [0, 0, 1]);
		mat4.fromScaling(matA, [0.025, 0.025, distBolaFarola]);
		mat4.fromTranslation(matB, [posFarolax, alturaFarola -0.3, -posFarolay]);
  
		mat4.multiply(modelMatrix, matA, matC);
		mat4.multiply(modelMatrix, matB, modelMatrix);
                    
		mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix); 
		gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
                    
        setShaderModelViewMatrix(modelViewMatrix);
		// se obtiene la matriz de transformacion de la normal y se envia al shader
		setShaderNormalMatrix(getNormalMatrix(modelViewMatrix));
  
		drawSolid(exampleCylinder);
        
		//Baby palitos

		mat4.fromRotation(matC, -1.57, [1, 0, 0]);
		mat4.fromScaling(matA, [0.025, 0.2, 0.025]);
		mat4.fromTranslation(matB, [posFarolax, alturaFarola - 0.5, -posFarolay + distBolaFarola - 0.02]);
  
		mat4.multiply(modelMatrix, matA, matC);
		mat4.multiply(modelMatrix, matB, modelMatrix);
                    
		mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix); 
		gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
                    
        setShaderModelViewMatrix(modelViewMatrix);
		// se obtiene la matriz de transformacion de la normal y se envia al shader
		setShaderNormalMatrix(getNormalMatrix(modelViewMatrix));

		drawSolid(exampleCylinder);
					
		//Bola
        
         setShaderMaterial(Gold);

		mat4.fromScaling(matA, [0.3, 0.3, 0.3]);
		mat4.fromTranslation(matB, [posFarolax, alturaFarola - 0.7, -posFarolay + distBolaFarola - 0.02]);
  
		mat4.multiply(modelMatrix, matB, matA);
                    
		mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix); 
		gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
                    
         setShaderModelViewMatrix(modelViewMatrix);
        // se obtiene la matriz de transformacion de la normal y se envia al shader
		setShaderNormalMatrix(getNormalMatrix(modelViewMatrix));
  
		drawSolid(exampleSphere);
       }  
}

function drawScene(){
	
  // se inicializan los buffers de color y de profundidad
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  // se obtiene la matriz de transformacion de la proyeccion y se envia al shader
  setShaderProjectionMatrix( getProjectionMatrix() );
  
  setProjection();  

  drawTimes();
}

function initHandlers() {
    
  var mouseDown = false;
  var lastMouseX;
  var lastMouseY;

  var canvas = document.getElementById("myCanvas");

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
        
      } else {
        
        radius *= Math.exp(-delta);
        radius  = Math.max(Math.min(radius, 30), 0.05);
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
      
      zeta -= (newX - lastMouseX) * 0.005;
      myphi  -= (newY - lastMouseY) * 0.005;
        
      var margen = 0.01;
      myphi = Math.min (Math.max(myphi, margen), Math.PI - margen);
     
      lastMouseX = newX
      lastMouseY = newY;
      
      event.preventDefault();
      requestAnimationFrame(drawScene);
      
    },
    false);
  
  document.addEventListener("keydown", function (event){
		 switch (event.keyCode){
			 case 71:  //'g'
                 outerAngle -=0.02;  
                  break; 
		 }
      requestAnimationFrame(drawScene);
    },
    false);
}


function setColor (index, value) {

  var myColor = value.substr(1); // para eliminar el # del #FCA34D
      
  var r = myColor.charAt(0) + '' + myColor.charAt(1);
  var g = myColor.charAt(2) + '' + myColor.charAt(3);
  var b = myColor.charAt(4) + '' + myColor.charAt(5);

  r = parseInt(r, 16) / 255.0;
  g = parseInt(g, 16) / 255.0;
  b = parseInt(b, 16) / 255.0;
  
  gl.uniform3f(index, r, g, b);
}


function allTexturesLoaded () {

  for (var i = 0; i < texturesId.length; i++)
    if (! texturesId[i].loaded)
      return false;
  
  return true;
}


function setTexture (image, texturePos) {
    
  // se indica el objeto textura
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

  if (allTexturesLoaded()) {
    
    initHandlers();
   // gl.uniform1f(program.repetition,2);    // <-----------------
    requestAnimationFrame(drawScene);
  }
}


function loadTextureFromFile(filename, texturePos) {

  var reader = new FileReader(); // Evita que Chrome se queje de SecurityError al cargar la imagen elegida por el usuario
  
  reader.addEventListener("load",
                          function() {
                            var image = new Image();
                            image.addEventListener("load",
                                                   function() {
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

  var texFilenames = ["Blanco.png","Cono.jpeg","Tierra.jpeg","Suelo.png","Naranja.png"];

  for (var texturePos = 0; texturePos < texFilenames.length; texturePos++) {
  
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
  
  requestAnimationFrame(drawScene);
}

initWebGL();
