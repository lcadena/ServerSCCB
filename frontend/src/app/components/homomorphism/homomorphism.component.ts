import { Component, OnInit } from '@angular/core';
import * as paillierBigint from 'paillier-bigint';
import * as bc from 'bigint-conversion';
import { MainService } from 'src/app/services/main.service';
import { Router } from '@angular/router';
import { PublicKey } from 'paillier-bigint';


@Component({
  selector: 'app-homomorphism',
  templateUrl: './homomorphism.component.html',
  styleUrls: ['./homomorphism.component.css']
})
export class HomomorphismComponent implements OnInit {
  n;
  g;
  pubKeyPallier;
  privKeyPallier;
  keysPaillier;
  valornum1;
  valornum2;
  sumH;
  mulH;

  constructor(private mainservice: MainService, private router: Router) { }

  async ngOnInit() {
    // Obtener claves paillier
    this.getPubKeyBPaillier();
  }

  // Obter public key de B con paillier
  async getPubKeyBPaillier() {
    this.mainservice.getPubKPallier()
      .subscribe(res => {
        this.pubKeyPallier = new PublicKey(bc.hexToBigint(res['n']), bc.hexToBigint(res['g']))
        console.log('pubKPallier front: ', this.pubKeyPallier)
      });
  }

  async postNumbers() {
    const m1 = this.valornum1// transformar a BigInt
    console.log('num1: ', m1)
    const m2 = this.valornum2
    console.log('num2: ', m2)

    // encryption/decryption
    const c1 = this.pubKeyPallier.encrypt(BigInt(m1))
    console.log('c1: ', c1)
    const c2 = this.pubKeyPallier.encrypt(BigInt(m2))
    console.log('c2: ', c2)
    const encryptedSum = this.pubKeyPallier.addition(c1, c2)
    console.log('encrypted sum: ', encryptedSum)
    const message = {
      message: bc.bigintToHex(encryptedSum)
    }
    console.log('message: ', message)
    this.mainservice.sumHomomorphic(message)
      .subscribe(async (res) => {
        console.log('res: ', res);
        this.sumH = bc.hexToBigint(res['message'])
        console.log('sumH: ', this.sumH);
      })
  }

  async postNumMultiply() {
    const m1 = this.valornum1// transformar a BigInt
    console.log('num1: ', m1)
    const m2 = this.valornum2
    console.log('num2: ', m2)

    const c1 = this.pubKeyPallier.encrypt(BigInt(m1))
    console.log('c1: ', c1)
    const k = getRandomNumber(1, 10000)
    console.log('k: ', k)
    console.log('bigint k: ', BigInt(k))

    const encryptedMul = this.pubKeyPallier.multiply(c1, BigInt(k))
    console.log('encrypted mul: ', encryptedMul)
    const message = {
      message: bc.bigintToHex(encryptedMul)
    }
    this.mainservice.multiplyHomomorphic(message)
      .subscribe(res => {
        console.log('res: ', res);
        this.mulH = bc.hexToBigint(res['message'])
        console.log('mulH: ', this.mulH);
      })
  }
}

function getRandomNumber(low, high) {
  let res = Math.floor(Math.random() * (high - low + 1)) + low;
  return res
}
