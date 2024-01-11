
var gl, program;
var myTorus;
var myZeta = 0.0, myPhi = Math.PI/2.0, radius = 1.4, fovy = 1.4;
var selectedPrimitive = exampleCone;

function getWebGLContext() {
    
  var canvas = document.getElementById("myCanvas");

  try {
    return canvas.getContext("webgl2");
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
    
  program.vertexPositionAttribute = gl.getAttribLocation( program, "VertexPosition");
  gl.enableVertexAttribArray(program.vertexPositionAttribute);

  program.modelViewMatrixIndex  = gl.getUniformLocation( program, "modelViewMatrix");
  program.projectionMatrixIndex = gl.getUniformLocation( program, "projectionMatrix");
  
  // normales
  program.vertexNormalAttribute = gl.getAttribLocation ( program, "VertexNormal");
  program.normalMatrixIndex     = gl.getUniformLocation( program, "normalMatrix");
  gl.enableVertexAttribArray(program.vertexNormalAttribute);

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
  
}

function initRendering() { 

  gl.clearColor(0.95,0.95,0.95,1.0);
  gl.enable(gl.DEPTH_TEST);
  
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

function getCameraMatrix() {
  
  // coordenadas esféricas a rectangulares: https://en.wikipedia.org/wiki/Spherical_coordinate_system
  var x = radius * Math.sin(myPhi) * Math.sin(myZeta);
  var y = radius * Math.cos(myPhi);
  var z = radius * Math.sin(myPhi) * Math.cos(myZeta);

  return mat4.lookAt(mat4.create(), [x, y, z], [0, 0, 0], [0, 1, 0]);
  
}

function setShaderMaterial(material) {

  gl.uniform3fv(program.KaIndex,    material.mat_ambient);
  gl.uniform3fv(program.KdIndex,    material.mat_diffuse);
  gl.uniform3fv(program.KsIndex,    material.mat_specular);
  gl.uniform1f (program.alphaIndex, material.alpha);
  
}

function setShaderLight() {

  gl.uniform3f(program.LaIndex,        1.0,  1.0, 1.0);
  gl.uniform3f(program.LdIndex,        1.0,  1.0, 1.0);
  gl.uniform3f(program.LsIndex,        1.0,  1.0, 1.0);
  gl.uniform3f(program.PositionIndex, 10.0, 10.0, 0.0); // en coordenadas del ojo
  
}

function drawSolid(model) { 
    
  gl.bindBuffer (gl.ARRAY_BUFFER, model.idBufferVertices);
  gl.vertexAttribPointer (program.vertexPositionAttribute, 3, gl.FLOAT, false, 2*3*4,   0);
  gl.vertexAttribPointer (program.vertexNormalAttribute,   3, gl.FLOAT, false, 2*3*4, 3*4);
    
  gl.bindBuffer   (gl.ELEMENT_ARRAY_BUFFER, model.idBufferIndices);
  gl.drawElements (gl.TRIANGLES, model.indices.length, gl.UNSIGNED_SHORT, 0);

}

function drawScene() {
    
  // se inicializan los buffers de color y de profundidad
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  // se obtiene la matriz de transformacion de la proyeccion y se envia al shader
  setShaderProjectionMatrix( getProjectionMatrix() );
  
  // se calcula la matriz de transformación del modelo-vista
  var modelMatrix     = mat4.create();
  var modelViewMatrix = mat4.create();
  mat4.fromScaling (modelMatrix, [0.5, 0.5, 0.5]);
  mat4.multiply    (modelViewMatrix, getCameraMatrix(), modelMatrix);
  setShaderModelViewMatrix(modelViewMatrix);
  
  // se obtiene la matriz de transformacion de la normal y se envia al shader
  setShaderNormalMatrix( getNormalMatrix(modelViewMatrix) );
  
  // se envia al Shader el material
  setShaderMaterial(Jade);
  
  // se dibuja la primitiva seleccionada
  drawSolid(selectedPrimitive);

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
        
//         htmlFovy.innerHTML = (fovy * 180 / Math.PI).toFixed(1);
        
      } else {
        
        radius *= Math.exp(-delta);
        radius  = Math.max(Math.min(radius, 30), 0.05);
        
//         htmlRadius.innerHTML = radius.toFixed(1);
        
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
        
//       htmlPhi.innerHTML  = (myPhi  * 180 / Math.PI).toFixed(1);
//       htmlZeta.innerHTML = (myZeta * 180 / Math.PI).toFixed(1);
     
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

  var colors = document.getElementsByTagName("input");

  for (var i = 0; i < colors.length; i++) {
    colors[i].addEventListener("change",
    function(){
      switch (this.getAttribute("name")) {
        case "La": setColor(program.LaIndex, colors[0].value); break;
        case "Ld": setColor(program.LdIndex, colors[1].value); break;
        case "Ls": setColor(program.LsIndex, colors[2].value); break;
      }
      requestAnimationFrame(drawScene);
    },
    false);
  }

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
