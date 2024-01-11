
var gl, program;
var myTorus;
var Torus2;
var Torus3;
var myphi = 0, zeta = 20, radius = 5.5, fovy = Math.PI/10;
var selectedPrimitive = exampleCone;

var outerAngle=0;
var middleAngle=0;
var innerAngle=0;

function getWebGLContext() {

  var canvas = document.getElementById("myCanvas");
  
  var names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
  for (var i = 0; i < names.length; ++i) {
    try {
       return canvas.getContext(names[i]);
    }
    catch(e) {
    }
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
  program.idMyColor = gl.getUniformLocation(program, "myColor"); //COLOR  

}

function initRendering() {

  gl.clearColor(0.0,0.15,0.15,1.0);
  gl.lineWidth(1.5);
  gl.enable(gl.DEPTH_TEST); //Habilitar la profundidad
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

  myTorus = makeTorus(0.005, 0.2, 20, 30);
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

function getCameraMatrix() {

  var _phi  = myphi * Math.PI / 180.0;
  var _zeta = zeta  * Math.PI / 180.0;
    
  // conversion de coordenadas polares (_zeta,_phi) a rectangulares (x, y, z)
  // ver: https://en.wikipedia.org/wiki/Spherical_coordinate_system
  var x = radius * Math.cos(_zeta) * Math.sin(_phi);
  var y = radius * Math.sin(_zeta);
  var z = radius * Math.cos(_zeta) * Math.cos(_phi);

  var cameraMatrix = mat4.create();
  mat4.lookAt(cameraMatrix, [x, y, z], [0, 0, 0], [0, 1, 0]);
    
  return cameraMatrix;
    
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
 
  
  //Cono
  modelMatrix     = mat4.create();
  var matA = mat4.create(); //escala
  var matB = mat4.create(); //mueve 
  var matC = mat4.create(); //rota
  
  //Tronco
  
  //Primer Cilindro tronco
  modelMatrix     = mat4.create();
  matA = mat4.create(); //escala
  matB = mat4.create(); //mueve 
 
  mat4.fromScaling(matA, [0.3, 0.3, 0.4]);
  mat4.fromTranslation(matB, [0, 0, -0.25]);
  mat4.multiply(modelMatrix, matB, matA);
  mat4.fromRotation(matC, -1.57, [1, 0, 0]);
  mat4.multiply(modelMatrix, matC, modelMatrix);
  
  
  mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix); 
  gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
  drawWire(exampleCylinder);
  
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
  drawWire(exampleCylinder);
  gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
  drawWire(exampleCover)
  
  //Torus 2 del cuerpo desde abajo
  modelMatrix     = mat4.create();
  matA = mat4.create(); //escala
  matB = mat4.create(); //mueve 
  
  mat4.fromScaling(matA, [1.2, 1.2, 1.8]);
  mat4.fromTranslation(matB, [0, 0, 1.3]);
  mat4.multiply(modelMatrix, matB, matA);
  mat4.fromRotation(matC, -1.57, [0, 0, 0]);
  mat4.multiply(modelMatrix, matC, modelMatrix);
  
  mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix); 
  gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
  drawWire(TorusCuerpo);
  
  
  
  
  
  
  
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
  drawWire(TorusCuerpo2);
  
  
  
  
  
  
  //Segundo Cilindro tronco
  modelMatrix     = mat4.create();
  matA = mat4.create(); //escala
  matB = mat4.create(); //mueve 
  
  mat4.fromScaling(matA, [0.3, 0.3, 1.5]);
  mat4.multiply(modelMatrix, matA, modelMatrix);
  mat4.fromTranslation(matB, [0, 0, 1.3]);
  mat4.multiply(modelMatrix, matB, matA);
  mat4.fromRotation(matC, -1.57, [1, 0, 0]);
  mat4.multiply(modelMatrix, matC, modelMatrix);
  
  
  mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix); 
  gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
  drawWire(exampleCylinder);
  
  mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix); 
  gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
  drawWire(exampleCover);
  //Tapas del segundo cilindro
  mat4.fromTranslation(matB, [0, 1.5, 0]);
  mat4.multiply(modelMatrix, matB, modelMatrix);
  mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix); 
  gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
  drawWire(exampleCover);
  
  
  
  //Tercer Cilindro tronco
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
  drawWire(exampleCylinder);
  
  mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix); 
  gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
  drawWire(exampleCover);
  //Tapas del segundo cilindro
  mat4.fromTranslation(matB, [0, 0.7, 0]);
  mat4.multiply(modelMatrix, matB, modelMatrix);
  mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix); 
  gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
  drawWire(exampleCover);
  
  
  //Torus 1 del cuerpo desde abajo
  modelMatrix     = mat4.create();
  matA = mat4.create(); //escala
  matB = mat4.create(); //mueve 
  
  mat4.fromScaling(matA, [0.9, 0.9, 2]);
  mat4.fromTranslation(matB, [0, 0, 0.4]);
  mat4.multiply(modelMatrix, matB, matA);
  mat4.fromRotation(matC, -1.57, [1, 0, 0]);
  mat4.multiply(modelMatrix, matC, modelMatrix);
  
  mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix); 
  gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
  drawWire(TorusCuerpo3);
  
  
  //esfera1
  modelMatrix     = mat4.create();
  matA = mat4.create(); //escala
  matB = mat4.create(); //mueve 
  
  mat4.fromScaling(matA, [0.1, 0.1, 0.1]);
  mat4.fromTranslation(matB, [0., 1.5, 0.35]);
  mat4.multiply(modelMatrix, matB, matA);
  
  mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix); 
  gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
  drawWire(exampleSphere);  

  //esfera2
  modelMatrix     = mat4.create();
  matA = mat4.create(); //escala
  matB = mat4.create(); //mueve 
  
  mat4.fromScaling(matA, [0.1, 0.1, 0.1]);
  mat4.fromTranslation(matB, [0.15, 1.7, 0.3]);
  mat4.multiply(modelMatrix, matB, matA);
  
  mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix); 
  gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
  drawWire(exampleSphere);  
 

  //esfera3
  modelMatrix     = mat4.create();
  matA = mat4.create(); //escala
  matB = mat4.create(); //mueve 
  
  mat4.fromScaling(matA, [0.1, 0.1, 0.1]);
  mat4.fromTranslation(matB, [0.3, 1.9, 0.2]);
  mat4.multiply(modelMatrix, matB, matA);
  
  mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix); 
  gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
  drawWire(exampleSphere);   
  
  
  //esfera4
  modelMatrix     = mat4.create();
  matA = mat4.create(); //escala
  matB = mat4.create(); //mueve 
  
  mat4.fromScaling(matA, [0.1, 0.1, 0.1]);
  mat4.fromTranslation(matB, [0.37, 2.1, 0]);
  mat4.multiply(modelMatrix, matB, matA);
  
  mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix); 
  gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
  drawWire(exampleSphere);  


  //esfera5
  modelMatrix     = mat4.create();
  matA = mat4.create(); //escala
  matB = mat4.create(); //mueve 
  
  mat4.fromScaling(matA, [0.1, 0.1, 0.1]);
  mat4.fromTranslation(matB, [0.3, 2.3, -0.2]);
  mat4.multiply(modelMatrix, matB, matA);
  
  mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix); 
  gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
  drawWire(exampleSphere);  

  //esfera6
  modelMatrix     = mat4.create();
  matA = mat4.create(); //escala
  matB = mat4.create(); //mueve 
  
  mat4.fromScaling(matA, [0.1, 0.1, 0.1]);
  mat4.fromTranslation(matB, [0.2, 2.5, -0.3]);
  mat4.multiply(modelMatrix, matB, matA);
  
  mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix); 
  gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
  drawWire(exampleSphere);  

  //esfera7
  modelMatrix     = mat4.create();
  matA = mat4.create(); //escala
  matB = mat4.create(); //mueve 
  
  mat4.fromScaling(matA, [0.1, 0.1, 0.1]);
  mat4.fromTranslation(matB, [0.08, 2.7, -0.35]);
  mat4.multiply(modelMatrix, matB, matA);
  
  mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix); 
  gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
  drawWire(exampleSphere);   
  
  //Plano
  modelMatrix     = mat4.create();
  matA = mat4.create(); //escala
  matB = mat4.create(); //mueve 
  
  mat4.fromScaling(matA, [1.4, 1, 1.4]);
  mat4.fromTranslation(matB, [0, -0.25 , 0]);
  mat4.fromRotation(matC, -1.57, [1, 0, 0]);
  
  mat4.multiply(modelMatrix, matA, matB);
  
  mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix); 
  gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
  drawWire(examplePlane);
  
  
  
}

