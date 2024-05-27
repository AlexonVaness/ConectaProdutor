import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginSemCadastroPage } from './login-sem-cadastro.page';

const routes: Routes = [
  {
    path: '',
    component: LoginSemCadastroPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoginSemCadastroPageRoutingModule {}
