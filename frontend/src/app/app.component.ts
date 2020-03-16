import { Component, OnInit } from '@angular/core';
import { MainService } from 'src/app/services/main.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  title = 'frontend';
  valormsg: Object;

  constructor(private mainservice: MainService) {}
  
  ngOnInit() {}

  getMessage(){
    this.mainservice.getMessage(this.valormsg).subscribe(res => {
      console.log("el mensage del cliente es: ", this.valormsg)
    })

  }
  
  sendMessage() {
    let msg = this.valormsg.toString();
    //let msg2 = JSON.parse(msg);
    console.log("Message: ", msg)
    this.mainservice.postMessage(this.valormsg).subscribe(res => {
      console.log('res: ', res)
    })
    console.log("Works!");
  }
}
