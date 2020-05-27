import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NonrepudationComponent } from './components/nonrepudation/nonrepudation.component';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HomomorphismComponent } from './components/homomorphism/homomorphism.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EncriptationComponent } from './components/encriptation/encriptation.component';


@NgModule({
  declarations: [
    AppComponent,
    NonrepudationComponent,
    HomomorphismComponent,
    EncriptationComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    CommonModule,
    RouterModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
