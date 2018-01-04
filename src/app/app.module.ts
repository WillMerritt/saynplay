import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { BoardComponent } from './components/board/board.component';
import { ChessboardComponent } from './components/chessboard/chessboard.component';


@NgModule({
  declarations: [
    AppComponent,
    BoardComponent,
    ChessboardComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
