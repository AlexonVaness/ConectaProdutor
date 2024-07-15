import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthserviceService } from 'src/app/model/service/authservice.service'; 
import { Router } from '@angular/router';
import { AlertcontrollerService } from '../../../model/service/alert-controller.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {
  formCadastrar!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthserviceService,
    private router: Router,
    private alertControllerService: AlertcontrollerService
  ) {}

  ngOnInit() {
    this.formCadastrar = this.formBuilder.group({
      nome: ['', Validators.required],
      idade: ['', [Validators.required, Validators.pattern('^[0-9]{1,3}$')]],
      cidade: ['', Validators.required],
      telefone: ['', [Validators.required, Validators.pattern('^[0-9]{2}[0-9]{9,11}$')]],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]],
      confsenha: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get errorControl() {
    return this.formCadastrar.controls;
  }

  async cadastrar() {
    if (this.formCadastrar.valid && this.formCadastrar.value['senha'] === this.formCadastrar.value['confsenha']) {
      try {
        await this.authService.signUpWithEmailAndPassword(
          this.formCadastrar.value['email'],
          this.formCadastrar.value['senha']
        );
        const userData = {
          nome: this.formCadastrar.value['nome'],
          idade: this.formCadastrar.value['idade'],
          cidade: this.formCadastrar.value['cidade'],
          telefone: this.formCadastrar.value['telefone'],
          email: this.formCadastrar.value['email'],
          profileImage: ''
        };
        await this.authService.saveProfileData(userData);
        this.router.navigate(['/login-sem-cadastro']); // Navegue para a página de login ou outra página após o cadastro
      } catch (error: any) {
        console.log(error.message);
      }
    } else {
      console.error('Formulário inválido ou senhas não coincidem.');
    }
  }

  async submitForm(): Promise<boolean> {
    const confirmed = await this.alertControllerService.presentConfirm('Você confirma o cadastro com os dados fornecidos?');
    if (confirmed) {
      this.cadastrar();
    }
    return confirmed;
  }
}
