import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; // Importando FormGroup de @angular/forms
import { AuthserviceService } from 'src/app/model/service/authservice.service'; 

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {
  formCadastrar!: FormGroup; // Certifique-se de que FormGroup está sendo importado corretamente

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthserviceService
  ) {}

  ngOnInit() {
    this.formCadastrar = this.formBuilder.group({
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
      } catch (error: any) { 
        console.log(error.message); 
      }
    } else {
      console.error('Formulário inválido ou senhas não coincidem.');
    }
  }

  submitForm(): boolean {
    this.cadastrar();
    return true;
  }
}
