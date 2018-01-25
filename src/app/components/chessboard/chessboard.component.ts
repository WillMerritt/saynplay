import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  ViewChild
} from '@angular/core';

import {Object3D, Vector3} from 'three';
import {ChessService} from '../../services/chess.service';
import {IoService} from '../../services/io.service';
import {Change, Coor, Pos} from '../../globals/classes';

import DragControlsAdv from 'drag-controls-adv';
import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';
import * as ObjLoader from 'three-obj-loader';
ObjLoader(THREE);

// Axis Orientation
//    Y
//    |
//    |
//    |_______ X
//   / Board goes here
//  /
// Z


@Component({
  selector: 'app-chessboard',
  templateUrl: './chessboard.component.html',
  styleUrls: ['./chessboard.component.css']
})
export class ChessboardComponent implements AfterViewInit, OnInit {

  // Three Elements
  private camera: THREE.PerspectiveCamera;
  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }

  @ViewChild('canvas')
  private canvasRef: ElementRef;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private objLoader: THREE.OBJLoader = new THREE.OBJLoader();
  private textLoader: THREE.TextureLoader = new THREE.TextureLoader();
  private dirLight: THREE.DirectionalLight;
  private ambientLight: THREE.AmbientLight;
  private mouse: THREE.Vector2 = new THREE.Vector2();
  private dragControls: any;
  private objects: Object3D[] = [];
  public tween: any;

  // Camera Properties
  public camRotation = new THREE.Vector3(0, 0, 0);
  public camAngle = new THREE.Vector3(0, 0, 0);
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
  constructor(public chessService: ChessService,
              public socketService: IoService) { }

  ngOnInit() {
    this.chessService.changes
      .subscribe(
        data => this.updateScenePieces(data)
      );
  }

  ngAfterViewInit() {
    this.initScene();
    this.initLighting();
    // this.addShadowBox();
    // this.addCube();
    this.initChess();
    this.initSphereScene();
    this.startRenderingLoop();
    this.initDraggable();
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
    this.camera.position.set(0, 70, this.radius);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
  }

  initLighting() {
    // Create a DirectionalLight and turn on shadows for the light
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(this.ambientLight);

    this.dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    this.dirLight.position.set(1, 1, 0);
    this.scene.add(this.dirLight);
  }

  initSphereScene() {
    const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(9999, 32, 32),
        new THREE.MeshBasicMaterial({
          map: this.textLoader.load('assets/images/cubic_map.jpg'),
          side: THREE.DoubleSide
        })
      );
    this.scene.add(sphere);
  }

  // TWEEN ANIMATIONS _____________________________________________

  rotateCamera(dir: string) {
    const newAlpha = dir === 'left' ? this.camRotation.x - this.increment : this.camRotation.x + this.increment;
    this.tween = new TWEEN.Tween(this.camRotation)
      .to(new THREE.Vector3(newAlpha, 0, 0), 1000)
      .start()
      .easing(TWEEN.Easing.Exponential.InOut)
      .onUpdate(() => {
        this.rotateCameraHorizontally(this.camRotation.x);
      });
  }

  rotateCameraHorizontally(alpha: number) {
    // const axis = new THREE.Vector3(0, 1, 0);
    // this.camera.position.applyAxisAngle(axis, alpha);
    this.camera.position.z = this.radius * Math.cos(alpha);
    this.camera.position.x  = this.radius * Math.sin(alpha);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
  }
  rotateCameraVertically(offsetTheta: number) {
    const z = this.camera.position.z;
    const x = this.camera.position.x;
    const y = this.camera.position.y;
    const originRadius = this.camera.position.distanceTo(new THREE.Vector3(0, 0, 0));
    const curTheta = Math.asin(this.camera.y / originRadius);
    const newTheta = curTheta + offsetTheta;

    const newY = this.radius * Math.sin(newTheta);
    const d = Math.sqrt(originRadius**2 - newY**2);
    const alpha = Math.atan(x / z);
    const newZ = d * Math.cos(alpha);
    const newX = d * Math.sin(alpha);
    this.camera.position.set(newX, newY, newZ);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));


    // const axis = new THREE.Vector3(1, 0, 0);
    // this.camera.position.applyAxisAngle(axis, alpha);
  }

  animatePiece = (object, newPos) => {
    this.tween = new TWEEN.Tween(object.position)
      .to(newPos)
      .start()
      .easing(TWEEN.Easing.Exponential.InOut)
      .onUpdate(() => {
      });
  }

  removePieceFromScene(piece, coors) {
    const name = this.getDetailName(piece.name, piece.color, coors.row, coors.col);
    this.scene.children.forEach((child) => {
      if (child.name === name) {
        this.scene.remove(child);
      }
    });
  }


  animate = (object: Object3D, pos: THREE.Vector3) => {
    const coors = this.getRowColFromPos(pos);
    const newCoors: Coor = this.getRowColFromPos(object.position);
    let newPos = new Pos(pos.x, pos.z);
    const piece = this.chessService.getPieceFromCoors(coors);
    if (this.chessService.isCompleteMoveLegal(piece, coors, newCoors)) {
      newPos = this.getClosestPos(object.position);
      const changes = [new Change(coors, newCoors, piece)];
      this.chessService.modifyBoard(piece, coors, newCoors, (removed) => {
        if (removed) {
          this.removePieceFromScene(removed, newCoors);

          changes.push(new Change(newCoors, newCoors, piece));
        }
      });
      this.socketService.updateGame(changes);
    }
    this.animatePiece(object, newPos);
  }

  // ________________________________________________________________________

  // Give position, get row and col
  getRowColFromPos(pos: THREE.Vector3): Coor {
    const temp = new THREE.Vector3(pos.x, 0, pos.z);
    const result = new Coor(0, 0);
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

  getPosFromRowCol(row: number, col: number): Pos {
    const x = this.getPieceStart(this.boardLengths.size.x, this.boardLengths.min.x, col);
    const z = this.getPieceStart(this.boardLengths.size.y, this.boardLengths.min.y, row);
    return new Pos(x, z);
  }



  // Give position, get closest position
  getClosestPos(pos: THREE.Vector3): Pos {
    const square = this.getRowColFromPos(pos);
    return this.getPosFromRowCol(square.row, square.col);
  }

  // Piece Positioning

  setPiecePosition(row, col, obj): THREE.Vector3 {
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
      this.chessService.fetchStartGame((success) => {
        if (success) {
          this.addPieces();
        }
      })
    });
  }

  addBoard(callback) {
    this.objLoader.load('assets/pieces_comp/chessboard.obj', (obj: THREE.Object3D) => {
      const material = new THREE.MeshStandardMaterial( { map: this.textLoader.load('assets/images/marble.jpeg'), side: THREE.DoubleSide } );
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
    const light_wood = this.textLoader.load(`assets/images/light_wood.jpg`);
    const dark_wood = this.textLoader.load(`assets/images/dark_wood.jpg`);

    board.forEach((row, row_index) => {
      row.forEach((col, col_index) => {
        if (col == null) {
          return;
        }
        const color = col['color'];
        const piece = col['name'];
        const name = this.getDetailName(piece, color, row_index, col_index);
        this.objLoader.load(`assets/pieces_comp/${piece}_${color}.obj`, (obj: THREE.Object3D) => {
          const pieceMat = new THREE.MeshStandardMaterial({map: color === 'light' ? light_wood : dark_wood});
          obj.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.material = pieceMat;
            }
          });
          const pos = this.setPiecePosition(row_index, col_index, obj);
          obj.position.set(pos.x, pos.y, pos.z);
          obj.castShadow = true;
          obj.receiveShadow = true;
          obj.name = name;
          this.scene.add(obj);
          this.objects.push(obj);
        });
      });
    });
  }

  getDetailName(name, color, row, col) {
    return `${name}_${color}_${row}_${col}`;
  }

  updateScenePieces(data: Change[]) {
    data.forEach((change, i) => {

      const row = change.oldCoor.row;
      const col = change.oldCoor.col;
      const name = this.getDetailName(change.piece.name, change.piece.color, row, col);

      this.scene.children.forEach((child, j) => {
        if (name === child.name) {
          if (change.newCoor == null) {
            this.scene.remove(child);
            return;
          }
          child.name = this.getDetailName(
            change.piece.name,
            change.piece.color,
            change.newCoor.row,
            change.newCoor.col);

          const newPos = this.getPosFromRowCol(change.newCoor.row, change.newCoor.col);
          this.animatePiece(child, newPos);
        }
      });
    });
  }



  // Utilities

  private getAspectRatio() {
    return this.canvas.clientWidth / this.canvas.clientHeight;
  }

  quitGame() {
    this.chessService.quitGame();
  }

  // Event Handlers

  updateMouse(event: any) {
    this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    // this.canvas.style.width = '100%';
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

