import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  ViewChild
} from '@angular/core';
import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';
import DragControlsAdv from 'drag-controls-adv';
import { KING, QUEEN, PAWN, ROOK, BISHOP, KNIGHT, LIGHT, DARK } from '../../globals/vars';
import {Object3D, Vector3} from 'three';
import {ChessService} from '../../services/chess.service';
import {IoService} from '../../services/io.service';

const ObjLoader = require('three-obj-loader')(THREE);
const OrbitControls = require('three-orbit-controls')(THREE);
const TrackballControls = require('three-trackballcontrols');

@Component({
  selector: 'app-chessboard',
  templateUrl: './chessboard.component.html',
  styleUrls: ['./chessboard.component.css']
})
export class ChessboardComponent implements AfterViewInit {

  private pieces: String[] = [KING, QUEEN, PAWN, ROOK, BISHOP, KNIGHT];
  private colors: String[] = [LIGHT, DARK];

  // Three Elements
  private camera: THREE.PerspectiveCamera;
  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }

  @ViewChild('canvas')
  private canvasRef: ElementRef;
  // private controls: THREE.OrbitControls;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private loader: THREE.OBJLoader;
  private dirLight: THREE.DirectionalLight;
  private ambientLight: THREE.AmbientLight;
  private mouse: THREE.Vector2 = new THREE.Vector2();
  private dragControls: any;
  private objects: Object3D[] = [];
  public tween: any;

  // Camera Properties
  public camV = new THREE.Vector3(0, 0, 0);
  public radius = 50;
  public increment = Math.PI;


  /* STAGE PROPERTIES */
  @Input() public fieldOfView = 30;
  @Input() public nearClippingPane = .1;
  @Input() public farClippingPane = 10000;

  // Chess Properties
  public boardLengths: {size: THREE.Vector3, min: THREE.Vector3, max: THREE.Vector3};
  public boardMultiplier = 8 / 9.2; // ratio of squares to to total squares from edge to edge

  // Lifecycle Hooks
  constructor(private chessService: ChessService,
              private socketService: IoService) { }

  ngAfterViewInit() {
    this.initScene();
    this.initLighting();
    this.initHelpers();
    // this.addShadowBox();
    // this.addCube();
    this.initChess();
    this.startRenderingLoop();
    this.initDraggable();
  }

  // Initializer

  initScene() {
    this.scene = new THREE.Scene();
    // this.scene.fog = new THREE.FogExp2( 0xcccccc, 0.002 );

    this.camera = new THREE.PerspectiveCamera(
      this.fieldOfView,
      this.getAspectRatio(),
      this.nearClippingPane,
      this.farClippingPane
    );
    this.camera.position.set(0, 70, 50);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
  }

  initHelpers() {
    const axesHelper = new THREE.AxisHelper( 50 );
    this.scene.add( axesHelper );
  }


  initLighting() {
    // Create a DirectionalLight and turn on shadows for the light
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(this.ambientLight);

    this.dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    this.dirLight.position.set(1, 1, 0);
    this.scene.add(this.dirLight);
  }

  // TWEEN ANIMATIONS _____________________________________________

  rotateCamera(dir: string) {
    const newX = dir === 'left' ? this.camV.x - this.increment : this.camV.x + this.increment;
    this.tween = new TWEEN.Tween(this.camV)
      .to(new THREE.Vector3(newX, 0, 0), 1000)
      .start()
      .easing(TWEEN.Easing.Exponential.InOut)
      .onUpdate(() => {
        this.rotateCameraHorizontally(this.camV.x);
      });
  }

  rotateCameraHorizontally(alpha: number) {
    this.camera.position.z = this.radius * Math.cos(alpha);
    this.camera.position.x  = this.radius * Math.sin(alpha);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
  }


  animate = (object: Object3D, pos: THREE.Vector3) => {
    const coors = this.getRowColFromPos(pos);
    const newCoors = this.getRowColFromPos(object.position);
    let newPos = {x: pos.x, z: pos.z};
    const piece = this.chessService.getPieceFromCoors(coors);
    if (this.chessService.isLegal(piece, coors, newCoors)) {
      newPos = this.getClosestPos(object.position);
      this.chessService.modifyBoard(piece, coors, newCoors);
      this.socketService.updateGame();
    }

    this.tween = new TWEEN.Tween(object.position)
      .to(newPos)
      .start()
      .easing(TWEEN.Easing.Exponential.InOut)
      .onUpdate(() => {
      })
  }

  // ________________________________________________________________________

  // Give position, get row and col
  getRowColFromPos(pos: THREE.Vector3) {
    const temp = new THREE.Vector3(pos.x, 0, pos.z);
    const result = {'row': 0, 'col': 0};
    let min = null;
    for (let row = 0; row < 8; row ++) {
      for (let col = 0; col < 8; col += 1) {
        const coors = this.getPosFromRowCol(row, col);
        if (result == null) {
          result.row = row;
          result.col = col;
        }
        const v = new THREE.Vector3(coors.x, 0, coors.z);
        const len = v.sub(temp).length();
        if (min == null) {
          min = len;
        }
        if (len < min) {
          min = len;
          result.row = row;
          result.col = col;
        }
      }
    }
    return result;
  }

  getPosFromRowCol(row: number, col: number) {
    const x = this.getPieceStart(this.boardLengths.size.x, this.boardLengths.min.x, col);
    const z = this.getPieceStart(this.boardLengths.size.y, this.boardLengths.min.y, row);
    return {x: x, z: z};
  }



  // Give position, get closest position
  getClosestPos(pos: THREE.Vector3) {
    const square = this.getRowColFromPos(pos);
    const coors = this.getPosFromRowCol(square.row, square.col);
    return coors;
  }


  // Piece Positioning

  setPiecePosition(row, col, obj) {
    const sizeBox = new THREE.Box3().setFromObject( obj );
    const position = this.getPosFromRowCol(row, col);
    const height = this.getPieceHeight(sizeBox.min);
    return new Vector3(position.x, height, position.z);
  }

  getPieceStart(size, min, index) {
    const len = size * this.boardMultiplier;
    const edge = (size - len) / 2;
    const box_width = len / 8;
    const start = min + edge + box_width / 2;
    return start + (index * box_width);
  }



  getPieceHeight(min: THREE.Vector3) {
    return -min.y;
  }


  // ________________________________________________________________________

  initDraggable() {
    this.dragControls = new DragControlsAdv(
      this.objects,
      this.camera,
      this.renderer.domElement,
      new THREE.Vector3(0, 1, 0),
      this.animate
    );
  }


  startRenderingLoop() {
    const component: ChessboardComponent = this;
    /* Renderer */
    // Use canvas element in template
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas });
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Start Orbit Control
    // this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    // this.controls.update();

    this.camera.updateMatrixWorld(true);


    (function render() {
      requestAnimationFrame(render);
      TWEEN.update();
      // component.controls.update();
      component.updateScene();
      component.renderer.render(component.scene, component.camera);
    }());
  }

  updateScene() { }

  // Adding elements to the scene


  initChess() {
    this.addBoard(() => {
      this.addPieces();
    });
  }

  addBoard(callback) {
    this.loader = new THREE.OBJLoader();
    this.loader.load('assets/pieces_comp/chessboard.obj', (obj: THREE.Object3D) => {
      const material = new THREE.MeshLambertMaterial( { map: new THREE.TextureLoader().load('assets/images/marble.jpeg'), side: THREE.DoubleSide } );
      obj.traverse(function (child) {
        child.userData.parent = obj;
        if (child instanceof THREE.Mesh) {
          child.material = material;
        }
      });
      // obj.scale.set(0.05, 0.05, 0.05);
      const box = new THREE.Box3().setFromObject( obj );
      this.boardLengths = {'size': box.getSize(), 'min': box.min, 'max': box.max};

      obj.rotation.x = 3 * Math.PI / 2;
      obj.position.y = - this.boardLengths.size.z / 2;
      this.scene.add(obj);
      callback();
    });
  }

  addPieces() {
    // Add pieces once scene is added
    const board = this.chessService.getGameBoard();
    board.forEach((row, row_index) => {
      row.forEach((col, col_index) => {
        if (col == null) {
          return;
        }
        const color = col['color'];
        const piece = col['name'];
        this.loader.load(`assets/pieces_comp/${piece}_${color}.obj`, (obj: THREE.Object3D) => {
          const pieceMat = new THREE.MeshLambertMaterial( { map: new THREE.TextureLoader().load(`assets/images/${color}_wood.jpg`), side: THREE.DoubleSide } );

          obj.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
              child.material = pieceMat;
            }
          });
          const pos = this.setPiecePosition(row_index, col_index, obj);
          obj.position.set(pos.x, pos.y, pos.z);
          // console.log(pos);
          // console.log(obj);
          obj.castShadow = true;
          obj.receiveShadow = true;
          this.scene.add(obj);
          this.objects.push(obj);
        });
      });
    });
  }


  // Animations ...


  // Utilities

  private getAspectRatio() {
    return this.canvas.clientWidth / this.canvas.clientHeight;
  }

  // Event Handlers

  updateMouse(event: any) {
    this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.canvas.style.width = '100%';
    // this.canvas.style.height = '80vh';
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.camera.aspect = this.getAspectRatio();
    this.camera.updateProjectionMatrix();
  }
  @HostListener('mousemove', ['$event'])
  onMouseMove(event: any) {
    this.updateMouse(event);
  }

  // EXTRA CODE

  /*
  addPlane() {
    // Create a plane that receives shadows (but does not cast them)
    const planeGeometry = new THREE.PlaneBufferGeometry( 20, 20, 32, 32 );
    const planeMaterial = new THREE.MeshStandardMaterial( { color: 0x00ff00 } );
    const plane = new THREE.Mesh( planeGeometry, planeMaterial );
    plane.receiveShadow = true;
    this.scene.add( plane );
  }
  addCube() {
    const geometry = new THREE.BoxGeometry( 40, 40, 40 );
    for ( let i = 0; i < 200; i ++ ) {
      const object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );
      object.position.set(Math.random() * 1000 - 500, Math.random() * 1000 - 500, Math.random() * 1000 - 500);
      object.rotation.set(Math.random() * 2 * Math.PI, Math.random() * 2 * Math.PI, Math.random() * 2 * Math.PI)
      object.scale.set(Math.random() * 2 + 1, Math.random() * 2 + 1, Math.random() * 2 + 1);
      object.castShadow = true;
      object.receiveShadow = true;
      this.scene.add( object );
      this.objects.push( object );
    }
  }
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
    const cube = new THREE.Mesh(geometry, cubeMaterials);
    this.scene.add( cube );
  }
  */
}
