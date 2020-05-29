import { Component, OnInit } from '@angular/core';
import { MainService } from 'src/app/services/main.service';
import { Router } from '@angular/router';
import * as bcu from 'bigint-crypto-utils';
import * as bc from 'bigint-conversion';
import * as rsa from 'rsa';
import * as sha from 'object-sha';
import * as paillierBigint from 'paillier-bigint';

@Component({
  selector: 'app-encriptation',
  templateUrl: './encriptation.component.html',
  styleUrls: ['./encriptation.component.css'],
  providers: [MainService]
})
export class EncriptationComponent implements OnInit {
  title = 'encriptation';
  valormessage;
  valormessagenr;// non-repudation message
  valormessageshamir; // shamir's message
  responseg: string;
  responsep: string;
  responses: string; // response from server shamir decryption message
  responsegetSlices: string;
  decryptmessage: string;
  decryptmessagenr: string;
  decryptmessageS: string;
  verifiedmessage: string;
  publicexponentB: string;
  publicexponentTTP: string;
  blindverifiedmsg;
  msgdecryptB;
  pubKeyB; // clave publica de B
  pubKeyTTP; // clave publica de TTP
  keys: rsa.keys;
  r: bigint;
  keyAES;
  exportKey; // clave de aes para exportar
  ivAES;
  c;
  Pr;
  Pkp;
  po;
  pkp;
  kFromTTP;

  constructor(private mainservice: MainService, private router: Router) { }

  async ngOnInit() {
    // Obtener Kpub de B
    this.getPublicKeyB();
    // Obtener Kpub de TTP
    this.getPublicKeyTTP();
    // Generar claves de A
    this.keys = rsa.rsaKeyGeneration();
    console.log('Claves de A onInit: ', this.keys);
    // Generar clave criptográfica AES-CBC
    this.keyAES = await this.generatekeyAES();
    console.log('Clave de AES onInit: ', this.keyAES);
    this.exportKey = await this.exportKeyAES();
    console.log('Clave de AES a exportar onInit: ', this.exportKey);
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
   * Función obtener clave publica de B
   */
  async getPublicKeyB() {
    this.mainservice.getPublicK()
      .subscribe( res => {
        // pubKey clave publica de B
        this.pubKeyB = new rsa.PublicKey(bc.hexToBigint(res['e']), bc.hexToBigint(res['n']));
        console.log('e pubkey on getPublicKeyB: ', this.pubKeyB.e);
        //document.getElementById('public-exponent').innerHTML =  'Exponente público: ' + this.pubKey.e;
        console.log('n pubkey on getPublicKeyB: ', this.pubKeyB.n);
        this.publicexponentB = this.pubKeyB.e;
        console.log('pubkey on getPublicKeyB: ', this.pubKeyB);
    });
  }

  /**
   * Función obtener clave publica de TTP
   */
  async getPublicKeyTTP() {
    this.mainservice.getPubliKTTP()
      .subscribe(res => {
        // pubKeyTTP clave publica de TTP
        this.pubKeyTTP = new rsa.PublicKey(bc.hexToBigint(res['e']), bc.hexToBigint(res['n']))
        console.log('e pubkeyTTP on getPublicKeyTTP: ', this.pubKeyTTP.e);
        //document.getElementById('public-exponent-ttp').innerHTML =  'Exponente público: ' + this.pubKeyTTP.e;
        console.log('n pubkeyTTP on getPublicKeyTTP: ', this.pubKeyTTP.n);
        this.publicexponentTTP = this.pubKeyTTP.n
        console.log('pubkeyTTP on getPublicKeyTTP: ', this.pubKeyTTP);
      });
  }


  /**
   * Función que envia mesnajes del cliente al servidor
   */
  sendMessage() {
    const message = {
      message: this.valormessage
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
    // c mensaje encriptado conclave publica B
    const c = this.pubKeyB.encrypt(bc.textToBigint(this.valormessage));
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
          console.log('mensage en responsep: ', this.responsep);
          console.log('mensage desencriptado: ', this.decryptmessage);
        });
  }

  /**
   * Firma Digital > para estar seguros que el mensaje lo ha originado el cliente
   */
  signMessage() {
    const m = bc.bigintToHex(bc.textToBigint(this.valormessage));
    console.log('m--: ', m);
    const message = { message: m };
    this.mainservice.signMsg(message)
      .subscribe( res => {
          let s = bc.hexToBigint(res['message']);
          console.log('message s: ', s);
          // verificamos el mensaje
          let m = this.pubKeyB.verify(s);
          console.log('message m: ', m);
          this.verifiedmessage = bc.bigintToText(m);
          console.log('message verified: ', this.verifiedmessage);
      });
  }

