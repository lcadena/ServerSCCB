import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class MainService {
  readonly URL_A = 'http://localhost:3000';
  readonly URL_TTP = 'http://localhost:3002';

  constructor(private http: HttpClient) { }

  getHello() {
    return this.http.get(this.URL_A);
  }

  getMessage() {
    return this.http.get(this.URL_A +  '/gmessage');
  }

  /* RSA endpoints */
  getPublicK() {
    return this.http.get(this.URL_A + '/pubkey');
  }

  postMessage(message: object) {
    console.log('Envio: ', message);
    return this.http.post(this.URL_A + '/pmessage' , message);
  }

  signMsg(message: object) {
    return this.http.post(this.URL_A + '/signmsg', message);
  }

  /* Non-repudation endpoints */
  getPubliKTTP() {
    return this.http.get(this.URL_TTP + '/pubkeyTTP');
  }

  postNonRepudation(message: object) {
    return this.http.post(this.URL_A + '/nonr', message);
  }
}
