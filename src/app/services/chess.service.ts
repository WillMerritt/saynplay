import { Injectable } from '@angular/core';

@Injectable()
export class ChessService {
  private board;
  private id;
  private startTime;

  private gameStarted = false;

  constructor() {

  }

  isPlaying() {
    return this.gameStarted;
  }

  wasPlaying() {
    if (localStorage.getItem('id')) {
      console.log('WAS PLAYING');
      return true;
    }
    return false;
  }

  createGame(board, startTime, id) {
    this.board = board;
    this.startTime = startTime;
    this.id = id;
    this.gameStarted = true;

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

  setGameInStorage(id) {
    localStorage.setItem('id', id);
  }
  getPieceFromCoors(coors) {
    return this.board[coors.row][coors.col];
  }
  isLegal(piece, coors, newCoors) {
    // const piece = this.getPieceFromCoors(coors);
    // console.log(piece);
    switch (piece.name) {
      case 'pawn':
        return this.isLegalPawn(piece, coors, newCoors);
      case 'rook':
        return this.isLegalRook(coors, newCoors);
      case 'queen':
        return this.isLegalQueen(coors, newCoors);
      case 'king':
        return this.isLegalKing(piece, coors, newCoors);
      case 'knight':
        return this.isLegalKnight(coors, newCoors);
      case 'bishop':
        return this.isLegalBishop(coors, newCoors);
      default:
        return false;
    }
  }

  modifyBoard(piece, coors, newCoors) {
    this.board[coors.row][coors.col] = null;
    this.board[newCoors.row][newCoors.col] = piece;
  }

  // Legal Functions
  isLegalPawn(piece, coors, newCoors) {
    const dif = piece.color === 'light' ? coors.row - newCoors.row : newCoors.row - coors.row;
    console.log(dif);
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
