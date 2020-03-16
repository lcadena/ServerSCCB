import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MainService {

  constructor(private http: HttpClient) { }

  getMessage(msn: Object) {
    console.log("recibo", msn)
  return this.http.get('http://localhost:3000/message'+  `/${msn}` , msn);
  } 
  postMessage(msn: Object){
    console.log("envio", msn)
    return this.http.post('http://localhost:3000/message' + `/${msn}` , msn);
  }
}
