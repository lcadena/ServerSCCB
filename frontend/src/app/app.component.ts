import { Component, OnInit } from '@angular/core';
import { MainService } from 'src/app/services/main.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import * as bcu from 'bigint-crypto-utils';
import * as bc from 'bigint-conversion';
import * as rsa from 'rsa';
import { from } from 'rxjs';
import { Key } from 'protractor';
import * as sha from 'object-sha';
import * as paillierBigint from 'paillier-bigint';





@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [MainService]
})

export class AppComponent implements OnInit {
  // title = 'frontend';
  // valormsg;
  // responseg: string;
  // responsep: string;
  // decryptmessage: string;
  // verifiedmessage: string;
  // pubKey; // clave publica de B
  // pubKeyTTP; // clave publica de TTP
  // keys: rsa.keys;
  // r: bigint;
  // keyAES;
  // exportKey; // clave de aes para exportar
  // ivAES;
  // c;
  // Pr;
  // Pkp;

  constructor(private mainservice: MainService, private router: Router) {}

  async ngOnInit() {
    // // Obtener Kpub de B
    // this.getPublicKeyB();
    // // Obtener Kpub de TTP
    // this.getPublicKeyTTP();
    // // Generar claves de A
    // this.keys = rsa.rsaKeyGeneration();
    // console.log('Claves de A onInit: ', this.keys);
    // // Generar clave criptográfica AES-CBC
    // this.keyAES = await this.generatekeyAES();
    // console.log('Clave de AES onInit: ', this.keyAES);
    // this.exportKey = await this.exportKeyAES();
    // console.log('Clave de AES a exportar onInit: ', this.exportKey);
    // // const timestamp = Date.now();
    // // console.log('Timestamp: ', timestamp);
  }

  // /**
  //  * Función obtener mensajes del servidor
  //  */
  // get() {
  //   this.mainservice.getMessage()
  //   .subscribe(
  //     res => {
  //       console.log('res: ', res);
  //       this.responseg = res['message'];
  //       console.log('res2: ', this.responseg);
  //     }
  //   );
  // }

  // /**
  //  * Función test de comunicación
  //  */
  // getH() {
  //   this.mainservice.getHello()
  //     .subscribe(res => {
  //       console.log(res);
  //     });
  // }

  // /**
  //  * Función obtener clave publica de B
  //  */
  // async getPublicKeyB() {
  //   this.mainservice.getPublicK()
  //     .subscribe( res => {
  //       // pubKey clave publica de B
  //       this.pubKey = new rsa.PublicKey(bc.hexToBigint(res['e']), bc.hexToBigint(res['n']));
  //       console.log('e pubkey on getPublicKeyB: ', this.pubKey.e);
  //       document.getElementById('public-exponent').innerHTML =  'Exponente público: ' + this.pubKey.e;
  //       console.log('n pubkey on getPublicKeyB: ', this.pubKey.n);
  //       console.log('pubkey on getPublicKeyB: ', this.pubKey);
  //   });
  // }

  // /**
  //  * Función obtener clave publica de TTP
  //  */
  // async getPublicKeyTTP() {
  //   this.mainservice.getPubliKTTP()
  //     .subscribe(res => {
  //       // pubKeyTTP clave publica de TTP
  //       this.pubKeyTTP = new rsa.PublicKey(bc.hexToBigint(res['e']), bc.hexToBigint(res['n']))
  //       console.log('e pubkeyTTP on getPublicKeyTTP: ', this.pubKeyTTP.e);
  //       document.getElementById('public-exponent-ttp').innerHTML =  'Exponente público: ' + this.pubKeyTTP.e;
  //       console.log('n pubkeyTTP on getPublicKeyTTP: ', this.pubKeyTTP.n);
  //       console.log('pubkeyTTP on getPublicKeyTTP: ', this.pubKeyTTP);
  //     });
  // }


  // /**
  //  * Función que envia mesnajes del cliente al servidor
  //  */
  // sendMessage() {
  //   const message = {
  //     message: this.valormsg
  //   };
  //   console.log('Message: ', message);
  //   this.mainservice.postMessage(message)
  //     .subscribe(
  //       res => {
  //         console.log('mensage en suscribe: ', res);
  //         this.responsep = res['message'];
  //         console.log('mensage en suscribe2: ', this.responsep);
  //       },
  //       err => {
  //         console.log(err);
  //       });
  //   console.log('Works!');
  // }

