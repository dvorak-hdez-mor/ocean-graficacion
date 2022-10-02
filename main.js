import './style.css'

import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import {GUI} from 'dat.gui';
import {MathUtils} from 'three';

let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 1000);

let renderer = new THREE.WebGLRenderer({
	canvas: document.querySelector('#bg'),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

let clock = new THREE.Clock();

let controls = new OrbitControls(camera, renderer.domElement);

//controls.minPolarAngle = Math.PI/4;
controls.maxPolarAngle = Math.PI*0.395;

// set gui
const gui = new GUI();

//var axesHelper = new THREE.AxesHelper(40);
//scene.add(axesHelper);

var boxGeometry = new THREE.BoxGeometry(160, 2, 160, 50, 1, 50);

function getRandomVal(inf, sup){
	let r = THREE.MathUtils.randFloat(inf, sup);
	r = Math.ceil(r*10)/10;
	return r;
}

let randomVal = getRandomVal(0.1, 3.9);
let velMarea = 0.9;
//alert(randomVal);

const uniformsData = {
	u_time: {
		type: 'f',
		value: clock.getElapsedTime(),
	},
	u_random: {
		type: 'f',
		value: randomVal,
	},
	u_velMarea: {
		type: 'f',
		value: velMarea,
	}
};

const mareaPlana_VS = `
	// projectionMatrix, modelViewMatrix, position ya las definió threejs
	
	uniform float u_time;

	varying vec3 pos;

	void main(){
		vec4 result;
		pos = position;

		//result = vec4(position.x, 4.0*sin(position.z/4.0 + u_time) + 2.0*cos(position.x/6.0 + u_time) + position.y, position.z, 1.0);

		//result = vec4(position.x, sin(position.z + u_time) + position.y, position.z, 1.0);

		result = vec4(position.x, position.y, position.z, 1.0);		

		gl_Position = projectionMatrix
			* modelViewMatrix
			* result;
	}
`;

const mareaTranquila_VS = `
	// projectionMatrix, modelViewMatrix, position ya las definió threejs
	// uniform = constantes con valores iniciales

	uniform float u_time;

	uniform float u_random;

	varying vec3 pos;

	void main(){
		vec4 result;
		pos = position;

		result = vec4(position.x, u_random*sin(position.z/4.0 + u_time) + u_random*cos(position.x/6.0 + u_time) + position.y, position.z, 1.0);

		//result = vec4(position.x, sin(position.z + u_time) + position.y, position.z, 1.0);

		//result = vec4(position.x, position.y, position.z, 1.0);		

		gl_Position = projectionMatrix
			* modelViewMatrix
			* result;
	}

`;

const mareaAgitada_VS = `
	// projectionMatrix, modelViewMatrix, position ya las definió threejs
	
	uniform float u_time;

	varying vec3 pos;

	void main(){
		vec4 result;
		pos = position;

		//result = vec4(position.x, 4.0*sin(position.z/4.0 + u_time) + 2.0*cos(position.x/6.0 + u_time) + position.y, position.z, 1.0);

		//result = vec4(position.x, sin(position.z + u_time) + position.y, position.z, 1.0);

		//result = vec4(position.x, position.y, position.z, 1.0);
		
		
		if (position.x <= -20.0 || position.x >= 20.0){
			result = vec4(position.x, 8.0*sin(position.z/4.0 + u_time) + 2.0*cos(position.x/6.0 + u_time) + position.y, position.z, 1.0);
		} else if (position.x >= -20.0 && position.x <= -10.0){
			result = vec4(position.x, 6.0*sin(position.z/4.0 + u_time) + 2.0*cos(position.x/6.0 + u_time) + position.y, position.z, 1.0);
		} else if (position.x >= 10.0 && position.x <= 20.0){
			result = vec4(position.x, 6.0*sin(position.z/4.0 + u_time) + 2.0*cos(position.x/6.0 + u_time) + position.y, position.z, 1.0);
		} else {
			//result = vec4(position.x, position.y, position.z, 1.0);
			result = vec4(position.x, 4.0*sin(position.z/4.0 + u_time) + 2.0*cos(position.x/6.0 + u_time) + position.y, position.z, 1.0);
		}
		

		gl_Position = projectionMatrix
			* modelViewMatrix
			* result;
	}
`;

const colorNormal_FS = `
	uniform float u_time;
	uniform float u_velMarea;

	varying vec3 pos;

	void main(){
		gl_FragColor = vec4(tan(pos.x)-8.0*sin(pos.z/4.0 - u_time/u_velMarea), 0.0, sin(1.5*u_time), 1.0);
	}
`;

const colorNormal2_FS = `
	uniform float u_time;

	varying vec3 pos;

	void main(){
		gl_FragColor = vec4(abs(sin(u_time)), 0.0, tan(pos.z)-8.0*sin(pos.x/4.0 + u_time), 1.0);
	}
`;

const colorPsico_FS = `
	uniform float u_time;

	varying vec3 pos;
	void main(){

		if (pos.x >= 0.0){
			gl_FragColor = vec4(abs(sin(u_time)), -abs(sin(u_time)), abs(cos(u_time)), 1.0);
		} else {
			gl_FragColor = vec4(abs(cos(u_time)), abs(cos(u_time))-0.5, abs(sin(u_time)), 1.0);
		}
	}
`;

var material = new THREE.ShaderMaterial({
	wireframe: false,
	uniforms: uniformsData,
	vertexShader: mareaTranquila_VS,
	fragmentShader: colorNormal_FS,
});

var material2 = new THREE.ShaderMaterial({
	wireframe: false,
	uniforms: uniformsData,
	vertexShader: mareaTranquila_VS,
	fragmentShader: colorNormal2_FS,
});

material.setValues({wireframe:false}); // apaga o enciende el wireframe
material.setValues({vertexShader:mareaTranquila_VS});

// uniendo con el shader
var box = new THREE.Mesh(boxGeometry, material);
scene.add(box);

// Elementos del gui
gui.add(box.material, 'wireframe');
gui.add(uniformsData.u_random, "value", -3.9, 3.9, 0.1).name('Fuerza del Oleaje');
gui.add(uniformsData.u_velMarea, "value", 0.1, 0.9, 0.01).name('Velocidad de la marea');
//gui.add(opc, 'isPsico');

var sphereGeometry = new THREE.SphereGeometry(6, 20, 20);
var sphere = new THREE.Mesh(sphereGeometry, material2);
sphere.position.set(0, 6, 0);
sphere.castShadow = true;
scene.add(sphere);

camera.position.set(-15, 15, 15);

camera.lookAt(0,0,0);

const light = new THREE.PointLight(0xffffff, 0.5, 10);
light.position.set(0, 20, 0);
scene.add(light);

// trayectoria blezier
// curva1
const curve1 = new THREE.CubicBezierCurve3(
	new THREE.Vector3( -30, 30, 0 ),
	new THREE.Vector3( -30, 30, -30 ),
	new THREE.Vector3( -30, 20, -30 ),
	new THREE.Vector3( 0, 20, -30 ),
);

const points1 = curve1.getPoints( 50 );
const b1Geometry = new THREE.BufferGeometry().setFromPoints( points1 );

const b1Material = new THREE.LineBasicMaterial( { color: 0xff0000 } );

// Create the final object to add to the scene
const curveObject1 = new THREE.Line( b1Geometry, b1Material );
scene.add(curveObject1);

// curva2
const curve2 = new THREE.CubicBezierCurve3(
	new THREE.Vector3( 0, 20, -30 ),
	new THREE.Vector3( 30, 20, -30 ),
	new THREE.Vector3( 30, 30, -30 ),
	new THREE.Vector3( 30, 30, 0 ),
);

const points2 = curve2.getPoints( 50 );
const b2Geometry = new THREE.BufferGeometry().setFromPoints( points2 );

const b2Material = new THREE.LineBasicMaterial( { color: 0x00ff00 } );

// Create the final object to add to the scene
const curveObject2 = new THREE.Line( b2Geometry, b2Material );
scene.add(curveObject2);

// curva3
const curve3 = new THREE.CubicBezierCurve3(
	new THREE.Vector3( 30, 30, 0 ),
	new THREE.Vector3( 30, 30, 30 ),
	new THREE.Vector3( 30, 20, 30 ),
	new THREE.Vector3( 0, 20, 30 ),
);

const points3 = curve3.getPoints( 50 );
const b3Geometry = new THREE.BufferGeometry().setFromPoints( points3 );

const b3Material = new THREE.LineBasicMaterial( { color: 0x0000ff } );

// Create the final object to add to the scene
const curveObject3 = new THREE.Line( b3Geometry, b3Material );
scene.add(curveObject3);

// curva4
const curve4 = new THREE.CubicBezierCurve3(
	new THREE.Vector3( 0, 20, 30 ),	
	new THREE.Vector3( -30, 20, 30 ),
	new THREE.Vector3( -30, 30, 30 ),
	new THREE.Vector3( -30, 30, 0 ),
);

const points4 = curve4.getPoints( 50 );
const b4Geometry = new THREE.BufferGeometry().setFromPoints( points4 );

const b4Material = new THREE.LineBasicMaterial( { color: 0x0ffff0 } );

// Create the final object to add to the scene
const curveObject4 = new THREE.Line( b4Geometry, b4Material );
scene.add(curveObject4);

// --------------------------

const p1 = points1.slice(0, 50);
const p2 = points2.slice(0, 50);
const p3 = points3.slice(0, 50);
const p4 = points4.slice(0, 50);

let r = [];
r = [].concat(p1, p2, p3, p4);
//console.log(r);

function setBlezierPos(pos){
	camera.position.set(r[pos].x, r[pos].y, r[pos].z);
}

controls.update();

function onWindowResize( event ) {
	renderer.setSize( window.innerWidth, window.innerHeight );
}
onWindowResize();
window.addEventListener( 'resize', onWindowResize);

const onKeyDown = function(e){
	switch(e.code){
		case 'KeyM':
			mode = (mode < 3)?mode + 1:0;
			if (mode == 2){
				controls.autoRotate = true;
				controls.autoRotateSpeed = 3;
				camera.position.set(0, 30, 0);
			} else {
				controls.autoRotate = false;
				camera.position.set(-15, 15, 15);
			} 
	}
}

document.addEventListener('keydown', onKeyDown);

let step = 0;
let pointPosition = 0;
let mode = 0;

function animate(now){
	requestAnimationFrame(animate);
	controls.update();

	// actualiza uniforms
	uniformsData.u_time.value = clock.getElapsedTime();
	//step += 0.1;
	
	switch(mode){
		case 0:
			camera.position.x = Math.cos(step) * 25;
			camera.position.z = Math.sin(step) * 45;
			camera.position.y = Math.sin(step + Math.PI/4) * 10 + 20;

			step += 0.01;
			break;
		case 1:
			setBlezierPos(pointPosition);
			pointPosition += 1;
			if (pointPosition > 199){
				pointPosition = 0;
			}
			break;
	}

	renderer.render(scene, camera);
}

animate();
