import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { ChessboardComponent } from './components/chessboard/chessboard.component';
import { SocketsComponent } from './components/sockets/sockets.component';
import {IoService} from './services/io.service';
import {HttpClientModule} from '@angular/common/http';
import {ModalModule, TabsModule} from 'ngx-bootstrap';
import {ChessService} from './services/chess.service';
import { TruncateModule } from 'ng2-truncate';
import { AboutComponent } from './components/about/about.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { Ng2DeviceDetectorModule } from 'ng2-device-detector';
// import { MatTabsModule} from '@angular/material';


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
    TruncateModule,
    BrowserAnimationsModule,
    // MatTabsModule
    TabsModule.forRoot(),
    Ng2DeviceDetectorModule.forRoot()

  ],
  providers: [
    IoService,
    ChessService

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