  // /**
  //  * Función que envia el mensaje  encriptado
  //  */
  // sendEncryptMessage() {
  //   // c mensaje encriptado conclave publica B
  //   const c = this.pubKey.encrypt(bc.textToBigint(this.valormsg));
  //   console.log('Encrypted mesage : ', c);
  //   const message = {
  //     message: bc.bigintToHex(c)
  //   };
  //   console.log('Message: ', message);
  //   this.mainservice.postMessage(message)
  //     .subscribe(
  //       res => {
  //         console.log('mensage en suscribe: ', res);
  //         this.responsep = res['message'];
  //         this.decryptmessage = bc.bigintToText(bc.hexToBigint(res['message']));
  //         console.log('mensage en responsep: ', this.responsep);
  //         console.log('mensage desencriptado: ', this.decryptmessage);
  //       });
  //   console.log('Works!');
  // }

  // /**
  //  * Firma Digital > para estar seguros que el mensaje lo ha originado el cliente
  //  */
  // signMessage() {
  //   const m = bc.bigintToHex(bc.textToBigint(this.valormsg));
  //   console.log('m--: ', m);
  //   const message = { message: m };
  //   this.mainservice.signMsg(message)
  //     .subscribe( res => {
  //         let s = bc.hexToBigint(res['message']);
  //         console.log('message s: ', s);
  //         // verificamos el mensaje
  //         let m = this.pubKey.verify(s);
  //         console.log('message m: ', m);
  //         this.verifiedmessage = bc.bigintToText(m);
  //         console.log('message verified: ', this.verifiedmessage);
  //     });
  // }

  // /**
  //  * Firma ciega > hacer firmar a alguien sin su consentimiento
  //  */
  // async blindSignMessage() {
  //   const m = bc.textToBigint(this.valormsg);
  //   console.log('m en blind: ', m);
  //   // factor de cegado random r
  //   this.r = await bcu.prime(bcu.bitLength(this.pubKey.n));
  //   console.log('r en blind: ', this.r);
  //   // b mensaje cegado
  //   const b = bc.bigintToHex((m * this.pubKey.encrypt(this.r)) % this.pubKey.n);
  //   console.log('b en blind: ', b);
  //   // construyo el mensaje con b cegado
  //   const message = { message: b };
  //   this.mainservice.signMsg(message)
  //     .subscribe( res => {
  //       // firma ciega
  //       const bs = bc.hexToBigint(res['message']);
  //       console.log('Blind signature: ', bs);
  //       // firma s del mensaje con Kpub de B
  //       const s = (bs * bcu.modInv(this.r, this.pubKey.n)) % this.pubKey.n;
  //       console.log('Signature: ', s);
  //       // Unblind
  //       const mI = this.pubKey.verify(s);
  //       console.log('Unblind: ', mI);
  //       const mII = bc.bigintToText(mI);
  //       console.log('mII en blind: ', mII);
  //       document.getElementById('bsign-verified').innerHTML =  'El mensaje que se ha verificado es: ' + bc.bigintToText(mI) as string;
  //     });
  // }

  // /**
  //  * No Repudio - AES CBC para encriptar/desencriptar + iv
  //  */
  // async postNonRepudiation() {
  //   // mensaje
  //   let msg = this.valormsg;
  //   // encriptar con AES-CBC
  //   this.c = this.encrypt(msg)
  //   console.log('Mensaje encriptado aes: ', this.encrypt(msg))
  //   let msgB = bc.textToBigint(msg)
  //   console.log('Mensaje en Bigint: ', msgB)
  //   let msgH = bc.bigintToHex(msgB)
  //   console.log('Mensaje en Hexadecimal: ', msgH)
  //   // Genero el timestamp
  //   const timestamp = Date.now()
  //   // Construimos el body del mensaje 1
  //   const body = {
  //     type: '1',
  //     src: 'A',
  //     dst: 'B',
  //     msg: this.c,
  //     timestamp: timestamp
  //   };
  //   // Generar firma con hash del body
  //   const digest = await sha.digest(body, 'SHA-256');
  //   // Digest en Hexadecimal
  //   const digestH = bc.hexToBigint(digest);
  //   // Firmar con clave privada A
  //   let signature = this.keys.privateKey.sign(digestH);
  //   signature = bc.bigintToHex(signature);
  //   // Construimos mensaje 1
  //   const message = {
  //     body: body,
  //     signature: signature,
  //     publicKey: {
  //       e: bc.bigintToHex(this.keys.publicKey.e),
  //       n: bc.bigintToHex(this.keys.publicKey.n)
  //     }
  //   };

