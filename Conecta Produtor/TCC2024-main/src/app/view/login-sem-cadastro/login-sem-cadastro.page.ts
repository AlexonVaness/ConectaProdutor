import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthserviceService } from 'src/app/model/service/authservice.service';
import { FirebaseService } from 'src/app/model/service/firebase-service.service'; // Importe o serviço FirebaseService

@Component({
  selector: 'app-login-sem-cadastro',
  templateUrl: './login-sem-cadastro.page.html',
  styleUrls: ['./login-sem-cadastro.page.scss'],
})
export class LoginSemCadastroPage implements OnInit {
  formPerfil: FormGroup = this.formBuilder.group({
    nome: ['', Validators.required],
    idade: ['', Validators.required],
    cidade: ['', Validators.required],
    telefone: ['', Validators.required],
  });

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthserviceService,
    private firebaseService: FirebaseService,
    private router: Router
  ) { }

  ngOnInit() {
    this.firebaseService.checkUserDocumentExistence();
    this.formPerfil = this.formBuilder.group({
      nome: ['', [Validators.required, this.nomeValidator]],
      idade: ['', [Validators.required, Validators.pattern('^[0-9]{1,3}$')]],
      cidade: ['', Validators.required],
      telefone: ['', [Validators.required, Validators.pattern('^\\([0-9]{2}\\)\\s[0-9]{1,10}$')]]
    });
  }

  nomeValidator(control: FormControl) {
    const nome = control.value;
    if (nome.length > 0) {
      const primeiraLetra = nome[0];
      if (primeiraLetra === primeiraLetra.toUpperCase()) {
        return null;
      } else {
        return { nomeInvalido: true };
      }
    } else {
      return { nomeInvalido: true };
    }
  }

  async submitForm() {
    if (this.formPerfil.valid) {
      const perfilData = this.formPerfil.value;
      const user = await this.authService.getCurrentUser();
      if (user) {
        const uid = user.uid;
        perfilData.uid = uid;
        try {
          await this.firebaseService.saveUserData(uid, perfilData);
          console.log('Dados do perfil salvos com sucesso!');
          this.router.navigate(['/tabs/catalog']); // Redirecionar para a página /tabs
        } catch (error) {
          console.error('Erro ao salvar dados do perfil:', error);
        }
      } else {
        console.error('Usuário não autenticado.');
      }
    } else {
      console.error('Formulário inválido. Verifique os campos.');
    }
  }
}