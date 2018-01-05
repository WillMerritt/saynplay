import {AfterViewInit, Component, ElementRef, HostListener, Input, OnInit, ViewChild} from '@angular/core';
import * as THREE from 'three';
import * as OBJ from 'three-obj-loader';

const ObjLoader = require('three-obj-loader')(THREE);
const OrbitControls = require('three-orbit-controls')(THREE);


import { KING, QUEEN, PAWN, ROOK, BISHOP, KNIGHT, LIGHT, DARK } from '../../globals/vars';


@Component({
  selector: 'app-chessboard',
  templateUrl: './chessboard.component.html',
  styleUrls: ['./chessboard.component.css']
})
export class ChessboardComponent implements OnInit, AfterViewInit {

  private pieces: String[] = [KING, QUEEN, PAWN, ROOK, BISHOP, KNIGHT];
  private colors: String[] = [LIGHT, DARK];

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
  private pointLight: THREE.PointLight;
  private dirLight: THREE.DirectionalLight;
  private ambientLight: THREE.AmbientLight;
  private spotLight: THREE.SpotLight;
  private raycaster: THREE.Raycaster = new THREE.Raycaster();
  private mouse: THREE.Vector2 = new THREE.Vector2();


  /* STAGE PROPERTIES */
  @Input() public cameraZ = 3;
  @Input() public fieldOfView = 70;
  @Input() public nearClippingPane = .1;
  @Input() public farClippingPane = 10000;

  // Cube Properties
  @Input() public rotationSpeedX = 0.005;
  @Input() public rotationSpeedY = 0.005;
  @Input() public size = 1;

  // Chess Properties
  public boardSize: THREE.Vector3;
  public boardMultiplier = 8 / 9.2; // ratio of squares to to total squares from edge to edge
  // Lifecycle Hooks
  constructor() {

  }


  ngOnInit() {
  }

