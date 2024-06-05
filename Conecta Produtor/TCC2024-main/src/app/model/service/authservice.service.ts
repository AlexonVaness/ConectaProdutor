import { Injectable, NgZone } from '@angular/core';
import { FirebaseService } from './firebase-service.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { getAuth, signInWithPopup, GoogleAuthProvider, User as AngularFireUser } from 'firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthserviceService {
  usuarioDados: AngularFireUser | null = null;

  constructor(
    private firebase: FirebaseService,
    private fireAuth: AngularFireAuth,
    private router: Router,
    private ngZone: NgZone
  ) {
    this.fireAuth.authState.subscribe(user => {
      if (user) {
        this.usuarioDados = user as AngularFireUser;
        localStorage.setItem('user', JSON.stringify(this.usuarioDados));
      } else {
        localStorage.removeItem('user');
      }
    });
  }

  public async signIn(email: string, password: string): Promise<void> {
    try {
      const result = await this.fireAuth.signInWithEmailAndPassword(email, password);
      this.setUserData(result.user as AngularFireUser);
      console.log('Login com email e senha bem-sucedido:', result.user);
      console.log('UID do usuário:', result.user?.uid);
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  }
  

  public async signUpWithEmailAndPassword(email: string, password: string): Promise<void> {
    try {
      const result = await this.fireAuth.createUserWithEmailAndPassword(email, password);
      this.setUserData(result.user as AngularFireUser);
      console.log('Registro de usuário bem-sucedido:', result.user);
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      throw error; // Lançar erro para ser capturado na chamada do método
    }
  }

  public async recoverPassword(email: string): Promise<void> {
    try {
      await this.fireAuth.sendPasswordResetEmail(email);
      console.log('Email de recuperação enviado');
    } catch (error) {
      console.error('Erro ao enviar email de recuperação:', error);
      throw error; // Lançar erro para ser capturado na chamada do método
    }
  }

  public async signOut(): Promise<void> {
    try {
      await this.fireAuth.signOut();
      localStorage.removeItem('user');
      this.router.navigate(['signin']);
      console.log('Logout bem-sucedido');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error; // Lançar erro para ser capturado na chamada do método
    }
  }

  public async getCurrentUser(): Promise<AngularFireUser | null> {
    const user = await this.fireAuth.currentUser;
    return user ? (user as AngularFireUser) : null;
  }

  public getUserLogged(): AngularFireUser | null {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    return user ? (user as AngularFireUser) : null;
  }
  

  public isLoggedIn(): boolean {
    const user = this.getUserLogged();
    return user !== null;
  }

  public async signInWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    const auth = getAuth();
    try {
      const result = await signInWithPopup(auth, provider);
      this.setUserData(result.user as AngularFireUser);
      console.log('Login com Google bem-sucedido:', result.user);
    } catch (error) {
      console.error('Erro ao fazer login com Google:', error);
      throw error; // Lançar erro para ser capturado na chamada do método
    }
  }

  public async saveProfileData(profileData: any): Promise<void> {
    const user = await this.fireAuth.currentUser;
    if (user) {
      return this.firebase.saveUserData(user.uid, profileData);
    } else {
      throw new Error('Usuário não autenticado.');
    }
  }

  private setUserData(user: AngularFireUser | null): void {
    if (user) {
      this.usuarioDados = user;
      localStorage.setItem('user', JSON.stringify(this.usuarioDados));
      // Redirecionar para a página após o login
      this.ngZone.run(() => {
        this.router.navigate(['login-sem-cadastro']); // Redirecionar para a página tabs após login bem-sucedido
      });
    } else {
      localStorage.removeItem('user');
    }
  }
}
