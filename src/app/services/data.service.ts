import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class DataService {

  constructor(private http: HttpClient) { }

  apiFetch() {
    this.http.get('/api/json')
      .subscribe(
        data => console.log(data),
        err => console.log(err)
      );
  }
}