  /**
   * Firma ciega > hacer firmar a alguien sin su consentimiento
   */
  async blindSignMessage() {
    const m = bc.textToBigint(this.valormessage);
    console.log('m en blind: ', m);
    // factor de cegado random r
    this.r = await bcu.prime(bcu.bitLength(this.pubKeyB.n));
    console.log('r en blind: ', this.r);
    // b mensaje cegado
    const b = bc.bigintToHex((m * this.pubKeyB.encrypt(this.r)) % this.pubKeyB.n);
    console.log('b en blind: ', b);
    // construyo el mensaje con b cegado
    const message = { message: b };
    this.mainservice.signMsg(message)
      .subscribe( res => {
        // firma ciega
        const bs = bc.hexToBigint(res['message']);
        console.log('Blind signature: ', bs);
        // firma s del mensaje con Kpub de B
        const s = (bs * bcu.modInv(this.r, this.pubKeyB.n)) % this.pubKeyB.n;
        console.log('Signature: ', s);
        // Unblind
        const mI = this.pubKeyB.verify(s);
        console.log('Unblind: ', mI);
        const mII = bc.bigintToText(mI);
        this.blindverifiedmsg = mII;
        console.log('mII en blind: ', mII);
        //document.getElementById('bsign-verified').innerHTML =  'El mensaje que se ha verificado es: ' + bc.bigintToText(mI) as string;
        console.log('mI: ', mI)
        console.log('mII', bc.bigintToText(mI) as string)
      });
  }

  /**
   * No Repudio - AES CBC para encriptar/desencriptar + iv
   */
  async postNonRepudiation() {
    // mensaje que será enviado a B
    let m = this.valormessagenr;
    // mesaje encriptado con AES-CBC
    this.c = await this.encrypt(m)
    console.log('Mensaje encriptado aes-cbc: ', this.c)
    let mB = bc.textToBigint(m)
    console.log('Mensaje en Bigint: ', mB)
    let mH = bc.bigintToHex(mB)
    console.log('Mensaje en Hexadecimal: ', mH)
    // // Genero el timestamp
    // const tsA = Date.now()
    // Construimos el body del mensaje 1
    const body = {
      type: '1',
      src: 'A',
      dst: 'B',
      msg: this.c,
      timestamp: Date.now()
    };
    // Generar firma con hash del body
    console.log(sha.hashable(body))
    const digest = await sha.digest(body, 'SHA-256');
    // Digest en Hexadecimal
    const digestH = bc.hexToBigint(digest);
    // Firmar con clave privada A
    let signature = this.keys.privateKey.sign(digestH);
    console.log('signature en A: ', signature)
    // proof of origin - sign(digestH(body type1))
    signature = bc.bigintToHex(signature);
    console.log('signature biginttoHex: ', signature)
    // Construimos mensaje 1
    const message = {
      body: body,
      signature: signature,
      publicKey: {
        e: bc.bigintToHex(this.keys.publicKey.e),
        n: bc.bigintToHex(this.keys.publicKey.n)
      }
    };

    this.mainservice.postNonRepudation(message)
      .subscribe( async res => {
        console.log('respuesta del server mensaje 2----')
        console.log(res)
        // verificamos el timestamp
        const tsnow = Date.now()
        console.log('tsnow: ', tsnow)
        const tsresponse = res['body']['timestamp']
        console.log('tsresponse: ', tsresponse)
        // proof (firma digital) asociada al tipo de mensaje - verificar proof
        const digestProof = bc.bigintToHex(await this.pubKeyB.verify(bc.hexToBigint(res['signature'])))
        console.log('digestProof en A: ', digestProof)
        const digestBody = await sha.digest(res['body'])
        console.log('digest body en A: ', digestBody)
        //(res['body']['type'] == 2) && )
        if((digestProof === digestBody) && (tsresponse > (tsnow - 180000) && tsresponse < (tsnow + 180000))) {
          // Proof reception
          this.Pr = res['signature']
          //const keyII = await this.exportKeyAES()
          //console.log('keyII: ', keyII)
          console.log('exportkey: ', this.exportKey)
          // Construimos body del mensaje 3
          const body = {
            type: '3',
            src: 'A',
            dst: 'TTP',
            msg: bc.bufToHex(this.exportKey),
            iv: bc.bufToHex(this.ivAES),
            timestamp: Date.now()
          };
          // Firma
          console.log('---------------------')
          console.log(body)
          console.log('---------------------')
          const digestTTP = await sha.digest(body, 'SHA-256')
          console.log('digestTTP: ', digestTTP)
          const digestHTTP = bc.hexToBigint(digestTTP)
          console.log('digestHTTP: ', digestHTTP)
          // pko proof of origin of k
          let signatureTTP = await this.keys.privateKey.sign(digestHTTP)
          signatureTTP = bc.bigintToHex(signatureTTP)
          // Construimos mensaje que se envia a la TTP
          const messageTTP = {
            body: body,
            signature: signatureTTP,
            publicKey: {
              e: bc.bigintToHex(this.keys.publicKey.e),
              n: bc.bigintToHex(this.keys.publicKey.n)
            }
          };
          this.mainservice.postK(messageTTP)
            .subscribe( async res => {
              // Verificar las pruebas recepciones
              console.log('response de la ttp: ', res)
              const digestProof2 = bc.bigintToHex(this.pubKeyTTP.verify(bc.hexToBigint(res['signature'])))
              console.log('digestProof2: ', digestProof2)
              const digestBody2 = await sha.digest(res['body']);
              console.log('---------------------')
              console.log(sha.hashable(res['body']))
              console.log('---------------------')
              console.log('digestBody2: ', digestBody2)
              // Verificar timestamp - (res['body']['type'] == 4) &&
              if ((digestBody2 === digestProof2)) {
                console.log('respuesta de la ttp: ', res['body']['type'])
                // Proof of publication of k
                this.Pkp = res['signature']
                console.log('Proof of publication k: ', this.Pkp)
                console.log('Proof of reception: ', this.Pr)
              }
          })
        } else { console.log('Error en el reception mensaje 3')}

      });

  }

