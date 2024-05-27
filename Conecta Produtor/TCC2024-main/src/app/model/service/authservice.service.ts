import { Injectable, NgZone } from '@angular/core';
import { FirebaseService } from './firebase-service.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { getAuth, signInWithPopup, browserPopupRedirectResolver, GoogleAuthProvider, GithubAuthProvider, User as FirebaseUser } from 'firebase/auth';
import { User as AngularFireUser } from '@firebase/auth-types';

@Injectable({
  providedIn: 'root'
})
export class AuthserviceService {

  usuarioDados: AngularFireUser | null = null;

  constructor(private firebase: FirebaseService, private fireAuth: AngularFireAuth, private router: Router, private ngZone: NgZone) {
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
      this.ngZone.run(() => {
        this.router.navigate(['']);
      });
      this.setUserData(result.user);
    } catch (error) {
      console.error('Erro ao fazer login:', error);
    }
  }

  public async signUpWithEmailAndPassword(email: string, password: string): Promise<void> {
    try {
      const result = await this.fireAuth.createUserWithEmailAndPassword(email, password);
      this.setUserData(result.user);
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
    }
  }

  public async recoverPassword(email: string): Promise<void> {
    try {
      await this.fireAuth.sendPasswordResetEmail(email);
      console.log('Email de recuperação enviado');
    } catch (error) {
      console.error('Erro ao enviar email de recuperação:', error);
    }
  }

  public async signOut(): Promise<void> {
    try {
      await this.fireAuth.signOut();
      localStorage.removeItem('user');
      this.router.navigate(['signin']);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
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
      const result = await signInWithPopup(auth, provider, browserPopupRedirectResolver);
      this.setUserData(result.user as AngularFireUser);
    } catch (error) {
      console.error('Erro ao fazer login com Google:', error);
    }
  }

  public async signInWithGitHub(): Promise<void> {
    const provider = new GithubAuthProvider();
    const auth = getAuth();
    try {
      const result = await signInWithPopup(auth, provider, browserPopupRedirectResolver);
      this.setUserData(result.user as AngularFireUser);
    } catch (error) {
      console.error('Erro ao fazer login com GitHub:', error);
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
    } else {
      localStorage.removeItem('user');
    }
  }
}
