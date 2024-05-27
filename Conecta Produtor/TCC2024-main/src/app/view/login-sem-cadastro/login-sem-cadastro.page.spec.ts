import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginSemCadastroPage } from './login-sem-cadastro.page';

describe('LoginSemCadastroPage', () => {
  let component: LoginSemCadastroPage;
  let fixture: ComponentFixture<LoginSemCadastroPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginSemCadastroPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
