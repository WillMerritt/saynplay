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
    const id = localStorage.getItem('id');
    if (id) {
      return id;
    }
    return '';
  }
  setGameInStorage(id) {
    localStorage.setItem('id', id);
  }
}
