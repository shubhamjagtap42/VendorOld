import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './login/login.component';
import { ForgetPasswordComponent } from './forget-password/forget-password.component';
import { PrimengModule } from '../primeng/primeng.module';


@NgModule({
  declarations: [
    LoginComponent,
    ForgetPasswordComponent,
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    PrimengModule
  ]
})
export class AuthModule { }
