//import './style.css'

import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';

let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 1000);
let renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

let clock = new THREE.Clock();

let controls = new OrbitControls(camera, renderer.domElement);

var axesHelper = new THREE.AxesHelper(40);
scene.add(axesHelper);

var boxGeometry = new THREE.BoxGeometry(80, 2, 80, 30, 1, 30);
/*
var planeMaterial = new THREE.MeshBasicMaterial({
	color: 0xff0000,
	wireframe: true
});

var plane = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(plane);
*/

const uniformsData = {
	u_time: {
		type: 'f',
		value: clock.getElapsedTime(),
	},
};

var material = new THREE.ShaderMaterial({
	wireframe: true,
	uniforms: uniformsData,
	vertexShader: `
	// projectionMatrix, modelViewMatrix, position ya las definió threejs
	
	uniform float u_time;

	varying vec3 pos;

	void main(){
		vec4 result;
		pos = position;

		result = vec4(position.x, 4.0*sin(position.z/4.0 + u_time) + 2.0*cos(position.x/6.0 + u_time) + position.y, position.z, 1.0);

		gl_Position = projectionMatrix
			* modelViewMatrix
			* result;
	}
	`,
	fragmentShader: `
	uniform float u_time;

	varying vec3 pos;
	void main(){

		if (pos.x >= 0.0){
			gl_FragColor = vec4(abs(sin(u_time)), -abs(sin(u_time)), abs(cos(u_time)), 1.0);
		} else {
			gl_FragColor = vec4(abs(cos(u_time)), abs(cos(u_time))-0.5, abs(sin(u_time)), 1.0);
		}
	}
	`
});

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

function animate(){
	requestAnimationFrame(animate);
	controls.update();

	// actualiza uniforms
	uniformsData.u_time.value = clock.getElapsedTime();

	renderer.render(scene, camera);
}

animate();
