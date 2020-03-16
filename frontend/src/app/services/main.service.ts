import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface Message {
  msg: string;
}

@Injectable({
  providedIn: 'root'
})

export class MainService {
  messages: Message [];
  readonly URL_API = 'http://localhost:3000/message'

  constructor(private http: HttpClient) { }

  getHello() {
    return this.http.get('http://localhost:3000/');
  }

  getMessage(message) {
    console.log('Recibo: ', message);
    return this.http.get(this.URL_API +  `/${message}`, message);
  }

  postMessage(message: Message) {
    console.log('Envio: ', message);
    return this.http.post(this.URL_API + `/${message}` , message);
  }
}
