import {EventEmitter, Injectable} from '@angular/core';
import * as _ from 'underscore';
import { HttpClient } from '@angular/common/http';
import {Coor} from '../globals/classes';

@Injectable()
export class ChessService {
  private board;
  private id;
  private startTime;
  public changes: EventEmitter<any> = new EventEmitter();
  public boardChanged: EventEmitter<any> = new EventEmitter();
  public turn = 'light';

  constructor(private http: HttpClient) {

  }

  isPlaying() {
    return this.id && this.id !== '';
  }

  wasPlaying() {
    if (localStorage.getItem('id')) {
      return true;
    }
    return false;
  }

  fetchStartGame(callback) {
    this.http.get('api/get-start-board')
      .subscribe(
        data => {
          this.board = data['board'];
          console.log(this.board);
          callback(true);
        },
        err => {
          console.log(err);
          callback(false);
        }
      );
  }

  sendBoard() {
    // console.log('Sending the game');
    const body = {
      'board': this.board,
      'turn': this.turn
    };
    this.http.post('http://localhost:8000/ai/', body)
      .subscribe(
        data => {
          // console.log('JUST GOT THE NEW BOARD');
          // console.log(data);
          this.updateAIGame(data);
        },
        err => console.log(err)
        // () => this.sendBoard()
      );
  }

  switchTurn() {
    // console.log(this.turn);
    this.turn = this.turn === 'light' ? 'dark' : 'light';
  }

  checkLegal(coors, newCoors) {
    // console.log('CHECKING LEGAL WITH THE SERVER');
    const body = {
      'board': this.board,
      'coors': coors,
      'newCoors': newCoors
    };
    return this.http.post('http://localhost:8000/ai/islegal', JSON.stringify(body));
  }

  quitGame() {
    // this.board = null;
    this.id = null;
    localStorage.removeItem('id');
  }

  getGameId() {
    const id = this.id || localStorage.getItem('id');
    if (id) {
      return id;
    }
    return '';
  }
  getGameBoard() {
    return this.board;
  }

  updateGame(board, startTime, id) {
    this.board = board;
    this.startTime = startTime;
    this.id = id;
    this.boardChanged.emit(board);
    this.setGameInStorage(id);
  }

  updateAIGame(board) {
    this.board = board;
    this.boardChanged.emit(board);
  }

  setGameInStorage(id) {
    localStorage.setItem('id', id);
  }
  getPieceFromCoors(coors) {
    return this.board[coors.row][coors.col];
  }

  modifyBoard(piece, coors, newCoors, callback) {
    if (newCoors.row === coors.row && newCoors.col === coors.col) {
      callback(null);
    } else {
      const current = this.board[newCoors.row][newCoors.col];
      piece['moved'] = true;
      this.board[coors.row][coors.col] = null;
      this.board[newCoors.row][newCoors.col] = piece;
      callback(current);
    }
  }
}
