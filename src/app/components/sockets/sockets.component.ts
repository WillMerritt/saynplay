import { Component, OnInit } from '@angular/core';
import {IoService} from '../../services/io.service';
import {DataService} from '../../services/data.service';

@Component({
  selector: 'app-sockets',
  templateUrl: './sockets.component.html',
  styleUrls: ['./sockets.component.css']
})
export class SocketsComponent implements OnInit {


  constructor(public socketService: IoService,
              public dataService: DataService) { }

  ngOnInit() {
  }

  onClick() {

  }

}
