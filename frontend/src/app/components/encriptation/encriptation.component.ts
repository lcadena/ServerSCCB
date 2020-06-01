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
  si; // mensaje firmado por el servidor
  sM; // verificación de la firma del servidor
  abs; // mensaje firmado y cegado enviado por el servidor
  bm; // mesaje cegado
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
    // Generar claves de A con modulo rsa
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
        // pubKeyB clave publica de B
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
    console.log('Enviar mensaje encriptado -------------------------------------------')
    // c mensaje encriptado con clave publica B
    const c = this.pubKeyB.encrypt(bc.textToBigint(this.valormessage));
    document.getElementById('enc-message').innerHTML =  'Encrypted message to be sent to the client: ' + c;
    console.log('Mensaje encriptado: ', c);
    const message = {
      message: bc.bigintToHex(c)
    };
    console.log('Mensaje formato JSON: ', message);
    this.mainservice.postMessage(message)
      .subscribe(res => {
          console.log('Mensaje desencriptado en el cliente', {
            msg: bc.hexToBigint(res['message'])
          })
          this.responsep = res['message'];
          this.decryptmessage = bc.bigintToText(bc.hexToBigint(res['message']));
          console.log('Mensaje original desencriptado: ', this.decryptmessage);
          document.getElementById('dec-message').innerHTML =  'Mensaje original desencriptado: ' + this.decryptmessage;
          console.log('-------------------------------------------------------------')
        });
  }

  /**
   * Firma Digital
   * Firma utilizando las claver del servidor (para estar seguros que el mensaje lo ha originado el cliente)
   */
  async signMessage() {
    console.log('Modulo Firma -------------------------------------------')
    const m = bc.bigintToHex(bc.textToBigint(this.valormessage));
    console.log('Mensaje desde el cliente que va a ser firmado: ', m);
    const message = { message: m };
    this.mainservice.signMsg(message)
      .subscribe( res => {
          console.log('Sign message en el cliente', {
            sign: res['message']
          })
          this.si = res['message']
          let s = bc.hexToBigint(res['message']);
          //console.log('message s: ', s);
          // verificamos la firma del servidor en el mensaje
          let m = this.pubKeyB.verify(s);
          this.sM = this.pubKeyB.verify(s);
          console.log('Verificación de la firma: ', m);
          this.verifiedmessage = bc.bigintToText(m);
          console.log('Mensaje original verificado: ', this.verifiedmessage);
          console.log('-------------------------------------------------------------')
      });
  }

  /**
   * Firma ciega
   * Firma ciega utilizando las claver del servidor (hacer firmar a alguien sin su consentimiento)
   */
  async blindSignMessage() {
    console.log('Modulo Firma Ciega -------------------------------------------')
    const m = bc.textToBigint(this.valormessage);
    console.log('Mensaje desde el cliente para firma ciega: ', m);
    // factor de cegado random r
    this.r = await bcu.prime(bcu.bitLength(this.pubKeyB.n));
    console.log('Factor de cegado r en el cliente: ', this.r);
    // b mensaje cegado - Blinding
    const b = bc.bigintToHex((m * this.pubKeyB.encrypt(this.r)) % this.pubKeyB.n);
    this.bm = b
    console.log('Mensaje cegado en el cliente: ', b);
    // construyo el mensaje con b cegado
    const message = {
      message: b
    };
    this.mainservice.signMsg(message)
      .subscribe( res => {
        console.log('Mensaje cegado y firmado en el cliente', {
          sign: res['message']
        })
        // firma ciega
        this.abs = res['message']
        const bs = bc.hexToBigint(res['message']);
        // console.log('Blind signature: ', bs);
        // firma s del mensaje con Kpub de B, multiplicamos por la inversa del factor de cegado r
        const x = bcu.modInv(this.r, this.pubKeyB.n) as bigint
        const s = (bs * x) % this.pubKeyB.n;
        console.log('Mensaje firmado en el cliente: ', s);
        // Unblind
        const mI = this.pubKeyB.verify(s);
        console.log('Unblind en el cliente: ', mI);
        const mII = bc.bigintToText(mI) as string;
        this.blindverifiedmsg = mII;
        console.log('Mensaje original verificado: ', mII);
        document.getElementById('blind-message').innerHTML =  'Mensaje cegado: ' + this.bm;
        document.getElementById('bsign-message').innerHTML =  'Firma ciega del mensaje: ' + this.abs;
        document.getElementById('verify-message').innerHTML =  'Verificación firma: ' + mI;
        document.getElementById('bsign-verified').innerHTML =  'Mensaje original verificado: ' + bc.bigintToText(mI) as string;
        // console.log('mI: ', mI)
        // console.log('mII', bc.bigintToText(mI) as string)
        console.log('-------------------------------------------------------------')
      });
  }

  /**
   * No Repudio - AES CBC para encriptar/desencriptar + iv
   */
  async postNonRepudiation() {
    console.log('Modulo No-Repudio -------------------------------------------')
    // mensaje que será enviado a B
    let m = this.valormessagenr;
    // mesaje encriptado con AES-CBC
    this.c = await this.encrypt(m)
    console.log('Mensaje encriptado AES-CBC en A: ', this.c)
    let mB = bc.textToBigint(m)
    //console.log('Mensaje en Bigint: ', mB)
    let mH = bc.bigintToHex(mB)
    //console.log('Mensaje en Hexadecimal: ', mH)
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
    // console.log(sha.hashable(body))
    const digest = await sha.digest(body, 'SHA-256');
    // Digest en Hexadecimal
    const digestH = bc.hexToBigint(digest);
    // Firmar con clave privada A
    let signature = this.keys.privateKey.sign(digestH);
    // firma del mesnaje con la clave privada del cliente
    console.log('Sign en A: ', signature)
    // proof of origin - sign(digestH(body type1))
    signature = bc.bigintToHex(signature);
    console.log('Proof origen en A: ', signature)
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
        console.log('Respuesta del servidor mensaje type = 2 ----')
        // console.log(res)
        // verificamos el timestamp
        const tsnowA = Date.now()
        console.log('tsnowA: ', tsnowA)
        const tsresponseB = res['body']['timestamp']
        console.log('tsresponseB en A: ', tsresponseB)
        // proof (firma digital) asociada al tipo de mensaje - verificar proof
        const digestProof = bc.bigintToHex(await this.pubKeyB.verify(bc.hexToBigint(res['signature'])))
        // console.log('digestProof en A: ', digestProof)
        const digestBody = await sha.digest(res['body'])
        // console.log('digest body en A: ', digestBody)
        //(res['body']['type'] == 2) && )
        if((digestProof === digestBody) && (tsresponseB > (tsnowA - 180000) && tsresponseB < (tsnowA + 180000))) {
          // Proof reception
          this.Pr = res['signature']
          console.log('Proff de recepción en A: ', {
            pr: this.Pr
          })
          //const keyII = await this.exportKeyAES()
          //console.log('keyII: ', keyII)
          console.log('Key AES-CBD a exportar: ', this.exportKey)
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
          // console.log('---------------------')
          // console.log(body)
          // console.log('---------------------')
          const digestTTP = await sha.digest(body, 'SHA-256')
          // console.log('digestTTP: ', digestTTP)
          const digestHTTP = bc.hexToBigint(digestTTP)
          // console.log('digestHTTP: ', digestHTTP)
          // pko proof of origin of k
          let signatureTTP = await this.keys.privateKey.sign(digestHTTP)
          signatureTTP = bc.bigintToHex(signatureTTP)
          console.log('Proof origen de K en A: ', signatureTTP)
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
              // console.log('---------------------')
              // console.log(sha.hashable(res['body']))
              // console.log('---------------------')
              // console.log('digestBody2: ', digestBody2)
              // Verificar timestamp - (res['body']['type'] == 4) &&
              if ((digestBody2 === digestProof2)) {
                console.log('respuesta de la ttp: ', res['body']['type'])
                // Proof of publication of k
                this.Pkp = res['signature']
                console.log('Proof of publication k: ', this.Pkp)
                console.log('Proof of reception: ', this.Pr)
              }
          })

        } else { console.log('Error en el reception mensaje 3') }
        console.log('---------------------------------------------------------------------------')
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
    console.log('Desencriptar mensaje con No-Repudio -------------------------------------------')
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
        console.log('---------------------------------------------------------------------------')
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
    console.log('Modulo Secreto Compartido Shamir -------------------------------------------')
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
    console.log('---------------------------------------------------------------------------')
  }
}