  ngAfterViewInit() {
    console.log(KING);
    this.initScene();
    this.initLighting();
    this.initHelpers();
    this.addShadowBox();
    this.addPieces();
    // this.addCube();
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

  initHelpers() {
    // const helperCam = new THREE.CameraHelper( this.camera );
    // this.scene.add( helperCam );

    const radius = 10;
    const radials = 16;
    const circles = 8;
    const divisions = 64;
    //
    const helperGrid = new THREE.GridHelper( radius, radials, circles, divisions );
    this.scene.add( helperGrid );

    const axesHelper = new THREE.AxisHelper( 50 );
    this.scene.add( axesHelper );
    // The X axis is red. The Y axis is green. The Z axis is blue.

    const helper = new THREE.DirectionalLightHelper( this.dirLight, 5 );
    this.scene.add( helper );
  }


  initLighting() {
    // Create a DirectionalLight and turn on shadows for the light
    this.ambientLight = new THREE.AmbientLight(0xffffff, .5);
    this.scene.add(this.ambientLight);

    this.dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    this.dirLight.position.set(1, 1, 0);
    this.scene.add(this.dirLight);


    // this.spotLight = new THREE.SpotLight(0xffffff, 1);
    // this.spotLight.position.set(0, 3, 0);
    // this.light1 = new THREE.PointLight(0xff0040, 1, 50);
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
    this.controls.update();

    this.camera.updateMatrixWorld(true);


    const component: ChessboardComponent = this;
    (function render() {
      requestAnimationFrame(render);
      component.controls.update();
      component.updateScene();
      component.renderer.render(component.scene, component.camera);
    }());
  }

  updateScene() {
    // this.animateCube();
    // component.animatePiece();
    this.showHoveredElements();
  }

  showHoveredElements() {
    // update the picking ray with the camera and mouse position
    this.raycaster.setFromCamera( this.mouse, this.camera );

    // calculate objects intersecting the picking ray
    const intersects = this.raycaster.intersectObjects( this.scene.children );

    if ( intersects.length > 0 ) {
      // console.log(intersects.length);
    }
    //   if ( this.INTERSECTED !== intersects[ 0 ].object ) {
    //     if ( this.INTERSECTED ) {
    //       this.INTERSECTED.material.emissive.setHex( this.INTERSECTED.currentHex );
    //     }
    //     this.INTERSECTED = intersects[ 0 ].object;
    //     this.INTERSECTED.currentHex = this.INTERSECTED.material.emissive.getHex();
    //     this.INTERSECTED.material.emissive.setHex( 0xff0000 );
    //   }
    // } else {
    //   if ( this.INTERSECTED ) {
    //     this.INTERSECTED.material.emissive.setHex( this.INTERSECTED.currentHex );
    //   }
    //   this.INTERSECTED = null;
    // }
  }

  // Adding elements to the scene

  addShadowBox() {
    const largeSize = 10000;
    const geometry = new THREE.BoxGeometry(largeSize, largeSize, largeSize);
    const dir = 'assets/images/mp_midnight/midnight-silence_';
    const type = '.png';
    const cubeMaterials = [
      new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load(dir + 'ft' + type), side: THREE.DoubleSide}),
      new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load(dir + 'bk' + type), side: THREE.DoubleSide}),
      new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load(dir + 'up' + type), side: THREE.DoubleSide}),
      new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load(dir + 'dn' + type), side: THREE.DoubleSide}),
      new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load(dir + 'rt' + type), side: THREE.DoubleSide}),
      new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load(dir + 'lf' + type), side: THREE.DoubleSide}),
    ];
    const cubeMaterial = new THREE.MeshFaceMaterial(cubeMaterials);
    // const cubeMaterial =  new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load(dir + 'ft' + type), side: THREE.DoubleSide})
    const cube = new THREE.Mesh(geometry, cubeMaterial);
    this.scene.add( cube );
  }

  addCube() {
    const geometry = new THREE.BoxGeometry( this.size, this.size, this.size );
    // const material = new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe: false } );
    const material = new THREE.MeshLambertMaterial( {map: new THREE.TextureLoader().load('assets/images/cmu.png'), side: THREE.DoubleSide});
    this.cube = new THREE.Mesh( geometry, material );
    this.scene.add( this.cube );
  }

  addPieces() {
    this.loader = new THREE.OBJLoader();
    this.loader.load('assets/pieces/chess_board.obj', (obj: THREE.Object3D) => {
      let material = new THREE.MeshLambertMaterial( { color: 0xffffff, side: THREE.DoubleSide } );
      obj.traverse(function (child) {
        if (child instanceof THREE.Mesh) {
          child.material = material;
        }
      });
      obj.scale.set(0.05, 0.05, 0.05);
      obj.position.set(8.2, -0.65, -1.6);
      const box = new THREE.Box3().setFromObject( obj );
      this.boardSize = box.getSize();
      console.log( box.min, box.max, box.getSize() );
      this.scene.add(obj);

      // Add pieces once scene is added
      const board = this.createBoard();
      board.forEach((row, i) => {
        row.forEach((col, j) => {
          const color = i > 1 ? LIGHT : DARK;
          if (col !== '') {
            this.loader.load(`assets/pieces/${col}_${color}.obj`, (obj: THREE.Object3D) => {
              material = new THREE.MeshLambertMaterial( { map: new THREE.TextureLoader().load(`assets/images/${color}_wood.jpg`), side: THREE.DoubleSide } );
              obj.traverse(function (child) {
                if (child instanceof THREE.Mesh) {
                  child.material = material;
                }
              });
              obj.scale.set(0.05, 0.05, 0.05);
              const position = this.getPositionFromIndices(i, j);
              obj.position.set(position[0], position[1], position[2]);
              this.scene.add(obj);
            });
          }
        });
      });
    });
  }

  createBoard() {
    return [
      [ROOK, KNIGHT, BISHOP, QUEEN, KING, BISHOP, KNIGHT, ROOK],
      [PAWN, PAWN, PAWN, PAWN, PAWN, PAWN, PAWN, PAWN],
      ['', '', '', '', '', '', '', '', ],
      ['', '', '', '', '', '', '', '', ],
      ['', '', '', '', '', '', '', '', ],
      ['', '', '', '', '', '', '', '', ],
      [PAWN, PAWN, PAWN, PAWN, PAWN, PAWN, PAWN, PAWN],
      [ROOK, KNIGHT, BISHOP, QUEEN, KING, BISHOP, KNIGHT, ROOK],
    ];
  }
  getPositionFromIndices(row, col) {
    const x = col * this.boardSize.x / 8 * this.boardMultiplier;
    const z = row * this.boardSize.z / 8 * this.boardMultiplier;
    return [x, 0, z];
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
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100vh';
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.camera.aspect = this.getAspectRatio();
    this.camera.updateProjectionMatrix();
  }
  @HostListener('mousemove', ['$event'])
  onMouseMove(event: any) {
    this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  }
}
