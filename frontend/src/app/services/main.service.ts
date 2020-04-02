import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class MainService {
  readonly URL_API = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  getHello() {
    return this.http.get(this.URL_API);
  }

  getMessage() {
    return this.http.get(this.URL_API +  '/gmessage');
  }

  getPublicK() {
    return this.http.get(this.URL_API + '/pubkey');
  }

  postMessage(message: object) {
    console.log('Envio: ', message);
    return this.http.post(this.URL_API + '/pmessage' , message);
  }

  signMsg(message: object) {
    return this.http.post(this.URL_API + '/signmsg', message);
  }
}
