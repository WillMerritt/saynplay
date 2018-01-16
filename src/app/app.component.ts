import { Component } from '@angular/core';
import {ChessService} from './services/chess.service';
import {IoService} from './services/io.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';

  constructor(public chessService: ChessService,
              public socketService: IoService) {
    if (this.chessService.wasPlaying()) {
      const id = this.chessService.getGameId();
      this.socketService.fetchGame(id);
    }
  }
}
