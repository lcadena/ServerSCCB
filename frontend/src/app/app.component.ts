import { Component, OnInit } from '@angular/core';
import { MainService } from 'src/app/services/main.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import * as bcu from 'bigint-crypto-utils';
import * as bc from 'bigint-conversion';
import * as rsa from 'rsa';
import { from } from 'rxjs';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [MainService]
})

export class AppComponent implements OnInit {
  title = 'frontend';
  valormsg;
  responseg: string;
  responsep: string;
  decryptmessage: string;
  verifiedmessage: string;
  pubKey;
  keys: rsa.keys;
  r: bigint;

  constructor(private mainservice: MainService, private router: Router) {}

  ngOnInit() {
    // Obtener Kpub del servidor
    this.mainservice.getPublicK()
      .subscribe( res => {
        this.pubKey = new rsa.PublicKey(bc.hexToBigint(res['e']), bc.hexToBigint(res['n']));
        console.log('e pubkey onInit: ', this.pubKey.e);
        document.getElementById('public-exponent').innerHTML =  'Exponente público: ' + this.pubKey.e;
        console.log('n pubkey onInit: ', this.pubKey.n);
        console.log('pubkey onInit: ', this.pubKey);
      });
  }

  /**
   * Función obtener mensajes del servidor
   */
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

  /**
   * Función test de comunicación
   */
  getH() {
    this.mainservice.getHello()
      .subscribe(res => {
        console.log(res);
      });
  }

  /**
   * Función obtener la Kpub del servidor
   */
  getPublicKey() {
    // this.keys = rsa.rsaKeyGeneration();
    this.mainservice.getPublicK()
      .subscribe(res => {
        console.log('Res de la PublicKey: ', res);
        this.pubKey = new rsa.PublicKey(bc.hexToBigint(res['e']), bc.hexToBigint(res['n']));
        console.log('Res de la PublicKey2: ', res);
        console.log('pubkey: ', this.pubKey);
      });
  }

  /**
   * Función que envia mesnajes del cliente al servidor
   */
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

  /**
   * Función que envia el mensaje  encriptado
   */
  sendEncryptMessage() {
    // c mensaje encriptado
    const c = this.pubKey.encrypt(bc.textToBigint(this.valormsg));
    console.log('Encrypted mesage : ', c);
    const message = {
      message: bc.bigintToHex(c)
    };
    console.log('Message: ', message);
    this.mainservice.postMessage(message)
      .subscribe(
        res => {
          console.log('mensage en suscribe: ', res);
          this.responsep = res['message'];
          this.decryptmessage = bc.bigintToText(bc.hexToBigint(res['message']));
          console.log('mensage en suscribe2: ', this.responsep);
          console.log('mensage desencriptado: ', this.decryptmessage);
        });
    console.log('Works!');
  }

  /**
   * Firma Digital > para estar seguros que el mensaje lo ha originado el cliente
   */
  signMessage() {
    const m = bc.bigintToHex(bc.textToBigint(this.valormsg));
    console.log('m--: ', m);
    const message = {
      message: m
    };
    this.mainservice.signMsg(message)
      .subscribe( res => {
          let s = bc.hexToBigint(res['message']);
          console.log('message s: ', s);
          let m = this.pubKey.verify(s);
          console.log('message m: ', m);
          this.verifiedmessage = bc.bigintToText(m);
          console.log('message verified: ', this.verifiedmessage);
      });
  }

  /**
   * Firma ciega > hacer firmar a alguien sin su consentimiento
   */
  async blindSignMessage() {
    const m = bc.textToBigint(this.valormsg);
    console.log('m en blind: ', m);
    // factor de cegado random r
    this.r = await bcu.prime(bcu.bitLength(this.pubKey.n));
    console.log('r en blind: ', this.r);
    // b mensaje cegado
    const b = bc.bigintToHex((m * this.pubKey.encrypt(this.r)) % this.pubKey.n);
    console.log('b en blind: ', b);
    const message = {
      message: b
    };
    this.mainservice.signMsg(message)
      .subscribe( res => {
        // firma ciega
        const bs = bc.hexToBigint(res['message']);
        console.log('Blind signature: ', bs);
        // firma s del mensaje con Kpriv de B
        const s = (bs * bcu.modInv(this.r, this.pubKey.n)) % this.pubKey.n;
        console.log('Signature: ', s);
        // Unblind
        const mI = this.pubKey.verify(s);
        console.log('Unblind: ', mI);
        const mII = bc.bigintToText(mI);
        console.log('mII en blind: ', mII);
        document.getElementById('bsign-verified').innerHTML =  'El mensaje que se ha verificado es: ' + bc.bigintToText(mI) as string;
      });
  }
}
