import {Injectable, OnInit} from '@angular/core';
import * as io from 'socket.io-client';

@Injectable()
export class IoService implements OnInit {
  private socket: SocketIOClient.Socket;
  private clients = [];

  constructor() {
    this.socket = io();

    this.socket.on('show clients', (clients) => {
      this.clients = clients;
    });

    this.socket.on('received request', (socket) => {
      console.log(socket);
    })
  }

  ngOnInit() {

  }

  requestToPlay(socket: string) {
    this.socket.emit('request to play', socket);
  }

  getClients() {
    return this.clients;
  }

}