  //   this.mainservice.postNonRepudation(message)
  //     .subscribe( async res => {
  //       // proof (firma digital) asociada al tipo de mensaje - verificar proof
  //       const digestProof = bc.bigintToHex(this.pubKey.verify(bc.hexToBigint(res['signature'])))
  //       const digestBody = sha.digest(res['body'])
  //       // generar timestamp TTP
  //       const timestampTTP = Date.now()
  //       if((res['body']['type'] == 2) && (digestProof === digestBody)) {
  //         // Proof reception
  //         this.Pr = res['signature']
  //         // Cosntruimos body del mensaje 3
  //         const body = {
  //           type: '3',
  //           src: 'A',
  //           dst: 'B',
  //           ttp: 'TTP',
  //           k: this.exportKey,
  //           iv: bc.bufToHex(this.ivAES),
  //           timestamp: timestampTTP
  //         };
  //         // Firma
  //         const digestTTP = await sha.digest(body, 'SHA-256')
  //         const digestHTTP = bc.hexToBigint(digestTTP)
  //         let signatureTTP = this.keys.privateKey.sign(digestHTTP)
  //         signatureTTP = bc.bigintToHex(signatureTTP)
  //         // Construimos mensaje que se envia a la TTP
  //         const message = {
  //           body: body,
  //           signature: signatureTTP,
  //           publicKey: {
  //             e: bc.bigintToHex(this.keys.publicKey.e),
  //             n: bc.bigintToHex(this.keys.publicKey.n)
  //           }
  //         };
  //         //TODO funcion enviar el mensaje a la ttp tanto back como front
  //         this.mainservice.postK(message)
  //           .subscribe( async resTTP => {
  //             // Verificar las pruebas recepciones
  //             let digestProof2 = bc.bigintToHex(this.pubKeyTTP.verify(bc.hexToBigint(resTTP['signature'])))
  //             let digestBody2 = sha.digest(resTTP['body'])
  //             // Verificar timestamp
  //             if ((resTTP['body']['type']) && (digestBody2 === digestProof2)) {
  //               console.log('respuesta de la ttp: ', resTTP['body']['type'])
  //               // Proof of publication of k
  //               this.Pkp = resTTP['signature']
  //               console.log('Proof of publication k: ', this.Pkp)
  //             }
  //         })
  //       } else { console.log('Error en el reception mensaje 3')}

  //     });

  // }

  // /* Funciones AES CBC */
  // generatekeyAES() {
  // const key = self.crypto.subtle.generateKey(
  //     {
  //       name: 'AES-CBC',
  //       length: 256
  //     },
  //     true,
  //     ['encrypt', 'decrypt']
  //   );
  //   return key;
  // }

  // generateIvAES() {
  //   this.ivAES = self.crypto.getRandomValues(new Uint8Array(16));
  //   return this.ivAES;
  // }

  // encrypt(message) {
  //   console.log('Mensage que llega a encrypt: ', message)
  //   const result = window.crypto.subtle.encrypt(
  //     {
  //       name: 'AES-CBC',
  //       iv: this.ivAES
  //     },
  //     this.keyAES,
  //     bc.textToBuf(message)
  //   );
  //   console.log('Resultado encriptar AES-CBC: ' + result)
  //   const enc = bc.bufToHex(result)
  //   console.log('Resultado buffer a hex: ' + enc)
  //   return enc;
  // }

  // decrypt(message) {
  //   console.log('Mensage que llega a decrypt: ', message)
  //   const result = self.crypto.subtle.decrypt(
  //     {
  //       name: 'AES-CBC',
  //       iv: this.ivAES
  //     },
  //     this.keyAES,
  //     bc.textToBuf(message)
  //   );
  //   console.log('Resultado desencriptar AES-CBC: ' + result)
  //   const dec = bc.bufToHex(result)
  //   console.log('Resultado buffer a hex: ' + dec)
  //   return dec;
  // }

  // exportKeyAES() {
  //   const result = self.crypto.subtle.exportKey(
  //     "jwk",
  //     this.keyAES
  //   );
  //   console.log('Clave AES-CBCa exportar: ' + result);
  //   return result;
  // }

}

