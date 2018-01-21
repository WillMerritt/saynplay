import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { ChessboardComponent } from './components/chessboard/chessboard.component';
import { SocketsComponent } from './components/sockets/sockets.component';
import {IoService} from './services/io.service';
import {DataService} from './services/data.service';
import {UtilsService} from './services/utils.service';
import {HttpClientModule} from '@angular/common/http';
import { ModalModule } from 'ngx-bootstrap';
import {ChessService} from './services/chess.service';
import { TruncateModule } from 'ng2-truncate';
import { AboutComponent } from './components/about/about.component';


@NgModule({
  declarations: [
    AppComponent,
    ChessboardComponent,
    SocketsComponent,
    AboutComponent,

  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ModalModule.forRoot(),
    TruncateModule
  ],
  providers: [
    IoService,
    DataService,
    UtilsService,
    ChessService

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
