import { Component, OnInit } from '@angular/core';
import { MainService } from 'src/app/services/main.service';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [MainService]
})

export class AppComponent implements OnInit {
  title = 'frontend';
  valormsg;

  constructor(private mainservice: MainService) {}

  ngOnInit() {}

  get() {
    const mget = this.valormsg;
    console.log('Message del get: ', mget);
    this.mainservice.getMessage(mget)
    .subscribe(res => {
      console.log('res: ', res);
      //this.mainservice.messages = res;
      console.log('el mensage del cliente es: ', res);
    });
  }

  getH() {
    this.mainservice.getHello()
    .subscribe(res => {
      console.log(res);
    });
  }

  sendMessage() {
    const mxxxx = this.valormsg;
    console.log('Message: ', mxxxx);
    this.mainservice.postMessage(mxxxx).subscribe(res => {
      console.log('res: ', res);
    });
    console.log('Works!');
  }
}
