import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { Observable, combineLatest, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private USER_PATH: string = 'users';
  private PRODUCT_PATH: string = 'posts';
  private CART_PATH: string = 'cart';

  constructor(
    private firestore: AngularFirestore,
    private fireAuth: AngularFireAuth,
    private router: Router
  ) { }

  public async getCurrentUserData(): Promise<any> {
    const user = await this.fireAuth.currentUser;
    if (user) {
      const uid = user.uid;
      const docRef = this.firestore.collection(this.USER_PATH).doc(uid);
  
      try {
        const doc = await docRef.get().toPromise();
        if (doc && doc.exists) {
          const userData = doc.data() as { [key: string]: any };
          return { ...userData, uid };
        } else {
          console.error("User document does not exist.");
          return null;
        }
      } catch (error) {
        console.error("Error getting user document:", error);
        return null;
      }
    } else {
      console.error("User not authenticated.");
      return null;
    }
  }

  public getItemById(postId: string): Observable<any> {
    return this.firestore.collection(this.PRODUCT_PATH).doc(postId).valueChanges().pipe(
      map(post => {
        const postData = post as any;
        return {
          ...postData,
          telefone: postData?.telefone || '' // Incluindo o campo telefone
        };
      })
    );
  }

  public async checkUserDocumentExistence(): Promise<void> {
    const user = await this.fireAuth.currentUser;
    if (user) {
      const uid = user.uid;
      const docRef = this.firestore.collection(this.USER_PATH).doc(uid);
  
      try {
        const doc = await docRef.get().toPromise();
        if (doc && doc.exists) {
          this.router.navigate(['/tabs']);
        } else {
          this.router.navigate(['/login-sem-cadastro']);
        }
      } catch (error) {
        console.error("Error checking user document existence:", error);
      }
    } else {
      console.error("User not authenticated.");
    }
  }

  getAllProducts(): Observable<any[]> {
    return this.firestore.collection('posts').valueChanges();
  }

  public async saveUserData(uid: string, userData: any): Promise<void> {
    try {
      await this.firestore.collection(this.USER_PATH).doc(uid).set(userData);
      console.log('Dados do usuário salvos com sucesso.');
    } catch (error) {
      console.error('Erro ao salvar dados do usuário:', error);
      throw error;
    }
  }

  public async addToCart(item: any, quantity: number): Promise<void> {
    const user = await this.fireAuth.currentUser;
    if (!user) {
      throw new Error('Usuário não autenticado.');
    }
  
    const userId = user.uid;
    const cartItemRef = this.firestore.collection(`cart/${userId}/items`).doc(item.postId);
  
    const cartItem = {
      userId: userId,
      postId: item.postId,
      title: item.title,
      price: item.price,
      quantity: quantity,
      nome: item.nome,
      telefone: item.telefone // Incluindo o campo telefone
    };
  
    try {
      const doc = await cartItemRef.get().toPromise();
      if (doc && doc.exists) {
        const existingItem = doc.data() as { quantity: number };
        const newQuantity = existingItem.quantity + quantity;
  
        if (newQuantity > item.quantity) {
          throw new Error('Quantidade solicitada excede a quantidade disponível.');
        } else {
          await cartItemRef.update({ quantity: newQuantity });
        }
      } else {
        await cartItemRef.set(cartItem);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Erro ao adicionar item ao carrinho: ${error.message}`);
      } else {
        throw new Error('Erro ao adicionar item ao carrinho: erro desconhecido');
      }
    }
  }
  
  public getUserProducts(uid: string): Observable<any[]> {
    return this.firestore.collection(this.PRODUCT_PATH, ref => ref.where('userId', '==', uid)).valueChanges();
  }  

  public async deletePost(postId: string): Promise<void> {
    try {
      await this.firestore.collection('posts').doc(postId).delete();
      console.log('Post deletado com sucesso.');
    } catch (error) {
      console.error('Erro ao deletar post:', error);
      throw error;
    }
  }
     

  public async removeItemFromCart(userId: string, itemId: string): Promise<void> {
    try {
      const itemRef = this.firestore.collection(`cart/${userId}/items`).doc(itemId);
      const doc = await itemRef.get().toPromise();
      if (doc && doc.exists) {
        const item = doc.data() as { quantity: number };
        const newQuantity = item.quantity - 1;
        if (newQuantity > 0) {
          await itemRef.update({ quantity: newQuantity });
        } else {
          await itemRef.delete();
        }
        console.log('Item removido ou atualizado com sucesso.');
      } else {
        console.error('Item não encontrado no carrinho.');
      }
    } catch (error) {
      console.error('Erro ao remover item do carrinho:', error);
      throw error;
    }
  }

  public getCartItems(uid: string): Observable<any[]> {
    return this.firestore.collection(`cart/${uid}/items`).snapshotChanges().pipe(
      switchMap(cartItems => {
        if (cartItems.length === 0) {
          return of([]);
        }

        const cartItemsData = cartItems.map(cartItem => {
          const data = cartItem.payload.doc.data();
          const postId = (data as any)?.postId || '';

          return this.getItemById(postId).pipe(
            map(post => {
              const postData = post as any;
              return {
                id: cartItem.payload.doc.id,
                ...(data || {}),
                imageUrl: postData?.imageUrl || '',
                whatsappNumber: postData?.telefone || '' // Incluindo o campo telefone
              };
            })
          );
        });

        return combineLatest(cartItemsData);
      })
    );
  }

  public async removeItemsFromProducer(userId: string, producerName: string): Promise<void> {
    try {
      const snapshot = await this.firestore.collection(`cart/${userId}/items`, ref => ref.where('nome', '==', producerName)).get().toPromise();
      if (snapshot && !snapshot.empty) {
        const batch = this.firestore.firestore.batch();
        snapshot.forEach((doc: any) => {
          batch.delete(doc.ref);
        });
        await batch.commit();
        console.log('Itens do produtor removidos com sucesso.');
      } else {
        console.log('Nenhum item encontrado para o produtor.');
      }
    } catch (error) {
      console.error('Erro ao remover itens do carrinho:', error);
      throw error;
    }
  }

  public async createCheckoutSession(userId: string): Promise<string> {
    try {
      const currentUser = await this.fireAuth.currentUser;
      if (currentUser) {
        const cartItems = await this.getCartItems(userId).toPromise();

        const lineItems = cartItems ? cartItems.map(item => ({
          price_data: {
            currency: 'usd',
            product_data: {
              name: item.title
            },
            unit_amount: item.price * 100,
          },
          quantity: item.quantity
        })) : [];

        const response = await fetch('URL_DO_SEU_BACKEND/criar-sessao-de-checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            lineItems,
            customerId: currentUser.uid
          })
        });

        if (response.ok) {
          const { sessionId } = await response.json();
          return sessionId;
        } else {
          throw new Error('Erro ao criar sessão de checkout');
        }
      } else {
        throw new Error('Usuário não autenticado.');
      }
    } catch (error) {
      console.error('Erro ao criar sessão de checkout:', error);
      throw error;
    }
  }
}
