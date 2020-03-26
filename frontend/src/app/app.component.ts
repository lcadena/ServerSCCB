import { Component, OnInit } from '@angular/core';
import { MainService } from 'src/app/services/main.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import * as bcu from 'bigint-crypto-utils';
import * as bc from 'bigint-conversion';
import * as rsa from 'rsa';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  title = 'frontend';
  valormsg;
  responseg: string;
  responsep: string;
  responsegpub: string;//tiene que ser tipo pubkey

  constructor(private mainservice: MainService, private router: Router) {}

  ngOnInit() {}

  get() {
    this.mainservice.getMessage()
    .subscribe(
      res => {
        console.log('res: ', res);
        this.responseg = res['message'];
        console.log('res2: ', this.responseg);
      }
    );
  }

  getPublicKey() {
    this.mainservice.getPublicK()
      .subscribe(res => {
        console.log('Res de la PublicKey: ', res);
        this.responsegpub = bc.hexToBigint(res['e']).toString();
        console.log('Res de la PublicKey2: ', res);
        //en la res si que llega la clave publica pero falta parsearla como clave publica
      });
  }

  getH() {
    this.mainservice.getHello()
      .subscribe(res => {
        console.log(res);
      });
  }

  sendMessage() {
    const message = {
      message: this.valormsg
    };
    console.log('Message: ', message);
    this.mainservice.postMessage(message)
      .subscribe(
        res => {
          console.log('mensage en suscribe: ', res);
          this.responsep = res['message'];
          console.log('mensage en suscribe2: ', this.responsep);
        },
        err => {
          console.log(err);
        });
    console.log('Works!');
  }
}
