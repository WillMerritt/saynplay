import {AfterViewInit, Component, ElementRef, HostListener, Input, OnInit, ViewChild} from '@angular/core';
import * as THREE from 'three';

const ObjLoader = require('three-obj-loader')(THREE);
const OrbitControls = require('three-orbit-controls')(THREE);

@Component({
  selector: 'app-chessboard',
  templateUrl: './chessboard.component.html',
  styleUrls: ['./chessboard.component.css']
})
export class ChessboardComponent implements OnInit, AfterViewInit {

  // Three Elements
  private camera: THREE.PerspectiveCamera;
  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }

  @ViewChild('canvas')
  private canvasRef: ElementRef;
  private controls: THREE.OrbitControls;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private loader: THREE.OBJLoader;
  private cube: THREE.Mesh;
  private demoPiece: THREE.Object3D;
  private light: THREE.DirectionalLight;

  /* STAGE PROPERTIES */
  @Input() public cameraZ: number = 3;
  @Input() public fieldOfView: number = 70;
  @Input() public nearClippingPane: number = .1;
  @Input() public farClippingPane: number = 1000;

  // Cube Properties
  @Input() public rotationSpeedX: number = 0.005;
  @Input() public rotationSpeedY: number = 0.005;
  @Input() public size: number = 1;

  // Lifecycle Hooks
  constructor() {

  }


  ngOnInit() {
  }

  ngAfterViewInit() {
    this.initScene();
    // this.initLighting();
    // this.addPieces();
    this.addCube();
    // this.addLightCube();
    // this.addPlane();
    this.startRenderingLoop();
  }

  // Initializer

  initScene() {
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      this.fieldOfView,
      this.getAspectRatio(),
      this.nearClippingPane,
      this.farClippingPane
    );
    this.camera.position.z = this.cameraZ;
  }
  initLighting() {
    // Create a DirectionalLight and turn on shadows for the light
    const light = new THREE.DirectionalLight(0xffffff, 10);
    light.position.set( 0, 1, 0 ); 			// default; light shining from top
    light.castShadow = true;            // default false
    this.scene.add( light );
  }


  startRenderingLoop() {
    /* Renderer */
    // Use canvas element in template
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas });
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Start Orbit Control
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.update()


    const component: ChessboardComponent = this;
    (function render() {
      requestAnimationFrame(render);
      component.controls.update();
      component.updateScene();
      component.renderer.render(component.scene, component.camera);
    }());
  }

  updateScene() {
    this.animateCube();
    // component.animatePiece();
  }

  // Adding elements to the scene

  addCube() {
    const geometry = new THREE.BoxGeometry( this.size, this.size, this.size );
    const material = new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe: true } );
    this.cube = new THREE.Mesh( geometry, material );
    this.scene.add( this.cube );
  }

  addCylinder() {
    const geometry = new THREE.CylinderGeometry( 5, 5, 20, 32 );
    const material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
    const cylinder = new THREE.Mesh( geometry, material );
    this.scene.add( cylinder );
  }

  addPieces() {

    this.loader = new ObjLoader();
    this.loader.load('assets/bishop_black.obj', (obj: THREE.Object3D) => {
      const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
      // obj.scale = new THREE.Vector3(10, 10, 10);
      this.demoPiece = obj;
      this.demoPiece.traverse(function (child) {
        if (child instanceof THREE.Mesh) {
          child.material = material;
        }
      });
      this.demoPiece.scale.set(5, 5, 5);
      this.scene.add(this.demoPiece);
      console.log('Added the bishop');
    });
  }

  addLightCube() {
    // Create a sphere that cast shadows (but does not receive them)
    const sphereGeometry = new THREE.SphereBufferGeometry( 5, 32, 32 );
    const sphereMaterial = new THREE.MeshStandardMaterial( { color: 0xff0000 } );
    const sphere = new THREE.Mesh( sphereGeometry, sphereMaterial );
    sphere.castShadow = true; // default is false
    sphere.receiveShadow = false; // default
    this.scene.add( sphere );



  }

  addPlane() {
    // Create a plane that receives shadows (but does not cast them)
    const planeGeometry = new THREE.PlaneBufferGeometry( 20, 20, 32, 32 );
    const planeMaterial = new THREE.MeshStandardMaterial( { color: 0x00ff00 } );
    const plane = new THREE.Mesh( planeGeometry, planeMaterial );
    plane.receiveShadow = true;
    this.scene.add( plane );
  }

  // Animations ...

  private animateCube() {
    this.cube.rotation.x += this.rotationSpeedX;
    this.cube.rotation.y += this.rotationSpeedY;
  }

  private animatePiece() {
    this.demoPiece.rotation.y += this.rotationSpeedY;
    this.demoPiece.rotation.x += this.rotationSpeedX;
  }


  // Utilities

  private getAspectRatio() {
    return this.canvas.clientWidth / this.canvas.clientHeight;
  }

  // Event Handlers

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    console.log('resizing');
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100vh';
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.camera.aspect = this.getAspectRatio();
    this.camera.updateProjectionMatrix();

  }
}
