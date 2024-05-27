import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthserviceService } from 'src/app/model/service/authservice.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.page.html',
  styleUrls: ['./signin.page.scss'],
})
export class SigninPage implements OnInit {
  formLogar: FormGroup;

  constructor(private router: Router, private formBuilder: FormBuilder, private authService: AuthserviceService) {
    this.formLogar = new FormGroup({
      email: new FormControl(''),
      senha: new FormControl(''),
      Confsenha: new FormControl(''),
    });
  }

  ngOnInit() {
    this.formLogar = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  get errorControl() {
    return this.formLogar.controls;
  }

  private logar() {
    this.authService.signIn(this.formLogar.value['email'], this.formLogar.value['senha']).then((res) => {
      this.router.navigate(['/tabs/catalog']); // Redirecionar para a página "/tabs"
    }).catch((error) => {
      console.log(error.message);
    });
  }

  submitForm(): boolean {
    if (!this.formLogar.valid) {
      return false;
    } else {
      this.logar();
      return true;
    }
  }

  logarComGoogle(): void {
    this.authService.signInWithGoogle().then((res) => {
      this.router.navigate(['/login-sem-cadastro']); // Redirecionar para a página de login sem cadastro
    }).catch((error) => {
      console.log(error.message);
    });
  }
  

  logarComGitHub(): void {
    this.authService.signInWithGitHub().then((res) => {
      this.router.navigate(['/tabs/catalog']); // Redirecionar para a página "/tabs"
    }).catch((error) => {
      console.log(error.message);
    });
  }

  irParaSingUp() {
    this.router.navigate(['signup']);
  }
}
