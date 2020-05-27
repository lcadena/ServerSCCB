import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NonrepudationComponent } from './components/nonrepudation/nonrepudation.component';
import { HomomorphismComponent } from './components/homomorphism/homomorphism.component';
import { EncriptationComponent } from './components/encriptation/encriptation.component';


const routes: Routes = [
  { path: 'encriptation', component: EncriptationComponent},
  { path: 'nonrepudation', component: NonrepudationComponent},
  { path: 'homomorphism', component: HomomorphismComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
