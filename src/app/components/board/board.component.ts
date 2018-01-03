import { Component, OnInit } from '@angular/core';
import {UtilsService} from '../../services/utils.service';


@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit {
  rows = new Array(8);

  board = this.utils.createArray([8, 8]);
  constructor(private utils: UtilsService) { }

  ngOnInit() {

  }
}