  async downloadKfromTTP() {
    this.mainservice.getKfromTTP()
      .subscribe(res => {
        console.log('response en getK: ', res)
        //this.kFromTTP = res['k']
      })
  }

  async decryptMessage() {
    this.mainservice.getKfromTTP()
      .subscribe(res => {
        console.log('response en decryptmessage: ', res)
        //this.kFromTTP = res['k']
        console.log('res body:', res['body'])
        const message = {
          body: res['body'],
          signature: res['signature'],
          pubkey: res['publicKey']
        }
        this.mainservice.decryptMessageFromServer(message)
          .subscribe(res => {
            console.log('response en el decrypt message: ', res)
            this.decryptmessagenr = res['message']
            this.po = res['po']
            this.pkp = res['pkp']
          })
      })
  }

  /* Funciones AES CBC */
  generatekeyAES() {
  const key = crypto.subtle.generateKey(
      {
        name: 'AES-CBC',
        length: 256
      },
      true,
      ['encrypt', 'decrypt']
    );
    console.log('key AES: ', key)
    console.log('key AES: ', this.keyAES)
    return key;
  }

  // generateIvAES() {
  //   this.ivAES = window.crypto.getRandomValues(new Uint8Array(16));
  //   console.log('ivAES: ', this.ivAES)
  //   return this.ivAES;
  // }

  async encrypt(message) {
    console.log('Mensage que llega a encrypt: ', message)
    this.ivAES = crypto.getRandomValues(new Uint8Array(16));
    ///const result = await window.crypto.subtle.encrypt
    const result = await crypto.subtle.encrypt(
      {
        name: 'AES-CBC',
        iv: this.ivAES
      },
      this.keyAES,
      bc.textToBuf(message)
    );
    console.log('Resultado encriptar AES-CBC: ' + result)
    const enc = bc.bufToHex(result)
    console.log('Resultado buffer a hex: ' + enc)
    return enc;
  }

  // async decrypt(k, iv, message) {
  //   console.log('Mensage que llega a decrypt: ', message)
  //   const result = await crypto.subtle.decrypt(
  //     {
  //       name: 'AES-CBC',
  //       iv: iv
  //     },
  //     this.keyAES,
  //     bc.textToBuf(message)
  //   );
  //   console.log('Resultado desencriptar AES-CBC: ' + result)
  //   const dec = bc.bufToHex(result)
  //   console.log('Resultado buffer a hex: ' + dec)
  //   return dec;
  // }

  exportKeyAES() {
    const result = self.crypto.subtle.exportKey(
      "raw",
      this.keyAES
    );
    console.log('Clave AES-CBCa exportar: ' + result);
    return result;
  }

  /**
   * Shamir's secret sharing
   */
  slice: string; // part of key
  secret: string; //shamir's sharing key secret
  recovered: string;

  getSlices() {
    this.mainservice.getSlices()
      .subscribe(res => {
        console.log('res-- ', res)
        this.responsegetSlices = res['message']
        //$('alert alert-success').alert();
        setTimeout(function () {
          document.getElementById('bootstrap-alert').style.display = 'none'
        })
        alert(this.responsegetSlices)
      })
  }

  sendEncryptmsgShamir() {
    // m mensaje encriptado conclave publica B
    const mEncrypt = this.pubKeyB.encrypt(bc.textToBigint(this.valormessageshamir));
    console.log('Shamir secret sharing------------------')
    console.log('Encrypted mesage : ', mEncrypt);
    const message = {
      message: bc.bigintToHex(mEncrypt)
    };
    console.log('Message: ', message);
    this.mainservice.sendShamirEncryptMessage(message)
      .subscribe(res => {
          console.log('mensage en suscribe encryptmsgShamir: ', res);
          this.responses = res['message'];
          this.msgdecryptB = bc.hexToBigint(res['message'])
          this.decryptmessageS = bc.bigintToText(bc.hexToBigint(res['message']));
          console.log('mensage en responsep: ', this.responses);
          console.log('mensage desencriptado: ', this.decryptmessageS);
        });
  }
}
