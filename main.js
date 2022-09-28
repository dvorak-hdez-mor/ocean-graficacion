import './style.css'

import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';

let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 1000);
//let renderer = new THREE.WebGLRenderer();
//renderer.setSize(window.innerWidth, window.innerHeight);
//document.body.appendChild(renderer.domElement);

let renderer = new THREE.WebGLRenderer({
	canvas: document.querySelector('#bg'),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

let clock = new THREE.Clock();

let controls = new OrbitControls(camera, renderer.domElement);

var axesHelper = new THREE.AxesHelper(40);
scene.add(axesHelper);

var boxGeometry = new THREE.BoxGeometry(80, 2, 80, 20, 1, 20);

function getRandomVal(inf, sup){
	let r = THREE.MathUtils.randFloat(inf, sup);
	r = Math.ceil(r*10)/10;
	return r;
}

let randomVal = getRandomVal(0.1, 3.9);

alert(randomVal);

const uniformsData = {
	u_time: {
		type: 'f',
		value: clock.getElapsedTime(),
	},
	u_random: {
		type: 'f',
		value: randomVal,
	},
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

	varying vec3 pos;
	void main(){
		gl_FragColor = vec4(0.0, 0.7, 0.4, 1.0);
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
	fragmentShader: colorPsico_FS
});

material.setValues({wireframe:true}); // apaga o enciende el wireframe
material.setValues({vertexShader:mareaTranquila_VS});

// uniendo con el shader
var box = new THREE.Mesh(boxGeometry, material);
scene.add(box);

var sphereGeometry = new THREE.SphereGeometry(5, 10, 10);
var sphere = new THREE.Mesh(sphereGeometry, material);
sphere.position.set(0, 5, 0);
scene.add(sphere);

camera.position.set(0, 15, 25);

camera.lookAt(0,0,0);

const light = new THREE.AmbientLight(0xffffff);
scene.add(light);

controls.update();

onWindowResize();
window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize( event ) {
	renderer.setSize( window.innerWidth, window.innerHeight );
}

let step = 0;

//alert(4.0 % 2==0);

function animate(){
	requestAnimationFrame(animate);
	controls.update();

	// actualiza uniforms
	uniformsData.u_time.value = clock.getElapsedTime();
	if (step % 3 == 0){
		uniformsData.u_random.value = getRandomVal(0.1, 3.9);
	}

	step += 0.1;

	renderer.render(scene, camera);
}

animate();