function drawScene(){
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  setProjection();
  drawTimes();
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

  htmlPhi.innerHTML    = myphi.toFixed(0);
  htmlZeta.innerHTML   = zeta;
  htmlRadius.innerHTML = radius.toFixed(1);
  htmlFovy.innerHTML   = fovy.toFixed(2);


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
      if (event.shiftKey == 1) {
        if (event.altKey == 1) {              
          // fovy
          fovy -= (newY - lastMouseY) / 100.0;
          if (fovy < 0.001) {
            fovy = 0.1;
          }
          //console.log("fovy = " + fovy);
          htmlFovy.innerHTML = fovy.toFixed(2);
        } else {                              
          // radius
          radius -= (newY - lastMouseY) / 10.0;
          if (radius < 0.01) {
            radius = 0.01;
          }
          //console.log("radius = " + radius);
          htmlRadius.innerHTML = radius.toFixed(1);
        }
      } else {                                 // position
        myphi  -= (newX - lastMouseX);
        zeta += (newY - lastMouseY);
        if (zeta < -80) {
          zeta = -80.0;
        }
        if (zeta > 80) {
          zeta = 80;
        }
        //console.log("phi = " + myphi + ", zeta = " + zeta);
        //console.log("phi = " + myphi + ", zeta = " + zeta);
        htmlPhi.innerHTML = myphi.toFixed(0);
        htmlZeta.innerHTML = zeta;
      }
      lastMouseX = newX
      lastMouseY = newY;
      requestAnimationFrame(drawScene);
    },
    false);

  document.addEventListener("keydown", function (event){
		 switch (event.keyCode){
			 case 65: outerAngle +=0.03; break;   //'a'
			 case 66: middleAngle +=0.02; break; //'b'
			 case 67: innerAngle +=0.01; break; //'c'
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
