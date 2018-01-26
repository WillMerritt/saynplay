import {EventEmitter, Injectable} from '@angular/core';
import * as _ from 'underscore';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class ChessService {
  private board;
  private id;
  private startTime;
  public changes: EventEmitter<any> = new EventEmitter();
  public boardChanged: EventEmitter<any> = new EventEmitter();

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
          callback(true);
        },
        err => {
          console.log(err);
          callback(false);
        }
      );
  }

  quitGame() {
    // this.board = null;
    this.id = null;
    // this.startTime = null;
    // this.gameStarted = false;
    localStorage.removeItem('id');
  }

  createGame(board, startTime, id) {
    console.log('CREATING THE GAME');
    this.board = board;
    this.startTime = startTime;
    this.id = id;
    this.boardChanged.emit();
    this.setGameInStorage(id);
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
    // this.changes.emit(changes);
    this.boardChanged.emit();
  }

  setGameInStorage(id) {
    localStorage.setItem('id', id);
  }
  getPieceFromCoors(coors) {
    return this.board[coors.row][coors.col];
  }

  getCoorsFromPiece(piece) {
    const coors = {row: 0, col: 0};
    this.board.forEach((row, i) => {
      row.forEach((col, j) => {
        if (col !== null && col.name === piece.name && col.color === piece.color) {
          coors.row = i;
          coors.col = j;
        }
      });
    });
    return coors;
  }
  isCompleteMoveLegal(piece, coors, newCoors) {
    return this.isLegal(piece, coors, newCoors);
  }
  isLegal(piece, coors, newCoors) {
    if (coors.row === newCoors.row && coors.col === newCoors.col) {
      return false;
    }
    if (this.isSameSide(piece, newCoors)) {
      return false;
    }

    switch (piece.name) {
      case 'pawn':
        return this.isLegalPawn(piece, coors, newCoors) && !this.isBlocked(coors, newCoors);
      case 'rook':
        return this.isLegalRook(coors, newCoors) && !this.isBlocked(coors, newCoors);
      case 'queen':
        return this.isLegalQueen(coors, newCoors) && !this.isBlocked(coors, newCoors);
      case 'king':
        return this.isLegalKing(piece, coors, newCoors) && !this.isBlocked(coors, newCoors);
      case 'knight':
        return this.isLegalKnight(coors, newCoors) ;
      case 'bishop':
        return this.isLegalBishop(coors, newCoors) && !this.isBlocked(coors, newCoors);
      default:
        return false;
    }
  }

  modifyBoard(piece, coors, newCoors, callback) {
    const current = this.board[newCoors.row][newCoors.col];
    this.board[coors.row][coors.col] = null;
    this.board[newCoors.row][newCoors.col] = piece;
    callback(current);
  }

  // isKingInCheck(temp, color, coors) {
  //   // write code so that you can't move into check
  //
  //   const otherSide = color === 'light' ? 'dark' : 'light';
  //   let inCheck = false;
  //   temp.forEach((row, i) => {
  //     row.forEach((col, j) => {
  //       if (col !== null && col.color === otherSide) {
  //         const coors = {'row': i, 'col': j};
  //         if (this.isLegal(col, coors, newCoors)) {
  //           inCheck = true;
  //         }
  //       }
  //     });
  //   });
  //   return inCheck;
  // }
  isSameSide(piece, coors) {
    // write code so that you cant move onto one of my own pieces
    const row = coors.row;
    const col = coors.col;
    if (this.board[row][col] !== null) {
      return this.board[row][col].color === piece.color;
    }
    return false;
  }
  isBlocked(oldCoor, newCoor) {
    let result = false;
    if (newCoor.col === oldCoor.col) {
      // Vertical Movement case
      const dir = newCoor.row > oldCoor.row ? 1 : -1;
      const rowRange = _.range(oldCoor.row, newCoor.row, dir);
      rowRange.forEach((row, i) => {
        if (i === 0) {
          return;
        }
        if (this.board[row][newCoor.col] !== null) {
          result = true;
        }
      });
    } else {
      const m = (newCoor.row - oldCoor.row) / (newCoor.col - oldCoor.col);
      const dir = newCoor.col > oldCoor.col ? 1 : -1;
      const colRange = _.range(oldCoor.col, newCoor.col, dir);
      colRange.forEach((col, i) => {
        if (i === 0) {
          return;
        }
        const row = oldCoor.row + m * (col - oldCoor.col);
        if (this.board[row][col] !== null) {
          result = true;
        }
      });
    }

    return result;
    // y = oldCoor.row + m(x - oldCoor.col)
  }

  // Legal Functions
  isLegalPawn(piece, coors, newCoors) {
    const dif = piece.color === 'light' ? coors.row - newCoors.row : newCoors.row - coors.row;
    if (coors.row === 1 || coors.row === 6) {
      return dif > 0 && dif <= 2 && coors.col === newCoors.col;
    }
    return dif === 1 && coors.col === newCoors.col;
  }
  isLegalRook(coors, newCoors) {
    return (coors.row === newCoors.row) || (coors.col === newCoors.col);
  }
  isLegalQueen(coors, newCoors) {
    return this.isLegalBishop(coors, newCoors) || this.isLegalRook(coors, newCoors);
  }
  isLegalKing(piece, coors, newCoors) {
    // write code for castling king side or queen size
    const rowDif = Math.abs(coors.row - newCoors.row);
    const colDif = Math.abs(coors.col - newCoors.col);
    return (rowDif <= 1 && colDif <= 1);
  }
  isLegalKnight(coors, newCoors) {
    const rowDif = Math.abs(coors.row - newCoors.row);
    const colDif = Math.abs(coors.col - newCoors.col);
    return (rowDif === 1 && colDif === 2) || (rowDif === 2 && colDif === 1);
  }
  isLegalBishop(coors, newCoors) {
    const rowDif = Math.abs(coors.row - newCoors.row);
    const colDif = Math.abs(coors.col - newCoors.col);
    return (rowDif === colDif);
  }
}
