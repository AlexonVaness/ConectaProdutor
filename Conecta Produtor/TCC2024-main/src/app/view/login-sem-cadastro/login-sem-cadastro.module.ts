import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // Importe ReactiveFormsModule
import { IonicModule } from '@ionic/angular';
import { LoginSemCadastroPageRoutingModule } from './login-sem-cadastro-routing.module';
import { LoginSemCadastroPage } from './login-sem-cadastro.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule, // Adicione ReactiveFormsModule aqui
    LoginSemCadastroPageRoutingModule
  ],
  declarations: [LoginSemCadastroPage]
})
export class LoginSemCadastroPageModule {}
